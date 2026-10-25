-- Target: NEW stagepartners-cms (apkfyxfmsndwqjfetdad) ONLY.
-- No users, invitations, credentials, or external integrations are provisioned here.
begin;

create schema cms_private;
revoke all on schema cms_private from public, anon, authenticated;
grant usage on schema cms_private to authenticated, service_role;
alter default privileges in schema cms_private revoke execute on functions from public;

create table public.cms_members (
  user_id uuid primary key references auth.users(id) on delete restrict,
  email text not null unique check (email = lower(email) and length(email) <= 254),
  is_owner boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.cms_permissions (
  user_id uuid not null references public.cms_members(user_id) on delete cascade,
  module text not null check (module in ('works','news','pages','media','inquiries','settings','users')),
  capability text not null,
  primary key (user_id,module,capability),
  check ((module in ('works','news','pages') and capability in ('read','edit','publish','delete'))
    or (module = 'media' and capability in ('read','edit','delete'))
    or (module = 'inquiries' and capability in ('read','edit','delete'))
    or (module = 'settings' and capability in ('read','edit'))
    or (module = 'users' and capability = 'manage'))
);

create table public.cms_documents (
  id uuid primary key default gen_random_uuid(),
  module text not null check (module in ('works','news','pages','settings')),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  version integer not null default 1 check (version > 0),
  archived boolean not null default false,
  source text not null default 'manual' check (source in ('manual','instagram')),
  source_id text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  unique(module,slug),
  unique(source,source_id),
  check ((source = 'manual' and source_id is null and source_url is null)
    or (source = 'instagram' and module = 'news' and source_id is not null and source_url is not null and source_id ~ '^[0-9]+$'
      and source_url ~ '^https://www\.instagram\.com/(p|reel)/[A-Za-z0-9_-]+/$')),
  check (module <> 'pages' or slug in ('home','real-estate','architecture','company','privacy','site-policy','tokushoho')),
  check (module <> 'settings' or slug = 'common')
);
create table public.cms_published (
  document_id uuid primary key references public.cms_documents(id) on delete restrict,
  module text not null,
  slug text not null,
  data jsonb not null,
  version integer not null,
  source text not null,
  source_url text,
  published_at timestamptz not null default now(),
  unique(module,slug)
);
create table public.cms_revisions (
  id bigint generated always as identity primary key,
  document_id uuid not null references public.cms_documents(id) on delete restrict,
  version integer not null,
  action text not null,
  data jsonb not null,
  actor_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique(document_id,version)
);
create index cms_revisions_document on public.cms_revisions(document_id,created_at desc);
create index cms_documents_module on public.cms_documents(module,updated_at desc);
create index cms_published_module on public.cms_published(module,published_at desc);

create table public.cms_media (
  id uuid primary key default gen_random_uuid(),
  object_path text not null unique,
  original_name text not null check (length(original_name) between 1 and 200),
  alt text not null check (length(alt) between 1 and 500),
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','image/avif')),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  ready boolean not null default false,
  deletion_requested boolean not null default false
);
create table cms_private.media_references (
  kind text not null check (kind in ('draft','published','revision')),
  reference_id text not null,
  media_id uuid not null references public.cms_media(id) on delete restrict,
  document_id uuid not null references public.cms_documents(id) on delete restrict,
  primary key(kind,reference_id,media_id)
);
create index media_references_media on cms_private.media_references(media_id,kind);
create index media_references_document on cms_private.media_references(document_id);

create table public.cms_audit (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  target_id text not null,
  -- No message bodies, access tokens, or passwords in audit records.
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create table cms_private.receipts (
  request_id uuid primary key,
  actor_id uuid not null,
  fingerprint text not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

-- An authenticated JWT is insufficient: membership and the live Auth session
-- are consulted on every authorization check. No user_metadata/app_metadata roles.
create function cms_private.session_user() returns uuid
language sql stable security definer set search_path = '' as $$
  select m.user_id from public.cms_members m
  join auth.users u on u.id = m.user_id
  where m.user_id = (select auth.uid()) and m.active
    and u.email_confirmed_at is not null
    and exists (select 1 from auth.sessions s where s.user_id = m.user_id
      and s.id::text = (select auth.jwt()->>'session_id'))
$$;
create function cms_private.is_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.cms_members
    where user_id = cms_private.session_user() and is_owner and active)
$$;
create function cms_private.allowed(p_module text,p_capability text) returns boolean
language sql stable security definer set search_path = '' as $$
  select cms_private.is_owner() or exists (
    select 1 from public.cms_permissions where user_id = cms_private.session_user()
      and module = p_module and capability = p_capability)
$$;
create function cms_private.can_read(p_module text) returns boolean
language sql stable security definer set search_path = '' as $$
  select cms_private.allowed(p_module,case when p_module = 'users' then 'manage' else 'read' end)
$$;
create function cms_private.require_permission(p_module text,p_capability text) returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if not cms_private.allowed(p_module,p_capability) or not cms_private.can_read(p_module) then
    raise exception 'CMS_FORBIDDEN' using errcode = '42501';
  end if;
end $$;

alter table public.cms_members enable row level security;
alter table public.cms_permissions enable row level security;
alter table public.cms_documents enable row level security;
alter table public.cms_published enable row level security;
alter table public.cms_revisions enable row level security;
alter table public.cms_media enable row level security;
alter table public.cms_audit enable row level security;
alter table cms_private.media_references enable row level security;
alter table cms_private.receipts enable row level security;

create policy cms_members_read on public.cms_members for select to authenticated
  using (user_id = cms_private.session_user() or cms_private.allowed('users','manage'));
create policy cms_permissions_read on public.cms_permissions for select to authenticated
  using (user_id = cms_private.session_user() or cms_private.allowed('users','manage'));
create policy cms_documents_read on public.cms_documents for select to authenticated
  using (cms_private.can_read(module));
create policy cms_published_read on public.cms_published for select to anon,authenticated using (true);
create policy cms_revisions_read on public.cms_revisions for select to authenticated
  using (exists (select 1 from public.cms_documents d where d.id = document_id and cms_private.can_read(d.module)));
create policy cms_audit_read on public.cms_audit for select to authenticated
  using (cms_private.allowed('users','manage'));

-- Explicit least-privilege grants, compatible with new Supabase API defaults.
revoke all on public.cms_members,public.cms_permissions,public.cms_documents,
 public.cms_published,public.cms_revisions,public.cms_media,public.cms_audit from anon,authenticated;
grant select on public.cms_members,public.cms_permissions,public.cms_documents,
 public.cms_revisions,public.cms_media,public.cms_audit to authenticated;
grant select on public.cms_published to anon,authenticated;
revoke all on all functions in schema cms_private from public,anon,authenticated;
grant execute on function cms_private.session_user(),cms_private.is_owner(),
 cms_private.allowed(text,text),cms_private.can_read(text) to authenticated;
commit;
