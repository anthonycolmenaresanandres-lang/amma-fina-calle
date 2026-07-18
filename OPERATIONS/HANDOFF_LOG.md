# Handoff Log — canonical cross-agent check-in / check-out

_Newest entries first. This file is the live bridge between Claude, Codex, and Clone._

## Entry format

```markdown
### [CHECK-IN] <agent> — <YYYY-MM-DD HH:MM> — <task>
Picking up: <what>
State I see: <facts / blockers>

### [CHECK-OUT] <agent> — <YYYY-MM-DD HH:MM>
Did: <bullets>
State now: <bullets>
Next / handoff to: <agent → what>
Blocked on Anthony: <human-only steps, or "none">
```

---

### [CHECK-IN] Codex - 2026-07-17 08:31 - Colattao July 20 portal activation
Picking up: Apply the approved billing migrations, prepare a non-production deployment, and make the Colattao owner portal reflect the confirmed first charge on 2026-07-20.
State I see:
- Anthony confirmed the first charge date and explicitly approved the previously requested migration application and non-production deployment.
- Branch is `codex/owner-billing` at `4e78a5d`; only the billing runbook and handoff entry from the authorized Stripe setup are modified.
- Migrations 0010, 0011, and 0012 exist locally but their applied Supabase state must be verified before execution.
- The exact customer billing identity is still pending, so no Stripe customer, subscription, payment method, or live charge is authorized or possible yet.

### [CHECK-OUT] Codex - 2026-07-17 08:52 - Colattao July 20 portal activation
Did:
- Added prepared migration `0013_colattao_billing_schedule.sql` to record the confirmed USD 149 monthly plan and 2026-07-20 first-charge date without creating a Stripe customer or charge.
- Updated the owner Billing card to show `$149.00 / month planned` and `First charge Jul 20, 2026` while accurately retaining the Not started state.
- Added a Checkout safeguard: Stripe receives the fixed trial end when at least 48 hours remain, fails closed inside Stripe's 48-hour minimum window, and never charges before the confirmed date.
- Linked the local repo to the existing Vercel `amma-fina-calle` project and created preview deployment `dpl_3jywTVVQDvzn8p91cZfMbBaHYeeJ`.
- Verified the preview is Ready and `/owner/colattao` renders the protected owner sign-in at `https://amma-fina-calle-8qsup3dwr.vercel.app/owner/colattao`.
State now:
- Targeted ESLint and `tsc --noEmit` pass; the earlier full local build passed, and the final Vercel build compiled and typechecked successfully.
- Supabase dashboard authentication expired, Supabase CLI has no access token, and migrations 0010-0013 remain unapplied.
- Vercel preview and production environments currently list no environment variables, so authenticated Supabase billing and Stripe actions remain fail-closed.
- No email was sent; no migration, Stripe customer, subscription, payment method, charge, live ACH setting, production deployment, push, or merge was performed.
Next / handoff to: Anthony -> sign in to Supabase in the open Chrome tab and authorize direct Vercel secret configuration; Codex -> verify 0009, apply 0010-0013 in order, configure preview values, redeploy, and verify the authenticated billing card.
Blocked on Anthony: Supabase sign-in, explicit authorization to transfer/configure secrets directly between Stripe/Supabase and Vercel, and the exact Colattao billing identity.

### [CHECK-IN] Codex - 2026-07-17 08:24 - authorized Stripe account activation
Picking up: Configure the Amma Ventures Stripe account for Colattao at USD 149 per store per month, with the free period ending 2026-07-20 and cancellation at the end of a paid billing period.
State I see:
- Anthony explicitly authorized browser control and live Stripe account configuration for this task, overriding the previous Stripe-configuration stop boundary only.
- The local owner-billing branch is clean and prepared, but migrations 0010-0012 remain unapplied and `https://finacalleos.com/api/stripe/webhook` currently returns 404.
- The exact Colattao billing contact is still pending, so no customer, subscription, trial, charge, or saved payment method can be created yet.

### [CHECK-OUT] Codex - 2026-07-17 08:24 - authorized Stripe account activation
Did:
- Confirmed the live Amma Ventures LLC Stripe account is active and has no existing live products or subscriptions.
- Created matching test and live `Colattao — AMMA Managed Services` products at USD 149 per month per store.
- Enabled Google Pay in test and live; registered and verified `finacalleos.com` for supported wallet methods.
- Enabled test ACH Direct Debit after confirming recurring support and delayed-settlement requirements; left live ACH disabled until the signed webhook is deployed.
- Verified the live Customer Portal already allows invoice history, payment-method updates, cancellation-reason collection, and cancellation at the end of the paid billing period.
State now:
- Live price: `price_1TuAgoKCddGPSxQC2oVxknqc`; test price: `price_1TuAYUKCddGPSxQCUFoEAARC`.
- No secret was viewed or entered; no customer, subscription, charge, bank setting, migration, deployment, push, or merge was performed.
Next / handoff to: Anthony -> provide the exact billing contact; approve migration application and a non-production deployment so the signed webhook and Checkout flow can be verified before live ACH or the first subscription.
Blocked on Anthony: exact billing contact, migration verification/application, deployment approval, Vercel secret entry, and the final live subscription start.

### [CHECK-IN] Codex - 2026-07-17 06:25 - Stripe, Zelle, and SOP completion
Picking up: Finish the owner billing portal with Stripe plus a safe manual Zelle reporting/reconciliation lane, then publish the operating SOP manual to Drive Documents.
State I see:
- Stripe Checkout, Customer Portal, signed webhook processing, the client ledger, and team access are prepared locally on `codex/owner-billing`.
- Migrations 0010 and 0011 remain unapplied; production migration state and live Stripe configuration are unknown.
- Mercury does not support Zelle. Eligible Bank of America business accounts can use Zelle, but there is no approved public settlement API in scope; owner reports must remain unverified until AMMA reviews them.
- Agent-browser 0.32.1 and its Chrome runtime passed the offline doctor; the agent-browser, security-best-practices, and security-threat-model skills are installed.
- A Drive root folder named `Documents` was created for the requested SOP deliverables; existing Drive files remain untouched.
- Anthony authorized local implementation, runner/skill installation, and Drive document creation only. No credential, bank access, live payment configuration, migration, deployment, push, merge, or production action is authorized.

### [CHECK-OUT] Codex - 2026-07-17 07:00 - Stripe, Zelle, and SOP completion
Did:
- Added authenticated owner Zelle instructions, payment reporting, recent status history, and a private `/customers/payments` reconciliation inbox.
- Added billing-manager-only Verify/Reject authorization, database-side owner reauthorization, amount/note limits, a five-reports-per-ten-minutes throttle, private tables, and unapplied migration `0012_zelle_payment_notices.sql`.
- Kept Stripe authoritative for recurring billing, hardened production callback URLs to HTTPS, and now records Stripe's invoice-paid timestamp rather than webhook receipt time.
- Corrected `APP/web/BILLING_SETUP.md` for Stripe-to-Mercury and manual Bank of America Zelle; no bank credential or automatic Zelle settlement is represented.
- Installed agent-browser 0.32.1 plus its Chrome runtime and the agent-browser, security-best-practices, and security-threat-model skills; offline doctor passed 5/5.
- Created and visually verified the 14-page, 17-SOP native Google Doc `AMMA Ventures / Fina Calle — Company Operating SOP Manual` inside Drive `Documents`: https://docs.google.com/document/d/1g4AzEymrRZANYqMcfXjm-S1JTp0iklhDPQhN1DGF5OI/edit
State now:
- Targeted ESLint passed; `tsc --noEmit` passed; the full Next.js production build passed and includes `/customers/payments`.
- Agent-browser verified `/owner/colattao` and `/customers/payments` at 390 px: meaningful fail-closed setup states, no payment-data exposure, no horizontal overflow, and no browser errors.
- Native Google Docs readback confirmed 22 top-level headings, 23 subheadings, 151 real list items, three tables, and Arial throughout; native PDF export and all 14 rendered pages passed visual QA.
- `npm audit --omit=dev` still reports two moderate PostCSS advisories nested under Next.js; the offered force fix is a breaking downgrade to Next 9 and was not applied.
- Branch remains `codex/owner-billing`; no secret entered, bank account accessed, migration applied, live payment configured, deployment made, push performed, or production merge made.
Next / handoff to: Anthony -> review the owner payment UI and SOP manual; verify production migration state; apply 0010, 0011, then 0012 manually; configure Stripe test values and the verified Bank of America Zelle display values; approve a test deployment when ready.
Blocked on Anthony: bank-side Zelle enrollment/recipient confirmation, migration verification/application, Stripe/Zelle server configuration, live payment testing, deployment, push, and merge.

### [CHECK-OUT] Codex - 2026-07-17 07:09 - client ledger and team access
Did:
- Upgraded `/customers` into a private client ledger showing business/contact identity, client ID, plan, recurring amount/interval, payment and invoice state, and next payment.
- Upgraded `/customers/[id]` with recurring billing detail, owner portal route, and authorized restaurant-owner emails.
- Added `/customers/team` with an active roster, owner-only employee authorization/reactivation/deactivation controls, and a four-step new-hire sign-in guide.
- Extended prepared migration 0010 and Stripe synchronization with amount, currency, interval, and interval count.
- Added unapplied migration `0011_client_ledger_and_team_access.sql`; all financial/roster RPCs require an active authenticated AMMA admin, and team mutations additionally require the owner-manager flag.
- Enabled first-time Supabase Auth creation only after the exact email passes the admin allowlist check.
State now:
- Branch: `codex/owner-billing`; no live employee added, email sent, access changed, secret entered, migration applied, deployment made, push performed, or production merge made.
- Targeted ESLint passed; `tsc --noEmit` passed; full Next.js production build passed and includes `/customers/team`.
- Browser checks passed for `/customers`, `/customers/team`, and `/`: meaningful fail-closed setup state, correct titles, no framework overlay, and no console errors. Authenticated records remain untestable locally until Supabase and migrations 0010/0011 are deliberately activated.
Next / handoff to: Anthony -> review the ledger/team design, verify production migration state, apply 0010 then 0011 manually, configure Stripe test values, and deploy only after approval.
Blocked on Anthony: migration verification/application, Supabase/Stripe configuration, live employee authorization, deployment, push, and merge.

### [CHECK-IN] Codex - 2026-07-17 05:59 - client ledger and team access
Picking up: Turn the existing admin-gated customer registry into the client ledger and prepare safe onboarding for future AMMA employees.
State I see:
- `/customers` already uses server-side Supabase admin authorization and migration 0004 already restricts the registry RPCs.
- Client records show plan and coarse billing status but not the Stripe amount, interval, invoice state, renewal date, or owner-access emails.
- Admin magic links use `shouldCreateUser: false`, so a newly allowlisted employee cannot create their first Supabase Auth user.
- Prepared migration 0010 is not applied; production migration state is unknown.
- Anthony authorized local Codex work only. No live access, invite, migration, deploy, push, merge, or production action is authorized.

### [CHECK-OUT] Codex - 2026-07-17 05:46 - owner billing and mobile sign-in
Did:
- Repaired the owner sign-in layout for narrow mobile viewports.
- Added Stripe Checkout subscriptions and Customer Portal actions with server-side restaurant re-authorization and server-owned price/customer mapping.
- Added a raw-body signature-verified Stripe webhook with event deduplication and safe status synchronization.
- Added private billing tables and an owner-safe summary RPC in unapplied migration `0010_owner_billing_subscriptions.sql`.
- Added the owner Billing card with plan, status, recurring state, invoice state, next-payment date, and context-sensitive action.
- Documented Stripe, Supabase, Mercury, Bank of America, and Vercel activation in `APP/web/BILLING_SETUP.md`.
State now:
- Branch: `codex/owner-billing`; no push, merge, deploy, secret entry, bank access, or migration application performed.
- Targeted ESLint passed; `tsc --noEmit` passed; full Next.js build passed.
- Browser proof passed at 320 px and 390 px with no horizontal overflow, console errors, or framework overlay; the home route also loaded cleanly.
- `npm audit --omit=dev` reports two moderate transitive PostCSS advisories under Next.js; the offered force fix would install a breaking Next.js downgrade, so it was not applied.
Next / handoff to: Anthony -> choose price/frequency/trial/cancellation policy, verify production migration state, review and apply 0010, then configure Stripe/Vercel test values using `APP/web/BILLING_SETUP.md`.
Blocked on Anthony: migration verification/application, billing policy choices, credentials, Stripe test/live configuration, bank payout configuration, deployment, push, and merge.

### [CHECK-IN] Codex - 2026-07-17 05:22 - owner billing and mobile sign-in
Picking up: Implement the authenticated owner billing surface, test-mode Stripe server rails, unapplied billing migration, and responsive sign-in repair.
State I see:
- Anthony explicitly directed Codex to execute here instead of waiting for Claude.
- Working branch is `codex/owner-billing`, created from the canonical operations branch at `83a1e27`.
- The app has an authenticated `/owner/[id]` route and a manual `restaurants.billing_status` field, but no Stripe SDK or live billing code.
- Local migration sequence ends at `0009`; applied production state is unknown.
- No secret, migration, deploy, push, merge, or production action is authorized.

### [CHECK-IN] Codex — 2026-07-10 — canonical queue repair
Picking up: Move the live coordination control plane from the retired Desktop clone into the data-center clone and preserve the old files for recovery.
State I see:
- Canonical branch: `ops/data-center-docs`, clean and pushed.
- Canonical `AGENTS.md` and `OPERATIONS/DATA_CENTER.md` require the queue and handoff log here, but they were absent.
- Desktop queue/log/model were preserved under `OPERATIONS/archive/desktop-20260710/`.
- Desktop has unrelated tracked edits plus two untracked Slack hook files; those files remain untouched.

### [CHECK-OUT] Codex — 2026-07-10 — canonical queue repair
Did:
- Created the canonical operating model, live queue, and handoff log.
- Archived the Desktop control-plane files for historical recovery.
- Added a revalidation gate so stale production/send/migration tasks are not silently reactivated.
- Added `OPERATIONS/CLAUDE_COORDINATION.md` and repointed Claude's handoff skill to the canonical queue.
- Ported the fail-safe `OPERATIONS/notify_slack.py` hook into both canonical handoff close surfaces.
- Verified Python syntax, no-webhook exit behavior, canonical log parsing, and no generated cache remains.
State now:
- Claude should write only to `C:\Dev\amma\amma-fina-calle\OPERATIONS\CODEX_QUEUE.md`.
- Codex should read the queue and this log from the canonical clone before coding.
Next / handoff to: Claude → reissue only validated tasks in the canonical queue; Codex → wait for the first actionable item.
Blocked on Anthony: set `SLACK_WEBHOOK_URL` in the Windows user environment and visually confirm one `ops feed online` test; Slack connector sends remain human-gated.

### [CHECK-IN] Codex - 2026-07-17 08:56 - owner requests and Colattao intake email
Picking up: Verify that authenticated owner change requests create an actionable record and that the live Colattao-facing intake routes the intended operational emails.
State I see:
- Anthony confirmed the Supabase dashboard is authenticated and authorized configuring the required Vercel secrets without exposing them.
- Branch is `codex/owner-billing`; prepared migrations `0010` through `0013` remain unverified against the hosted database.
- Both owner and public intake paths call the shared Resend helper, but recipient configuration and live deployment state still require evidence before any test send.
- No customer email will be sent during verification unless the exact recipient and message are first confirmed safe.

### [CHECK-OUT] Codex - 2026-07-17 09:10 - owner requests and Colattao intake email
Did:
- Verified hosted migration state, then applied prepared migrations `0010`, `0011`, `0012`, and `0013` sequentially through the authenticated Supabase SQL editor.
- Re-queried the database: all four migration markers are present, and Colattao is seeded at `$149.00` monthly with `2026-07-20` as the scheduled first charge.
- Exercised `submit_change_request` under the `anon` database role for restaurant `colattao`, asserted the new request row existed, removed the test row in the same transaction, and confirmed zero test residue.
- Tested the real Colattao Rush production guest-note endpoint. It correctly rejected a malformed request without sending, then exposed a real Resend HTTP 403 on the valid delivery test instead of reporting success.
- Read production logs and confirmed the cause: Resend rejected the testing sender for `colattao@hotmail.com`; `finacalleos.com` is already verified in Resend.
- Replaced the Colattao Rush production `FROM_EMAIL` configuration with `notifications@finacalleos.com` without exposing any secret value.
State now:
- Database and owner request persistence rails are active and verified; the reversible verification record was cleaned up.
- Colattao Rush email routing remains `colattao@hotmail.com` as visible recipient plus the configured internal AMMA BCC.
- The sender fix is stored in Vercel but does not affect the existing production artifact until a production redeploy.
- The Colattao Rush checkout has pre-existing overlapping uncommitted work, so it was inspected read-only and no files there were edited.
Next / handoff to: Anthony -> explicitly approve redeploying the existing Colattao Rush production artifact; Codex -> redeploy, rerun the labeled guest-note test, and verify a 200 response plus clean production logs.
Blocked on Anthony: explicit production redeploy approval. No merge or push is required for this sender-only repair.

### [CHECK-IN] Codex - 2026-07-17 10:15 - approved Colattao email redeploy
Picking up: Redeploy the existing Colattao Rush production artifact with the verified-domain sender, then prove the real Guest Notes delivery path.
State I see:
- Anthony explicitly approved the Colattao production redeploy and confirmed `colattao@hotmail.com` plus AMMA internal notification recipients are the intended destinations.
- The production `FROM_EMAIL` is already configured as `notifications@finacalleos.com`, and `finacalleos.com` is verified in Resend.
- The Colattao Rush checkout contains unrelated overlapping uncommitted work, so this activation will reuse the existing production artifact without a merge, push, or local-file deployment.

### [CHECK-OUT] Codex - 2026-07-17 10:24 - approved Colattao email redeploy
Did:
- Redeployed the existing Colattao Rush production artifact `dpl_7ac5ZVEtrTjiPpjA79F5wG9ZnA3S` without using the dirty local checkout, merging, or pushing code.
- Verified the new production deployment `https://colattao-cafe-rush-2c4ok59yt.vercel.app` completed and was aliased to `https://colattao-cafe-rush.vercel.app`; live `/menu` returned HTTP 200.
- Submitted one clearly labeled production Guest Note; `/api/owner-requests` returned HTTP 200 with `{ "ok": true }`.
- Verified Resend event `bb02949a-6c70-4f3d-abec-601b911b99de`: sender `notifications@finacalleos.com`, visible recipient `colattao@hotmail.com`, BCC `anthonycolmenaresanandres@gmail.com`, and both recipient events are `delivered`.
State now:
- The live Colattao Guest Notes intake is operational and no longer blocked by Resend testing-mode restrictions.
- Current internal routing is one BCC recipient, `anthonycolmenaresanandres@gmail.com`; additional internal addresses are not configured or assumed.
Next / handoff to: Anthony -> name any additional internal inbox(es) that should receive customer information; Codex -> add them only after exact recipients are confirmed.
Blocked on Anthony: exact additional internal recipient addresses, if more than the currently verified Anthony inbox is desired.

### [CHECK-IN] Codex - 2026-07-17 10:30 - customer portal activation audit
Picking up: Verify that the Colattao owner/customer portal is actually ready across sign-in, change requests, billing, Stripe recurring state, and Zelle reporting.
State I see:
- Hosted Supabase migrations `0010` through `0013` are applied and the Colattao billing schedule is seeded.
- The full portal implementation is committed on clean branch `codex/owner-billing`; production remains the human-approved `main` branch.
- Anthony asked to make sure the portal is set, but has not yet approved a Fina Calle production merge or deployment.
- Verification will stop at the first broken boundary and will not send a magic link, create a payment, submit a Zelle notice, deploy, merge, or push without the required evidence or approval.

### [CHECK-OUT] Codex - 2026-07-17 10:47 - customer portal activation audit
Did:
- Verified the first broken boundary: `finacalleos.com/owner/colattao` serves production commit `9f62f16`, while the completed billing/Zelle/client-ledger portal exists only on `codex/owner-billing`.
- Merged current `origin/main` into `codex/owner-billing`; the only conflict was documentation-only `CLAUDE.md`, resolved by preserving both the data-center rules and the newer stable-QR/menu guardrails.
- Passed targeted portal ESLint, `tsc --noEmit`, and the full Next.js production build after the merge.
- Created the correct protected preview `https://amma-fina-calle-fkcdls9i0.vercel.app/owner/colattao`; it renders the Supabase-backed Colattao owner sign-in.
- Audited the Vercel project environment surface without exposing values. Production project variables visibly include only traffic/Instagram configuration; Stripe, webhook, service-role, request-email, and Zelle activation keys are not visibly project-scoped.
- Accidentally created an isolated Vercel project named `web` by deploying from `APP/web`; immediately corrected the deployment path to the canonical root link, removed the local stray link, and did not attach the isolated project to `finacalleos.com`.
State now:
- Feature branch is clean, current with `main`, build-verified, and previewed. Fina Calle production is unchanged.
- Authenticated portal, Checkout, Customer Portal, webhook, and Zelle end-to-end tests are correctly paused because production does not yet contain the feature and required activation configuration is incomplete or unverified.
Next / handoff to: Anthony -> approve the Fina Calle production portal deployment and one owner magic-link test; provide the exact Bank of America Zelle recipient name and enrolled email/mobile if Zelle should be activated.
Blocked on Anthony: Fina Calle production deploy approval, owner magic-link send approval, exact Zelle recipient facts, and approval to delete the isolated unused Vercel `web` project.

### [CHECK-IN] Codex - 2026-07-17 - password owner access and approved production release
Picking up: Replace recurring owner magic-link access with email/password sign-in, preserve the completed portal, then merge and deploy the latest validated product.
State I see:
- Anthony explicitly approved merging and deploying the latest portal product.
- `codex/owner-billing` is clean and contains the completed owner billing, Zelle, client-ledger, request-desk, and hosted-migration work; `origin/main` remains the older production baseline.
- The current owner login calls Supabase `signInWithOtp` and tells owners no password is required.
- Password values will not be requested, stored, printed, or committed. Initial password enrollment must use a secure owner-controlled entry surface.

### [CHECK-OUT] Codex - 2026-07-17 - password owner access and approved production release
Did:
- Replaced the Colattao owner login UI with persistent email/password access backed by Supabase `signInWithPassword`; successful authentication is re-authorized against the requested restaurant before redirecting.
- Preserved the completed request desk, recurring billing, Zelle reporting, client ledger, team access, and hosted migrations.
- Passed targeted ESLint, `tsc --noEmit`, the full local Next.js production build, a protected-preview build, and browser verification of the password form with no error overlay or console errors.
- Merged the release to `main` at `620f00c` and pushed with Anthony's explicit production approval.
- Diagnosed the first production attempt: `/news` static generation waited indefinitely on `NEWS_FEED_URL`. Added a five-second abort ceiling in `src/lib/news/feed.ts`, committed `3aa5d63`, and republished.
- Verified production deployment `dpl_A9NVELiZBCG1tSPDsEEq1D35RBVn` is READY and aliased to `finacalleos.com`; the live `/owner/colattao` page renders email/password sign-in with no browser error overlay or console errors.
- Confirmed the allowlisted Anthony Supabase Auth user exists. No password was read, generated, changed, or submitted.
State now:
- The latest portal is live at `https://finacalleos.com/owner/colattao` on `main` commit `3aa5d63`.
- Daily access is password-based and the session persists until sign-out; magic-link access is no longer the owner login UI.
- Initial password enrollment remains a one-time secure owner action. Stripe/Zelle end-to-end payment activation remains unverified until the required production account configuration is present.
Next / handoff to: Anthony -> choose and enter the initial password through a secure Supabase admin/authenticated setup action; Codex -> verify the authenticated dashboard without receiving or exposing the password.
Blocked on Anthony: the user-chosen initial password action and exact Bank of America Zelle recipient facts. No code, merge, migration, or deployment blocker remains.

### [CHECK-IN] Codex - 2026-07-17 - owner first-login password reset and utilization email
Picking up: Add a secure mandatory first-login password reset for newly provisioned owner accounts, then prepare the reusable owner-portal utilization email and send Anthony the operating summary.
State I see:
- Production currently supports persistent email/password owner sign-in and authorizes access per restaurant.
- A shared `1234` password is incompatible with the existing eight-character minimum and would expose every owner account; no shared password will be created, stored, printed, or emailed.
- The safe implementation is a one-time temporary credential marked in Supabase user metadata; the authenticated owner remains blocked from portal data and actions until they set a private password.
- Branch `codex/owner-first-login-reset` is isolated from `origin/main`. This task does not include a production merge or deployment approval.

### [CHECK-OUT] Codex - 2026-07-17 - owner first-login password reset and utilization email
Did:
- Added an authorization-grade `app_metadata.owner_password_reset_required` gate to owner context resolution; flagged owners can authenticate but cannot load dashboard data or run any owner, billing, Zelle, or request-desk action.
- Added a first-sign-in password screen with confirmation, a 12–128 character policy, common-password rejection, and fail-closed server-side completion. Supabase changes the password; the service-role client clears the protected app-metadata flag only after the change succeeds.
- Added `OPERATIONS/OWNER_PORTAL_ACCESS_SOP.md` and the reusable `OPERATIONS/templates/OWNER_PORTAL_UTILIZATION_EMAIL.md`; neither template contains a password.
- Passed targeted ESLint, `npx.cmd tsc --noEmit`, `git diff --check`, and the full Next.js production build.
- Created a customer-utilization Gmail draft addressed only to Anthony for review and sent Anthony the internal operating summary with the reusable template attached. No customer email was sent.
State now:
- Branch `codex/owner-first-login-reset` contains the verified implementation; production remains unchanged.
- No existing owner password was changed. Future owner provisioning must use a unique temporary password and set the protected reset-required app-metadata flag.
Next / handoff to: Anthony -> approve a production merge/deployment only after confirming the server-side Supabase service-role variable is present; Codex -> deploy and verify one explicitly approved test owner through the full first-login reset flow.
Blocked on Anthony: production deployment approval and permission to provision/reset one named test owner. Never send or record the test owner’s private final password.

### [CHECK-IN] Codex - 2026-07-17 - Stripe and Zelle final-input email
Picking up: Ground the final Stripe/Zelle activation requirements in the live owner-portal implementation and current official provider guidance, then email the no-secrets checklist to Anthony and Marbel.
State I see:
- The portal expects Stripe subscription Checkout, Customer Portal, seven signed webhook event types, and a manual Bank of America Zelle reconciliation lane.
- The remaining inputs are business/billing identity, Stripe live configuration entered directly in Vercel, and the exact verified Bank of America Zelle recipient display values.
- Marbel's canonical AMMA email is `marbeljsiado@gmail.com`. No API secret, bank credential, PIN, account number, or private password will be requested or sent by email.

### [CHECK-OUT] Codex - 2026-07-17 - Stripe and Zelle final-input email
Did:
- Verified the exact application variables, production webhook route, handled Stripe events, Zelle display fields, and manual bank-verification behavior from the canonical implementation and billing setup.
- Cross-checked current official Stripe guidance for account activation, API keys, subscription webhooks, Customer Portal, payment methods, and payouts; cross-checked Bank of America and Zelle business-enrollment guidance.
- Created `STRIPE_ZELLE_FINAL_ACTIVATION_CHECKLIST.md` as a no-secrets operating attachment covering Anthony inputs, Marbel preparation duties, exact Vercel variable names, acceptance tests, and official references.
- Sent one email to Anthony and Marbel with the checklist attached. Gmail confirmed the Sent message has both intended recipients and the attachment; no credentials or secrets were included.

State now:
- Research and email delivery are complete. No Stripe setting, Zelle enrollment, bank access, Vercel value, customer, subscription, payment, merge, or deployment was changed.
Next / handoff to: Anthony -> provide the non-secret Colattao billing identity and verified Bank of America Zelle display facts, then explicitly authorize an authenticated Stripe/Vercel configuration session; Marbel -> complete the non-secret client-ledger and test-preparation items.
Blocked on Anthony: exact Colattao billing contact/invoice email/store count, confirmed live recurring Price, confirmed Stripe payout bank, exact Bank of America Zelle recipient name and enrolled handle, billing-manager designation, and approval for test-mode activation.

### [CHECK-IN] Codex - 2026-07-17 - Colattao payment activation approval preparation
Picking up: Convert Anthony's confirmed Colattao billing identity, Mercury payout decision, Bank of America Zelle recipient, and Anthony/Marbel billing-manager authority into a verified approval-ready implementation package.
State I see:
- Confirmed billing customer: Colattao Coffee House, Yurika Torres, `colattao@hotmail.com`, 757-761-9757, 1115 Independence Boulevard, Virginia Beach, VA 23455.
- Confirmed Zelle display recipient: AMMA Ventures LLC at `ammaventuresvb@gmail.com`; Stripe payouts should settle to Mercury.
- Anthony and Marbel are authorized billing managers. Hosted migrations 0010 through 0013 were previously verified as applied; the next unused migration is 0014.
- The linked Vercel project currently returns zero project environment-variable records in production, preview, and development. No redeploy is safe until the required Supabase, Stripe, application URL, and Zelle variables are restored.
- Work stays on `codex/owner-first-login-reset`; no hosted migration, Vercel setting, Stripe customer/subscription, bank setting, payment, push, merge, or deployment is authorized in this preparation pass.

### [CHECK-OUT] Codex - 2026-07-17 - Colattao payment activation approval preparation
Did:
- Prepared unused migration `0014_colattao_billing_identity_and_managers.sql` to store the exact supplied billing name/contact/address and grant both Anthony and Marbel in-app billing-review authority.
- Corrected Stripe Customer creation and refresh to use Colattao's verified billing identity instead of the AMMA employee who signs into the owner portal; incomplete billing identity now fails closed.
- Added a tracked no-secret `.env.example` covering the exact Supabase, application URL, Stripe, and Zelle variable names required before redeployment.
- Updated the billing runbook with Mercury payouts, the exact `Amma ventures llc` Zelle recipient at `ammaventuresvb@gmail.com`, the distinction between in-app billing authority and Stripe team access, and the empty Vercel environment-variable stop condition.
- Created the approval packet in the task outputs with exact approval language and the July 18, 08:00 EDT cutoff for creating the July 20 trial end through the prepared Checkout path.
- Passed targeted ESLint, `tsc --noEmit`, `git diff --check`, environment-template tracking verification, and the full Next.js production build.
State now:
- The implementation is approval-ready on `codex/owner-first-login-reset`; production and all external payment systems remain unchanged.
- Vercel configuration restoration is mandatory before any redeploy. Stripe live product/Price, Mercury payout setup, webhook, and Customer Portal settings still require authenticated dashboard verification.
Next / handoff to: Anthony -> use the exact approval statement in the packet if he authorizes migration 0014, secure Vercel configuration restoration, webhook setup, merge/deploy, and test-mode verification; Codex -> execute those steps and stop before live subscription creation or money movement.
Blocked on Anthony: controlled activation approval. Timing warning: approve early enough to complete Checkout before 2026-07-18 08:00 EDT, or authorize a manual Stripe setup/new first-charge date.

### [CHECK-IN] Codex - 2026-07-17 - approved Colattao owner-portal publish
Picking up: Apply the verified Colattao billing identity migration, secure the production runtime configuration, publish the approved owner-portal release, and stop before creating a live subscription or moving money.
State I see:
- Branch `codex/owner-first-login-reset` is three commits ahead of `origin/main`; the local implementation already passed its production build and targeted checks.
- Production has the Supabase public URL/key and internal notification-email variables, but the server-side Supabase key and Stripe secret/webhook variables are absent.
- A legacy Supabase service credential became visible in the provider dashboard automation surface and must be treated as exposed; it will not be reused, printed, or copied into Vercel.

### [CHECK-OUT] Codex - 2026-07-17 - secure publish gate
Did:
- Applied and verified hosted migration `0014_colattao_billing_identity_and_managers.sql`: Colattao billing identity/address is present and Anthony plus Marbel have billing-manager authority.
- Added the approved production values for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_APP_URL`, `STRIPE_RECURRING_PRICE_ID`, `ZELLE_RECIPIENT_NAME`, and `ZELLE_RECIPIENT_HANDLE` in Vercel.
- Updated the runtime to prefer Supabase's new `SUPABASE_SECRET_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` names while retaining legacy fallbacks.
- Confirmed the Supabase project integration surface does not provide an existing-project Vercel connection; no new Supabase project or marketplace resource was created.
State now:
- Production publish is intentionally paused. Deploying without `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` would ship billing controls that cannot complete or verify signed events.
- The current live owner portal remains `https://finacalleos.com/owner/colattao`; no live Stripe customer, subscription, charge, Zelle transfer, or customer email was created.
Next / handoff to: Anthony -> create/approve a new Supabase secret key and provide Stripe's live secret plus webhook signing secret directly through Vercel's encrypted environment-variable UI; Codex -> verify key names only, commit, publish, and run the production smoke test.
Blocked on Anthony: secure provider-side entry of the three missing encrypted variables. The exposed legacy Supabase credential must not be reused.

### [CHECK-IN] Codex - 2026-07-17 - secure connected-key recovery
Picking up: Use Anthony's authenticated provider connections to recover the missing Supabase and Stripe credentials and store them only as encrypted Vercel Production variables without printing or saving plaintext locally.
State I see:
- Stripe and Supabase are authenticated in Chrome; Vercel CLI is authenticated and linked to `amma-fina-calle`.
- Vercel Marketplace reports no connected resources, so there is no automatic provider-to-Vercel secret synchronization.

### [CHECK-OUT] Codex - 2026-07-17 - provider credential-panel browser stop
Did:
- Verified Vercel Production variable names through metadata-only output; `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` remain absent.
- Verified the live Stripe account and Colattao USD 149 monthly Price from the authenticated dashboard without exposing a credential.
- Confirmed Chrome is running and the ChatGPT Chrome Extension plus native host are installed, enabled, and correctly registered.
State now:
- No credential was printed, stored locally, committed, emailed, or transferred. The provider credential panels stalled and the Chrome control connection stopped responding before any secret could be copied.
Next / handoff to: Anthony -> approve opening a fresh Chrome window for the selected authenticated profile; Codex -> retry once, transfer the three credentials directly into encrypted Vercel Production variables, and verify names only.
Blocked on Anthony: permission to open the fresh Chrome window required by the browser recovery procedure.

### [CHECK-IN] Codex - 2026-07-17 - identify new Vercel connection
Picking up: Inspect Anthony's Vercel Connect screenshot and verify live project/environment metadata to determine whether the new connection supplies the missing Supabase credentials.
State I see:
- Screenshot shows a GitHub-backed Connect record named `colattao-cafe-rush` assigned to the Vercel project of the same name across Production, Preview, and Development.
- Canonical owner-portal production remains the separate Vercel project `amma-fina-calle`.

### [CHECK-OUT] Codex - 2026-07-17 - connection classified
Did:
- Confirmed both Vercel projects exist: `amma-fina-calle` and `colattao-cafe-rush`.
- Verified environment-variable names only. `colattao-cafe-rush` has Blob and Resend configuration but no Supabase or Stripe credentials.
- Reverified `amma-fina-calle` has public Supabase URL/anon configuration but still lacks `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`.
State now:
- The new GitHub Connect record is valid and may help GitHub/Vercel automation for `colattao-cafe-rush`, but it does not unblock the owner-portal billing release and should not be copied to `amma-fina-calle` as a Supabase connection.
Next / handoff to: Codex -> resume secure provider-key transfer only after the authenticated Supabase and Stripe credential panels are available through browser control.
Blocked on Anthony: no new decision for this classification; the prior fresh-Chrome-window recovery permission remains the only key-transfer blocker.

### [CHECK-IN] Codex - 2026-07-17 - fresh Chrome secure-key transfer
Picking up: Use Anthony's approved fresh Chrome session to transfer the missing provider credentials directly into encrypted Vercel Production variables without revealing or persisting plaintext.
State I see:
- The authenticated Supabase project exposes one masked modern secret key with a copy control.
- The canonical `amma-fina-calle` Vercel project is linked and still requires the server-side Supabase key plus Stripe live secret and webhook signing secret.

### [CHECK-OUT] Codex - 2026-07-17 - Supabase key secured; Stripe challenge handoff
Did:
- Copied the masked modern Supabase secret without revealing it and piped it directly from the Windows clipboard into Vercel as the encrypted sensitive Production variable `SUPABASE_SECRET_KEY`.
- Cleared the clipboard after the transfer and verified through metadata-only output that `SUPABASE_SECRET_KEY` is present; no secret value was printed, written to disk, committed, or emailed.
- Opened the authenticated Stripe live API-key page in the fresh Chrome window. Stripe presented an hCaptcha security challenge before exposing the key controls; automation did not attempt to solve or bypass it.
State now:
- `SUPABASE_SECRET_KEY` is present in Vercel Production. `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` remain missing.
- No Stripe customer, subscription, charge, webhook endpoint, Zelle transfer, deployment, merge, or production publish was created.
Next / handoff to: Anthony -> complete Stripe's visible security challenge in the open Chrome tab and tell Codex `done`; Codex -> copy the masked live key, inspect the existing webhook endpoint, store both missing Stripe variables as sensitive Production values, verify names only, and resume the approved publish gate.
Blocked on Anthony: one manual Stripe hCaptcha completion; no credential needs to be pasted into chat.

### [CHECK-IN] Codex - 2026-07-18 - production Stripe webhook setup
Picking up: Configure the live Stripe webhook for the deployed owner portal through Anthony's authenticated Chrome session and store its signing secret only as an encrypted Vercel Production variable.
State I see:
- Anthony pasted a live Stripe secret into chat. It is treated as exposed and will not be used, printed, saved, or transferred; rotating it requires a separate explicit approval because it changes account credentials.
- The authenticated live Stripe account is Amma Ventures LLC (Mercury), and the production route expects `https://finacalleos.com/api/stripe/webhook` with seven handled event types.
- `SUPABASE_SECRET_KEY` is present in Vercel Production; `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` remain missing.
Boundaries:
- Configure or verify the webhook and secure its signing secret. Do not create a customer, subscription, invoice, charge, payment, or transfer. Do not deploy or merge in this pass.

### [CHECK-OUT] Codex - 2026-07-18 - production Stripe webhook created
Did:
- Created active live Stripe destination `Fina Calle Owner Portal Production` for `https://finacalleos.com/api/stripe/webhook` in the Amma Ventures LLC (Mercury) account.
- Scoped it to the seven events handled by the production route: `checkout.session.completed`; subscription created, updated, and deleted; invoice paid, payment failed, and payment action required.
- Copied the new signing secret through Chrome's protected clipboard directly into Vercel as sensitive Production variable `STRIPE_WEBHOOK_SECRET`; verified the variable name, Sensitive type, Production scope, and added state without displaying its value.
- Verified the live route responds to an unsigned POST with HTTP 400 and metadata-only output shows `SUPABASE_SECRET_KEY` plus `STRIPE_WEBHOOK_SECRET` present.
State now:
- `STRIPE_SECRET_KEY` remains missing. The key Anthony pasted into chat is exposed and was not used or stored.
- No customer, subscription, invoice, charge, payment, transfer, deployment, or merge occurred.
Next / handoff to: Anthony -> explicitly approve rotation of the exposed live Stripe API key; Codex -> create a replacement in the authenticated Stripe dashboard, transfer it directly to sensitive Vercel Production storage, revoke the exposed key, then resume the approved publish verification.
Blocked on Anthony: credential rotation changes Stripe account access and requires explicit approval.
