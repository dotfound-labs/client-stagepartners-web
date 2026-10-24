begin;
create table public.cms_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' and length(email) <= 254),
  is_owner boolean not null default false,
  permissions jsonb not null default '[]' check (jsonb_typeof(permissions) = 'array'),
  invited_by uuid not null references public.cms_members(user_id),
  status text not null default 'pending' check (status in ('pending','sent','accepted','cancelled')),
  expires_at timestamptz not null default now() + interval '7 days',
  created_at timestamptz not null default now()
);
create unique index cms_invitation_pending_email on public.cms_invitations(email) where status in ('pending','sent');
create index cms_invitation_inviter on public.cms_invitations(invited_by);
alter table public.cms_invitations enable row level security;
revoke all on public.cms_invitations from anon,authenticated;
grant select on public.cms_invitations to authenticated;
create policy cms_invitations_read on public.cms_invitations for select to authenticated
  using (cms_private.allowed('users','manage'));

-- Inquiry intake is disabled until delivery/provider and retention are approved.
-- No anon INSERT policy. A future server-only adapter may insert validated intake.
create table public.cms_inquiries (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new','in-progress','closed')),
  internal_note text not null default '',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index cms_inquiries_status on public.cms_inquiries(status,created_at desc);
alter table public.cms_inquiries enable row level security;
revoke all on public.cms_inquiries from anon,authenticated;
grant select on public.cms_inquiries to authenticated;
create policy cms_inquiries_read on public.cms_inquiries for select to authenticated
  using (cms_private.allowed('inquiries','read'));

create table public.cms_instagram_config (
  singleton boolean primary key default true check (singleton),
  account_id text check (account_id ~ '^[0-9]+$'),
  username text check (username ~ '^[A-Za-z0-9_.]{1,30}$'),
  enabled boolean not null default false,
  auto_publish boolean not null default false,
  last_success_at timestamptz,
  last_attempt_at timestamptz,
  next_attempt_at timestamptz,
  health text not null default 'not-configured' check (health in ('not-configured','ok','token-expired','rate-limited','error')),
  updated_at timestamptz not null default now(),
  check (not enabled or (account_id is not null and username is not null))
);
insert into public.cms_instagram_config(singleton) values(true);
alter table public.cms_instagram_config enable row level security;
revoke all on public.cms_instagram_config from anon,authenticated;
grant select on public.cms_instagram_config to authenticated,service_role;
create policy cms_instagram_config_read on public.cms_instagram_config for select to authenticated
  using (cms_private.allowed('settings','read'));

create function cms_private.validate_grants(p_grantor uuid,p_owner boolean,p_permissions jsonb) returns void
language plpgsql stable security definer set search_path = '' as $$
declare grantor public.cms_members; permission jsonb; mod_name text; cap text;
begin
  select * into grantor from public.cms_members where user_id = p_grantor and active;
  if not found or (not grantor.is_owner and not exists(select 1 from public.cms_permissions
    where user_id = p_grantor and module = 'users' and capability = 'manage')) then raise exception 'CMS_FORBIDDEN' using errcode = '42501'; end if;
  if p_owner is null or (p_owner and not grantor.is_owner) then raise exception 'CMS_OWNER_REQUIRED'; end if;
  if p_permissions is null or jsonb_typeof(p_permissions) <> 'array' or jsonb_array_length(p_permissions) > 32
    then raise exception 'CMS_INVALID_PERMISSIONS'; end if;
  for permission in select value from jsonb_array_elements(p_permissions) loop
    mod_name := permission->>'module'; cap := permission->>'capability';
    if mod_name is null or cap is null or not (
      (mod_name in ('works','news','pages') and cap in ('read','edit','publish','delete'))
      or (mod_name = 'media' and cap in ('read','edit','delete'))
      or (mod_name = 'inquiries' and cap in ('read','edit','delete'))
      or (mod_name = 'settings' and cap in ('read','edit')) or (mod_name = 'users' and cap = 'manage'))
      then raise exception 'CMS_INVALID_PERMISSIONS'; end if;
    if not grantor.is_owner and (mod_name = 'users' or not exists(select 1 from public.cms_permissions
      where user_id = p_grantor and module = mod_name and capability = cap))
      then raise exception 'CMS_CANNOT_DELEGATE_PERMISSION'; end if;
  end loop;
end $$;

create function cms_private.set_member(p_user_id uuid,p_owner boolean,p_active boolean,p_permissions jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare target public.cms_members; v_actor uuid;
begin
  perform cms_private.require_permission('users','manage');
  v_actor := cms_private.session_user();
  -- One lock for ALL membership/invitation acceptance changes prevents concurrent
  -- last-owner removal and grantor-revocation races.
  perform pg_advisory_xact_lock(783425901);
  if p_user_id = v_actor then raise exception 'CMS_SELF_PERMISSION_CHANGE'; end if;
  perform cms_private.require_permission('users','manage');
  if p_active is null then raise exception 'CMS_INVALID_REQUEST'; end if;
  select * into target from public.cms_members where user_id = p_user_id for update;
  if not found then raise exception 'CMS_MEMBER_NOT_FOUND'; end if;
  if target.is_owner and not cms_private.is_owner() then raise exception 'CMS_OWNER_REQUIRED'; end if;
  perform cms_private.validate_grants(v_actor,p_owner,p_permissions);
  if target.is_owner and target.active and (not p_owner or not p_active)
    and (select count(*) from public.cms_members where active and is_owner) <= 1 then raise exception 'CMS_LAST_OWNER'; end if;
  update public.cms_members set is_owner = p_owner,active = p_active where user_id = p_user_id;
  delete from public.cms_permissions where user_id = p_user_id;
  insert into public.cms_permissions(user_id,module,capability)
    select distinct p_user_id,value->>'module',value->>'capability' from jsonb_array_elements(p_permissions);
  insert into public.cms_audit(actor_id,action,target_id,details)
    values(v_actor,'member.update',p_user_id::text,jsonb_build_object('owner',p_owner,'active',p_active,'permissions',p_permissions));
end $$;
create function public.cms_set_member(p_user_id uuid,p_owner boolean,p_active boolean,p_permissions jsonb) returns void
language sql security invoker set search_path = '' as $$ select cms_private.set_member(p_user_id,p_owner,p_active,p_permissions) $$;
revoke all on function public.cms_set_member(uuid,boolean,boolean,jsonb) from public,anon;
grant execute on function public.cms_set_member(uuid,boolean,boolean,jsonb),cms_private.set_member(uuid,boolean,boolean,jsonb) to authenticated;

create function cms_private.reserve_invitation(p_email text,p_owner boolean,p_permissions jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare invitation public.cms_invitations; v_email text; v_actor uuid;
begin
  perform cms_private.require_permission('users','manage');
  perform pg_advisory_xact_lock(783425901);
  v_actor := cms_private.session_user(); v_email := lower(btrim(p_email));
  perform cms_private.validate_grants(v_actor,p_owner,p_permissions);
  if exists(select 1 from public.cms_members where email = v_email) then raise exception 'CMS_ALREADY_MEMBER'; end if;
  select * into invitation from public.cms_invitations where email = v_email and status in ('pending','sent') for update;
  if found then
    if invitation.is_owner <> p_owner or invitation.permissions <> p_permissions or invitation.expires_at <= now()
      then raise exception 'CMS_INVITATION_EXISTS_CANCEL_FIRST'; end if;
    return invitation.id;
  end if;
  insert into public.cms_invitations(email,is_owner,permissions,invited_by)
    values(v_email,p_owner,p_permissions,v_actor) returning * into invitation;
  insert into public.cms_audit(actor_id,action,target_id) values(v_actor,'invitation.reserve',invitation.id::text);
  return invitation.id;
end $$;
create function public.cms_reserve_invitation(p_email text,p_owner boolean,p_permissions jsonb) returns uuid
language sql security invoker set search_path = '' as $$ select cms_private.reserve_invitation(p_email,p_owner,p_permissions) $$;
revoke all on function public.cms_reserve_invitation(text,boolean,jsonb) from public,anon;
grant execute on function public.cms_reserve_invitation(text,boolean,jsonb),cms_private.reserve_invitation(text,boolean,jsonb) to authenticated;

create function cms_private.cancel_invitation(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform cms_private.require_permission('users','manage');
  perform pg_advisory_xact_lock(783425901);
  if exists(select 1 from public.cms_invitations where id = p_id and is_owner) and not cms_private.is_owner()
    then raise exception 'CMS_OWNER_REQUIRED'; end if;
  perform cms_private.require_permission('users','manage');
  update public.cms_invitations set status = 'cancelled' where id = p_id and status in ('pending','sent');
  insert into public.cms_audit(actor_id,action,target_id) values(cms_private.session_user(),'invitation.cancel',p_id::text);
end $$;
create function public.cms_cancel_invitation(p_id uuid) returns void
language sql security invoker set search_path = '' as $$ select cms_private.cancel_invitation(p_id) $$;
revoke all on function public.cms_cancel_invitation(uuid) from public,anon;
grant execute on function public.cms_cancel_invitation(uuid),cms_private.cancel_invitation(uuid) to authenticated;

-- The only nonmember entry point; verified Auth identity + live session + exact
-- invited email are required. Client-supplied emails/roles are never accepted.
create function cms_private.accept_invitation() returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_user auth.users; invitation public.cms_invitations;
begin
  perform pg_advisory_xact_lock(783425901);
  select * into v_user from auth.users where id = (select auth.uid()) and email_confirmed_at is not null
    and exists(select 1 from auth.sessions where user_id = auth.uid() and id::text = (select auth.jwt()->>'session_id'));
  if not found then raise exception 'CMS_FORBIDDEN' using errcode = '42501'; end if;
  if exists(select 1 from public.cms_members where user_id = v_user.id) then return false; end if;
  select * into invitation from public.cms_invitations where email = lower(v_user.email)
    and status in ('pending','sent') and expires_at > now() for update;
  if not found then return false; end if;
  perform cms_private.validate_grants(invitation.invited_by,invitation.is_owner,invitation.permissions);
  insert into public.cms_members(user_id,email,is_owner) values(v_user.id,lower(v_user.email),invitation.is_owner);
  insert into public.cms_permissions(user_id,module,capability)
    select distinct v_user.id,value->>'module',value->>'capability' from jsonb_array_elements(invitation.permissions);
  update public.cms_invitations set status = 'accepted' where id = invitation.id;
  insert into public.cms_audit(actor_id,action,target_id) values(v_user.id,'invitation.accept',invitation.id::text);
  return true;
end $$;
create function public.cms_accept_invitation() returns boolean
language sql security invoker set search_path = '' as $$ select cms_private.accept_invitation() $$;
revoke all on function public.cms_accept_invitation() from public,anon;
grant execute on function public.cms_accept_invitation(),cms_private.accept_invitation() to authenticated;

create function cms_private.mutate_inquiry(p_id uuid,p_action text,p_status text,p_note text,p_version integer) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform cms_private.require_permission('inquiries','read');
  perform cms_private.require_permission('inquiries',case when p_action = 'delete' then 'delete' else 'edit' end);
  if p_action = 'delete' then delete from public.cms_inquiries where id = p_id and version = p_version;
  elsif p_action = 'save' then
    if length(p_note) > 20000 then raise exception 'CMS_INVALID_NOTE'; end if;
    update public.cms_inquiries set status = p_status,internal_note = p_note,version = version+1,updated_at = now()
      where id = p_id and version = p_version;
  else raise exception 'CMS_INVALID_ACTION'; end if;
  if not found then raise exception 'CMS_VERSION_CONFLICT' using errcode = '40001'; end if;
  insert into public.cms_audit(actor_id,action,target_id) values(cms_private.session_user(),'inquiry.'||p_action,p_id::text);
end $$;
create function public.cms_mutate_inquiry(p_id uuid,p_action text,p_status text,p_note text,p_version integer) returns void
language sql security invoker set search_path = '' as $$ select cms_private.mutate_inquiry(p_id,p_action,p_status,p_note,p_version) $$;
revoke all on function public.cms_mutate_inquiry(uuid,text,text,text,integer) from public,anon;
grant execute on function public.cms_mutate_inquiry(uuid,text,text,text,integer),cms_private.mutate_inquiry(uuid,text,text,text,integer) to authenticated;

create function cms_private.configure_instagram(p_account_id text,p_username text,p_enabled boolean,p_auto_publish boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not cms_private.is_owner() then raise exception 'CMS_OWNER_REQUIRED'; end if;
  update public.cms_instagram_config set account_id = p_account_id,username = p_username,
    enabled = p_enabled,auto_publish = p_auto_publish,updated_at = now() where singleton;
  insert into public.cms_audit(actor_id,action,target_id,details) values(cms_private.session_user(),
    'instagram.configure','instagram',jsonb_build_object('enabled',p_enabled,'auto_publish',p_auto_publish));
end $$;
create function public.cms_configure_instagram(p_account_id text,p_username text,p_enabled boolean,p_auto_publish boolean) returns void
language sql security invoker set search_path = '' as $$ select cms_private.configure_instagram(p_account_id,p_username,p_enabled,p_auto_publish) $$;
revoke all on function public.cms_configure_instagram(text,text,boolean,boolean) from public,anon;
grant execute on function public.cms_configure_instagram(text,text,boolean,boolean),cms_private.configure_instagram(text,text,boolean,boolean) to authenticated;

-- Only a server worker using the approved NEW project's secret may call these.
-- No trigger, cron schedule, credential, or external call is installed here.
create function cms_private.import_instagram(p_account_id text,p_media_id text,p_permalink text,p_caption text,p_timestamp timestamptz) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare config public.cms_instagram_config; d public.cms_documents; payload jsonb;
begin
  select * into config from public.cms_instagram_config where singleton for update;
  if not config.enabled or config.account_id is distinct from p_account_id then raise exception 'CMS_INSTAGRAM_DISABLED'; end if;
  if p_timestamp is null or p_timestamp > now() + interval '10 minutes' or p_caption is null
    or length(p_caption) > 20000 or p_media_id is null then raise exception 'CMS_INVALID_INSTAGRAM_POST'; end if;
  select * into d from public.cms_documents where source = 'instagram' and source_id = p_media_id;
  -- Existing posts (including manually hidden/archived posts) are never republished.
  if found then return jsonb_build_object('id',d.id,'created',false); end if;
  payload := jsonb_build_object('title',coalesce(nullif(left(btrim(p_caption),100),''),'Instagramからのお知らせ'),
    'date',to_char(p_timestamp at time zone 'Asia/Tokyo','YYYY-MM-DD'),'category','instagram',
    'excerpt',left(p_caption,240),'body',jsonb_build_array(p_caption));
  perform cms_private.validate_content('news','instagram-'||p_media_id,payload);
  insert into public.cms_documents(module,slug,draft,source,source_id,source_url)
    values('news','instagram-'||p_media_id,payload,'instagram',p_media_id,p_permalink) returning * into d;
  insert into public.cms_revisions(document_id,version,action,data) values(d.id,1,'instagram.import',payload);
  if config.auto_publish then
    insert into public.cms_published(document_id,module,slug,data,version,source,source_url)
      values(d.id,d.module,d.slug,payload,1,'instagram',p_permalink);
  end if;
  insert into public.cms_audit(action,target_id,details) values('instagram.import',d.id::text,
    jsonb_build_object('auto_published',config.auto_publish,'source_id',p_media_id));
  return jsonb_build_object('id',d.id,'created',true,'published',config.auto_publish);
end $$;
create function public.cms_import_instagram(p_account_id text,p_media_id text,p_permalink text,p_caption text,p_timestamp timestamptz) returns jsonb
language sql security invoker set search_path = '' as $$ select cms_private.import_instagram(p_account_id,p_media_id,p_permalink,p_caption,p_timestamp) $$;
revoke all on function public.cms_import_instagram(text,text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.cms_import_instagram(text,text,text,text,timestamptz),
 cms_private.import_instagram(text,text,text,text,timestamptz) to service_role;

create function cms_private.instagram_health(p_status text,p_retry_after_seconds integer) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_status is null or p_status not in ('ok','token-expired','rate-limited','error') then raise exception 'CMS_INVALID_HEALTH'; end if;
  update public.cms_instagram_config set health = p_status,last_attempt_at = now(),
    last_success_at = case when p_status = 'ok' then now() else last_success_at end,
    next_attempt_at = now() + make_interval(secs => greatest(60,least(coalesce(p_retry_after_seconds,3600),86400)))
    where singleton;
end $$;
create function public.cms_instagram_health(p_status text,p_retry_after_seconds integer default 3600) returns void
language sql security invoker set search_path = '' as $$ select cms_private.instagram_health(p_status,p_retry_after_seconds) $$;
revoke all on function public.cms_instagram_health(text,integer) from public,anon,authenticated;
grant execute on function public.cms_instagram_health(text,integer),cms_private.instagram_health(text,integer) to service_role;

-- Explicit allowlist also neutralizes any preexisting global default grants.
revoke all on all functions in schema cms_private from public,anon,authenticated,service_role;
grant execute on function cms_private.media_visible(uuid) to anon,authenticated;
grant execute on function cms_private.session_user(),cms_private.is_owner(),cms_private.allowed(text,text),
 cms_private.can_read(text),cms_private.mutate_content(uuid,text,text,text,jsonb,integer,uuid,bigint),
 cms_private.media_upload_allowed(text),cms_private.media_delete_allowed(text),
 cms_private.mutate_media(uuid,text,text,text,text,bigint),cms_private.set_member(uuid,boolean,boolean,jsonb),
 cms_private.reserve_invitation(text,boolean,jsonb),cms_private.cancel_invitation(uuid),
 cms_private.accept_invitation(),cms_private.mutate_inquiry(uuid,text,text,text,integer),
 cms_private.configure_instagram(text,text,boolean,boolean) to authenticated;
grant execute on function cms_private.import_instagram(text,text,text,text,timestamptz),
 cms_private.instagram_health(text,integer) to service_role;
commit;
