# Production traffic by site — 2026-10-01

## Source and isolation

`APP/web/src/lib/traffic/sites.ts` is the production-site registry. The API
helper in `vercel-web-analytics.ts` sends an independent query for each site,
with its own `projectId` and an OData filter containing **both** a verified
production hostname and an allowlist of public paths. It never requests an
unfiltered project total. A shared Vercel project does not imply shared client
traffic. Visitor totals are deduplicated within each site's filter; they must
not be summed across sites because the same person can visit multiple sites.

| Site | Vercel project | Verified public production hostname(s) | Public scope |
|---|---|---|---|
| Bodega Cafe | `amma-fina-calle` (`prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4`) | `bodegacafe757.com`, `www.bodegacafe757.com` | Live Bodega root/menu/game pages |
| Fina Calle OS | same shared project | `finacalleos.com`, `www.finacalleos.com` | Marketing/editorial pages only |
| Colattao Coffee House | `colattao-cafe-rush` (`prj_QQgDyof5KInoe8v8M02Q3iDuUWG9`) | `colattao-cafe-rush.vercel.app` | Published client home/menu/game/market pages |

These hostnames and project IDs were checked against the Vercel team's READY
production deployment aliases on 2026-10-01. The Colattao deployment had **no
custom domain** in its alias list; the stable public `vercel.app` alias is the
current production hostname, not a guessed future domain. The team also has
`fina-calle-landing` (legacy landing redirect to OS) and `newsroom-agent`
(internal tool); neither is a separate customer/public website in this report.
Preview deployment URLs, team-generated aliases, localhost, staging, abandoned
demos, owner/customer portals, API/auth routes and internal tools are excluded.
New customer sites require a verified production deployment/domain and deliberate
registry entry; they are never auto-enrolled from a Vercel project list.

The explicit path allowlists are intentionally conservative. They may omit a
new public page until its ownership is reviewed and the registry is updated.
The `/demo/bodega` path is an exception to the generic demo exclusion because
it is Bodega's **live guest menu** on its production hostname. Project Seed and
Scrambled concept/demo routes on `finacalleos.com` are not counted as Fina
Calle marketing traffic, nor assigned to a client site without launch approval.

## Private dashboard

`/customers/traffic` requires the existing Fina Calle admin session and is
`noindex`. It displays each site's own 30-day visitors, pageviews and public
path/day detail. There is no grand total. A denied, missing or malformed Web
Analytics response shows “unavailable — not zero.” The older
`/customers/bodega-traffic` detail view remains, now using the same registry
and filter. Vercel Analytics measures website traffic, **not QR scans**.

## Morning report

Vercel Cron calls `GET /api/internal/traffic/morning` at `12:12 UTC` every day
(07:12 EST or 08:12 EDT). The report covers the **previous complete Eastern
calendar day**, respecting DST. The handler requires Vercel's `CRON_SECRET`
Bearer header. It queries all registered sites independently, then sends **one
email with separate labeled sections** via the existing Resend HTTP integration.
It sends nothing when any site is unavailable, rather than presenting a partial
or misleading report. A deterministic Resend idempotency key for the report
date avoids duplicate deliveries on retries within Resend's idempotency window.

Production server-only settings:

- `VERCEL_WEB_ANALYTICS_TOKEN` (recommended access token with Web Analytics
  access to **both** Vercel projects; deployment OIDC is attempted if available)
- `CRON_SECRET` (Vercel Cron bearer secret; existing Square cron also uses it)
- `RESEND_API_KEY` and `REQUESTS_FROM_EMAIL` (already used by the request inbox)
- `TRAFFIC_MORNING_REPORT_EMAIL` (explicit private recipient)
- Optional `VERCEL_WEB_ANALYTICS_TEAM_ID` override

Do not place any of these secrets in `NEXT_PUBLIC_*`. The cron is code/config
only until the production variables are set, the PR is approved/deployed, and
the first authenticated run confirms delivery. Do not send a test email to an
unverified address. Inspect cron logs for `analytics_unavailable` or
`email_not_configured`; neither should be treated as zero traffic.

## First-party drain compatibility

The older `/api/traffic/drain` is **not** the dashboard/email data source. It
now requires a verified public hostname/path before an event is stored, writes
`site_id` to its dedicated Postgres table/JSONL record, and its protected
`/api/internal/traffic/today?site=<id>` endpoint requires one site. Existing
untagged historical rows remain `NULL` and are omitted because attribution
cannot be reconstructed safely. The CLI likewise requires an explicit site:
`npm run traffic:today -- bodega` (or `fina-calle` / `colattao`). Do not add the
drain counts to Web Analytics totals; it is a separate operational copy.

## Verification

Run from `APP/web`: `npm run traffic:selftest`,
`npm run bodega-traffic:selftest`, scoped ESLint, TypeScript and a production
build. After deployment, verify the admin page loads each site's own values,
that a synthetic preview/private event is excluded from drain tests, and that
one authenticated cron invocation yields three distinct sections. Review the
first email's date against the previous Eastern calendar day. If an API filter
is rejected by Vercel, fix the scope/query; never replace it with an unfiltered
project-wide total.
