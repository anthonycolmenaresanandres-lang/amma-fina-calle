# Offline verification

All checks use fixtures or a local in-memory PGlite database; no live connection, deployment or mail provider is used.

## PASS — `node --import tsx scripts/traffic-selftest.ts`

```text

Traffic counter self-test

  ✓ Neon Marketplace traffic URL takes precedence
  ✓ manual traffic URL remains a fallback
  ✓ missing traffic database URL fails closed
  ✓ public menu path preserved
  ✓ opaque id collapsed
  ✓ numeric id collapsed
  ✓ owner portal excluded
  ✓ customers portal excluded
  ✓ api route dropped
  ✓ query string dropped
  ✓ api event dropped during parse
  ✓ only verified public pageviews parsed
  ✓ all Fina events attributed to Fina
  ✓ instagram referrer host extracted
  ✓ json array payload parsed
  ✓ garbage payload is empty, not thrown
  ✓ same project Bodega host stays Bodega
  ✓ identical root paths on shared project stay separated by hostname
  ✓ documented v1 schema is accepted
  ✓ hosted client path never becomes Fina marketing
  ✓ preview deployment never becomes Colattao
  ✓ wrong source project rejected
  ✓ preview environment rejected
  ✓ pageviews without tracked identifiers still recorded
  ✓ Eastern spring reporting day spans 23 hours
  ✓ Eastern fall reporting day spans 25 hours
  ✓ spring morning report covers the complete preceding Eastern day
  ✓ fall morning report covers the complete preceding Eastern day
  ✓ header secret authorizes
  ✓ wrong header secret rejected
  ✓ missing secret fails closed
  ✓ vercel HMAC signature authorizes
  ✓ Fina pageviews exclude Colattao
  ✓ range report deduplicates retry and isolates site
  ✓ first and last observation remain site scoped
  ✓ range daily row matches verified views
  ✓ Fina visitors exclude Colattao
  ✓ Colattao remains separate
  ✓ top path is the Fina marketing page
  ✓ yesterday excluded from today
  ✓ top referrer is instagram
  ✓ unknown site report rejected

All checks passed.

```

## PASS — `node --import tsx scripts/traffic-pipeline-selftest.ts`

```text
PASS every registered brand hostname/path is independently attributed
PASS every AMMA mapping has an actual source route; concepts are explicitly labeled
PASS shared roots and hosted menus stay separated
PASS preview/unknown hosts, private routes, internal tests and hostile paths rejected
PASS first-party trusts validated origin/path and stores no user identity
PASS drain identifiers are scoped by site and type; missing IDs still yield pageviews
PASS Eastern calendar boundaries, DST and immediately after midnight
PASS quiet, missing, stale, failed and partial coverage differ from measured zero
PASS per-instance admission limits reset without retaining personal data
PASS all first-read database statements are SELECT-only
PASS SQL deduplicates retries and computes whole-period distinct, never daily sum
PASS range start inclusive, end exclusive, site isolation, anonymous events not fake visitors
PASS monitor failure creates a gap and recovers after successive good probes
PASS 14 traffic pipeline behavioral groups; no live services accessed.

```

## PASS — `node scripts/traffic-boundary-selftest.mjs`

```text
PASS collector failures isolated, preview excluded, one active source, conflicting identities rejected
PASS service distinguishes empty evidence from unavailable storage
PASS protected connector-readable calendar report, unavailable data remains unavailable
PASS all report GETs cannot send mail, owner restriction, disabled delivery, no traffic schedule
PASS browser network failure does not throw, navigation preserved, duplicate mounts ignored
PASS all offline traffic boundary tests; no external IO.

```

## PASS — `node --import tsx scripts/bodega-traffic-dashboard-selftest.ts`

```text
PASS: per-site production registry, admin dashboard, Bodega compatibility, and guarded morning cron are wired.

```

## PASS — `node node_modules/eslint/bin/eslint.js src/lib/traffic src/app/api/traffic src/app/api/internal/traffic src/app/layout.tsx src/app/vital-vibes/route.ts src/app/demo/pocket-cafe/route.ts src/app/customers/traffic/page.tsx src/app/customers/bodega-traffic/page.tsx scripts/traffic-pipeline-selftest.ts scripts/traffic-export.ts scripts/traffic-today.ts scripts/traffic-boundary-selftest.mjs traffic/templates/ColattaoTraffic.tsx`

```text

```


## PASS — full production build

Command: `node node_modules/next/dist/bin/next build --webpack` (Next.js 16.2.11).

- Compilation passed (42 seconds).
- TypeScript passed (46 seconds).
- Page-data collection passed.
- All 58 static pages generated (6.1 seconds). Pocket Cafe and Vital Vibes are dynamic standalone responses for explicit runtime activation.
- Page optimization and build traces completed; process exit code 0.
- Default Turbopack was attempted earlier and rejected the dependency junction pointing outside its filesystem root. Existing local dependencies were reused; Webpack verification passed without changing production build configuration or installing packages.

## Source and review evidence

- AMMA production deployment and origin/main matched `576c1ce61fdb26b47cf2ef999be2d00fae501652` at task start.
- Every final AMMA mapping has a real source route/file; the local-only Las Palmas pilot was removed. Redirect-only paths stay excluded.
- Colattao's five existing paths `/`, `/menu`, `/penalty`, `/market`, `/get-started` were verified against its local source at `22f403d73a8631fec3a72e78854af2965cf612f6`. Its app was not modified; production collection integration remains a template, not a completed deployment.
- Registry: 18 entries, comprising two customer-site mappings, one marketing site, fourteen public concepts and one experience group. This is not a count of active customers or configured collectors.
- Review checked origin/path conflicts, private/preview/internal exclusions, anonymous identifiers, idempotency, first-read SELECT-only behavior, DST boundaries, monitoring recovery and explicit POST-only send/write boundaries. React review confirmed optional after-hydration collection, no new client rendering dependency and no changes to menus/game behavior or QR routes.
- Browser visual verification remains unavailable because desktop browser discovery crashes; mocked browser-failure tests passed. No visual screenshots or real browser end-to-end pass are claimed.
- No live connection, real connector-readable production report, historical counts or provider quotas were verified. No push, deployment, live DB mutation, access change, paid feature, retention deletion or email send occurred.

## PASS — actual connection-initialization regression check

`node scripts/traffic-boundary-selftest.mjs` was rerun after adding a mocked actual pool factory (without constructor pool injection). Exactly one pool was created across the first report, observation and health reads; all six emitted statements were SELECTs. The full boundary suite passed. Focused lint of this added regression test also passed.

## Approved publication payload and preview guard verification

Before publication, the changed payload was checked for private-key blocks, live provider tokens, credential-bearing database URLs, JWTs, non-example env files and raw-data/key-file extensions. No findings were detected. Manual review confirmed synthetic test fixtures and aggregate-only reporting, with no raw customer records or credentials. The intended owner address already exists in the public production baseline.

Preview regressions passed even with email/monitoring opt-in flags set: non-production collection, health recording and email delivery are blocked in code, GETs cannot send, and report reads contain no schema initialization. Targeted lint passed. Publication is authorized for the branch and draft PR only; merge, production deployment, migration, collection activation, real email and access/spending changes remain gated.
