-- Durable global throttle for the public Bodega guest-note endpoint.
-- One fixed limiter key keeps the table bounded while protecting database and email side effects.
create table public.public_intake_rate_limits (
  limiter_key text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.public_intake_rate_limits enable row level security;
revoke all on public.public_intake_rate_limits from public, anon, authenticated;
grant all on public.public_intake_rate_limits to service_role;

create or replace function public.consume_public_intake_rate_limit(
  p_limiter_key text,
  p_limit integer,
  p_window_seconds integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_started timestamptz;
  v_count integer;
  v_retry_after integer;
begin
  if p_limiter_key is null or length(p_limiter_key) < 1 or length(p_limiter_key) > 120 then
    raise exception 'invalid limiter key';
  end if;
  if p_limit < 1 or p_limit > 10000 then
    raise exception 'invalid rate limit';
  end if;
  if p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid rate window';
  end if;

  insert into public.public_intake_rate_limits (
    limiter_key, window_started_at, request_count, updated_at
  ) values (
    p_limiter_key, v_now, 0, v_now
  )
  on conflict (limiter_key) do nothing;

  select window_started_at, request_count
    into v_started, v_count
    from public.public_intake_rate_limits
   where limiter_key = p_limiter_key
   for update;

  if v_started <= v_now - make_interval(secs => p_window_seconds) then
    update public.public_intake_rate_limits
       set window_started_at = v_now,
           request_count = 1,
           updated_at = v_now
     where limiter_key = p_limiter_key;
    return jsonb_build_object('allowed', true, 'remaining', p_limit - 1, 'retry_after', 0);
  end if;

  if v_count >= p_limit then
    v_retry_after := greatest(
      1,
      ceil(extract(epoch from (v_started + make_interval(secs => p_window_seconds) - v_now)))::integer
    );
    return jsonb_build_object('allowed', false, 'remaining', 0, 'retry_after', v_retry_after);
  end if;

  update public.public_intake_rate_limits
     set request_count = request_count + 1,
         updated_at = v_now
   where limiter_key = p_limiter_key;

  return jsonb_build_object(
    'allowed', true,
    'remaining', greatest(p_limit - (v_count + 1), 0),
    'retry_after', 0
  );
end;
$$;

revoke all on function public.consume_public_intake_rate_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_public_intake_rate_limit(text,integer,integer) to service_role;
