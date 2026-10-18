-- UNAPPLIED PROPOSAL, after revised owner_request_queue_v1 + tracking proposals.
-- Then load bodega_menu_manifest_v1.sql. All gates/certificates/enrollments stay OFF/empty.
-- Public data API returns only Bodega display controls; never customer/owner/request rows.
begin;
create schema bodega_menu_private;
revoke all on schema bodega_menu_private from public,anon,authenticated,service_role;
create table bodega_menu_private.settings(
 singleton boolean primary key default true check(singleton),
 manifest_hash text not null check(manifest_hash ~ '^[a-f0-9]{64}$'),
 expected_count integer not null check(expected_count=50),
 publishing_enabled boolean not null default false,execution_enabled boolean not null default false,
 binding_approval_reference text,publication_commit text check(publication_commit is null or publication_commit ~ '^[a-f0-9]{40}$'),
 certified_manifest_hash text,certified_commit text,certified_origin text check(certified_origin is null or certified_origin='https://finacalleos.com'),
 certified_at timestamptz,certificate_expires_at timestamptz,certificate_reference text
);
create table bodega_menu_private.groups(group_key text primary key);
create table bodega_menu_private.catalog(
 id uuid primary key,source_id text not null unique,group_key text not null references bodega_menu_private.groups,
 public_name text not null check(length(public_name) between 1 and 120),baseline_sort_order integer not null check(baseline_sort_order between 0 and 10000),
 content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),unique(id,group_key),unique(group_key,baseline_sort_order)
);
create sequence bodega_menu_private.change_revision;
create table bodega_menu_private.controls(
 item_id uuid primary key,group_key text not null,is_available boolean not null default true,
 sort_order integer not null check(sort_order between 0 and 10000),version bigint not null default 0 check(version>=0),
 change_revision bigint not null default 0 check(change_revision>=0),
 foreign key(item_id,group_key) references bodega_menu_private.catalog(id,group_key),unique(group_key,sort_order)
);
alter table bodega_menu_private.settings enable row level security;
alter table bodega_menu_private.groups enable row level security;
alter table bodega_menu_private.catalog enable row level security;
alter table bodega_menu_private.controls enable row level security;
create function bodega_menu_private.protect_catalog() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'reviewed source migration required' using errcode='42501';end $$;
create trigger bodega_catalog_immutable before update or delete on bodega_menu_private.catalog for each row execute function bodega_menu_private.protect_catalog();
create function bodega_menu_private.protect_manifest() returns trigger language plpgsql set search_path='' as $$
begin
 if (new.manifest_hash,new.expected_count) is distinct from (old.manifest_hash,old.expected_count) then raise exception 'reviewed source migration required' using errcode='42501';end if;
 return new;
end $$;
create trigger bodega_manifest_immutable before update on bodega_menu_private.settings for each row execute function bodega_menu_private.protect_manifest();
create function bodega_menu_private.version_control() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if (new.item_id,new.group_key) is distinct from (old.item_id,old.group_key) then raise exception 'item source identity is immutable' using errcode='42501';end if;
 new.version:=old.version+1;new.change_revision:=nextval('bodega_menu_private.change_revision');return new;
end $$;
create trigger bodega_controls_version before update on bodega_menu_private.controls for each row execute function bodega_menu_private.version_control();

create function bodega_menu_private.snapshot(p_hash text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare s bodega_menu_private.settings;
begin
 select * into s from bodega_menu_private.settings where singleton for share;
 if not found or s.publishing_enabled is distinct from true or p_hash is distinct from s.manifest_hash
 or s.binding_approval_reference is null or length(btrim(s.binding_approval_reference)) not between 1 and 300 or s.publication_commit is null
 or (select count(*) from bodega_menu_private.catalog)<>s.expected_count or (select count(*) from bodega_menu_private.controls)<>s.expected_count then return null;end if;
 return jsonb_build_object('tenant','bodega','manifest_hash',s.manifest_hash,'snapshot_version',(select coalesce(max(change_revision),0) from bodega_menu_private.controls),
 'items',(select jsonb_agg(jsonb_build_object('id',item_id,'available',is_available,'order',sort_order,'version',version) order by item_id) from bodega_menu_private.controls));
end $$;
create function bodega_menu_private.require_source(p_execution boolean default false) returns bodega_menu_private.settings
language plpgsql security definer set search_path='' as $$
declare s bodega_menu_private.settings;
begin
 select * into s from bodega_menu_private.settings where singleton for share;
 if not found or bodega_menu_private.snapshot(s.manifest_hash) is null or (p_execution and s.execution_enabled is distinct from true)
 or s.certified_manifest_hash is distinct from s.manifest_hash or s.certified_commit is distinct from s.publication_commit
 or s.certified_origin is distinct from 'https://finacalleos.com' or s.certified_at is null or s.certified_at>now()
 or s.certificate_expires_at is null or s.certificate_expires_at<=now() or s.certificate_reference is null or length(btrim(s.certificate_reference)) not between 1 and 1000 then
 raise exception 'approved Bodega publishing source and fresh readback certificate required' using errcode='42501';end if;
 return s;
end $$;
create function public.get_bodega_menu_controls_v1(p_manifest_hash text) returns jsonb
language sql security definer set search_path='' as $$select bodega_menu_private.snapshot(p_manifest_hash)$$;

-- Extend the existing private adapters. Actor/tenant checks remain in public ingress.
create or replace function owner_request_private.read_target(p_restaurant_id text,p_item_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare item public.menu_items;control record;s bodega_menu_private.settings;
begin
 if p_restaurant_id='bodega' then
  s:=bodega_menu_private.require_source(false);
  select c.*,m.public_name into control from bodega_menu_private.controls c join bodega_menu_private.catalog m on m.id=c.item_id where c.item_id=p_item_id for share of c;
  if not found then return null;end if;
  return jsonb_build_object('id',control.item_id,'database_item_id',null,'source_item_id',control.item_id,'target_source','bodega_controls_v1','manifest_hash',s.manifest_hash,
  'name',control.public_name,'available',control.is_available,'sort_order',control.sort_order,'version',control.version,'category_id',control.group_key);
 end if;
 select * into item from public.menu_items where id=p_item_id and restaurant_id=p_restaurant_id for share;
 if not found then return null;end if;
 return jsonb_build_object('id',item.id,'database_item_id',item.id,'source_item_id',null,'target_source','supabase_public_menu_v1','manifest_hash',null,
 'name',item.name,'available',item.is_available,'sort_order',item.sort_order,'version',item.owner_request_version,'category_id',item.category_id);
end $$;
create or replace function owner_request_private.list_targets(p_restaurant_id text) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if p_restaurant_id='bodega' then
  perform bodega_menu_private.require_source(false);
  return (select jsonb_agg(jsonb_build_object('id',c.item_id,'name',m.public_name,'available',c.is_available,'order',c.sort_order,'version',c.version) order by c.group_key,c.sort_order) from bodega_menu_private.controls c join bodega_menu_private.catalog m on m.id=c.item_id);
 end if;
 if (select count(*) from public.menu_items where restaurant_id=p_restaurant_id)>200 then raise exception 'menu requires a scoped adapter' using errcode='22023';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'name',m.name,'available',m.is_available,'order',m.sort_order,'version',m.owner_request_version) order by m.sort_order,m.id) from public.menu_items m where restaurant_id=p_restaurant_id),'[]');
end $$;
alter table owner_request_private.enrollments add column source_manifest_hash text;
alter table owner_request_private.enrollments drop constraint enrollments_source_kind_check;
alter table owner_request_private.enrollments drop constraint enrollments_guest_path_check;
alter table owner_request_private.enrollments add constraint enrollments_source_kind_check check(source_kind in ('supabase_public_menu_v1','bodega_controls_v1'));
alter table owner_request_private.enrollments add constraint enrollments_guest_path_check check(guest_path ~ '^/(m/[a-z0-9-]+|demo/las-palmas|demo/bodega)$');
alter table owner_request_private.enrollments add constraint enrollment_manifest_binding check((source_kind='supabase_public_menu_v1' and source_manifest_hash is null)
 or (source_kind='bodega_controls_v1' and restaurant_id='bodega' and guest_path='/demo/bodega' and source_manifest_hash is not null and source_manifest_hash ~ '^[a-f0-9]{64}$'));
create or replace function owner_request_private.enrollment(q owner_request_private.requests) returns text
language plpgsql security definer set search_path='' as $$
declare e owner_request_private.enrollments;s bodega_menu_private.settings;
begin
  if not coalesce(q.restaurant_id=any((select execution_tenants from owner_request_private.settings where singleton)::text[]),false) then raise exception 'tenant execution disabled' using errcode='42501'; end if;
 perform owner_request_private.owner_identity(q.restaurant_id,q.actor_user_id);
 select * into e from owner_request_private.enrollments where restaurant_id=q.restaurant_id and owner_user_id=q.actor_user_id for share;
 if not found or e.revoked_at is not null or e.expires_at<=now() or e.owner_consented_at>now() or e.source_verified_at>now()
 or not(q.change_type=any(e.allowed_types)) or (q.policy_version is not null and q.policy_version<>e.policy_version) then raise exception 'active approved enrollment required' using errcode='42501';end if;
 if q.restaurant_id='bodega' then
  s:=bodega_menu_private.require_source(false);
  if q.target_source<>'bodega_controls_v1' or q.source_item_id is null or q.item_id is not null or q.source_manifest_hash is distinct from s.manifest_hash
  or e.source_kind<>'bodega_controls_v1' or e.source_manifest_hash is distinct from s.manifest_hash or e.guest_path<>'/demo/bodega' then raise exception 'Bodega source binding mismatch' using errcode='42501';end if;
 else
  if q.target_source<>'supabase_public_menu_v1' or e.source_kind<>'supabase_public_menu_v1' or q.restaurant_id in ('colattao','scrambled','project-seed')
  or (q.restaurant_id='las-palmas-lynnhaven' and e.guest_path<>'/demo/las-palmas') or (q.restaurant_id<>'las-palmas-lynnhaven' and e.guest_path<>'/m/'||q.restaurant_id) then raise exception 'connected source required' using errcode='42501';end if;
 end if;
 return e.policy_version;
end $$;

create function bodega_menu_private.write_target(q owner_request_private.requests,p_rollback boolean) returns bigint
language plpgsql security definer set search_path='' as $$
declare s bodega_menu_private.settings;c bodega_menu_private.controls;group_id text;expected bigint;wanted jsonb;current_value jsonb;version bigint;field text;
begin
 s:=bodega_menu_private.require_source(true);
 if q.restaurant_id<>'bodega' or q.target_source<>'bodega_controls_v1' or q.source_manifest_hash is distinct from s.manifest_hash or q.item_id is not null or q.source_item_id is null then raise exception 'Bodega target binding required' using errcode='42501';end if;
 if q.change_type not in ('availability','display_order') then raise exception 'pilot field not allowed' using errcode='42501';end if;
 select group_key into group_id from bodega_menu_private.catalog where id=q.source_item_id;
 if not found then return null;end if;
 if q.change_type='display_order' then perform 1 from bodega_menu_private.groups where group_key=group_id for update;end if;
 select * into c from bodega_menu_private.controls where item_id=q.source_item_id for update;
 expected:=case when p_rollback then q.applied_version else q.expected_version end;
 if not found or c.version is distinct from expected then return null;end if;
 current_value:=case when q.change_type='availability' then to_jsonb(c.is_available) else to_jsonb(c.sort_order) end;
 if current_value is distinct from (case when p_rollback then q.after_value else q.before_value end) then return null;end if;
 wanted:=case when p_rollback then q.before_value else q.after_value end;
 if q.change_type='availability' then
  field:='is_available';update bodega_menu_private.controls set is_available=(wanted#>>'{}')::boolean where item_id=q.source_item_id and controls.version=expected returning controls.version into version;
 else
  if exists(select 1 from bodega_menu_private.controls where group_key=group_id and item_id<>q.source_item_id and sort_order=(wanted#>>'{}')::integer) then return null;end if;
  field:='sort_order';update bodega_menu_private.controls set sort_order=(wanted#>>'{}')::integer where item_id=q.source_item_id and controls.version=expected returning controls.version into version;
 end if;
 if not found then raise exception 'atomic update lost' using errcode='40001';end if;
 insert into public.audit_log(restaurant_id,actor_email,table_name,row_id,field_name,old_value,new_value,request_id,actor_user_id)
 values('bodega','queue-executor:v1','bodega_menu_controls',q.source_item_id::text,field,current_value#>>'{}',wanted#>>'{}',q.id,null);
 return version;
end $$;
create or replace function owner_request_private.write_change(q owner_request_private.requests,p_rollback boolean) returns bigint
language plpgsql security definer set search_path='' as $$
declare item public.menu_items;current_value jsonb;wanted jsonb;expected bigint;version bigint;field text;
begin
 if q.target_source='bodega_controls_v1' then return bodega_menu_private.write_target(q,p_rollback);end if;
 if q.target_source<>'supabase_public_menu_v1' then raise exception 'source write adapter not installed' using errcode='42501';end if;
 select * into item from public.menu_items where id=q.item_id and restaurant_id=q.restaurant_id for update;
 expected:=case when p_rollback then q.applied_version else q.expected_version end;
 if not found or expected is distinct from item.owner_request_version then return null;end if;
 if q.change_type='availability' then field:='is_available';current_value:=to_jsonb(item.is_available);
 elsif q.change_type='display_order' then field:='sort_order';current_value:=to_jsonb(item.sort_order);
 else raise exception 'unsupported execution type' using errcode='42501';end if;
 if current_value is distinct from (case when p_rollback then q.after_value else q.before_value end) then return null;end if;
 wanted:=case when p_rollback then q.before_value else q.after_value end;
 if field='sort_order' then
  perform 1 from public.menu_categories where id=item.category_id for update;
  if exists(select 1 from public.menu_items where category_id=item.category_id and restaurant_id=q.restaurant_id and id<>q.item_id and sort_order=(wanted#>>'{}')::integer) then return null;end if;
 end if;
 if field='is_available' then update public.menu_items set is_available=(wanted#>>'{}')::boolean where id=q.item_id and restaurant_id=q.restaurant_id and owner_request_version=expected returning owner_request_version into version;
 else update public.menu_items set sort_order=(wanted#>>'{}')::integer where id=q.item_id and restaurant_id=q.restaurant_id and owner_request_version=expected returning owner_request_version into version;end if;
 if not found then raise exception 'atomic update lost' using errcode='40001';end if;
 insert into public.audit_log(restaurant_id,actor_email,table_name,row_id,field_name,old_value,new_value,request_id,actor_user_id)
 values(q.restaurant_id,'queue-executor:v1','menu_items',q.item_id::text,field,current_value#>>'{}',wanted#>>'{}',q.id,null);
 return version;
end $$;

create function public.get_bodega_request_readback_v1(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare q owner_request_private.requests;expected bigint;snapshot jsonb;s bodega_menu_private.settings;
begin
 perform owner_request_private.require_enabled('execution');
 select * into q from owner_request_private.requests where id=p_id;
 if not found or q.restaurant_id<>'bodega' or q.target_source<>'bodega_controls_v1' or q.status not in ('ready','rollback_requested','awaiting_verification','awaiting_owner_ack','rolled_back_pending_verification','rolled_back') then return null;end if;
 if q.status='rolled_back' and q.owner_acknowledged_at is not null then return null;end if;
 perform owner_request_private.enrollment(q);s:=bodega_menu_private.require_source(false);
 expected:=case when q.status='ready' then q.expected_version when q.status in ('rolled_back_pending_verification','rolled_back') then q.rollback_version else q.applied_version end;
 snapshot:=bodega_menu_private.snapshot(q.source_manifest_hash);
 return jsonb_build_object('id',q.id,'tenant','bodega','item_id',q.source_item_id,'manifest_hash',q.source_manifest_hash,'expected_version',expected,'status',q.status,'publication_commit',s.publication_commit,'snapshot',snapshot);
end $$;
create function public.record_bodega_request_conflict_v1(p_id uuid) returns text
language plpgsql security definer set search_path='' as $$
declare q owner_request_private.requests;item jsonb;expected bigint;wanted jsonb;current_value jsonb;next_state text;
begin
 perform owner_request_private.require_enabled('execution');
 select * into q from owner_request_private.requests where id=p_id for update;
 if not found or q.restaurant_id<>'bodega' or q.target_source<>'bodega_controls_v1' then raise exception 'Bodega request required' using errcode='42501';end if;
 perform owner_request_private.enrollment(q);
 if q.status in ('conflict','completion_conflict','rollback_conflict') then return q.status;end if;
 if q.status not in ('ready','rollback_requested','awaiting_verification','awaiting_owner_ack','rolled_back_pending_verification','rolled_back') or q.owner_acknowledged_at is not null then raise exception 'unacknowledged pending request required' using errcode='22023';end if;
 item:=owner_request_private.read_target('bodega',q.source_item_id);
 expected:=case when q.status='ready' then q.expected_version when q.status in ('rolled_back_pending_verification','rolled_back') then q.rollback_version else q.applied_version end;
 wanted:=case when q.status='ready' or q.status in ('rolled_back_pending_verification','rolled_back') then q.before_value else q.after_value end;
 current_value:=case when q.change_type='availability' then item->'available' else item->'sort_order' end;
 if item is not null and (item->>'version')::bigint is not distinct from expected and current_value is not distinct from wanted then return q.status;end if;
 next_state:=case when q.status='ready' then 'conflict' when q.status='rollback_requested' then 'rollback_conflict' else 'completion_conflict' end;
 update owner_request_private.requests set status=next_state where id=p_id;
 perform owner_request_private.record_event(p_id,next_state,null);
 return next_state;
end $$;
create function public.verify_bodega_owner_request_v1(p_id uuid,p_proof jsonb) returns text
language plpgsql security definer set search_path='' as $$
declare q owner_request_private.requests;s bodega_menu_private.settings;c bodega_menu_private.controls;wanted jsonb;expected bigint;current_value jsonb;next_state text;snapshot jsonb;
begin
 perform owner_request_private.require_enabled('execution');
 select * into q from owner_request_private.requests where id=p_id for update;
 if not found or q.restaurant_id<>'bodega' or q.target_source<>'bodega_controls_v1' or q.status not in ('awaiting_verification','awaiting_owner_ack','rolled_back_pending_verification','rolled_back') then raise exception 'Bodega verification not pending' using errcode='22023';end if;
 perform owner_request_private.enrollment(q);s:=bodega_menu_private.require_source(false);
 if p_proof is null or jsonb_typeof(p_proof) is distinct from 'object' or octet_length(p_proof::text)>2000
 or (p_proof-'tenant'-'path'-'manifest_hash'-'snapshot_version'-'item_id'-'item_version'-'available'-'sort_order'-'html_sha256'-'origin'-'deployment_commit')<>'{}'::jsonb
 or p_proof->>'tenant' is distinct from 'bodega' or p_proof->>'path' is distinct from '/demo/bodega' or p_proof->>'origin' is distinct from s.certified_origin
 or p_proof->>'deployment_commit' is distinct from s.certified_commit
 or jsonb_typeof(p_proof->'deployment_commit') is distinct from 'string'
 or p_proof->>'manifest_hash' is distinct from q.source_manifest_hash or p_proof->>'item_id' is distinct from q.source_item_id::text
 or jsonb_typeof(p_proof->'item_version') is distinct from 'number' or p_proof->>'item_version' !~ '^[0-9]{1,16}$'
 or jsonb_typeof(p_proof->'snapshot_version') is distinct from 'number' or p_proof->>'snapshot_version' !~ '^[0-9]{1,16}$'
 or jsonb_typeof(p_proof->'available') is distinct from 'boolean' or jsonb_typeof(p_proof->'sort_order') is distinct from 'number' or p_proof->>'sort_order' !~ '^[0-9]{1,5}$'
 or p_proof->>'html_sha256' is null or p_proof->>'html_sha256' !~ '^[a-f0-9]{64}$' then raise exception 'bounded rendered-menu proof required' using errcode='22023';end if;
 snapshot:=bodega_menu_private.snapshot(s.manifest_hash);
 select * into c from bodega_menu_private.controls where item_id=q.source_item_id for share;
 expected:=case when q.status in ('rolled_back_pending_verification','rolled_back') then q.rollback_version else q.applied_version end;
 wanted:=case when q.status in ('rolled_back_pending_verification','rolled_back') then q.before_value else q.after_value end;
 current_value:=case when q.change_type='availability' then to_jsonb(c.is_available) else to_jsonb(c.sort_order) end;
 if not found or c.version is distinct from expected or (p_proof->>'item_version')::bigint is distinct from expected
 or snapshot->'snapshot_version' is distinct from p_proof->'snapshot_version' or current_value is distinct from wanted
 or p_proof->'available' is distinct from to_jsonb(c.is_available) or p_proof->'sort_order' is distinct from to_jsonb(c.sort_order) then return 'verification_pending';end if;
 if q.status in ('awaiting_owner_ack','rolled_back') then return q.status;end if;
 next_state:=case when q.status='awaiting_verification' then 'awaiting_owner_ack' else 'rolled_back' end;
 update owner_request_private.requests set status=next_state where id=p_id;
 perform owner_request_private.record_event(p_id,'source_verified',null,jsonb_build_object('path','/demo/bodega','contract','bodega-controls-ssr-v1','html_sha256',p_proof->>'html_sha256','manifest_hash',q.source_manifest_hash,'snapshot_version',p_proof->'snapshot_version'));
 return next_state;
end $$;
revoke all on all tables in schema bodega_menu_private from public,anon,authenticated,service_role;
revoke all on all sequences in schema bodega_menu_private from public,anon,authenticated,service_role;
revoke all on all functions in schema bodega_menu_private from public,anon,authenticated,service_role;
revoke all on function owner_request_private.read_target(text,uuid),owner_request_private.list_targets(text),owner_request_private.enrollment(owner_request_private.requests),owner_request_private.write_change(owner_request_private.requests,boolean) from public,anon,authenticated,service_role;
revoke all on function public.get_bodega_menu_controls_v1(text),public.get_bodega_request_readback_v1(uuid),public.verify_bodega_owner_request_v1(uuid,jsonb),public.record_bodega_request_conflict_v1(uuid) from public,anon,authenticated,service_role;
grant execute on function public.get_bodega_menu_controls_v1(text) to anon,authenticated,service_role;
grant execute on function public.get_bodega_request_readback_v1(uuid),public.verify_bodega_owner_request_v1(uuid,jsonb),public.record_bodega_request_conflict_v1(uuid) to service_role;
commit;
