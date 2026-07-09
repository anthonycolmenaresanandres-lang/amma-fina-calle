-- Fina Calle OS — admin team update (supersedes the abandoned 0007 variant from PR #5).
-- Renumbered to 0009 because 0007/0008 slots are already taken on main
-- (0007_menu_sizes_and_colattao_seed, 0008_apply_owner_size_price).
--
-- Adds Marbel as a full admin (sees the customer registry + request inbox), and
-- re-asserts the existing two admins so the full team is explicit in one place.
-- Idempotent: re-running changes nothing. Removes no one.
--   Full team after this migration:
--     anthonycolmenaresanandres@gmail.com  (from 0004)
--     ammaventuresvb@gmail.com             (from 0006)
--     marbeljsiado@gmail.com               (new)
--
-- NOTE: applying this in Supabase (SQL editor or `supabase db push`) is the step
-- that actually grants access — merging this PR alone does not.

insert into public.admin_emails (email) values
  ('anthonycolmenaresanandres@gmail.com'),
  ('ammaventuresvb@gmail.com'),
  ('marbeljsiado@gmail.com')
on conflict (email) do nothing;
