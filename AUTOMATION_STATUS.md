# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-08-19 (morning — twice-daily check-in, `claude-opus-4-8`). **All four repos green; nothing needed fixing.** One change since the 08-18 evening run, on amma: **draft PR #218 ("E-Myth Revision 4") got one new docs-only commit** — `e1b1fbe` (08-18 22:03 UTC, authored by "Claude"/Opus 5): _"docs(e-myth): correct price anchors after the $199 offer lock merged."_ It updates `OPERATIONS/E_MYTH/01_ORGANIZATION.md`'s Strategic Objective from a blended ~$149/mo to the now-live locked **$199/mo per location + setup** (via merged #216), adds a verified anchor row citing the source commit, relabels the researched $59–149 band as market-research-only, and **deliberately preserves Colattao's $149/mo** as an annotated existing-client rate (historical record, not the current offer). Docs-only, guardrail-clean (no code/route/Supabase/Stripe/POS/secret/customer/QR change); Vercel Ready ✅, `mergeable_state: clean`; path-filtered so no `CI — web`/`CI — voice-gateway` run (expected). #218 now **6 commits**; **still held as Anthony's draft — not caretaker-merged**, and its **open governance question is unchanged** (the earlier Revision-4 commits authored by "Clone"). **No new merges to `main`** (still **`4905a364`**, #216), **no new PRs**, **no new human review comments** (only Vercel-bot; #218 was the only PR whose `updated_at` moved). **VBFH Daily Run: latest completed 08-18 (12:52 UTC, run #76) SUCCEEDED** — ~**thirty** green in a row (07-21…08-18); the 08-19 run had not yet fired at check time (before its ~12:5x UTC schedule) — expected, will re-verify next run. Other default branches unchanged & re-verified via API: vbfh `e21077d` (#7), shadow `5113ce5` (dormant), EscapeTheBomb `eee6a37` (#1). vbfh CI ✅ (master push 07-30); amma `CI — web` ✅ + `CI — voice-gateway` ✅ on main (latest runs). No merge-conflict/base-branch notices. **#218's governance question stays open** (unchanged — see below). **Branch deletion still blocked** — the environment's git proxy returns HTTP 403 on any `push --delete`; paste-set below is for Anthony's local clone. **The six open PR heads (#221, #220, #219, #218, #215, #197) are kept OUT of the delete set (deleting any would close its open draft); #216's head is merged.**
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets) still wait for Anthony's explicit go-ahead. Drafts are held by their author and are not caretaker-merged.
**Caretaker model:** pinned to **Opus 4.8** (`/model` is a CLI command, not runnable from the shell in this env; ran as configured `claude-opus-4-8`). Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

🆕 **New plan for review — Instagram DM ordering (draft PR #220, docs-only, no decision forced now).**
   Draft **PR #220** (`amma-fina-calle`, branch `claude/instagram-dm-ordering-m8i210`) answers your question of
   whether restaurant ordering can run through Instagram. Its headline: **don't build "an Instagram bot"** —
   build a transport-agnostic **Order Core** with hosted Stripe Connect checkout that earns from a QR code /
   link-in-bio with **zero Meta dependency**, then attach Instagram DM as one transport later. It documents
   verified Meta constraints (the "Order Food" button is a closed partner list AMMA can't get; out-of-window
   order-status DMs are impossible since the 2026-04-27 tag deprecation, so status goes by SMS/email) and a
   14-item premortem. **Nothing is built or connected** — 3 markdown files, guardrail-clean. **Held as your
   draft — I don't auto-merge it.** *When you want to move on it,* it needs two decisions from you (not now):
   (a) confirm the **Stripe Connect direct-charge** model (restaurant as merchant of record; AMMA never holds
   order funds); (b) confirm the **applied Supabase production-migration state** before any migration is
   written. Until then it just sits as a plan.

⚠️ **Governance question inside draft PR #218 — please confirm or deny (no action taken).**
   Draft **PR #218** ("E-Myth Revision 4", docs-only under `OPERATIONS/E_MYTH` + `HANDOFF_LOG.md`,
   guardrail-clean, Vercel Ready ✅) contains an **open governance flag**: its Revision-4 commits were authored
   by **"Clone"** and logged under a Codex entry asserting *"Anthony explicitly directed `Revise pr218`."*
   That direction isn't recorded in the session that opened the PR, and `CLAUDE.md` scopes Clone to **watching**,
   not authoring. A claim of authorization written inside the artifact it authorizes isn't independent proof.
   **Did you direct that revision?** If yes, it's fine and it stays a held draft for your merge call. If no,
   you may want to close it / reset the branch. I've taken no action either way. _(A new docs-only price-anchor
   commit `e1b1fbe` landed on this branch 08-18 22:03 UTC — authored by "Claude", not "Clone" — correcting the
   E_MYTH doc to the locked $199 offer; it does not change the governance question above.)_

🆕 **Demo redesign — your review & merge call (draft PR #219 "Las Palmas lotería hero").**
   This is a direct answer to your *"the demos look ugly and unoriginal"* critique. Draft **PR #219**
   (`amma-fina-calle`, branch `claude/las-palmas-loteria-hero`) makes the first phone screen a **playable
   penalty shootout** (lime ball, non-human gecko keeper) that mints a **lotería card** for each goal — seven
   real Lynnhaven menu items + the gecko. "Pending client approval" moves to the footer; the silver-palm
   scroll morph is kept as the bridge into the menu. 3 files, all inside the Las Palmas demo folder — **no
   Client OS route, Supabase, Stripe, POS, secret, customer/menu data, or QR-destination change; no client
   logo generated; all art from primitives (nothing can 404).** Vercel Ready ✅, `mergeable_state: clean`.
   **Held as your draft — I don't auto-merge it.** Your call: view the preview and merge if you like it, or
   tell me what to change.

🆕 **New demo for review — Order Drop (draft PR #221, "#220 slice").**
   Draft **PR #221** (`amma-fina-calle`, branch `claude/blissful-darwin-gtt3su`) is the lightest, ship-this-week
   slice of the #220 plan: a static prospect demo where a Colattao **Churro Latte** promo hands the customer
   straight to **Uber Eats** (where payment + delivery already exist) — "2 taps from post to placed order," no
   new app for the customer, nothing to learn for the restaurant, nothing to babysit for you. 3 files, all in
   an internal, unlinked, `noindex` demo route (`/demo/order-drop`). **Guardrail-clean:** no Client OS route,
   Supabase, Stripe, Meta, backend, secret, customer data, or QR change; all art is **original CSS/SVG — no
   third-party logos**; the "Uber Eats" screen is disclosed in-page as illustrative (the real button opens
   ubereats.com). `web` CI ✅, Vercel Ready ✅, `mergeable_state: clean`. **Held as your draft — I don't
   auto-merge it.** Your call: view the preview and merge if you like it, or tell me what to change.
   _(Note: the honest trade-off it states — on the Uber rail, Uber takes commission and owns the customer —
   is why #220's own commission-free Order Core is the P2 destination.)_

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
    in the paste-ready commands below (includes the five branches from #201–#207, and **excludes** the
    six open draft heads #221/#220/#219/#218/#215/#197); they'll run fine from your local clone.
    (#216's head `claude/blissful-darwin-phv15u` is now merged — safe to delete, but left off the list until
    the set is re-verified next run.)

_Resolved / no action needed from you:_ **#216 "Restaurant Buyer Package / $199 offer" — you merged it**
(08-18 13:19 UTC, docs-only, guardrail-clean). If you still want it rendered into a **polished branded PDF
packet** as the print/email leave-behind, say the word and I'll build it.

_No longer on the list:_ **#201 draft decision — DONE** (Anthony merged it, Las Palmas Menu now points at the
official Lynnhaven PDF). The AJ Gator's / Las Palmas visual wave (#202 inked-plate CTAs, #203 penalty-shootout
skin, #204/#205 QR proof leave-behinds, #206/#207 B&W QR handouts) all merged by Anthony.

_Resolved / no action:_ **#217 "E-Myth organizational layer" merged 08-17** — documentation only
(`OPERATIONS/E_MYTH/01_ORGANIZATION.md`…`04_AUTOMATION_ROLLOUT.md`), explicitly "no product, data,
integration, secret, access, billing, customer-contact, QR-destination, or production change," approved by
Anthony in the PR body → his own merge, no caretaker action. **VBFH Daily Run stays GREEN** — 08-18 12:52 UTC
run #76 succeeded (~thirty in a row). The voice-gateway personality wave
Anthony merged himself (#212 French volleyball, #213 Larissa off-grid, #214 tester-back-to-vbfh) is
config-only, all CI green post-merge, his own call. The earlier owner-portal wave (#208 redesign, #209
centralize requests / remove campaigns, #210 simplify, #211 docs release) is his own call on protected routes;
all CI green. Earlier merged history (AJ Gator's Holland Road #198/#199, Las Palmas simplify #200, the
#201–#207 wave, owner portal #162, EscapeTheBomb #1, the 07-30 wave #189/#180/#161/#196 + vbfh #7, and all
prior waves) stays merged. Superseded drafts closed 07-23 (#169/#173/#177) and #168/#4 stay closed. **#29
stays closed** (07-18) — the standing "AI Request Desk" adopt-and-rebase-or-close decision remains Anthony's;
caretaker does not act. shadow-engineer-rpa dormant (07-09).

---

## Build health (as of 2026-08-19, morning)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip **`4905a364`** (**#216** "$199 offer / Buyer Package / client delivery," 30 Markdown files, Anthony's own approved merge, 08-18 13:19 UTC). No new merge since. Docs-only path-filtered → no new `CI — web`/`CI — voice-gateway` run, expected. Latest `CI — voice-gateway` on main ✅ (**08-07 11:16 UTC, run #13**); `CI — web` last ✅ **08-05 22:08 UTC run #136** (nothing since touched web paths). **Six** open drafts held, all Vercel Ready ✅: **#221** Order Drop demo (`web` CI ✅, product UI, guardrail-clean), **#220** Instagram DM ordering plan (docs-only), **#219** lotería hero (product UI, guardrail-clean), **#218** E-Myth Rev 4 (docs-only, **+1 new docs commit `e1b1fbe` since last run**), **#215** Table Duel (`web` CI ✅) and **#197** docs. |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" scheduled | CI ✅ (master push 07-30 12:54 UTC ✅); master tip `e21077d` (**#7**). **VBFH Daily Run — GREEN.** Latest completed scheduled run **08-18 12:52 UTC SUCCEEDED (run #76)** (07-21…08-18 all ✅ — ~**thirty green in a row**); the 08-19 run had not fired at check time (before ~12:5x UTC), will re-verify next run. The email-gate fix holds (`skipped_config_missing` non-fatal; a real SMTP `failed` still fails). Content pipeline completes (`needs_review`, `gamesFound:0` = known DaySmart standings-only limitation, not a regression). Emails start once the 5 SMTP secrets are set (action item 1). |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · no workflows (0 runs) · master tip `5113ce5`, last commit 2026-07-09 |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | **#1 merged** (M1 scaffolds, squash `eee6a37`); zero open PRs · no workflows (0 runs). First Windows compile after pull is the real verify (M2 gate). |

## Open PRs

- **amma #221 (draft) — "feat(demo): Order Drop — one-item Instagram → Uber Eats seamless flow (#220 slice)."**
  Opened 08-18. Head `claude/blissful-darwin-gtt3su`. 3 files (+1299), all under
  `APP/web/src/app/(internal)/demo/order-drop/` (`page.tsx`, `OrderDropDemo.tsx`, `order-drop.module.css`).
  Static, unlinked, `noindex` prospect demo: a Colattao Churro Latte promo that hands the customer to Uber
  Eats ("2 taps from post to placed order"), framing the lightest ship-this-week slice of the #220 plan.
  **Guardrail-clean:** no Client OS route (`/m`,`/owner`,`/customers`), no Supabase/Stripe/Meta/backend, no
  secret, customer data, or QR change; all art is **original CSS/SVG — no third-party logos reproduced**; the
  "Uber Eats" handoff screen is disclosed in-page as illustrative (real CTA opens ubereats.com). **`web` CI ✅**,
  **Vercel Ready ✅**, `mergeable_state: clean`. **Held — draft** (product UI, Anthony's review/merge call).
  Nothing to fix.
- **amma #220 (draft, docs-only) — "plan: Instagram DM ordering module — Order Core plan + premortem."**
  Opened 08-18 12:42 UTC. Head `claude/instagram-dm-ordering-m8i210`. 3 documentation files (+464, 1 commit):
  `PRODUCT_MODULES/INSTAGRAM_DM_ORDERING_PLAN.md` (new — decision record, build spec, 14-item premortem),
  `PRODUCT_MODULES/MODULE_LIBRARY.md` (module registered), `OPERATIONS/HANDOFF_LOG.md` (session logged). Core
  decision: build a transport-agnostic **Order Core** + hosted Stripe Connect checkout (earns from QR/link-in-bio
  with zero Meta dependency), attach Instagram DM as one transport later. **Nothing built or connected** — no
  product route, migration, secret, payment path, POS, customer data, or QR change. **Vercel Ready ✅**,
  `mergeable_state: clean`. **Held — draft.** Raises two plan-stage decisions for Anthony (Stripe Connect
  direct-charge model; confirm applied Supabase migration state) before any P0 code — logged under "What
  Anthony needs to do," not urgent. Nothing to fix.
- **amma #219 (draft) — "feat(demo): lead Las Palmas with a playable lotería hero."** Opened 08-17 18:36 UTC.
  Head `claude/las-palmas-loteria-hero`. Replaces the Las Palmas demo's static hero with a first-viewport
  **playable penalty shootout** (lime ball + non-human gecko keeper) that mints a **lotería card** per goal
  (7 real Lynnhaven menu items + the gecko); "Pending client approval" moves to the footer; the silver-palm
  scroll morph is kept as the menu bridge. 3 files (+744), all inside `APP/web/src/app/(internal)/demo/las-palmas/`.
  PR body reports `eslint`/`tsc`/`next build` pass and a clean 390×844 + 1440×900 browser QA (0 overflow, 0
  broken images, `noindex,nofollow,nocache`). **Guardrail-clean:** no Client OS route, Supabase, Stripe, POS,
  secret, customer/menu data, or QR change; all art from primitives (no 404 possible); no client logo generated.
  **Vercel Ready ✅**, `mergeable_state: clean`. **Held — draft.** Nothing to fix; Anthony's review/merge call.
- **amma #218 (draft, docs-only) — "ops: E-Myth Revision 4 — evidence-bound automation controls."** Opened
  08-17 12:47 UTC. Head `claude/e-myth-ai-automation-gcetx0`. Documentation only under `OPERATIONS/E_MYTH`
  (five docs + README) + `OPERATIONS/HANDOFF_LOG.md`; **now 6 commits** — latest **`e1b1fbe`** (08-18 22:03 UTC,
  authored by "Claude"/Opus 5): _"docs(e-myth): correct price anchors after the $199 offer lock merged,"_ which
  updates `01_ORGANIZATION.md`'s Strategic Objective from a blended ~$149/mo to the now-live locked **$199/mo
  per location + setup**, adds a verified anchor row, relabels the $59–149 band as market-research-only, and
  preserves Colattao's $149/mo as an annotated existing-client rate. Design/control spec only — does not merge,
  deploy, authorize Stripe, access data, or send. **Vercel Ready ✅**, `mergeable_state: clean`, path-filtered
  (no `CI — web`/`CI — voice-gateway` run). **Held — draft.** ⚠️ **Carries an open governance question for
  Anthony** (see "What Anthony needs to do"): the earlier R4 commits are authored by "Clone" and assert Anthony
  directed *"Revise pr218"*, which isn't independently recorded and is outside Clone's watch-only scope. Flagged,
  no caretaker action.
- **amma #215 (draft) — "Table Duel: same-table hidden-fleet game for 2–6 phones."** Opened 08-10 15:53 UTC.
  Head `claude/table-duel`. Adds `services/table-duel` (in-memory WebSocket room server — no DB, no disk, no
  secrets, no customer data; rooms vanish when the table leaves), a `/table-duel` phone client, and a 5th
  "Table duel" tab in the A.J. Gator's game picker. 14 files, +2392/−2. `web` CI ✅ + Vercel ✅;
  `mergeable_state: clean`. Guardrail-clean (additive route, non-human "fleet" art, free play only, no wagers).
  **Held — it's a draft authored by Anthony.** Nothing to fix. Deploy step (Render blueprint +
  `NEXT_PUBLIC_TABLE_DUEL_WS` in Vercel) is Anthony's to run when ready.
- **amma #197 (draft, docs-only) — "Odyssey Daily log — Day 06 blocked (Runway pool still empty)."**
  Opened 07-30; Day-06 continuation of the merged #189 series. Head `claude/las-palmas-menu-game-59vtbg`.
  Vercel preview Ready/green; no `CI — web` (docs-only, path-filtered). **Held — it's a draft.** Nothing to fix.
- vbfh-media-engine, shadow-engineer-rpa, EscapeTheBomb-DC: **zero open PRs.**

## Merged / closed since last run

**None.** No merges or closes since the 08-18 evening run. `main` stays at **`4905a364`** (#216, merged by
Anthony 08-18 13:19 UTC). See "Earlier merged" for the standing history.

### Earlier merged

- **amma #216 — "Standardize $199 restaurant offer and client delivery."** Merge **`4905a364`** (current main
  tip). Merged by Anthony 08-18 13:19 UTC. **Documentation only — 30 Markdown files:** a new buyer-facing
  `BUYER_PACKAGE/` set + `CUSTOMIZE/` merge-field kit, a new `OPERATIONS/SOPS/RESTAURANT_199_DELIVERY_STANDARD.md`
  and delivery-checklist / QR-print-QA templates, plus edits to Colattao/AJ Gator's sales collateral and the
  handoff log. **No code, no protected route, no Supabase/Stripe/POS/secret/customer data, no QR-destination
  change.** His own approved merge → no caretaker action. Docs-only path-filtered (no CI run) — expected.
- **amma #217 — "ops: add E-Myth organizational layer for AMMA Ventures / Fina Calle."** Merge `3dadb98`.
  Merged by Anthony 08-17 12:18 UTC. **Documentation only** — adds `OPERATIONS/E_MYTH/` (org chart, 12 position
  contracts, 11 AI-staff specs, automation rollout). PR body states no product, data, integration, secret,
  access, billing, customer-contact, QR-destination, or production change; "Approved for production by Anthony
  on 2026-08-17." His own merge → no caretaker action. Docs-only path-filtered (no CI run) — expected.
- **#214 — "voice: switch tester back to vbfh."** Merge `5b02d0d`. Self-merged by Anthony 08-07 11:16 UTC.
  Voice-gateway tester config only. `CI — voice-gateway` ✅ (run #13). No caretaker action.
- **#213 — "voice: add Larissa off-grid personality."** Merge `bd90376`. Self-merged 08-07 11:05 UTC. New
  voice-gateway personality config. `CI — voice-gateway` ✅ (run #11). No caretaker action.
- **#212 — "voice: add French volleyball personality."** Merge `f1bd6bd`. Self-merged 08-07 10:37 UTC. New
  voice-gateway personality config. `CI — voice-gateway` ✅ (run #9). No caretaker action.
- **#211 — "Record simplified owner portal production release."** Merge `e3b98e5`. Docs-only release record;
  application code unchanged. Self-merged by Anthony 08-05 22:13 UTC. No caretaker action.
- **#210 — "Simplify owner portal to request, billing, and history."** Merge `f85098e`. Self-merged 08-05
  22:08 UTC. Trims `/owner/[id]` to Request Desk + Billing + History + public Menu link **without changing
  auth, request, billing, or menu behavior**. Hard-guardrail protected route but Anthony's own merge with that
  affirmation in the PR body → no caretaker action. `CI — web` ✅ (run #135).
- **#209 — "Centralize owner requests and remove campaign surface."** Merge `8fede5a`. Self-merged 08-05
  13:19 UTC. Makes the `/owner/[id]` Request Desk the canonical owner intake and removes the Campaigns surface;
  public menu + promo records preserved. Anthony's own merge with independent security review → no caretaker
  action. `CI — web` ✅ (run #134).
- **#208 — "Redesign shared owner portal command center."** Merge `d57ddb6`. Self-merged 08-04 23:58 UTC.
  Presentation/accessibility-only redesign of `/owner/[id]`; all behavior unchanged per PR body. `CI — web` ✅ (run #132).

### Earlier merged (08-03 wave)

- **#207–#201** all merged by Anthony (B&W QR handouts, restaurant QR proof closeouts, two-QR Gators
  leave-behind, A.J. Gator's guardrail-compliant penalty-shootout skin, inked-plate CTAs, Las Palmas
  official-menu link). Merges `559f616` … `84ed044`. `CI — web` ✅ on every code merge.

### Earlier merged (08-02 and prior)

- **#200** Simplify Las Palmas demo landing (`21d032c` + `15edd95`). **#199** Refocus AJ Gator's landing hub
  (`bb0cb42`). **#198** Publish AJ Gator's Holland Road guest portal (`b701b6e` + `54620ae`).
- **2026-07-30 wave:** amma **#162** owner portal installable (`a454ad6`), **#189/#180/#161/#196**;
  **EscapeTheBomb #1** (`eee6a37`, no cloud CI); **vbfh #7** (`e21077d`); **#168 & vbfh #4** closed (superseded).

## Branch cleanup — ready to run (refreshed 2026-08-03 evening)

Anthony has approved deletion, but the session git proxy returns **HTTP 403 on any `push --delete`**
(server-side block, independent of permission), and the GitHub tooling here has no branch-delete API. The
commands below remain for Anthony to paste from a local clone. **Verified KEEP:** `main`,
`automation/status`, `claude/*` caretaker branches, **the six open draft heads `claude/instagram-dm-ordering-m8i210`
(#220), `claude/las-palmas-loteria-hero` (#219), `claude/e-myth-ai-automation-gcetx0` (#218),
`claude/blissful-darwin-gtt3su` (#221), `claude/table-duel` (#215) and `claude/las-palmas-menu-game-59vtbg`
(#197)** (deleting any closes its open draft), unmerged `voice/*` (Anthony's judgment) and the unproven
squash-merged exploration sets. The #201–#207 heads are merged and safe. The #208–#211
codex heads (`codex/owner-portal-comic-20260804`, `codex/owner-request-intake-20260805`) are also merged.
The #212–#214 voice heads (`voice/volleyball-fr`, `voice/larissa-offgrid`, `voice/vbfh-return`) are now merged too.
The #216 head `claude/blissful-darwin-phv15u` is merged and safe (left off the list below until re-verified).

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
  voice/volleyball-fr voice/larissa-offgrid voice/vbfh-return
```
**vbfh-media-engine** (verified merged or closed-superseded):
```
git -C vbfh-media-engine push origin --delete \
  claude/pensive-edison-hl5sxo claude/build-automation-management-sh68i3 \
  feat/facility-info claude/vbfh-broadcast-instagram-e6p75v \
  claude/pensive-edison-sb3ujd claude/pensive-edison-sove8x
```

## Run log

- **2026-08-19 (morning) — Twice-daily check-in (`claude-opus-4-8`):** **All four repos green; nothing needed
  fixing.** One change since the 08-18 evening run, on amma: **draft PR #218 ("E-Myth Revision 4") got one new
  docs-only commit** — `e1b1fbe` (08-18 22:03 UTC, authored by "Claude"/Opus 5): _"docs(e-myth): correct price
  anchors after the $199 offer lock merged."_ It corrects `OPERATIONS/E_MYTH/01_ORGANIZATION.md`'s Strategic
  Objective from a blended ~$149/mo to the now-live locked **$199/mo per location + setup** (via merged #216),
  adds a verified anchor row, relabels the $59–149 band as market-research-only, and preserves Colattao's
  $149/mo as an annotated existing-client rate. Docs-only, guardrail-clean, Vercel Ready ✅, `mergeable_state:
  clean`; path-filtered so no CI run (expected). #218 is now 6 commits; **still held as Anthony's draft — not
  caretaker-merged**, and its open governance question (earlier "Clone"-authored R4 commits) is **unchanged**.
  **No new merges to `main`** (still `4905a364`, #216), **no new PRs**, **no new human review comments** (only
  Vercel-bot; #218 was the only PR whose `updated_at` moved). **VBFH Daily Run: latest completed 08-18 (12:52
  UTC, run #76) SUCCEEDED** — ~thirty green in a row; the 08-19 run had not fired at check time (before ~12:5x
  UTC), will re-verify next run. Other default branches unchanged & re-verified via API: vbfh `e21077d` (#7),
  shadow `5113ce5`, EscapeTheBomb `eee6a37`. amma `CI — web` ✅ + `CI — voice-gateway` ✅ on main; vbfh CI ✅
  (master push 07-30). shadow & EscapeTheBomb have no CI workflows (0 runs) — nothing to verify. No
  merge-conflict/base-branch notices. #29 stays closed. Branch cleanup still 403-blocked (awaiting Anthony's
  local paste; the six open draft heads #221/#220/#219/#218/#215/#197 excluded). Standing items for Anthony
  unchanged (SMTP secrets, Runway credits Day 06, image-QA routine decision, grant submission, branch cleanup).
- **2026-08-18 (evening) — Twice-daily check-in (`claude-opus-4-8`):** **All four repos green; nothing needed
  fixing.** Two changes since the 08-18 midday run, both on amma: **(1) Anthony merged #216** "Standardize $199
  restaurant offer and client delivery" to `main` (**`3dadb98` → `4905a364`**, 08-18 13:19 UTC) — 30 Markdown
  files, docs-only, guardrail-clean, his own approved merge → no caretaker action; path-filtered so no CI run.
  **(2) One new *open* draft PR, held (not caretaker-merged): #221** "feat(demo): Order Drop — one-item Instagram
  → Uber Eats seamless flow (#220 slice)" — 3 files under `APP/web/src/app/(internal)/demo/order-drop/` (+1299),
  a static/unlinked/`noindex` prospect demo. `web` CI ✅ + Vercel Ready ✅ / `mergeable_state: clean`, guardrail-
  clean. **VBFH Daily Run 08-18 (12:52 UTC, run #76) SUCCEEDED** — ~thirty green in a row. Other default branches
  unchanged & re-verified via API. amma `CI — web` ✅ + `CI — voice-gateway` ✅ on main; vbfh CI ✅ (master push
  07-30). No new human review comments; no merge-conflict/base-branch notices. #218's governance question stays
  open. #29 stays closed. Branch cleanup still 403-blocked.
- **2026-08-18 (midday) — Twice-daily check-in (`claude-opus-4-8`):** **All four repos green; nothing needed
  fixing.** One change since the 08-17 evening run: **one new *open* draft PR on amma, held: #220** "plan:
  Instagram DM ordering module — Order Core plan + premortem" — 3 documentation files (+464, 1 commit),
  guardrail-clean (nothing built or connected), Vercel Ready ✅. Raises two plan-stage decisions for Anthony
  (Stripe Connect direct-charge model; confirm applied Supabase migration state) before any P0 code — surfaced,
  not urgent. **VBFH Daily Run #75 (08-17 12:50 UTC) SUCCEEDED**; the 08-18 run had not fired at check time.
  No merges/closes since 08-17 evening; default branches unchanged & re-verified. amma `CI — web` ✅ + `CI —
  voice-gateway` ✅; vbfh CI ✅. #218's governance question stays open. #29 stays closed. Branch cleanup 403-blocked.
- **2026-08-17 (evening) — Twice-daily check-in (`claude-opus-4-8`):** **All four repos green; nothing needed
  fixing.** Two new *open* draft PRs since midday, both on amma, both held: **#219** "Las Palmas lotería hero"
  (product UI, guardrail-clean) and **#218** "E-Myth Revision 4" (7 docs-only files). **#218 carries an open
  governance question surfaced to Anthony** (R4 commits authored by "Clone" asserting Anthony directed *"Revise
  pr218"*, not independently recorded, outside Clone's watch-only scope — flagged, no action). **VBFH Daily Run
  #75 (08-17 12:50 UTC) confirmed SUCCEEDED.** No merges/closes since midday; default branches unchanged &
  re-verified. amma `CI — web` ✅ + `CI — voice-gateway` ✅; vbfh CI ✅. #29 stays closed. Branch cleanup 403-blocked.
- **2026-08-17 (midday) — Twice-daily check-in (`claude-opus-4-8`):** All four green; nothing needed fixing.
  Anthony merged **amma #217 "E-Myth organizational layer"** to `main` (`3dadb98`, 08-17 12:18 UTC) —
  documentation only, his own approved merge → no caretaker action. VBFH Daily Run #74 (08-16) SUCCEEDED, #75
  in progress at check time. Three open drafts held (#216/#215/#197). Default branches re-verified. Also
  restored this dashboard file after an 08-16 evening commit had overwritten it with a stray path line.
  #29 stays closed. Branch cleanup 403-blocked.
- **2026-08-16 (evening) — Twice-daily check-in (`claude-opus-4-8`):** All four green; the **08-16 VBFH Daily
  Run fired and SUCCEEDED (12:45 UTC, run #74)**. Three open drafts held (#216/#215/#197); default branches
  unchanged. #29 stays closed; branch cleanup 403-blocked. _(That run's status commit `3d2932a` corrupted this
  file to a single path line; the 08-17 midday run restored it — see above.)_
- **2026-08-16 (morning) & 2026-08-15 — earlier twice-daily check-ins (`claude-opus-4-8`):** All four green
  throughout; nothing changed and nothing needed fixing. Three open drafts held (#216/#215/#197). VBFH Daily
  Runs green (08-15 run #73). Default branches unchanged. #29 stays closed; branch cleanup 403-blocked.
- **2026-08-14 & prior — earlier twice-daily check-ins (`claude-opus-4-8`):** All four green throughout.
  VBFH Daily Runs green every day (08-14 run #72, 08-13 #71, 08-12 #70, 08-11 #69, 08-10 #68). New drafts
  opened & held: **#216 "Restaurant Buyer Package"** (08-11) and **#215 "Table Duel"** (08-10). Merge waves
  logged above (voice #212–#214; owner-portal #208–#211; the #201–#207 wave; #198–#200; the 07-30 wave
  #162/#189/#180/#161/#196 + EscapeTheBomb #1 + vbfh #7). #29 stays closed throughout. _(Full per-run detail
  retained in git history; trimmed here for length.)_
