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

## [x] 2 - Build the client ledger and owner-controlled team access

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony continued the Codex-owned implementation and requested a way to identify every client, see what each pays, and onboard future employees.
**Branch base:** `codex/owner-billing` at `ba866e8`.
**Scope:** Upgrade `/customers` and `/customers/[id]`; add `/customers/team`; extend prepared migration `0010` with recurring price facts; add unused migration `0011_client_ledger_and_team_access.sql`; update existing Supabase magic-link admin auth. Public menu, owner editing, games, bank credentials, and production are excluded.
**Migration state:** `0011_client_ledger_and_team_access.sql` is unused locally and depends on prepared `0010`. Applied production state remains unknown; apply neither migration.
**Access rule:** New team members receive internal operations access only. Only the existing Anthony owner email is prepared to manage the team. No access is granted by Codex.
**Boundaries:** local code only. Do not add a live employee, send an invite, enter secrets, apply migrations, deploy, push, merge, or touch production.
**PASS:** Client ledger identifies each business/contact and displays plan, recurring amount/interval, payment status, invoice state, and renewal date; client detail shows owner-portal access route and allowed owner emails; team roster shows active staff; only a team manager can prepare add/deactivate actions; first-time allowlisted employees can request a magic link without email enumeration; server authorization is rechecked; targeted lint, type/build, and browser checks pass.
**STOP:** Stop before any live access change, invite/send, migration application, deployment, push, merge, credential entry, or production action.

## [x] 3 - Finalize owner billing with Stripe and Zelle reconciliation

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony explicitly directed Codex to finish the owner portal, finalize the Stripe and Zelle integration, install the prescribed browser runner and useful supporting skills, and place the SOPs in Drive Documents.
**Branch base:** `codex/owner-billing` at `5d5bc33`.
**Scope:** Harden the prepared Stripe workflow; add an authenticated owner Zelle payment-reporting surface and an admin verification inbox; add one unused Supabase migration after `0011`; correct billing documentation; verify with the installed agent-browser; create one comprehensive AMMA SOP manual and import it into the Drive `Documents` folder. Public menu, games, bank credentials, automatic Zelle settlement, and production are excluded.
**Migration state:** `0012_zelle_payment_notices.sql` will be prepared locally and depends on unapplied migrations `0010` and `0011`. Applied production state remains unknown; apply none of them.
**Payment rule:** Stripe remains the authoritative recurring rail. Zelle is a manual Bank of America rail: an owner report remains `reported` until an authorized AMMA billing manager marks it `verified` or `rejected`. Mercury is not represented as Zelle-compatible.
**Boundaries:** local/test-mode code and Drive document creation only. Do not enter secrets, access bank accounts, apply migrations, change live Stripe/Zelle settings, deploy, push, merge, or touch production.
**PASS:** The owner portal securely displays server-configured Zelle instructions, records an owner report without marking the account paid, shows recent report status, and exposes billing-manager-only verification; Stripe records the invoice paid timestamp and rejects insecure production callback configuration; the billing runbook covers Stripe, Bank of America Zelle, Mercury, reconciliation, and activation; lint, type/build, security review, and browser fail-closed checks pass; the verified SOP manual is a native Google Doc inside Drive Documents.
**STOP:** Stop before secrets, bank login, live payment configuration, migration application, deployment, push, merge, or production access. Stop and report any repo conflict.

## [x] 4 - Reframe the Fina Calle public landing page

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly directed Codex on 2026-07-19 to proceed with the approved landing-page redesign and make it feel expensive, intricate, innovative, calm, secure, and edgy without becoming scary.
**Branch base:** `codex/landing-premium-20260719`, created from current `origin/main` at `422352b` in `C:\Dev\amma\worktrees\landing-premium-20260719`.
**Scope:** Public root landing page, root metadata, one bespoke social-preview asset, and this task's operations log. Preserve all owner/customer/menu, billing, authentication, database, API, game-engine, `/conquest`, and production behavior.
**Boundaries:** Local branch, verification, push, and review PR only. Do not merge, deploy, publish, enter secrets, alter access, or touch production.
**Token-saving rule:** Read and change only the root landing surface, metadata, directly used public assets, and handoff records; run targeted lint plus one final production build.
**Why:** The current homepage is visually cinematic but communicates the offer weakly. The redesign must make local-business owners understand the offer, trust the proof, and request a build while preserving the Fina Calle identity.
**PASS:** The first viewport explains Fina Calle plainly and routes to a build request and verified work; Colattao proof and live modules are represented without future-feature claims; visual language is open/editorial, premium, calm, secure, and responsive; keyboard focus and reduced motion are respected; protected routes have no diff; targeted lint and the production build pass; a review PR is open.
**STOP:** Stop before merge, Vercel deployment, Sites hosting, production publish, or any change to protected routes, data, access, billing, or secrets.

## [x] 5 - Publish the approved Fina Calle landing redesign

**State:** DONE
**Codex effort:** LOW
**Authority:** Anthony explicitly approved the live production release on 2026-07-19 with: `go for it i want to see it live`.
**Branch base:** Ready PR #163 from `codex/landing-premium-20260719` into `main`; approved head before release logging was `813bb3e` and all GitHub/Vercel checks passed.
**Scope:** Merge PR #163, wait for the corresponding Vercel production deployment, then verify `https://finacalleos.com/`, `/og.png`, canonical metadata, and representative protected routes without changing them.
**Boundaries:** No additional product code, secrets, access, data, billing, migrations, email, purchases, or unrelated deployment work. Stop at the first deployment or live-content divergence.
**PASS:** PR #163 is merged to `main`; the exact merged head reaches a Ready Vercel production deployment; the root and OG image return HTTP 200; live HTML contains the new headline, proof, CTA, canonical URL, and OG image; `/conquest`, `/owner/colattao`, `/customers`, and `/m/colattao` still return their expected reachable/auth-gated responses; production logs show no release-time error.
**STOP:** Stop and report before any remediation if mergeability changes, checks fail, Vercel does not reach Ready, the live alias points elsewhere, new homepage content is absent, or a protected route regresses.
