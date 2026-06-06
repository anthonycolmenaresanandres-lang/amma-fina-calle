-- Fina Calle OS — Phase F: admin team update.
-- Adds Marbel as a full admin (sees the customer registry + request inbox), and
-- re-asserts the existing two admins so the full team is explicit in one place.
-- Idempotent: re-running changes nothing. Removes no one.
--   Full team after this migration:
--     anthonycolmenaresanandres@gmail.com  (from 0004)
--     ammaventuresvb@gmail.com             (from 0006)
--     marbeljsiado@gmail.com               (new)

insert into public.admin_emails (email) values
  ('anthonycolmenaresanandres@gmail.com'),
  ('ammaventuresvb@gmail.com'),
  ('marbeljsiado@gmail.com')
on conflict (email) do nothing;
