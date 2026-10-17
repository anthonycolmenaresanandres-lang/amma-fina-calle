-- PREPARED ONLY. Apply separately after explicit approval, dedicated DB only.
-- No deletion, retention, access grants, or changes to Supabase.
CREATE TABLE IF NOT EXISTS traffic_events (
  id BIGSERIAL PRIMARY KEY, site_id TEXT, ts TIMESTAMPTZ NOT NULL,
  path TEXT NOT NULL, referrer_host TEXT, visitor_id TEXT NOT NULL,
  event_type TEXT NOT NULL, event_key TEXT
);
ALTER TABLE traffic_events ADD COLUMN IF NOT EXISTS site_id TEXT;
ALTER TABLE traffic_events ADD COLUMN IF NOT EXISTS event_key TEXT;
CREATE INDEX IF NOT EXISTS traffic_events_site_ts_idx ON traffic_events(site_id, ts);
CREATE UNIQUE INDEX IF NOT EXISTS traffic_events_event_key_idx ON traffic_events(event_key);
-- Health evidence is independent of visits; quiet sites must not become stale
-- solely because nobody visited. Only approved external checks populate this.
CREATE TABLE IF NOT EXISTS traffic_collection_checks (
  site_id TEXT NOT NULL, start_at TIMESTAMPTZ NOT NULL, end_at TIMESTAMPTZ NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL, healthy BOOLEAN NOT NULL, probe_ok BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY(site_id, start_at, end_at), CHECK(end_at > start_at),
  CHECK(end_at - start_at <= INTERVAL '15 minutes'), CHECK(checked_at >= end_at)
);
