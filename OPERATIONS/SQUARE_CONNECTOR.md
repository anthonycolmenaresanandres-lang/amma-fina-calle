# Fina Calle Square Connector

## Purpose

Fina Calle connects to each restaurant through Square OAuth. Restaurant owners authorize the Fina Calle application in Square; they never send Fina Calle a password or personal access token.

## Launch permissions

- `ITEMS_READ`
- `MERCHANT_PROFILE_READ`

`ITEMS_WRITE` is intentionally excluded. The launch connector is read-only in Square.

## Square Developer Console

Configure both Sandbox and Production separately.

- OAuth redirect URL: `https://finacalleos.com/api/integrations/square/callback`
- Webhook URL: `https://finacalleos.com/api/integrations/square/webhook`
- Webhook events: `catalog.version.updated` and `oauth.authorization.revoked`
- API version: `2026-09-16`

Test the complete flow in Sandbox before changing `SQUARE_ENVIRONMENT` to `production`.

## Vercel server-only values

- `SQUARE_ENVIRONMENT`
- `SQUARE_APPLICATION_ID`
- `SQUARE_APPLICATION_SECRET`
- `SQUARE_WEBHOOK_SIGNATURE_KEY`
- `SQUARE_WEBHOOK_URL`
- `SQUARE_TOKEN_ENCRYPTION_KEY` — base64 32-byte key
- `SQUARE_API_VERSION`
- `CRON_SECRET`

Never expose these through `NEXT_PUBLIC_*`, source control, owner forms, screenshots, or chat.

## Runtime flow

1. Authorized owner selects **Connect Square**.
2. Fina Calle creates a CSRF state and sends the owner to Square OAuth.
3. Square redirects to the callback with a one-time authorization code.
4. Fina Calle exchanges the code server-side, encrypts the access and refresh tokens with AES-256-GCM, and stores them in Supabase.
5. The first catalog sync imports `ITEM`, `CATEGORY`, and `MODIFIER_LIST` objects into the read-only mirror.
6. Square `catalog.version.updated` webhooks trigger incremental syncs.
7. A database lease serializes syncs per restaurant; catalog writes are version-monotonic and webhook event IDs are claimed atomically.
8. Vercel Cron checks daily for OAuth tokens older than six days and refreshes them before Square's 30-day access-token expiry.

## Menu publishing policy

For the Bodega pilot, the designed Fina Calle menu remains the presentation layer.

Automatic:
- exact matched Square price changes
- exact matched Square item removals

Review first:
- new items
- renamed items
- new or renamed categories
- descriptions
- images and artwork
- layout

This prevents Square from flattening the designed QR menu while still eliminating routine price maintenance.

## Activation order

1. Merge and deploy code with Square variables unset.
2. Apply migration `0020_bodega_square_read_model.sql`.
3. Create/configure the Fina Calle Square application in Sandbox.
4. Add Sandbox values to Vercel and redeploy.
5. Sign in as an authorized Bodega owner and use `/owner/bodega/insights` → **Connect Square**.
6. Confirm first sync, price overlay, webhook redelivery behavior, and token refresh.
7. Configure Production Square values and webhook subscription.
8. Switch `SQUARE_ENVIRONMENT=production`, redeploy, and have Bodega authorize the production connection.
