# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-09-26 (afternoon/evening check-in, `claude-opus-4-8`). **🔴 One real regression this run: the VBFH Daily Run is DOWN as of today.** Today's scheduled **VBFH Daily Run #115 (09-26 16:26→17:11 UTC) was CANCELLED at the 45-minute job timeout** — the `npm run daily:run` step ran the full window with no output and got killed. To tell transient from persistent I dispatched a manual re-run **#116 (09-26 21:46→22:31 UTC) — it ALSO cancelled at the same 45-min ceiling in the same step.** **Two-for-two on unchanged code (`b7af2c9`), so this is a persistent regression, not a flake** — it's the first VBFH Daily Run failure after a green streak all the way from 07-21 through 09-25 (#114 finished in ~26 min on this exact code). Because the code didn't change, the cause is **external: the live DaySmart Dash scrape now takes longer than the 45-min budget.** `dash-fetcher.ts` already sets per-operation Playwright timeouts, so this is not a simple missing-timeout bug — the site got slow/heavy enough that timeouts + retries across ~40 leagues blow the whole window. **The fix involves an accuracy-vs-completion trade-off (raise the job timeout, cut retries/per-op timeout, add a global time budget with partial-run handling, or pinpoint+skip the slow league), so it's Anthony's call — I did not push a speculative change into the fail-closed scrape pipeline.** The uploaded run artifacts (`vbfh-daily-<run_id>`) contain the per-league run log and should show exactly which league it was on when it stalled. **amma advanced again since the morning run:** `main` `b1fd1793`→`860a5c8` via **#266 "Release Bodega launch foundation and cleaned Square connector"** (Anthony's own merge, 09-26 20:47 UTC, `CI — web` **#248 ✅**) — it ships a **Square OAuth connector** (`/api/integrations/square/*`, payments/POS territory), a Bodega guest-notes API, **four MORE Supabase migrations `0019`–`0022`**, and new env vars/credentials/seller-OAuth — all of which the commit message itself gates as **"separate activation gates"** (his to run). So the pending Supabase migration set is now **`0015`–`0022`** (plus `0009` for Marbel). **Anthony's own merge → no caretaker merge/undo; recorded.** Default branches re-verified live: amma **`860a5c8`** (advanced), vbfh `b7af2c9` (unchanged), shadow `5113ce5` (dormant, unchanged), EscapeTheBomb `eee6a37` (unchanged). amma `CI — web` ✅ (**run #248** on main) + `CI — voice-gateway` ✅ (path-filtered off this web/game/Square wave); vbfh `CI` ✅ (**run #26** on master — the *build/test* CI is fine; only the scheduled Daily Run is failing). Zero failing workflow runs across repos **except the VBFH Daily Run** (#115 + #116 cancelled). shadow & EscapeTheBomb have no CI workflows (0 runs). **Seven** open amma drafts (#259/#238/#225/#221/#219/#218/#197 — all held; #259 got a merge-of-`main` this run and its `CI — web` re-ran; no new human review comments — only bot). No merge-conflict/base-branch notices; GitHub API healthy all run. #218 governance question stays open; #29 stays closed (07-18). Branch cleanup still 403-blocked (open draft heads excluded).
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets / Stripe / Square / POS / customer data) still wait for Anthony's explicit go-ahead. Drafts are held by their author and are not caretaker-merged. Supabase migrations are prepared as code only — **Anthony runs the SQL**.
**Caretaker model:** pinned to **Opus 4.8** (`/model` is a CLI command, not runnable from the shell in this env; ran as configured `claude-opus-4-8`). Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

🔴 **NEW — Your VBFH daily media pipeline stopped producing today; pick how to fix it.**
   The scheduled **VBFH Daily Run failed today (09-26) — twice** (the 8:17am ET scheduled run #115 and a
   diagnostic re-run #116 I kicked off). Both ran the full **45 minutes and got killed** on the content-generation
   step. It's the **first failure since July** and the code hasn't changed — the **DaySmart website the run scrapes
   has gotten slow enough that the run no longer finishes inside its 45-minute limit.** Until this is fixed, **no
   daily graphics/recap are generated** (and once your SMTP secrets are set, no email would arrive either). I did
   **not** guess at a fix, because the sensible options trade off against each other and the choice is yours:
   - **(A) Give it more time** — raise the run's time limit from 45 to, say, 75–90 minutes. Simplest; costs more
     Actions minutes and only helps if the site is *slow*, not *stuck*.
   - **(B) Make it finish faster** — cut the retry attempts / per-page wait so slow leagues are skipped instead of
     retried. Faster + reliable, but a slow league's results could be missing that day.
   - **(C) Find the culprit** — I download the failed run's log artifact, identify which league page stalls, and
     target just that one.
   **Tell me A, B, or C (or "you decide") and I'll implement it as a PR.** My recommendation: **C then B** — find
   the stall, then add a hard overall time budget so one bad page can never eat the whole run again.

🆕 **The Supabase migration list grew — it's now `0015` through `0022` (was `0015`–`0018`).**
   Your **#266 "Bodega launch foundation + Square connector"** merge today added four more:
   `0019_bodega_seven_day_launch_window.sql`, `0020_bodega_square_read_model.sql`,
   `0021_bodega_guest_note_rate_limit.sql`, `0022_square_lifecycle_and_guest_note_cleanup.sql` — on top of the
   Bodega rewards `0015`–`0018` from #260–#264. All under `APP/web/supabase/migrations/`. The site **builds and
   deploys green** (Vercel/CI never touch the DB), but the Bodega rewards + guest-notes + Square read-model
   features **error at runtime until these are applied.** **What to do:** Supabase SQL editor → run `0015`…`0022`
   in order (or `supabase db push` from `APP/web/`, which also folds in the `0009` Marbel admin grant). **Skip any
   you've already run.** _(I never run SQL against Supabase — the migrations are prepared code; you run them.)_

🆕 **#266 Square connector needs activation you control (payments/POS territory — I don't touch it).**
   #266 added a Square OAuth connector (`/api/integrations/square/connect|callback|refresh|webhook|sync`,
   `/owner/bodega/insights`). The commit says Square stays **read-only/private** with **credentials + seller OAuth
   as separate activation gates**. New env vars are listed in `APP/web/.env.example`. If/when you want it live,
   you set the Square app credentials + run the OAuth connect yourself. Nothing here is auto-activated.

⚠️ **Governance question inside draft PR #218 — please confirm or deny (no action taken).**
   Draft **PR #218** ("E-Myth Revision 4", docs-only under `OPERATIONS/E_MYTH` + `HANDOFF_LOG.md`,
   guardrail-clean, Vercel Ready ✅) contains an **open governance flag**: its Revision-4 commits were authored
   by **"Clone"** and logged asserting *"Anthony explicitly directed `Revise pr218`."* That direction isn't
   recorded in the session that opened the PR, and `CLAUDE.md` scopes Clone to **watching**, not authoring.
   **Did you direct that revision?** If yes, it stays a held draft for your merge call. If no, you may want to
   close it / reset the branch. I've taken no action either way.

🆕 **Draft PR #238 "Menu Control owner app plan" — two things still need your call (held docs draft).**
   `claude/menu-control-app`, docs only, guardrail-clean, Vercel Ready ✅. Two items only you can settle:
   - **Reconcile the Colattao menu (blocks queue item 49).** Guest menu at the printed QR is a **static file**
     while the owner portal writes to **Supabase**; the two have already **drifted** ("Fall Drinks"/51 vs
     "Seasonal Drinks"/~54). Before any owner-editable menu goes live for Colattao you need to say — item by item —
     which version is correct.
   - **A confirmed live bug on the guest menu (I can't fix it — guarded `/m/[id]` route).** A price of `0` should
     read "Ask staff," but the guest screen renders it `$0.00` (a free item). `House Brew` is seeded at `0` and is
     first on the menu. Queued for Codex (item 49); touching `/m/[id]` is outside what I'm allowed to do.

🆕 **Three demos/add-ons still open for your review & merge call (held drafts, guardrail-clean):**
   - **#225 Instagram Ordering Activation add-on** — docs + local tooling only. `mergeable_state: clean`, Vercel ✅.
   - **#221 Order Drop** — Colattao Churro Latte promo → Uber Eats. `web` CI ✅, Vercel ✅.
   - **#219 Las Palmas lotería hero** — playable penalty shootout minting a lotería card per goal. Vercel ✅.
   Open each preview and merge if you like it, or tell me what to change. **I don't auto-merge your drafts.**
   _(#259 "Grúa cable-crane R&D game" also stays held — internal noindex `/grua-lab`, body says "do not merge
   without Anthony's approval"; its base was merged up to the new `main` this run.)_
   _(**#215's Table Duel deploy step is still yours** — set the Render blueprint + `NEXT_PUBLIC_TABLE_DUEL_WS`.)_

1. **Add the 5 VBFH email secrets — exact Gmail values below (for anthonycolmenaresanandres@gmail.com).**
   vbfh-media-engine → Settings → Secrets and variables → Actions → New repository secret, five times:
   `EMAIL_TO` = `anthonycolmenaresanandres@gmail.com` · `EMAIL_FROM` = `anthonycolmenaresanandres@gmail.com`
   · `SMTP_HOST` = `smtp.gmail.com` · `SMTP_USER` = `anthonycolmenaresanandres@gmail.com` · `SMTP_PASS` =
   a Gmail **App Password** (myaccount.google.com/apppasswords; requires 2-Step Verification — your normal password
   will NOT work). Port 587 default is correct. **NOTE:** email only matters once the Daily Run itself succeeds
   again — see the 🔴 item at the top; right now the run never reaches the send step.
2. **Confirm the "Claude QA's the images before emailing" routine (PR #4's open question).** Code half is landed
   (#5+#7); #4 closed as superseded. Left: should a scheduled Claude session QA/regenerate graphics after each run
   before the email goes out? Say yes + timing and I'll build it.
3. **Runway credits — still blocked (#197 draft logs Day 06 blocked).** Credit pool exhausted and monthly. Top up,
   or schedule client art *after* the daily shot.
4. **Grant application is on `main` — submit it yourself when ready.** `BUSINESS/GRANT_APPLICATION_DEV_PC.md`.
5. **(If not already done) Run the Marbel admin SQL** — folds into the `supabase db push` above (`0009`).
6. **⛔ Branch cleanup — you approved it, the environment still physically blocks it.** `git push --delete` returns
   **HTTP 403 from the session's git proxy** (server-side) and the GitHub tooling here has no branch-delete API.
   Paste-ready safe-to-delete commands are below; they run fine from your local clone. Excludes the seven open draft heads.

_Resolved / no action needed from you:_ **amma #266 (Bodega launch + Square connector) — your own merge** (09-26;
adds migrations `0019`–`0022` + the Square activation gate flagged above). **amma #260–#264 (Bodega Fall Rush) —
your own merges** (09-26; migrations `0015`–`0018`). **amma #257/#258** — your own merges (09-25).
**GitHub API access** healthy. **amma #29 ("AI Request Desk — Phase 0")** — closed since 07-18.

---

## Build health (as of 2026-09-26, afternoon/evening)

> **✅ All columns re-verified live this run** — check-runs, Daily-Run jobs/steps, commit file-lists, and
> default-branch tips read directly via API.

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip **`860a5c8`** ("Release Bodega launch foundation and cleaned Square connector (#266)," 09-26 20:47 UTC; **Anthony's own merge**). **Advanced since the morning run** `b1fd1793`→`860a5c8` via **#266**. `CI — web` **#248 ✅** on main; `CI — voice-gateway` ✅ (path-filtered off this web/game/Square wave). **#266 ships a Square OAuth connector (payments/POS territory), a Bodega guest-notes API, four new migrations `0019`–`0022`, and new env/credentials/seller-OAuth — the commit gates migrations+credentials+OAuth as "separate activation gates" (Anthony's).** Combined with #260–#264, pending Supabase migrations = **`0015`–`0022`**. Routes are bodega-specific static + `/api/integrations/square/*`, **not** the guarded dynamic `/owner/[id]`/`/m/[id]` Client OS routes. **Anthony's own merge → no caretaker action.** **Seven** open drafts held (see Open PRs). |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" scheduled | Build **CI ✅** — master tip **`b7af2c9`** (#8, run **#26 ✅**, unchanged). **🔴 "VBFH Daily Run" is FAILING as of 09-26.** Scheduled **#115 (16:26→17:11 UTC) CANCELLED** at the 45-min job timeout on `npm run daily:run`; diagnostic re-run **#116 (21:46→22:31 UTC) ALSO CANCELLED** at the same ceiling. **Two-for-two on unchanged code (`b7af2c9`)** → persistent, not a flake. Prior runs #111–#114 (and all of 07-21…09-25) were ✅; #114 finished in ~26 min. **Root cause: external — the live DaySmart scrape now exceeds the 45-min budget** (per-op Playwright timeouts exist in `dash-fetcher.ts`; the gap is the lack of a global time budget, so timeouts+retries across ~40 leagues overrun). **Fix awaits Anthony's choice (raise timeout / cut retries / pinpoint slow league) — not pushed blind.** Run artifacts hold the per-league log to pinpoint the stall. Scheduled mode stays zero-spend (AI/email off by default). **Zero open PRs.** |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · no workflows (0 runs) · master tip `5113ce5`, last commit 2026-07-09 (re-verified) |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | **#1 merged** (M1 scaffolds, squash `eee6a37`, 2026-07-30); zero open PRs · no workflows (0 runs). First Windows compile after pull is the real verify (M2 gate). |

## Open PRs

- **amma #259 (draft) — "Grúa: cable-crane R&D game on Stringman CDPR physics…"** Head
  `claude/tech-research-integration-s66gw7`, base `main`. Internal noindex `/grua-lab` Phaser 4 game + opt-in,
  on-device training recorder + docs. Guardrail-clean per diff/body. Got a **merge-of-`main` this run** (`d871d4a`);
  `CI — web` re-ran. PR body: *"Do not merge without Anthony's approval."* **Held — his draft; no caretaker merge.**
- **amma #238 (draft, docs-only) — "Menu Control owner app plan + Codex queue 49/50."** Guardrail-clean, Vercel ✅,
  `mergeable_state: clean`. **Held.** Surfaces two items for Anthony (Colattao static-vs-Supabase menu; `$0.00` vs
  "Ask staff" bug on `/m/[id]`).
- **amma #225 (draft) — "Instagram Ordering Activation add-on."** Docs + local tooling only. Guardrail-clean,
  Vercel ✅, `mergeable_state: clean`. **Held.**
- **amma #221 (draft) — "Order Drop — one-item Instagram → Uber Eats (#220 slice)."** Static `noindex` demo.
  Guardrail-clean. `web` CI ✅, Vercel ✅. **Held.**
- **amma #219 (draft) — "lead Las Palmas with a playable lotería hero."** Primitive art, no client logo.
  Guardrail-clean. Vercel ✅. **Held.**
- **amma #218 (draft, docs-only) — "E-Myth Revision 4 — evidence-bound automation controls."** Vercel ✅,
  path-filtered (no CI). **Held.** ⚠️ Open "Clone"-authored governance question (see top).
- **amma #197 (draft, docs-only) — "Odyssey Daily log — Day 06 blocked (Runway pool empty)."** Vercel ✅,
  path-filtered. **Held.**
- **vbfh / shadow-engineer-rpa / EscapeTheBomb-DC: zero open PRs.**

## Merged / closed since last run

Since the 09-26 morning run, amma `main` advanced `b1fd1793`→`860a5c8` via **one of Anthony's own merges**;
nothing closed unmerged; **no new human review comments** anywhere.

- **amma #266 — "Release Bodega launch foundation and cleaned Square connector."** Merged `860a5c8` 09-26
  20:47 UTC, `CI — web` **#248 ✅**. +2266/−11 across 54 files: adds **Square OAuth connector**
  (`src/lib/square/*` — oauth/crypto/signature/catalog/connection/config, `/api/integrations/square/*`,
  `/owner/bodega/insights`), a **Bodega guest-notes** API + form + rate-limit policy, **migrations
  `0019`–`0022`** (`APP/web/supabase/migrations/`), Bodega launch social assets + `vercel.json`, and DB self-test
  scripts. Commit gates **migrations + credentials + seller OAuth as separate activation** (Anthony's). His own
  merge → no caretaker action; recorded.

Prior merges retained below for the audit trail.

- **amma #260–#264 (Bodega Fall Rush wave) — Anthony's own merges 09-26** (`acb8c72`→`b1fd1793`; migrations
  `0015`–`0018`; five-chapter game + gated muffin finale). `CI — web` green throughout (#216→#226).
- **vbfh Daily Run #114 — FIRED + SUCCEEDED** 09-25 17:14→17:40 UTC (~26 min; master `b7af2c9`). Last green run
  before the 09-26 regression.
- **amma #257/#258 — Anthony's own merges 09-25** (photographed Bodega menu → internal demo; `/owner/bodega`
  read-only desk + QR). Guardrail-clean.
- **vbfh #8 — MERGED 09-21 22:22 UTC** ("Make VBFH Daily Mail fail closed and verify Dash results," `b7af2c9`,
  `CI` #26 ✅). Scheduled mode deterministic + zero-spend. vbfh now has zero open PRs. Anthony's own merge.
- **amma #237…#216** — Las Palmas/Cantina/owner/Café-Rush/offer waves (08-17→09-17), all Anthony's own merges;
  full per-run detail in git history.

## Branch cleanup — ready to run (refreshed 2026-09-14 afternoon)

Anthony has approved deletion, but the session git proxy returns **HTTP 403 on any `push --delete`**
(server-side block, independent of permission), and the GitHub tooling here has no branch-delete API. Commands
below remain for Anthony to paste from a local clone. **Verified KEEP:** `main`, `automation/status`, `claude/*`
caretaker branches, **the seven open-draft heads** `claude/tech-research-integration-s66gw7` (#259),
`claude/menu-control-app` (#238), `claude/instagram-dm-ordering-m8i210` (#225), `claude/blissful-darwin-gtt3su`
(#221), `claude/las-palmas-loteria-hero` (#219), `claude/e-myth-ai-automation-gcetx0` (#218),
`claude/las-palmas-menu-game-59vtbg` (#197) (deleting any closes its open draft), unmerged `voice/*` (Anthony's
judgment). **Newly eligible** (merged since, no longer open-draft-protected): the eight Bodega codex branches from
#257/#258/#260–#264 plus `codex/bodega-launch-guest-notes-square-20260926` (#266) — add them to your local delete
run. Still not auto-deleted here (proxy 403 + no branch-delete API).

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
  codex/owner-standard-premium-20260914 codex/consulting-comic-20260917 \
  codex/bodega-articulated-signature codex/bodega-photo-menu-20260925 \
  codex/bodega-owner-live-20260925 codex/bodega-five-levels-20260926 \
  codex/bodega-minute-rush-20260926 codex/bodega-bad-vibes-reset-20260926 \
  codex/bodega-muffin-meter-20260926 codex/bodega-no-save-faster-20260926 \
  codex/bodega-launch-guest-notes-square-20260926
```
**vbfh-media-engine** (verified merged or closed-superseded):
```
git -C vbfh-media-engine push origin --delete \
  claude/pensive-edison-hl5sxo claude/build-automation-management-sh68i3 \
  feat/facility-info claude/vbfh-broadcast-instagram-e6p75v \
  claude/pensive-edison-sb3ujd claude/pensive-edison-sove8x
```

## Run log

- **2026-09-26 (afternoon/evening check-in, `claude-opus-4-8`):** **🔴 Real regression found: the VBFH Daily Run is
  DOWN.** Scheduled **#115 (16:26→17:11 UTC) CANCELLED** at the 45-min job timeout on `daily:run`; I dispatched a
  diagnostic re-run **#116 (21:46→22:31 UTC) which ALSO CANCELLED** at the same ceiling — **two-for-two on unchanged
  code (`b7af2c9`)**, so persistent, not a flake (first failure after a green streak 07-21…09-25; #114 ran ~26 min).
  Root cause external: the live DaySmart scrape now overruns the 45-min budget (per-op timeouts exist in
  `dash-fetcher.ts`; missing global time budget makes retries×~40 leagues overrun). **Did not push a blind fix** —
  the options trade off (raise timeout / cut retries / pinpoint slow league) and it's Anthony's call; artifacts hold
  the per-league log. **amma `main` advanced `b1fd1793`→`860a5c8`** via **#266** (Anthony's own merge; Square OAuth
  connector + guest-notes + migrations `0019`–`0022` + Square activation gate) — `CI — web` #248 ✅; his merge → no
  caretaker action; recorded. Pending Supabase migrations now **`0015`–`0022`** (+`0009`). Default branches
  re-verified: amma `860a5c8` (advanced), vbfh `b7af2c9`, shadow `5113ce5` (dormant), EscapeTheBomb `eee6a37`. amma
  `CI — web` #248 ✅ + `CI — voice-gateway` ✅ on main; vbfh build `CI` #26 ✅ (only the Daily Run is failing). Seven
  open amma drafts held (#259 merged-up + CI re-ran; rest unchanged; no new human review comments). No
  merge-conflict/base-branch notices; GitHub API healthy. #218 governance question open; #29 closed. Branch cleanup
  still 403-blocked (added #266's codex branch to the eligible list). **Push notification + email sent** — the VBFH
  Daily Run being down (and needing Anthony to choose the fix approach) is a genuine action item.
- **2026-09-26 (morning check-in, `claude-opus-4-8`):** All four green; nothing needed fixing; no caretaker merge.
  amma `main` advanced `acb8c72`→`b1fd1793` via five of Anthony's own merges (#260–#264, Bodega Fall Rush; migrations
  `0015`–`0018`). VBFH Daily Run latest completed #114 (09-25 ✅); the 09-26 run had not yet fired at check time
  (~12:30 UTC). Push notification + email sent (new Supabase migration `0015`–`0018` requirement).
- **2026-09-25 (afternoon, `claude-opus-4-8`):** All four green. amma `main` `2b26bab8`→`acb8c72` via #257/#258
  (Anthony's own; guardrail-clean). New draft #259 opened + held. VBFH Daily Run #114 fired + SUCCEEDED. No push.
- **2026-09-25 (morning, `claude-opus-4-8`):** All four green. amma `main` `6167d3e0`→`2b26bab8` (Anthony's Bodega
  polish pushes). VBFH #113 latest. Six drafts held. No push.
- **2026-09-24 (both, `claude-opus-4-8`):** All four green. VBFH #113 fired green. No push.
- **2026-09-23 → 09-22 (both, `claude-opus-4-8`):** All four green. vbfh #8 MERGED (`b7af2c9`, `CI` #26 ✅). VBFH
  #111/#112 fired green. Push sent 09-22 morning.
- **2026-09-21 → 09-14 (both each day, `claude-opus-4-8`):** All four green. Anthony merged #237/#236/#235/#234 and
  the 09-11→09-13 waves; VBFH #103–#110 each fired green. Drafts #238 (09-20) and vbfh #8 (09-19) opened.
- **2026-09-13 → 09-02 (both each day):** All four green; each afternoon's only change was that day's VBFH Daily Run
  (#91–#102) firing green. No pushes.
- **2026-09-01 — API outage then restore.** Morning `401 Bad credentials`; worked around via direct git; cleared by
  evening. VBFH #90 fired green.
- **2026-08-31 … 08-16 and prior:** all four green; VBFH #74–#89 each fired + SUCCEEDED. #29 confirmed closed
  (07-18). _(Full per-run detail in git history.)_
