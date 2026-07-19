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

## [x] 6 - Simplify and center the Fina Calle mobile landing page

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly requested on 2026-07-19 that the mobile site use way fewer words, centered composition, and a very simple presentation.
**Branch base:** Continue `codex/landing-release-log-20260719` from production `main` at `44cb3c1`; PR #164 remains the single unmerged review surface.
**Scope:** Mobile-only presentation and copy variants in `APP/web/src/app/page.tsx` and `APP/web/src/app/page.module.css`, plus this task's operations records. Preserve the premium desktop composition.
**Boundaries:** No merge, production publish, protected-route edits, new assets, secrets, access, data, billing, migrations, email, purchases, or unrelated code.
**PASS:** At phone width, every section is centered and reduced to a short headline, primary action, image, or terse list; supporting paragraphs, codes, facts, secondary links, and metadata are removed from the mobile flow; desktop content remains intact; accessibility, targeted lint, production build, and responsive preview checks pass.
**STOP:** Stop before production merge or if the change alters desktop hierarchy, protected routes, link destinations, or verified business claims.

## [x] 7 - Present each mobile section as a premium graphic-novel page

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly requested on 2026-07-19 that each mobile section read like a cool comic-book page while avoiding a lame or novelty-comic result.
**Branch base:** Continue `codex/landing-release-log-20260719` from verified PR #164 head `5b35e1e`; production remains `44cb3c1`.
**Scope:** Mobile-only sequential framing and layout in `APP/web/src/app/page.tsx` and `APP/web/src/app/page.module.css`, plus this task's operations records. Preserve the simplified mobile copy and premium desktop composition.
**Boundaries:** No speech bubbles, novelty comic fonts, sound-effect graphics, new claims, new assets, merge, production publish, protected-route edits, secrets, access, data, billing, migrations, email, purchases, or unrelated code.
**PASS:** The six phone sections read as an intentional 01-06 sequence with distinct splash, proof, module-grid, storyboard, control, and finale compositions; the graphic-novel character comes from gutters, crops, ink texture, and restrained page marks; mobile remains centered and concise; desktop, accessibility, links, routes, lint, build, and preview verification pass.
**STOP:** Stop before production merge or if the treatment becomes harder to scan, clips content at supported phone widths, harms focus/touch behavior, alters desktop composition, or changes protected behavior.

## [x] 8 - Deepen mobile comic texture, contrast, and shadow

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly requested on 2026-07-19: `More texture more comic more words contrast more contrast in general use shadowing please`.
**Branch base:** Continue `codex/landing-release-log-20260719` from verified PR #164 head `45beceb`; production remains `44cb3c1`.
**Scope:** Mobile-only finish work in `APP/web/src/app/page.module.css` plus this task's operations records. Preserve the short mobile copy, sequential 01-06 structure, desktop composition, and existing assets.
**Interpretation:** Increase contrast around the words rather than adding more words: deepen Ink, brighten Paper/Gold/Sapphire, layer halftone and crosshatch texture, and use crisp offset shadows and heavier panel gutters.
**Boundaries:** No new copy, speech bubbles, novelty comic fonts, sound effects, new assets, merge, production publish, protected-route edits, secrets, access, data, billing, migrations, email, purchases, or unrelated code.
**PASS:** At 390 px and 320 px, headings and labels have stronger readable separation; all six sections carry richer ink/paper texture, harder panel depth, and clearer contrast without visual menace or clutter; desktop, focus/touch behavior, routes, lint, build, and preview checks pass.
**STOP:** Stop before production merge or if texture competes with legibility, shadows clip content, small-phone layout overflows, desktop changes, or protected behavior changes.

## [x] 9 - Publish the approved mobile sequential-art refinement

**State:** DONE
**Codex effort:** LOW
**Authority:** Anthony explicitly approved the production merge on 2026-07-19 with: `merge pleae`.
**Branch base:** Ready PR #164 from `codex/landing-release-log-20260719` into `main`; approved head is `07a8d09`, and production `main` is `44cb3c1` before release logging.
**Scope:** Commit this release check-in, squash-merge only PR #164, wait for the exact resulting `main` revision to reach Vercel production, then verify the public root and representative protected routes read-only.
**Boundaries:** No new product code, visual changes, secrets, access, data, billing, migrations, email, purchases, or unrelated deployment work. Stop at the first branch, check, merge, deployment, alias, live-content, route, or runtime-log divergence.
**PASS:** PR #164 is merged to `main`; its exact squash commit reaches a Ready Vercel production deployment; the root returns HTTP 200 and contains the approved 01-06 mobile sequence and short headline; `/conquest`, `/owner/colattao`, `/customers`, and `/m/colattao` remain reachable or auth-gated as expected; production logs show no release-time error.
**STOP:** Stop and report before remediation if the approved head changes, checks fail, mergeability changes, Vercel does not reach Ready, the live alias points elsewhere, approved content is absent, or a protected route regresses.
