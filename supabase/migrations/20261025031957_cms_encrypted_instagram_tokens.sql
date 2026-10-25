begin;
-- Ciphertext only; encryption key stays in the separately provisioned server
-- environment. Neither the browser nor ordinary CMS owners can read this table.
create table cms_private.instagram_token_store (
 singleton boolean primary key default true check(singleton),
 ciphertext text check(length(ciphertext) between 1 and 65536),
 lease_id uuid,
 lease_until timestamptz
);
insert into cms_private.instagram_token_store(singleton) values(true);
alter table cms_private.instagram_token_store enable row level security;
revoke all on cms_private.instagram_token_store from public,anon,authenticated,service_role;
create function cms_private.instagram_token_operation(p_action text,p_lease uuid,p_ciphertext text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r cms_private.instagram_token_store; lease uuid; stamp timestamptz;
begin
 select * into r from cms_private.instagram_token_store where singleton for update;
 stamp:=clock_timestamp();
 if p_action='read' then return jsonb_build_object('ciphertext',r.ciphertext); end if;
 if p_action='claim' then
  if r.lease_until > stamp then return null; end if;
  lease:=gen_random_uuid();
  update cms_private.instagram_token_store set lease_id=lease,lease_until=stamp+interval '120 seconds' where singleton;
  return jsonb_build_object('lease',lease,'ciphertext',r.ciphertext);
 end if;
 if p_lease is null or r.lease_id is distinct from p_lease or r.lease_until<=stamp then
  raise exception 'CMS_TOKEN_LEASE_LOST';
 end if;
 if p_action='commit' then
  if p_ciphertext is null or length(p_ciphertext) not between 1 and 65536 then raise exception 'CMS_INVALID_CIPHERTEXT'; end if;
  update cms_private.instagram_token_store set ciphertext=p_ciphertext where singleton;
 elsif p_action='release' then
  update cms_private.instagram_token_store set lease_id=null,lease_until=null where singleton;
 else raise exception 'CMS_INVALID_TOKEN_OPERATION';
 end if;
 return '{}'::jsonb;
end $$;
-- Explicit allowlist: only the server secret role can invoke the private definer.
revoke all on function cms_private.instagram_token_operation(text,uuid,text) from public,anon,authenticated;
grant usage on schema cms_private to service_role;
grant execute on function cms_private.instagram_token_operation(text,uuid,text) to service_role;
create function public.cms_instagram_token_operation(p_action text,p_lease uuid default null,p_ciphertext text default null)
returns jsonb language sql security invoker set search_path='' as $$
 select cms_private.instagram_token_operation(p_action,p_lease,p_ciphertext)
$$;
revoke all on function public.cms_instagram_token_operation(text,uuid,text) from public,anon,authenticated;
grant execute on function public.cms_instagram_token_operation(text,uuid,text) to service_role;
commit;
