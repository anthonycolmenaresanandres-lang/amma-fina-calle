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

- `VERCEL_WEB_ANALYTICS_PROJECT_ID`
- `VERCEL_WEB_ANALYTICS_TEAM_ID`

The Fina Calle production project/team IDs are safe non-secret defaults in the helper.

## Privacy / interpretation

This dashboard displays aggregated Web Analytics only. It does not store IP addresses or customer identities.

`Game opens` means pageviews on `/bodega-sessions-review`; it is not proof that a QR code was scanned. Exact QR attribution should be added later with a dedicated UTM or custom analytics event on the printed QR destination.

## Existing traffic drain

The older `/api/traffic/drain` pipeline remains untouched. It can still be activated separately for retained first-party copies/automation, but this dashboard does not depend on that database or drain.

## Verification

CI runs `npm run bodega-traffic:selftest`, plus normal lint/build and existing owner/Bodega safeguards. Production data availability must be verified after deployment; missing/denied Vercel API authorization renders a private setup state instead of substituting request-log counts.
