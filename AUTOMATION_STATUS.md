# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-09-20 (afternoon check-in, `claude-opus-4-8`). **All four repos GREEN; nothing needed fixing.** Only change since the 09-20 morning run: the **09-20 VBFH Daily Run (#109) fired + SUCCEEDED** (15:43→15:45 UTC) — the run the morning check found had not yet fired. No new commits, merges, closes, or human review comments anywhere across the four repos. The two amma drafts touched on 09-20 (#238, #225) show only Vercel-bot deploy notes, no human review. vbfh draft **#8** unchanged (head `fb921c8` static, `mergeable_state: clean`; CI green — run #23) — still Anthony's held draft. Default branches re-verified live via API — all unchanged: amma `9be5b13c` (#237), vbfh `e21077d` (#7), shadow `5113ce5` (dormant, 2026-07-09), EscapeTheBomb `eee6a37` (#1). amma `CI — web` ✅ (#174) + `CI — voice-gateway` ✅ (#13) on main; vbfh `CI` ✅ (#23) on master. **VBFH Daily Run — GREEN. Latest completed #109** (09-20 15:43→15:45 UTC SUCCEEDED). Zero failing workflow runs across all repos this run. shadow & EscapeTheBomb have no CI workflows (0 runs) — nothing to verify. **Six** open amma drafts (#238/#225/#221/#219/#218/#197) — all Vercel Ready ✅, `mergeable_state: clean`, held; no new review comments (only Vercel-bot deploy notes). No merge-conflict/base-branch notices; GitHub API healthy all run. Branch deletion remains blocked (proxy 403); the open draft heads stay OUT of the delete set.
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets / Stripe / customer data) still wait for Anthony's explicit go-ahead. Drafts are held by their author and are not caretaker-merged.
**Caretaker model:** pinned to **Opus 4.8** (`/model` is a CLI command, not runnable from the shell in this env; ran as configured `claude-opus-4-8`). Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

⚠️ **Governance question inside draft PR #218 — please confirm or deny (no action taken).**
   Draft **PR #218** ("E-Myth Revision 4", docs-only under `OPERATIONS/E_MYTH` + `HANDOFF_LOG.md`,
   guardrail-clean, Vercel Ready ✅) contains an **open governance flag**: its Revision-4 commits were authored
   by **"Clone"** and logged under a Codex entry asserting *"Anthony explicitly directed `Revise pr218`."*
   That direction isn't recorded in the session that opened the PR, and `CLAUDE.md` scopes Clone to **watching**,
   not authoring. A claim of authorization written inside the artifact it authorizes isn't independent proof.
   **Did you direct that revision?** If yes, it's fine and it stays a held draft for your merge call. If no,
   you may want to close it / reset the branch. I've taken no action either way. _(The docs-only price-anchor
   commit `e1b1fbe` — authored by "Claude", not "Clone" — correcting the E_MYTH doc to the locked $199 offer
   does not change the governance question above.)_

🆕 **New draft PR #238 "Menu Control owner app plan" — two things need your call (held docs draft).**
   `claude/menu-control-app`, opened 09-20. **Documentation only** — a research/architecture plan plus two Codex
   queue entries (49/50) for the owner-side menu app you asked for (QR menu → owner app, simple, owner-editable
   or AMMA-managed, gamified). Guardrail-clean (no schema/route/Supabase/Stripe/POS/client-contact/price/deploy),
   Vercel Ready ✅, `mergeable_state: clean`. **Held — your draft; I don't auto-merge drafts.** Inside it are two
   items only you can settle:
   - **Reconcile the Colattao menu (blocks its own queue item 49).** Colattao's guest menu at the printed QR is a
     **static file** while the owner portal writes to **Supabase**, and the two have **already drifted** ("Fall
     Drinks"/51 items vs "Seasonal Drinks"/~54 items). Before any owner-editable menu can go live for Colattao,
     you need to say — menu item by item — which version is correct. The plan tells Codex not to guess.
   - **A confirmed live bug on the guest menu (I can't fix it — it's in the guarded `/m/[id]` route).** A price of
     `0` is meant to read "Ask staff," and five files do that, but the one screen guests actually see renders it
     `$0.00` (a free item). `House Brew` is seeded at `0` and is the first item on the menu. It's queued for
     Codex (item 49); flagged here because it's live now and touching `/m/[id]` is outside what I'm allowed to do.

🆕 **Three demos/add-ons still open for your review & merge call (held drafts, guardrail-clean):**
   - **#225 Instagram Ordering Activation add-on** (`claude/instagram-dm-ordering-m8i210`).
     Docs + local tooling only (SOP, work-order template, and an invokable `amma-ig-ordering-setup` skill with an
     offline rail-picker script). No price quoted anywhere, no client contacted, no account/credential/route/
     Supabase/Stripe change. `mergeable_state: clean`, Vercel Ready ✅. **Held — your draft.**
   - **#221 Order Drop** (`claude/blissful-darwin-gtt3su`) — lightest #220 slice: a Colattao Churro Latte
     promo hands the customer straight to Uber Eats. `web` CI ✅, Vercel Ready ✅.
   - **#219 Las Palmas lotería hero** (`claude/las-palmas-loteria-hero`) — first phone screen is a playable
     penalty shootout minting a lotería card per goal. Vercel Ready ✅.
   Open each preview and merge if you like it, or tell me what to change. **I don't auto-merge your drafts.**
   _(You've now also merged **#237** "Simplify Fina Calle with restrained comic-book styling" yourself (09-17
   18:57 UTC) — homepage styling refinement, guardrail-clean, `CI — web` #174 ✅; noted only for the record.
   Earlier you merged **#234** "Premium owner portal, guarded billing and owner guide" (09-14 13:23 UTC) — it
   sits in the protected `/owner/[id]` + Stripe guardrail area, which is fine as your own merge; noted for the
   record. **#215's Table Duel deploy step is still yours** — set the Render blueprint + `NEXT_PUBLIC_TABLE_DUEL_WS`
   env var for the websocket server, or `/table-duel` says it isn't switched on yet.)_

🆕 **New draft PR #8 in vbfh-media-engine is yours to review & merge (held — your own draft).**
   "Make VBFH Daily Mail fail closed and verify Dash results" (`codex/vbfh-daily-mail-reliability`, opened
   09-19). A big reliability rework (44 files) that makes the daily mail refuse to send junk, reads real final
   scores off DaySmart team pages, and has Claude/OpenAI eyeball the graphics before they go out. **CI is green
   and it merges clean** (its `check` re-ran green — run #23), but it is a **draft** and once merged it needs an
   extra secret **`OPENAI_API_KEY`** on top of the 5 SMTP secrets in item 1 (its workflow intentionally fails if
   AI or email can't complete). Read it, and when you're happy, mark it "Ready" + merge (or tell me what to
   change). **I don't auto-merge your drafts.**

1. **Add the 5 VBFH email secrets — exact Gmail values below (Anthony asked for anthonycolmenaresanandres@gmail.com).**
   vbfh-media-engine → Settings → Secrets and variables → Actions → New repository secret, five times:
   `EMAIL_TO` = `anthonycolmenaresanandres@gmail.com` · `EMAIL_FROM` = `anthonycolmenaresanandres@gmail.com`
   · `SMTP_HOST` = `smtp.gmail.com` · `SMTP_USER` = `anthonycolmenaresanandres@gmail.com` · `SMTP_PASS` =
   a Gmail **App Password** (myaccount.google.com/apppasswords → create app password → paste the 16 chars,
   no spaces; requires 2-Step Verification on the Google account — your normal password will NOT work).
   Port 587 default is already correct, no Variables needed. Next 14:00-UTC Daily Run then emails you the
   caption + all post-ready graphics (the #7 code is now live on master). **This is the only thing standing
   between you and the VBFH graphics landing in your inbox — the run is green, it just has nowhere to send.**
2. **Confirm the "Claude QA's the images before emailing" routine (was PR #4's open question).** The code
   half is fully landed (#5+#7); #4 itself is closed as superseded. What's left is only the decision:
   should a scheduled Claude session QA/regenerate the graphics after each 14:00-UTC run before the email
   goes out? Say yes + preferred timing and I'll build the routine.
3. **Runway credits — still blocked (the #197 draft logs Day 06 blocked).**
   The plan's credit pool is exhausted and it's monthly (won't self-reset), so the Odyssey Daily shot
   can't progress until you act. Top up credits, or schedule client art *after* the daily shot so it
   can't starve the next morning's run. (This is the only recurring item that keeps re-surfacing.)
4. **Grant application is on `main` — submit it yourself when ready.**
   `BUSINESS/GRANT_APPLICATION_DEV_PC.md` (landed via #196). Nothing is auto-submitted.
5. **(If not already done) Run the Marbel admin SQL in Supabase.** From #150: Supabase SQL editor →
   run `0009_admin_team_update.sql` (or `supabase db push`) to grant `marbeljsiado@gmail.com` admin.
   I can't see Supabase state from here — skip this if you already ran it.
6. **⛔ Branch cleanup — you gave permission, I retried, the environment still physically blocks it.**
    `git push --delete` returns **HTTP 403 from the session's git proxy** (server-side, regardless of
    permission), and the GitHub tooling here has no branch-delete API. The refreshed safe-to-delete set is
    in the paste-ready commands below; they'll run fine from your local clone. It **excludes** the five open
    draft heads #225/#221/#219/#218/#197.

_Resolved / no action needed from you:_ **amma #237 "Simplify Fina Calle with restrained comic-book styling" —
you merged it** (09-17 18:57 UTC; homepage styling refinement, guardrail-clean, `CI — web` #174 ✅; your own
merge). **amma #234 "Premium owner portal, guarded billing" — you merged it** (09-14 13:23 UTC; protected
`/owner/[id]` + Stripe area, your own merge; `CI — web` #167 ✅). **GitHub API access** — the 09-01
morning `401 Bad credentials` outage self-cleared and has stayed healthy since; no reconnect needed. **amma #29
("AI Request Desk — Phase 0") — closed since 07-18**; listed as a standing decision in the run brief but already
resolved (closed by Anthony), so there is nothing to adopt-and-rebase or close. No action. **#222 "Café Rush catch
game" — you merged it** (08-20, guardrail-clean additive `/cafe-rush` route, Colattao in-store QR unchanged).
**#216 "Restaurant Buyer Package / $199 offer" — you merged it** (08-18). If you still want it rendered into a
polished branded PDF packet as the print/email leave-behind, say the word and I'll build it.

_No longer on the list:_ **#201 draft decision — DONE** (Las Palmas Menu now points at the official Lynnhaven
PDF). The AJ Gator's / Las Palmas visual wave (#202–#207) all merged by Anthony.

---

## Build health (as of 2026-09-20, afternoon)

> **✅ All columns below re-verified live this run** — check-runs, Daily-Run result, and default-branch tips were
> all read directly via API. Every build is green.

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip **`9be5b13c`** (**#237** "Simplify Fina Calle with restrained comic-book styling," 09-17 18:57 UTC; **Anthony's own authorized merge**, **`CI — web` #174 ✅**). Advanced 09-17 via **#237** from `b82c908e` (#236). #237 is a **homepage styling refinement** (condensed comic-book visual direction; homepage `page.tsx` + new route-scoped `comic.module.css` + OPERATIONS docs; 7 files, +864−394). PR body records **no original motion/asset, form, backend, owner/menu/game behavior, dependency, database, access, payment or customer-send changes** and **Anthony's explicit authorization** of the scoped refinement + release. Verified paths: **no Client OS route, Supabase, Stripe, POS, secret, customer-data or stable-QR change** → **Anthony's own merge, no caretaker action; recorded only.** Latest `CI — voice-gateway` on main ✅ (**run #13**; nothing merged since touched voice paths). **Six** open drafts held: **#238** Menu Control owner app plan (NEW 09-20, docs-only, guardrail-clean, two findings for Anthony), **#225** IG Ordering Activation add-on (docs + local tooling, guardrail-clean), **#221** Order Drop demo (`web` CI ✅), **#219** lotería hero (product UI, guardrail-clean), **#218** E-Myth Rev 4 (docs-only, 6 commits, open governance flag) and **#197** docs. The older five are unchanged (`updated_at` static since 08-16…09-16 aside from Vercel-bot activity); #238 is the only new movement this run. |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" scheduled | CI ✅ (master push 07-30 12:54 UTC, run #21 ✅); master tip `e21077d` (**#7**). Workflow `active`, unchanged. **VBFH Daily Run — GREEN.** Latest completed run **09-20 15:43→15:45 UTC SUCCEEDED (run #109)**. Every run 07-21…09-20 that fired was ✅ (~sixty-day streak). The email-gate fix holds (`skipped_config_missing` non-fatal; a real SMTP `failed` still fails). Content pipeline completes (`needs_review`, `gamesFound:0` = known DaySmart standings-only limitation, not a regression). Emails start once the 5 SMTP secrets are set (action item 1). **One open draft PR #8** (Anthony's own, `codex/vbfh-daily-mail-reliability`, opened 09-19; a 44-file daily-mail reliability + DaySmart-team-page-scores + OpenAI-QA rework; CI `check` ✅ — re-ran green, run #23 — `mergeable_state: clean`) — **held, his review/merge call** (needs `OPENAI_API_KEY` + SMTP secrets to run). |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · no workflows (0 runs) · master tip `5113ce5`, last commit 2026-07-09 (re-verified) |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | **#1 merged** (M1 scaffolds, squash `eee6a37`, 2026-07-30); zero open PRs · no workflows (0 runs). First Windows compile after pull is the real verify (M2 gate). |

## Open PRs

- **amma #238 (draft, docs-only) — "docs(product): Menu Control owner app plan + Codex queue 49/50."**
  Opened 2026-09-20 10:14 UTC. Head `claude/menu-control-app`, base `main`, 1 commit, 4 files (+324): new
  `PRODUCT_MODULES/MENU_CONTROL_APP_PLAN.md` (research, three-surface architecture, gamification design, premortem,
  phases P0.5–P5), `MODULE_LIBRARY.md`, `OPERATIONS/CODEX_QUEUE.md` (queue items 49 + 50), `HANDOFF_LOG.md`.
  **Guardrail-clean:** documentation only — no schema migration, route, Supabase/Stripe/POS, product code,
  client contact, price, or deploy. Branched from `main` (not #225's branch) so **PR #225 stays clean**.
  **Vercel Ready ✅**, `mergeable_state: clean`. **Held — Anthony's own draft; his review/merge call. Not a
  caretaker merge** (draft). Surfaces two items for Anthony (see "What Anthony needs to do"): the Colattao
  static-vs-Supabase menu reconciliation that blocks its queue item 49, and a confirmed live zero-price
  (`$0.00` vs "Ask staff") bug on the guarded `/m/[id]` guest route — flagged, not touched (Client OS guardrail;
  already queued for Codex as item 49). Nothing for the caretaker to fix.
- **amma #225 (draft) — "feat(ops): Instagram Ordering Activation add-on — SOP, skill, and work order."**
  Opened 09-11. Head `claude/instagram-dm-ordering-m8i210` (the branch #220 was closed on; reused, so it is
  open-draft-protected again). 9 files (+623−2): a G0–G5 gated SOP, a blank work-order template, an invokable
  `.claude/skills/amma-ig-ordering-setup/` skill with an offline rail-picker script + `partners.json`, and a
  plan-doc correction. **Guardrail-clean:** documentation + local tooling only — no Client OS route, Supabase,
  Stripe, product route, account, or credential change; no price quoted; no client contacted. **Vercel Ready ✅**,
  `mergeable_state: clean`. **Held — your draft.** Nothing to fix.
- **amma #221 (draft) — "feat(demo): Order Drop — one-item Instagram → Uber Eats seamless flow (#220 slice)."**
  Opened 08-18. Head `claude/blissful-darwin-gtt3su`. 3 files (+1299), all under
  `APP/web/src/app/(internal)/demo/order-drop/`. Static, unlinked, `noindex` prospect demo. **Guardrail-clean**
  (no Client OS route/Supabase/Stripe/Meta/backend/secret/customer data/QR change; all art original CSS/SVG; the
  "Uber Eats" screen disclosed in-page as illustrative). **`web` CI ✅**, **Vercel Ready ✅**, `mergeable_state:
  clean`. **Held — draft.** Nothing to fix.
- **amma #219 (draft) — "feat(demo): lead Las Palmas with a playable lotería hero."** Opened 08-17. Head
  `claude/las-palmas-loteria-hero`. First-viewport playable penalty shootout that mints a lotería card per goal;
  3 files (+744), all inside the Las Palmas demo folder. **Guardrail-clean** (primitive art; no client logo).
  **Vercel Ready ✅**, `mergeable_state: clean`. **Held — draft.** Nothing to fix.
- **amma #218 (draft, docs-only) — "ops: E-Myth Revision 4 — evidence-bound automation controls."** Opened
  08-17. Head `claude/e-myth-ai-automation-gcetx0`. Documentation only under `OPERATIONS/E_MYTH` + `HANDOFF_LOG.md`;
  **6 commits** — latest **`e1b1fbe`** (price-anchor correction to the locked $199 offer, authored by "Claude").
  **Vercel Ready ✅**, `mergeable_state: clean`, path-filtered (no CI run). **Held — draft.** ⚠️ **Carries the
  open "Clone"-authored governance question** (see "What Anthony needs to do"). Flagged, no caretaker action.
- **amma #197 (draft, docs-only) — "Odyssey Daily log — Day 06 blocked (Runway pool still empty)."**
  Opened 07-30; Day-06 continuation of the merged #189 series. Head `claude/las-palmas-menu-game-59vtbg`.
  Vercel preview Ready/green; no `CI — web` (docs-only, path-filtered). **Held — draft.** Nothing to fix.
- **vbfh #8 (draft) — "Make VBFH Daily Mail fail closed and verify Dash results."** Opened 2026-09-19
  10:10 UTC. Head `codex/vbfh-daily-mail-reliability`, base `master`. 44 files (+2019−182), 1 commit. Reworks the
  daily pipeline to fail closed (missing SMTP config, missing attachments, rejected recipients, and required
  AI transport/config failures now surface to Actions instead of silently passing), refreshes the DaySmart
  league directory, reads official finals off team pages (accepting a final only when both team pages agree on
  teams/home-away/date/score) and blocks incomplete/conflicting/stale/low-confidence data, generates carousel
  cards only from ready leagues, removes scheduled Instagram publishing (marketing gets images + review PDF +
  caption + verdict by email instead), and adds a low-cost OpenAI Responses-API vision review with recorded
  token/cost metadata. PR body reports `npm test` (43 files / 235 tests), `npm run lint`, `npm run build`, and a
  fixture smoke test all passing. **CI `check` ✅ (re-ran green, run #23), `mergeable_state: clean`.** Requires new
  secrets to run once merged (`OPENAI_API_KEY` + the 5 SMTP secrets). **Held — Anthony's own draft; his
  review/merge call. Not a caretaker merge** (large feature + secrets). Nothing to fix.
- shadow-engineer-rpa, EscapeTheBomb-DC: **zero open PRs.**

## Merged / closed since last run

Since the 09-19 morning run, **no new merges or closes landed anywhere** and **no new commits, review comments,
or PRs** appeared — the only movement was the day's **VBFH Daily Run #108** firing green (see Build health) and
vbfh draft **#8**'s CI re-running green (run #23; head unchanged). The most recent merge on record remains
**Anthony's own merge of #237** on amma `main` (09-17) → no caretaker action:

- **amma #237 — "Simplify Fina Calle with restrained comic-book styling."** Merged by **Anthony** 09-17
  18:57 UTC (merge `9be5b13c`, current main tip). Codex-authored (`codex/consulting-comic-20260917`), 7
  files (+864−394). Refines the consulting homepage to four compact sections with a restrained comic-book
  visual direction (condensed display type, print texture, black/gold contrast); cuts 390px visible copy
  594→217 words and page height 7329px→3394px. Original crest, artwork, particle transformation and motion
  stylesheet unchanged; live-menu/playable-demo labels, consultation/support separation, and the secondary
  $199/mo restaurant offer stay visible. Changed paths: `APP/web/src/app/page.tsx`, new
  `APP/web/src/app/comic.module.css`, and OPERATIONS/HANDOFF docs. PR body states **no original motion/asset,
  form, backend, owner/menu/game behavior, dependency, database, access, payment or customer-send changes** and
  **Anthony's explicit authorization** of the refinement + release. Verified changed paths confirm it — **no
  Client OS route (`/m|/owner|/customers`), Supabase, Stripe, POS, secret, customer data, or stable-QR change.**
  `CI — web` **#174 ✅**; post-merge Vercel Ready and the live domain passed the PR's read-only checks.
  **Anthony's own authorized merge → no caretaker action; recorded for the audit trail.**

### Prior run (09-16 afternoon)

- **amma #236 — "Make Fina Calle consulting-first with clear proof and inquiry paths."** Merged by **Anthony**
  09-16 20:13 UTC (merge `b82c908e`). Codex-authored (`codex/consulting-first-20260916`), 13
  files (+1026−589). Repositions the public journey to lead with family-owned consulting + hands-on digital
  delivery: reworks the homepage, `/contact` and `/for-restaurants` landing + lead form, adds a `/request-update`
  path and consultation-form components (both public inquiry forms retain failed drafts, block duplicate
  submissions, and require confirmed storage/email before showing success), and moves the $199/mo restaurant
  package to a secondary offer; plus OPERATIONS/HANDOFF docs (`CONSULTING_REDESIGN_20260916.md`). PR body states
  **no logo/art, LandingMotion controller, game/menu/owner behavior, backend, database, access, payment or
  dependency changes**, that no real customer inquiry was submitted, and that **Anthony explicitly authorized the
  scoped merge + live release on 09-16**. Verified changed paths confirm it — **no Client OS route (`/m|/owner|
  /customers`), Supabase, Stripe, POS, secret, customer data, or stable-QR change.** `CI — web` **#172 ✅**;
  post-merge Vercel reached Ready and the live domain passed the PR's read-only checks. **Anthony's own
  authorized merge → no caretaker action; recorded for the audit trail.**

### Prior wave

- **amma #235 — "Gran Patrón menu and shootout review preview."** Merged by **Anthony** 09-16 10:32 UTC
  (merge `30fe59e2`). Clone-authored, 50 files. Adds a new prospect demo for **Gran Patrón**: a menu preview at
  `/demo/gran-patron`, a penalty-shootout preview at `/play/gran-patron`, a `src/table-os/menu/gran-patron`
  catalog/manifest/source-snapshot, original non-human game art (burrito / piña / cantina-pitch webp), build +
  browser-QA scripts, plus OPERATIONS build-spec/plan/review docs; minor Las Palmas game-hub tweaks.
  **Guardrail-clean:** additive `/demo` + `/play` routes only — **no Client OS route, Supabase, Stripe, POS,
  secret, customer data, or stable-QR change.** `CI — web` **#170 ✅**. Game art is non-human with the primitive
  fallback preserved. **Anthony's own merge → no caretaker action; recorded for the audit trail.**

- **amma #234 — "Premium owner portal, guarded billing and owner guide."** Merged by **Anthony** 09-14
  13:23 UTC (merge `306fcf45`). Codex-authored (`codex/owner-standard-premium-20260914`), 42
  files (+2097−1501). Premium owner-only presentation + public owner guide, honest pending-setup states for Las
  Palmas / A.J. Gator's, a Colattao request-only menu workflow, and Stripe enrollment/reconciliation safeguards.
  PR body asserts no Colattao guest source / menu data / auth grants / migrations / production config / customer
  sends / payment transactions changed, and that Anthony authorized scoped live owner changes with merge held
  until all gates passed. **`CI — web` #167 ✅.** ⚠️ Touches the **protected `/owner/[id]` route + Stripe billing**
  — a hard-guardrail area the caretaker never merges on its own, but this is **Anthony's own merge** → no caretaker
  action; recorded for the audit trail.

Earlier in the prior wave (all Anthony's own merges, retained for the audit trail):

- **amma #233 — "Add Las Palmas official online ordering invitation."** Merged by **Anthony** 09-14 09:43 UTC
  (`a08c51a3`). Clone-authored; adds a Las Palmas official online-ordering invitation (links out to the official
  ordering surface). `CI — web` #164 ✅. Sits in the menu/ordering guardrail area but his own merge → no action.
- **amma #232 — "Las Palmas Cantina Jumbotron scoreboard."** Merged by **Anthony** 09-13 23:40 UTC
  (`5b039a9`). Clone-authored; closes out the live Las Palmas game-hub release and adds a Cantina Jumbotron
  scoreboard. `CI — web` #162 ✅. Game-hub UI (non-human game art per guardrails); his own merge → no action.
- **amma #231 — "Las Palmas persistent game invitation and dedicated character lobby."** Merged by
  **Anthony** 09-13 19:47 UTC (`48f86486`). Clone-authored. `CI — web` #160 ✅. His own merge → recorded only.
- **amma #230 — "Las Palmas Western menu at permanent QR."** Merged by **Anthony** 09-13 18:13 UTC
  (`d381e09`). Clone-authored; Las Palmas Western menu served at a *permanent* QR route. `CI — web` #158 ✅.
  ⚠️ QR/menu guardrail area but **Anthony's own merge** framing the QR as permanent (stable-URL intent) → no action.
- **amma #228 — "feat(owner): Las Palmas pilot, account and menu controls" (+ Mexico ball).** Merged by
  **Anthony** 09-11 18:35 UTC (`6a01a4b`), **Clone-authored**. ⚠️ Touches the protected `/owner/[id]` route — his
  own merge → no action; recorded only. `CI — web` #154 ✅.
- **amma #227 / #229 — Las Palmas release closeout (docs).** Merged by **Anthony** 09-11 (`2afaf67`, `220d5fe`).
  Documentation-only closeouts; Clone-authored, his own merges → no caretaker action.

### Earlier merged (09-11 morning)

- **amma #226 — "Ground Las Palmas goal and pink-shirt keeper; streamline workflow checks."** Merged by
  **Anthony** 09-11 10:55 UTC (`1e4d78d`). PR body records his explicit authorization. `CI — web` #152 ✅.
  His own authorized merge → no caretaker action. _(New keeper is a stylized fictional vector figure, not a real
  face or licensed mark; shipped as Anthony's own documented decision.)_

### Earlier merged (09-07 run)

- **amma #215 — "Table Duel: same-table hidden-fleet game for 2–6 phones."** Merged by **Anthony**
  09-07 16:57 UTC. Additive `/table-duel` route + in-memory WebSocket room server. **Guardrail-clean.** His own
  merge → no caretaker action. Deploy step (Render blueprint + `NEXT_PUBLIC_TABLE_DUEL_WS`) is Anthony's to run.
- **amma #223 — "Online ad campaign: ad factory, /for-restaurants landing page, and the plan."** Merged by
  **Anthony** 09-07. `CI — web` #148 ✅. No spend/publish without Anthony (by design). His own merge → no action.
- **amma #224 — "Fix ad landing leads rejected by the intake endpoint (400 invalid_request_type)."** Merged by
  **Anthony** 09-07 17:03 UTC. His own follow-up fixing #223 (allowlisted `requestType`). `CI — web` #150 ✅.
  Intake allowlist only (not a protected route). His own merge → no action.
- **amma #220 — "plan: Instagram DM ordering module."** **Closed unmerged** by Anthony 09-07 (superseded).
  _(Its branch `claude/instagram-dm-ordering-m8i210` has since been reused for the open draft #225.)_ No action.

### Earlier merged

- **amma #222 — "feat(cafe-rush): reusable catch game with Colattao design as the standard."** Merge
  **`13492161`**. Merged by **Anthony** 08-20. Additive `/cafe-rush` route; Colattao in-store QR unchanged;
  primitive art; no client logos. His own merge → no action; `CI — web` #142 ✅.
- **amma #216 / #217** — $199 restaurant offer standardization (docs) / E-Myth organizational layer (docs).
  Merged by Anthony 08-18 / 08-17. Documentation only. No caretaker action.
- **#214 / #213 / #212 — voice-gateway personalities.** Self-merged by Anthony 08-07. Config-only,
  `CI — voice-gateway` ✅. No caretaker action.
- **#211 / #210 / #209 / #208 — owner-portal wave** (`/owner/[id]`). Self-merged by Anthony 08-04…08-05,
  protected route, his own merges. `CI — web` ✅. No caretaker action.
- **#207–#201 (08-03 wave)**, **#200 / #199 / #198**, and the **2026-07-30 wave** (amma #162/#189/#180/#161/#196;
  EscapeTheBomb #1 `eee6a37`; vbfh #7 `e21077d`; #168 & vbfh #4 closed superseded). Full history in git.

## Branch cleanup — ready to run (refreshed 2026-09-14 afternoon)

Anthony has approved deletion, but the session git proxy returns **HTTP 403 on any `push --delete`**
(server-side block, independent of permission), and the GitHub tooling here has no branch-delete API. The
commands below remain for Anthony to paste from a local clone. **Verified KEEP:** `main`, `automation/status`,
`claude/*` caretaker branches, **the five remaining open-draft heads `claude/instagram-dm-ordering-m8i210` (#225),
`claude/blissful-darwin-gtt3su` (#221), `claude/las-palmas-loteria-hero` (#219),
`claude/e-myth-ai-automation-gcetx0` (#218) and `claude/las-palmas-menu-game-59vtbg` (#197)** (deleting any
closes its open draft), unmerged `voice/*` (Anthony's judgment) and the unproven squash-merged exploration sets.
**Eligible** (no longer open-draft-protected): `claude/table-duel` (#215, merged), `codex/las-palmas-goal-keeper-20260910`
(#226, merged), `codex/owner-standard-premium-20260914` (#234, merged) and now
**`codex/consulting-comic-20260917` (#237, merged 09-17)** — add them to your local delete run when you clear the
list; still not auto-deleted here (proxy 403 + no branch-delete API).

**amma-fina-calle** (verified merged or closed-superseded):
```
git -C amma-fina-calle push origin --delete \
  codex/free-video-game-visuals-20260718 codex/free-visual-toolkit-20260718 \
  codex/small-model-skill-selector-20260718 ops/data-center-docs \
  claude/screenshot-trap-landing claude/screenshot-trap-live agent/bodega-line-motion-20260722 \
  claude/blissful-darwin-ddej93 codex/ethical-sales-conversion-20260718 \
  claude/escape-bomb-dc-plan-n6bfj5 feat/las-palmas-lynnhaven-table-os \
  codex/aj-gators-landing-hub-20260801 codex/las-palmas-original-menu-20260802 \
  claude/restaurant-hub-buttons claude/aj-gators-shootout \
  codex/qr-proof-release-20260803 codex/aj-gators-bw-qr-20260803 \
  codex/owner-portal-comic-20260804 codex/owner-request-intake-20260805 \
  voice/volleyball-fr voice/larissa-offgrid voice/vbfh-return \
  claude/table-duel codex/las-palmas-goal-keeper-20260910 \
  codex/owner-standard-premium-20260914 codex/consulting-comic-20260917
```
**vbfh-media-engine** (verified merged or closed-superseded):
```
git -C vbfh-media-engine push origin --delete \
  claude/pensive-edison-hl5sxo claude/build-automation-management-sh68i3 \
  feat/facility-info claude/vbfh-broadcast-instagram-e6p75v \
  claude/pensive-edison-sb3ujd claude/pensive-edison-sove8x
```

## Run log

- **2026-09-20 (afternoon check-in, `claude-opus-4-8`):** **All four repos green; nothing needed fixing.** Only
  change since the 09-20 morning run: the **09-20 VBFH Daily Run (#109) fired + SUCCEEDED** (15:43→15:45 UTC) —
  the run the morning check found had not yet fired. No new commits, merges, closes, or human review comments
  anywhere across the four repos. The two amma drafts with 09-20 `updated_at` (#238, #225) carry only Vercel-bot
  deploy notes — no human review; #238 unchanged (head `d867fa6`), #225 unchanged (head `6996980`). vbfh draft
  **#8** unchanged (head `fb921c8` static, `mergeable_state: clean`; CI green — run #23) — still Anthony's held
  draft. Default branches re-verified live via API — all unchanged: amma `9be5b13c` (#237), vbfh `e21077d` (#7),
  shadow `5113ce5` (2026-07-09), EscapeTheBomb `eee6a37` (#1). amma `CI — web` ✅ (#174) + `CI — voice-gateway` ✅
  (#13) on main; vbfh `CI` ✅ (#23) on master. **VBFH Daily Run — latest completed #109** (09-20 15:43→15:45 UTC
  ✅). Zero failing workflow runs across all repos; shadow & EscapeTheBomb have no CI workflows (0 runs). The six
  open amma drafts (#238/#225/#221/#219/#218/#197) unchanged and held — no new review comments. #218 governance
  question stays open; #29 stays closed (07-18). Branch cleanup still 403-blocked (open draft heads excluded).
  Standing items for Anthony unchanged (SMTP secrets, Runway credits Day 06, image-QA routine decision, grant
  submission, Marbel SQL, #215 Table Duel deploy step, branch cleanup). No push notification sent — quiet
  all-green run; the one change was the day's Daily Run firing green, needing no caretaker action.
- **2026-09-20 (morning check-in, `claude-opus-4-8`):** **All four repos green; nothing needed fixing.** One
  change since the 09-19 afternoon run: **Anthony opened a new draft PR #238 in amma** ("docs(product): Menu
  Control owner app plan + Codex queue 49/50", `claude/menu-control-app`, opened 09-20 10:14 UTC) — **docs only**
  (4 files, +324: new `MENU_CONTROL_APP_PLAN.md`, `MODULE_LIBRARY.md`, `CODEX_QUEUE.md` items 49/50,
  `HANDOFF_LOG.md`), guardrail-clean (no schema/route/Supabase/Stripe/POS/client-contact/price/deploy), Vercel
  Ready ✅, `mergeable_state: clean`. **Held — his own draft → no caretaker merge**; added to Open PRs, Build
  health (five→six drafts) and the "what you need to do" list. It records two items only Anthony can settle: (1)
  the Colattao pilot's **static-file-vs-Supabase menu reconciliation** (blocks its queue item 49; the two sources
  have already drifted), and (2) a **confirmed live zero-price bug** — `m/[id]/page.tsx:26` renders a `0` price as
  `$0.00` on the guest menu while five other files render "Ask staff." That file is in the **protected `/m/[id]`
  Client OS route the caretaker never touches**, and it's already queued for Codex (item 49) behind Anthony's
  reconciliation → **flagged, not fixed.** No other new commits, merges, closes, or human review comments
  anywhere. vbfh draft **#8** unchanged (head `fb921c8`, `mergeable_state: clean`, CI green run #23) — still
  Anthony's held draft. Default branches re-verified live via API — all unchanged: amma `9be5b13c` (#237), vbfh
  `e21077d` (#7), shadow `5113ce5` (2026-07-09), EscapeTheBomb `eee6a37` (#1). amma `CI — web` ✅ (#174) + `CI —
  voice-gateway` ✅ (#13) on main; vbfh `CI` ✅ (#23) on master. **VBFH Daily Run — latest completed #108**
  (09-19 15:38→15:39 UTC ✅); the 09-20 run had not yet fired at check time (normal window). Zero failing workflow
  runs across all repos; shadow & EscapeTheBomb have no CI workflows (0 runs). The older five amma drafts
  (#225/#221/#219/#218/#197) unchanged and held — no new review comments. #218 governance question stays open;
  #29 stays closed (07-18). Branch cleanup still 403-blocked (open draft heads excluded). Standing items for
  Anthony unchanged (SMTP secrets, Runway credits Day 06, image-QA routine decision, grant submission, Marbel
  SQL, #215 Table Duel deploy step, branch cleanup). **Push notification sent** — the new #238 findings (Colattao
  reconciliation + the live guest-menu zero-price bug) are things Anthony should see.
- **2026-09-19 (afternoon check-in, `claude-opus-4-8`):** **All four repos green; nothing needed fixing.** Only
  change since the 09-19 morning run: the **09-19 VBFH Daily Run (#108) fired + SUCCEEDED** (15:38→15:39 UTC) —
  the run the morning check found had not yet fired. No new commits, merges, closes, or human review comments
  anywhere across the four repos. vbfh draft **#8** unchanged (head `fb921c8` static, `mergeable_state: clean`;
  its CI re-ran green — run #23) — still Anthony's held draft. Default branches re-verified live via API — all
  unchanged: amma `9be5b13c` (#237), vbfh `e21077d` (#7), shadow `5113ce5` (2026-07-09), EscapeTheBomb `eee6a37`
  (#1). amma `CI — web` ✅ (#174) + `CI — voice-gateway` ✅ (#13) on main; vbfh `CI` ✅ (#21) on master. **VBFH
  Daily Run — latest completed #108** (09-19 15:38→15:39 UTC ✅). Zero failing workflow runs across all repos;
  shadow & EscapeTheBomb have no CI workflows (0 runs). The five open amma drafts (#225/#221/#219/#218/#197)
  unchanged and held — no new review comments. #218 governance question stays open; #29 stays closed (07-18).
  Branch cleanup still 403-blocked (open draft heads excluded). Standing items for Anthony unchanged (SMTP
  secrets, Runway credits Day 06, image-QA routine decision, grant submission, Marbel SQL, #215 Table Duel
  deploy step, branch cleanup). No push notification sent — quiet all-green run; the one change was the day's
  Daily Run firing green, needing no caretaker action.
- **2026-09-19 (morning check-in, `claude-opus-4-8`):** **All four repos green; nothing needed fixing.** One
  change since the 09-18 afternoon run: **Anthony opened a new draft PR #8 in vbfh-media-engine** ("Make VBFH
  Daily Mail fail closed and verify Dash results", `codex/vbfh-daily-mail-reliability`, opened 09-19 10:10 UTC) —
  a 44-file (+2019−182) daily-mail reliability rework: fail-closed on missing config/attachments, DaySmart
  official finals read off team pages, cards only from ready leagues, and a low-cost OpenAI vision QA of the
  graphics. **CI `check` ✅, `mergeable_state: clean`** — but it's **Anthony's own held draft** needing new
  secrets (`OPENAI_API_KEY` + the 5 SMTP secrets), so **no caretaker merge**; added to Open PRs + the "what you
  need to do" list for his review/merge call. No other new commits, merges, closes, or human review comments
  anywhere. Default branches re-verified live via API — all unchanged: amma `9be5b13c` (#237), vbfh `e21077d`
  (#7), shadow `5113ce5` (2026-07-09), EscapeTheBomb `eee6a37` (#1). amma `CI — web` ✅ (#174) + `CI —
  voice-gateway` ✅ (#13) on main; vbfh `CI` ✅ (#21) on master. **VBFH Daily Run — latest completed #107**
  (09-18 16:05→16:07 UTC ✅); the 09-19 run had not yet fired at check time (normal window). Zero failing
  workflow runs across all repos; shadow & EscapeTheBomb have no CI workflows (0 runs). The five open amma drafts
  (#225/#221/#219/#218/#197) unchanged and held — no new review comments. #218 governance question stays open;
  #29 stays closed (07-18). Branch cleanup still 403-blocked (open draft heads excluded). Standing items for
  Anthony unchanged (SMTP secrets, Runway credits Day 06, image-QA routine decision, grant submission, Marbel
  SQL, #215 Table Duel deploy step, branch cleanup). No push notification sent — quiet all-green run; the one
  change was Anthony's own new green draft, needing no caretaker action.
- **2026-09-18 (afternoon check-in, `claude-opus-4-8`):** **All four repos green; nothing needed fixing.** The
  only change since the 09-18 morning run: the **09-18 VBFH Daily Run (#107) fired + SUCCEEDED** (16:05→16:07
  UTC) — the run the morning check found had not yet fired. No new commits, merges, closes, or human review
  comments anywhere across the four repos. Default branches re-verified live via API — all unchanged: amma
  `9be5b13c` (#237), vbfh `e21077d` (#7), shadow `5113ce5` (2026-07-09), EscapeTheBomb `eee6a37` (#1). amma
  `CI — web` ✅ (#174) + `CI — voice-gateway` ✅ (#13) on main; vbfh `CI` ✅ (#21) on master. Zero failing
  workflow runs across all repos; shadow & EscapeTheBomb have no CI workflows (0 runs). The five open drafts
  (#225/#221/#219/#218/#197) unchanged and held — no new review comments (only the Vercel-bot deploy note on
  #225). #218 governance question stays open; #29 stays closed (07-18). Branch cleanup still 403-blocked (the
  five open draft heads excluded). Standing items for Anthony unchanged (SMTP secrets, Runway credits Day 06,
  image-QA routine decision, grant submission, Marbel SQL, #215 Table Duel deploy step, branch cleanup). No push
  notification sent — quiet all-green run; the only change was the day's Daily Run firing green, needing no
  caretaker action.
- **2026-09-18 (morning check-in, `claude-opus-4-8`):** **All four repos green; nothing changed since the
  09-17 afternoon run and nothing needed fixing.** No new commits, merges, closes, or human review comments
  anywhere across the four repos. Default branches re-verified live via API — all unchanged: amma `9be5b13c`
  (#237), vbfh `e21077d` (#7), shadow `5113ce5` (2026-07-09), EscapeTheBomb `eee6a37` (#1). amma `CI — web` ✅
  (#174) + `CI — voice-gateway` ✅ (#13) on main; vbfh `CI` ✅ (#21) on master. **VBFH Daily Run — latest
  completed #106** (09-17 16:34→16:35 UTC ✅); the 09-18 run had not yet fired at check time (normal window).
  Zero failing workflow runs across all repos; shadow & EscapeTheBomb have no CI workflows (0 runs). The five
  open drafts (#225/#221/#219/#218/#197) unchanged and held — no new review comments (only Vercel-bot deploy
  notes on #225). #218 governance question stays open; #29 stays closed (07-18). Branch cleanup still 403-blocked
  (the five open draft heads excluded). Standing items for Anthony unchanged (SMTP secrets, Runway credits Day 06,
  image-QA routine decision, grant submission, Marbel SQL, #215 Table Duel deploy step, branch cleanup). No push
  notification sent — quiet all-green run, nothing changed.
- **2026-09-17 (afternoon check-in, `claude-opus-4-8`):** **All four repos green; nothing needed fixing.** One
  benign change since the 09-17 morning run: **Anthony merged his own new PR #237** ("Simplify Fina Calle with
  restrained comic-book styling") 09-17 18:57 UTC — merge `9be5b13c` now amma main tip, `CI — web` **#174 ✅**.
  Codex-authored homepage styling refinement (condensed comic-book direction; homepage `page.tsx` + new
  route-scoped `comic.module.css` + OPERATIONS docs; 7 files, +864−394). PR body records **no original
  motion/asset, form, backend, owner/menu/game behavior, dependency, database, access, payment or customer-send
  changes** and **Anthony's explicit authorization**; verified changed paths confirm **no Client OS route /
  Supabase / Stripe / POS / secret / customer-data / stable-QR change** → **his own authorized merge, no caretaker
  action; recorded only.** amma `main` advanced `b82c908e` (#236) → `9be5b13c` (#237). Also **the 09-17 VBFH
  Daily Run fired + SUCCEEDED** (run #106, 16:34→16:35 UTC) — the run the morning check found had not yet fired.
  Other default branches re-verified via API — all unchanged: vbfh `e21077d` (#7), shadow `5113ce5`
  (2026-07-09), EscapeTheBomb `eee6a37` (#1). amma `CI — voice-gateway` ✅ (#13) on main; vbfh `CI` ✅ (#21) on
  master. Zero failing workflow runs across all repos. The five open drafts (#225/#221/#219/#218/#197) unchanged
  and held — no new review comments. #218 governance question stays open; #29 stays closed (07-18). Branch
  cleanup still 403-blocked (the five open draft heads excluded; #237's branch `codex/consulting-comic-20260917`
  added to the eligible set). Standing items for Anthony unchanged (SMTP secrets, Runway credits Day 06, image-QA
  routine decision, grant submission, Marbel SQL, #215 Table Duel deploy step, branch cleanup). No push
  notification sent — quiet all-green run; the only change was Anthony's own merge + the day's Daily Run firing
  green, needing no caretaker action.
- **2026-09-17 (morning check-in, `claude-opus-4-8`):** **All four repos green; nothing changed since the
  09-16 afternoon run and nothing needed fixing.** No new commits, merges, closes, or review comments anywhere
  across the four repos. Default branches re-verified live via API — all unchanged: amma `b82c908e` (#236), vbfh
  `e21077d` (#7), shadow `5113ce5` (2026-07-09), EscapeTheBomb `eee6a37` (#1). amma `CI — web` ✅ (#172) + `CI —
  voice-gateway` ✅ (#13) on main; vbfh `CI` ✅ (#21) on master. **VBFH Daily Run — latest completed #105**
  (09-16 16:28→16:30 UTC ✅); the 09-17 run had not yet fired at check time (normal window). Zero failing
  workflow runs across all repos; shadow & EscapeTheBomb have no CI workflows (0 runs). The five open drafts
  (#225/#221/#219/#218/#197) unchanged and held — no new review comments. #218 governance question stays open;
  #29 stays closed (07-18). Branch cleanup still 403-blocked (the five open draft heads excluded). Standing items
  for Anthony unchanged (SMTP secrets, Runway credits Day 06, image-QA routine decision, grant submission, Marbel
  SQL, #215 Table Duel deploy step, branch cleanup). No push notification sent — quiet all-green run, nothing
  changed.
- **2026-09-16 (afternoon check-in, `claude-opus-4-8`):** **All four repos green; nothing needed fixing.** One
  change since the 09-16 morning run: **Anthony merged his own new PR #236** ("Make Fina Calle consulting-first
  with clear proof and inquiry paths") 09-16 20:13 UTC — merge `b82c908e` now amma main tip, `CI — web` **#172
  ✅**. Codex-authored consulting-first redesign of the public journey. Verified changed paths confirm **no Client
  OS route / Supabase / Stripe / POS / secret / customer-data / stable-QR change** → **his own authorized merge,
  no caretaker action; recorded only.** No push notification sent.
- **2026-09-16 (morning check-in, `claude-opus-4-8`):** All four green; one change — Anthony merged his own
  draft #235 ("Gran Patrón menu and shootout review preview") 09-16 10:32 UTC (merge `30fe59e2`, `CI — web`
  #170 ✅), guardrail-clean additive `/demo`+`/play` routes → his own merge, no action. No push notification sent.
- **2026-09-15 (both check-ins, `claude-opus-4-8`):** All four green; afternoon's only change was the 09-15 VBFH
  Daily Run (#104) firing green. amma `306fcf45` (#234); five drafts held. No push notifications sent.
- **2026-09-14 (both check-ins, `claude-opus-4-8`):** All four green. Anthony merged his own held draft #234
  ("Premium owner portal, guarded billing") 09-14 13:23 UTC (merge `306fcf45`, `CI — web` #167 ✅; protected
  `/owner/[id]` + Stripe, his own merge → no action). VBFH Daily Run #103 fired green. No push notifications sent.
- **2026-09-13 (both check-ins, `claude-opus-4-8`):** All four green. amma `main` advanced via Anthony's own
  Clone merges (#230/#231/#232); VBFH Daily Run #102 fired green. Five drafts held. No push notifications sent.
- **2026-09-12 (both check-ins, `claude-opus-4-8`):** All four green; the only change was the 09-12 VBFH Daily Run
  (#101) firing green. amma `main` `220d5fe` (#229); five drafts held. No push notifications sent.
- **2026-09-11 (afternoon check-in, `claude-opus-4-8`):** All four green. amma `main` advanced `1e4d78d` (#226) →
  `220d5fe` via Anthony's own #227/#228/#229 merges (#228 touches protected `/owner/[id]`, his own call). VBFH
  Daily Run #100 green. No push notification sent.
- **2026-09-10 → 09-02 (both check-ins each day, `claude-opus-4-8`):** All four green throughout; each afternoon's
  only change was that day's VBFH Daily Run (#91–#99) firing green. amma `main` advanced via Anthony's own merges
  (#215/#223/#224 on 09-07, #226→#229 on 09-11). No push notifications sent — quiet all-green runs.
- **2026-09-01 (evening) — ✅ API RESTORED, all green.** The morning `401 Bad credentials` GitHub API outage
  cleared; live monitoring back. 09-01 VBFH Daily Run #90 fired + SUCCEEDED. amma `main` `13492161` (#222).
- **2026-09-01 (morning) — ⚠️ GitHub API OUTAGE:** token returned `401 Bad credentials` on every repo-scoped
  call; worked around via direct git inspection (every default-branch tip unchanged vs. 08-31 evening).
- **2026-08-31 … 08-17 — twice-daily check-ins (`claude-opus-4-8`):** all four green; VBFH Daily Runs #74–#89
  each fired + SUCCEEDED. Anthony merged #222/#216/#217; drafts #221/#220/#219/#218 opened & held. #29 confirmed
  closed (07-18). _(Full per-run detail in git history.)_
- **2026-08-16 & prior — earlier twice-daily check-ins (`claude-opus-4-8`):** all four green; drafts #216/#215
  opened & held; earlier merge waves all merged by Anthony. #29 stays closed. _(Full per-run detail in git.)_
