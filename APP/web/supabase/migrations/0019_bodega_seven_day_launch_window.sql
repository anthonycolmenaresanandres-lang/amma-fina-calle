-- Prepared only. Do not apply or activate without the launch date, staff access,
-- inventory and official-rules checks. The selected allowance is five per day.
alter table public.bodega_reward_campaigns
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz;

alter table public.bodega_reward_campaigns
  drop constraint if exists bodega_reward_campaigns_window_check;
alter table public.bodega_reward_campaigns
  add constraint bodega_reward_campaigns_window_check
  check (ends_at is null or (starts_at is not null and ends_at > starts_at));

update public.bodega_reward_campaigns
set active = false, daily_limit = 5
where id = 'bodega-muffin-v1';

create or replace function public.bodega_start_round(p_guest_hash text, p_secret_hash text, p_seed bigint)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  campaign public.bodega_reward_campaigns%rowtype;
  session_row public.bodega_reward_sessions%rowtype;
  midnight timestamptz := (date_trunc('day', now() at time zone 'America/New_York') + interval '1 day') at time zone 'America/New_York';
  day_start timestamptz := date_trunc('day', now() at time zone 'America/New_York') at time zone 'America/New_York';
  entry_closes timestamptz;
  used integer;
  reserved integer;
begin
  select * into campaign from public.bodega_reward_campaigns where id = 'bodega-muffin-v1' for update;
  if not found then return jsonb_build_object('status', 'closed'); end if;
  entry_closes := least(midnight, campaign.ends_at);
  if not campaign.active or campaign.daily_limit < 1
    or campaign.starts_at is null or campaign.ends_at is null
    or now() < campaign.starts_at or now() >= campaign.ends_at
    or entry_closes - now() < interval '2 minutes' then
    return jsonb_build_object('status', 'closed');
  end if;
  if exists(select 1 from public.bodega_reward_claims where campaign_id = campaign.id and guest_hash = p_guest_hash) then
    return jsonb_build_object('status', 'already_earned');
  end if;
  if exists(select 1 from public.bodega_reward_sessions where campaign_id = campaign.id and guest_hash = p_guest_hash and created_at > now() - interval '30 seconds') then
    return jsonb_build_object('status', 'wait');
  end if;
  update public.bodega_reward_sessions set finished = true
    where campaign_id = campaign.id and guest_hash = p_guest_hash and not finished;
  select count(*) into used from public.bodega_reward_claims where campaign_id = campaign.id and issued_at >= day_start;
  select count(*) into reserved from public.bodega_reward_sessions where campaign_id = campaign.id and not finished and expires_at > now();
  if used + reserved >= campaign.daily_limit then return jsonb_build_object('status', 'full'); end if;
  insert into public.bodega_reward_sessions(campaign_id, guest_hash, secret_hash, seed, expires_at)
    values(campaign.id, p_guest_hash, p_secret_hash, p_seed, least(now() + interval '10 minutes', entry_closes))
    returning * into session_row;
  return jsonb_build_object('status', 'started', 'id', session_row.id, 'seed', session_row.seed, 'expiresAt', session_row.expires_at);
end;
$$;
revoke all on function public.bodega_start_round(text,text,bigint) from public, anon, authenticated;
grant execute on function public.bodega_start_round(text,text,bigint) to service_role;

create or replace function public.bodega_finish_round(p_secret_hash text, p_token_hash text, p_score integer)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  session_row public.bodega_reward_sessions%rowtype;
  claim_row public.bodega_reward_claims%rowtype;
  campaign public.bodega_reward_campaigns%rowtype;
  midnight timestamptz := (date_trunc('day', now() at time zone 'America/New_York') + interval '1 day') at time zone 'America/New_York';
begin
  select * into campaign from public.bodega_reward_campaigns where id = 'bodega-muffin-v1' for update;
  select * into session_row from public.bodega_reward_sessions where secret_hash = p_secret_hash for update;
  if not found then return jsonb_build_object('status', 'invalid'); end if;
  select * into claim_row from public.bodega_reward_claims where session_id = session_row.id;
  if found then
    return jsonb_build_object('status', case when claim_row.redeemed_at is not null then 'redeemed' when claim_row.expires_at <= now() then 'expired' else 'valid' end, 'expiresAt', claim_row.expires_at);
  end if;
  if session_row.finished or session_row.expires_at <= now() then return jsonb_build_object('status', 'expired'); end if;
  if now() < session_row.created_at + interval '50 seconds' or p_score is null or p_score not between -10000 and 20000 then
    return jsonb_build_object('status', 'invalid');
  end if;
  update public.bodega_reward_sessions set finished = true, score = p_score where id = session_row.id;
  if p_score < 510 then return jsonb_build_object('status', 'lost'); end if;
  insert into public.bodega_reward_claims(session_id, campaign_id, guest_hash, token_hash, expires_at)
    values(session_row.id, session_row.campaign_id, session_row.guest_hash, p_token_hash, least(midnight, campaign.ends_at))
    on conflict(campaign_id, guest_hash) do nothing returning * into claim_row;
  if not found then return jsonb_build_object('status', 'already_earned'); end if;
  return jsonb_build_object('status', 'valid', 'expiresAt', claim_row.expires_at);
end;
$$;
revoke all on function public.bodega_finish_round(text,text,integer) from public, anon, authenticated;
grant execute on function public.bodega_finish_round(text,text,integer) to service_role;
