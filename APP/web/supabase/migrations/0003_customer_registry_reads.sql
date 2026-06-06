-- Fina Calle OS — Phase C: customer registry reads from Supabase.
-- The /customers and /customers/[id] pages are public "manual operations"
-- views, so the registry is exposed through security-definer functions that
-- return ONLY the columns each page renders. No table columns are added: every
-- field already exists on public.restaurants (Pass 001). Stripe/billing-link
-- fields are intentionally deferred and not exposed here.

-- List view: minimal columns the /customers list renders.
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
  order by business_name;
$$;

-- Detail view: adds the contact + notes fields the account page renders.
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
  where id = p_id;
$$;

grant execute on function public.get_customer_registry() to anon, authenticated;
grant execute on function public.get_customer(text) to anon, authenticated;
