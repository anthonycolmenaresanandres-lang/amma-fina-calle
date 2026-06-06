-- Fina Calle OS — Owner Portal seed (Pass 001)
-- Seeds the existing Colattao record so nothing from data/customers.ts is lost,
-- plus a small starter menu so the owner dashboard and public menu render.
-- Re-runnable: uses upserts / guarded inserts.

insert into public.restaurants
  (id, business_name, plan, status, billing_status, site_url, contact_name, notes)
values
  ('colattao', 'Colattao', 'Interactive', 'active', 'manual',
   'https://colattao-cafe-rush.vercel.app', 'Owner / Manager',
   'Flagship proof of concept for QR menu, game, living receipt direction, and customer request intake.')
on conflict (id) do update set
  business_name = excluded.business_name,
  site_url      = excluded.site_url;

-- Authorized owner email(s). Replace / add the real Colattao owner address.
-- Anthony's address is seeded so the portal can be tested end-to-end immediately.
insert into public.owner_emails (restaurant_id, email, role)
values ('colattao', 'anthonycolmenaresanandres@gmail.com', 'owner')
on conflict (restaurant_id, email) do nothing;

-- Starter menu (only inserts if the restaurant has no categories yet).
do $$
declare
  v_cat_coffee uuid;
  v_cat_pastry uuid;
begin
  if not exists (select 1 from public.menu_categories where restaurant_id = 'colattao') then
    insert into public.menu_categories (restaurant_id, name, sort_order)
      values ('colattao', 'Coffee', 0) returning id into v_cat_coffee;
    insert into public.menu_categories (restaurant_id, name, sort_order)
      values ('colattao', 'Pastries', 1) returning id into v_cat_pastry;

    insert into public.menu_items (category_id, restaurant_id, name, description, price, sort_order) values
      (v_cat_coffee, 'colattao', 'Espresso',     'Double shot, house blend.',        3.50, 0),
      (v_cat_coffee, 'colattao', 'Cortado',      'Espresso cut with warm milk.',     4.00, 1),
      (v_cat_pastry, 'colattao', 'Almond Croissant', 'Baked fresh each morning.',    4.50, 0);

    insert into public.promos (restaurant_id, text, is_active, sort_order)
      values ('colattao', 'Scan, sip, and play the Colattao mini-game.', true, 0);

    insert into public.hours (restaurant_id, day_of_week, open_time, close_time, is_closed) values
      ('colattao', 1, '07:00', '18:00', false),
      ('colattao', 2, '07:00', '18:00', false),
      ('colattao', 3, '07:00', '18:00', false),
      ('colattao', 4, '07:00', '18:00', false),
      ('colattao', 5, '07:00', '20:00', false),
      ('colattao', 6, '08:00', '20:00', false),
      ('colattao', 0, null,    null,    true);
  end if;
end $$;
