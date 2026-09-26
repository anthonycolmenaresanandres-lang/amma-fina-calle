-- Prepared only. Additive cleanup after 0020 and 0021; never activates Square or rewards.
-- Disconnect removes the cached catalog in the SAME transaction as credentials.
delete from public.square_catalog_objects o
where not exists (select 1 from public.square_connections c where c.restaurant_id = o.restaurant_id);
alter table public.square_catalog_objects
  add constraint square_catalog_connection_fk foreign key (restaurant_id)
  references public.square_connections(restaurant_id) on delete cascade;
alter table public.square_connections
  add column connection_generation uuid not null default gen_random_uuid();

-- A fresh authorization replaces the old snapshot, even after a prior disconnect.
-- Unique-merchant or validation failures roll back BOTH deletion and replacement.
create or replace function public.square_replace_oauth_connection(p_connection jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_restaurant text := p_connection->>'restaurant_id';
  v_generation uuid := gen_random_uuid();
begin
  if v_restaurant is null or v_restaurant !~ '^[a-z0-9][a-z0-9-]{0,63}$' then
    raise exception 'invalid restaurant';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('square:' || v_restaurant, 0));
  delete from public.square_connections where restaurant_id = v_restaurant;
  insert into public.square_connections (
    restaurant_id, merchant_id, merchant_name, location_id, environment,
    access_token_ciphertext, refresh_token_ciphertext, token_expires_at,
    token_refreshed_at, scopes, connected_at, connection_generation
  ) values (
    v_restaurant, p_connection->>'merchant_id', p_connection->>'merchant_name',
    p_connection->>'location_id', p_connection->>'environment',
    p_connection->>'access_token_ciphertext', p_connection->>'refresh_token_ciphertext',
    (p_connection->>'token_expires_at')::timestamptz, now(),
    array(select jsonb_array_elements_text(p_connection->'scopes')), now(), v_generation
  );
  return v_generation;
end;
$$;

-- Fencing stops an old HTTP sync from repopulating a newly reconnected restaurant.
create or replace function public.square_store_catalog_page(
  p_restaurant_id text, p_lease_token uuid, p_connection_generation uuid, p_objects jsonb
) returns integer language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.square_connections
   where restaurant_id = p_restaurant_id
     and connection_generation = p_connection_generation
     and sync_lease_token = p_lease_token
     and sync_lease_until > clock_timestamp()
   for update;
  if not found then raise exception 'stale Square sync lease' using errcode = '40001'; end if;
  update public.square_connections set sync_lease_until = clock_timestamp() + interval '180 seconds'
   where restaurant_id = p_restaurant_id;
  return public.square_store_catalog_objects(p_restaurant_id, p_objects);
end;
$$;

revoke all on function public.square_replace_oauth_connection(jsonb) from public, anon, authenticated;
revoke all on function public.square_store_catalog_page(text,uuid,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.square_replace_oauth_connection(jsonb) to service_role;
grant execute on function public.square_store_catalog_page(text,uuid,uuid,jsonb) to service_role;

create index public_intake_rate_limit_expiry on public.public_intake_rate_limits(updated_at);

-- Five notes per trusted client address and 300 globally per ten-minute window.
-- The global row also serializes the two-bucket decision. A rejected client never
-- increments the global counter; a full global budget never creates new client rows.
create or replace function public.consume_bodega_guest_note_limits(p_client_key text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_now timestamptz;
  v_global public.public_intake_rate_limits%rowtype;
  v_client public.public_intake_rate_limits%rowtype;
  v_key text := 'bodega-guest-notes-client:' || p_client_key;
  v_retry integer;
begin
  if p_client_key is null or p_client_key !~ '^[a-f0-9]{64}$' then raise exception 'invalid client key'; end if;
  insert into public.public_intake_rate_limits(limiter_key, window_started_at, request_count)
    values ('bodega-guest-notes-global', clock_timestamp(), 0) on conflict do nothing;
  select * into v_global from public.public_intake_rate_limits
    where limiter_key = 'bodega-guest-notes-global' for update;
  v_now := clock_timestamp();
  -- Bounded retention work; no raw address or unlimited permanent client history.
  delete from public.public_intake_rate_limits where limiter_key in (
    select limiter_key from public.public_intake_rate_limits
    where limiter_key like 'bodega-guest-notes-client:%' and updated_at < v_now - interval '1 day'
    order by updated_at limit 100
  );
  if v_global.window_started_at <= v_now - interval '10 minutes' then
    v_global.window_started_at := v_now; v_global.request_count := 0;
  end if;
  if v_global.request_count >= 300 then
    v_retry := greatest(1, ceil(extract(epoch from (v_global.window_started_at + interval '10 minutes' - v_now)))::integer);
    return jsonb_build_object('allowed', false, 'retry_after', v_retry);
  end if;
  insert into public.public_intake_rate_limits(limiter_key, window_started_at, request_count)
    values (v_key, v_now, 0) on conflict do nothing;
  select * into v_client from public.public_intake_rate_limits where limiter_key = v_key for update;
  if v_client.window_started_at <= v_now - interval '10 minutes' then
    v_client.window_started_at := v_now; v_client.request_count := 0;
  end if;
  if v_client.request_count >= 5 then
    v_retry := greatest(1, ceil(extract(epoch from (v_client.window_started_at + interval '10 minutes' - v_now)))::integer);
    return jsonb_build_object('allowed', false, 'retry_after', v_retry);
  end if;
  update public.public_intake_rate_limits set window_started_at = v_global.window_started_at,
    request_count = v_global.request_count + 1, updated_at = v_now
    where limiter_key = 'bodega-guest-notes-global';
  update public.public_intake_rate_limits set window_started_at = v_client.window_started_at,
    request_count = v_client.request_count + 1, updated_at = v_now where limiter_key = v_key;
  return jsonb_build_object('allowed', true, 'retry_after', 0);
end;
$$;
revoke all on function public.consume_bodega_guest_note_limits(text) from public, anon, authenticated;
grant execute on function public.consume_bodega_guest_note_limits(text) to service_role;
