
# Established production drain continuity

## Baseline verified before release

- Current origin/main: 576c1ce61fdb26b47cf2ef999be2d00fae501652.
- Latest Production deployment7142021412 has that SHA and success status.
- Existing preview alias for that production artifact:
  https://amma-fina-calle-blt5dnp2o.vercel.app .
- Last change to the original drain dependency paths on main is8eb6239
  (use Neon-injected Production traffic database URL).
- No live payload, credential value, telemetry probe or production SQL was read
  or sent by this worker.

## Concrete blocker found and repaired

The initial PR receiver returned202 whenever TRAFFIC_INGESTION_SOURCE was absent
or disabled. Existing production ingestion never required this flag, so deployment
with new collection gates off would have acknowledged and discarded the feed.
The new parser also rehashed identifiers, changed attribution and added a24hour
cutoff. Setting the mode to drain alone would therefore still change telemetry.

The production /api/traffic/drain receiver now imports a private frozen snapshot
under src/lib/traffic/established-drain/. Its complete date/parser/sanitizer/
signature/site-registry/store/types dependency chain is byte-equivalent to the
verified production commit (canonical LF); the source hashes are pinned in
established-drain-baseline.json and checked in CI.

The route itself restores the established production behavior. A golden Git-blob
test proves only these deliberate differences from the original route:
1. Imports point to the isolated established dependency chain.
2. Non-production deployments return202 before any store access.
3. Storage exceptions are logged generically instead of printing exception text.

Existing production input/authentication/parsing/attribution/identifier values,
timestamp acceptance, database-variable precedence, pool defaults, composite
event key, INSERT columns and ON CONFLICT replay deduplication are preserved.
The existing endpoint URL, provider drain configuration, database resource and
TRAFFIC_DRAIN_SECRET are unchanged.

## Runtime schema distinction

The preserved writer retains its PRE-EXISTING idempotent startup table/index
checks exactly as production. No new schema operation or migration is introduced
into that ingestion path. This code was not executed against production here.

The new report/mail code imports the separate modern store, which initializes
only a connection and issues SELECTs. It never imports the established writer or
runs its startup checks. Missing/older optional health tables remain unverified;
they do not require migration or imply measured-zero traffic.

## Exact offline evidence

npm run traffic-morning:selftest includes traffic-established-drain-selftest.mjs:

- Seven source hashes match verified production.
- Route golden blob allows only the three differences above.
- Actual old parser/writer run against local in-memory PGlite, not a real URL.
- New source flag both absent and disabled still yields200 and three stored
  fixtures; a second delivery leaves exactly three rows.
- Old opaque visitor IDs and exact composite event hashes remain unchanged,
  including a fixture timestamp older than the new parser's24hour cutoff.
- Existing custom-header and HMAC authentication succeed; wrong auth fails.
- Preview produces no writes; storage errors expose no private exception text.
- Existing eight-column schema remains identical.
- New report reads those same rows through SELECT-only queries, without health
  tables, new DDL or migration.

## Recommended nonsecret release flags

For reporting/mail deployment before the single approved test:

    TRAFFIC_INGESTION_SOURCE=disabled
    TRAFFIC_HEALTH_RECORD_ENABLED=false
    TRAFFIC_EMAIL_ENABLED=false
    TRAFFIC_EMAIL_TEST_ENABLED=false
    TRAFFIC_EMAIL_TEST_READBACK_CONFIRMED=false
    TRAFFIC_SCHEDULE_ENABLED=false

Leaving TRAFFIC_INGESTION_SOURCE absent also keeps the OPTIONAL NEW first-party
collector off. This variable no longer controls the established drain receiver.
Do not enable the optional new collector alongside the existing feed; any future
collection migration/replacement/deduplication requires a separate reviewed plan.

Keep GitHub Actions variables TRAFFIC_REPORT_TEST_ENABLED and
TRAFFIC_REPORT_SCHEDULE_ENABLED false/absent. Parent may temporarily enable only
the documented test gates after direct user secret entry and final readiness.
Recurring gates remain false until actual connected-Gmail readback.

Preserve existing TRAFFIC_DRAIN_SECRET and TRAFFIC_DATABASE_* configuration;
do not rotate, decrypt, copy or replace their values. Leave CRON_SECRET, Square
settings, provider drain configuration, domain mappings and database settings
unchanged. New mail credentials remain separate.

Production merge/deployment, one test dispatch, inbox readback and any activation
remain parent-controlled. This worker performed none of those actions.
