-- Prepared only. Prize claims stay inactive until Anthony chooses a daily cap.
-- Version 4 requires a clean five-round run without touching Bad Vibes.
alter table public.bodega_reward_sessions drop constraint if exists bodega_reward_sessions_version_check;
alter table public.bodega_reward_sessions add constraint bodega_reward_sessions_version_check check (version in (2, 3, 4));
alter table public.bodega_reward_sessions alter column version set default 4;
