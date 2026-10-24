begin;

create function cms_private.validate_content(p_module text,p_slug text,p_data jsonb) returns void
language plpgsql immutable set search_path = '' as $$
declare item jsonb; allowed_keys text[];
begin
  if p_module is null or p_slug is null then raise exception 'CMS_INVALID_IDENTITY'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' or octet_length(p_data::text) > 262144
    or jsonb_typeof(p_data->'title') <> 'string' or length(btrim(p_data->>'title')) not between 1 and 200
    or p_data->>'title' is null then raise exception 'CMS_INVALID_CONTENT'; end if;
  allowed_keys := case p_module
    when 'works' then array['slug','title','category','type','summary','cover','shots','date','featured']
    when 'news' then array['slug','title','category','date','excerpt','body']
    else array['title','fields'] end;
  if exists(select 1 from jsonb_object_keys(p_data) k where not (k = any(allowed_keys)))
    then raise exception 'CMS_UNKNOWN_FIELD'; end if;
  if p_data ? 'slug' and (jsonb_typeof(p_data->'slug') <> 'string' or (p_data->>'slug') is distinct from p_slug)
    then raise exception 'CMS_INVALID_IDENTITY'; end if;
  if p_module = 'works' then
    if coalesce(p_data->>'category','') not in ('store','facility')
      or coalesce(jsonb_typeof(p_data->'shots'),'') <> 'array'
      or coalesce(jsonb_typeof(p_data->'summary'),'') <> 'string'
      or coalesce(jsonb_typeof(p_data->'type'),'') <> 'string'
      or jsonb_array_length(p_data->'shots') not between 1 and 100
      or coalesce(jsonb_typeof(p_data->'cover'),'') <> 'object'
      or (p_data ? 'date' and coalesce(p_data->>'date','') !~ '^[0-9]{4}-(0[1-9]|1[0-2])$')
      or (p_data ? 'featured' and jsonb_typeof(p_data->'featured') <> 'boolean')
      then raise exception 'CMS_INVALID_WORK'; end if;
    for item in select value from jsonb_array_elements((p_data->'shots') || jsonb_build_array(p_data->'cover')) loop
      if jsonb_typeof(item) <> 'object' or coalesce(jsonb_typeof(item->'alt'),'') <> 'string'
        or coalesce(length(btrim(item->>'alt')),0) not between 1 and 500
        or exists(select 1 from jsonb_object_keys(item) k where k not in ('media_id','legacy_path','alt','state'))
        or ((item ? 'media_id') = (item ? 'legacy_path'))
        or (item ? 'media_id' and (jsonb_typeof(item->'media_id') <> 'string' or coalesce(item->>'media_id','') !~ '^[0-9a-fA-F-]{36}$'))
        or (item ? 'legacy_path' and (jsonb_typeof(item->'legacy_path') <> 'string' or coalesce(item->>'legacy_path','') !~ ('^/works/' || p_slug || '/[a-zA-Z0-9_-]+\.(jpg|png|webp|avif)$')))
        then raise exception 'CMS_INVALID_IMAGE'; end if;
    end loop;
    if exists(select 1 from jsonb_array_elements(p_data->'shots') s where coalesce(s->>'state','') not in ('before','after'))
      then raise exception 'CMS_INVALID_SHOT_STATE'; end if;
  elsif p_module = 'news' then
    if coalesce(p_data->>'category','') not in ('info','works','instagram')
      or coalesce(p_data->>'date','') !~ '^[0-9]{4}-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])$'
      or coalesce(jsonb_typeof(p_data->'excerpt'),'') <> 'string'
      or coalesce(jsonb_typeof(p_data->'body'),'') <> 'array'
      or jsonb_array_length(p_data->'body') not between 1 and 100
      then raise exception 'CMS_INVALID_NEWS'; end if;
    perform (p_data->>'date')::date;
    if exists(select 1 from jsonb_array_elements(p_data->'body') b where jsonb_typeof(b) <> 'string')
      then raise exception 'CMS_INVALID_PARAGRAPH'; end if;
  elsif p_module in ('pages','settings') then
    if coalesce(jsonb_typeof(p_data->'fields'),'') <> 'object' then raise exception 'CMS_INVALID_FIELDS'; end if;
    if exists(select 1 from jsonb_each(p_data->'fields') f where jsonb_typeof(f.value) <> 'string'
      or length(f.key) > 100 or length(f.value #>> '{}') > 20000)
      then raise exception 'CMS_INVALID_FIELD'; end if;
  else raise exception 'CMS_INVALID_MODULE';
  end if;
end $$;

create function cms_private.sync_media_references() returns trigger
language plpgsql security definer set search_path = '' as $$
declare payload jsonb; reference_kind text; reference_key text; doc_id uuid; mid uuid; m public.cms_media;
begin
  if tg_table_name = 'cms_documents' then
    payload := new.draft; reference_kind := 'draft'; reference_key := new.id::text; doc_id := new.id;
  elsif tg_table_name = 'cms_published' then
    reference_kind := 'published';
    if tg_op = 'DELETE' then
      delete from cms_private.media_references where kind = reference_kind and reference_id = old.document_id::text;
      return old;
    end if;
    payload := new.data; reference_key := new.document_id::text; doc_id := new.document_id;
  else
    payload := new.data; reference_kind := 'revision'; reference_key := new.id::text; doc_id := new.document_id;
  end if;
  -- Only the documented photo slots may establish an authorization-bearing link.
  -- Check BEFORE replacing existing references, so a reference cannot authorize itself.
  for mid in select distinct (value #>> '{}')::uuid from (
    select * from jsonb_path_query(payload,'$.shots[*].media_id')
    union all select * from jsonb_path_query(payload,'$.cover.media_id')
  ) as refs(value) loop
    select * into m from public.cms_media where id = mid for update;
    if not found or not m.ready or m.deletion_requested then raise exception 'CMS_MEDIA_NOT_READY'; end if;
    if (select auth.uid()) is not null and not cms_private.media_visible(mid)
      then raise exception 'CMS_MEDIA_FORBIDDEN' using errcode = '42501'; end if;
  end loop;
  delete from cms_private.media_references where kind = reference_kind and reference_id = reference_key;
  for mid in select distinct (value #>> '{}')::uuid from (
    select * from jsonb_path_query(payload,'$.shots[*].media_id')
    union all select * from jsonb_path_query(payload,'$.cover.media_id')
  ) as refs(value) loop
    insert into cms_private.media_references values(reference_kind,reference_key,mid,doc_id);
  end loop;
  return new;
end $$;
create trigger cms_draft_media after insert or update of draft on public.cms_documents
  for each row execute function cms_private.sync_media_references();
create trigger cms_published_media after insert or update or delete on public.cms_published
  for each row execute function cms_private.sync_media_references();
create trigger cms_revision_media after insert on public.cms_revisions
  for each row execute function cms_private.sync_media_references();

create function cms_private.mutate_content(p_id uuid,p_module text,p_slug text,p_action text,
  p_data jsonb,p_expected_version integer,p_request_id uuid,p_restore_revision bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare d public.cms_documents; v_actor uuid; v_data jsonb; v_cap text; v_result jsonb;
  v_fingerprint text; receipt cms_private.receipts;
begin
  if p_module is null or p_slug is null or p_module not in ('works','news','pages','settings')
    or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then raise exception 'CMS_INVALID_IDENTITY'; end if;
  v_cap := case when p_action in ('publish','unpublish') then 'publish'
    when p_action = 'archive' then 'delete' else 'edit' end;
  if p_module = 'settings' then v_cap := 'edit'; end if;
  perform cms_private.require_permission(p_module,v_cap);
  v_actor := cms_private.session_user();
  if p_id is null or p_request_id is null or p_expected_version is null
    or p_action not in ('save','publish','unpublish','archive','restore') or p_action is null
    then raise exception 'CMS_INVALID_REQUEST'; end if;
  -- Serializing the request ID also makes retries safe before a first insert commits.
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,42));
  perform cms_private.require_permission(p_module,v_cap);
  v_fingerprint := jsonb_build_array(p_id,p_module,p_slug,p_action,p_data,p_expected_version,p_restore_revision)::text;
  select * into receipt from cms_private.receipts where request_id = p_request_id;
  if found then
    if receipt.actor_id <> v_actor or receipt.fingerprint <> v_fingerprint then raise exception 'CMS_REQUEST_REUSED'; end if;
    return receipt.result;
  end if;
  select * into d from public.cms_documents where id = p_id for update;
  perform cms_private.require_permission(p_module,v_cap);
  if d.id is null then
    if p_action <> 'save' or p_expected_version <> 0 then raise exception 'CMS_VERSION_CONFLICT' using errcode = '40001'; end if;
    perform cms_private.validate_content(p_module,p_slug,p_data);
    insert into public.cms_documents(id,module,slug,draft,updated_by)
      values(p_id,p_module,p_slug,p_data,v_actor) returning * into d;
  else
    if d.module is distinct from p_module or d.slug is distinct from p_slug then raise exception 'CMS_IMMUTABLE_IDENTITY'; end if;
    if d.version <> p_expected_version then raise exception 'CMS_VERSION_CONFLICT' using errcode = '40001'; end if;
    if p_action = 'restore' then
      select data into v_data from public.cms_revisions where id = p_restore_revision and document_id = p_id;
      if not found then raise exception 'CMS_REVISION_NOT_FOUND'; end if;
    elsif p_action = 'save' then v_data := p_data;
    else v_data := d.draft;
    end if;
    perform cms_private.validate_content(d.module,d.slug,v_data);
    update public.cms_documents set draft = v_data, version = version + 1,
      archived = case when p_action = 'archive' then true when p_action in ('save','restore') then false else archived end,
      updated_by = v_actor, updated_at = now() where id = p_id returning * into d;
  end if;
  if p_action = 'publish' then
    if d.archived then raise exception 'CMS_ARCHIVED'; end if;
    insert into public.cms_published(document_id,module,slug,data,version,source,source_url)
      values(d.id,d.module,d.slug,d.draft,d.version,d.source,d.source_url)
      on conflict(document_id) do update set data = excluded.data,version = excluded.version,
        source = excluded.source,source_url = excluded.source_url,published_at = now();
  elsif p_action in ('archive','unpublish') then
    -- Deletion also needs publication authority when the document is currently live.
    if p_action = 'archive' and exists(select 1 from public.cms_published where document_id = p_id) then
      perform cms_private.require_permission(p_module,case when p_module = 'settings' then 'edit' else 'publish' end);
    end if;
    delete from public.cms_published where document_id = p_id;
  end if;
  insert into public.cms_revisions(document_id,version,action,data,actor_id)
    values(d.id,d.version,p_action,d.draft,v_actor);
  insert into public.cms_audit(actor_id,action,target_id,details)
    values(v_actor,'content.'||p_action,p_id::text,jsonb_build_object('version',d.version,'module',p_module));
  v_result := jsonb_build_object('id',d.id,'version',d.version,'action',p_action);
  insert into cms_private.receipts(request_id,actor_id,fingerprint,result) values(p_request_id,v_actor,v_fingerprint,v_result);
  return v_result;
end $$;
create function public.cms_mutate_content(p_id uuid,p_module text,p_slug text,p_action text,
  p_data jsonb,p_expected_version integer,p_request_id uuid,p_restore_revision bigint default null) returns jsonb
language sql security invoker set search_path = '' as $$
  select cms_private.mutate_content(p_id,p_module,p_slug,p_action,p_data,p_expected_version,p_request_id,p_restore_revision)
$$;
revoke all on function public.cms_mutate_content(uuid,text,text,text,jsonb,integer,uuid,bigint) from public,anon;
grant execute on function public.cms_mutate_content(uuid,text,text,text,jsonb,integer,uuid,bigint),
 cms_private.mutate_content(uuid,text,text,text,jsonb,integer,uuid,bigint) to authenticated;

create function cms_private.media_visible(p_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.cms_media m where m.id = p_id and m.ready and not m.deletion_requested
    and (exists(select 1 from cms_private.media_references r where r.media_id = m.id and r.kind = 'published')
      or cms_private.allowed('media','read')
      or exists(select 1 from cms_private.media_references r join public.cms_documents d on d.id = r.document_id
        where r.media_id = m.id and cms_private.can_read(d.module))))
$$;
create function cms_private.media_upload_allowed(p_path text) returns boolean
language sql stable security definer set search_path = '' as $$
  select cms_private.can_read('media') and cms_private.allowed('media','edit') and exists(select 1 from public.cms_media
    where object_path = p_path and uploaded_by = cms_private.session_user() and not ready and not deletion_requested)
$$;
create function cms_private.media_delete_allowed(p_path text) returns boolean
language sql stable security definer set search_path = '' as $$
  select cms_private.can_read('media') and cms_private.allowed('media','delete') and exists(select 1 from public.cms_media
    where object_path = p_path and deletion_requested)
$$;
grant usage on schema cms_private to anon;
grant execute on function cms_private.media_visible(uuid) to anon,authenticated;
grant execute on function cms_private.media_upload_allowed(text),cms_private.media_delete_allowed(text) to authenticated;
grant select(id,object_path,alt,mime_type,size_bytes,ready) on public.cms_media to anon;
create policy cms_media_public on public.cms_media for select to anon using (cms_private.media_visible(id));
create policy cms_media_admin on public.cms_media for select to authenticated using (
  cms_private.media_visible(id) or cms_private.allowed('media','read'));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
  values('cms-media','cms-media',false,10485760,array['image/jpeg','image/png','image/webp','image/avif']);
create policy cms_storage_read on storage.objects for select to anon,authenticated using (
  bucket_id = 'cms-media' and exists(select 1 from public.cms_media m where m.object_path = name and cms_private.media_visible(m.id)));
create policy cms_storage_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'cms-media' and cms_private.media_upload_allowed(name));
create policy cms_storage_pending_read on storage.objects for select to authenticated using (
  bucket_id = 'cms-media' and (cms_private.media_upload_allowed(name) or cms_private.media_delete_allowed(name)));
create policy cms_storage_delete on storage.objects for delete to authenticated using (
  bucket_id = 'cms-media' and cms_private.media_delete_allowed(name));
-- No UPDATE/upsert policy: a published image can never be overwritten in place.

create function cms_private.mutate_media(p_id uuid,p_action text,p_name text,p_alt text,p_mime text,p_size bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare m public.cms_media; v_actor uuid;
begin
  perform cms_private.require_permission('media',case when p_action in ('delete','purge') then 'delete' else 'edit' end);
  v_actor := cms_private.session_user();
  if p_id is null then raise exception 'CMS_INVALID_REQUEST'; end if;
  if p_action = 'reserve' then
    insert into public.cms_media(id,object_path,original_name,alt,mime_type,size_bytes,uploaded_by)
      values(p_id,v_actor::text||'/'||p_id::text,p_name,p_alt,p_mime,p_size,v_actor) on conflict(id) do nothing;
  end if;
  select * into m from public.cms_media where id = p_id for update;
  if not found then raise exception 'CMS_MEDIA_NOT_FOUND'; end if;
  if p_action = 'reserve' then
    if m.uploaded_by <> v_actor or m.original_name <> p_name or m.mime_type <> p_mime or m.size_bytes <> p_size
      then raise exception 'CMS_REQUEST_REUSED'; end if;
  elsif p_action = 'finalize' then
    if m.deletion_requested or not exists(select 1 from storage.objects where bucket_id = 'cms-media' and name = m.object_path)
      then raise exception 'CMS_UPLOAD_MISSING'; end if;
    update public.cms_media set ready = true where id = p_id;
  elsif p_action = 'describe' then update public.cms_media set alt = p_alt where id = p_id;
  elsif p_action = 'delete' then
    if exists(select 1 from cms_private.media_references where media_id = p_id) then raise exception 'CMS_MEDIA_IN_USE'; end if;
    update public.cms_media set deletion_requested = true where id = p_id;
  elsif p_action = 'purge' then
    if not m.deletion_requested or exists(select 1 from storage.objects where bucket_id = 'cms-media' and name = m.object_path)
      then raise exception 'CMS_REMOVE_STORAGE_FIRST'; end if;
    delete from public.cms_media where id = p_id;
  else raise exception 'CMS_INVALID_ACTION'; end if;
  insert into public.cms_audit(actor_id,action,target_id) values(v_actor,'media.'||p_action,p_id::text);
  return jsonb_build_object('id',p_id,'object_path',m.object_path,'action',p_action);
end $$;
create function public.cms_mutate_media(p_id uuid,p_action text,p_name text default null,p_alt text default null,
  p_mime text default null,p_size bigint default null) returns jsonb
language sql security invoker set search_path = '' as $$
 select cms_private.mutate_media(p_id,p_action,p_name,p_alt,p_mime,p_size)
$$;
revoke all on function public.cms_mutate_media(uuid,text,text,text,text,bigint) from public,anon;
grant execute on function public.cms_mutate_media(uuid,text,text,text,text,bigint),
 cms_private.mutate_media(uuid,text,text,text,text,bigint) to authenticated;
commit;
