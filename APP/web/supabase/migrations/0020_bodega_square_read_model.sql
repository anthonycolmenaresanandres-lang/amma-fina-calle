-- Generic read-only Square connector for Fina Calle restaurants.
-- Applying this schema does not authorize a seller, publish a menu, or grant write access to Square.
create table public.square_connections (
  restaurant_id text primary key,
  merchant_id text not null unique,
  merchant_name text,
  location_id text,
  environment text not null check (environment in ('sandbox', 'production')),
  access_token_ciphertext text not null,
  refresh_token_ciphertext text not null,
  token_expires_at timestamptz not null,
  token_refreshed_at timestamptz not null,
  scopes text[] not null default '{}'::text[],
  connected_at timestamptz not null default now(),
  last_catalog_time timestamptz,
  last_synced_at timestamptz,
  last_error text,
  sync_lease_token uuid,
  sync_lease_until timestamptz,
  updated_at timestamptz not null default now()
);

create table public.square_catalog_objects (
  restaurant_id text not null,
  square_id text not null,
  object_type text not null,
  version bigint,
  square_updated_at timestamptz,
  deleted boolean not null default false,
  payload jsonb not null,
  synced_at timestamptz not null default now(),
  primary key (restaurant_id, square_id)
);
create index square_catalog_recent on public.square_catalog_objects(restaurant_id, square_updated_at desc);
create index square_catalog_type on public.square_catalog_objects(restaurant_id, object_type) where not deleted;

create table public.square_webhook_events (
  event_id text primary key,
  restaurant_id text not null,
  merchant_id text not null,
  event_type text not null,
  event_created_at timestamptz,
  status text not null check (status in ('received', 'processed', 'failed')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error text
);
create index square_webhook_restaurant_recent on public.square_webhook_events(restaurant_id, received_at desc);

create table public.square_sync_runs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id text not null,
  trigger_event_id text,
  trigger text not null check (trigger in ('oauth', 'webhook', 'manual', 'scheduled')),
  status text not null check (status in ('running', 'complete', 'failed')),
  object_count integer not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error text
);
create index square_sync_restaurant_recent on public.square_sync_runs(restaurant_id, started_at desc);

alter table public.square_connections enable row level security;
alter table public.square_catalog_objects enable row level security;
alter table public.square_webhook_events enable row level security;
alter table public.square_sync_runs enable row level security;

revoke all on public.square_connections, public.square_catalog_objects, public.square_webhook_events, public.square_sync_runs from public, anon, authenticated;
grant all on public.square_connections, public.square_catalog_objects, public.square_webhook_events, public.square_sync_runs to service_role;

create or replace function public.square_claim_webhook_event(
  p_event_id text,
  p_restaurant_id text,
  p_merchant_id text,
  p_event_type text,
  p_event_created_at timestamptz default null
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claimed boolean;
begin
  insert into public.square_webhook_events (
    event_id, restaurant_id, merchant_id, event_type, event_created_at, status
  ) values (
    p_event_id, p_restaurant_id, p_merchant_id, p_event_type, p_event_created_at, 'received'
  )
  on conflict (event_id) do update
    set restaurant_id = excluded.restaurant_id,
        merchant_id = excluded.merchant_id,
        event_type = excluded.event_type,
        event_created_at = excluded.event_created_at,
        status = 'received',
        received_at = now(),
        processed_at = null,
        error = null
    where public.square_webhook_events.status = 'failed'
       or (
         public.square_webhook_events.status = 'received'
         and public.square_webhook_events.received_at < now() - interval '10 minutes'
       )
  returning true into v_claimed;

  return coalesce(v_claimed, false);
end;
$$;

create or replace function public.square_acquire_sync_lease(
  p_restaurant_id text,
  p_lease_seconds integer default 180
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token uuid := gen_random_uuid();
begin
  update public.square_connections
     set sync_lease_token = v_token,
         sync_lease_until = now() + make_interval(secs => greatest(p_lease_seconds, 30)),
         updated_at = now()
   where restaurant_id = p_restaurant_id
     and (sync_lease_until is null or sync_lease_until < now());

  if found then return v_token; end if;
  return null;
end;
$$;

create or replace function public.square_store_catalog_objects(
  p_restaurant_id text,
  p_objects jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  insert into public.square_catalog_objects (
    restaurant_id, square_id, object_type, version, square_updated_at, deleted, payload, synced_at
  )
  select
    p_restaurant_id,
    x.square_id,
    x.object_type,
    x.version,
    x.square_updated_at,
    coalesce(x.deleted, false),
    x.payload,
    coalesce(x.synced_at, now())
  from jsonb_to_recordset(p_objects) as x(
    square_id text,
    object_type text,
    version bigint,
    square_updated_at timestamptz,
    deleted boolean,
    payload jsonb,
    synced_at timestamptz
  )
  on conflict (restaurant_id, square_id) do update
    set object_type = excluded.object_type,
        version = excluded.version,
        square_updated_at = excluded.square_updated_at,
        deleted = excluded.deleted,
        payload = case
          when excluded.deleted then public.square_catalog_objects.payload || excluded.payload
          else excluded.payload
        end,
        synced_at = excluded.synced_at
    where coalesce(excluded.version, -1) >= coalesce(public.square_catalog_objects.version, -1);

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.square_finish_catalog_sync(
  p_restaurant_id text,
  p_lease_token uuid,
  p_latest_time timestamptz default null,
  p_error text default null
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.square_connections
     set last_catalog_time = case
           when p_error is null and p_latest_time is not null
             then greatest(coalesce(last_catalog_time, p_latest_time), p_latest_time)
           else last_catalog_time
         end,
         last_synced_at = case when p_error is null then now() else last_synced_at end,
         last_error = p_error,
         sync_lease_token = null,
         sync_lease_until = null,
         updated_at = now()
   where restaurant_id = p_restaurant_id
     and sync_lease_token = p_lease_token;

  return found;
end;
$$;

revoke all on function public.square_claim_webhook_event(text,text,text,text,timestamptz) from public, anon, authenticated;
revoke all on function public.square_acquire_sync_lease(text,integer) from public, anon, authenticated;
revoke all on function public.square_store_catalog_objects(text,jsonb) from public, anon, authenticated;
revoke all on function public.square_finish_catalog_sync(text,uuid,timestamptz,text) from public, anon, authenticated;
grant execute on function public.square_claim_webhook_event(text,text,text,text,timestamptz) to service_role;
grant execute on function public.square_acquire_sync_lease(text,integer) to service_role;
grant execute on function public.square_store_catalog_objects(text,jsonb) to service_role;
grant execute on function public.square_finish_catalog_sync(text,uuid,timestamptz,text) to service_role;
