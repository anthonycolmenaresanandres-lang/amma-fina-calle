-- Fina Calle OS — Phase B: persist customer change requests.
-- Extends change_requests to hold the public intake fields and adds a
-- security-definer RPC so the public (anon) intake form can record a request
-- WITHOUT opening a direct INSERT policy on the table. RLS stays locked:
-- owners still only SELECT their own rows; writes go through this one function.

alter table public.change_requests add column if not exists business_name text;
alter table public.change_requests add column if not exists contact_name  text;
alter table public.change_requests add column if not exists source_page   text;

create or replace function public.submit_change_request(
  p_business_name text,
  p_contact_name  text,
  p_contact_info  text,
  p_request_type  text,
  p_priority      text,
  p_message       text,
  p_source_page   text,
  p_reference_id  text,
  p_restaurant_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.change_requests (
    restaurant_id, business_name, contact_name, contact_info,
    request_type, priority, message, source_page, reference_id, status
  ) values (
    p_restaurant_id, p_business_name, p_contact_name, p_contact_info,
    p_request_type, p_priority, p_message, p_source_page, p_reference_id, 'new'
  );
end;
$$;

grant execute on function public.submit_change_request(
  text, text, text, text, text, text, text, text, text
) to anon, authenticated;
