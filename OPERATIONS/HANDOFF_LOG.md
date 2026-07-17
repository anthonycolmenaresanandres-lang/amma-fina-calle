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
