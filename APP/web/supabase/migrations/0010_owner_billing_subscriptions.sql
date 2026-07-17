-- Fina Calle OS - private Stripe billing state for authenticated owner portals.
-- PREPARED ONLY: verify the applied production migration state before running.
-- Stripe remains authoritative. No card or bank-account details are stored here.

create table if not exists public.restaurant_billing (
  restaurant_id          text primary key references public.restaurants(id) on delete cascade,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  subscription_status    text not null default 'not_started'
    check (subscription_status in (
      'not_started', 'incomplete', 'incomplete_expired', 'trialing', 'active',
      'past_due', 'canceled', 'unpaid', 'paused', 'processing'
    )),
  recurring_enabled      boolean not null default false,
  latest_invoice_status  text,
  last_payment_at        timestamptz,
  current_period_end     timestamptz,
  next_payment_at        timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  id           text primary key,
  event_type   text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.restaurant_billing enable row level security;
alter table public.stripe_webhook_events enable row level security;

-- No direct table policies are created. Server-side service-role code is the
-- only write path. Owners receive a deliberately narrow summary through RPC.
create or replace function public.get_owner_billing_summary(p_restaurant_id text)
returns table (
  plan                  text,
  billing_status        text,
  recurring_enabled     boolean,
  latest_invoice_status text,
  last_payment_at       timestamptz,
  current_period_end    timestamptz,
  next_payment_at       timestamptz
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
    b.latest_invoice_status,
    b.last_payment_at,
    b.current_period_end,
    b.next_payment_at
  from public.restaurants r
  left join public.restaurant_billing b on b.restaurant_id = r.id
  where r.id = p_restaurant_id
    and public.is_owner_email(r.id);
$$;

revoke all on function public.get_owner_billing_summary(text) from public;
grant execute on function public.get_owner_billing_summary(text) to authenticated;
