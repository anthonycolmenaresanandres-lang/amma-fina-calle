
# Mail reporting security and read-only review

Scope: the combined daily/weekly continuation of PR348. Evidence is local source
inspection plus offline VM/provider mocks and in-memory SQL; it is not a claim
that production credentials, provider permissions, inbox delivery or flags have
been verified. Parent's independent review of the preceding eb6b733 head reported
no concrete mail/read-only blocker. This continuation changes period selection,
aggregate formatting and batching, without widening the authentication boundary.

## Verified boundaries

- POST accepts only the dedicated TRAFFIC_MAIL_TRIGGER_SECRET, constant-time
  compared. Shared CRON_SECRET/report tokens are rejected by behavioral tests.
  GET remains authenticated admin inspection and cannot invoke delivery.
- Preview remains unable to send even when inherited enable flags are true.
- Recipient is a code constant after exact configured-owner verification.
  Sender must use the verified finacalleos.com domain. Wrong recipients/senders
  produce zero provider calls in offline tests.
- Request payload is bounded to256bytes. Only mode/schedule are accepted.
  Caller-supplied recipient, query string, SQL, dates and other fields fail closed.
- Server selects at most two periods. October19 and26 independently query
  yesterday and the previous completed week, then produce one compact aggregate
  email. November2 queries the weekly period only. DST and cutoff tests pass.
  No daily/weekly distinct counts or cross-brand identifiers are added together.
- Formatter outputs aggregate counts and status only. A synthetic raw visitor_id
  marker added to every fixture is absent from the generated provider payload.
  No IDs, record exports, SQL or provider error bodies are returned/logged.
- One Resend fetch per trigger,15second timeout, no redirect and no retry loop.
  The ordered period batch has a stable key. Timeout/409 is unconfirmed and
  never automatically retried. Resend deduplication is limited to its24hour
  window; this is not a durable exactly-once system.
- Scheduler has a fixed HTTPS destination and only the mail token. It receives
  no database key, Resend key or shared cron token; no dependencies installed.
  Repository gates are false/absent by default. Server requires schedule plus
  successful-readback gates. Serialized jobs avoid overlapping normal runs.
- Existing eight-column traffic event reports are aggregate SELECTs only.
  Missing/older optional health schema is unverified evidence, never a migration
  trigger or measured zero. No production table or access change was performed.
- Collection and health remain separately gated; this correction changes neither
  collector nor health routes, public menus, QR URLs, auth configuration or POS.

## Explicit operational limitations

The test flag is an enable window, not a persistent one-send latch. Parent must
verify user-entered secrets, authorize exactly one dispatch, inspect uncertain
outcomes without retry, read the actual test through connected Gmail and disable
both test gates immediately. No test has been sent by this worker.

GitHub's scheduled runs can be delayed/dropped and public repository schedules
can be disabled after inactivity. Only the correct Eastern08hour is accepted.
Stable keys reduce duplicate emails but cannot prove exactly-once delivery.
Actual provider domain restriction, secure secret entry, production configuration
and exact-head CI/preview must be verified by the parent before release.

## Activation flags (all prepared false/off)

Vercel Production:
- TRAFFIC_EMAIL_ENABLED
- TRAFFIC_EMAIL_TEST_ENABLED
- TRAFFIC_EMAIL_TEST_READBACK_CONFIRMED
- TRAFFIC_SCHEDULE_ENABLED

GitHub Actions repository Variables:
- TRAFFIC_REPORT_TEST_ENABLED
- TRAFFIC_REPORT_SCHEDULE_ENABLED

Credential names:
- TRAFFIC_RESEND_API_KEY: Vercel Production only, sending-only/domain restricted.
- TRAFFIC_MAIL_TRIGGER_SECRET: same owner-entered dedicated token in Vercel
  Production and GitHub Actions Secrets. Never send values through the assistant.

No configuration changes, credential handling, schema migrations, monitoring or
collection activation, production merge/deployment, dispatch or live email were
performed by this executor.

## Established feed preservation correction

The pre-release source comparison found that the new source gate would disable the existing feed when absent/disabled, and new hashing/attribution would change telemetry even in drain mode. The current receiver uses a production-hash-pinned isolated ingestion chain. Only import isolation, preview blocking and error redaction differ at its route boundary. No mail capability/authentication widened. New optional collector/health gates stay off independently; source flag disabled does not stop established ingestion. Golden source and actual offline SQL regressions verify continuity; see ESTABLISHED_DRAIN_CONTINUITY.md. Production writer's pre-existing idempotent startup checks remain unchanged; new reporting reads never call them.
