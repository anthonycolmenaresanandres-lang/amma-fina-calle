# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-08-02 (evening — twice-daily check-in, `claude-opus-4-8`). **All four repos green.** Three changes since the 08-02 morning run, all on amma: **#199 merged** (AJ Gator's demo refocused into a menu/games/promotions hub — Anthony merged it) and **#200 merged** (simplify Las Palmas demo landing — Anthony), which advanced `main` `54620ae` → `bb0cb42` (#199) → `21d032c` (#200) → `15edd95` (Clone docs "Log Las Palmas production release", current tip); and **new draft #201 opened** (point the Las Palmas landing Menu action at the restaurant's own official Lynnhaven menu PDF — `CI — web` ✅, Vercel Ready, **held as a draft**). No red builds anywhere; nothing needed fixing. Other default branches unchanged — vbfh master `e21077d` (#7), shadow `5113ce5` (dormant), EscapeTheBomb `eee6a37` (#1) — all re-verified via API. **VBFH Daily Run stays GREEN** — today's run **08-02 13:35 UTC SUCCEEDED (~fourteen in a row)**. `CI — web` on main ✅ (08-02 14:25 UTC, the #200 push; 13:35 UTC the #199 push); vbfh CI ✅ (master push 07-30 12:54 UTC); voice-gateway CI path-filtered (no recent run — nothing touched its paths). No newly opened human review comments (only Vercel bot on #201), no merge-conflict/base-branch notices anywhere. **Branch deletion still blocked** — the environment's git proxy returns HTTP 403 on any `push --delete`; paste-set below is for Anthony's local clone.
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets) still wait for Anthony's explicit go-ahead. Drafts are held by their author and are not caretaker-merged.
**Caretaker model:** pinned to **Opus 4.8** (`/model` is a CLI command, not runnable from the shell in this env; ran as configured `claude-opus-4-8`). Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

1. **Add the 5 VBFH email secrets — exact Gmail values below (Anthony asked for anthonycolmenaresanandres@gmail.com).**
   vbfh-media-engine → Settings → Secrets and variables → Actions → New repository secret, five times:
   `EMAIL_TO` = `anthonycolmenaresanandres@gmail.com` · `EMAIL_FROM` = `anthonycolmenaresanandres@gmail.com`
   · `SMTP_HOST` = `smtp.gmail.com` · `SMTP_USER` = `anthonycolmenaresanandres@gmail.com` · `SMTP_PASS` =
   a Gmail **App Password** (myaccount.google.com/apppasswords → create app password → paste the 16 chars,
   no spaces; requires 2-Step Verification on the Google account — your normal password will NOT work).
   Port 587 default is already correct, no Variables needed. Next 14:00-UTC Daily Run then emails you the
   caption + all post-ready graphics (the #7 code is now live on master). **This is the only thing standing
   between you and the VBFH graphics landing in your inbox — the run is green, it just has nowhere to send.**
2. ~~merge 162~~ **DONE — #162 and EscapeTheBomb #1 merged on Anthony's follow-up "merge" (2026-07-30).**
3. **Grant application is now on `main` — submit it yourself when ready.**
   `BUSINESS/GRANT_APPLICATION_DEV_PC.md` (landed via #196). Nothing is auto-submitted.
4. **Confirm the "Claude QA's the images before emailing" routine (was PR #4's open question).** The code
   half is fully landed (#5+#7); #4 itself is closed as superseded. What's left is only the decision:
   should a scheduled Claude session QA/regenerate the graphics after each 14:00-UTC run before the email
   goes out? Say yes + preferred timing and I'll build the routine.
5. **Runway credits — still blocked (the #197 draft logs Day 06 blocked).**
   The plan's credit pool is exhausted and it's monthly (won't self-reset), so the Odyssey Daily shot
   can't progress until you act. Top up credits, or schedule client art *after* the daily shot so it
   can't starve the next morning's run. (This is the only recurring item that keeps re-surfacing.)
6. **(If not already done) Run the Marbel admin SQL in Supabase.** From #150: Supabase SQL editor →
   run `0009_admin_team_update.sql` (or `supabase db push`) to grant `marbeljsiado@gmail.com` admin.
   I can't see Supabase state from here — skip this if you already ran it.
7. **One AJ Gator's / Las Palmas draft awaiting your decision (held, no guardrails):**
   - **#201** — point the Las Palmas landing **Menu** button at the restaurant's own official Lynnhaven
     menu PDF (opens in a new tab) instead of the curated prospect preview. Draft, `noindex`, no
     order/payment/POS, and (per the PR) **no QR target changed** — only what the on-page button opens.
     `CI — web` ✅, Vercel Ready. **Merge it if you want that button to open the official menu**, or leave
     it as a preview. Caretaker holds drafts for you.
8. **⛔ Branch cleanup — you gave permission, I retried, the environment still physically blocks it.**
    `git push --delete` now returns **HTTP 403 from the session's git proxy** (server-side, regardless of
    permission), and the GitHub tooling here has no branch-delete API. The refreshed safe-to-delete set is
    in the paste-ready commands below; they'll run fine from your local clone.

_Resolved / no action:_ **VBFH Daily Run stays GREEN** — 08-02 13:35 UTC run succeeded (~fourteen in a row).
**AJ Gator's landing-hub refocus landed by Anthony** — **#199** (squash `bb0cb42`). **Las Palmas demo landing
simplified by Anthony** — **#200** (squash `21d032c`) + docs closeout `15edd95` (current main tip). AJ Gator's
Holland Road guest portal (**#198**), Las Palmas original-logo cycle (**#194** + docs **#195**), earlier Las
Palmas silver-palm cycle (#190→#192 revert, #191/#193), photo-menu/game wave (#187/#188), prospect/demo wave
(#183/#184/#185/#186), Table-OS wave (#181/#182) and Bodega wave (#175/#176/#178/#179) stay merged. The 3
superseded drafts closed 07-23 (#169/#173/#177) stay closed. **#29 stays closed** (07-18). shadow-engineer-rpa
dormant (07-09).

---

## Build health (as of 2026-08-02, evening)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip `15edd95` (Clone docs "Log Las Palmas production release", after **#200**). Latest `CI — web` on main ✅ (08-02 14:25 UTC, the #200 push; 13:35 UTC the #199 push); recent main runs show zero failures. voice-gateway CI path-filtered (no recent run). Two open drafts (#197 docs, #201 Las Palmas menu-link) both have Vercel Ready + `CI — web` green where applicable, **held as drafts**. |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" scheduled | CI ✅ (master push 07-30 12:54 UTC ✅); master tip `e21077d` (**#7**). **VBFH Daily Run — GREEN.** Today's scheduled run **08-02 13:35 UTC SUCCEEDED** (07-21…08-02 all ✅ — ~**fourteen green in a row**). The email-gate fix holds (`skipped_config_missing` non-fatal; a real SMTP `failed` still fails). Content pipeline completes (`needs_review`, `gamesFound:0` = known DaySmart standings-only limitation, not a regression). Emails start once the 5 SMTP secrets are set (action item 1). |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · no workflows (0 runs) · master tip `5113ce5`, last commit 2026-07-09 |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | **#1 merged** (M1 scaffolds, squash `eee6a37`); zero open PRs · no workflows (0 runs). First Windows compile after pull is the real verify (M2 gate). |

## Open PRs

- **amma #201 (draft) — "Link Las Palmas to its current official menu."** Opened 08-02, branch
  `codex/las-palmas-original-menu-20260802`, base main `15edd95`, mergeable **clean**. The Las Palmas landing
  Menu action now opens the exact official Lynnhaven menu PDF (new tab) instead of the curated prospect
  preview; owner-review proof below the landing unchanged. +45 / −2 across 3 files. Preserves `noindex` and
  pending-client boundaries; PR states no menu data, prices, photos, Supabase, Stripe, POS, Client OS,
  secrets, customer data, **QR targets**, or production routes changed. `CI — web` ✅, Vercel Ready.
  **Held — it's a draft**; Anthony merges when he approves. Not a guardrail PR (demo landing button only),
  but caretaker does not merge drafts.
- **amma #197 (draft, docs-only) — "Odyssey Daily log — Day 06 blocked (Runway pool still empty)."**
  Opened 07-30; Day-06 continuation of the merged #189 series. Vercel preview Ready/green; no `CI — web`
  (docs-only, path-filtered). **Held — it's a draft.** Nothing to fix.
- vbfh-media-engine, shadow-engineer-rpa, EscapeTheBomb-DC: **zero open PRs.**

## Merged / closed since last run

- **amma #199 merged (by Anthony) — "Refocus AJ Gator's as a menu, games, and promotions landing hub."**
  Squash `bb0cb42`. Reworked `/demo/aj-gators` into a mobile landing hub (links out to AJ Gator's official
  live menu, keeps the three games + promotions board, adds a $150/mo core + $75/mo managed-promotions
  offer). Post-merge `CI — web` ✅. Merged by Anthony; no caretaker action.
- **amma #200 merged (by Anthony) — "Simplify Las Palmas demo landing."** Squash `21d032c`, followed by
  docs closeout `15edd95` (current main tip). Preserves noindex, pending-client approval, menu data/media,
  game/table behavior, and protected surfaces. Post-merge `CI — web` ✅. Merged by Anthony; no caretaker action.

Prior history retained below.

**2026-08-02 morning → 08-01:**

- **amma #198 merged (by Anthony) — "Publish AJ Gator's Holland Road guest portal."** Squash `b701b6e`,
  docs closeout `54620ae`. Post-merge `CI — web` ✅.

**2026-07-30 afternoon (Anthony: "merge"):**

- **amma #162 merged** — owner portal installable (protected `/owner/[id]` route; Anthony's explicit
  live follow-up authorized it). Squash `a454ad6`.
- **EscapeTheBomb-DC #1 merged** — M1 master plan + P5–P8 scaffolds. Squash `eee6a37`. No cloud CI;
  first Windows compile after pull is the real verify (M2 gate note stands).

**2026-07-30 midday merge wave (Anthony's live go-ahead: "merge all those branches"):**

- **amma #189 merged** — Odyssey Daily log Days 02–05 (docs). Squash `3b9dcbd`.
- **amma #180 merged** — `vercel-dash-report` skill + traffic ledger. Squash `46097ae`.
- **amma #161 merged** — ethical sales conversion system. Squash `343743d`.
- **amma #196 opened + merged** — clean extraction of the grant-app doc from #168's branch. Squash `96c87b0`.
- **amma #168 closed (superseded by #196)** — its branch also carried obsolete Screenshot-Trap decoy
  commits + an unrelated Unity dump; merging would have reintroduced reverted decoy styling to production.
- **vbfh #7 merged** — daily email now attaches every post-ready Instagram card + the PDF. Squash `e21077d`.
- **vbfh #4 closed (superseded)** — everything it promised already landed via #5 + #7; its template rewrite
  targets the pre-#6 data model and conflicts with the current pipeline. Its one open question (scheduled
  Claude image-QA routine) moved to the action list.

## Branch cleanup — ready to run (refreshed 2026-08-02)

Anthony has approved deletion, but the session git proxy returns **HTTP 403 on any `push --delete`**
(server-side block, independent of permission), and the GitHub tooling here has no branch-delete API. The
commands below remain for Anthony to paste from a local clone. **Verified KEEP:** `main`,
`automation/status`, `claude/*` caretaker branches, open-PR heads (`codex/las-palmas-original-menu-20260802`
for #201, the #197 head, the EscapeTheBomb branches), unmerged `voice/*` (Anthony's judgment) and the
unproven squash-merged exploration sets. `codex/aj-gators-landing-hub-20260801` (was #199) is now merged and
safe to add to the amma delete set.

**amma-fina-calle** (verified merged or closed-superseded):
```
git -C amma-fina-calle push origin --delete \
  codex/free-video-game-visuals-20260718 codex/free-visual-toolkit-20260718 \
  codex/small-model-skill-selector-20260718 ops/data-center-docs \
  claude/screenshot-trap-landing claude/screenshot-trap-live agent/bodega-line-motion-20260722 \
  claude/las-palmas-menu-game-59vtbg claude/blissful-darwin-ddej93 \
  codex/ethical-sales-conversion-20260718 claude/escape-bomb-dc-plan-n6bfj5 \
  feat/las-palmas-lynnhaven-table-os codex/aj-gators-landing-hub-20260801
```
**vbfh-media-engine** (verified merged or closed-superseded):
```
git -C vbfh-media-engine push origin --delete \
  claude/pensive-edison-hl5sxo claude/build-automation-management-sh68i3 \
  feat/facility-info claude/vbfh-broadcast-instagram-e6p75v \
  claude/pensive-edison-sb3ujd claude/pensive-edison-sove8x
```

## Run log

- **2026-08-02 (evening) — Twice-daily check-in (`claude-opus-4-8`):** **Checked, all four repos green,
  nothing needed fixing.** Three changes since the morning run, all amma: **#199 merged by Anthony**
  (AJ Gator's landing-hub refocus, squash `bb0cb42`), **#200 merged by Anthony** (simplify Las Palmas
  landing, squash `21d032c` + docs `15edd95`), and **new draft #201 opened** (Las Palmas Menu button →
  official Lynnhaven PDF; `CI — web` ✅, Vercel Ready, **held as a draft** — not a guardrail PR, PR affirms
  no QR target changed). main `54620ae` → `15edd95`. Other default branches unchanged — vbfh `e21077d`,
  shadow `5113ce5`, EscapeTheBomb `eee6a37` — all re-verified via API. **VBFH Daily Run today 08-02 13:35 UTC
  ✅ (~fourteen in a row).** `CI — web` on main ✅ (08-02 14:25 UTC). No new human review comments (only
  Vercel bot on #201), no merge-conflict/base-branch notices. #29 stays closed. Branch cleanup still
  403-blocked (awaiting Anthony's local paste; #199's head now added to the amma delete set). Standing items
  for Anthony unchanged (SMTP secrets, Runway credits Day 06, image-QA routine decision, grant submission,
  the #201 draft decision, branch cleanup).
- **2026-08-02 (morning) — Twice-daily check-in (`claude-opus-4-8`):** All green, nothing needed fixing.
  Two changes since 08-01 evening, both amma: **#198 merged by Anthony** (AJ Gator's Holland Road guest
  portal; main `a454ad6` → `54620ae`, `CI — web` ✅) and new draft #199 opened. VBFH Daily Run last run
  08-01 13:35 UTC ✅; today's 08-02 run not yet fired at check time. Branch cleanup 403-blocked.
- **2026-08-01 (evening) — Twice-daily check-in (`claude-opus-4-8`):** All green, nothing needed doing.
  Only change since morning: VBFH Daily Run fired and SUCCEEDED (08-01 13:35 UTC ✅). Default branches
  unchanged; only open PR amma #197 (draft) held; #29 closed; branch cleanup 403-blocked.
- **2026-08-01 (morning) — Twice-daily check-in (`claude-opus-4-8`):** All green, nothing changed. VBFH
  Daily Run last run 07-31 14:17 UTC ✅; today's not yet fired at check time. Default branches unchanged;
  only open PR amma #197 (draft) held; #29 closed; branch cleanup 403-blocked.
- **2026-07-31 (evening) — Twice-daily check-in (`claude-opus-4-8`):** All green. Only change: VBFH Daily
  Run 07-31 14:17 UTC ✅. Default branches unchanged; #197 draft held; #29 closed; branch cleanup 403-blocked.
- **2026-07-31 (morning) — Twice-daily check-in (`claude-opus-4-8`):** All green, nothing changed. VBFH
  Daily Run last run 07-30 14:10 UTC ✅; today's not yet fired at check time.
- **2026-07-30 (evening) — Twice-daily check-in (`claude-opus-4-8`):** Two changes: VBFH Daily Run
  succeeded (07-30 14:10 UTC ✅) and new draft amma #197 opened (Odyssey Daily Day 06, docs-only, held).
- **2026-07-30 (afternoon) — Anthony: "merge" (`claude-fable-5`):** Merged amma **#162** (owner portal
  installable, squash `a454ad6`) and **EscapeTheBomb #1** (M1 scaffolds, squash `eee6a37`).
- **2026-07-30 (midday) — Anthony live go-ahead: merge wave (`claude-fable-5`):** Merged amma
  **#189/#180/#161/#196** and vbfh **#7**; closed **#168** and vbfh **#4** as superseded.
- _(Older entries 07-18 → 07-30 morning retained in git history; trimmed here for length.)_
