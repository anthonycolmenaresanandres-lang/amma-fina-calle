-- Prepared only. Keep the promotion inactive with daily_limit = 0 until Anthony selects a cap.
-- Existing version-2 rows may remain for audit, but new sessions use the ten-second-round contract.
alter table public.bodega_reward_sessions drop constraint if exists bodega_reward_sessions_version_check;
alter table public.bodega_reward_sessions add constraint bodega_reward_sessions_version_check check (version in (2, 3));
alter table public.bodega_reward_sessions alter column version set default 3;
-- Campaign-row locking serializes capacity reservations across instances.
create or replace function public.bodega_start_round(p_guest_hash text, p_secret_hash text, p_seed bigint)
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
  if not found or not c.active or c.daily_limit < 1 or midnight - now() < interval '2 minutes' then
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
    values(c.id, p_guest_hash, p_secret_hash, p_seed, least(now() + interval '10 minutes', midnight))
    returning * into s;
  return jsonb_build_object('status', 'started', 'id', s.id, 'seed', s.seed, 'expiresAt', s.expires_at);
end;
$$;
revoke all on function public.bodega_start_round(text,text,bigint) from public, anon, authenticated;
grant execute on function public.bodega_start_round(text,text,bigint) to service_role;

-- Only the server verifier can invoke this function. Browser scores never reach it directly.
create or replace function public.bodega_finish_round(p_secret_hash text, p_token_hash text, p_score integer)
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
  if now() < s.created_at + interval '50 seconds' or p_score is null or p_score not between -10000 and 20000 then
    return jsonb_build_object('status', 'invalid');
  end if;
  update public.bodega_reward_sessions set finished = true, score = p_score where id = s.id;
  if p_score < 510 then return jsonb_build_object('status', 'lost'); end if;
  insert into public.bodega_reward_claims(session_id, campaign_id, guest_hash, token_hash, expires_at)
    values(s.id, s.campaign_id, s.guest_hash, p_token_hash, midnight)
    on conflict(campaign_id, guest_hash) do nothing returning * into c;
  if not found then return jsonb_build_object('status', 'already_earned'); end if;
  return jsonb_build_object('status', 'valid', 'expiresAt', c.expires_at);
end;
$$;
revoke all on function public.bodega_finish_round(text,text,integer) from public, anon, authenticated;
grant execute on function public.bodega_finish_round(text,text,integer) to service_role;
