# Traffic pipeline — prepared, not activated

Production baseline: `576c1ce61fdb26b47cf2ef999be2d00fae501652`, verified against `finacalleos.com` through Vercel on October 17, 2026. Isolated branch: `codex/site-traffic-reporting-20261017`.

This change is local preparation only. No deployment, live migration, database write, email send, credential creation, access change, paid drain, deletion, or new schedule was performed. Native Vercel dashboard access remains broken. There are no verified historical traffic numbers in this change.

## Collection and attribution

- The first-party collector sends optional anonymous **pageviews**, with a random event UUID for idempotency. It creates no persistent device/session identifier and no cross-site identifier. It excludes embedded frames to avoid counting a parent game page and its iframe twice.
- Hostname plus explicit rendered route determines the site. Client `site_id`/`siteId` is rejected. Shared `finacalleos.com` paths never all become Fina Calle marketing. Bodega's shared-host root belongs to Fina marketing; Bodega's custom-host root belongs to Bodega.
- `sites.ts` is the source-backed registry: Bodega, Fina Calle marketing, Colattao, Maracaibo, Olympia, Project Seed, Vital Vibes, Scrambled, Las Palmas, Gran Patron, Royal Chocolate, Aji Ichiban, Elsa's Place, Havana 58, Burger Plus, Pocket Cafe, A.J. Gator's guest portal concept, and separate Fina public games. There are two existing customer-site mappings (Bodega and Colattao), one marketing site, fourteen concept mappings and one public-experience group. These are not 18 active customers. The local-only Las Palmas pilot is excluded. A.J. Gator's and the Pocket Cafe menu were added after direct source review. Public concept/demo routes are labeled as such; registration is not evidence of client approval or adoption.
- Only verified hostnames are allowed. No deployment-preview aliases, arbitrary `/m/*`, arbitrary `/demo/*`, authenticated portals, API/auth routes, owner setup, or internal tools. Guest table identity is collapsed; the initial approved numeric range is 1–40. Other table identifiers remain unmeasured pending route review. Redirect-only URLs are omitted; the rendered destination counts once. Colattao's printed `/menu` URL is unchanged.
- `TRAFFIC_INGESTION_SOURCE` chooses exactly one store input: `disabled` (default), `first-party`, or existing `drain`. Never activate paid Vercel Drains for this plan. Native Vercel Analytics can remain separately installed; it does not write to this store. The old drain endpoint is inactive when first-party mode is selected.
- Query strings, hashes, raw IPs, email/name fields, auth tokens, cookies, and raw request bodies are not persisted or logged. Site-scoped historical drain identifiers use a one-way hash with device/session namespaces. Older already-stored identifiers are not rewritten; their continuity with newly namespaced values is unknown, so counts represent distinct tracked identifiers, never people.
- `traffic_test`, `internal_test`, `qa`, and `e2e` query tags suppress that browser tab's collector for the session. `traffic_internal=1`, Do Not Track and Global Privacy Control suppress it too. Add a test tag to QA URLs. Browser/storage/network errors are caught; menu/game interaction never waits for analytics.
- The receiver bounds the stream to 2 KiB, validates UUID/timestamp (five minutes old to one minute future), enforces origin/hostname agreement, and sheds load at 120 admitted events/site/minute and 600/instance/minute. These are **per-instance soft controls**, not a distributed bill cap. Public origin headers can be spoofed by non-browser clients. Bot resistance and real-user counts are not promised. Database concurrency and query time are bounded.

## Reports, dates and identity

`GET /api/internal/traffic/report?start=2026-09-17&end=2026-10-16&timezone=America%2FNew_York` accepts inclusive calendar labels and returns exact half-open instants:

`[2026-09-17T04:00:00.000Z, 2026-10-17T04:00:00.000Z)`.

Omitted dates mean the previous 30 **complete calendar days**, not a rolling 720 hours. Daily report boundaries use the preceding Eastern calendar day, including DST days of 23 or 25 hours. Maximum report range is 90 calendar days. The report contract accepts **America/New_York only**; unsupported timezones (including Australia/Sydney) return HTTP 400 until general timezone handling is implemented and tested. The protected today endpoint explicitly labels its current incomplete day. Reports require the existing report token or existing authorized admin session and return private/no-store JSON. Tokens belong in Authorization headers, never URLs.

All report reads, including the first read, execute **SELECT only**. Runtime reporting contains no CREATE/ALTER/INDEX. Prepared schema is in `migrations/001_dedicated_traffic.sql`; applying it is separately gated. The dedicated Neon store is kept separate from Supabase. A Supabase hostname or an explicitly shared application connection is rejected.

Period distinct identifiers are computed directly from the full selected event interval. Daily distinct counts are never summed into monthly uniques; distinct counts are never added across sites. First-party pageviews have no persistent identifier: their identifier metric is “not collected”, not a visitor count. `identifiedPageviews` exposes historical identifier coverage. Raw identifiers never appear in report output.

## Health and coverage

Current reports distinguish `unconfigured`, `unavailable`, `waiting`, `partial`, and `stale`. The older `ready`/`measured-zero` response types are retained for compatibility, but configuration probes cannot produce either state. Partial/stale reports can show **recorded** pageviews with their limitation; they are not complete period totals. Event timestamps alone never determine collector health. First/last stored pageviews, collection start, latest check, latest successful check, coverage interval and current freshness remain separate.

No health schedule is activated. The prepared `POST /api/internal/traffic/health` requires `TRAFFIC_HEALTH_RECORD_ENABLED=true`, Production, and the existing `CRON_SECRET`. It checks each verified public page for an enabled collector marker and HTTP availability, then records independent check intervals in the dedicated store. It does not run page JavaScript or count synthetic pageviews. HTTP probes are tagged `traffic_test=health`.

The monitor proves only page/configuration availability. A successful page response and meta marker do not prove that the collector JS exists, executes, delivers an event, or that `traffic_events` INSERT succeeds. **Configuration-only checks never establish complete coverage or measured zero**, even when consecutive successful probes span the entire requested period. `ingestionVerified` is false, `complete` is false, and collection start/covered-until remain unknown. First configuration check, latest successful configuration check and first/last recorded events are distinct metadata.

All checks in the requested bounded interval are counted in SQL, without a 10,000-row truncation. First, latest, and latest-successful probes are selected independently, so current configuration freshness is not lost on large or historical windows. A regression covers 25,920 five-minute checks across 90 days. This is aggregate diagnostics, not a claim of ingestion coverage. Separately verified ingestion-path evidence would require a future reviewed design with excluded synthetic events; no live synthetic event or such activation is performed here.

Monitor execution writes only after its separate activation approval. Every health/report GET is read-only. There is no traffic cron in `vercel.json`; the unrelated existing Square entry is unchanged.

## Static pages and Colattao

AMMA React routes use the global collector only in explicitly selected Production first-party mode. Vital Vibes and Pocket Cafe standalone responses have equivalent conditional script/marker and same-origin CSP allowance. Four independently served HTML concepts have **inactive** `data-enabled="false"` script hooks. Their activation requires explicit review: set their hook to true and add `<meta name="fc-traffic-collector" content="first-party-v1">`. They remain unverified/unhealthy until then.

The separate Colattao app is **not modified or deployed** by this branch. `templates/ColattaoTraffic.tsx` plus `public/traffic-collector.js` is the prepared integration for that app's root layout. It sends to AMMA's validated receiver without cookies. Its existing `/menu` route and QR signage remain unchanged. A separate scoped Colattao integration/review/deployment is required; a successful production page probe alone must never be treated as verified ingestion coverage.

## Daily owner delivery

The intended recipient is **anthonycolmenaresanandres@gmail.com**. Delivery is disabled by default and requires `TRAFFIC_EMAIL_ENABLED=true`, the exact approved recipient, the existing report-only email provider settings, and an authenticated **POST**. Every GET of `/api/internal/traffic/morning` inspects only and cannot send an email. Even a fully unhealthy day can produce a diagnostic report after authorized activation; failures never masquerade as zero. A deterministic provider idempotency key prevents duplicate sends for the same date.

No test email, recurring delivery, or scheduler was installed. Parent/user must confirm destination, frequency/timezone/time, and costs before any send or recurring job. The previous GET-send cron entry is removed from the local deployment template to prevent an accidental send on deployment. It has not been removed from live configuration.

## Costs and data bounds

Existing Vercel/Neon/Resend plan quotas, current usage, overage settings and spending caps are **unverified**: read-only plan inspection stalled and was interrupted. Do not claim zero incremental cost. The local change installs no dependency or paid feature, but first-party requests, DB writes/storage/compute, health probes and email delivery consume resources.

An all-site report currently executes up to 108 aggregate/read-only SELECTs (six per entry); query and pool limits bound concurrency, not total provider usage.

At 18 registered entries, one whole-site health run performs up to 18 public page fetches, 18 prior-check SELECTs and 18 small check INSERTs, plus connection overhead. A 15-minute schedule would mean up to 1,728 page probes/day; review provider allowances before choosing cadence. No such schedule is configured. Per-instance admission controls do not constrain total distributed traffic spend; activation must verify an adequate existing hard provider cap or stop for a cost decision. No upgrade or new cap/account setting is authorized here.

Reports bound time ranges/top lists/health rows; pageview payload size, timestamps, DB pool/query timeout and accepted routes are bounded. No raw-data deletion, retention job, TTL, archival upload, or automatic rollup cleanup exists. Raw event and check storage would grow after activation. Review projected daily volume, allowed storage, and a future retention proposal separately; do not execute DELETE/retention work without specific approval.

## Activation approvals — required, in order

1. Review this diff and offline test/build evidence. Confirm all site mappings and concept labels, static hooks, and the separate Colattao integration scope.
2. Read existing provider plan/usage/overage caps through authorized access. If unavailable, stop activation. Decide the allowed load within existing spending limits; do not buy or enable anything paid.
3. Approve the prepared migration **on the existing dedicated traffic database only** after verifying its identity, schema and existing indexes. Reuse existing authorized credentials; do not retrieve/decrypt production secrets to discover a connection or create new credentials/access.
4. Separately approve AMMA and Colattao production deployment/configuration with exactly one input source. Keep email and monitoring flags false initially. Review/enable static hooks only for approved public pages.
5. Validate the read-only report JSON through an actual existing authorized connector/CLI connection and record its exact interval and returned states. Then approve and verify independent health monitoring writes/cadence within existing quotas. Do not claim operational browser independence from local mocked tests.
6. Parent/user confirms owner destination, daily frequency/time and costs; separately authorizes a test send. Only after review, approve recurring POST delivery using existing infrastructure. Nothing here creates credentials or a schedule.

## Safe historical retrieval

The native Vercel analytics dashboards remain the primary possible source before collection began. Their total must be filtered by hostname **and** public route, especially AMMA. Aji Ichiban, Elsa's Place and Havana 58 launched October 17 and are outside September 17–October 16.

With an **already configured authorized dedicated connection**, `npm run traffic:export -- 2026-09-17 2026-10-16 America/New_York` executes aggregate SELECTs only; it never discovers or prints a connection string. Alternatively the protected report GET above works after approved deployment using the existing report token/admin context. Neither is verified operationally in this session because no local connection exists and nothing has been deployed. No credentials are requested or created by these tools.

Stored rows with NULL/unproven site attribution are excluded; they cannot safely be reassigned. No history is backfilled. A configured database or a 404 analytics API response proves neither event presence nor absence. Database creation on October 1 does not prove collection began on that date. Missing/stale/unavailable evidence must remain explicitly unknown in Anthony's historical report.

## Separate approval gates

- **Code publication:** permission to push this branch/open a PR only. Review whether the repository's automatic preview builds would run and consume existing allowance. This local commit authorizes neither a push nor a preview/production deployment.
- **Database:** separate approval to apply the prepared migration to the verified dedicated traffic store, with existing authorized access. No Supabase changes.
- **Collection:** separate approval for AMMA/Colattao deployment, selected public concepts/static hooks, input mode, and monitoring writes/cadence, after existing quotas and hard spending limits are verified.
- **Email:** confirm the verified owner destination, exact frequency/time/timezone, provider allowance and a test send before any recurring authenticated POST delivery. Native Vercel Cron uses GET; this branch installs no schedule and every GET remains read-only. A suitable existing scheduler must be verified before proposing activation.
- **Credentials/access:** no new credentials, secret discovery/decryption, grants or account changes are needed for the local code. If existing authorized access is absent during activation, stop and identify that distinct requirement; none is authorized by the code-publication decision.

## PR review corrections

Configuration-only page/meta checks do not verify collector JavaScript or event INSERTs. All such checks, including existing stored rows, remain unverified for ingestion; they cannot establish complete traffic coverage or measured zero. Recorded pageviews remain explicitly partial/stale/waiting. No synthetic live event was introduced.

Diagnostic queries now aggregate the full requested interval and independently select first, latest and latest-successful probes. They do not return the first 10,000 rows or lose current freshness on 90-day windows. Offline regressions exercise 25,920 checks, a subsequent failure, and historical subranges. `traffic:selftest` includes these pipeline regressions and is already run by the existing CI workflow.

All report/date-range entry points support America/New_York only. Australia/Sydney and other unsupported timezones are rejected; 23-hour and 25-hour Eastern DST-day tests remain in place.
