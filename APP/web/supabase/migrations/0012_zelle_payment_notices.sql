-- Fina Calle OS - owner Zelle reports and AMMA-only reconciliation.
-- PREPARED ONLY: apply after 0010 and 0011. This does not connect to a bank.

alter table public.admin_emails
  add column if not exists can_manage_billing boolean not null default false;

update public.admin_emails
set can_manage_billing = true,
    updated_at = now()
where lower(email) = 'anthonycolmenaresanandres@gmail.com';

create or replace function public.can_current_user_manage_billing()
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
      and ae.can_manage_billing
  );
$$;

create table if not exists public.payment_notices (
  id uuid primary key default gen_random_uuid(),
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  payment_method text not null default 'zelle' check (payment_method = 'zelle'),
  amount_cents bigint not null check (amount_cents > 0 and amount_cents <= 10000000),
  currency text not null default 'usd' check (currency = 'usd'),
  owner_email text not null,
  owner_note text,
  reference_id text not null unique,
  status text not null default 'reported' check (status in ('reported', 'verified', 'rejected')),
  reported_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  constraint payment_notices_note_length check (owner_note is null or length(owner_note) <= 500)
);

create index if not exists payment_notices_restaurant_reported_idx
  on public.payment_notices (restaurant_id, reported_at desc);

create index if not exists payment_notices_status_reported_idx
  on public.payment_notices (status, reported_at desc);

alter table public.payment_notices enable row level security;

create or replace function public.submit_owner_payment_notice(
  p_restaurant_id text,
  p_amount_cents bigint,
  p_owner_note text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  new_reference text;
begin
  if current_email = '' or not exists (
    select 1 from public.owner_emails oe
    where oe.restaurant_id = p_restaurant_id
      and lower(oe.email) = current_email
  ) then
    raise exception 'Not authorized';
  end if;
  if p_amount_cents <= 0 or p_amount_cents > 10000000 then
    raise exception 'Invalid amount';
  end if;
  if p_owner_note is not null and length(trim(p_owner_note)) > 500 then
    raise exception 'Note is too long';
  end if;
  if (
    select count(*)
    from public.payment_notices pn
    where pn.restaurant_id = p_restaurant_id
      and pn.owner_email = current_email
      and pn.reported_at > now() - interval '10 minutes'
  ) >= 5 then
    raise exception 'Too many payment reports';
  end if;

  new_reference := 'AMMA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  insert into public.payment_notices (
    restaurant_id, amount_cents, owner_email, owner_note, reference_id
  ) values (
    p_restaurant_id,
    p_amount_cents,
    current_email,
    nullif(trim(p_owner_note), ''),
    new_reference
  );
  return new_reference;
end;
$$;

create or replace function public.get_owner_payment_notices(p_restaurant_id text)
returns table (
  id uuid,
  amount_cents bigint,
  currency text,
  owner_note text,
  reference_id text,
  status text,
  reported_at timestamptz,
  reviewed_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select pn.id, pn.amount_cents, pn.currency, pn.owner_note,
         pn.reference_id, pn.status, pn.reported_at, pn.reviewed_at
  from public.payment_notices pn
  where pn.restaurant_id = p_restaurant_id
    and exists (
      select 1 from public.owner_emails oe
      where oe.restaurant_id = p_restaurant_id
        and lower(oe.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  order by pn.reported_at desc
  limit 10;
$$;

create or replace function public.get_admin_payment_notices()
returns table (
  id uuid,
  restaurant_id text,
  business_name text,
  amount_cents bigint,
  currency text,
  owner_email text,
  owner_note text,
  reference_id text,
  status text,
  reported_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text
)
language sql
stable
security definer
set search_path = public
as $$
  select pn.id, pn.restaurant_id, r.business_name, pn.amount_cents,
         pn.currency, pn.owner_email, pn.owner_note, pn.reference_id,
         pn.status, pn.reported_at, pn.reviewed_at, pn.reviewed_by
  from public.payment_notices pn
  join public.restaurants r on r.id = pn.restaurant_id
  where public.is_current_user_admin()
  order by case when pn.status = 'reported' then 0 else 1 end,
           pn.reported_at desc;
$$;

create or replace function public.review_payment_notice(
  p_notice_id uuid,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_current_user_manage_billing() then
    raise exception 'Not authorized';
  end if;
  if p_status not in ('verified', 'rejected') then
    raise exception 'Invalid review status';
  end if;

  update public.payment_notices
  set status = p_status,
      reviewed_at = now(),
      reviewed_by = lower(coalesce(auth.jwt() ->> 'email', ''))
  where id = p_notice_id and status = 'reported';
  return found;
end;
$$;

revoke all on table public.payment_notices from anon, authenticated;
revoke all on function public.can_current_user_manage_billing() from public;
revoke all on function public.submit_owner_payment_notice(text, bigint, text) from public;
revoke all on function public.get_owner_payment_notices(text) from public;
revoke all on function public.get_admin_payment_notices() from public;
revoke all on function public.review_payment_notice(uuid, text) from public;

grant execute on function public.can_current_user_manage_billing() to authenticated;
grant execute on function public.submit_owner_payment_notice(text, bigint, text) to authenticated;
grant execute on function public.get_owner_payment_notices(text) to authenticated;
grant execute on function public.get_admin_payment_notices() to authenticated;
grant execute on function public.review_payment_notice(uuid, text) to authenticated;
