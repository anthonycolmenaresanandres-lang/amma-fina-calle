-- Fina Calle OS - verified Colattao billing identity and AMMA billing managers.
-- Apply after 0013. This stores non-secret billing facts only; it does not
-- create a Stripe customer/subscription, configure Zelle, or move money.

alter table public.restaurants
  add column if not exists billing_name text,
  add column if not exists billing_address_line1 text,
  add column if not exists billing_address_city text,
  add column if not exists billing_address_state text,
  add column if not exists billing_address_postal_code text,
  add column if not exists billing_address_country text;

update public.restaurants
set billing_name = 'colattao coffee house',
    contact_name = 'Yurika Torres',
    contact_email = 'colattao@hotmail.com',
    contact_phone = '757-761-9757',
    billing_address_line1 = '1115 Independence Boulevard',
    billing_address_city = 'Virginia Beach',
    billing_address_state = 'VA',
    billing_address_postal_code = '23455',
    billing_address_country = 'US'
where id = 'colattao';

update public.admin_emails
set can_manage_billing = true,
    updated_at = now()
where lower(email) in (
  'anthonycolmenaresanandres@gmail.com',
  'marbeljsiado@gmail.com'
);
