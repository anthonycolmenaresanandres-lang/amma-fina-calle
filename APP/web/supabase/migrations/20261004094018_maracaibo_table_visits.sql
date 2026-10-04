-- Game membership only. These records never authorize ordering or payment.
create table public.maracaibo_table_visits (
  table_id text primary key check (table_id ~ '^[a-z0-9][a-z0-9-]{0,19}$'),
  visit_id uuid not null default gen_random_uuid(),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 minutes',
  closed_at timestamptz
);
create table public.maracaibo_table_guests (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  guest_id uuid not null default gen_random_uuid(),
  table_id text not null references public.maracaibo_table_visits(table_id),
  visit_id uuid not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 minutes',
  revoked boolean not null default false
);
create index maracaibo_guests_table_visit on public.maracaibo_table_guests(table_id, visit_id);
alter table public.maracaibo_table_visits enable row level security;
alter table public.maracaibo_table_guests enable row level security;
revoke all on public.maracaibo_table_visits, public.maracaibo_table_guests from public, anon, authenticated;
grant select, insert, update, delete on public.maracaibo_table_visits, public.maracaibo_table_guests to service_role;

-- Invoker, service role only. The HTTP boundary checks guest cookies or staff
-- authorization; one row lock serializes join, leave, expiry and staff reset.
create function public.maracaibo_visit(
  p_table text, p_action text, p_hash text default null,
  p_active boolean default false, p_expected uuid default null
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v public.maracaibo_table_visits%rowtype;
  g public.maracaibo_table_guests%rowtype;
  t timestamptz := clock_timestamp();
begin
  if p_table is null or p_table !~ '^[a-z0-9][a-z0-9-]{0,19}$'
    or p_action is null or p_action not in ('join', 'resume', 'ping', 'leave', 'reset') then
    return jsonb_build_object('status', 'invalid');
  end if;
  if p_action = 'join' then
    insert into public.maracaibo_table_visits(table_id) values (p_table) on conflict do nothing;
  end if;
  select * into v from public.maracaibo_table_visits where table_id = p_table for update;
  if not found then return jsonb_build_object('status', 'ended'); end if;
  if p_action = 'reset' then
    if p_expected is null or p_expected <> v.visit_id then
      return jsonb_build_object('status', 'changed');
    end if;
    update public.maracaibo_table_visits set closed_at = t where table_id = p_table;
    update public.maracaibo_table_guests set revoked = true where table_id = p_table;
    return jsonb_build_object('status', 'ended');
  end if;
  if p_hash is null or p_hash !~ '^[a-f0-9]{64}$' then
    return jsonb_build_object('status', 'invalid');
  end if;
  select * into g from public.maracaibo_table_guests where token_hash = p_hash and table_id = p_table;
  if p_action = 'leave' then
    update public.maracaibo_table_guests set revoked = true where token_hash = p_hash and table_id = p_table;
    if not exists (select 1 from public.maracaibo_table_guests where table_id = p_table
      and visit_id = v.visit_id and not revoked and expires_at > t) then
      update public.maracaibo_table_visits set closed_at = t where table_id = p_table;
    end if;
    return jsonb_build_object('status', 'ended');
  end if;
  if p_action <> 'join' or g.token_hash is not null then
    if g.token_hash is null or g.revoked or g.visit_id <> v.visit_id or g.expires_at <= t
      or v.closed_at is not null or v.expires_at <= t or v.started_at + interval '4 hours' <= t then
      return jsonb_build_object('status', 'ended');
    end if;
  else
    if v.closed_at is not null or v.expires_at <= t or v.started_at + interval '4 hours' <= t then
      update public.maracaibo_table_visits set visit_id = gen_random_uuid(), started_at = t,
        expires_at = t + interval '30 minutes', closed_at = null where table_id = p_table returning * into v;
    end if;
    -- Bounded occupancy; viewing the menu never consumes one of four game seats.
    if (select count(*) from public.maracaibo_table_guests where table_id = p_table
      and visit_id = v.visit_id and not revoked and expires_at > t) >= 32 then
      return jsonb_build_object('status', 'full');
    end if;
    delete from public.maracaibo_table_guests where table_id = p_table and created_at < t - interval '1 day';
    insert into public.maracaibo_table_guests(token_hash, table_id, visit_id, expires_at)
      values (p_hash, p_table, v.visit_id, least(t + interval '30 minutes', v.started_at + interval '4 hours')) returning * into g;
    p_active := true;
  end if;
  if p_active then
    update public.maracaibo_table_guests set expires_at = least(t + interval '30 minutes', v.started_at + interval '4 hours')
      where token_hash = p_hash returning * into g;
    update public.maracaibo_table_visits set expires_at = greatest(expires_at, g.expires_at) where table_id = p_table;
  end if;
  return jsonb_build_object('status', 'active', 'visitId', v.visit_id, 'guestId', g.guest_id,
    'expiresAt', g.expires_at, 'tableId', p_table);
end;
$$;
revoke all on function public.maracaibo_visit(text,text,text,boolean,uuid) from public, anon, authenticated;
grant execute on function public.maracaibo_visit(text,text,text,boolean,uuid) to service_role;
