# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-08-13 (evening — twice-daily check-in, `claude-opus-4-8`). **All four repos green; nothing needed fixing.** One change since the 08-13 morning run: the **08-13 VBFH Daily Run fired and SUCCEEDED (13:19 UTC, run #71), ~twenty-five in a row** (07-21…08-13). No new PRs, merges, closes, or human review comments anywhere; the three open drafts (#216, #215, #197) are unchanged and still held (only Vercel-bot comments). All default branches unchanged & re-verified via API: amma `main` `5b02d0d` (#214 voice tester-back-to-vbfh), vbfh `e21077d` (#7), shadow `5113ce5` (dormant), EscapeTheBomb `eee6a37` (#1). Open PRs: **#216** (Buyer Package, draft, Vercel Ready, held), **#215** (Table Duel, draft, green, held) and **#197** (Odyssey Daily Day 06, docs-only draft, Vercel Ready, held). vbfh CI ✅ (master push 07-30); amma `CI — web` ✅ + `CI — voice-gateway` ✅ on main. **VBFH Daily Run** latest **08-13 13:19 UTC ✅** (run #71, ~twenty-five in a row). No merge-conflict/base-branch notices. **Branch deletion still blocked** — the environment's git proxy returns HTTP 403 on any `push --delete`; paste-set below is for Anthony's local clone. **The three open PR heads (`claude/blissful-darwin-phv15u` #216, `claude/table-duel` #215, `claude/las-palmas-menu-game-59vtbg` #197) are kept OUT of the delete set (deleting any would close its open draft).**
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets) still wait for Anthony's explicit go-ahead. Drafts are held by their author and are not caretaker-merged.
**Caretaker model:** pinned to **Opus 4.8** (`/model` is a CLI command, not runnable from the shell in this env; ran as configured `claude-opus-4-8`). Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

⏰ **Restaurant Buyer Package — your review & merge call (draft PR #216).**
   Draft **PR #216** (`amma-fina-calle`, branch `claude/blissful-darwin-phv15u`) is the buyer-facing folder
   for restaurant owners (menu-QR product). Already flat **"from $199/month"** pricing and **your contact
   baked in** (Anthony Colmenares Sanandres · anthonycolmenaresanandres@gmail.com). Docs-only, Vercel Ready,
   guardrail-clean. **What's left is your call:** (a) review the copy and merge when happy; (b) tell me if you
   want it rendered into a **polished branded PDF packet** as the actual print/email leave-behind. Reply on
   either and I'll finish it. (Held as your own draft — I don't auto-merge it.)

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
    three open draft heads #216/#215/#197); they'll run fine from your local clone.

_No longer on the list:_ **#201 draft decision — DONE** (Anthony merged it, Las Palmas Menu now points at the
official Lynnhaven PDF). The AJ Gator's / Las Palmas visual wave (#202 inked-plate CTAs, #203 penalty-shootout
skin, #204/#205 QR proof leave-behinds, #206/#207 B&W QR handouts) all merged by Anthony.

_Resolved / no action:_ **VBFH Daily Run stays GREEN** — 08-13 13:19 UTC run succeeded (~twenty-five in a row).
The voice-gateway personality wave Anthony merged himself (#212 French volleyball, #213 Larissa
off-grid, #214 tester-back-to-vbfh) is config-only, all CI green post-merge, his own call. The earlier
owner-portal wave (#208 redesign, #209 centralize requests / remove campaigns, #210 simplify, #211 docs
release) is his own call on protected routes; all CI green. Earlier merged history (AJ Gator's Holland Road
#198/#199, Las Palmas simplify #200, the #201–#207 wave, owner portal #162, EscapeTheBomb #1, the 07-30 wave
#189/#180/#161/#196 + vbfh #7, and all prior waves) stays merged. Superseded drafts closed 07-23
(#169/#173/#177) and #168/#4 stay closed. **#29 stays closed** (07-18) — the standing "AI Request Desk"
adopt-and-rebase-or-close decision remains Anthony's; caretaker does not act. shadow-engineer-rpa
dormant (07-09).

---

## Build health (as of 2026-08-13, evening)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip **`5b02d0d`** (**#214** voice tester-back-to-vbfh, on top of **#213** Larissa off-grid + **#212** French volleyball personality, all Anthony's own merges). Latest `CI — voice-gateway` on main ✅ (**08-07 11:16 UTC, run #13**, on the #214 merge). `CI — web` last ✅ **08-05 22:08 UTC run #136** (nothing since touched web paths). Three open drafts held: **#216** Buyer Package (docs, Vercel Ready), **#215** Table Duel (`web` CI ✅ + Vercel ✅) and **#197** docs (Vercel Ready). |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" scheduled | CI ✅ (master push 07-30 12:54 UTC ✅); master tip `e21077d` (**#7**). **VBFH Daily Run — GREEN.** Latest scheduled run **08-13 13:19 UTC SUCCEEDED (run #71)** (07-21…08-13 all ✅ — ~**twenty-five green in a row**). The email-gate fix holds (`skipped_config_missing` non-fatal; a real SMTP `failed` still fails). Content pipeline completes (`needs_review`, `gamesFound:0` = known DaySmart standings-only limitation, not a regression). Emails start once the 5 SMTP secrets are set (action item 1). |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · no workflows (0 runs) · master tip `5113ce5`, last commit 2026-07-09 |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | **#1 merged** (M1 scaffolds, squash `eee6a37`); zero open PRs · no workflows (0 runs). First Windows compile after pull is the real verify (M2 gate). |

## Open PRs

- **amma #216 (draft, docs-only) — "Restaurant Buyer Package — consistent core + per-restaurant customization."**
  Opened 08-11 00:40 UTC. Head `claude/blissful-darwin-phv15u`. Adds a `BUYER_PACKAGE/` folder of 14
  markdown files: a bilingual (EN/ES) buyer-facing set (cover letter, benefits one-pager, how-it-works,
  what-you-get, pricing "from $199/month", see-it-live QR page, Colattao proof, FAQ, next-steps/pilot) plus a
  `CUSTOMIZE/` merge-field kit (how-to, restaurant profile, master field list). **No code, no protected routes,
  no Supabase/Stripe/secrets/customer data** — pure sales collateral; every claim scoped to verified live
  features. **Vercel Ready ✅** (only the Vercel bot has commented). **Held — it's a draft authored by Anthony.**
  Nothing to fix. His call: merge, or ask for a branded PDF packet render.
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

- **Nothing.** No PRs merged or closed in any of the four repos since the 08-13 morning run. Last merge
  remains amma **#214** (`5b02d0d`, 08-07 11:16 UTC). (Drafts #216/#215/#197 open, none merged.)

### Earlier merged

- **#214 — "voice: switch tester back to vbfh."** Merge `5b02d0d` (current main tip). Self-merged by
  Anthony 08-07 11:16 UTC. Voice-gateway tester config only. `CI — voice-gateway` ✅ (run #13). No caretaker action.
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
`automation/status`, `claude/*` caretaker branches, **the three open draft heads `claude/blissful-darwin-phv15u`
(#216), `claude/table-duel` (#215) and `claude/las-palmas-menu-game-59vtbg` (#197)** (deleting any closes its
open draft), unmerged `voice/*` (Anthony's judgment) and the unproven
squash-merged exploration sets. The #201–#207 heads are merged and safe. The #208–#211
codex heads (`codex/owner-portal-comic-20260804`, `codex/owner-request-intake-20260805`) are also merged.
The #212–#214 voice heads (`voice/volleyball-fr`, `voice/larissa-offgrid`, `voice/vbfh-return`) are now merged too.

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

- **2026-08-13 (evening) — Twice-daily check-in (`claude-opus-4-8`):** **All four repos green; nothing
  needed fixing.** One change since the 08-13 morning run: the **08-13 VBFH Daily Run fired and SUCCEEDED
  (13:19 UTC, run #71), ~twenty-five green in a row** (07-21…08-13). No new PRs, merges, closes, or human
  review comments in any of the four repos — the three open drafts (**#216** Buyer Package, **#215** Table
  Duel, **#197** Odyssey Daily Day 06) are unchanged and still held (only Vercel-bot comments). Default
  branches unchanged & re-verified via API: amma `5b02d0d` (#214), vbfh `e21077d` (#7), shadow `5113ce5`,
  EscapeTheBomb `eee6a37`. amma `CI — web` ✅ (main run #136, 08-05) + `CI — voice-gateway` ✅ (main run #13,
  08-07). vbfh CI ✅ (master push 07-30). shadow-engineer-rpa & EscapeTheBomb-DC have no CI workflows
  (0 runs) — nothing to verify. No merge-conflict/base-branch notices. #29 stays closed. Branch cleanup
  still 403-blocked (awaiting Anthony's local paste; all three open draft heads #216/#215/#197 excluded).
  Standing items for Anthony unchanged (SMTP secrets, Runway credits Day 06, image-QA routine decision,
  grant submission, branch cleanup).
- **2026-08-13 (morning) — Twice-daily check-in (`claude-opus-4-8`):** **All four repos green; nothing
  changed and nothing needed fixing since the 08-12 evening run.** No new PRs, merges, closes, or human
  review comments in any of the four repos — the three open drafts (**#216** Buyer Package, **#215** Table
  Duel, **#197** Odyssey Daily Day 06) are unchanged and still held (only Vercel-bot comments). Default
  branches unchanged & re-verified via API: amma `5b02d0d` (#214), vbfh `e21077d` (#7), shadow `5113ce5`,
  EscapeTheBomb `eee6a37`. amma `CI — web` ✅ (main run #136, 08-05) + `CI — voice-gateway` ✅ (main run #13,
  08-07). vbfh CI ✅ (master push 07-30). **VBFH Daily Run** — latest **08-12 13:17 UTC ✅** (run #70,
  ~twenty-four green in a row); the **08-13 run had not fired at check time (12:49 UTC, before its
  ~13:1x-UTC schedule)** — expected, not a failure. shadow-engineer-rpa & EscapeTheBomb-DC have no CI
  workflows (0 runs) — nothing to verify. No merge-conflict/base-branch notices. #29 stays closed. Branch
  cleanup still 403-blocked (awaiting Anthony's local paste; all three open draft heads #216/#215/#197
  excluded). Standing items for Anthony unchanged (SMTP secrets, Runway credits Day 06, image-QA routine
  decision, grant submission, branch cleanup).
- **2026-08-12 (evening) — Twice-daily check-in (`claude-opus-4-8`):** **All four repos green; nothing
  needed fixing.** One change since the 08-12 morning run: the **08-12 VBFH Daily Run fired and SUCCEEDED
  (13:17 UTC, run #70), ~twenty-four green in a row** (07-21…08-12). No new PRs, merges, closes, or human
  review comments in any of the four repos — the three open drafts (**#216** Buyer Package, **#215** Table
  Duel, **#197** Odyssey Daily Day 06) are unchanged and still held (only Vercel-bot comments). Default
  branches unchanged & re-verified via API: amma `5b02d0d` (#214), vbfh `e21077d` (#7), shadow `5113ce5`,
  EscapeTheBomb `eee6a37`. amma `CI — web` ✅ (main run #136, 08-05) + `CI — voice-gateway` ✅ (main run #13,
  08-07). vbfh CI ✅ (master push 07-30). shadow-engineer-rpa & EscapeTheBomb-DC have no CI workflows
  (0 runs) — nothing to verify. No merge-conflict/base-branch notices. #29 stays closed. Branch cleanup
  still 403-blocked (awaiting Anthony's local paste; all three open draft heads #216/#215/#197 excluded).
  Standing items for Anthony unchanged (SMTP secrets, Runway credits Day 06, image-QA routine decision,
  grant submission, branch cleanup).
- **2026-08-12 (morning) — Twice-daily check-in (`claude-opus-4-8`):** All four green; nothing changed since
  the 08-11 evening run. VBFH Daily Run latest 08-11 13:13 UTC ✅ (run #69); the 08-12 run had not fired at
  check time. Three open drafts held (#216/#215/#197). Default branches unchanged. #29 stays closed. Branch
  cleanup still 403-blocked.
- **2026-08-11 (evening) — Twice-daily check-in (`claude-opus-4-8`):** All four green; the 08-11 VBFH Daily
  Run fired and SUCCEEDED (13:13 UTC, run #69). Three open drafts held (#216/#215/#197). Default branches
  unchanged. #29 stays closed. Branch cleanup still 403-blocked.
- **2026-08-11 (morning) — Twice-daily check-in (`claude-opus-4-8`):** **All four repos green.** New draft
  amma **#216 "Restaurant Buyer Package"** opened 08-11 00:40 UTC (14 bilingual docs; no code/protected
  routes/Supabase/secrets; Vercel Ready) → held as Anthony's own draft. No other changes. #29 stays closed.
- **2026-08-10 (evening) — Twice-daily check-in (`claude-opus-4-8`):** **All four green.** 08-10 VBFH Daily
  Run ✅ (run #68). New draft amma **#215 "Table Duel"** opened 08-10 15:53 UTC (additive same-table game;
  no Supabase/protected routes/secrets; non-human art; free play) → held as Anthony's own draft. #29 stays closed.
- **2026-08-10 (morning) → 07-30 — earlier twice-daily check-ins (`claude-opus-4-8`):** All four green
  throughout. Merge waves logged above (voice #212–#214; owner-portal #208–#211; the #201–#207 wave; #198–#200;
  the 07-30 wave #162/#189/#180/#161/#196 + EscapeTheBomb #1 + vbfh #7). VBFH Daily Runs green every day. #29
  stays closed throughout. _(Full per-run detail retained in git history; trimmed here for length.)_
