-- Fina Calle OS - private AMMA client ledger and employee access controls.
-- PREPARED ONLY: apply after 0010. No Auth user or email is created by this SQL.

alter table public.admin_emails
  add column if not exists display_name text,
  add column if not exists job_title text,
  add column if not exists is_active boolean not null default true,
  add column if not exists can_manage_team boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

update public.admin_emails
set display_name = 'Anthony',
    job_title = 'Owner',
    can_manage_team = true,
    is_active = true,
    updated_at = now()
where lower(email) = 'anthonycolmenaresanandres@gmail.com';

update public.admin_emails
set display_name = coalesce(display_name, 'AMMA Operations'),
    job_title = coalesce(job_title, 'Operations'),
    updated_at = now()
where lower(email) = 'ammaventuresvb@gmail.com';

update public.admin_emails
set display_name = coalesce(display_name, 'Marbel'),
    job_title = coalesce(job_title, 'Team Member'),
    updated_at = now()
where lower(email) = 'marbeljsiado@gmail.com';

create or replace function public.is_admin_email(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_emails ae
    where lower(ae.email) = lower(trim(p_email))
      and ae.is_active
  );
$$;

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
      and ae.is_active
  );
$$;

create or replace function public.can_current_user_manage_team()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_emails ae
    where lower(ae.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and ae.is_active
      and ae.can_manage_team
  );
$$;

create or replace function public.get_client_ledger()
returns table (
  id text,
  business_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  plan text,
  status text,
  billing_status text,
  amount_cents bigint,
  currency text,
  billing_interval text,
  billing_interval_count integer,
  recurring_enabled boolean,
  latest_invoice_status text,
  last_payment_at timestamptz,
  next_payment_at timestamptz,
  site_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.business_name,
    r.contact_name,
    r.contact_email,
    r.contact_phone,
    r.plan,
    r.status,
    coalesce(
      b.subscription_status,
      nullif(lower(r.billing_status), 'manual'),
      'not_started'
    ),
    b.amount_cents,
    b.currency,
    b.billing_interval,
    b.billing_interval_count,
    coalesce(b.recurring_enabled, false),
    b.latest_invoice_status,
    b.last_payment_at,
    b.next_payment_at,
    r.site_url
  from public.restaurants r
  left join public.restaurant_billing b on b.restaurant_id = r.id
  where public.is_current_user_admin()
  order by r.business_name;
$$;

create or replace function public.get_client_account(p_id text)
returns table (
  id text,
  business_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  plan text,
  status text,
  billing_status text,
  amount_cents bigint,
  currency text,
  billing_interval text,
  billing_interval_count integer,
  recurring_enabled boolean,
  latest_invoice_status text,
  last_payment_at timestamptz,
  next_payment_at timestamptz,
  site_url text,
  notes text,
  owner_access_emails text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.business_name,
    r.contact_name,
    r.contact_email,
    r.contact_phone,
    r.plan,
    r.status,
    coalesce(
      b.subscription_status,
      nullif(lower(r.billing_status), 'manual'),
      'not_started'
    ),
    b.amount_cents,
    b.currency,
    b.billing_interval,
    b.billing_interval_count,
    coalesce(b.recurring_enabled, false),
    b.latest_invoice_status,
    b.last_payment_at,
    b.next_payment_at,
    r.site_url,
    r.notes,
    coalesce(
      array(
        select lower(oe.email)
        from public.owner_emails oe
        where oe.restaurant_id = r.id
        order by lower(oe.email)
      ),
      array[]::text[]
    )
  from public.restaurants r
  left join public.restaurant_billing b on b.restaurant_id = r.id
  where r.id = p_id
    and public.is_current_user_admin();
$$;

create or replace function public.get_team_roster()
returns table (
  id uuid,
  email text,
  display_name text,
  job_title text,
  is_active boolean,
  can_manage_team boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select ae.id, ae.email, ae.display_name, ae.job_title, ae.is_active,
         ae.can_manage_team, ae.created_at, ae.updated_at
  from public.admin_emails ae
  where public.is_current_user_admin()
  order by ae.can_manage_team desc, ae.is_active desc,
           coalesce(ae.display_name, ae.email);
$$;

create or replace function public.upsert_team_member(
  p_email text,
  p_display_name text,
  p_job_title text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(p_email));
begin
  if not public.can_current_user_manage_team() then
    raise exception 'Not authorized';
  end if;
  if normalized_email = ''
     or length(normalized_email) > 300
     or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Invalid email';
  end if;
  if nullif(trim(p_display_name), '') is null or length(trim(p_display_name)) > 120 then
    raise exception 'Invalid display name';
  end if;
  if nullif(trim(p_job_title), '') is null or length(trim(p_job_title)) > 120 then
    raise exception 'Invalid job title';
  end if;

  insert into public.admin_emails (
    email, display_name, job_title, is_active, updated_at
  ) values (
    normalized_email, trim(p_display_name), trim(p_job_title), true, now()
  )
  on conflict (email) do update
  set display_name = excluded.display_name,
      job_title = excluded.job_title,
      is_active = true,
      updated_at = now();
  return true;
end;
$$;

create or replace function public.set_team_member_active(
  p_email text,
  p_active boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(p_email));
begin
  if not public.can_current_user_manage_team() then
    raise exception 'Not authorized';
  end if;
  if not p_active and normalized_email = lower(coalesce(auth.jwt() ->> 'email', '')) then
    raise exception 'You cannot deactivate your own account';
  end if;
  if not p_active and exists (
    select 1 from public.admin_emails ae
    where lower(ae.email) = normalized_email and ae.can_manage_team
  ) then
    raise exception 'Owner access requires manual review';
  end if;

  update public.admin_emails
  set is_active = p_active, updated_at = now()
  where lower(email) = normalized_email;
  return found;
end;
$$;

revoke all on function public.get_client_ledger() from public;
revoke all on function public.get_client_account(text) from public;
revoke all on function public.get_team_roster() from public;
revoke all on function public.upsert_team_member(text, text, text) from public;
revoke all on function public.set_team_member_active(text, boolean) from public;
revoke all on function public.can_current_user_manage_team() from public;

grant execute on function public.get_client_ledger() to authenticated;
grant execute on function public.get_client_account(text) to authenticated;
grant execute on function public.get_team_roster() to authenticated;
grant execute on function public.upsert_team_member(text, text, text) to authenticated;
grant execute on function public.set_team_member_active(text, boolean) to authenticated;
grant execute on function public.can_current_user_manage_team() to authenticated;

revoke execute on function public.get_customer_registry() from authenticated;
revoke execute on function public.get_customer(text) from authenticated;

grant execute on function public.is_admin_email(text) to anon, authenticated;
grant execute on function public.is_current_user_admin() to authenticated;
