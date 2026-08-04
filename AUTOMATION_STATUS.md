# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-08-04 (morning — twice-daily check-in, `claude-opus-4-8`). **All four repos green.** **Nothing changed since the 08-03 evening run** — no new PRs, merges/closes, or human review comments; `main` steady at `559f616`. The prior afternoon's seven-PR wave (#201–#207, all merged by Anthony himself) stays merged; no caretaker action needed and no CI failures. `main` advanced `15edd95` → **`559f616`**; other default branches unchanged (vbfh `e21077d` #7, shadow `5113ce5` dormant, EscapeTheBomb `eee6a37` #1 — all re-verified via API). The previously-held draft **#201** (Las Palmas Menu → official Lynnhaven PDF) and the game-art PR **#203** (A.J. Gator's penalty-shootout skin — color-only, engine primitives, real approved logo as sole overlay, pending-approval banner → guardrail-compliant) were both **resolved by Anthony merging them himself**. Only open PR now: **#197** (Odyssey Daily Day 06, docs-only draft, Vercel Ready, held). **VBFH Daily Run stays GREEN** — latest **08-03 14:47 UTC SUCCEEDED (~fifteen in a row)**. `CI — web` on main ✅ (latest 08-03 16:22 UTC on #203 tip; #205–#207 were docs/binary-asset merges path-filtered out of CI). vbfh CI ✅ (master push 07-30). voice-gateway CI path-filtered (nothing touched its paths). No new human review comments (only the Vercel bot on #197). No merge-conflict/base-branch notices. **Branch deletion still blocked** — the environment's git proxy returns HTTP 403 on any `push --delete`; paste-set below is for Anthony's local clone. **Corrected a prior-list error: `claude/las-palmas-menu-game-59vtbg` is the open #197 head — removed from the delete set (deleting it would close #197).**
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
    in the paste-ready commands below (now includes the five branches from #201–#207, and **excludes** the
    open #197 head); they'll run fine from your local clone.

_No longer on the list:_ **#201 draft decision — DONE** (Anthony merged it, Las Palmas Menu now points at the
official Lynnhaven PDF). The AJ Gator's / Las Palmas visual wave (#202 inked-plate CTAs, #203 penalty-shootout
skin, #204/#205 QR proof leave-behinds, #206/#207 B&W QR handouts) all merged by Anthony.

_Resolved / no action:_ **VBFH Daily Run stays GREEN** — 08-03 14:47 UTC run succeeded (~fifteen in a row).
Everything Anthony merged in the 08-03 wave (#201–#207) is his own call; all CI green post-merge. Earlier merged
history (AJ Gator's Holland Road #198/#199, Las Palmas simplify #200, owner portal #162, EscapeTheBomb #1,
the 07-30 wave #189/#180/#161/#196 + vbfh #7, and all prior waves) stays merged. Superseded drafts closed
07-23 (#169/#173/#177) and #168/#4 stay closed. **#29 stays closed** (07-18) — the standing "AI Request Desk"
adopt-and-rebase-or-close decision remains Anthony's; caretaker does not act. shadow-engineer-rpa dormant (07-09).

---

## Build health (as of 2026-08-03, evening)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip **`559f616`** (Clone docs "close black-and-white QR release", after **#207**). Latest `CI — web` on main ✅ (08-03 16:22 UTC on the #203 tip `1e9503b`; #201/#202/#204 code merges also ✅). #205–#207 were docs/binary-asset merges (path-filtered out of `CI — web`). voice-gateway CI path-filtered (no recent run). One open draft (#197 docs) has Vercel Ready, **held**. |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" scheduled | CI ✅ (master push 07-30 12:54 UTC ✅); master tip `e21077d` (**#7**). **VBFH Daily Run — GREEN.** Today's scheduled run **08-03 14:47 UTC SUCCEEDED** (07-21…08-03 all ✅ — ~**fifteen green in a row**). The email-gate fix holds (`skipped_config_missing` non-fatal; a real SMTP `failed` still fails). Content pipeline completes (`needs_review`, `gamesFound:0` = known DaySmart standings-only limitation, not a regression). Emails start once the 5 SMTP secrets are set (action item 1). |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · no workflows (0 runs) · master tip `5113ce5`, last commit 2026-07-09 |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | **#1 merged** (M1 scaffolds, squash `eee6a37`); zero open PRs · no workflows (0 runs). First Windows compile after pull is the real verify (M2 gate). |

## Open PRs

- **amma #197 (draft, docs-only) — "Odyssey Daily log — Day 06 blocked (Runway pool still empty)."**
  Opened 07-30; Day-06 continuation of the merged #189 series. Head `claude/las-palmas-menu-game-59vtbg`.
  Vercel preview Ready/green; no `CI — web` (docs-only, path-filtered). **Held — it's a draft.** Nothing to fix.
- amma: no other open PRs. vbfh-media-engine, shadow-engineer-rpa, EscapeTheBomb-DC: **zero open PRs.**

## Merged / closed since last run (all amma, all merged by Anthony)

- **#207 — "Log black-and-white QR handout release."** Merge `559f616` (current main tip). Docs closeout.
- **#206 — "Add black-and-white three-QR Gators leave-behind."** Merge `100831d`. Sales handout (binary asset).
- **#205 — "Log restaurant QR proof production closeout."** Merge `b9c3fac`. Docs closeout.
- **#204 — "Add two-QR Gators leave-behind and verified local proof."** Merge `4c0138a`. Sales leave-behind + proof.
- **#203 — "A.J. Gator's penalty shootout: hub game tab + branded skin."** Merge `1e9503b`. New color-only
  `ajgators` penalty skin (sports-bar palette), client's real official logo as the **only** asset overlay,
  kicker/keeper/ball stay engine primitives pending owner-approved art, same pending-approval banner as the
  Las Palmas prospect skin; Holland Road hub gains a 4th game tab → `/penalty-shootout?skin=ajgators`.
  **Guardrail-compliant** (non-human primitives, approved logo overlay only, primitive fallback preserved).
  `CI — web` ✅.
- **#202 — "Inked-plate buttons — premium comic-book CTAs for both restaurant hubs."** Merge `7ba7b04`. `CI — web` ✅.
- **#201 — "Link Las Palmas to its current official menu."** Merge `84ed044`. The held draft — Anthony merged
  it; Las Palmas landing Menu action now opens the official Lynnhaven PDF (new tab). PR affirms no QR target,
  Supabase, Stripe, POS, Client OS, secrets, or customer data changed. `CI — web` ✅.

Prior history retained below.

**2026-08-02:**

- **#200 merged — "Simplify Las Palmas demo landing."** Squash `21d032c` + docs `15edd95`.
- **#199 merged — "Refocus AJ Gator's as a menu, games, and promotions landing hub."** Squash `bb0cb42`.
- **#198 merged — "Publish AJ Gator's Holland Road guest portal."** Squash `b701b6e`, docs `54620ae`.

**2026-07-30 (Anthony: "merge" / merge wave):**

- **amma #162 merged** — owner portal installable (protected `/owner/[id]`; Anthony's explicit live follow-up
  authorized it). Squash `a454ad6`.
- **EscapeTheBomb-DC #1 merged** — M1 master plan + P5–P8 scaffolds. Squash `eee6a37`. No cloud CI.
- **amma #189/#180/#161/#196 merged**; **vbfh #7 merged**; **#168 & vbfh #4 closed** (superseded).

## Branch cleanup — ready to run (refreshed 2026-08-03 evening)

Anthony has approved deletion, but the session git proxy returns **HTTP 403 on any `push --delete`**
(server-side block, independent of permission), and the GitHub tooling here has no branch-delete API. The
commands below remain for Anthony to paste from a local clone. **Verified KEEP:** `main`,
`automation/status`, `claude/*` caretaker branches, **the open #197 head `claude/las-palmas-menu-game-59vtbg`**
(deleting it would close the open draft), unmerged `voice/*` (Anthony's judgment) and the unproven
squash-merged exploration sets. The five #201–#207 heads are now merged and safe to add.

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
  codex/qr-proof-release-20260803 codex/aj-gators-bw-qr-20260803
```
**vbfh-media-engine** (verified merged or closed-superseded):
```
git -C vbfh-media-engine push origin --delete \
  claude/pensive-edison-hl5sxo claude/build-automation-management-sh68i3 \
  feat/facility-info claude/vbfh-broadcast-instagram-e6p75v \
  claude/pensive-edison-sb3ujd claude/pensive-edison-sove8x
```

## Run log

- **2026-08-04 (morning) — Twice-daily check-in (`claude-opus-4-8`):** **All four repos green; nothing changed
  and nothing needed fixing.** No new PRs, merges/closes, or human review comments since the 08-03 evening run
  (last activity was Anthony's #201–#207 merge wave, already logged). `main` unchanged at **`559f616`**; vbfh
  `e21077d`, shadow `5113ce5`, EscapeTheBomb `eee6a37` — all re-verified. Only open PR still amma **#197** (draft,
  docs-only, held; only a Vercel-bot redeploy comment 08-04 04:26 UTC, no human review comments). **VBFH Daily
  Run stays GREEN** — latest **08-03 14:47 UTC ✅**; the 08-04 ~14:00-UTC run had not yet fired at check time.
  No merge-conflict/base-branch notices. #29 stays closed. Branch cleanup still 403-blocked (awaiting Anthony's
  local paste). Standing items for Anthony unchanged (SMTP secrets, Runway credits Day 06, image-QA routine
  decision, grant submission, branch cleanup).
- **2026-08-03 (evening) — Twice-daily check-in (`claude-opus-4-8`):** **All four repos green; nothing needed
  fixing.** Busy amma afternoon: **seven PRs #201–#207 all merged by Anthony himself** — #201 Las Palmas
  menu-link (the held draft, `84ed044`), #202 inked-plate CTAs (`7ba7b04`), #203 A.J. Gator's penalty-shootout
  skin (`1e9503b`, guardrail-compliant: color-only, engine primitives, real logo overlay only, pending-approval
  banner), #204/#205 QR proof leave-behinds (`4c0138a`/`b9c3fac`), #206/#207 B&W QR handouts (`100831d`/`559f616`).
  main `15edd95` → `559f616`. `CI — web` ✅ on every code merge (#205–#207 docs/binary path-filtered). Other
  default branches unchanged (vbfh `e21077d`, shadow `5113ce5`, EscapeTheBomb `eee6a37`). **VBFH Daily Run
  08-03 14:47 UTC ✅ (~fifteen in a row).** Only open PR amma #197 (draft) held; only a Vercel-bot comment,
  no human review comments. No merge-conflict/base-branch notices. #29 stays closed. Branch cleanup still
  403-blocked (awaiting Anthony's local paste; five #201–#207 heads added, and **corrected a prior-list error
  — removed the open #197 head `claude/las-palmas-menu-game-59vtbg` from the delete set**). Standing items for
  Anthony unchanged (SMTP secrets, Runway credits Day 06, image-QA routine decision, grant submission, branch cleanup).
- **2026-08-03 (morning) — Twice-daily check-in (`claude-opus-4-8`):** **All four repos green; nothing changed
  and nothing needed fixing.** No new merges/PRs/human review comments since 08-02 evening. `main` at `15edd95`;
  vbfh `e21077d`, shadow `5113ce5`, EscapeTheBomb `eee6a37`. Both open drafts (#201, #197) held & green. **VBFH
  Daily Run — 08-02 13:35 UTC ✅**; 08-03 run not yet fired at check time. Branch cleanup 403-blocked.
- **2026-08-02 (evening) — Twice-daily check-in (`claude-opus-4-8`):** All green. Three amma changes: #199
  merged (`bb0cb42`), #200 merged (`21d032c` + docs `15edd95`), new draft #201 opened. VBFH Daily Run 08-02 ✅.
- **2026-08-02 (morning) — Twice-daily check-in (`claude-opus-4-8`):** All green. #198 merged (`54620ae`),
  new draft #199 opened. VBFH Daily Run 08-01 ✅. Branch cleanup 403-blocked.
- **2026-08-01 (evening / morning) — Twice-daily check-ins (`claude-opus-4-8`):** All green, nothing changed
  except VBFH Daily Run firing green (08-01 13:35 UTC ✅; 07-31 14:17 UTC ✅). #197 draft held; #29 closed.
- **2026-07-31 (evening / morning) — Twice-daily check-ins (`claude-opus-4-8`):** All green. Only change:
  VBFH Daily Run 07-31 14:17 UTC ✅ / 07-30 14:10 UTC ✅. Default branches unchanged.
- **2026-07-30 — merge waves (`claude-fable-5`):** Merged amma **#162/#189/#180/#161/#196** and
  EscapeTheBomb **#1** and vbfh **#7**; opened draft #197; closed #168 and vbfh #4 as superseded.
- _(Older entries 07-18 → 07-30 retained in git history; trimmed here for length.)_
