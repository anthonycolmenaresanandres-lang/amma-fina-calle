# HANDOFF

## PROJECT PURPOSE
- AMMA/Fina Calle web app for the main Fina Calle OS landing page and related demo routes, including the parked `/conquest` experience.

## CURRENT STAGE
- Active task: update the bottom of the main landing page with a premium, funny Instagram CTA for `@fina_calle`.
- Repository state before task: clean working tree.

## DOMAIN SETUP STATUS
- Domain acquired: `finacalleos.com`.
- WHOIS privacy: enabled per Anthony's domain acquisition status.
- Vercel project confirmed: `amma-fina-calle`.
- Current production Vercel URL: `https://amma-fina-calle.vercel.app`.
- Domains added in Vercel: `finacalleos.com`, `www.finacalleos.com`.
- DNS connection status: pending manual Cloudflare DNS records.
- Exact next manual step for Anthony: in Cloudflare, add DNS-only `A` records for `@` and `www` pointing to `76.76.21.21`, then re-check Vercel verification.
- No Cloudflare DNS records were changed by Codex.

## KEY DECISIONS
- Keep the main landing page premium, cinematic, black-and-white, entrepreneurial, and local-business focused.
- Anthony reviews deployed preview or production URLs, not localhost.
- Do not touch `/conquest` gameplay files unless a shared layout component makes it unavoidable.

## PROTECTED FILES / OUT OF SCOPE
- `/conquest` gameplay files and mechanics.
- Pricing, payment logic, auth, database, secrets, and environment configuration.
- Unrelated app routes, data, and styling.

## PARKED WORK
- `/conquest` remains parked gameplay/demo work and is not part of this landing-page CTA task.

## STARTED
- [2026-06-28 09:09:11] IN: Create an easy-to-watch Colattao owner portal work surface: visible in-app tab plus Vercel preview deployment only. Production/main remains blocked without Anthony approval.
- [2026-06-28 08:42:31] IN: Harden owner portal billing/menu-change path for fail-closed operation: Stripe webhook verification, idempotent billing state, service-role persistence, and stricter owner edit validation. No prod merge/publish without Anthony approval.
- [2026-06-28 07:41:36] IN: Reactivate owner billing on the existing `/owner/[id]` Client OS surface only; target files are owner dashboard/payment support, not Colattao Rush or a new portal.
- [2026-06-06 15:53:57] Session started
- [2026-06-06 11:32:23] Session started
- [2026-06-04 12:23:40] Session started

## DONE
- [2026-06-28 11:13:51] Polished the owner portal into a wider premium dashboard: tighter UI kit radii/shadows, new command-style header metrics, cleaner Request Desk, redesigned billing panel, 3-card featured item editor, campaign/support/activity sections, and matching preview/authenticated shells. Verified targeted artifact scan found no visible `Coffee`, `AI Request Desk`, old preview banner, or `86`; targeted ESLint passed, `npx.cmd tsc --noEmit --pretty false` passed, `npm.cmd run build` passed, browser QA at 1280x900 and 390x844 had no horizontal overflow, and tunnel `/owner-preview` returned 200 with `$149.00`.
- [2026-06-28 09:16:01] Opened a dedicated visible Colattao owner-preview tab at `https://fibre-navy-certainly-supplied.trycloudflare.com/owner-preview` through local port 3110; verified online route returns 200, contains `$149.00`, and does not contain `Coffee` or `AI Request Desk`. Vercel preview `https://amma-fina-calle-pm662wd3w.vercel.app` built successfully but is protected by Vercel login. Cloudflared PID: 10492. Added `.vercelignore` guards to keep unrelated coach demo files out of preview deploy uploads.
- [2026-06-28 08:50:55] Hardened owner billing/menu-change path: added service-role Supabase helper, migration `0007_owner_billing_webhooks.sql`, verified Stripe webhook route `/api/stripe/webhook`, idempotent `record_stripe_billing_event` RPC, restaurant/customer env mapping, stricter menu edit validation, and README webhook setup. Verified targeted ESLint, `npx.cmd tsc --noEmit --pretty false`, full `npm.cmd run build`, and local webhook fail-closed probe returning 503 when unconfigured.
- [2026-06-28 08:34:04] Removed fixed category label and availability shorthand from featured owner cards; preview sample category no longer says Coffee, Request Desk examples now use "mark unavailable", and server triage no longer uses the 86 shorthand. Verified no target-file hits for `Coffee`, `86`, or `setItemAvailability`; targeted ESLint, `tsc --noEmit`, full `npm.cmd run build`, and local `/owner-preview` content probe passed. Literal `86` still appears only inside a generated font asset hash.
- [2026-06-28 08:22:32] Updated `/owner/[id]` owner portal after Anthony review: Request Desk now uses `OPENAI_API_KEY` env when present for review copy only, preview balance is `$149.00`, billing shows auto pay management through Stripe, featured cards include editable item names with photos, and visible preview text no longer contains old AI/dash markers; verified targeted TypeScript/ESLint, full `npm.cmd run build`, and local preview content probes.
- [2026-06-28 07:48:05] Added Stripe-hosted owner billing to existing `/owner/[id]`: live balance snapshot, pay balance, manage billing, and monthly-plan Checkout actions; verified targeted TypeScript/ESLint, full `npm.cmd run build`, and local 200s for `/owner-preview` + `/owner/colattao`.
- [2026-06-06 15:58:56] verified the DNS setup doc contains the exact Vercel-provided Cloudflare records, pending status, redirect recommendation, and guardrails
- [2026-06-06 15:58:21] created docs/VERCEL_CLOUDFLARE_DNS_SETUP.md and updated HANDOFF.md with domain acquisition and Cloudflare DNS pending status
- [2026-06-06 15:56:50] added finacalleos.com and www.finacalleos.com to the confirmed Vercel project amma-fina-calle without changing Cloudflare DNS
- [2026-06-06 15:54:14] located the real AMMA/Fina Calle app repo, ran handoff start/show, and confirmed scope, key decisions, planned files, and protected surfaces
- [2026-06-06 11:35:16] Implemented server-side internal admin gate for /customers and /customers/[id] using Supabase Auth session plus INTERNAL_ADMIN_EMAILS allowlist
- [2026-06-04 12:27:01] Committed funny Instagram CTA landing page update
- [2026-06-04 12:26:02] Verified Instagram CTA landing page update with npm.cmd run build
- [2026-06-04 12:25:02] Added funny premium Instagram CTA to the main landing page footer
- [2026-06-04 12:23:51] Created minimal handoff system and confirmed landing-page CTA scope

## NEXT
- [2026-06-28 11:13:51] Review the visible tunnel tab with Anthony and iterate on any spacing/copy/details he points out. Keep production blocked until explicit approval.
- [2026-06-28 09:16:01] Continue owner-portal UI/payment work using the visible tunnel tab for review. If a permanent public preview is needed, disable/adjust Vercel preview protection intentionally or use a named Cloudflare tunnel; do not promote production without Anthony approval.
- [2026-06-28 08:50:55] Before production: manually apply migration `0007_owner_billing_webhooks.sql`, set `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_WEBHOOK_SECRET`, add Stripe events to `/api/stripe/webhook`, run a Stripe test-mode checkout/autopay cycle for `/owner/colattao`, then merge/publish only after Anthony approval.
- [2026-06-28 08:22:32] Configure production APP/web env with `OPENAI_API_KEY` plus Stripe customer/price keys, then test Request Desk review flow and Stripe test-mode autopay from `/owner/colattao` before any production publish.
- [2026-06-28 07:48:05] Configure APP/web env: `STRIPE_SECRET_KEY`, `STRIPE_FINACALLE_OS_PRICE_ID`, and `STRIPE_COLATTAO_CUSTOMER_ID`; then test Stripe in test mode from `/owner/colattao` before any production publish.
- [2026-06-28 07:41:36] Add Stripe-hosted balance/payment actions to `/owner/[id]`, render the billing panel inside `OwnerDashboard`, then run targeted lint/build verification without publishing.
- [2026-06-06 15:58:56] stage HANDOFF.md and docs/VERCEL_CLOUDFLARE_DNS_SETUP.md only, then commit with the requested message
- [2026-06-06 15:58:21] verify DNS setup documentation, inspect scoped diff, then commit only docs and handoff changes
- [2026-06-06 15:56:50] write docs/VERCEL_CLOUDFLARE_DNS_SETUP.md and update HANDOFF.md with the acquired-domain and Cloudflare manual DNS step
- [2026-06-06 15:54:14] inspect scoped Vercel and project metadata, then retrieve safe read-only domain instructions for finacalleos.com and www.finacalleos.com
- [2026-06-06 11:35:16] Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and INTERNAL_ADMIN_EMAILS before using internal customer routes; public and owner routes remain untouched
- [2026-06-04 12:27:10] Push landing page Instagram CTA commit to origin main and verify deployed production URL
- [2026-06-04 12:25:11] Run npm.cmd run build, inspect scoped diff, then commit and push if build passes
- [2026-06-04 12:23:51] Inspect package and main landing page files only, then add Instagram CTA
- Add the final-section Instagram CTA to the main landing page, then build, commit, push, and verify the deployed URL.

## BLOCKERS

## NOTES
