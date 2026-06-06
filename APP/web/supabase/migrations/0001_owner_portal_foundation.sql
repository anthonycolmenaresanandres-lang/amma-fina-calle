-- Fina Calle OS — Owner Portal Foundation (Pass 001)
-- Idempotent foundation migration: schema, RLS, and the audited write rail.
-- Apply via the Supabase SQL editor or `supabase db push`.

-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------

create table if not exists public.restaurants (
  id            text primary key,
  business_name text not null,
  plan          text not null default 'Starter',
  status        text not null default 'active',
  billing_status text not null default 'manual',
  site_url      text,
  contact_name  text,
  contact_email text,
  contact_phone text,
  notes         text,
  created_at    timestamptz not null default now()
);

create table if not exists public.owner_emails (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  email         text not null,
  role          text not null default 'owner',
  created_at    timestamptz not null default now(),
  unique (restaurant_id, email)
);

create table if not exists public.menu_categories (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  name          text not null,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.menu_categories(id) on delete cascade,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  name          text not null,
  description   text,
  price         numeric(10,2) not null default 0,
  photo_url     text,
  is_available  boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.hours (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  day_of_week   int not null check (day_of_week between 0 and 6), -- 0 = Sunday
  open_time     text,
  close_time    text,
  is_closed     boolean not null default false,
  unique (restaurant_id, day_of_week)
);

create table if not exists public.promos (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  text          text not null,
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.change_requests (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id text references public.restaurants(id) on delete set null,
  request_type  text,
  priority      text,
  message       text,
  contact_info  text,
  status        text not null default 'new',
  reference_id  text,
  created_at    timestamptz not null default now()
);

create table if not exists public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  actor_email   text,
  table_name    text not null,
  row_id        text not null,
  field_name    text not null,
  old_value     text,
  new_value     text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_menu_items_restaurant on public.menu_items(restaurant_id);
create index if not exists idx_menu_categories_restaurant on public.menu_categories(restaurant_id);
create index if not exists idx_audit_log_restaurant on public.audit_log(restaurant_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 2. Helper: is the current JWT email an owner of this restaurant?
--    security definer so it can read owner_emails regardless of caller RLS.
-- ---------------------------------------------------------------------------

create or replace function public.is_owner_email(p_restaurant_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.owner_emails oe
    where oe.restaurant_id = p_restaurant_id
      and lower(oe.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Boolean-only allowlist probe for the (unauthenticated) login step.
-- Returns true/false only — never row data — so it cannot enumerate emails.
create or replace function public.is_email_allowed(p_restaurant_id text, p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.owner_emails oe
    where oe.restaurant_id = p_restaurant_id
      and lower(oe.email) = lower(p_email)
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. Row Level Security — owners can only read their own restaurant's rows.
--    Writes are NOT granted directly; the only write path is the audited rail.
-- ---------------------------------------------------------------------------

alter table public.restaurants     enable row level security;
alter table public.owner_emails     enable row level security;
alter table public.menu_categories  enable row level security;
alter table public.menu_items       enable row level security;
alter table public.hours            enable row level security;
alter table public.promos           enable row level security;
alter table public.change_requests  enable row level security;
alter table public.audit_log        enable row level security;

drop policy if exists "owner reads restaurant" on public.restaurants;
create policy "owner reads restaurant" on public.restaurants
  for select to authenticated using (public.is_owner_email(id));

drop policy if exists "owner reads own emails" on public.owner_emails;
create policy "owner reads own emails" on public.owner_emails
  for select to authenticated using (public.is_owner_email(restaurant_id));

drop policy if exists "owner reads categories" on public.menu_categories;
create policy "owner reads categories" on public.menu_categories
  for select to authenticated using (public.is_owner_email(restaurant_id));

drop policy if exists "owner reads items" on public.menu_items;
create policy "owner reads items" on public.menu_items
  for select to authenticated using (public.is_owner_email(restaurant_id));

drop policy if exists "owner reads hours" on public.hours;
create policy "owner reads hours" on public.hours
  for select to authenticated using (public.is_owner_email(restaurant_id));

drop policy if exists "owner reads promos" on public.promos;
create policy "owner reads promos" on public.promos
  for select to authenticated using (public.is_owner_email(restaurant_id));

drop policy if exists "owner reads audit" on public.audit_log;
create policy "owner reads audit" on public.audit_log
  for select to authenticated using (public.is_owner_email(restaurant_id));

-- change_requests: owners may read their own; inserts handled by app/service later.
drop policy if exists "owner reads requests" on public.change_requests;
create policy "owner reads requests" on public.change_requests
  for select to authenticated using (public.is_owner_email(restaurant_id));

-- ---------------------------------------------------------------------------
-- 4. The audited write rail — the ONLY way an owner mutates content.
--    Validates ownership + an allowlist of editable fields, performs the
--    update, and appends to audit_log, all in a single transaction.
-- ---------------------------------------------------------------------------

create or replace function public.apply_owner_change(
  p_restaurant_id text,
  p_table         text,
  p_row_id        text,
  p_field         text,
  p_new_value     text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email   text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_old     text;
  v_cast    text := '';
  v_sql     text;
  v_allowed boolean;
begin
  -- Ownership: caller's email must own this restaurant.
  if not exists (
    select 1 from public.owner_emails oe
    where oe.restaurant_id = p_restaurant_id
      and lower(oe.email) = v_email
  ) then
    raise exception 'not authorized for restaurant %', p_restaurant_id
      using errcode = '42501';
  end if;

  -- Allowlist of editable {table, field} pairs. Everything else is rejected.
  v_allowed := case
    when p_table = 'menu_items'      and p_field in ('name','description','price','is_available','photo_url') then true
    when p_table = 'menu_categories' and p_field in ('name') then true
    when p_table = 'promos'          and p_field in ('text','is_active') then true
    when p_table = 'hours'           and p_field in ('open_time','close_time','is_closed') then true
    else false
  end;
  if not v_allowed then
    raise exception 'field % on table % is not editable', p_field, p_table
      using errcode = '42501';
  end if;

  -- Cast text input to the column's real type for the typed columns.
  v_cast := case
    when p_field in ('is_available','is_active','is_closed') then '::boolean'
    when p_field in ('price') then '::numeric'
    else ''
  end;

  -- Capture the old value (also confirms the row belongs to this restaurant).
  v_sql := format('select (%I)::text from public.%I where id = $1 and restaurant_id = $2',
                  p_field, p_table);
  execute v_sql into v_old using p_row_id::uuid, p_restaurant_id;

  -- Apply the change.
  v_sql := format('update public.%I set %I = $1%s where id = $2 and restaurant_id = $3',
                  p_table, p_field, v_cast);
  execute v_sql using p_new_value, p_row_id::uuid, p_restaurant_id;

  -- Append the audit record in the same transaction.
  insert into public.audit_log(
    restaurant_id, actor_email, table_name, row_id, field_name, old_value, new_value
  ) values (
    p_restaurant_id, v_email, p_table, p_row_id, p_field, v_old, p_new_value
  );
end;
$$;

revoke all on function public.apply_owner_change(text,text,text,text,text) from anon;
grant execute on function public.apply_owner_change(text,text,text,text,text) to authenticated;
grant execute on function public.is_email_allowed(text,text) to anon, authenticated;
grant execute on function public.is_owner_email(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Public read — safe columns only, for the customer-facing QR menu.
--    security definer so it can read past RLS, but it returns only menu data.
-- ---------------------------------------------------------------------------

create or replace function public.get_public_menu(p_restaurant_id text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select case when r.id is null then null else json_build_object(
    'restaurant', json_build_object('id', r.id, 'business_name', r.business_name, 'site_url', r.site_url),
    'categories', coalesce((
      select json_agg(cat order by cat.sort_order) from (
        select mc.id, mc.name, mc.sort_order,
          coalesce((
            select json_agg(it order by it.sort_order) from (
              select mi.id, mi.name, mi.description, mi.price, mi.photo_url, mi.sort_order
              from public.menu_items mi
              where mi.category_id = mc.id and mi.is_available = true
            ) it
          ), '[]'::json) as items
        from public.menu_categories mc
        where mc.restaurant_id = r.id
      ) cat
    ), '[]'::json),
    'hours', coalesce((
      select json_agg(h order by h.day_of_week) from (
        select day_of_week, open_time, close_time, is_closed
        from public.hours where restaurant_id = r.id
      ) h
    ), '[]'::json),
    'promos', coalesce((
      select json_agg(p order by p.sort_order) from (
        select text, sort_order from public.promos
        where restaurant_id = r.id and is_active = true
      ) p
    ), '[]'::json)
  ) end
  from (select * from public.restaurants where id = p_restaurant_id) r;
$$;

grant execute on function public.get_public_menu(text) to anon, authenticated;
