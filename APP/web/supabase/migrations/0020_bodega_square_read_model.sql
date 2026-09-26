-- Prepared only. This schema stores a read-only mirror of selected Square data.
-- Applying it does not connect Square, request permissions or publish menu edits.
create table public.square_connections (
  restaurant_id text primary key,
  merchant_id text not null unique,
  location_id text,
  environment text not null check (environment in ('sandbox', 'production')),
  last_catalog_time timestamptz,
  last_synced_at timestamptz,
  last_error text,
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

create table public.square_sync_runs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id text not null,
  trigger_event_id text,
  status text not null check (status in ('running', 'complete', 'failed')),
  object_count integer not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error text
);

alter table public.square_connections enable row level security;
alter table public.square_catalog_objects enable row level security;
alter table public.square_webhook_events enable row level security;
alter table public.square_sync_runs enable row level security;

revoke all on public.square_connections, public.square_catalog_objects, public.square_webhook_events, public.square_sync_runs from public, anon, authenticated;
grant all on public.square_connections, public.square_catalog_objects, public.square_webhook_events, public.square_sync_runs to service_role;
