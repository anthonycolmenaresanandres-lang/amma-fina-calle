-- Voice gateway — relational schema (Postgres) for the scale-out backend.
--
-- The default runtime store is in-memory + an atomic JSON snapshot (src/store.ts),
-- which is enough to pilot on a single always-on instance. When you need multiple
-- instances / real durability / per-tenant analytics at scale, move the store behind
-- this schema (same entities + keys as the in-memory DB). Booking commits stay idempotent
-- via pos_sync_attempts.idempotency_key (= draft_id), exactly as in memory.
--
-- Apply:  psql "$DATABASE_URL" -f db/schema.sql

CREATE TABLE IF NOT EXISTS calls (
  call_id     UUID PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  from_phone  TEXT,
  status      TEXT NOT NULL CHECK (status IN ('active','ended')),
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS calls_tenant_idx ON calls (tenant_id);

CREATE TABLE IF NOT EXISTS drafts (
  draft_id        UUID PRIMARY KEY,
  call_id         UUID NOT NULL REFERENCES calls(call_id),
  tenant_id       TEXT NOT NULL,
  service         TEXT NOT NULL,
  slot_start      TIMESTAMPTZ NOT NULL,
  slot_end        TIMESTAMPTZ NOT NULL,
  customer        JSONB NOT NULL DEFAULT '{}'::jsonb,
  status          TEXT NOT NULL CHECK (status IN ('open','confirmed','committed','expired','cancelled')),
  booking_ref     TEXT,
  pending_confirm BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS drafts_tenant_idx ON drafts (tenant_id);
CREATE INDEX IF NOT EXISTS drafts_call_idx   ON drafts (call_id);

-- Idempotency ledger: one row per booking commit attempt, keyed by idempotency_key
-- (= draft_id). A committed 'ok' row makes a retried confirm a no-op (never double-book).
CREATE TABLE IF NOT EXISTS pos_sync_attempts (
  idempotency_key TEXT PRIMARY KEY,
  sync_id         UUID NOT NULL,
  draft_id        UUID NOT NULL REFERENCES drafts(draft_id),
  operation       TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('pending','ok','error')),
  retry_count     INT  NOT NULL DEFAULT 0,
  response_ref    TEXT,
  last_error      TEXT,
  at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  message_id  UUID PRIMARY KEY,
  call_id     UUID NOT NULL REFERENCES calls(call_id),
  tenant_id   TEXT NOT NULL,
  customer    JSONB NOT NULL DEFAULT '{}'::jsonb,
  reason      TEXT NOT NULL,
  at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_tenant_idx ON messages (tenant_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id     UUID PRIMARY KEY,
  entity_type  TEXT NOT NULL,
  entity_id    TEXT NOT NULL,
  event_type   TEXT NOT NULL,
  before_data  JSONB,
  after_data   JSONB,
  at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_entity_idx ON audit_logs (entity_type, entity_id);
