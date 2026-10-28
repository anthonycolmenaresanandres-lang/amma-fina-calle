-- PREPARED ONLY. Apply to the verified dedicated traffic database after approval.
-- No collector changes, grants, extensions, retention or other schemas.
BEGIN;
CREATE TABLE IF NOT EXISTS traffic_mail_deliveries (
  delivery_key TEXT PRIMARY KEY,
  payload TEXT NOT NULL CHECK (octet_length(payload) <= 262144),
  payload_hash TEXT NOT NULL CHECK (payload_hash ~ '^[a-f0-9]{64}$'),
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','sending','accepted','unconfirmed','rejected')),
  attempt_id TEXT,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attempted_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  provider_id TEXT,
  reason TEXT,
  CHECK ((state = 'pending' AND attempt_id IS NULL) OR (state <> 'pending' AND attempt_id IS NOT NULL))
);
-- No runtime DDL. Frozen payload and identity are immutable even on retry.
CREATE OR REPLACE FUNCTION traffic_mail_preserve_payload() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.delivery_key IS DISTINCT FROM OLD.delivery_key OR NEW.payload IS DISTINCT FROM OLD.payload
    OR NEW.payload_hash IS DISTINCT FROM OLD.payload_hash OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'TRAFFIC_MAIL_PAYLOAD_IMMUTABLE';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER traffic_mail_payload_immutable BEFORE UPDATE ON traffic_mail_deliveries
FOR EACH ROW EXECUTE FUNCTION traffic_mail_preserve_payload();
COMMIT;
