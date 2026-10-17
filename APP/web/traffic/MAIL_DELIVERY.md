# Mail-only traffic reporting: preparation and controlled handoff

Current continuation of draft PR348. Code is prepared; no credentials, production
configuration, schema migration, monitoring, collection activation, or live email
were performed by this executor. Anthony approved the restricted credentials,
reporting deployment and one aggregate-only owner test at 20:00 UTC October17.
Parent coordinates credential entry, checked deployment and that single test;
this worker does not merge or send.

## Exact configuration names

Owner enters secret values directly in each service's secure UI; do not paste
them into chat, shell commands, logs, repository files, or PRs.

AMMA Vercel project -> Settings -> Environment Variables -> Production only:

| Name | Type / intended value |
| --- | --- |
| TRAFFIC_RESEND_API_KEY | Secret; sending-only, restricted to verified finacalleos.com domain |
| TRAFFIC_MAIL_TRIGGER_SECRET | Secret; new dedicated 32-512 character ASCII token, no whitespace; no reuse of CRON_SECRET/report/health/Square secrets |
| TRAFFIC_FROM_EMAIL | Config; e.g. Fina Calle Traffic <reports@finacalleos.com>, using the verified domain |
| TRAFFIC_MORNING_REPORT_EMAIL | Config; anthonycolmenaresanandres@gmail.com only |
| TRAFFIC_EMAIL_ENABLED | false until coordinated approved test; true is required for any email |
| TRAFFIC_EMAIL_TEST_ENABLED | false until that one approved test; disable immediately after acceptance/readback |
| TRAFFIC_EMAIL_TEST_READBACK_CONFIRMED | false until connected cloud Gmail actually reads the received test |
| TRAFFIC_SCHEDULE_ENABLED | false until readback and parent-authorized recurring activation |

Keep collection and monitoring off (TRAFFIC_INGESTION_SOURCE and
TRAFFIC_HEALTH_RECORD_ENABLED); do not alter Square settings or shared CRON_SECRET.
Reuse the existing dedicated traffic connection. No health migration is needed
for report reads. Missing/older health tables are unverified, never measured zero.

GitHub repository -> Settings -> Secrets and variables -> Actions:

- Secret TRAFFIC_MAIL_TRIGGER_SECRET: the owner enters the same dedicated token.
  The workflow gets no Resend credential, database credential, report token or
  shared cron secret.
- Variable TRAFFIC_REPORT_TEST_ENABLED: false/absent by default; temporarily true
  only for the single authorized manual workflow run, then false again.
- Variable TRAFFIC_REPORT_SCHEDULE_ENABLED: false/absent until actual Gmail
  readback and recurring activation. Server-side flags must also permit it.

Secret values never transit the assistant. Setting server flags requires a new
deployment to take effect. Coordinate the resulting deployment rather than
assuming a dashboard change updates an existing function.

## Minimal capability

POST https://finacalleos.com/api/internal/traffic/morning
requires Authorization: Bearer <TRAFFIC_MAIL_TRIGGER_SECRET> and application/json.
No URL parameters are accepted. The body is limited to256bytes and either:

- {"mode":"test"} — yesterday, selected by the server clock; no custom recipients
  or dates. Enable the test only around the single coordinated send.
- {"mode":"scheduled","schedule":"0 12 * * *"} or the13UTCslot equivalent —
  server-selected eligible daily/weekly period, never caller-supplied SQL/range.

Every GET remains authenticated admin inspection, never a send. The POST returns
only acceptance/skip/period metadata; it does not expose aggregates or raw events.
Mail contains per-site aggregate pageviews and distinct tracked identifiers,
with explicit unverified coverage. Identifiers are not people; no cross-brand
distinct total, raw records, paths, IDs, phone numbers or database data export.
An all-source unavailable report is not sent.

One provider POST attempt per trigger,15second timeout, redirects rejected.
The scheduler client makes one request with45second timeout, no retry. Timeout
or409 is uncertain: check the owner inbox before any manual intervention.
The ordered daily/weekly period batch always produces the same Resend idempotency key.
Resend retains keys for24hours; changed aggregate bodies can return409 rather
than a new email. No durable delivery ledger or migration was introduced, so
this is bounded delivery with provider deduplication, not an exactly-once promise.
Never change a key to bypass an uncertain result.

## Native scheduler prepared, disabled

.github/workflows/traffic-report-mail.yml uses the existing public repository's
standard Ubuntu runner, contents:read, two-minute job limit, serialized delivery.
No packages/services are installed by the workflow.

Two scheduled wake-ups are12:00UTC and13:00UTC. The server accepts only the slot
matching the current08:00-08:59 America/New_York hour. A delayed wrong-DST-slot
job is rejected too.

- Daily sends: October18-31,2026, for yesterday's complete Eastern day.
- October 19 and 26 combine yesterday and the previous completed Monday-Sunday
  week in one short email. Both intervals are queried independently and remain
  separate; neither daily totals nor daily distinct identifiers are added to the week.
- After October31, Monday weekly reporting continues; other days skip.
- The first weekly report onOctober19 coversOctober12-18.
- Weekly distinct identifiers are queried across the whole week. Daily distinct
  counts are never added together.
- Calendar boundaries handle23/25hour days and167/169hour weeks.

A schedule does not run from this feature branch; GitHub scheduled workflows
use the default branch. GitHub may delay/drop runs and disable public-repository
schedules after60days without activity. Runs outside the8am hour skip rather
than inventing an exact-delivery guarantee. No catch-up/retry or external paid
scheduler is introduced.

## Parent-controlled release checklist

1. Review exact-head tests/CI and coordinate user-entered credentials/flags.
   Keep recurring flags and collection/monitoring off.
2. Parent performs the approved reporting deployment after readiness; no
   migration, collection, monitoring, access grant or restaurant changes.
3. Temporarily enable test gates, then request one manual Traffic report mail
   workflow run. This worker has not run it. Manual dispatch requires the
   workflow on the default branch; inspect the exact checked head first.
4. Read the received test through the connected cloud Gmail app. Match subject,
   fixed recipient, complete-day range, aggregate fields and coverage caveats.
   Provider acceptance alone does not confirm inbox delivery.
5. Immediately disable both test gates. Only after successful readback and
   parent coordination enable server schedule/readback flags and the GitHub
   schedule variable. Do not enable a duplicate Vercel GET cron.
6. Parent may separately configure the requested chat summary delivery. This
   workflow only sends aggregate email; it does not create a chat automation.

## Local evidence

- Existing traffic suite plus19 pipeline groups.
- VM-mocked route/provider boundary suite: no network or sends.
- Real local in-memory SQL: whole-week distinct differs from daily sum;
  existing8columns survive absent/older health schema; SELECT-only report reads.
- Eastern spring/fall day/week boundaries, year boundary, temporary daily cutoff,
  Monday combined payload, preview and token isolation, single-attempt failure paths.
- Focused lint/build evidence recorded in VERIFICATION.md after final checks.

Official references checked October17,2026:

- https://resend.com/docs/dashboard/emails/idempotency-keys
- https://resend.com/docs/api-reference/errors
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule

## Single-test operational constraint

The test flag is an enable window, not a durable one-shot latch. Parent must
verify direct user secret entry and explicitly coordinate exactly one dispatch.
No agent may dispatch merely because the flag is enabled. If the result is
uncertain, do not retry: inspect provider acceptance and the owner inbox first.
Read the actual message through connected Gmail, then turn both server and
repository test gates off. The stable period key reduces duplicates within the
provider window; it does not guarantee exactly-once delivery. Parent controls
deployment and sends; this worker has performed neither.
