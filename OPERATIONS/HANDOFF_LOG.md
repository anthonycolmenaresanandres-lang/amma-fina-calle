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
