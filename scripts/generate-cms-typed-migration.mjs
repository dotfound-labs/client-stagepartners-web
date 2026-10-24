import ts from 'typescript';import vm from 'node:vm';import {readFileSync,writeFileSync} from 'node:fs';
const target=process.argv[2];if(!/^supabase\/migrations\/\d+_cms_typed_pages_and_verified_media\.sql$/.test(target??''))throw new Error('Pass CLI-created migration path.');
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});return exports;}
const {PAGE_TEMPLATES}=load('content/page-fields.ts'),{PAGE_ASSETS}=load('content/page-assets.ts');
const quote=value=>"'"+JSON.stringify(value).replaceAll("'","''")+"'::jsonb";
const fields=Object.fromEntries(Object.entries(PAGE_TEMPLATES).map(([scope,page])=>[scope,Object.fromEntries(page.fields.map(f=>[f.id,f.kind]))]));
const slots=Object.fromEntries(Object.entries(PAGE_ASSETS).map(([scope,data])=>[scope,Object.fromEntries(data.images.map(i=>[i.id,i.path]))]));
const original=readFileSync('supabase/migrations/20261024160620_cms_content_and_media.sql','utf8');
let validate=original.slice(original.indexOf('create function cms_private.validate_content'),original.indexOf('create function cms_private.sync_media_references'));
validate=validate.replace('create function','create or replace function').replace('declare item jsonb; allowed_keys text[];',`declare item jsonb; allowed_keys text[]; field record; slot record; fields jsonb := ${quote(fields)}; slots jsonb := ${quote(slots)};`);
validate=validate.replace("else array['title','fields'] end;","else array['title','fields','images'] end;");
validate=validate.replace("  else raise exception 'CMS_INVALID_MODULE';",()=>`    if not (fields ? p_slug) or (p_module='settings') is distinct from (p_slug='common') then raise exception 'CMS_INVALID_PAGE'; end if;
    for field in select * from jsonb_each_text(p_data->'fields') loop
      if not ((fields->p_slug) ? field.key) then raise exception 'CMS_UNKNOWN_FIELD'; end if;
      if fields->p_slug->>field.key='link' and not (field.value ~ '^/([^/[:space:]\\\\][^[:space:]\\\\]*)?$' or field.value ~ '^#[a-zA-Z0-9_-]+$' or field.value ~ '^https://[^[:space:]\\\\]+$' or field.value ~ '^tel:[+]?[0-9-]{6,20}$') then raise exception 'CMS_INVALID_LINK'; end if;
      if fields->p_slug->>field.key='phone' and field.value !~ '^[+]?[0-9-]{6,20}$' then raise exception 'CMS_INVALID_PHONE'; end if;
    end loop;
    if p_data ? 'images' then
      if jsonb_typeof(p_data->'images') <> 'object' then raise exception 'CMS_INVALID_IMAGE'; end if;
      for slot in select * from jsonb_each(p_data->'images') loop
        item := slot.value;
        if not coalesce((slots->p_slug) ? slot.key,false) or jsonb_typeof(item) <> 'object'
          or coalesce(jsonb_typeof(item->'alt'),'') <> 'string' or length(item->>'alt') > 500
          or exists(select 1 from jsonb_object_keys(item) k where k not in ('media_id','legacy_path','alt'))
          or ((item ? 'media_id') = (item ? 'legacy_path'))
          or (item ? 'media_id' and (jsonb_typeof(item->'media_id') <> 'string' or coalesce(item->>'media_id','') !~ '^[0-9a-fA-F-]{36}$'))
          or (item ? 'legacy_path' and (jsonb_typeof(item->'legacy_path') <> 'string' or (item->>'legacy_path') is distinct from (slots->p_slug->>slot.key)))
          then raise exception 'CMS_INVALID_IMAGE'; end if;
      end loop;
    end if;
  else raise exception 'CMS_INVALID_MODULE';`);
let sync=original.slice(original.indexOf('create function cms_private.sync_media_references'),original.indexOf('create trigger cms_draft_media'));
sync=sync.replace('create function','create or replace function').replaceAll("union all select * from jsonb_path_query(payload,'$.cover.media_id')","union all select * from jsonb_path_query(payload,'$.cover.media_id')\n    union all select * from jsonb_path_query(payload,'$.images.*.media_id')");
let media=original.slice(original.indexOf('create function cms_private.mutate_media('),original.indexOf('create function public.cms_mutate_media('));
media=media.replace('create function','create or replace function').replace(/elsif p_action = 'finalize' then[\s\S]*?(?=  elsif p_action = 'describe')/,"elsif p_action = 'finalize' then\n    raise exception 'CMS_TRUSTED_VERIFIER_REQUIRED' using errcode = '42501';\n");
const trusted=`
create function public.cms_finalize_verified_media(p_id uuid,p_size bigint,p_actor uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare m public.cms_media;
begin
  select * into m from public.cms_media where id=p_id for update;
  if not found or m.deletion_requested or m.uploaded_by is distinct from p_actor
    or m.mime_type <> 'image/webp' or m.size_bytes is distinct from p_size
    or not exists(select 1 from public.cms_members where user_id=p_actor and active
      and (is_owner or (select count(*) from public.cms_permissions where user_id=p_actor and module='media' and capability in ('read','edit'))=2))
    or not exists(select 1 from storage.objects where bucket_id='cms-media' and name=m.object_path
      and metadata->>'mimetype'='image/webp' and (metadata->>'size')::bigint=p_size)
    then raise exception 'CMS_INVALID_VERIFIED_MEDIA'; end if;
  update public.cms_media set ready=true where id=p_id;
  insert into public.cms_audit(actor_id,action,target_id) values(p_actor,'media.verified',p_id::text);
end $$;
revoke all on function public.cms_finalize_verified_media(uuid,bigint,uuid) from public,anon,authenticated;
grant execute on function public.cms_finalize_verified_media(uuid,bigint,uuid) to service_role;
`;
writeFileSync(target,['-- Additional reviewed schema only. No keys, users, jobs, or external requests.','begin;',validate,sync,media,trusted,'commit;',''].join('\n'));
