-- Fina Calle OS — item sizes + Colattao real-menu seed.
-- 1) Adds a `sizes` JSONB to menu_items: [] for single-price items, or
--    [{"label":"Small","price":5.50},{"label":"Large","price":6.50}] for
--    multi-size items. `price` stays the base/display price (first size).
--    `price = 0` means "Ask" (no fixed price).
-- 2) get_public_menu returns `sizes` so the public menu can show size pricing.
-- 3) Replaces Colattao's sample menu with the real menu (from colattaoMenu.ts).
-- Safe to re-run: the seed deletes Colattao's categories first (cascades items).

begin;

-- 1. sizes column ------------------------------------------------------------
alter table public.menu_items
  add column if not exists sizes jsonb not null default '[]'::jsonb;

-- 2. public menu returns sizes ----------------------------------------------
create or replace function public.get_public_menu(p_restaurant_id text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select case when r.id is null then null else json_build_object(
    'restaurant', json_build_object('id', r.id, 'business_name', r.business_name, 'site_url', r.site_url),
    'categories', coalesce((
      select json_agg(cat order by cat.sort_order) from (
        select mc.id, mc.name, mc.sort_order,
          coalesce((
            select json_agg(it order by it.sort_order) from (
              select mi.id, mi.name, mi.description, mi.price, mi.photo_url, mi.sizes, mi.sort_order
              from public.menu_items mi
              where mi.category_id = mc.id and mi.is_available = true
            ) it
          ), '[]'::json) as items
        from public.menu_categories mc
        where mc.restaurant_id = r.id
      ) cat
    ), '[]'::json),
    'hours', coalesce((
      select json_agg(h order by h.day_of_week) from (
        select day_of_week, open_time, close_time, is_closed
        from public.hours where restaurant_id = r.id
      ) h
    ), '[]'::json),
    'promos', coalesce((
      select json_agg(p order by p.sort_order) from (
        select text, sort_order from public.promos
        where restaurant_id = r.id and is_active = true
      ) p
    ), '[]'::json)
  ) end
  from (select * from public.restaurants where id = p_restaurant_id) r;
$$;

-- 3. Colattao real menu ------------------------------------------------------
delete from public.menu_categories where restaurant_id = 'colattao';

insert into public.menu_categories (restaurant_id, name, sort_order) values
  ('colattao', 'Espresso & Coffee', 0),
  ('colattao', 'Favorites',         1),
  ('colattao', 'Matcha',            2),
  ('colattao', 'Seasonal Drinks',   3),
  ('colattao', 'Tea & More',        4),
  ('colattao', 'Kitchen',           5),
  ('colattao', 'Pastries & Sweets', 6);

insert into public.menu_items
  (restaurant_id, category_id, name, description, price, is_available, sort_order, sizes)
select 'colattao', c.id, v.name, v.description, v.price, true, v.sort_order, v.sizes::jsonb
from (values
  -- Espresso & Coffee
  ('Espresso & Coffee', 'House Brew',              null,  0::numeric, 0, '[]'),
  ('Espresso & Coffee', 'Double Shot',             null,  3.95, 1, '[]'),
  ('Espresso & Coffee', 'Cortado',                 null,  5.00, 2, '[]'),
  ('Espresso & Coffee', 'Americano',               null,  4.50, 3, '[]'),
  ('Espresso & Coffee', 'Cappuccino',              null,  5.25, 4, '[]'),
  ('Espresso & Coffee', 'Latte',                   null,  5.50, 5, '[{"label":"Small","price":5.50},{"label":"Large","price":6.50}]'),
  ('Espresso & Coffee', 'Flat White',              null,  5.25, 6, '[]'),
  ('Espresso & Coffee', 'Mocha',                   null,  7.00, 7, '[]'),
  -- Favorites
  ('Favorites', 'Panela Coffee with Milk',         null,  6.00, 0, '[]'),
  ('Favorites', 'Churro Latte',                    null,  8.00, 1, '[]'),
  ('Favorites', 'Dulce de Coco',                   null,  7.50, 2, '[]'),
  ('Favorites', 'Dark Chocolate Habanero',         null,  7.50, 3, '[]'),
  ('Favorites', 'Flan Latte',                      null,  8.00, 4, '[]'),
  ('Favorites', 'Pistachio Macaron',               null,  8.00, 5, '[]'),
  ('Favorites', 'Coconut Hazelnut',                null,  7.50, 6, '[]'),
  -- Matcha
  ('Matcha', 'Pure',                               null,  6.75, 0, '[]'),
  ('Matcha', 'Blue',                               null,  7.50, 1, '[]'),
  ('Matcha', 'Coconut',                            null,  8.00, 2, '[]'),
  ('Matcha', 'Matchai',                            null,  9.00, 3, '[]'),
  ('Matcha', 'Strawberry Vanilla',                 null,  8.00, 4, '[]'),
  ('Matcha', 'White Mint',                         null,  8.00, 5, '[]'),
  -- Seasonal Drinks (Ask = price 0)
  ('Seasonal Drinks', 'Coco Beach',         'Toasted coconut, tropical nuts, cold foam',                 0, 0, '[]'),
  ('Seasonal Drinks', 'Dolce Banana',       'Dulce de leche, banana, cold foam',                         0, 1, '[]'),
  ('Seasonal Drinks', 'Matcha Lemonade',    'Available flavors: original, strawberry, mango',            0, 2, '[]'),
  ('Seasonal Drinks', 'Cinnamon Horchata',  'House made horchata. Add a double shot +$1.50',             0, 3, '[]'),
  -- Tea & More
  ('Tea & More', 'Hot Tea',        null, 4.95, 0, '[{"label":"Small","price":4.95},{"label":"Large","price":7.00}]'),
  ('Tea & More', 'Chai',           null, 6.75, 1, '[]'),
  ('Tea & More', 'Hot Chocolate',  null, 4.50, 2, '[{"label":"Small","price":4.50},{"label":"Large","price":5.50}]'),
  ('Tea & More', 'Affogato',       null, 8.00, 3, '[]'),
  -- Kitchen
  ('Kitchen', 'Bacon Egg & Cheese',   null, 8.60, 0, '[]'),
  ('Kitchen', 'California Sandwich',  'Egg, Monterey Jack cheese, queso fresco, avocado, California sauce, and cilantro sauce on a croissant.', 9.72, 1, '[]'),
  ('Kitchen', 'Cubano',               'Latin-style roasted pork, ham, Swiss cheese, mustard, and pickles on Cuban bread.', 12.00, 2, '[]'),
  ('Kitchen', 'Chicken Apricot',      'Grilled chicken strips, apricot preserves, and cheddar cheese on a croissant.', 10.00, 3, '[]'),
  ('Kitchen', 'Montecristo',          'Black Forest ham, cream cheese, Swiss cheese, and blackberry preserves on a croissant. Baked and finished with powdered sugar.', 8.72, 4, '[]'),
  ('Kitchen', 'Pesto Mozzarella',     'Thick-sliced fresh mozzarella and house pesto sauce on a croissant. Served cold.', 7.22, 5, '[]'),
  ('Kitchen', 'Ham & Cheesy',         null, 7.62, 6, '[]'),
  ('Kitchen', 'Turkey Egg & Swiss',   null, 8.60, 7, '[]'),
  -- Pastries & Sweets
  ('Pastries & Sweets', 'Babka',                      null, 3.75, 0, '[]'),
  ('Pastries & Sweets', 'Danish, Cherry / Lemon',     null, 3.95, 1, '[]'),
  ('Pastries & Sweets', 'Chocolate Croissant',        null, 3.95, 2, '[]'),
  ('Pastries & Sweets', 'Pan de Bono',                null, 2.25, 3, '[]'),
  ('Pastries & Sweets', 'Cookies',                    null, 3.50, 4, '[]'),
  ('Pastries & Sweets', 'Empanadas, Chicken / Beef',  null, 4.50, 5, '[]'),
  ('Pastries & Sweets', 'Cruffin',                    null, 6.50, 6, '[]'),
  ('Pastries & Sweets', 'Lemon Blueberry Mascarpone', null, 8.50, 7, '[]'),
  ('Pastries & Sweets', 'Royal Cheesecake',           null, 4.00, 8, '[]'),
  ('Pastries & Sweets', 'Almond Croissant',           null, 0,    9, '[]')
) as v(cat, name, description, price, sort_order, sizes)
join public.menu_categories c
  on c.restaurant_id = 'colattao' and c.name = v.cat;

commit;
