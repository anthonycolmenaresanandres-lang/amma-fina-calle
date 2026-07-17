# Codex Queue — canonical live queue

_Claude writes; Codex executes. This is the only live queue._

Canonical repo: `C:\Dev\amma\amma-fina-calle`
App: `APP/web`
Production branch: `main` (human approval required)
Live handoff log: `OPERATIONS/HANDOFF_LOG.md`
Superseded Desktop queue: `OPERATIONS/archive/desktop-20260710/CODEX_QUEUE.md`

## Revalidation gate — no active task yet

The archived Desktop queue contains stale clone paths, a stale migration counter, and production/send steps that require human action. Claude must revalidate each item against the current canonical branch before restoring it as an actionable task.

Required revalidation fields:

- exact canonical paths and branch base;
- proposed migration filename unused, plus applied production state verified or explicitly unknown;
- whether the task crosses a secret, access, send, deploy, or production boundary;
- targeted PASS condition and explicit stop condition.

## Claude handoff template

````markdown
## [ ] N — short imperative title

**State:** READY | IN PROGRESS | DONE | BLOCKED
**Codex effort:** LOW | MEDIUM | HIGH
**Scope:** exact files/surfaces and explicit exclusions.
**Token-saving rule:** targeted reads; changed lines/new files only; final verification only.
**Why:** concise context.
**Exact prompt to paste:**
```text
Anthony, ...
PASS = ...
```
````

No task is live until it appears below this line with a current PASS condition.

## [x] 1 - Add secure owner billing and repair mobile sign-in

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony explicitly directed Codex to own this implementation here on 2026-07-17, overriding the normal Claude-only queue-writing rule for this task.
**Branch base:** `codex/owner-billing`, created from `ops/data-center-docs` at `83a1e27`.
**Scope:** `APP/web/src/app/owner/[id]`, new server-only Stripe/billing modules, one Stripe webhook Route Handler, one unused Supabase migration after `0009`, Stripe dependency metadata, and targeted documentation. Existing menu, game, public `/m`, and production surfaces are excluded.
**Migration state:** `0010_owner_billing_subscriptions.sql` is unused locally. Applied production migration state is unknown; do not apply it.
**Boundaries:** local/test-mode code only. Do not enter secrets, apply migrations, configure bank access, deploy, merge, push, or touch production.
**Token-saving rule:** targeted reads; changed lines/new files only; final verification only.
**Why:** Owners need responsive sign-in, payment status, recurring billing enrollment, invoice recovery, and a safe hosted billing-management path.
**PASS:** Local code builds without Stripe/Supabase server secrets; owner actions re-authorize restaurant access; Checkout uses only a server-configured recurring price; Customer Portal uses only the server-side customer mapping; webhook verifies the raw-body signature and deduplicates events; billing UI exposes no Stripe identifiers; 320/390 px sign-in does not overflow; targeted lint and build pass.
**STOP:** Stop before secrets, live Stripe configuration, migration application, deployment, push, merge, or production access. Stop and report if current repo state conflicts with this scope.
