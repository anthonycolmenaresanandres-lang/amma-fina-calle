-- Prepared only. Muffin claims remain inactive until Anthony chooses a daily cap.
-- Version 5 uses faster falling schedules and never restores completed rounds after exit.
alter table public.bodega_reward_sessions drop constraint if exists bodega_reward_sessions_version_check;
alter table public.bodega_reward_sessions add constraint bodega_reward_sessions_version_check check (version in (2, 3, 4, 5));
alter table public.bodega_reward_sessions alter column version set default 5;
