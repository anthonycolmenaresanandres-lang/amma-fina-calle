# Production traffic by site — repair prepared 2026-10-01

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
and distinct anonymized Vercel device/session IDs within each site. The daily
rows use Eastern calendar dates. Referrer detail is best-effort because Vercel
does not always forward an external referrer. The latest received event is
visible for freshness. This measures website visits, not guaranteed physical
QR scans. It is not a historical backfill: collection starts only after the
drain is enabled. Native Vercel Analytics retains earlier project data and can
be filtered by Hostnames in the Vercel UI.

If the dedicated production database is absent, a query fails, or no verified
events arrive for a site in the selected period, that site displays
**unavailable, not zero**. A missing event stream cannot establish a genuine
zero. The previous complete Eastern day report sends nothing unless all three
sites have verified data for that day and email configuration is ready.

## Owner activation steps (not completed by code merge)

These are account, credential, storage, and production changes for Anthony to
approve and perform. Merging this code alone will **not** make numbers appear.

1. Provision a **dedicated Postgres** traffic database, separate from the
   Supabase application database. Set its server-only production connection
   string as `TRAFFIC_DATABASE_URL` on the `amma-fina-calle` Vercel project.
   The receiver creates its table and indexes on first write.
2. Generate a drain signing secret and set it as the production server-only
   `TRAFFIC_DRAIN_SECRET`. Do not paste it in chat, commit it, or use
   `NEXT_PUBLIC_*`. Redeploy after production env changes.
3. In Vercel team Drains, create a **Web Analytics** drain at 100% sampling for
   the verified `amma-fina-calle` and `colattao-cafe-rush` projects. Send JSON
   or NDJSON to `https://finacalleos.com/api/traffic/drain`. Configure
   `x-traffic-secret` with the same signing secret, or use Vercel's signature
   secret and `x-vercel-signature`. Preserve `projectId`, `vercelEnvironment`,
   `origin`, `path`, `eventType`, `timestamp`, and `deviceId`/`sessionId` fields.
4. Verify the drain's test delivery and then visit one listed public path on
   each production hostname. In the private dashboard, verify each site
   receives only its own pageviews. A missing site remains unavailable; do not
   replace it with the unfiltered Vercel project count.
5. Only after all sites are verified, configure `CRON_SECRET`, `RESEND_API_KEY`,
   `REQUESTS_FROM_EMAIL`, and `TRAFFIC_MORNING_REPORT_EMAIL` for the private
   morning report. The cron route uses a previous complete Eastern day and
   sends one email with separate labeled sections. Confirm the recipient and
   one report before relying on the automation.

The database and drain have no safe historical backfill from the Web Analytics
API because that API cannot filter by hostname for the shared project. Do not
mix manual Vercel dashboard exports into live counters. Historical screenshot
ledger entries remain separately labeled in `BUSINESS/ANALYTICS`.

## Verification

Run `npm run traffic:selftest`, `npm run bodega-traffic:selftest`, scoped
ESLint/TypeScript and a production build from `APP/web`. After an approved
deployment, inspect one event per production host, a preview/private exclusion,
the timestamp and site labels, and the first complete morning report.
