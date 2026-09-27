# Fina Calle Square onboarding and credential custody

Status checked 2026-09-27. This is the company procedure for a **read-only private catalog mirror**. Bodega's guest menu is not automatically updated by Square, and Bodega's muffin reward remains off.

The current client-specific evidence and unsent invitation draft are in [BODEGA_SQUARE_CONNECTION.md](BODEGA_SQUARE_CONNECTION.md).

## Verified state and next gate

- Connector code and read-only owner view are in the Fina Calle repo. The production database has Square migrations `0020`, `0021`, and `0022`, but the last read-only audit found **zero Square connections** and **zero Bodega owner allowlist/restaurant records**. Recheck the live database before an owner connects.
- The Amma Ventures Square seller Dashboard and signed-in Developer Console were confirmed on 2026-09-27. Anthony approved Square Developer Terms acceptance and application creation. The application is **Fina Calle Connector** (Square's form disallowed the word “Square” in the name), Production ID `sq0idp-lFTKZfAvjszQvlWyI1nzPg`, [Console](https://developer.squareup.com/console/en/apps/sq0idp-lFTKZfAvjszQvlWyI1nzPg/oauth). The production OAuth redirect was saved and read back as `https://finacalleos.com/api/integrations/square/callback`. No app secret or token was copied into the repo.
- The Vercel `amma-fina-calle` project now has five Production-only, non-secret Config variables: `SQUARE_ENVIRONMENT=production`, `SQUARE_APPLICATION_ID`, `SQUARE_OAUTH_CALLBACK_URL`, `SQUARE_WEBHOOK_URL`, and `SQUARE_API_VERSION=2026-09-16`. They were read back by name and Production scope on 2026-09-27. Vercel confirmed **a new deployment is needed** for them to take effect. No Square secret variables or `CRON_SECRET` were present in project/shared scopes at the check; production OAuth, webhook verification, and refresh cron are therefore not ready.
- Anthony approved a production webhook subscription. `Fina Calle Catalog Mirror` is enabled in Square with ID `wbhk_7a625ade3c0e49a5aa4fffb62932f4ad`, API version `2026-09-16`, URL `https://finacalleos.com/api/integrations/square/webhook`, and only `catalog.version.updated` plus `oauth.authorization.revoked`. Its signature key remains masked in the Console and is not installed in Vercel. Until all server-only settings are in place, the endpoint returns 503 and cannot process events; do not run Bodega authorization yet.
- Anthony supplied `bodegacafe757@gmail.com` as the Bodega contact. It is not yet independently verified as an authorized owner login, and the production database has no Bodega restaurant, owner allowlist, or matching Auth user. Keep the email out of the guest-note recipient setting.
- Bodega's Square merchant and exact operating location must be confirmed by Bodega's authorized owner. AMMA must not ask for their Square password or personal access token.
- The OAuth callback and webhook endpoints are `https://finacalleos.com/api/integrations/square/callback` and `https://finacalleos.com/api/integrations/square/webhook`. An OAuth attempt always starts on the callback's origin, so its host-only state cookie returns to the same host.

## Company Square Developer account

1. Anthony chooses the company-controlled mailbox and country matching AMMA's legal business. Check whether a Square Developer account already exists for that mailbox before creating another.
2. Anthony enters the new password, reviews and accepts Square's terms, completes any captcha and email/MFA verification himself. Enable MFA and save recovery codes in the company password manager. Do not put passwords, codes, screenshots of secrets, or recovery codes in this repo or chat.
3. In the Developer Console use the application **Fina Calle Connector** under the Amma Ventures account. Use its separate Sandbox and Production credential sets. Do not activate payment acceptance just to use the developer APIs.
4. Record only non-secret metadata here: application name, environment, application ID, Console link, creator/custodian, creation date, business owner, rotation review date, and the password-manager **item names**. Never record values for the application secret, token encryption key, webhook signature key, OAuth tokens, or owner passwords.

### Credential register (fill identifiers after creation, never values)

| Item | Environment | System of record | Custodian | Status |
| --- | --- | --- | --- | --- |
| Square Developer account login + MFA recovery | Company | Company password manager | Anthony | Amma Ventures sign-in confirmed; MFA/recovery custody not checked |
| Square application ID | Sandbox / Production | Developer Console and Vercel env | Anthony | Production ID `sq0idp-lFTKZfAvjszQvlWyI1nzPg` in Console and Production Vercel Config; deployment pending |
| Square application secret | Sandbox / Production | Company password manager → Vercel server env | Anthony | Unset |
| Square webhook signature key | Sandbox / Production | Company password manager → Vercel server env | Anthony | Unset |
| `SQUARE_TOKEN_ENCRYPTION_KEY` | Sandbox / Production | Company password manager → Vercel server env | Anthony | Unset |
| `CRON_SECRET` | Deployment | Company password manager → Vercel server env | Anthony | Not found in project or shared Vercel env on 2026-09-27 |
| Bodega owner access | Production | Supabase Auth + `owner_emails` | Anthony + verified Bodega owner | Supplied contact address recorded; owner identity/assignment unconfirmed |

Access is limited to designated AMMA administrators. Review access quarterly and at staff departure. Rotate application secret, webhook key, and encryption key using a documented maintenance window; **re-encrypt stored OAuth tokens before changing the encryption key** or all existing connections become unreadable. After suspected exposure, revoke the affected Square authorization, rotate the affected credential, review webhook/connection logs, reconnect the merchant, and record the incident without copying the secret into the incident record.

## Sandbox first

1. Configure Sandbox OAuth redirect and webhook URL in the Square Developer Console. Select `catalog.version.updated` and `oauth.authorization.revoked`; verify the current Square API version and available event names in the Console.
2. Create a separate non-production deployment and database. Set server-only `SQUARE_ENVIRONMENT=sandbox`, `SQUARE_APPLICATION_ID`, `SQUARE_APPLICATION_SECRET`, `SQUARE_OAUTH_CALLBACK_URL`, `SQUARE_WEBHOOK_SIGNATURE_KEY`, `SQUARE_WEBHOOK_URL`, `SQUARE_TOKEN_ENCRYPTION_KEY` (32 random bytes, base64), `SQUARE_API_VERSION`, and `CRON_SECRET`. The callback URL must be the actual non-production host and match the Square redirect registration exactly. Do not mix Sandbox credentials with Production tokens or the production database.
3. Apply migrations `0020` → `0021` → `0022` only if absent. Create an isolated test restaurant and allowlisted test owner; do not use Bodega's live identity as test data.
4. Connect a Square Sandbox seller through the owner view. Verify state/host consistency, merchant name, explicit location selection, catalog count, pagination, manual sync, webhook update/revocation, token refresh, disconnect/reconnect, and that the public guest menu does not change. Test a second tenant and concurrent sync/reconnect before production activation. Large catalogs need a durable worker before relying on webhook-triggered inline sync.
5. Record pass/fail evidence and the exact deployment/application IDs. A PGlite self-test alone does not certify remote OAuth or multiworker behavior.

## Bodega production sequence

1. Verify the Bodega contract, restaurant ID, authorized owner identity and exact email by a trusted channel. Create/read back the `restaurants` row and restaurant-specific `owner_emails` allowlist only after approval. Provision Supabase Auth using the [owner access SOP](OWNER_PORTAL_ACCESS_SOP.md); the temporary credential is unique and requires reset. Do not send it by email.
2. Confirm the Fina Calle production Square application is live and its OAuth redirect/webhook URLs match the canonical origin. Configure the same server-only names as Sandbox with **Production** values. Check env names and scope without printing secret values. Verify `ITEMS_READ` and `MERCHANT_PROFILE_READ` only, token encryption, signed webhooks, refresh cron, and production logs.
3. Have the authorized Bodega owner sign into `/owner/bodega/insights`, choose **Connect Square**, verify the Square merchant and permissions on Square's screen, and approve there. The owner then chooses the exact active Bodega Square location in the private view. Confirm the merchant/location with them before any price mapping work.
4. Read back connection environment, merchant ID, chosen location ID, sync status, error state and private item count. Keep catalog data private until a separate mapping and publication workflow is approved. Map by stable Square object/variation IDs and location, not matching names. Review prices, modifiers, sold-out state, categories and removals with the owner before any guest-menu release.
5. Document the owner-facing disconnect path. When disconnected or Square revokes authorization, cached Square catalog data is removed with the connection. Investigate stale syncs and token refresh failures; never assume an old stored row is an active authorization.

## Source references

- [Square developer application setup](https://developer.squareup.com/docs/get-started/create-account-and-application)
- [Square OAuth code flow](https://developer.squareup.com/docs/oauth-api/overview)
- [Square OAuth best practices](https://developer.squareup.com/docs/oauth-api/best-practices)
- [Square OAuth redirect URL](https://developer.squareup.com/docs/oauth-api/create-urls-for-square-authorization)
- [Square menu and catalog model](https://developer.squareup.com/docs/catalog-api/manage-menus)
