-- Fina Calle OS - owner billing webhook ledger.
--
-- Stripe is the payment source of truth. This migration adds a small local
-- ledger so verified webhooks can update owner billing state exactly once.

begin;

alter table public.restaurants
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_latest_invoice_id text,
  add column if not exists billing_amount_due_cents integer not null default 0,
  add column if not exists billing_currency text not null default 'usd',
  add column if not exists billing_last_event_at timestamptz,
  add column if not exists billing_last_paid_at timestamptz,
  add column if not exists billing_past_due_at timestamptz;

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  restaurant_id text references public.restaurants(id) on delete set null,
  restaurant_hint text,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_object_id text,
  stripe_latest_invoice_id text,
  event_type text not null,
  billing_status text,
  amount_due_cents integer,
  currency text,
  event_created_at timestamptz,
  processed_at timestamptz not null default now()
);

create index if not exists idx_billing_events_restaurant
  on public.billing_events(restaurant_id, processed_at desc);

create index if not exists idx_billing_events_customer
  on public.billing_events(stripe_customer_id, processed_at desc);

alter table public.billing_events enable row level security;

drop policy if exists "owner reads billing events" on public.billing_events;
create policy "owner reads billing events" on public.billing_events
  for select to authenticated using (restaurant_id is not null and public.is_owner_email(restaurant_id));

create or replace function public.record_stripe_billing_event(
  p_stripe_event_id text,
  p_restaurant_id text,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_stripe_latest_invoice_id text,
  p_stripe_object_id text,
  p_event_type text,
  p_billing_status text,
  p_amount_due_cents integer,
  p_currency text,
  p_event_created_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restaurant_id text := nullif(trim(coalesce(p_restaurant_id, '')), '');
  v_row_count int := 0;
  v_event_time timestamptz := coalesce(p_event_created_at, now());
begin
  if nullif(trim(coalesce(p_stripe_event_id, '')), '') is null then
    raise exception 'stripe_event_id is required' using errcode = '22023';
  end if;

  if nullif(trim(coalesce(p_event_type, '')), '') is null then
    raise exception 'event_type is required' using errcode = '22023';
  end if;

  if v_restaurant_id is not null and not exists (
    select 1 from public.restaurants where id = v_restaurant_id
  ) then
    v_restaurant_id := null;
  end if;

  if v_restaurant_id is null and nullif(trim(coalesce(p_stripe_customer_id, '')), '') is not null then
    select id into v_restaurant_id
    from public.restaurants
    where stripe_customer_id = p_stripe_customer_id
    limit 1;
  end if;

  insert into public.billing_events (
    stripe_event_id,
    restaurant_id,
    restaurant_hint,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_object_id,
    stripe_latest_invoice_id,
    event_type,
    billing_status,
    amount_due_cents,
    currency,
    event_created_at
  ) values (
    p_stripe_event_id,
    v_restaurant_id,
    nullif(trim(coalesce(p_restaurant_id, '')), ''),
    nullif(trim(coalesce(p_stripe_customer_id, '')), ''),
    nullif(trim(coalesce(p_stripe_subscription_id, '')), ''),
    nullif(trim(coalesce(p_stripe_object_id, '')), ''),
    nullif(trim(coalesce(p_stripe_latest_invoice_id, '')), ''),
    p_event_type,
    nullif(trim(coalesce(p_billing_status, '')), ''),
    p_amount_due_cents,
    lower(nullif(trim(coalesce(p_currency, '')), '')),
    v_event_time
  )
  on conflict (stripe_event_id) do nothing;

  get diagnostics v_row_count = row_count;

  if v_row_count = 0 then
    return jsonb_build_object('inserted', false, 'restaurantId', v_restaurant_id);
  end if;

  if v_restaurant_id is not null then
    update public.restaurants
    set
      stripe_customer_id = coalesce(nullif(trim(coalesce(p_stripe_customer_id, '')), ''), stripe_customer_id),
      stripe_subscription_id = coalesce(nullif(trim(coalesce(p_stripe_subscription_id, '')), ''), stripe_subscription_id),
      stripe_latest_invoice_id = coalesce(nullif(trim(coalesce(p_stripe_latest_invoice_id, '')), ''), stripe_latest_invoice_id),
      billing_status = coalesce(nullif(trim(coalesce(p_billing_status, '')), ''), billing_status),
      billing_amount_due_cents = coalesce(p_amount_due_cents, billing_amount_due_cents),
      billing_currency = coalesce(lower(nullif(trim(coalesce(p_currency, '')), '')), billing_currency, 'usd'),
      billing_last_event_at = v_event_time,
      billing_last_paid_at = case
        when p_event_type in ('checkout.session.completed', 'invoice.paid', 'invoice.payment_succeeded')
          then v_event_time
        else billing_last_paid_at
      end,
      billing_past_due_at = case
        when p_billing_status in ('past_due', 'unpaid') then coalesce(billing_past_due_at, v_event_time)
        when p_billing_status in ('active', 'current', 'paid', 'trialing') then null
        else billing_past_due_at
      end
    where id = v_restaurant_id;
  end if;

  return jsonb_build_object('inserted', true, 'restaurantId', v_restaurant_id);
end;
$$;

revoke all on function public.record_stripe_billing_event(text,text,text,text,text,text,text,text,integer,text,timestamptz) from anon, authenticated, public;
grant execute on function public.record_stripe_billing_event(text,text,text,text,text,text,text,text,integer,text,timestamptz) to service_role;

commit;
