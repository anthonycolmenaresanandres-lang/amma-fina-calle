-- Fina Calle OS - Coach Ops internal demo.
-- Hidden-link MVP for volleyball coaches/team owners. Uses security-definer
-- functions instead of exposing direct table access. Apply manually after 0009.

create table if not exists public.coach_orgs (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  sport       text not null default 'Volleyball',
  venue_name  text,
  is_demo     boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.coach_teams (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.coach_orgs(id) on delete cascade,
  name         text not null,
  age_group    text,
  season_label text,
  created_at   timestamptz not null default now(),
  unique (org_id, name)
);

create table if not exists public.coach_players (
  id            uuid primary key default gen_random_uuid(),
  team_id       uuid not null references public.coach_teams(id) on delete cascade,
  full_name     text not null,
  position      text,
  jersey_number text,
  status        text not null default 'active'
    check (status in ('active', 'inactive', 'trial')),
  notes         text,
  created_at    timestamptz not null default now()
);

create table if not exists public.coach_payment_records (
  id            uuid primary key default gen_random_uuid(),
  player_id     uuid not null references public.coach_players(id) on delete cascade,
  period_label  text not null default 'Current month',
  monthly_due   numeric(10,2) not null default 0,
  amount_paid   numeric(10,2) not null default 0,
  status        text not null default 'overdue'
    check (status in ('paid', 'partial', 'overdue', 'comped')),
  notes         text,
  updated_at    timestamptz not null default now(),
  unique (player_id, period_label)
);

create table if not exists public.coach_sessions (
  id           uuid primary key default gen_random_uuid(),
  team_id      uuid not null references public.coach_teams(id) on delete cascade,
  session_date date not null,
  title        text not null,
  session_type text not null default 'training',
  starts_at    text,
  location     text,
  created_at   timestamptz not null default now()
);

create table if not exists public.coach_attendance (
  session_id uuid not null references public.coach_sessions(id) on delete cascade,
  player_id  uuid not null references public.coach_players(id) on delete cascade,
  status     text not null default 'unmarked'
    check (status in ('present', 'absent', 'late', 'excused', 'unmarked')),
  note       text,
  updated_at timestamptz not null default now(),
  primary key (session_id, player_id)
);

create table if not exists public.coach_notes (
  id         uuid primary key default gen_random_uuid(),
  player_id  uuid not null references public.coach_players(id) on delete cascade,
  category   text not null default 'coach note',
  note       text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_coach_orgs_slug on public.coach_orgs(slug);
create index if not exists idx_coach_teams_org on public.coach_teams(org_id);
create index if not exists idx_coach_players_team on public.coach_players(team_id);
create index if not exists idx_coach_payments_player on public.coach_payment_records(player_id);
create index if not exists idx_coach_sessions_team_date on public.coach_sessions(team_id, session_date desc);
create index if not exists idx_coach_notes_player_date on public.coach_notes(player_id, created_at desc);

alter table public.coach_orgs enable row level security;
alter table public.coach_teams enable row level security;
alter table public.coach_players enable row level security;
alter table public.coach_payment_records enable row level security;
alter table public.coach_sessions enable row level security;
alter table public.coach_attendance enable row level security;
alter table public.coach_notes enable row level security;

create or replace function public.get_coach_ops_demo(p_demo_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with org as (
    select * from public.coach_orgs where slug = p_demo_slug and is_demo = true
  )
  select jsonb_build_object(
    'org', (
      select jsonb_build_object(
        'id', id,
        'slug', slug,
        'name', name,
        'sport', sport,
        'venueName', venue_name
      )
      from org
    ),
    'teams', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'ageGroup', t.age_group,
        'seasonLabel', t.season_label
      ) order by t.name)
      from public.coach_teams t
      join org on org.id = t.org_id
    ), '[]'::jsonb),
    'players', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id,
        'teamId', p.team_id,
        'teamName', t.name,
        'fullName', p.full_name,
        'position', p.position,
        'jerseyNumber', p.jersey_number,
        'status', p.status,
        'notes', p.notes,
        'payment', (
          select jsonb_build_object(
            'id', pr.id,
            'periodLabel', pr.period_label,
            'monthlyDue', pr.monthly_due,
            'amountPaid', pr.amount_paid,
            'balance', greatest(pr.monthly_due - pr.amount_paid, 0),
            'status', pr.status,
            'notes', pr.notes,
            'updatedAt', pr.updated_at
          )
          from public.coach_payment_records pr
          where pr.player_id = p.id
          order by pr.updated_at desc
          limit 1
        )
      ) order by p.full_name)
      from public.coach_players p
      join public.coach_teams t on t.id = p.team_id
      join org on org.id = t.org_id
    ), '[]'::jsonb),
    'sessions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id,
        'teamId', s.team_id,
        'title', s.title,
        'sessionDate', s.session_date,
        'sessionType', s.session_type,
        'startsAt', s.starts_at,
        'location', s.location
      ) order by s.session_date desc)
      from public.coach_sessions s
      join public.coach_teams t on t.id = s.team_id
      join org on org.id = t.org_id
    ), '[]'::jsonb),
    'attendance', coalesce((
      select jsonb_agg(jsonb_build_object(
        'sessionId', a.session_id,
        'playerId', a.player_id,
        'status', a.status,
        'note', a.note,
        'updatedAt', a.updated_at
      ))
      from public.coach_attendance a
      join public.coach_sessions s on s.id = a.session_id
      join public.coach_teams t on t.id = s.team_id
      join org on org.id = t.org_id
    ), '[]'::jsonb),
    'notes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', n.id,
        'playerId', n.player_id,
        'playerName', p.full_name,
        'category', n.category,
        'note', n.note,
        'createdAt', n.created_at
      ) order by n.created_at desc)
      from public.coach_notes n
      join public.coach_players p on p.id = n.player_id
      join public.coach_teams t on t.id = p.team_id
      join org on org.id = t.org_id
      limit 30
    ), '[]'::jsonb)
  )
  where exists (select 1 from org);
$$;

create or replace function public.upsert_coach_player_payment(
  p_demo_slug text,
  p_player_id uuid,
  p_full_name text,
  p_position text,
  p_jersey_number text,
  p_player_notes text,
  p_period_label text,
  p_monthly_due numeric,
  p_amount_paid numeric,
  p_payment_status text,
  p_payment_notes text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_id uuid;
  v_player_id uuid := p_player_id;
begin
  select t.id into v_team_id
  from public.coach_teams t
  join public.coach_orgs o on o.id = t.org_id
  where o.slug = p_demo_slug and o.is_demo = true
  order by t.created_at
  limit 1;

  if v_team_id is null then
    raise exception 'coach demo not found' using errcode = '02000';
  end if;

  if trim(coalesce(p_full_name, '')) = '' then
    raise exception 'player name is required' using errcode = '22023';
  end if;

  if p_payment_status not in ('paid', 'partial', 'overdue', 'comped') then
    raise exception 'invalid payment status' using errcode = '22023';
  end if;

  if v_player_id is null then
    select p.id into v_player_id
    from public.coach_players p
    where p.team_id = v_team_id and lower(p.full_name) = lower(trim(p_full_name))
    limit 1;
  end if;

  if v_player_id is null then
    insert into public.coach_players (team_id, full_name, position, jersey_number, notes)
    values (v_team_id, trim(p_full_name), nullif(trim(coalesce(p_position, '')), ''),
            nullif(trim(coalesce(p_jersey_number, '')), ''), nullif(trim(coalesce(p_player_notes, '')), ''))
    returning id into v_player_id;
  else
    update public.coach_players
    set full_name = trim(p_full_name),
        position = nullif(trim(coalesce(p_position, '')), ''),
        jersey_number = nullif(trim(coalesce(p_jersey_number, '')), ''),
        notes = nullif(trim(coalesce(p_player_notes, '')), '')
    where id = v_player_id and team_id = v_team_id;
  end if;

  insert into public.coach_payment_records
    (player_id, period_label, monthly_due, amount_paid, status, notes)
  values
    (v_player_id, coalesce(nullif(trim(p_period_label), ''), 'Current month'),
     greatest(coalesce(p_monthly_due, 0), 0), greatest(coalesce(p_amount_paid, 0), 0),
     p_payment_status, nullif(trim(coalesce(p_payment_notes, '')), ''))
  on conflict (player_id, period_label) do update set
    monthly_due = excluded.monthly_due,
    amount_paid = excluded.amount_paid,
    status = excluded.status,
    notes = excluded.notes,
    updated_at = now();
end;
$$;

create or replace function public.import_coach_roster_payments(
  p_demo_slug text,
  p_rows jsonb
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row jsonb;
  v_count int := 0;
  v_due numeric;
  v_paid numeric;
  v_status text;
begin
  if jsonb_typeof(p_rows) <> 'array' then
    raise exception 'rows must be a JSON array' using errcode = '22023';
  end if;

  for v_row in select * from jsonb_array_elements(p_rows)
  loop
    if trim(coalesce(v_row->>'playerName', '')) <> '' then
      v_due := coalesce(nullif(v_row->>'monthlyDue', '')::numeric, 0);
      v_paid := coalesce(nullif(v_row->>'amountPaid', '')::numeric, 0);
      v_status := lower(coalesce(nullif(v_row->>'status', ''), ''));
      if v_status not in ('paid', 'partial', 'overdue', 'comped') then
        v_status := case
          when v_due = 0 then 'comped'
          when v_paid >= v_due then 'paid'
          when v_paid > 0 then 'partial'
          else 'overdue'
        end;
      end if;

      perform public.upsert_coach_player_payment(
        p_demo_slug,
        null,
        v_row->>'playerName',
        v_row->>'position',
        v_row->>'jerseyNumber',
        v_row->>'notes',
        coalesce(nullif(v_row->>'periodLabel', ''), 'Current month'),
        v_due,
        v_paid,
        v_status,
        v_row->>'paymentNotes'
      );
      v_count := v_count + 1;
    end if;
  end loop;

  return v_count;
end;
$$;

create or replace function public.set_coach_attendance_status(
  p_demo_slug text,
  p_session_id uuid,
  p_player_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('present', 'absent', 'late', 'excused', 'unmarked') then
    raise exception 'invalid attendance status' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.coach_sessions s
    join public.coach_teams t on t.id = s.team_id
    join public.coach_orgs o on o.id = t.org_id
    join public.coach_players p on p.id = p_player_id and p.team_id = t.id
    where o.slug = p_demo_slug and o.is_demo = true and s.id = p_session_id
  ) then
    raise exception 'coach demo/session/player not found' using errcode = '02000';
  end if;

  insert into public.coach_attendance (session_id, player_id, status)
  values (p_session_id, p_player_id, p_status)
  on conflict (session_id, player_id) do update set
    status = excluded.status,
    updated_at = now();
end;
$$;

create or replace function public.add_coach_player_note(
  p_demo_slug text,
  p_player_id uuid,
  p_category text,
  p_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if trim(coalesce(p_note, '')) = '' then
    raise exception 'note is required' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.coach_players p
    join public.coach_teams t on t.id = p.team_id
    join public.coach_orgs o on o.id = t.org_id
    where o.slug = p_demo_slug and o.is_demo = true and p.id = p_player_id
  ) then
    raise exception 'coach demo/player not found' using errcode = '02000';
  end if;

  insert into public.coach_notes (player_id, category, note)
  values (p_player_id, coalesce(nullif(trim(p_category), ''), 'coach note'), trim(p_note));
end;
$$;

grant execute on function public.get_coach_ops_demo(text) to anon, authenticated;
grant execute on function public.upsert_coach_player_payment(text, uuid, text, text, text, text, text, numeric, numeric, text, text) to anon, authenticated;
grant execute on function public.import_coach_roster_payments(text, jsonb) to anon, authenticated;
grant execute on function public.set_coach_attendance_status(text, uuid, uuid, text) to anon, authenticated;
grant execute on function public.add_coach_player_note(text, uuid, text, text) to anon, authenticated;

do $$
declare
  v_org_id uuid;
  v_team_id uuid;
begin
  insert into public.coach_orgs (slug, name, sport, venue_name, is_demo)
  values ('vb-fieldhouse-volleyball', 'VB Field House Volleyball Demo', 'Volleyball', 'Virginia Beach Field House', true)
  on conflict (slug) do update set
    name = excluded.name,
    sport = excluded.sport,
    venue_name = excluded.venue_name
  returning id into v_org_id;

  insert into public.coach_teams (org_id, name, age_group, season_label)
  values (v_org_id, 'VBFH 16U Girls', '16U', 'Summer training block')
  on conflict (org_id, name) do update set
    age_group = excluded.age_group,
    season_label = excluded.season_label
  returning id into v_team_id;
end $$;

do $$
declare
  v_team_id uuid;
begin
  select t.id into v_team_id
  from public.coach_teams t
  join public.coach_orgs o on o.id = t.org_id
  where o.slug = 'vb-fieldhouse-volleyball'
  order by t.created_at
  limit 1;

  if v_team_id is not null and not exists (select 1 from public.coach_players where team_id = v_team_id) then
    perform public.upsert_coach_player_payment('vb-fieldhouse-volleyball', null, 'Avery Demo', 'Setter', '7', 'Fast hands; leadership candidate.', 'June 2026', 180, 180, 'paid', 'Paid in full');
    perform public.upsert_coach_player_payment('vb-fieldhouse-volleyball', null, 'Riley Demo', 'Outside', '12', 'Needs serve-receive reps.', 'June 2026', 180, 90, 'partial', 'Half payment received');
    perform public.upsert_coach_player_payment('vb-fieldhouse-volleyball', null, 'Jordan Demo', 'Libero', '3', 'Trial player; confirm package.', 'June 2026', 180, 0, 'overdue', 'Waiting on payment');

    insert into public.coach_sessions (team_id, session_date, title, session_type, starts_at, location)
    values
      (v_team_id, current_date, 'Serve receive + transition', 'training', '7:30 PM', 'Court 4'),
      (v_team_id, current_date + 3, 'Private group reps', 'training', '8:00 PM', 'Court 5');
  end if;
end $$;
