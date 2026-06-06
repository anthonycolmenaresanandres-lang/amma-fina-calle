-- Fina Calle OS — Admin gating for the customer registry.
-- Locks /customers and /customers/[id] data behind an admin allowlist, reusing
-- the Supabase magic-link foundation. The registry read functions added in 0003
-- are tightened so only an authenticated admin email can read them, and anon
-- execute is revoked (closing the direct-RPC hole, not just the UI).

-- ---------------------------------------------------------------------------
-- 1. Admin allowlist (global, not per-restaurant)
-- ---------------------------------------------------------------------------

create table if not exists public.admin_emails (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

-- RLS on, no policies: only the security-definer functions below may read it.
alter table public.admin_emails enable row level security;

-- ---------------------------------------------------------------------------
-- 2. Allowlist probes (boolean only — no enumeration, no row exposure)
-- ---------------------------------------------------------------------------

-- Used by the (unauthenticated) admin login step.
create or replace function public.is_admin_email(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_emails ae
    where lower(ae.email) = lower(p_email)
  );
$$;

-- Is the current JWT email an admin?
create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_emails ae
    where lower(ae.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. Tighten the registry reads to admins only (fail closed: non-admins get
--    zero rows; anon loses execute entirely below).
-- ---------------------------------------------------------------------------

create or replace function public.get_customer_registry()
returns table (
  id             text,
  business_name  text,
  plan           text,
  status         text,
  billing_status text,
  site_url       text
)
language sql
stable
security definer
set search_path = public
as $$
  select id, business_name, plan, status, billing_status, site_url
  from public.restaurants
  where public.is_current_user_admin()
  order by business_name;
$$;

create or replace function public.get_customer(p_id text)
returns table (
  id             text,
  business_name  text,
  plan           text,
  status         text,
  billing_status text,
  site_url       text,
  contact_name   text,
  contact_email  text,
  contact_phone  text,
  notes          text
)
language sql
stable
security definer
set search_path = public
as $$
  select id, business_name, plan, status, billing_status, site_url,
         contact_name, contact_email, contact_phone, notes
  from public.restaurants
  where id = p_id and public.is_current_user_admin();
$$;

-- ---------------------------------------------------------------------------
-- 4. Grants — anon can no longer read the registry; only authenticated admins.
-- ---------------------------------------------------------------------------

revoke execute on function public.get_customer_registry() from anon;
revoke execute on function public.get_customer(text) from anon;
grant execute on function public.get_customer_registry() to authenticated;
grant execute on function public.get_customer(text) to authenticated;

grant execute on function public.is_admin_email(text) to anon, authenticated;
grant execute on function public.is_current_user_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Seed the first admin.
-- ---------------------------------------------------------------------------

insert into public.admin_emails (email)
values ('anthonycolmenaresanandres@gmail.com')
on conflict (email) do nothing;
