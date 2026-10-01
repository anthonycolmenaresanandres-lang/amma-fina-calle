# Production traffic by site — activation runbook (2026-10-01)

## Why the first version did not display numbers

The deployed `/customers/traffic` page queried Vercel's Web Analytics API with a
`requestHostname` filter. [Vercel's public API reference](https://vercel.com/docs/rest-api/web-analytics/aggregates-page-views)
does **not** support that dimension as an API filter, even though the native
Analytics UI can filter by Hostnames. The main AMMA project serves both Bodega
and Fina Calle; removing the hostname filter would combine their traffic, so
that is not a safe fix. The count endpoint also reports lifetime production
traffic, not the 30-day period the page labeled. Finally, production had no
project-scoped Web Analytics access token, traffic database, or drain secret.
The native Vercel Analytics dashboard is collecting data, but its unfiltered
project total must never be displayed as either client's total.

## Source and isolation

The repaired dashboard and morning email read the existing first-party
`/api/traffic/drain` copy of **Vercel Web Analytics pageviews**. It is not a
parallel client-side counter. An event enters storage only when its Vercel
project ID, production environment, production hostname, and explicitly
allowed public path match one registry entry in `APP/web/src/lib/traffic/sites.ts`.
Preview, staging, unknown domains, private portals, API routes, demos not
approved as live menus, and custom events are excluded. Replayed drain events
are deduplicated. Each report query is scoped by `site_id`; no project-wide
number or combined cross-client total exists.

| Site | Vercel project | Verified production hostnames |
|---|---|---|
| Bodega Cafe | `amma-fina-calle` | `bodegacafe757.com`, `www.bodegacafe757.com` |
| Fina Calle OS | `amma-fina-calle` | `finacalleos.com`, `www.finacalleos.com` |
| Colattao Coffee House | `colattao-cafe-rush` | `colattao-cafe-rush.vercel.app` |

The production hostnames and project IDs were checked against READY deployment
aliases on 2026-10-01. Colattao had no custom hostname in its production
aliases. The Fina Calle marketing scope excludes hosted client menus and games.
`/demo/bodega` is a live Bodega guest menu and is deliberately included only
on Bodega's production hostname. New sites need a reviewed registry entry.

## Meaning of the numbers

The dashboard shows the last 30 days of **forwarded, verified public pageviews**
and distinct anonymized Vercel device/session IDs within each site. These are
tracked devices, not a count of identifiable people. The daily
rows use Eastern calendar dates. Referrer detail is best-effort because Vercel
does not always forward an external referrer. The first and latest verified
pageviews are visible for coverage and freshness. This measures website visits, not guaranteed physical
QR scans. It is not a historical backfill: collection starts only after the
drain is enabled. Native Vercel Analytics retains earlier project data and can
be filtered by Hostnames in the Vercel UI.

The dashboard distinguishes missing production settings, a failed store query,
waiting for a site's first verified pageview, and an empty selected period after
earlier verified pageviews. It never turns an absent feed into a zero visit claim.
The previous complete Eastern day report can include available site figures and
label another site's missing coverage. It sends nothing if no site has verified
figures for the day or email configuration is absent.

## Production configuration observed on 2026-10-01

The Vercel team is on Pro. Team Settings → Drains says **no drains are associated
with this team**. The AMMA project's Storage view offers two **suspended
Supabase** databases and a Blob store, but no dedicated traffic Postgres. Its
Project environment list contains `REQUESTS_FROM_EMAIL` but none of
`TRAFFIC_DATABASE_URL`, `TRAFFIC_DRAIN_SECRET`, `CRON_SECRET`,
`RESEND_API_KEY`, or `TRAFFIC_MORNING_REPORT_EMAIL`. Team Shared variables is
empty. No secret values were revealed. Colattao has its own project-scoped
`RESEND_API_KEY`; that value is not available to the AMMA project.

## Owner activation steps

Database creation, credential entry, drain creation, and email activation are
production account changes. The code merge alone cannot produce live numbers.

1. In Vercel Storage, create a **dedicated Neon Postgres** traffic database,
   separate from the suspended Supabase application stores. The Neon setup
   currently pauses at **Accept and Create**, which accepts Vercel and Neon legal
   terms and shares Vercel account details with Neon; Anthony must complete
   that decision. Connect the new database only to `amma-fina-calle`, and set
   its pooled production connection string as the server-only
   `TRAFFIC_DATABASE_URL`. The current `@vercel/postgres` adapter requires a
   Neon **pooled** URL (host contains `-pooler.`). The receiver creates its table
   and indexes on first write. Confirm the Vercel/Neon plan and limits before
   creation.
2. Create a drain signing secret and set it as the production server-only
   `TRAFFIC_DRAIN_SECRET`. Do not paste it in chat, commit it, or use
   `NEXT_PUBLIC_*`. Redeploy after production environment changes.
3. In Vercel team Drains, create a **Web Analytics** drain at 100% sampling for
   the verified `amma-fina-calle` and `colattao-cafe-rush` projects. Send JSON
   or NDJSON to `https://finacalleos.com/api/traffic/drain`. Configure
   `x-traffic-secret` with the same signing secret, or use Vercel's signature
   secret and `x-vercel-signature`. Preserve `projectId`, `vercelEnvironment`,
   `origin`, `path`, `eventType`, `timestamp`, and `deviceId`/`sessionId` fields.
4. A drain test that returns HTTP 200 only confirms delivery; the test payload
   may contain zero accepted site pageviews. Visit one listed public path on
   each production hostname. In the private dashboard, verify each site
   receives only its own pageviews and its first/latest observation timestamps.
   Check the receiver's `received` and `sites` response or runtime log. A missing site remains waiting; do not
   replace it with the unfiltered Vercel project count.
5. Only after all sites are verified, configure `CRON_SECRET`, `RESEND_API_KEY`,
   `REQUESTS_FROM_EMAIL`, and `TRAFFIC_MORNING_REPORT_EMAIL` for the private
   morning report. The cron route uses a previous complete Eastern day and
   sends one email with separate labeled sections and explicit missing-coverage
   status. Confirm the recipient and one report before relying on the automation.

The database and drain have no safe historical backfill from the Web Analytics
API because that API cannot filter by hostname for the shared project. Do not
mix manual Vercel dashboard exports into live counters. Historical screenshot
ledger entries remain separately labeled in `BUSINESS/ANALYTICS`.

## Verification

Run `npm run traffic:selftest`, `npm run bodega-traffic:selftest`, scoped
ESLint/TypeScript and a production build from `APP/web`. After an approved
deployment, inspect one event per production host, a preview/private exclusion,
the timestamp and site labels, and the first complete morning report.
