-- Pending review: append after the seven applied migrations. Never backfill
-- original publication dates from migration timestamps.
begin;
alter table public.cms_documents add column draft_saved_at timestamptz;
update public.cms_documents d set draft_saved_at=(select max(r.created_at)
 from public.cms_revisions r where r.document_id=d.id and r.action in ('save','restore'));
create function cms_private.track_draft_save() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.action in ('save','restore') then
  update public.cms_documents set draft_saved_at=new.created_at where id=new.document_id;
 end if;
 return new;
end $$;
revoke all on function cms_private.track_draft_save() from public,anon,authenticated;
create trigger cms_draft_saved after insert on public.cms_revisions
 for each row execute function cms_private.track_draft_save();
alter table public.cms_published add column first_published_at timestamptz;
alter table public.cms_published add column content_updated_at timestamptz;
create table cms_private.publication_dates (
 document_id uuid primary key references public.cms_documents(id),
 first_published_at timestamptz,
 content_updated_at timestamptz
);
alter table cms_private.publication_dates enable row level security;
revoke all on cms_private.publication_dates from public,anon,authenticated;
-- Existing documents may have been published before this CMS. Unknown stays NULL,
-- including documents that were subsequently unpublished.
insert into cms_private.publication_dates(document_id) select id from public.cms_documents;
create table public.cms_site_publication (
 singleton boolean primary key default true check(singleton),
 updated_at timestamptz
);
insert into public.cms_site_publication(singleton) values(true);
alter table public.cms_site_publication enable row level security;
revoke all on public.cms_site_publication from public,anon,authenticated;
grant select on public.cms_site_publication to authenticated;
create policy cms_site_publication_read on public.cms_site_publication
 for select to authenticated using(cms_private.session_user() is not null);

create function cms_private.track_publication_dates() returns trigger
language plpgsql security definer set search_path='' as $$
declare stamp timestamptz := clock_timestamp(); d cms_private.publication_dates;
begin
 if TG_OP = 'DELETE' then
  update public.cms_site_publication set updated_at=greatest(updated_at,stamp) where singleton;
  return old;
 end if;
 -- BEFORE INSERT also runs for an upsert conflict. It must have no side effects.
 if TG_WHEN = 'BEFORE' then
  select * into d from cms_private.publication_dates where document_id=new.document_id;
  if TG_OP = 'UPDATE' and
    row(new.module,new.slug,new.data,new.source,new.source_url) is not distinct from
    row(old.module,old.slug,old.data,old.source,old.source_url) then
   new.first_published_at=old.first_published_at;
   new.content_updated_at=old.content_updated_at;
  else
   new.first_published_at=case when found then d.first_published_at else stamp end;
   new.content_updated_at=stamp;
  end if;
  return new;
 end if;
 if TG_OP='INSERT' or new.content_updated_at is distinct from old.content_updated_at then
  insert into cms_private.publication_dates values(new.document_id,new.first_published_at,new.content_updated_at)
   on conflict(document_id) do update set content_updated_at=excluded.content_updated_at;
  update public.cms_site_publication set updated_at=greatest(updated_at,new.content_updated_at) where singleton;
 end if;
 return new;
end $$;
revoke all on function cms_private.track_publication_dates() from public,anon,authenticated;
create trigger cms_publication_dates_before before insert or update on public.cms_published
 for each row execute function cms_private.track_publication_dates();
create trigger cms_publication_dates_after after insert or update or delete on public.cms_published
 for each row execute function cms_private.track_publication_dates();
commit;
