-- Fina Calle OS - confirmed Colattao billing schedule shown in the owner portal.
-- Apply after 0010, 0011, and 0012. This records policy only; it does not
-- create a Stripe customer, subscription, invoice, payment method, or charge.

alter table public.restaurant_billing
  add column if not exists scheduled_first_charge_on date;

insert into public.restaurant_billing (
  restaurant_id,
  subscription_status,
  recurring_enabled,
  amount_cents,
  currency,
  billing_interval,
  billing_interval_count,
  scheduled_first_charge_on,
  updated_at
) values (
  'colattao',
  'not_started',
  false,
  14900,
  'usd',
  'month',
  1,
  date '2026-07-20',
  now()
)
on conflict (restaurant_id) do update
set amount_cents = coalesce(public.restaurant_billing.amount_cents, excluded.amount_cents),
    currency = coalesce(public.restaurant_billing.currency, excluded.currency),
    billing_interval = coalesce(public.restaurant_billing.billing_interval, excluded.billing_interval),
    billing_interval_count = coalesce(
      public.restaurant_billing.billing_interval_count,
      excluded.billing_interval_count
    ),
    scheduled_first_charge_on = excluded.scheduled_first_charge_on,
    updated_at = now();

drop function if exists public.get_owner_billing_summary(text);

create function public.get_owner_billing_summary(p_restaurant_id text)
returns table (
  plan                       text,
  billing_status             text,
  recurring_enabled          boolean,
  amount_cents               bigint,
  currency                   text,
  billing_interval           text,
  billing_interval_count     integer,
  latest_invoice_status      text,
  last_payment_at            timestamptz,
  current_period_end         timestamptz,
  next_payment_at            timestamptz,
  scheduled_first_charge_on  date
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.plan,
    coalesce(
      b.subscription_status,
      nullif(lower(r.billing_status), 'manual'),
      'not_started'
    ),
    coalesce(b.recurring_enabled, false),
    b.amount_cents,
    b.currency,
    b.billing_interval,
    b.billing_interval_count,
    b.latest_invoice_status,
    b.last_payment_at,
    b.current_period_end,
    b.next_payment_at,
    b.scheduled_first_charge_on
  from public.restaurants r
  left join public.restaurant_billing b on b.restaurant_id = r.id
  where r.id = p_restaurant_id
    and public.is_owner_email(r.id);
$$;

revoke all on function public.get_owner_billing_summary(text) from public;
grant execute on function public.get_owner_billing_summary(text) to authenticated;
