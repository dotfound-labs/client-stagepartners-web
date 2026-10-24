-- Additional reviewed schema only. No keys, users, jobs, or external requests.
begin;
create or replace function cms_private.validate_content(p_module text,p_slug text,p_data jsonb) returns void
language plpgsql immutable set search_path = '' as $$
declare item jsonb; allowed_keys text[]; field record; slot record; fields jsonb := '{"home":{"home.text_a124ef90":"text","home.text_579bb17d":"text","home.text_d73b6a3f":"text","home.text_fc0100c0":"text","home.text_6bd321c2":"text","home.text_fef657d4":"text","home.text_c4559d6d":"text","home.text_bb3e382c":"text","home.text_2f94f737":"text","home.text_fa70ef79":"text","home.text_b3d0fd30":"text","home.text_b769730f":"text","home.text_1655e5b6":"text","home.text_37819144":"text","home.text_9323d95d":"text","home.text_9ff16c01":"text","home.text_95c07976":"text","home.text_22e7d05a":"text","home.text_4316e014":"text","home.text_fc674e4f":"text","home.text_642d8522":"text","home.text_14b80d87":"text","home.text_872da953":"text","home.text_ff232e9":"text","home.text_e4676144":"text","home.text_e361272b":"text","home.text_3469f263":"text","home.text_982fedeb":"text","home.text_b14ae90c":"text","home.text_d04dc443":"text","home.text_2b7d32d1":"text","home.text_49a85e3e":"text","home.text_5e621c1":"text","home.text_30468aee":"text","home.text_3c8ff9b":"text","home.text_837c9db1":"text","home.text_88b2d675":"text","home.text_37d5a3a0":"text","home.text_c8c44591":"text","home.text_9f014c0":"text","home.text_d2aae866":"text","home.text_13cb6feb":"text","home.text_95a327f5":"text","home.text_231b05c5":"text","home.text_f4a6dce5":"text","home.text_cc016a58":"text","home.text_807539a0":"text","home.text_1e2b7cf1":"text","home.text_2d80074f":"text","home.text_4293882a":"text","home.text_f1572d2e":"text","home.text_4e61863f":"text","home.text_b45bf55e":"text","home.text_e7322d58":"text","home.text_26c2a0aa":"text","home.text_9c2b3956":"text","home.text_b637cd77":"text","home.text_e26834a3":"text","home.text_28e47dc5":"text","home.text_2a333f37":"text","home.text_45416a3":"text","home.text_53b12b90":"text","home.text_cbbef164":"text","home.text_a78ef19d":"text","home.text_13e14d85":"text","home.text_f68d90b6":"text","home.text_413d0f9a":"text","home.link_text_1fcf056e":"link","home.link_text_c2028085":"link","home.link_text_982f41a4":"link","home.link_text_e942455e":"link"},"real-estate":{"real-estate.text_89aa44a6":"text","real-estate.text_71a3876d":"text","real-estate.text_36091759":"text","real-estate.text_466ab818":"text","real-estate.text_e53f7505":"text","real-estate.text_2e6dc5c0":"text","real-estate.text_f98f63d1":"text","real-estate.text_87272156":"text","real-estate.text_c2d84c37":"text","real-estate.text_56a89ae2":"text","real-estate.text_9ff16c01":"text","real-estate.text_dc0062e3":"text","real-estate.text_d024f2a0":"text","real-estate.text_9b8316aa":"text","real-estate.text_c54474ad":"text","real-estate.text_c1f8a7ea":"text","real-estate.text_328e7a52":"text","real-estate.text_426f9876":"text","real-estate.text_1667bd55":"text","real-estate.text_be981adb":"text","real-estate.text_cf0938f3":"text","real-estate.text_dda1d7b3":"text","real-estate.text_e4c14fca":"text","real-estate.text_af3cb111":"text","real-estate.text_7faf6168":"text","real-estate.text_702c65e3":"text","real-estate.text_f939097b":"text","real-estate.text_5e621c1":"text","real-estate.text_8b2acc31":"text","real-estate.text_f2cf8fae":"text","real-estate.text_a81b9982":"text","real-estate.text_d90c0344":"text","real-estate.text_d8030973":"text","real-estate.text_28513531":"text","real-estate.text_e74be6ec":"text","real-estate.text_9e68b181":"text","real-estate.text_c2d16e23":"text","real-estate.text_fbb9af55":"text","real-estate.text_af0b5713":"text","real-estate.text_e3111664":"text","real-estate.text_39b4af20":"text","real-estate.text_63de8333":"text","real-estate.text_3140fbbd":"text","real-estate.text_3b94750a":"text","real-estate.text_a553baf1":"text","real-estate.text_e182966b":"text","real-estate.text_21d55ea5":"text","real-estate.text_6eda855c":"text","real-estate.text_d468a407":"text","real-estate.link_text_d3d8fd0d":"link","real-estate.link_text_1fcf056e":"link","real-estate.link_text_e942455e":"link","real-estate.text_d8f46eba":"text","real-estate.text_f79c2d80":"text"},"architecture":{"architecture.text_e83d828":"text","architecture.text_dd97fdcb":"text","architecture.text_b98c1c54":"text","architecture.text_837efa17":"text","architecture.text_90d00915":"text","architecture.text_d8eb82e7":"text","architecture.text_31595b9e":"text","architecture.text_e3d2c4e9":"text","architecture.text_876a84fb":"text","architecture.text_3d7fce61":"text","architecture.text_4edf58fa":"text","architecture.text_1c623e04":"text","architecture.text_a6b95e":"text","architecture.text_f54c36f1":"text","architecture.text_93cdae40":"text","architecture.text_42cf4e5b":"text","architecture.text_e4a35d17":"text","architecture.text_b17b923a":"text","architecture.text_a3580742":"text","architecture.text_467efcd1":"text","architecture.text_a9bf8f77":"text","architecture.text_4cbd9c8c":"text","architecture.text_6b553a71":"text","architecture.text_ccc60bbf":"text","architecture.text_f4c507f8":"text","architecture.text_438c03cb":"text","architecture.text_912e97ef":"text","architecture.text_d19735da":"text","architecture.text_1726ad9d":"text","architecture.text_7eee0f5c":"text","architecture.text_9ea1ac4a":"text","architecture.text_c8c44591":"text","architecture.text_fd10d3b5":"text","architecture.text_a81b9982":"text","architecture.text_a17dd30b":"text","architecture.text_43e8b769":"text","architecture.text_3a777a03":"text","architecture.text_28d08777":"text","architecture.text_2c8b195c":"text","architecture.text_1efa6596":"text","architecture.text_3756cc20":"text","architecture.text_463504dd":"text","architecture.text_8e4be6cd":"text","architecture.text_ee6bbc5a":"text","architecture.text_be50439e":"text","architecture.text_9b714d20":"text","architecture.text_92312a4c":"text","architecture.text_bb8e3f66":"text","architecture.text_3958b9e1":"text","architecture.text_fad6e42e":"text","architecture.text_5ba99b61":"text","architecture.text_f8b24beb":"text","architecture.text_d6d5f77":"text","architecture.text_affa875d":"text","architecture.text_7f0fc056":"text","architecture.text_c0205f4e":"text","architecture.text_db03c80e":"text","architecture.text_6eda855c":"text","architecture.text_1d4bfb76":"text","architecture.link_text_982f41a4":"link","architecture.link_text_e3937a50":"link","architecture.link_text_1fcf056e":"link","architecture.text_5f034d0b":"text","architecture.text_3e5d1531":"text"},"company":{"company.text_cac0b0c":"text","company.text_798ce0af":"text","company.text_6a49f7db":"text","company.text_5309633c":"text","company.text_b935f4c4":"text","company.text_7d769c70":"text","company.text_13c761f9":"text","company.text_4ab4353":"text","company.text_63f2cdff":"text","company.text_784b295c":"text","company.text_828b9630":"text","company.text_2d1e7942":"text","company.link_text_75cdcfb4":"link","company.link_text_b7a72c63":"link","company.link_text_a8640cf1":"link","company.link_text_3a4b6a9e":"link","company.link_text_c1e22e58":"link","company.link_text_6f40e065":"link","company.text_778b471":"text","company.text_5f60ceab":"text"},"privacy":{"privacy.text_8c2e5d33":"text","privacy.text_efbceb4a":"text","privacy.text_89685dc6":"text","privacy.text_425f89c5":"text","privacy.text_f0e09fe7":"text","privacy.text_849126f":"text","privacy.text_4105e239":"text","privacy.text_3ad795fe":"text","privacy.text_8696f5f6":"text","privacy.text_32d8b6be":"text","privacy.text_4eecabd1":"text","privacy.text_a222d8ec":"text","privacy.text_eadf4382":"text","privacy.text_bbd529fe":"text","privacy.text_7ec6dcc1":"text","privacy.text_7a15095f":"text","privacy.text_ecc98470":"text","privacy.text_df51b0ca":"text","privacy.text_43e43d0":"text","privacy.text_a17c3751":"text","privacy.text_39eeece1":"text","privacy.text_c0c7f702":"text","privacy.text_f55404be":"text","privacy.text_ce2d4a1a":"text","privacy.text_4c44faff":"text","privacy.text_2dcb02d5":"text","privacy.text_a8ee8de9":"text","privacy.text_8959beb9":"text","privacy.text_af6ff189":"text","privacy.text_5d16781a":"text","privacy.text_6f771d63":"text","privacy.text_94cb4f74":"text","privacy.text_3b54a52f":"text","privacy.text_215e9da3":"text","privacy.text_e6d79729":"text","privacy.text_9a779f43":"text","privacy.text_34a3e7":"text","privacy.text_136438f0":"text","privacy.text_35d80336":"text"},"site-policy":{"site-policy.text_9d314779":"text","site-policy.text_4ef98e50":"text","site-policy.text_a0fac228":"text","site-policy.text_c02d9817":"text","site-policy.text_f0e09fe7":"text","site-policy.text_ed13a5f4":"text","site-policy.text_22903841":"text","site-policy.text_e8f8e7c8":"text","site-policy.text_c9b42e52":"text","site-policy.text_62031e66":"text","site-policy.text_cd64388a":"text","site-policy.text_36a0c950":"text","site-policy.text_f9b4f9d9":"text","site-policy.text_44ca8029":"text","site-policy.text_c3164f6c":"text","site-policy.text_2357e388":"text","site-policy.text_2a069080":"text","site-policy.text_cb6d693e":"text","site-policy.text_89685dc6":"text","site-policy.text_a749f35d":"text","site-policy.text_aa892fb9":"text","site-policy.text_b32240cf":"text"},"tokushoho":{"tokushoho.text_54073f3e":"text","tokushoho.text_d34e579b":"text","tokushoho.text_8d4b30b5":"text","tokushoho.text_26971c89":"text","tokushoho.text_f0e09fe7":"text","tokushoho.text_dc2ba448":"text","tokushoho.text_8a948468":"text","tokushoho.text_c62aae6b":"text","tokushoho.text_372b8b13":"text","tokushoho.text_922b61e0":"text","tokushoho.text_ce2d4a1a":"text","tokushoho.text_c9976df3":"text","tokushoho.text_ece821ff":"text","tokushoho.text_bb393442":"phone","tokushoho.text_1f2ef4c3":"text","tokushoho.text_6eda855c":"text","tokushoho.text_bf0ec64a":"text","tokushoho.text_910169e3":"text","tokushoho.text_6a49f7db":"text","tokushoho.text_8ed28038":"text","tokushoho.text_28f6c7df":"text","tokushoho.text_e2ff9308":"text","tokushoho.text_23f137d":"text","tokushoho.text_2eec4d57":"text","tokushoho.text_9ad02749":"text","tokushoho.text_b45a0e6a":"text","tokushoho.text_9bd34118":"text","tokushoho.text_de46b6df":"text","tokushoho.text_b935f4c4":"text","tokushoho.text_7c0f463c":"text","tokushoho.text_7e666eeb":"text"},"common":{"common.text_6a49f7db":"text","common.text_5e621c1":"text","common.text_c8c44591":"text","common.text_f33cfe72":"text","common.text_828b9630":"text","common.text_b47a04b8":"text","common.text_6eda855c":"text","common.text_93229e36":"text","common.text_b8c6b5cf":"text","common.text_ae12f962":"text","common.text_39f8b56":"text","common.text_89685dc6":"text","common.text_a0fac228":"text","common.text_8d4b30b5":"text","common.text_5d8943a2":"text","common.text_7303f6df":"text","common.text_a2d7795e":"text","common.text_9a3cbf23":"text","common.text_a7fef455":"text","common.text_dd437a7a":"text","common.text_e39a527b":"text","common.text_32ad956d":"text","common.text_b3e247b":"text","common.text_fccc3386":"text","common.text_a9d9086a":"text","common.text_65e1df8f":"text","common.text_8035fc0a":"text","common.text_3190d2b4":"text","common.text_8e74d970":"text","common.text_5d73e3e4":"text","common.text_948d350c":"text","common.text_938f0c1f":"text","common.text_c507912f":"text","common.text_bb9a5bba":"phone","common.text_9fc4f9ab":"phone","common.link_text_2a0c975e":"link","common.link_text_c3a5921c":"link","common.link_text_982f41a4":"link","common.link_text_e942455e":"link","common.link_text_e3937a50":"link","common.link_text_c2028085":"link","common.link_text_3ab5e6a1":"link","common.link_text_1fcf056e":"link","common.link_text_c717de26":"link","common.link_text_c413bba":"link","common.link_text_1325e7e4":"link"}}'::jsonb; slots jsonb := '{"home":{"image_text_ab7d0563":"/stagepartners-hero.jpg","image_text_6810ee85":"/issekisancho.png","image_text_af5ed7e8":"/real-estateimage1.png","image_text_343a46cf":"/heroimage1.png"},"real-estate":{"image_text_304c9398":"/realestate-hero.jpg","image_text_cbee50":"/room.PNG","image_text_d5172a1d":"/athome-logo-wide.png"},"architecture":{"image_text_6810ee85":"/issekisancho.png","image_text_4736c7e4":"/companyimage1.png","image_text_f2e16c8d":"/kadai.PNG"},"company":{"image_text_bf2368cd":"/company-hero.jpg"},"common":{"image_text_d6cca7a6":"/logo-mono-white.png","image_text_85561920":"/logo-color-footer.png"}}'::jsonb;
begin
  if p_module is null or p_slug is null then raise exception 'CMS_INVALID_IDENTITY'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' or octet_length(p_data::text) > 262144
    or jsonb_typeof(p_data->'title') <> 'string' or length(btrim(p_data->>'title')) not between 1 and 200
    or p_data->>'title' is null then raise exception 'CMS_INVALID_CONTENT'; end if;
  allowed_keys := case p_module
    when 'works' then array['slug','title','category','type','summary','cover','shots','date','featured']
    when 'news' then array['slug','title','category','date','excerpt','body']
    else array['title','fields','images'] end;
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
    if not (fields ? p_slug) or (p_module='settings') is distinct from (p_slug='common') then raise exception 'CMS_INVALID_PAGE'; end if;
    for field in select * from jsonb_each_text(p_data->'fields') loop
      if not ((fields->p_slug) ? field.key) then raise exception 'CMS_UNKNOWN_FIELD'; end if;
      if fields->p_slug->>field.key='link' and not (field.value ~ '^/([^/[:space:]\\][^[:space:]\\]*)?$' or field.value ~ '^#[a-zA-Z0-9_-]+$' or field.value ~ '^https://[^[:space:]\\]+$' or field.value ~ '^tel:[+]?[0-9-]{6,20}$') then raise exception 'CMS_INVALID_LINK'; end if;
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
  else raise exception 'CMS_INVALID_MODULE';
  end if;
end $$;


create or replace function cms_private.sync_media_references() returns trigger
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
    union all select * from jsonb_path_query(payload,'$.images.*.media_id')
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
    union all select * from jsonb_path_query(payload,'$.images.*.media_id')
  ) as refs(value) loop
    insert into cms_private.media_references values(reference_kind,reference_key,mid,doc_id);
  end loop;
  return new;
end $$;

create or replace function cms_private.mutate_media(p_id uuid,p_action text,p_name text,p_alt text,p_mime text,p_size bigint) returns jsonb
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
    raise exception 'CMS_TRUSTED_VERIFIER_REQUIRED' using errcode = '42501';
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

commit;
