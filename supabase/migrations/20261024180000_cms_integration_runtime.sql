-- Pending review. No credentials, requests or schedules are installed.
begin;
create table public.cms_instagram_images (
 document_id uuid primary key references public.cms_documents(id) on delete cascade,
 image_url text not null check(image_url ~ '^https://[^/]+[.](cdninstagram[.]com|fbcdn[.]net)/'),
 updated_at timestamptz not null default now()
);
alter table public.cms_instagram_images enable row level security;
revoke all on public.cms_instagram_images from public,anon,authenticated;
grant select,insert,update on public.cms_instagram_images to service_role;
create policy cms_instagram_images_server on public.cms_instagram_images to service_role using(true) with check(true);
create function public.cms_instagram_image(p_slug text) returns text
language sql stable security definer set search_path='' as $$
 select i.image_url from public.cms_instagram_images i join public.cms_published p on p.document_id=i.document_id
 where p.module='news' and p.source='instagram' and p.slug=p_slug
$$;
revoke all on function public.cms_instagram_image(text) from public,anon,authenticated;
grant execute on function public.cms_instagram_image(text) to service_role;
create function public.cms_claim_instagram_sync() returns boolean
language plpgsql security definer set search_path='' as $$
begin
 update public.cms_instagram_config set next_attempt_at=now()+interval '1 hour',last_attempt_at=now()
 where singleton and enabled and (next_attempt_at is null or next_attempt_at<=now());
 return found;
end $$;
revoke all on function public.cms_claim_instagram_sync() from public,anon,authenticated;
grant execute on function public.cms_claim_instagram_sync() to service_role;
alter table public.cms_inquiries add column notification_status text not null default 'pending'
 check(notification_status in ('pending','sent','uncertain'));
create function public.cms_receive_inquiry(p_id uuid,p_name text,p_email text,p_phone text,p_subject text,p_message text) returns boolean
language plpgsql security definer set search_path='' as $$
declare existing public.cms_inquiries;
begin
 if p_id is null or p_name is null or length(btrim(p_name)) not between 1 and 200
 or p_email is null or length(p_email)>254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
 or coalesce(length(p_phone),0)>40 or p_subject is null or length(p_subject) not between 1 and 200
 or p_message is null or length(p_message) not between 1 and 10000 then raise exception 'CMS_INVALID_INQUIRY'; end if;
 perform pg_advisory_xact_lock(783425902);
 perform pg_advisory_xact_lock(hashtextextended(lower(p_email),0));
 select * into existing from public.cms_inquiries where id=p_id;
 if found then
   if (existing.name,existing.email,existing.phone,existing.subject,existing.message) is distinct from
      (p_name,lower(p_email),p_phone,p_subject,p_message) then raise exception 'CMS_INQUIRY_CONFLICT'; end if;
   return false;
 end if;
 if (select count(*) from public.cms_inquiries where created_at>now()-interval '1 hour')>=100 then raise exception 'CMS_INQUIRY_RATE_LIMIT'; end if;
 if (select count(*) from public.cms_inquiries where email=lower(p_email) and created_at>now()-interval '1 hour')>=3
 then raise exception 'CMS_INQUIRY_RATE_LIMIT'; end if;
 insert into public.cms_inquiries(id,name,email,phone,subject,message) values(p_id,p_name,lower(p_email),p_phone,p_subject,p_message);
 return true;
end $$;
create function public.cms_inquiry_notification(p_id uuid,p_status text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if p_status not in ('sent','uncertain') then raise exception 'CMS_INVALID_STATUS'; end if;
 update public.cms_inquiries set notification_status=p_status where id=p_id and notification_status='pending';
end $$;
revoke all on function public.cms_receive_inquiry(uuid,text,text,text,text,text),public.cms_inquiry_notification(uuid,text) from public,anon,authenticated;
grant execute on function public.cms_receive_inquiry(uuid,text,text,text,text,text),public.cms_inquiry_notification(uuid,text) to service_role;
alter table public.cms_invitations add column delivery_attempted_at timestamptz;
create function public.cms_claim_invitation_delivery(p_id uuid,p_actor uuid) returns text
language plpgsql security definer set search_path='' as $$
declare invitation public.cms_invitations;
begin
 perform pg_advisory_xact_lock(783425901);
 select * into invitation from public.cms_invitations where id=p_id for update;
 if not found or invitation.invited_by is distinct from p_actor or invitation.status<>'pending'
 or invitation.expires_at<=now() then raise exception 'CMS_FORBIDDEN'; end if;
 perform cms_private.validate_grants(p_actor,invitation.is_owner,invitation.permissions);
 if invitation.delivery_attempted_at is not null then return null; end if;
 update public.cms_invitations set delivery_attempted_at=now() where id=p_id;
 return invitation.email;
end $$;
create function public.cms_mark_invitation_sent(p_id uuid) returns void
language sql security definer set search_path='' as $$
 update public.cms_invitations set status='sent' where id=p_id and status='pending' and delivery_attempted_at is not null
$$;
revoke all on function public.cms_claim_invitation_delivery(uuid,uuid),public.cms_mark_invitation_sent(uuid) from public,anon,authenticated;
grant execute on function public.cms_claim_invitation_delivery(uuid,uuid),public.cms_mark_invitation_sent(uuid) to service_role;
commit;
