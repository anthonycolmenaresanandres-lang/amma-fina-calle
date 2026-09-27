-- Bodega's approved Basic offer and private authorization evidence.
-- The owner must still explicitly enroll in Stripe Checkout. This migration
-- creates no Stripe customer, subscription, invoice, or charge.

insert into public.restaurants (
  id, business_name, plan, billing_status, site_url, contact_email, billing_name
) values (
  'bodega', 'Bodega Cafe', 'Basic', 'manual', 'https://bodegacafe757.com',
  'bodegacafe757@gmail.com', 'Bodega Cafe'
) on conflict (id) do nothing;

-- Anthony confirmed this address belongs to the Bodega owner on 2026-09-27.
insert into public.owner_emails (restaurant_id, email, role)
values ('bodega', 'bodegacafe757@gmail.com', 'owner')
on conflict (restaurant_id, email) do nothing;

insert into public.restaurant_billing (
  restaurant_id, subscription_status, recurring_enabled, amount_cents,
  currency, billing_interval, billing_interval_count,
  scheduled_first_charge_on
) values (
  'bodega', 'not_started', false, 19900, 'usd', 'month', 1,
  date '2026-10-26'
) on conflict (restaurant_id) do nothing;

create table if not exists public.billing_authorizations (
  checkout_session_id text primary key,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null,
  accepted_by_email text not null,
  terms_version text not null,
  terms_snapshot jsonb not null,
  accepted_at timestamptz not null,
  checkout_completed_at timestamptz not null
);

create index if not exists billing_authorizations_restaurant_idx
  on public.billing_authorizations (restaurant_id, accepted_at desc);

alter table public.billing_authorizations enable row level security;
revoke all on public.billing_authorizations from anon, authenticated;
-- Service-role code writes the immutable record only after a verified
-- checkout.session.completed event and a stored customer-to-tenant match.
