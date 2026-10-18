-- PROPOSAL ONLY. Not in migrations/: never auto-applied by db push.
-- Requires existing owner foundation, intake and admin functions; auth.users/uid.
-- Review live schema/grants first. No credentials, enrollment or scheduler seeded.
begin;
create schema owner_request_private;
revoke all on schema owner_request_private from public, anon, authenticated, service_role;

create table owner_request_private.settings (
  singleton boolean primary key default true check (singleton),
  enabled boolean not null default false,
  execution_enabled boolean not null default false,
  notifications_enabled boolean not null default false,
  intake_tenants text[] not null default '{}' check(cardinality(intake_tenants)<=20),
  execution_tenants text[] not null default '{}' check(cardinality(execution_tenants)<=20),
  notification_tenants text[] not null default '{}' check(cardinality(notification_tenants)<=20),
  authority_email text not null default 'anthonycolmenaresanandres@gmail.com'
);
insert into owner_request_private.settings default values;

create table owner_request_private.enrollments (
  restaurant_id text not null references public.restaurants(id),
  owner_user_id uuid not null,
  policy_version text not null check (length(policy_version) between 1 and 80),
  allowed_types text[] not null check (cardinality(allowed_types) between 1 and 2 and allowed_types <@ array['availability','display_order']::text[]),
  authority_approval_reference text not null check (length(authority_approval_reference) between 1 and 300),
  owner_consented_at timestamptz not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  source_kind text not null check (source_kind = 'supabase_public_menu_v1'),
  guest_path text not null check (guest_path ~ '^/(m/[a-z0-9-]+|demo/las-palmas)$'),
  source_verified_at timestamptz not null,
  source_evidence text not null check (length(source_evidence) between 1 and 1000),
  primary key (restaurant_id, owner_user_id)
);

alter table public.change_requests add column actor_user_id uuid;
alter table public.change_requests add column attribution_kind text not null default 'public_unverified'
  check (attribution_kind in ('public_unverified','owner_verified','owner_queue'));
-- Existing rows remain unverified; never promote a claimed historic tenant.
create unique index owner_queue_reference_unique on public.change_requests(reference_id)
  where attribution_kind = 'owner_queue';
alter table public.menu_items add column owner_request_version bigint not null default 0 check (owner_request_version >= 0);
alter table public.audit_log add column request_id uuid references public.change_requests(id);
alter table public.audit_log add column actor_user_id uuid;

create table owner_request_private.requests (
  id uuid primary key references public.change_requests(id),
  restaurant_id text not null references public.restaurants(id),
  actor_user_id uuid not null,
  actor_email text not null,
  client_key uuid not null,
  change_type text not null check (change_type in ('availability','display_order','name_typo','review')),
  item_id uuid references public.menu_items(id),
  source_item_id uuid,
  item_label text check (item_label is null or length(item_label) between 1 and 120),
  target_source text not null default 'supabase_public_menu_v1' check (target_source in ('supabase_public_menu_v1','bodega_controls_v1')),
  source_manifest_hash text,
  expected_version bigint,
  before_value jsonb,
  after_value jsonb,
  brief text not null check (length(brief) between 1 and 4000),
  owner_confirmed_at timestamptz not null default now(),
  policy_version text,
  reviewer_user_id uuid,
  reviewer_email text,
  status text not null check (status in ('queued','needs_review','ready','conflict','awaiting_verification','awaiting_owner_ack','completed','completion_conflict','rejected','rollback_requested','rollback_conflict','rolled_back_pending_verification','rolled_back')),
  applied_version bigint,
  rollback_version bigint,
  owner_acknowledged_at timestamptz,
  created_at timestamptz not null default now(),
  unique (restaurant_id, actor_user_id, client_key)
  ,check ((target_source='supabase_public_menu_v1' and source_item_id is null and source_manifest_hash is null)
    or (target_source='bodega_controls_v1' and restaurant_id='bodega' and item_id is null and source_item_id is not null
        and source_manifest_hash is not null and source_manifest_hash ~ '^[a-f0-9]{64}$' and change_type in ('availability','display_order')))
);
create table owner_request_private.events (
  id bigint generated always as identity primary key,
  request_id uuid not null references owner_request_private.requests(id),
  event_type text not null,
  actor_user_id uuid,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table owner_request_private.outbox (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references owner_request_private.requests(id),
  event_id bigint not null unique references owner_request_private.events(id),
  status text not null default 'pending' check (status in ('pending','leased','retry_wait','sent','dead_letter')),
  attempt integer not null default 0 check (attempt between 0 and 6),
  next_attempt_at timestamptz not null default now(),
  first_attempt_at timestamptz,
  lease_token uuid,
  lease_expires_at timestamptz,
  error_category text check (error_category in ('timeout','provider_4xx','provider_5xx','transport','invalid_response','lease_expired','retry_window_expired')),
  sent_at timestamptz
);
create index owner_outbox_due on owner_request_private.outbox(status,next_attempt_at);
alter table owner_request_private.settings enable row level security;
alter table owner_request_private.enrollments enable row level security;
alter table owner_request_private.requests enable row level security;
alter table owner_request_private.events enable row level security;
alter table owner_request_private.outbox enable row level security;
revoke all on all tables in schema owner_request_private from public, anon, authenticated, service_role;

create function owner_request_private.actor(p_user_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u record;
begin
  if p_user_id is null then raise exception 'authentication required' using errcode='42501'; end if;
  select id, lower(email) email, email_confirmed_at, raw_app_meta_data into u from auth.users where id=p_user_id for share;
  if not found or u.email is null or u.email_confirmed_at is null
     or coalesce(u.raw_app_meta_data->>'owner_password_reset_required','false') = 'true' then
    raise exception 'verified active owner session required' using errcode='42501';
  end if;
  return jsonb_build_object('id',u.id,'email',u.email);
end $$;
create function owner_request_private.owner_identity(p_restaurant_id text, p_user_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare a jsonb; b text;
begin
  a := owner_request_private.actor(p_user_id);
  select r.business_name into b from public.restaurants r join public.owner_emails o on o.restaurant_id=r.id
    where r.id=p_restaurant_id and lower(o.email)=a->>'email' and o.role='owner' limit 1 for share of r,o;
  if not found then raise exception 'not authorized for tenant' using errcode='42501'; end if;
  return a || jsonb_build_object('business_name',b);
end $$;
-- Private adapter seam. The base implementation still reads the existing menu rows.
-- A separately reviewed source proposal can override these helpers, never the actor.
create function owner_request_private.read_target(p_restaurant_id text,p_item_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare item public.menu_items;
begin
 select * into item from public.menu_items where id=p_item_id and restaurant_id=p_restaurant_id for share;
 if not found then return null;end if;
 return jsonb_build_object('id',item.id,'database_item_id',item.id,'source_item_id',null,'target_source','supabase_public_menu_v1','manifest_hash',null,
 'name',item.name,'available',item.is_available,'sort_order',item.sort_order,'version',item.owner_request_version,'category_id',item.category_id);
end $$;
create function owner_request_private.list_targets(p_restaurant_id text) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if (select count(*) from public.menu_items where restaurant_id=p_restaurant_id)>200 then raise exception 'menu requires a scoped adapter' using errcode='22023';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'name',m.name,'available',m.is_available,'order',m.sort_order,'version',m.owner_request_version) order by m.sort_order,m.id) from public.menu_items m where restaurant_id=p_restaurant_id),'[]');
end $$;
create function owner_request_private.require_enabled(p_mode text) returns void
language plpgsql security definer set search_path = '' as $$
declare s owner_request_private.settings;
begin
  select * into s from owner_request_private.settings where singleton for share;
  if not found or s.enabled is distinct from true or (p_mode='execution' and s.execution_enabled is distinct from true)
    or (p_mode='notifications' and s.notifications_enabled is distinct from true) then
    raise exception 'owner request feature disabled' using errcode='42501';
  end if;
end $$;
create function owner_request_private.record_event(p_id uuid,p_kind text,p_actor uuid,p_detail jsonb default '{}') returns void
language plpgsql security definer set search_path = '' as $$
declare e bigint;
begin
  insert into owner_request_private.events(request_id,event_type,actor_user_id,detail) values(p_id,p_kind,p_actor,p_detail) returning id into e;
  insert into owner_request_private.outbox(request_id,event_id) values(p_id,e);
  update public.change_requests set status=(select status from owner_request_private.requests where id=p_id) where id=p_id;
end $$;
create function owner_request_private.enrollment(q owner_request_private.requests) returns text
language plpgsql security definer set search_path = '' as $$
declare e owner_request_private.enrollments;
begin
  if not coalesce(q.restaurant_id=any((select execution_tenants from owner_request_private.settings where singleton)::text[]),false) then raise exception 'tenant execution disabled' using errcode='42501'; end if;
  perform owner_request_private.owner_identity(q.restaurant_id,q.actor_user_id);
  select * into e from owner_request_private.enrollments where restaurant_id=q.restaurant_id and owner_user_id=q.actor_user_id for share;
  if not found or e.revoked_at is not null or e.expires_at<=now() or e.owner_consented_at>now()
    or e.source_verified_at>now() or not (q.change_type=any(e.allowed_types))
    or (q.policy_version is not null and q.policy_version<>e.policy_version)
    or q.restaurant_id in ('colattao','bodega','scrambled','project-seed')
    or (q.restaurant_id='las-palmas-lynnhaven' and e.guest_path<>'/demo/las-palmas')
    or (q.restaurant_id<>'las-palmas-lynnhaven' and e.guest_path<>'/m/'||q.restaurant_id) then
    raise exception 'active approved enrollment and connected source required' using errcode='42501';
  end if;
  return e.policy_version;
end $$;

-- Version every update, including existing owner rails, to detect intervening edits.
create function owner_request_private.bump_item_version() returns trigger
language plpgsql set search_path = '' as $$
begin new.owner_request_version := old.owner_request_version+1; return new; end $$;
create trigger owner_request_item_version before update on public.menu_items for each row execute function owner_request_private.bump_item_version();

-- Harden the EXISTING intake signature. Public tenant-less inquiries still work.
-- Caller-supplied contact, business or source never establishes owner authority.
create or replace function public.submit_change_request(
  p_business_name text,p_contact_name text,p_contact_info text,p_request_type text,
  p_priority text,p_message text,p_source_page text,p_reference_id text,p_restaurant_id text default null
) returns void language plpgsql security definer set search_path = '' as $$
declare a jsonb; tenant text; b text; n text; c text; source text; kind text := 'public_unverified';
begin
  if p_message is null or length(trim(p_message)) not between 1 and 4000
    or p_reference_id is null or length(p_reference_id) not between 1 and 80
    or p_business_name is null or length(trim(p_business_name)) not between 1 and 200
    or p_contact_name is null or length(trim(p_contact_name)) not between 1 and 200
    or p_contact_info is null or length(trim(p_contact_info)) not between 1 and 300
    or p_request_type is null or length(p_request_type)>80
    or p_priority is null or p_priority not in ('Low','Normal','Urgent')
    or coalesce(length(p_source_page),0)>700 then raise exception 'invalid request' using errcode='22023'; end if;
  b:=trim(p_business_name); n:=trim(p_contact_name); c:=trim(p_contact_info); source:=p_source_page;
  if p_restaurant_id is not null then
    a:=owner_request_private.owner_identity(p_restaurant_id,auth.uid());
    tenant:=p_restaurant_id; b:=a->>'business_name'; n:=a->>'email'; c:=n;
    source:='/owner/'||tenant; kind:='owner_verified';
  end if;
  insert into public.change_requests(restaurant_id,business_name,contact_name,contact_info,request_type,priority,message,source_page,reference_id,status,actor_user_id,attribution_kind)
    values(tenant,b,n,c,p_request_type,p_priority,trim(p_message),source,p_reference_id,'new',case when a is not null then (a->>'id')::uuid end,kind);
end $$;
revoke all on function public.submit_change_request(text,text,text,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.submit_change_request(text,text,text,text,text,text,text,text,text) to anon,authenticated;

create function public.submit_owner_request_v1(
  p_restaurant_id text,p_client_key uuid,p_change_type text,p_item_id uuid,p_expected_version bigint,
  p_after_value jsonb,p_brief text,p_confirmed boolean
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare a jsonb; q owner_request_private.requests; item jsonb; before_value jsonb; rid uuid:=gen_random_uuid(); ref text; next_state text;
begin
  perform owner_request_private.require_enabled('intake');
  if not coalesce(p_restaurant_id=any((select intake_tenants from owner_request_private.settings where singleton)::text[]),false) then raise exception 'tenant intake disabled' using errcode='42501'; end if;
  a:=owner_request_private.owner_identity(p_restaurant_id,auth.uid());
  if p_client_key is null or p_confirmed is distinct from true or p_change_type is null
    or p_change_type not in ('availability','display_order','name_typo','review')
    or p_brief is null or length(trim(p_brief)) not between 1 and 4000 then raise exception 'invalid confirmed request' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_restaurant_id||(a->>'id')||p_client_key::text,0));
  select * into q from owner_request_private.requests where restaurant_id=p_restaurant_id and actor_user_id=(a->>'id')::uuid and client_key=p_client_key;
  if found then
    if q.change_type<>p_change_type or coalesce(q.source_item_id,q.item_id) is distinct from p_item_id or q.expected_version is distinct from p_expected_version
       or q.after_value is distinct from p_after_value or q.brief<>trim(p_brief) then raise exception 'idempotency key reused with different request' using errcode='22023'; end if;
    return jsonb_build_object('id',q.id,'reference_id',(select reference_id from public.change_requests where id=q.id),'status',q.status);
  end if;
  next_state:='needs_review';
  if p_change_type='review' then
    if p_item_id is not null or p_expected_version is not null or p_after_value is not null then raise exception 'review has no executable target' using errcode='22023'; end if;
  else
    item:=owner_request_private.read_target(p_restaurant_id,p_item_id);
    if item is null or p_expected_version is distinct from (item->>'version')::bigint then raise exception 'item version conflict' using errcode='40001'; end if;
    if item->>'target_source'='bodega_controls_v1' and p_change_type not in ('availability','display_order') then raise exception 'Bodega pilot field not allowed' using errcode='42501';end if;
    if p_change_type='availability' then
      if jsonb_typeof(p_after_value) is distinct from 'boolean' then raise exception 'invalid availability' using errcode='22023'; end if;
      before_value:=item->'available'; next_state:='queued';
    elsif p_change_type='display_order' then
      if jsonb_typeof(p_after_value) is distinct from 'number' or (p_after_value#>>'{}')!~'^[0-9]{1,5}$' or (p_after_value#>>'{}')::int>10000 then raise exception 'invalid display order' using errcode='22023'; end if;
      before_value:=item->'sort_order'; next_state:='queued';
    else
      if jsonb_typeof(p_after_value) is distinct from 'string' or length(trim(p_after_value#>>'{}')) not between 1 and 120 then raise exception 'invalid name proposal' using errcode='22023'; end if;
      before_value:=item->'name';
    end if;
    if before_value=p_after_value then raise exception 'no change requested' using errcode='22023'; end if;
  end if;
  ref:='AMMA-'||upper(replace(rid::text,'-',''))||'-'||upper(substr(gen_random_uuid()::text,1,8));
  insert into public.change_requests(id,restaurant_id,business_name,contact_name,contact_info,request_type,priority,message,source_page,reference_id,status,actor_user_id,attribution_kind)
    values(rid,p_restaurant_id,a->>'business_name',a->>'email',a->>'email','Menu/content update','Normal',trim(p_brief),'/owner/'||p_restaurant_id,ref,next_state,(a->>'id')::uuid,'owner_queue');
  insert into owner_request_private.requests(id,restaurant_id,actor_user_id,actor_email,client_key,change_type,item_id,source_item_id,item_label,target_source,source_manifest_hash,expected_version,before_value,after_value,brief,status)
    values(rid,p_restaurant_id,(a->>'id')::uuid,a->>'email',p_client_key,p_change_type,(item->>'database_item_id')::uuid,(item->>'source_item_id')::uuid,item->>'name',coalesce(item->>'target_source','supabase_public_menu_v1'),item->>'manifest_hash',p_expected_version,before_value,p_after_value,trim(p_brief),next_state);
  perform owner_request_private.record_event(rid,'submitted',(a->>'id')::uuid);
  return jsonb_build_object('id',rid,'reference_id',ref,'status',next_state);
end $$;

-- Authority can inspect immutable typed details before approving anything.
create function public.get_owner_request_review_v1(p_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare a jsonb; q owner_request_private.requests;
begin
  a:=owner_request_private.actor(auth.uid());
  if not public.is_current_user_admin() or (a->>'email') is distinct from (select authority_email from owner_request_private.settings where singleton) then raise exception 'authority review required' using errcode='42501'; end if;
  select * into q from owner_request_private.requests where id=p_id;
  if not found then return null; end if;
  return jsonb_build_object('id',q.id,'restaurant_id',q.restaurant_id,'actor_user_id',q.actor_user_id,
    'owner_confirmed_at',q.owner_confirmed_at,'change_type',q.change_type,'item_id',coalesce(q.source_item_id,q.item_id),'item_name',q.item_label,'target_source',q.target_source,'manifest_hash',q.source_manifest_hash,
    'before',q.before_value,'after',q.after_value,'expected_version',q.expected_version,'brief',q.brief,'status',q.status,
    'source',(select jsonb_build_object('kind',e.source_kind,'path',e.guest_path,'verified_at',e.source_verified_at,'policy',e.policy_version,'approval_reference',e.authority_approval_reference,'expires_at',e.expires_at,'revoked_at',e.revoked_at) from owner_request_private.enrollments e where e.restaurant_id=q.restaurant_id and e.owner_user_id=q.actor_user_id));
end $$;

create function public.review_owner_request_v1(p_id uuid,p_decision text) returns text
language plpgsql security definer set search_path = '' as $$
declare a jsonb; q owner_request_private.requests; policy text;
begin
  perform owner_request_private.require_enabled('intake');
  a:=owner_request_private.actor(auth.uid());
  if not public.is_current_user_admin() or (a->>'email')<>(select authority_email from owner_request_private.settings where singleton) then raise exception 'authority review required' using errcode='42501'; end if;
  select * into q from owner_request_private.requests where id=p_id for update;
  if not found or q.status not in ('queued','needs_review') or p_decision not in ('approve','reject') or p_decision is null then raise exception 'invalid review transition' using errcode='22023'; end if;
  if p_decision='approve' then
    if q.change_type not in ('availability','display_order') then raise exception 'review-only change cannot execute' using errcode='42501'; end if;
    policy:=owner_request_private.enrollment(q);
  end if;
  update owner_request_private.requests set status=case when p_decision='approve' then 'ready' else 'rejected' end,
    policy_version=policy,reviewer_user_id=(a->>'id')::uuid,reviewer_email=a->>'email' where id=p_id;
  perform owner_request_private.record_event(p_id,case when p_decision='approve' then 'approved' else 'rejected' end,(a->>'id')::uuid);
  return case when p_decision='approve' then 'ready' else 'rejected' end;
end $$;

create function owner_request_private.write_change(q owner_request_private.requests,p_rollback boolean) returns bigint
language plpgsql security definer set search_path = '' as $$
declare item public.menu_items; current_value jsonb; wanted jsonb; expected bigint; version bigint; field text;
begin
  if q.target_source<>'supabase_public_menu_v1' then raise exception 'source write adapter not installed' using errcode='42501';end if;
  select * into item from public.menu_items where id=q.item_id and restaurant_id=q.restaurant_id for update;
  expected:=case when p_rollback then q.applied_version else q.expected_version end;
  if not found or expected is distinct from item.owner_request_version then return null; end if;
  if q.change_type='availability' then field:='is_available'; current_value:=to_jsonb(item.is_available);
  elsif q.change_type='display_order' then field:='sort_order'; current_value:=to_jsonb(item.sort_order);
  else raise exception 'unsupported execution type' using errcode='42501'; end if;
  if current_value is distinct from (case when p_rollback then q.after_value else q.before_value end) then return null; end if;
  wanted:=case when p_rollback then q.before_value else q.after_value end;
  if field='sort_order' then
    perform 1 from public.menu_categories where id=item.category_id for update;
    if exists(select 1 from public.menu_items where category_id=item.category_id and restaurant_id=q.restaurant_id and id<>q.item_id and sort_order=(wanted#>>'{}')::integer) then return null; end if;
  end if;
  if field='is_available' then
    update public.menu_items set is_available=(wanted#>>'{}')::boolean where id=q.item_id and restaurant_id=q.restaurant_id and owner_request_version=expected returning owner_request_version into version;
  else
    update public.menu_items set sort_order=(wanted#>>'{}')::integer where id=q.item_id and restaurant_id=q.restaurant_id and owner_request_version=expected returning owner_request_version into version;
  end if;
  if not found then raise exception 'atomic update lost' using errcode='40001'; end if;
  insert into public.audit_log(restaurant_id,actor_email,table_name,row_id,field_name,old_value,new_value,request_id,actor_user_id)
    values(q.restaurant_id,'queue-executor:v1','menu_items',q.item_id::text,field,current_value#>>'{}',wanted#>>'{}',q.id,null);
  return version;
end $$;
create function public.execute_owner_request_v1(p_id uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare q owner_request_private.requests; version bigint; next_state text;
begin
  perform owner_request_private.require_enabled('execution');
  select * into q from owner_request_private.requests where id=p_id for update;
  if not found then raise exception 'request not found' using errcode='22023'; end if;
  if q.status in ('conflict','awaiting_verification','awaiting_owner_ack','completed','completion_conflict','rollback_requested','rollback_conflict','rolled_back_pending_verification','rolled_back') then return q.status; end if;
  if q.status<>'ready' or q.policy_version is null or q.reviewer_user_id is null then raise exception 'approved request required' using errcode='42501'; end if;
  perform owner_request_private.enrollment(q);
  version:=owner_request_private.write_change(q,false);
  next_state:=case when version is null then 'conflict' else 'awaiting_verification' end;
  update owner_request_private.requests set status=next_state,applied_version=version where id=p_id;
  perform owner_request_private.record_event(p_id,next_state,null);
  return next_state;
end $$;
create function public.verify_owner_request_v1(p_id uuid,p_guest_path text,p_observed_value jsonb,p_evidence text) returns text
language plpgsql security definer set search_path = '' as $$
declare q owner_request_private.requests; item jsonb; expected bigint; wanted jsonb; current_value jsonb; target text; next_state text;
begin
  perform owner_request_private.require_enabled('execution');
  select * into q from owner_request_private.requests where id=p_id for update;
  if not found or q.status not in ('awaiting_verification','rolled_back_pending_verification') then raise exception 'verification not pending' using errcode='22023'; end if;
  if q.target_source='bodega_controls_v1' then raise exception 'Bodega requires the rendered-menu readback adapter' using errcode='42501';end if;
  perform owner_request_private.enrollment(q);
  select guest_path into target from owner_request_private.enrollments where restaurant_id=q.restaurant_id and owner_user_id=q.actor_user_id;
  if p_guest_path is distinct from target or p_evidence is null or length(trim(p_evidence)) not between 1 and 1000 then raise exception 'approved source readback evidence required' using errcode='22023'; end if;
  if q.change_type='display_order' and exists(select 1 from public.menu_items where category_id=(select category_id from public.menu_items where id=q.item_id) and restaurant_id=q.restaurant_id and id<>q.item_id and sort_order=(p_observed_value#>>'{}')::integer) then return 'verification_pending'; end if;
  expected:=case when q.status='awaiting_verification' then q.applied_version else q.rollback_version end;
  wanted:=case when q.status='awaiting_verification' then q.after_value else q.before_value end;
  item:=owner_request_private.read_target(q.restaurant_id,coalesce(q.source_item_id,q.item_id));
  current_value:=case when q.change_type='availability' then item->'available' else item->'sort_order' end;
  if item is null or (item->>'version')::bigint is distinct from expected or item->>'target_source' is distinct from q.target_source or item->>'manifest_hash' is distinct from q.source_manifest_hash or p_observed_value is distinct from wanted or current_value is distinct from wanted then return 'verification_pending'; end if;
  next_state:=case when q.status='awaiting_verification' then 'awaiting_owner_ack' else 'rolled_back' end;
  update owner_request_private.requests set status=next_state where id=p_id;
  perform owner_request_private.record_event(p_id,'source_verified',null,jsonb_build_object('path',target,'evidence',p_evidence));
  return next_state;
end $$;
create function public.acknowledge_owner_request_v1(p_id uuid,p_action text) returns text
language plpgsql security definer set search_path = '' as $$
declare q owner_request_private.requests; next_state text; item jsonb; current_value jsonb; expected bigint; wanted jsonb;
begin
  select * into q from owner_request_private.requests where id=p_id for update;
  if not found or q.actor_user_id is distinct from auth.uid() then raise exception 'request not available' using errcode='42501'; end if;
  perform owner_request_private.owner_identity(q.restaurant_id,auth.uid());
  if p_action='confirm' and q.status in ('awaiting_owner_ack','completed','rolled_back') then
    if q.owner_acknowledged_at is not null then return q.status; end if;
    item:=owner_request_private.read_target(q.restaurant_id,coalesce(q.source_item_id,q.item_id));
    expected:=case when q.status='rolled_back' then q.rollback_version else q.applied_version end;
    wanted:=case when q.status='rolled_back' then q.before_value else q.after_value end;
    current_value:=case when q.change_type='availability' then item->'available' else item->'sort_order' end;
    if item is null or (item->>'version')::bigint is distinct from expected or item->>'target_source' is distinct from q.target_source or item->>'manifest_hash' is distinct from q.source_manifest_hash or current_value is distinct from wanted then
      update owner_request_private.requests set status='completion_conflict' where id=p_id;
      perform owner_request_private.record_event(p_id,'completion_conflict',auth.uid());
      return 'completion_conflict';
    end if;
    next_state:=case when q.status='rolled_back' then 'rolled_back' else 'completed' end;
    update owner_request_private.requests set status=next_state,owner_acknowledged_at=now() where id=p_id;
  elsif p_action='rollback' and q.status in ('awaiting_verification','awaiting_owner_ack','completed','completion_conflict','rollback_requested') then
    if q.status='rollback_requested' then return q.status; end if;
    next_state:='rollback_requested';
    update owner_request_private.requests set status=next_state,owner_acknowledged_at=null where id=p_id;
  else raise exception 'invalid owner transition' using errcode='22023'; end if;
  perform owner_request_private.record_event(p_id,p_action,auth.uid()); return next_state;
end $$;
create function public.rollback_owner_request_v1(p_id uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare q owner_request_private.requests; version bigint; next_state text;
begin
  perform owner_request_private.require_enabled('execution');
  select * into q from owner_request_private.requests where id=p_id for update;
  if not found then raise exception 'request not found' using errcode='22023'; end if;
  if q.status in ('rollback_conflict','rolled_back_pending_verification','rolled_back') then return q.status; end if;
  if q.status<>'rollback_requested' then raise exception 'owner rollback request required' using errcode='42501'; end if;
  perform owner_request_private.enrollment(q);
  version:=owner_request_private.write_change(q,true);
  next_state:=case when version is null then 'rollback_conflict' else 'rolled_back_pending_verification' end;
  update owner_request_private.requests set status=next_state,rollback_version=version where id=p_id;
  perform owner_request_private.record_event(p_id,next_state,null); return next_state;
end $$;
create function public.get_owner_request_v1(p_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare q owner_request_private.requests;
begin
  select * into q from owner_request_private.requests where id=p_id and actor_user_id=auth.uid();
  if not found then return null; end if;
  perform owner_request_private.owner_identity(q.restaurant_id,auth.uid());
  return jsonb_build_object('id',q.id,'restaurant_id',q.restaurant_id,'status',q.status,'change_type',q.change_type,'item_id',coalesce(q.source_item_id,q.item_id),'item_name',q.item_label,
    'before',q.before_value,'after',q.after_value,'owner_acknowledged_at',q.owner_acknowledged_at,
    'events',coalesce((select jsonb_agg(jsonb_build_object('type',e.event_type,'at',e.created_at) order by e.id) from owner_request_private.events e where e.request_id=q.id),'[]'),
    'delivery',coalesce((select jsonb_agg(jsonb_build_object('status',o.status,'attempt',o.attempt,'next_attempt_at',o.next_attempt_at)) from owner_request_private.outbox o where o.request_id=q.id),'[]'));
end $$;

create function public.claim_owner_request_notices_v1(p_limit integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  perform owner_request_private.require_enabled('notifications');
  if p_limit is null or p_limit not between 1 and 10 then raise exception 'bounded batch required' using errcode='22023'; end if;
  update owner_request_private.outbox set status='dead_letter',error_category='retry_window_expired',lease_token=null,lease_expires_at=null where exists(select 1 from public.change_requests r where r.id=owner_request_private.outbox.request_id and r.restaurant_id=any((select notification_tenants from owner_request_private.settings where singleton)::text[])) and status in ('pending','retry_wait','leased') and attempt>0 and first_attempt_at<clock_timestamp()-interval '23 hours';
  update owner_request_private.outbox set status='dead_letter',error_category='lease_expired',lease_token=null,lease_expires_at=null where exists(select 1 from public.change_requests r where r.id=owner_request_private.outbox.request_id and r.restaurant_id=any((select notification_tenants from owner_request_private.settings where singleton)::text[])) and status='leased' and lease_expires_at<=clock_timestamp() and attempt>=6;
  with due as (
    select id from owner_request_private.outbox o where exists(select 1 from public.change_requests r where r.id=o.request_id and r.restaurant_id=any((select notification_tenants from owner_request_private.settings where singleton)::text[])) and attempt<6 and
      ((status in ('pending','retry_wait') and next_attempt_at<=clock_timestamp()) or (status='leased' and lease_expires_at<=clock_timestamp()))
      order by next_attempt_at,id for update skip locked limit p_limit
  ), claimed as (
    update owner_request_private.outbox o set status='leased',attempt=o.attempt+1,first_attempt_at=coalesce(o.first_attempt_at,clock_timestamp()),lease_token=gen_random_uuid(),lease_expires_at=clock_timestamp()+interval '90 seconds'
      from due where o.id=due.id returning o.*
  ) select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'lease_token',c.lease_token,'request_id',c.request_id,'attempt',c.attempt,
      'reference_id',r.reference_id,'restaurant_id',r.restaurant_id,'event_type',e.event_type)),'[]') into result
    from claimed c join public.change_requests r on r.id=c.request_id join owner_request_private.events e on e.id=c.event_id;
  return result;
end $$;
create function public.finish_owner_request_notice_v1(p_id uuid,p_lease_token uuid,p_sent boolean,p_error text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare o owner_request_private.outbox; delays integer[]:=array[60,300,1800,7200,21600];
begin
  perform owner_request_private.require_enabled('notifications');
  select * into o from owner_request_private.outbox where id=p_id for update;
  if not found or o.status<>'leased' or o.lease_token is distinct from p_lease_token or o.lease_expires_at<=clock_timestamp() then return false; end if;
  if p_sent is null or (not p_sent and (p_error is null or p_error not in ('timeout','provider_4xx','provider_5xx','transport','invalid_response'))) then raise exception 'invalid delivery outcome' using errcode='22023'; end if;
  update owner_request_private.outbox set status=case when p_sent then 'sent' when o.attempt>=6 then 'dead_letter' else 'retry_wait' end,
    error_category=case when p_sent then null else p_error end,sent_at=case when p_sent then now() end,
    next_attempt_at=case when not p_sent and o.attempt<6 then clock_timestamp()+make_interval(secs=>delays[o.attempt]) else next_attempt_at end,
    lease_token=null,lease_expires_at=null where id=p_id;
  return true;
end $$;

revoke all on all sequences in schema owner_request_private from public,anon,authenticated,service_role;
revoke all on all functions in schema owner_request_private from public,anon,authenticated,service_role;
revoke all on function public.submit_owner_request_v1(text,uuid,text,uuid,bigint,jsonb,text,boolean),public.review_owner_request_v1(uuid,text),public.acknowledge_owner_request_v1(uuid,text),public.get_owner_request_v1(uuid),public.get_owner_request_review_v1(uuid) from public,anon,authenticated,service_role;
grant execute on function public.submit_owner_request_v1(text,uuid,text,uuid,bigint,jsonb,text,boolean),public.review_owner_request_v1(uuid,text),public.acknowledge_owner_request_v1(uuid,text),public.get_owner_request_v1(uuid),public.get_owner_request_review_v1(uuid) to authenticated;
revoke all on function public.execute_owner_request_v1(uuid),public.verify_owner_request_v1(uuid,text,jsonb,text),public.rollback_owner_request_v1(uuid),public.claim_owner_request_notices_v1(integer),public.finish_owner_request_notice_v1(uuid,uuid,boolean,text) from public,anon,authenticated,service_role;
grant execute on function public.execute_owner_request_v1(uuid),public.verify_owner_request_v1(uuid,text,jsonb,text),public.rollback_owner_request_v1(uuid),public.claim_owner_request_notices_v1(integer),public.finish_owner_request_notice_v1(uuid,uuid,boolean,text) to service_role;
commit;
