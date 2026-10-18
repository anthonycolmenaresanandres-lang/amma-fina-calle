-- UNAPPLIED PROPOSAL. Private staging only: no public registry/menu/owner grants.
-- Depends on owner_request_queue_v1.sql and existing can_current_user_manage_team().
-- No credential provisioning, invitations, publishing, certification or execution API.
begin;
create schema account_staging_private;
revoke all on schema account_staging_private from public,anon,authenticated,service_role;
create table account_staging_private.settings(singleton boolean primary key default true check(singleton),enabled boolean not null default false);
insert into account_staging_private.settings default values;
create table account_staging_private.accounts(
 id uuid primary key default gen_random_uuid(), client_key uuid not null, created_by uuid not null,
 tenant text not null unique check(tenant ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(tenant)<=80),
 business_name text not null check(length(business_name) between 1 and 120),
 location text not null check(length(location) between 1 and 240), identity_key text not null unique,
 owner_user_id uuid not null,owner_email text not null,owner_accepted_at timestamptz,
 source text not null check(source in ('manual-json-v1','bodega-static-v1')),
 revision bigint not null default 0,snapshot jsonb,
 sync_status text not null default 'awaiting_owner' check(sync_status in ('awaiting_owner','awaiting_menu','awaiting_owner_review','staged_pending_release')),
 last_attempt_at timestamptz,last_staged_at timestamptz,last_success_at timestamptz check(last_success_at is null),
 created_at timestamptz not null default now(),unique(created_by,client_key)
);
create table account_staging_private.plans(
 id uuid primary key default gen_random_uuid(),account_id uuid not null references account_staging_private.accounts,
 created_by uuid not null,client_key uuid not null,expected_revision bigint not null,
 snapshot jsonb not null,digest text not null,owner_approved_at timestamptz,staged_at timestamptz,
 created_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '24 hours',
 unique(account_id,created_by,client_key)
);
create table account_staging_private.identities(
 account_id uuid not null references account_staging_private.accounts,
 kind text not null check(kind in ('category','item')),source_id text not null,entity_id uuid not null default gen_random_uuid(),
 primary key(account_id,kind,source_id),unique(entity_id)
);
create table account_staging_private.events(
 id bigint generated always as identity primary key,account_id uuid not null references account_staging_private.accounts,
 plan_id uuid references account_staging_private.plans,actor_user_id uuid not null,event_type text not null,
 created_at timestamptz not null default now()
);
alter table account_staging_private.settings enable row level security;
alter table account_staging_private.accounts enable row level security;
alter table account_staging_private.plans enable row level security;
alter table account_staging_private.identities enable row level security;
alter table account_staging_private.events enable row level security;

create function account_staging_private.actor(p_manager boolean default false) returns jsonb
language plpgsql security definer set search_path='' as $$
declare a jsonb;
begin
 if not coalesce((select enabled from account_staging_private.settings where singleton),false) then raise exception 'account staging disabled' using errcode='42501';end if;
 a:=owner_request_private.actor(auth.uid());
 if p_manager and not coalesce(public.can_current_user_manage_team(),false) then raise exception 'account manager required' using errcode='42501';end if;
 return a;
end $$;
create function account_staging_private.owner(a account_staging_private.accounts) returns void
language plpgsql security definer set search_path='' as $$
declare current_owner jsonb;
begin
 current_owner:=owner_request_private.actor(a.owner_user_id);
 if current_owner->>'email' is distinct from a.owner_email then raise exception 'owner association changed; review required' using errcode='42501';end if;
end $$;
create function public.create_account_candidate_v1(p_key uuid,p_tenant text,p_business text,p_location text,p_owner_email text,p_source text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor jsonb;u record;a account_staging_private.accounts;ident text;
begin
 actor:=account_staging_private.actor(true);
 p_business:=btrim(p_business);p_location:=btrim(p_location);p_owner_email:=lower(btrim(p_owner_email));
 if p_key is null or p_tenant is null or p_business is null or p_location is null or p_owner_email is null or p_source is null
 or length(p_business) not between 1 and 120 or length(p_location) not between 1 and 240 or length(p_owner_email)>254 or p_owner_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'invalid account identity' using errcode='22023';end if;
 ident:=lower(regexp_replace(p_business,'[[:space:]]+',' ','g'))||'|'||lower(regexp_replace(p_location,'[[:space:]]+',' ','g'));
 -- Serialize identity/slug checks for this API. Legacy writers still require release-time reconciliation.
 perform pg_advisory_xact_lock(hashtextextended('account-candidates',0));
 select * into a from account_staging_private.accounts where created_by=auth.uid() and client_key=p_key;
 if found then
  if (a.tenant,a.business_name,a.location,a.owner_email,a.source) is distinct from (p_tenant,p_business,p_location,p_owner_email,p_source) then raise exception 'retry key payload changed' using errcode='22023';end if;
  return jsonb_build_object('id',a.id,'tenant',a.tenant,'status',a.sync_status);
 end if;
 if exists(select 1 from public.restaurants r where r.id=p_tenant or lower(regexp_replace(btrim(r.business_name),'[[:space:]]+',' ','g'))=lower(regexp_replace(p_business,'[[:space:]]+',' ','g'))) then raise exception 'existing account requires reconciliation' using errcode='23505';end if;
 select id,email into u from auth.users where lower(email)=p_owner_email and email_confirmed_at is not null and coalesce(raw_app_meta_data->>'owner_password_reset_required','false')<>'true' for share;
 if not found then raise exception 'existing verified owner account required; no invitation sent' using errcode='22023';end if;
 if exists(select 1 from auth.users where lower(email)=p_owner_email and id<>u.id) then raise exception 'ambiguous owner identity' using errcode='22023';end if;
 insert into account_staging_private.accounts(client_key,created_by,tenant,business_name,location,identity_key,owner_user_id,owner_email,source)
 values(p_key,auth.uid(),p_tenant,p_business,p_location,ident,u.id,p_owner_email,p_source) returning * into a;
 insert into account_staging_private.events(account_id,actor_user_id,event_type) values(a.id,auth.uid(),'candidate_created');
 return jsonb_build_object('id',a.id,'tenant',a.tenant,'status',a.sync_status);
end $$;
create function public.get_account_candidate_v1(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor jsonb;a account_staging_private.accounts;plans jsonb;
begin
 actor:=account_staging_private.actor();
 select * into a from account_staging_private.accounts where id=p_id;
 if not found then return null;end if;
 if not coalesce(public.can_current_user_manage_team(),false) and (a.owner_user_id<>auth.uid() or a.owner_email is distinct from actor->>'email') then return null;end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'expected_revision',p.expected_revision,'snapshot',p.snapshot,'digest',p.digest,'owner_approved_at',p.owner_approved_at,'staged_at',p.staged_at,'expires_at',p.expires_at) order by p.created_at desc),'[]') into plans from (select * from account_staging_private.plans where account_id=a.id order by created_at desc limit 20) p;
 return jsonb_build_object('id',a.id,'tenant',a.tenant,'business_name',a.business_name,'location',a.location,'owner_email',a.owner_email,'owner_accepted_at',a.owner_accepted_at,'source',a.source,'revision',a.revision,'snapshot',a.snapshot,'sync_status',a.sync_status,'last_attempt_at',a.last_attempt_at,'last_staged_at',a.last_staged_at,'last_success_at',a.last_success_at,'plans',plans,'can_publish',false);
end $$;
create function public.accept_account_candidate_v1(p_id uuid,p_confirmed boolean) returns text
language plpgsql security definer set search_path='' as $$
declare actor jsonb;a account_staging_private.accounts;
begin
 actor:=account_staging_private.actor();select * into a from account_staging_private.accounts where id=p_id for update;
 if not found or p_confirmed is distinct from true or a.owner_user_id<>auth.uid() or a.owner_email is distinct from actor->>'email' then raise exception 'verified associated owner confirmation required' using errcode='42501';end if;
 perform account_staging_private.owner(a);
 if a.owner_accepted_at is null then
  update account_staging_private.accounts set owner_accepted_at=now(),sync_status='awaiting_menu' where id=a.id;
  insert into account_staging_private.events(account_id,actor_user_id,event_type) values(a.id,auth.uid(),'owner_accepted');
 end if;
 return 'owner_accepted_private_staging_only';
end $$;

create function account_staging_private.validate_snapshot(s jsonb,a account_staging_private.accounts) returns void
language plpgsql security definer set search_path='' as $$
declare item jsonb;category jsonb;
begin
 if s is null or octet_length(s::text)>256000 or jsonb_typeof(s) is distinct from 'object' or (s-'tenant'-'source'-'version'-'currency'-'categories'-'items')<>'{}'::jsonb
 or s->>'tenant' is distinct from a.tenant or s->>'source' is distinct from a.source or s->>'currency' is distinct from 'USD'
 or jsonb_typeof(s->'version') is distinct from 'string' or length(btrim(s->>'version')) not between 1 and 100
 or jsonb_typeof(s->'categories') is distinct from 'array' or jsonb_typeof(s->'items') is distinct from 'array' then raise exception 'invalid menu envelope' using errcode='22023';end if;
 if jsonb_array_length(s->'categories') not between 1 and 40 or jsonb_array_length(s->'items') not between 1 and 200 then raise exception 'menu size outside bounds' using errcode='22023';end if;
 for category in select * from jsonb_array_elements(s->'categories') loop
  if jsonb_typeof(category) is distinct from 'object' or (category-'sourceId'-'name')<>'{}'::jsonb or jsonb_typeof(category->'sourceId') is distinct from 'string' or category->>'sourceId' !~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,95}$' or jsonb_typeof(category->'name') is distinct from 'string' or length(btrim(category->>'name')) not between 1 and 100 then raise exception 'invalid category' using errcode='22023';end if;
 end loop;
 for item in select * from jsonb_array_elements(s->'items') loop
  if jsonb_typeof(item) is distinct from 'object' or (item-'sourceId'-'categoryId'-'name'-'description'-'priceCents'-'available'-'order')<>'{}'::jsonb
  or jsonb_typeof(item->'sourceId') is distinct from 'string' or item->>'sourceId' !~ '^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,95}$'
  or jsonb_typeof(item->'categoryId') is distinct from 'string' or not exists(select 1 from jsonb_array_elements(s->'categories') c where c->>'sourceId'=item->>'categoryId')
  or jsonb_typeof(item->'name') is distinct from 'string' or length(btrim(item->>'name')) not between 1 and 120
  or jsonb_typeof(item->'description') is distinct from 'string' or length(item->>'description')>800
  or jsonb_typeof(item->'available') is distinct from 'boolean' or not(item ? 'priceCents')
  or (item->'priceCents'<>'null'::jsonb and (jsonb_typeof(item->'priceCents')<>'number' or item->>'priceCents' !~ '^[0-9]+$' or (item->>'priceCents')::numeric>1000000))
  or jsonb_typeof(item->'order') is distinct from 'number' or item->>'order' !~ '^[0-9]+$' or (item->>'order')::numeric>10000 then raise exception 'invalid item' using errcode='22023';end if;
 end loop;
 if (select count(*)<>count(distinct c->>'sourceId') from jsonb_array_elements(s->'categories') c)
 or (select count(*)<>count(distinct i->>'sourceId') or count(*)<>count(distinct (i->>'categoryId',i->>'order')) from jsonb_array_elements(s->'items') i) then raise exception 'duplicate source IDs or positions' using errcode='22023';end if;
end $$;
create function public.prepare_account_menu_v1(p_id uuid,p_key uuid,p_expected_revision bigint,p_snapshot jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor jsonb;a account_staging_private.accounts;p account_staging_private.plans;merged jsonb;
begin
 actor:=account_staging_private.actor(true);select * into a from account_staging_private.accounts where id=p_id for update;
 if not found or p_key is null or p_expected_revision is null then raise exception 'invalid candidate' using errcode='22023';end if;
 perform account_staging_private.validate_snapshot(p_snapshot,a);
 -- Missing IDs are retained, never deleted or hidden. Position collisions fail validation.
 merged:=jsonb_set(jsonb_set(p_snapshot,'{items}',(select jsonb_agg(v order by v->>'sourceId') from (
  select v from jsonb_array_elements(p_snapshot->'items') v union all select old from jsonb_array_elements(coalesce(a.snapshot->'items','[]')) old where not exists(select 1 from jsonb_array_elements(p_snapshot->'items') n where n->>'sourceId'=old->>'sourceId')) t(v))),'{categories}',(select jsonb_agg(v order by v->>'sourceId') from (
  select v from jsonb_array_elements(p_snapshot->'categories') v union all select old from jsonb_array_elements(coalesce(a.snapshot->'categories','[]')) old where not exists(select 1 from jsonb_array_elements(p_snapshot->'categories') n where n->>'sourceId'=old->>'sourceId')) t(v)));
 perform account_staging_private.validate_snapshot(merged,a);
 select * into p from account_staging_private.plans where account_id=a.id and created_by=auth.uid() and client_key=p_key;
 if found then
  if p.snapshot<>merged or p.expected_revision<>p_expected_revision then raise exception 'retry key payload changed' using errcode='22023';end if;
  return jsonb_build_object('id',p.id,'digest',p.digest,'status',case when p.staged_at is null then 'awaiting_owner_review' else 'staged_pending_release' end);
 end if;
 if a.revision<>p_expected_revision then raise exception 'menu revision conflict; preview again' using errcode='40001';end if;
 insert into account_staging_private.plans(account_id,created_by,client_key,expected_revision,snapshot,digest) values(a.id,auth.uid(),p_key,a.revision,merged,encode(sha256(convert_to(merged::text,'UTF8')),'hex')) returning * into p;
 update account_staging_private.accounts set last_attempt_at=now(),sync_status=case when owner_accepted_at is null then 'awaiting_owner' else 'awaiting_owner_review' end where id=a.id;
 insert into account_staging_private.events(account_id,plan_id,actor_user_id,event_type) values(a.id,p.id,auth.uid(),'menu_preview_prepared');
 return jsonb_build_object('id',p.id,'digest',p.digest,'status','awaiting_owner_review');
end $$;
create function public.approve_account_menu_v1(p_plan uuid,p_digest text,p_confirmed boolean) returns text
language plpgsql security definer set search_path='' as $$
declare actor jsonb;a account_staging_private.accounts;p account_staging_private.plans;account_id uuid;
begin
 actor:=account_staging_private.actor();select q.account_id into account_id from account_staging_private.plans q where id=p_plan;
 select * into a from account_staging_private.accounts where id=account_id for update;
 select * into p from account_staging_private.plans where id=p_plan for update;
 if p.id is null or a.id is null or p_confirmed is distinct from true or a.owner_user_id<>auth.uid() or a.owner_email is distinct from actor->>'email' or a.owner_accepted_at is null then raise exception 'associated owner approval required' using errcode='42501';end if;
 perform account_staging_private.owner(a);
 if p.digest is distinct from p_digest or p.expires_at<=now() or a.revision<>p.expected_revision or p.staged_at is not null then raise exception 'preview expired or changed' using errcode='40001';end if;
 if p.owner_approved_at is null then
  update account_staging_private.plans set owner_approved_at=now() where id=p.id;
  insert into account_staging_private.events(account_id,plan_id,actor_user_id,event_type) values(a.id,p.id,auth.uid(),'menu_owner_approved');
 end if;
 return 'approved_for_private_staging';
end $$;
create function public.stage_account_menu_v1(p_plan uuid,p_digest text) returns text
language plpgsql security definer set search_path='' as $$
declare actor jsonb;a account_staging_private.accounts;p account_staging_private.plans;account_id uuid;
begin
 actor:=account_staging_private.actor(true);select q.account_id into account_id from account_staging_private.plans q where id=p_plan;
 select * into a from account_staging_private.accounts where id=account_id for update;
 select * into p from account_staging_private.plans where id=p_plan for update;
 if p.id is null or a.id is null or p.digest is distinct from p_digest then raise exception 'invalid preview' using errcode='22023';end if;
 perform account_staging_private.owner(a);
 if p.staged_at is not null then return 'staged_pending_release';end if;
 if a.owner_accepted_at is null or p.owner_approved_at is null or p.expires_at<=now() or a.revision<>p.expected_revision then raise exception 'owner approval or fresh revision required' using errcode='40001';end if;
 update account_staging_private.accounts set snapshot=p.snapshot,revision=revision+1,sync_status='staged_pending_release',last_staged_at=now() where id=a.id;
 update account_staging_private.plans set staged_at=now() where id=p.id;
 insert into account_staging_private.identities(account_id,kind,source_id)
 select a.id,'category',c->>'sourceId' from jsonb_array_elements(p.snapshot->'categories') c on conflict do nothing;
 insert into account_staging_private.identities(account_id,kind,source_id)
 select a.id,'item',i->>'sourceId' from jsonb_array_elements(p.snapshot->'items') i on conflict do nothing;
 insert into account_staging_private.events(account_id,plan_id,actor_user_id,event_type) values(a.id,p.id,auth.uid(),'menu_staged');
 return 'staged_pending_release';
end $$;

create function public.list_account_candidates_v1() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform account_staging_private.actor(true);
 return coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'tenant',a.tenant,'business_name',a.business_name,'sync_status',a.sync_status) order by a.created_at desc,a.id desc) from (select * from account_staging_private.accounts order by created_at desc,id desc limit 25) a),'[]');
end $$;
revoke all on function public.list_account_candidates_v1() from public,anon,authenticated,service_role;
grant execute on function public.list_account_candidates_v1() to authenticated;
revoke all on all tables in schema account_staging_private from public,anon,authenticated,service_role;
revoke all on all sequences in schema account_staging_private from public,anon,authenticated,service_role;
revoke all on all functions in schema account_staging_private from public,anon,authenticated,service_role;
revoke all on function public.create_account_candidate_v1(uuid,text,text,text,text,text),public.get_account_candidate_v1(uuid),public.accept_account_candidate_v1(uuid,boolean),public.prepare_account_menu_v1(uuid,uuid,bigint,jsonb),public.approve_account_menu_v1(uuid,text,boolean),public.stage_account_menu_v1(uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.create_account_candidate_v1(uuid,text,text,text,text,text),public.get_account_candidate_v1(uuid),public.accept_account_candidate_v1(uuid,boolean),public.prepare_account_menu_v1(uuid,uuid,bigint,jsonb),public.approve_account_menu_v1(uuid,text,boolean),public.stage_account_menu_v1(uuid,text) to authenticated;
commit;
