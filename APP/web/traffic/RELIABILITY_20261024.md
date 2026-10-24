# Traffic reliability repair — prepared October 24

Scope: reporting scheduler, delivery ledger, regression tests and operational
evidence only. Existing collection, attribution, Square, credentials and other
products are unchanged. Production migration, release and one bounded owner
verification remain separately coordinated; no historical bulk resend.

## Verified incident and current production

The Oct23 12UTC scheduled run39983020194/job120514943226 checked out e670247
and reached the trigger at16:00:00UTC (12:00Eastern), then logged
`Skipped: outside the approved Eastern reporting window.` as success. The
October18 pair showed the same failure. October19-23 native wake-ups are late
by hours; no evidence supports treating a green job as an accepted email.

- https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/actions/runs/39983020194/job/120514943226
- https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/actions/runs/39138287742/job/117707229023

Read-only Gmail search for traffic-by-site messages afterOctober18 returned no
matches onOctober24. Parent separately observed anOctober19 digest, which is
not proof of the native report's acceptance. Provider historical acceptance is
UNKNOWN. No provider credential was read and no email was sent in this repair.

Vercel production dpl_84V2kTsGjQaMgehrE5o8aSoVM8Yi is READY at7a9d87f
(El Mariachi PR361), concurrently published. This branch must preserve it.

## Delivery contract

- Primary wake-ups move off the hour to12:17/13:17UTC. The server derives the
  matching08Eastern slot from the delivery date's DST offset. Catch-up wake-ups
  at16:17/20:17UTC share the same batch identity and remain bounded by08:00-17:59
  Eastern. No due send after18:00 except separately authorized current-date recovery.
- The workflow obtains its original creation date from public GitHub run metadata,
  without a token or additional permission. Manual reruns keep that date. A
  run executing next day fails as missed rather than selecting a new interval.
  GitHub exposes creation time, not the original intended cron timestamp: a
  scheduling event delayed across midnight before creation cannot be reconstructed.
- Daily delivery dates remainOctober18-31. MondaysOctober19/26 carry yesterday
  plus the independently queried completedMonday-Sunday week in ONE email;
  November onward is Monday weekly only. No mass historical catch-up.
- Bodega andColattao appear first. Site registry, production drain, database
  event queries, site isolation, coverage calculation and raw ingestion remain
  unchanged. No missing/unavailable-to-zero substitution, cross-brand unique
  total, sum of daily unique IDs, or people/physical-scan claim.
- New dedicated traffic ledger freezes the full aggregate-only provider payload
  and itsSHA256 once. Atomic pending->sending claim fences concurrent processes.
  Accepted records survive the provider's24hour idempotency expiry. Sending,
  unconfirmed and rejected records NEVER auto-expire/reclaim. A crash before a
  provider call may therefore require manual reconciliation; availability does
  not override duplicate safety.
- One provider call per invocation. Only an explicitHTTP429 releases a claim for
  a later wake-up using identical frozen bytes/key, max3attempts and23hours.
  Timeout/409/5xx/failed acceptance persistence remain fenced. No random retry key.
-23:17UTC runs check-only after18Eastern in either season. A missing acceptance,
  failed source, disabled gate or inaccessible ledger returns a failure, not a
  success skip. This check runs even when the repository send variable is off;
  manualcheck also remains available while sends are paused. A missing GitHub
  run or disabled whole workflow still requires
  operational monitoring; this is not an exactly-once or failure-proof promise.
- The admin GET exposes readiness and state/timestamps, never frozen content or
  credentials. The trigger token's check mode returns only acceptance/status.
  Native workflow dispatch defaults to check, which cannot send.

## Production approval package — NOT EXECUTED

Required coordinated approval: apply002_delivery_ledger.sql on the existing
verified dedicated TRAFFIC_DATABASE database; merge/release this scoped PR;
temporarily pause/resume the existing repository schedule variable to avoid the
workflow/server deployment overlap; and perform at most ONE latest completed-day
verification to Anthony after a fresh provider/Gmail acceptance check. No new
service, credential, paid scheduler, access grant, collector or health migration.

1. Verify finalPRcommit/requiredCI and currentmain, retainingPR361. Verify the
   existing database binding without displaying its URL or secrets. Validate the
   additive migration on an existing authorized nonproduction database branch,
   or use the provided syntheticSQL evidence and request approval for any
   additional environment needed. No new paid branch/service is authorized.
2. Coordinate repositoryTRAFFIC_REPORT_SCHEDULE_ENABLED=false while releasing.
   Apply traffic/migrations/002_delivery_ledger.sql once to the verified dedicated
   database. It creates only traffic_mail_deliveries and its immutability trigger/
   function. It performs no raw-event, health, Supabase, access or retention write.
   Runtime never creates schema and fails closed when it is missing/inaccessible.
   Verify the existing app role can SELECT/INSERT/UPDATE this new table; stop for
   separate approval if an access grant or credential change would be needed.
3. Merge and deploy current checked main to existing amma-fina-calle project
   prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4/team_MwMFazBLYzRGQnqRAJOPDPH3. Verify the
   production commit/READY/custom-domain association and adminGET readiness.
   Keep test flags off; leave all collection/health/Square/other-product flags alone.
4. Before ONE latest-day verification, inspect Gmail AND Resend dashboard/API
   acceptance for that exact scheduled batch. No inbox message alone is not proof
   of rejection. If any acceptance/uncertainty exists, reconcile the ledger first;
   do not send. Do not access/change the sending-only key to obtain wider reads.
5. If no prior acceptance and approved, enable serverTRAFFIC_EMAIL_RECOVERY_ENABLED
   only around a single main-branch workflow dispatchmode=recovery; it can select
   only today'sEastern delivery date and uses SCHEDULED identity (no preview key).
   The server still requires existing email/schedule/readback gates and database.
   Confirm ledgeraccepted/providerID privately, actual Gmail HTML/text subject and
   range/site/coverage values. If uncertain, STOP; never blind-dispatch again.
6. Disable the recovery flag and deploy that closure; restore the existing
   repository schedule variable only after server/schema readiness. Confirm the
   next normal catch-up is deduplicated and the final check succeeds. Record
   acceptance separately from Gmail delivery; monitor the next Monday batch.

If the current delivery date has no due batch, check-only correctly returnsnot_due;
do not enable historical date arguments or widen cadence to obtain a test email.
The first automatic scheduled batch after release is the normal verification.

## Reconciliation and rollback

Read delivery_key,state,attempts,attempted_at,accepted_at,provider_id for the exact
batch in the verified dedicated database. Inspect the provider and owner inbox.
An accepted provider attempt can be marked accepted only after positive evidence;
an uncertain attempt stays fenced. No auto reset to pending, key change, delete or
table drop. A genuinely not-sent attempt requires a separately reviewed recovery
decision; current automation does not attempt multi-day backfill.

For rollback disable the existing repository schedule flag and server recovery
flag; retain the ledger and accepted rows. Revert report code only through a
checked scopedPR. Do not blindly roll back production to an older revision that
would discard El Mariachi or other intervening releases, or resume the old mailer
which has no persistent dedupe. No rollback executed here.

## Validation

Offline regressions include actual additiveSQL/trigger and atomic claims in
PGlite, concurrent callers, frozen bodies, stale/exhausted429retries, permanently
fenced ambiguous attempts, date/DST/grace/cadence, original-run metadata, partial
and unavailable sources, preserved covered/unverified-zero semantics, Monday
independent intervals, fixed recipient/auth/privacy, current-date-only recovery,
accepted replay without data queries/provider calls, and check-only failures.
Existing pipeline and established-drain continuity tests are retained. Final
commands and exact commit/CI evidence are recorded in thePR; live migration and
delivery evidence remain pending approval, not claimed by mocked tests.

Local final verification on code tree53f6a1a (includes published7a9d87f):
`npm run traffic:selftest` (counter +19pipeline groups),
`npm run traffic-morning:selftest` (existing mail/drain/presentation boundaries
plus61reliability groups), touched-sourceESLint, full `npm run lint` (0errors;
111existingwarnings), and `npm run build -- --webpack` (compile, TypeScript,
60static pages and build traces) PASS. WorkflowYAML parses with five wake-ups,
defaultcheck and contents:read. Actual publicGitHub metadata extraction for
run39983020194 returns2026-10-23 without authentication or any mutation.
Protected collection/aggregation/drain/ElMariachi/dependency paths have no diff
against7a9d87f. RemoteCI/preview are checked against the finalPRcommit separately.

Official contracts checkedOctober24:
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
- https://resend.com/docs/dashboard/emails/idempotency-keys
- https://resend.com/docs/api-reference/errors
