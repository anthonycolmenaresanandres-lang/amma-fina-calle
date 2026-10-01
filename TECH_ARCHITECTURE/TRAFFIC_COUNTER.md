# First-party, site-separated Vercel traffic copy

Site-scoped first-party traffic copies, sourced from **Vercel Web Analytics** and stored
in **our own database** so we can read numbers from a terminal and keep them
going forward.

## How it works

```
Vercel Web Analytics  ──(Drain: vercel.analytics.v2)──►  POST /api/traffic/drain
                                                              │  verify secret
                                                              │  parse + sanitize
                                                              ▼
                                                   separate store (Postgres or
                                                   local file fallback)
                                                              ▲
   npm run traffic:today -- <site> ──► GET /api/internal/traffic/today?site=<site> │ (bearer token)
```

We **reuse Vercel's own analytics as the source of events** (including its bot
filtering) and route a verified public-page subset to a store we control. This
is *not* a second, parallel browser counter, but the scoped numbers need not
equal the Vercel project's unfiltered dashboard total.

## What lives where

| Piece | Path | Status |
|---|---|---|
| Drain receiver (auth + parse + store) | `APP/web/src/app/api/traffic/drain/route.ts` | ✅ built, tested |
| Protected report endpoint | `APP/web/src/app/api/internal/traffic/today/route.ts` | ✅ built, tested |
| Sanitize / parse / signature / store / date libs | `APP/web/src/lib/traffic/*` | ✅ built, tested |
| Local CLI report | `APP/web/scripts/traffic-today.ts` → `npm run traffic:today` | ✅ built, tested |
| Pipeline self-test (no DB/network) | `APP/web/scripts/traffic-selftest.ts` → `npm run traffic:selftest` | ✅ source checks pass |

## Privacy / guardrails

- **No direct customer identifiers stored** — no names, emails, phones, or IPs. "Distinct devices"
  uses Vercel's already-anonymized `deviceId`. (We never compute or store IP
  hashes ourselves; Vercel did the sensitive part upstream.)
- **Separate from Supabase** by design (project guardrail). The store uses its
  own Neon-injected `TRAFFIC_DATABASE_DATABASE_URL` (or manual
  `TRAFFIC_DATABASE_URL` fallback) — never the Supabase connection.
- **Customer routes protected.** `sanitizePath` keeps **public** storefront
  paths (e.g. `/m/colattao` — that's the traffic we want) but collapses
  authenticated portals to non-identifying labels: `/owner/...` → `/owner/:private`,
  `/customers/...` → `/customers/:private`. These private labels are **not** in
  any site's public allowlist, so they are excluded from traffic reports.
  `/api`, `/auth`, `/_next` are dropped.
  Opaque ids (UUID/long-hex/numeric) collapse to `:id`.
- The drain endpoint is **public**, so it authenticates every request
  (`x-traffic-secret`, constant-time compare; also accepts Vercel's
  `x-vercel-signature` HMAC). Unauthenticated requests are rejected with 401 and
  nothing is stored.

## Environment variables

| Var | Where | Purpose |
|---|---|---|
| `TRAFFIC_DRAIN_SECRET` | Vercel project Production Secret | Shared secret; Vercel signs the drain body in `x-vercel-signature`. |
| `TRAFFIC_REPORT_TOKEN` | Vercel project + local | Bearer token for the report endpoint / CLI. |
| `TRAFFIC_DATABASE_DATABASE_URL` | Neon integration, Vercel project Production | **Separate** pooled Postgres connection. The integration injects it automatically. |
| `TRAFFIC_DATABASE_URL` | Vercel project (optional fallback) | Manual dedicated Postgres connection only when the Neon integration key is unavailable. With neither URL, a local `.data/` file store is used in dev/test only. |
| `TRAFFIC_TIMEZONE` | Vercel project | Report day boundary. Default `America/New_York`. |
| `TRAFFIC_REPORT_URL` | local | Base URL the CLI hits. Default `http://localhost:3000`. |

Generate secrets with e.g. `openssl rand -hex 32`. Never commit them.

## Production activation

The current Vercel inventory, dedicated Neon Postgres setup, production
environment variables, drain configuration, and per-site verification sequence
are in [`MULTI_SITE_TRAFFIC.md`](./MULTI_SITE_TRAFFIC.md). Use that runbook for
activation. The optional local `TRAFFIC_REPORT_TOKEN` CLI is separate from the
private multi-site dashboard and morning email.

## Local development / testing

```bash
cd APP/web
npm run traffic:selftest          # full pipeline, no DB or network needed
# manual end-to-end against a local server (file store):
TRAFFIC_DRAIN_SECRET=s TRAFFIC_REPORT_TOKEN=t npm run build && npx next start
# POST ndjson to /api/traffic/drain with header x-traffic-secret: s
# GET /api/internal/traffic/today with Authorization: Bearer t
```

## Future optimizations (not built yet)

- **Daily rollups** (`traffic_daily_rollups`) + a cron to pre-aggregate and
  **prune raw events** past a retention window (cost + privacy). The live report
  currently queries raw events directly, which is fine at a single storefront's
  volume.
- A retention policy for raw events, with sufficient daily rollups for the
  dashboard's 30-day window and the morning report.
