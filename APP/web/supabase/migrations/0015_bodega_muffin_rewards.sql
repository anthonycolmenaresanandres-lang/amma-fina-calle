-- Prepared only: do not apply to a live database without explicit approval.
-- No accounts/allowlists are created. Campaign starts disabled.
create table public.bodega_reward_campaigns (
  id text primary key,
  active boolean not null default false,
  daily_limit integer not null default 0 check (daily_limit between 0 and 10000)
);
insert into public.bodega_reward_campaigns(id) values ('bodega-muffin-v1');

create table public.bodega_reward_sessions (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null references public.bodega_reward_campaigns(id),
  guest_hash text not null check (guest_hash ~ '^[a-f0-9]{64}$'),
  secret_hash text not null unique check (secret_hash ~ '^[a-f0-9]{64}$'),
  seed bigint not null check (seed between 0 and 4294967295),
  version integer not null default 2 check (version = 2),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  finished boolean not null default false,
  score integer
);
create index bodega_sessions_guest on public.bodega_reward_sessions(campaign_id, guest_hash, created_at desc);
create index bodega_sessions_reservations on public.bodega_reward_sessions(campaign_id, expires_at) where not finished;

create table public.bodega_reward_claims (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.bodega_reward_sessions(id),
  campaign_id text not null references public.bodega_reward_campaigns(id),
  guest_hash text not null,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  redeemed_by uuid,
  unique(campaign_id, guest_hash)
);
create index bodega_claims_day on public.bodega_reward_claims(campaign_id, issued_at);

alter table public.bodega_reward_campaigns enable row level security;
alter table public.bodega_reward_sessions enable row level security;
alter table public.bodega_reward_claims enable row level security;
revoke all on public.bodega_reward_campaigns, public.bodega_reward_sessions, public.bodega_reward_claims from public, anon, authenticated;
grant all on public.bodega_reward_campaigns, public.bodega_reward_sessions, public.bodega_reward_claims to service_role;

-- Campaign-row locking serializes capacity reservations across instances.
create function public.bodega_start_round(p_guest_hash text, p_secret_hash text, p_seed bigint)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  c public.bodega_reward_campaigns%rowtype;
  s public.bodega_reward_sessions%rowtype;
  midnight timestamptz := (date_trunc('day', now() at time zone 'America/New_York') + interval '1 day') at time zone 'America/New_York';
  day_start timestamptz := date_trunc('day', now() at time zone 'America/New_York') at time zone 'America/New_York';
  used integer;
  reserved integer;
begin
  select * into c from public.bodega_reward_campaigns where id = 'bodega-muffin-v1' for update;
  if not found or not c.active or c.daily_limit < 1 or midnight - now() < interval '12 minutes' then
    return jsonb_build_object('status', 'closed');
  end if;
  if exists(select 1 from public.bodega_reward_claims where campaign_id = c.id and guest_hash = p_guest_hash) then
    return jsonb_build_object('status', 'already_earned');
  end if;
  if exists(select 1 from public.bodega_reward_sessions where campaign_id = c.id and guest_hash = p_guest_hash and created_at > now() - interval '30 seconds') then
    return jsonb_build_object('status', 'wait');
  end if;
  -- A new round supersedes this browser's interrupted round, never its issued claim.
  update public.bodega_reward_sessions set finished = true
    where campaign_id = c.id and guest_hash = p_guest_hash and not finished;
  select count(*) into used from public.bodega_reward_claims where campaign_id = c.id and issued_at >= day_start;
  select count(*) into reserved from public.bodega_reward_sessions where campaign_id = c.id and not finished and expires_at > now();
  if used + reserved >= c.daily_limit then return jsonb_build_object('status', 'full'); end if;
  insert into public.bodega_reward_sessions(campaign_id, guest_hash, secret_hash, seed, expires_at)
    values(c.id, p_guest_hash, p_secret_hash, p_seed, least(now() + interval '45 minutes', midnight))
    returning * into s;
  return jsonb_build_object('status', 'started', 'id', s.id, 'seed', s.seed, 'expiresAt', s.expires_at);
end;
$$;
revoke all on function public.bodega_start_round(text,text,bigint) from public, anon, authenticated;
grant execute on function public.bodega_start_round(text,text,bigint) to service_role;

-- Only the server verifier can invoke this function. Browser scores never reach it directly.
create function public.bodega_finish_round(p_secret_hash text, p_token_hash text, p_score integer)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  s public.bodega_reward_sessions%rowtype;
  c public.bodega_reward_claims%rowtype;
  midnight timestamptz := (date_trunc('day', now() at time zone 'America/New_York') + interval '1 day') at time zone 'America/New_York';
begin
  -- Use the same campaign -> session lock order as start. Otherwise a finish
  -- between its claim/reservation counts could briefly undercount the allowance.
  perform 1 from public.bodega_reward_campaigns where id = 'bodega-muffin-v1' for update;
  select * into s from public.bodega_reward_sessions where secret_hash = p_secret_hash for update;
  if not found then return jsonb_build_object('status', 'invalid'); end if;
  select * into c from public.bodega_reward_claims where session_id = s.id;
  if found then
    return jsonb_build_object('status', case when c.redeemed_at is not null then 'redeemed' when c.expires_at <= now() then 'expired' else 'valid' end, 'expiresAt', c.expires_at);
  end if;
  if s.finished or s.expires_at <= now() then return jsonb_build_object('status', 'expired'); end if;
  if now() < s.created_at + interval '10 minutes' or p_score is null or p_score not between -10000 and 20000 then
    return jsonb_build_object('status', 'invalid');
  end if;
  update public.bodega_reward_sessions set finished = true, score = p_score where id = s.id;
  if p_score < 920 then return jsonb_build_object('status', 'lost'); end if;
  insert into public.bodega_reward_claims(session_id, campaign_id, guest_hash, token_hash, expires_at)
    values(s.id, s.campaign_id, s.guest_hash, p_token_hash, midnight)
    on conflict(campaign_id, guest_hash) do nothing returning * into c;
  if not found then return jsonb_build_object('status', 'already_earned'); end if;
  return jsonb_build_object('status', 'valid', 'expiresAt', c.expires_at);
end;
$$;
revoke all on function public.bodega_finish_round(text,text,integer) from public, anon, authenticated;
grant execute on function public.bodega_finish_round(text,text,integer) to service_role;

-- Staff authentication is checked again inside the database, including direct RPC calls.
-- The lock + status check makes simultaneous redemptions yield exactly one success.
create function public.bodega_redeem_muffin(p_token_hash text, p_consume boolean default false)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare c public.bodega_reward_claims%rowtype;
begin
  if auth.uid() is null or not public.is_owner_email('bodega')
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'owner_password_reset_required', 'false') = 'true' then
    raise exception 'Bodega staff authorization required' using errcode = '42501';
  end if;
  select * into c from public.bodega_reward_claims where token_hash = p_token_hash for update;
  if not found then return jsonb_build_object('status', 'invalid'); end if;
  if c.redeemed_at is not null then return jsonb_build_object('status', 'already_redeemed'); end if;
  if c.expires_at <= now() then return jsonb_build_object('status', 'expired'); end if;
  if p_consume then
    update public.bodega_reward_claims set redeemed_at = now(), redeemed_by = auth.uid() where id = c.id;
    return jsonb_build_object('status', 'redeemed', 'quantity', 1);
  end if;
  return jsonb_build_object('status', 'valid', 'quantity', 1, 'expiresAt', c.expires_at);
end;
$$;
revoke all on function public.bodega_redeem_muffin(text,boolean) from public, anon;
grant execute on function public.bodega_redeem_muffin(text,boolean) to authenticated;
