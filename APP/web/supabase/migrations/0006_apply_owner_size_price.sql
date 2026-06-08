-- Fina Calle OS — audited owner edit of a single SIZE price.
--
-- menu_items.sizes is a jsonb array [{"label":"Small","price":5.50}, ...].
-- The generic apply_owner_change() can only `set <column> = <value>`, so it
-- cannot edit one element inside that array. This adds a dedicated, audited
-- rail for exactly that operation, mirroring apply_owner_change's security
-- model 1:1:
--   * security definer + locked search_path
--   * caller's JWT email must own the restaurant (owner_emails)
--   * the row must belong to that restaurant
--   * the named size must exist on the item (case-insensitive)
--   * the price is validated/cast to numeric
--   * the change + an audit_log row land in ONE transaction
--   * granted to `authenticated` only; revoked from anon/public
--
-- It only ever rewrites the `price` of one element; labels, order, and every
-- other size are preserved.

begin;

create or replace function public.apply_owner_size_price(
  p_restaurant_id text,
  p_row_id        text,
  p_size_label    text,
  p_new_value     text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email     text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_old       text;
  v_new_price numeric;
begin
  -- Ownership: caller's email must own this restaurant.
  if not exists (
    select 1 from public.owner_emails oe
    where oe.restaurant_id = p_restaurant_id
      and lower(oe.email) = v_email
  ) then
    raise exception 'not authorized for restaurant %', p_restaurant_id
      using errcode = '42501';
  end if;

  -- Validate the incoming price.
  begin
    v_new_price := p_new_value::numeric;
  exception when others then
    raise exception 'invalid price %', p_new_value using errcode = '22023';
  end;
  if v_new_price < 0 then
    raise exception 'price must be >= 0' using errcode = '22023';
  end if;

  -- The item must belong to this restaurant.
  if not exists (
    select 1 from public.menu_items mi
    where mi.id = p_row_id::uuid and mi.restaurant_id = p_restaurant_id
  ) then
    raise exception 'item % not found for restaurant %', p_row_id, p_restaurant_id
      using errcode = '42501';
  end if;

  -- Capture the old price of the named size (case-insensitive). This also
  -- proves the size label exists on the item before we touch anything.
  select elem->>'price' into v_old
  from public.menu_items mi
  cross join lateral jsonb_array_elements(mi.sizes) elem
  where mi.id = p_row_id::uuid
    and mi.restaurant_id = p_restaurant_id
    and lower(elem->>'label') = lower(p_size_label);
  if not found then
    raise exception 'size % not found on item %', p_size_label, p_row_id
      using errcode = '22023';
  end if;

  -- Rebuild the sizes array, replacing only the matched size's price and
  -- preserving label, order, and all other sizes.
  update public.menu_items mi
  set sizes = (
    select jsonb_agg(
      case
        when lower(e.elem->>'label') = lower(p_size_label)
          then jsonb_set(e.elem, '{price}', to_jsonb(v_new_price))
        else e.elem
      end
      order by e.ord
    )
    from jsonb_array_elements(mi.sizes) with ordinality as e(elem, ord)
  )
  where mi.id = p_row_id::uuid and mi.restaurant_id = p_restaurant_id;

  -- Audit in the same transaction (field name records which size changed).
  insert into public.audit_log(
    restaurant_id, actor_email, table_name, row_id, field_name, old_value, new_value
  ) values (
    p_restaurant_id, v_email, 'menu_items', p_row_id,
    'sizes:' || p_size_label, v_old, v_new_price::text
  );
end;
$$;

revoke all on function public.apply_owner_size_price(text,text,text,text) from anon, public;
grant execute on function public.apply_owner_size_price(text,text,text,text) to authenticated;

commit;
