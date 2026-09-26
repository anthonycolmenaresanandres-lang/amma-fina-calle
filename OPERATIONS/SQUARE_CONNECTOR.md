# Fina Calle Square Connector

## Current scope
Prepared, private, read-only catalog integration. Bodega owners authorize Fina Calle through Square OAuth; they do not share passwords or personal access tokens. Permissions: `ITEMS_READ` and `MERCHANT_PROFILE_READ`. No `ITEMS_WRITE`, sales, customer or payment permissions.

The public QR menu is NOT connected to this mirror. Syncing only updates the private insights view. A future publishing workflow must use approved stable product/variation IDs, an explicitly chosen location, environment isolation and a validated complete snapshot. Exact-name matching is not a safe publication contract. Removals, names, descriptions, categories and artwork require review. The current cleanup removes the earlier automatic name-based overlay.

## Configuration (manual, separate from this PR)
Square Developer Console, separately for Sandbox and Production:
- OAuth redirect: `https://finacalleos.com/api/integrations/square/callback`
- Webhook: `https://finacalleos.com/api/integrations/square/webhook`
- Events: `catalog.version.updated` and `oauth.authorization.revoked`
- API version in the prepared configuration: `2026-09-16`; verify against the selected app before activation.

Server-only values: `SQUARE_ENVIRONMENT`, `SQUARE_APPLICATION_ID`, `SQUARE_APPLICATION_SECRET`, `SQUARE_WEBHOOK_SIGNATURE_KEY`, `SQUARE_WEBHOOK_URL`, `SQUARE_TOKEN_ENCRYPTION_KEY` (base64-encoded 32 bytes), `SQUARE_API_VERSION`, and `CRON_SECRET`. No real secret was added by this change. Start OAuth from the configured callback's origin so its state cookie returns to the same host. Production and Sandbox credentials/databases must not be mixed.

## Storage and lifecycle
Apply prepared migrations `0020`, `0021`, then `0022` in a controlled environment. Earlier migrations are not rewritten by the cleanup.
- Access and refresh tokens are encrypted with AES-256-GCM.
- Fresh OAuth authorization atomically replaces the connection and clears the previous catalog. Failed replacement rolls back both changes.
- Disconnect/revocation cascades to the cached catalog in the same database transaction.
- Catalog writes validate the connection generation and active sync lease; an old worker cannot repopulate a reconnected restaurant.
- Catalog versions and successful checkpoints remain monotonic. The mirror is private; partially completed imports never alter the guest menu.
- Webhook duplicates return success only for completed processing. In-flight/failed work remains retryable.
- The prepared daily Vercel Cron refreshes tokens older than six days. It is not active until configured and deployed. Review failed refreshes; a stored connection is not proof that credentials remain valid.

## Guest-note safeguards
Notes persist without a restaurant id and therefore stay in Fina Calle's admin intake, outside tenant owner-read policies. The Bodega email recipient remains unconfigured by this task. Setting a confirmed notification address is separate from granting owner-portal visibility.

Intake uses a hashed, trusted Vercel client address, five requests per address per ten minutes and a global safety ceiling of 300 per ten minutes. A denied client does not consume the shared budget. Shared networks share a client bucket. The limiter fails closed on missing trusted identity or database failure; the form retains the guest's text. Stale client buckets are pruned in bounded batches after 24 hours. Non-Vercel production hosting requires a reviewed trusted-proxy adapter.

## Verification and activation boundary
`npm run bodega-launch:selftest` runs source/asset and client-identity checks. `node scripts/square-cleanup-db-selftest.mjs` runs actual isolated PGlite migrations and behavior tests. Existing CI runs both, plus lint, owner/billing safeguards and the production build.

Before activation: verify the exact-head CI and preview; test the complete OAuth flow, configured origin, selected merchant/location, cancellation, expiry, refresh, revoked credentials, webhook retries/pagination and multi-connection contention in staging. PGlite serializes one connection and does not certify production concurrency. For catalogs exceeding request budgets, use a durable background worker before activation rather than assuming an inline webhook can finish in time.

Only after those checks may an authorized owner connect the Production application. No migration, secret setup, Bodega authorization, reward activation, external send, merge, public-menu publication or production deployment is performed by this cleanup.

Cleanup record: `OPERATIONS/SQUARE_CLEANUP_20260926.md` (Queue 70 / PR 266).
