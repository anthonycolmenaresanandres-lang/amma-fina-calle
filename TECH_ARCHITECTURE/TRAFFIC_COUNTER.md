# First-party traffic counter (Colattao / Fina Calle)

Dashboard-free traffic reports, sourced from **Vercel Web Analytics** and stored
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
   npm run traffic:today ──►  GET /api/internal/traffic/today │  (bearer token)
```

We **reuse Vercel's own analytics as the source of truth** (same numbers as the
Vercel dashboard, with Vercel's bot filtering) and just route a copy to a store
we control. This is *not* a second, parallel counter.

## What lives where

| Piece | Path | Status |
|---|---|---|
| Drain receiver (auth + parse + store) | `APP/web/src/app/api/traffic/drain/route.ts` | ✅ built, tested |
| Protected report endpoint | `APP/web/src/app/api/internal/traffic/today/route.ts` | ✅ built, tested |
| Sanitize / parse / signature / store / date libs | `APP/web/src/lib/traffic/*` | ✅ built, tested |
| Local CLI report | `APP/web/scripts/traffic-today.ts` → `npm run traffic:today` | ✅ built, tested |
| Pipeline self-test (no DB/network) | `APP/web/scripts/traffic-selftest.ts` → `npm run traffic:selftest` | ✅ 21 checks pass |

## Privacy / guardrails

- **No PII ever stored** — no names, emails, phones, or IPs. "Unique visitors"
  uses Vercel's already-anonymized `deviceId`. (We never compute or store IP
  hashes ourselves; Vercel did the sensitive part upstream.)
- **Separate from Supabase** by design (project guardrail). The store uses its
  own `TRAFFIC_DATABASE_URL` — never the Supabase connection.
- **Customer routes protected.** `sanitizePath` keeps **public** storefront
  paths (e.g. `/m/colattao` — that's the traffic we want) but collapses
  authenticated portals to non-identifying labels: `/owner/...` → `/owner/:private`,
  `/customers/...` → `/customers/:private`. `/api`, `/auth`, `/_next` are dropped.
  Opaque ids (UUID/long-hex/numeric) collapse to `:id`.
- The drain endpoint is **public**, so it authenticates every request
  (`x-traffic-secret`, constant-time compare; also accepts Vercel's
  `x-vercel-signature` HMAC). Unauthenticated requests are rejected with 401 and
  nothing is stored.

## Environment variables

| Var | Where | Purpose |
|---|---|---|
| `TRAFFIC_DRAIN_SECRET` | Vercel project | Shared secret; sent by the drain as the `x-traffic-secret` header. |
| `TRAFFIC_REPORT_TOKEN` | Vercel project + local | Bearer token for the report endpoint / CLI. |
| `TRAFFIC_DATABASE_URL` | Vercel project | **Separate** Postgres connection (Vercel Postgres / Neon). If unset, a local `.data/` file store is used (dev/test only). |
| `TRAFFIC_TIMEZONE` | Vercel project | Report day boundary. Default `America/New_York`. |
| `TRAFFIC_REPORT_URL` | local | Base URL the CLI hits. Default `http://localhost:3000`. |

Generate secrets with e.g. `openssl rand -hex 32`. Never commit them.

## Go-live checklist (owner-side — needs Anthony + a deploy)

These steps require account access and a production deploy, so they're **not**
done in this PR. Nothing here ships without your approval.

1. **Confirm the Vercel plan supports Drains** (historically Pro/Enterprise).
   Note: the Vercel MCP token in the cloud session sees a different team with no
   projects, so the plan/project must be confirmed from your account.

2. **Enable Vercel Web Analytics** on the project (Dashboard → Analytics), then
   instrument the client so pageviews are recorded. This is the one change that
   touches the shared root layout (and therefore renders on the guarded `/m`,
   `/owner`, `/customers` routes), so it's left for your explicit sign-off:

   ```bash
   # in APP/web
   npm install @vercel/analytics
   ```
   ```tsx
   // APP/web/src/app/layout.tsx — inside <body>, after {children}
   import { Analytics } from "@vercel/analytics/next";
   // ...
   <Analytics />
   ```

3. **Provision a separate Postgres** (Vercel Postgres / Neon — a NEW database,
   not Supabase). Copy its connection string to `TRAFFIC_DATABASE_URL`. The
   `traffic_events` table is created automatically on first write.

4. **Set the env vars** above on the Vercel project. Add `TRAFFIC_REPORT_TOKEN`
   (and `TRAFFIC_REPORT_URL=https://<your-domain>`) to your local `.env` for the
   CLI.

5. **Deploy** (with approval), then **create the drain** pointed at the live
   webhook with the secret as a custom header:

   ```bash
   curl -X POST "https://api.vercel.com/v1/drains?teamId=<TEAM_ID>" \
     -H "Authorization: Bearer <VERCEL_ACCESS_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "traffic-counter",
       "url": "https://<your-domain>/api/traffic/drain",
       "deliveryFormat": "ndjson",
       "schemas": { "analytics": { "version": "v2" } },
       "headers": { "x-traffic-secret": "<TRAFFIC_DRAIN_SECRET>" }
     }'
   ```
   Validate delivery with `POST https://api.vercel.com/v1/drains/test`. (Exact
   field names can vary by API version — the Dashboard "Drains" UI is the
   fallback; the key requirements are the Analytics v2 schema, our URL, and the
   `x-traffic-secret` header.)

6. **Verify live:** browse the site, then `npm run traffic:today` — confirm real
   pageviews arrive.

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
- Multi-day / per-restaurant report ranges.
