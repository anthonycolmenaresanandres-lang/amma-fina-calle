# Bodega traffic dashboard — 2026-09-26

## Purpose

Give Fina Calle administrators a private 30-day Bodega traffic report without relying on runtime request logs or inventing unique-visitor estimates.

Private route:

`/customers/bodega-traffic`

It uses the existing Fina Calle admin authentication (`getAdminContext`). The public Bodega owner desk remains public and contains no analytics.

## Source of truth

Vercel Web Analytics API:

- `GET /v1/query/web-analytics/visits/count`
- `GET /v1/query/web-analytics/visits/aggregate`

Production scope is the Bodega hostname:

- `bodegacafe757.com`
- `www.bodegacafe757.com`

The report shows:

- unique visitors
- pageviews
- Bodega Vibra game opens
- unique game visitors
- daily pageviews
- top paths
- top referrer hostnames

The visitor total is requested in one hostname-scoped count query so a visitor who opens multiple Bodega pages is not naively summed across pages.

## Authentication

The server tries credentials in this order:

1. `VERCEL_WEB_ANALYTICS_TOKEN`
2. `VERCEL_TOKEN`
3. automatic `VERCEL_OIDC_TOKEN`

No token is exposed to the browser. If the deployment OIDC token is not accepted by the Web Analytics endpoint, configure a server-only Vercel access token as `VERCEL_WEB_ANALYTICS_TOKEN`.

Optional project/team overrides:

- `VERCEL_WEB_ANALYTICS_TEAM_ID`

The verified project IDs and host/path scopes now live in the multi-site registry
(`APP/web/src/lib/traffic/sites.ts`), not a Bodega-only helper override.

## Privacy / interpretation

This dashboard displays aggregated Web Analytics only. It does not store IP addresses or customer identities.

`Game opens` means pageviews on `/bodega-sessions-review`; it is not proof that a QR code was scanned. Exact QR attribution should be added later with a dedicated UTM or custom analytics event on the printed QR destination.

## Existing traffic drain

The older `/api/traffic/drain` pipeline remains independent of this dashboard.
As of 2026-10-01, it tags verified events by site and excludes unattributable
legacy rows from reports; see `TECH_ARCHITECTURE/MULTI_SITE_TRAFFIC.md`.

## Verification

CI runs `npm run bodega-traffic:selftest`, plus normal lint/build and existing owner/Bodega safeguards. Production data availability must be verified after deployment; missing/denied Vercel API authorization renders a private setup state instead of substituting request-log counts.
