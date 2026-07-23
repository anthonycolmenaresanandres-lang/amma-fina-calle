# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-07-23 (morning twice-daily check-in — **everything green, nothing red anywhere, no code action needed.** Since the 07-22 evening run Anthony merged a wave of Bodega-menu-review PRs — **#175, #176, #178, #179** (live `/bodega-menu-review` route, mobile polish, single-seal identity, and one-shot logo rhythm/cup-beat) — all post-merge `CI — web` ✅, main tip `ad9773a`. New draft **#177** (Bodega route-line motion) appeared but now **conflicts** with those merges. **VBFH Daily Run stays GREEN** (last scheduled 07-22 14:04 UTC ✅; today's ~14:00 UTC run not yet fired at check time). No red builds, no human review comments. Caretaker took no code action beyond this dashboard.)
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets) still wait for Anthony's explicit go-ahead.
**Caretaker model:** pinned to **Opus 4.8** (`/model` is a CLI command, not runnable from the shell in this env; ran as configured `claude-opus-4-8`). Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

1. **(Optional) Add the 5 VBFH email secrets so you actually RECEIVE the daily email.**
   The Daily Run is green and staying green — it no longer fails on missing SMTP config. But it still
   won't *send* you anything until the secrets exist. Add them in vbfh-media-engine → Settings → Secrets
   and variables → Actions → `EMAIL_TO`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (optional
   Variables `SMTP_PORT` default 587, `SMTP_SECURE` `true` only for port 465). Tell me your mail provider
   and I'll give you the exact host/port. (Same secrets ask as PR #4.)
2. **Review & merge PR #161 (Add ethical sales conversion system)** — your call. Evidence-first AMMA
   sales-conversion skill + scripts, routed through the business router. Build/Vercel **green**, touches
   no guardrail routes, but it's a substantive new feature — open the Vercel preview and merge when happy.
3. **PR #168 (amma) — review the grant-application draft, then submit it yourself.**
   `BUSINESS/GRANT_APPLICATION_DEV_PC.md` — a paste-ready ~$1,900 dev-PC grant application. Draft, Vercel
   **green**, no code/guardrail routes. Nothing is auto-submitted. NOTE: its branch also carries the old
   screenshot-trap decoy commits that are now obsolete; if you ever merge #168, take only the grant-app doc.
4. **✅ DONE — closed #169, #173, and #177** (2026-07-23, per your go-ahead). All three were
   superseded drafts: #169/#173 screenshot-trap heroes (fully reverted on `main` via #170→#171→#172→#174);
   #177 Bodega route-line motion (superseded by the merged #178/#179 rhythm, and conflicting). Each closed
   with a one-line reason comment.
4b. **⛔ Branch cleanup BLOCKED — needs you to run it (or approve deletion).** You asked to clean the
   branches. I identified the safe-to-delete set (below), but this environment's safety classifier blocks
   automated branch deletion (`git push --delete`) in auto mode, and there's no branch-delete API tool. So
   the 11 stale branches are still there. **Two ways to clear them:** (a) paste the two commands in the
   "Branch cleanup — ready to run" section below, or (b) reply "you have permission to delete branches" and
   I'll retry. I will NOT delete anything until one of those.
5. **PR #4 (vbfh) — confirm the "Claude QA's the images before emailing" routine.** The code half is
   done and green; held as draft. Beyond the SMTP secrets (item 1), it asks you to confirm the separate
   scheduled-QA routine before that piece gets built.
6. **PR #162 (owner portal installable) — your explicit go-ahead needed.** Draft, green. Adds an
   installable web-app manifest + icons to `/owner/[id]`. Sits on a **protected owner route**, so it stays
   a hard-guardrail item — not caretaker-mergeable.
7. **(If not already done) Run the Marbel admin SQL in Supabase.** From #150: Supabase SQL editor →
   run `0009_admin_team_update.sql` (or `supabase db push`) to grant `marbeljsiado@gmail.com` admin.
   I can't see Supabase state from here — skip this if you already ran it.
8. **Optional:** say "clean the merged branches" to delete the growing set of provably-merged branches.

_Resolved / no action:_ **Bodega menu-review wave merged by Anthony** — **#175** (live `/bodega-menu-review`
route, 07-22 22:18), **#176** (mobile polish, 07-22 22:29), **#178** (single-seal identity + rhythm,
07-23 11:35), **#179** (cup beat + disappearing gold flash, 07-23 12:18); all post-merge `CI — web` ✅,
main tip `ad9773a`. Additive unlinked/noindex owner-review route — no guardrail routes, DB, billing, or
secrets touched. **#174 merged** (07-22) — watermark saga stays closed. **VBFH Daily Run stays GREEN**
(07-22 14:04 UTC ✅). **#29 stays closed** (07-18). shadow-engineer-rpa dormant (07-09).

---

## Build health (as of 2026-07-23, morning)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip `ad9773a` (**#179**, "Add Bodega cup beat and disappearing gold flash"); latest `CI — web` ✅ (2026-07-23 12:18 UTC). Bodega-review wave #175/#176/#178/#179 all merged green since the evening run. voice-gateway CI path-filtered, last run ✅ (no voice changes since 07-09). |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" scheduled | CI ✅ on master (`CI` #20, 2026-07-22 02:08 UTC); master tip `fec7266` (**#6**, "Fail closed on missing scheduled league data"). **VBFH Daily Run — GREEN.** Latest scheduled run **07-22 14:04 UTC succeeded** (07-21 14:01 also ✅) — the email-gate fix holds (`skipped_config_missing` non-fatal; a real SMTP `failed` still fails). Today's ~14:00 UTC scheduled run had not yet fired at check time. Content pipeline completes (`needs_review`, `gamesFound:0` = known DaySmart standings-only limitation, not a regression). |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · no workflows (0 runs) · last commit 2026-07-09 |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | Draft PR #1 (M1 scaffolds), tip `bb0eea8`, unchanged since 07-20; nothing to build in cloud |

## Open PRs

- **amma #161 — Add ethical sales conversion system** (open, **green**, no guardrail routes).
  Awaiting Anthony's review/merge (item 2). Bot comments only; no human review comments.
- **amma #168 — grant application draft (dev PC)** (open **draft**, Vercel **green**). Docs-only grant
  doc; branch also carries now-obsolete decoy commits (item 3). Bot comments only.
- **amma #169 — the Screenshot Trap decoy masthead** (open **draft**, Vercel **green**). **Superseded**
  — recommend closing (item 4). Bot comment only.
- **amma #173 — the Screenshot Trap two-message hybrid hero** (open **draft**, **green** — `web` ✅ +
  Vercel ✅). New since last run; another screenshot-trap variant, **superseded** by #174's watermark
  removal — recommend closing (item 4). Vercel bot comment only, no human review.
- **amma #177 — Animate Bodega route rhythm** (open **draft**, **conflicts** — `mergeable_state: dirty`).
  New since last run. Bodega route-line motion preview; **#178/#179 merged the Bodega rhythm/cup-beat**
  after it opened, so its base is stale and it now conflicts. Rebase-or-close, Anthony's call (item 4b).
  Vercel bot comment only, no human review.
- **amma #162 — Make owner portal installable** (open **draft**, CI **green** — `web` ✅ + Vercel ✅).
  Protected `/owner/[id]` route → hard-guardrail item for Anthony (item 6).
- **vbfh #4 — email a copy-paste-ready post package** (open **draft**, CI **green** — `check` ✅).
  Held pending Anthony's SMTP secrets + QA-routine confirmation (items 1 & 5). No guardrail routes.
- **EscapeTheBomb-DC #1 — M1 master plan + P5–P8 scaffolds** (open **draft**, no CI). Unchanged since
  07-20; not "green" until the M2 Windows compile-verify gate. Never merged without Anthony.
- No open PRs in shadow-engineer-rpa.

## Merged / closed since last run

- **Nothing new merged or closed since the morning run** (07-22). No new PRs, no new commits on any
  default branch, no new human review comments (only Vercel bot on #161/#168/#169/#173).
- Prior-run context still current: **amma #174 merged to `main`** (07-22 00:02, "Remove global AI use
  notice", reverts #172; main tip `b36a0af`). vbfh master tip `fec7266` (#6). EscapeTheBomb #1 unchanged
  since 07-20; shadow dormant (07-09). #29 stays closed.

## Branch cleanup — ready to run (2026-07-23)

Anthony gave the go-ahead ("clean branches please"), but this environment's safety classifier blocks
automated branch deletion, so the commands below are ready for Anthony to paste (or to authorize the
caretaker to retry). Every branch listed is either **provably merged** or a **just-closed superseded**
draft. **Verified KEEP (do NOT delete):** `main`, `automation/status`, the `claude/*` caretaker working
branch, and all open-PR heads — amma `codex/ethical-sales-conversion-20260718` (#161),
`codex/owner-portal-app-20260718` (#162), `claude/escape-bomb-dc-plan-n6bfj5` (#168); vbfh
`claude/pensive-edison-sove8x` (#4 head). Old June `voice/twiml-stream-fallback` /
`voice/vbfh-tester-171128` are NOT merged — left for Anthony's judgment. EscapeTheBomb `codex/*` +
`phase2`–`phase7` are unmerged exploration — left in place.

**amma-fina-calle** (4 merged + 3 closed-superseded):
```
git -C amma-fina-calle push origin --delete \
  codex/free-video-game-visuals-20260718 codex/free-visual-toolkit-20260718 \
  codex/small-model-skill-selector-20260718 ops/data-center-docs \
  claude/screenshot-trap-landing claude/screenshot-trap-live agent/bodega-line-motion-20260722
```
**vbfh-media-engine** (4 merged):
```
git -C vbfh-media-engine push origin --delete \
  claude/pensive-edison-hl5sxo claude/build-automation-management-sh68i3 \
  feat/facility-info claude/vbfh-broadcast-instagram-e6p75v
```

## Run log

- **2026-07-23 (midday) — Owner request "close all that need closing + clean branches" (`claude-opus-4-8`):**
  **Closed the 3 superseded drafts — #169, #173, #177** (each with a one-line reason comment). Built the
  verified branch-cleanup set (11 branches: 7 amma [4 provably-merged + 3 just-closed-superseded] + 4 vbfh
  provably-merged) and confirmed the KEEP list against every open-PR head. **Branch deletion itself was
  blocked by the env safety classifier** (`git push --delete` denied in auto mode; no branch-delete API
  tool) — did NOT delete anything. Left ready-to-run commands in "Branch cleanup — ready to run" above;
  awaiting Anthony to run them or authorize a retry. No merges, no guardrail changes.
- **2026-07-23 (morning) — Twice-daily check-in (`claude-opus-4-8`):** **Checked, all green, no code
  action needed.** Since the evening run Anthony merged the **Bodega menu-review wave** to `main` —
  **#175** (live unlinked/noindex `/bodega-menu-review` route), **#176** (390px mobile polish), **#178**
  (single circular seal identity + logo-internal rhythm), **#179** (one-shot cup beat + disappearing gold
  flash) — every post-merge `CI — web` ✅, main tip now `ad9773a`. Additive owner-review route only; no
  guardrail routes, DB, billing, or secrets. A new draft **#177** (Bodega route-line motion) appeared but
  now **conflicts** (`dirty`) because #178/#179 shipped overlapping rhythm work after it opened — flagged
  rebase-or-close (item 4b). **VBFH Daily Run stays GREEN** (07-22 14:04 UTC ✅; today's ~14:00 UTC run
  not yet fired at check time) and `CI` ✅ on master. All open-PR checks green except #177's conflict
  (#161/#162/#168/#169/#173 web/Vercel ✅; vbfh #4 `check` ✅). EscapeTheBomb #1 unchanged (07-20); shadow
  dormant (07-09). No new human review comments. No branches deleted (awaiting go-ahead).
- **2026-07-22 (evening) — Twice-daily check-in (`claude-opus-4-8`):** **Checked, all green, no code
  action needed — nothing changed since the morning run.** Today's **VBFH Daily Run (07-22 14:04 UTC)
  succeeded** (run `29926831318`), confirming #6's "fail closed on missing scheduled league data" change
  didn't break the scheduled run. amma `main` unchanged (tip `b36a0af`, `CI — web` ✅); vbfh `CI` ✅ on
  master (tip `fec7266`, #6). All open-PR checks still green (#161/#162/#168/#169/#173 web/Vercel ✅;
  vbfh #4 `check` ✅). No new merges/PRs/commits/human-review-comments across any of the four repos.
  EscapeTheBomb #1 unchanged (07-20); shadow dormant (07-09). No branches deleted (awaiting go-ahead).
- **2026-07-22 (morning) — Twice-daily check-in (`claude-opus-4-8`):** **Checked, all green, no code
  action needed.** Since last run Anthony merged **#174** (removed the global AI-use watermark, reverting
  #172) — post-merge `CI — web` ✅ #58, main tip `b36a0af`; the screenshot-trap/watermark saga is now fully
  wound back to the plain hero. A new stale draft **#173** (screenshot-trap two-message hybrid hero, green)
  appeared and is **superseded** by that removal — flagged #169 **and** #173 for closing. vbfh **Daily Run
  stays GREEN** (last run 07-21 14:01 UTC ✅) and `CI` ✅ on master (#19). All open-PR checks green
  (#161/#162/#168/#169/#173 web/Vercel ✅; vbfh #4 `check` ✅). EscapeTheBomb #1 unchanged (07-20); shadow
  dormant (07-09). No new human review comments. No branches deleted (awaiting go-ahead).
- **2026-07-21 (evening) — Twice-daily check-in (`claude-opus-4-8`):** **Checked, all green, no code
  action needed.** **VBFH Daily Run recovered** — the 07-21 14:01 UTC scheduled run **succeeded** (first
  green since 07-19), confirming PR #5's email-gate fix in production. amma `main` advanced: Anthony merged
  **#170→#171→#172** (screenshot trap shipped, then hero restored + AI-crawler controls, then visible
  AI-use notice); post-merge `CI — web` ✅ at each, tip `f70928d`. All open-PR checks green (#161, #162,
  #168, #169 web/Vercel ✅; vbfh #4 `check` ✅). Flagged **#169 as superseded** (recommend close) and
  noted #168's branch carries obsolete decoy commits. vbfh `CI` ✅ (`17d479e`); EscapeTheBomb #1 unchanged
  (07-20); shadow dormant (07-09). No new human review comments. No branches deleted (awaiting go-ahead).
- **2026-07-21 (morning) — Twice-daily check-in (`claude-opus-4-8`):** **Acted:** verified vbfh PR #5
  end-to-end, confirmed CI ✅ + `mergeable_state: clean` + no guardrail routes, and **squash-merged it to
  master** (`17d479e`) to stop the VBFH Daily Run failing on the missing-SMTP gate. **Checked, no action:**
  all other builds green. Refreshed this dashboard. No branches deleted.
- **2026-07-20 (evening) — Twice-daily check-in (`claude-opus-4-8`):** VBFH Daily Run still red (07-20
  14:14 UTC, same by-design email gate). **Opened draft PR #5 (vbfh)** treating `skipped_config_missing`
  as non-fatal. **amma #168 opened** (draft grant doc). **EscapeTheBomb #1** advanced with 07-20 commits.
  All other builds green. shadow dormant (07-09). No branches deleted.
- **2026-07-20 (morning) — Twice-daily check-in (Opus 4.8):** VBFH Daily Run still red (07-19 gate).
  **#165/#166/#167 merged to `main`** by Anthony, post-merge `CI — web` ✅ at `10be3ef`. EscapeTheBomb #1
  advanced. All other builds green. No branches deleted.
- **2026-07-19 (evening) — Twice-daily check-in (Opus 4.8):** VBFH Daily Run still red. **#164 merged to
  `main`**, post-merge `CI — web` ✅ at `d13642b`. All other builds green. No branches deleted.
- **2026-07-19 (midday) — Twice-daily check-in (Opus 4.8):** One red build (VBFH Daily Run), diagnosed
  end-to-end. **#163 merged to main by Anthony.** All other builds green. No branches deleted.
- **2026-07-18 (evening) — Twice-daily check-in (Opus 4.8):** All four repos green. **vbfh #4 opened**
  (draft daily-email post package) + 5 green pushes to vbfh master. **EscapeTheBomb #1** got more M1
  scaffold commits. Refreshed this dashboard. No branches deleted.
- **2026-07-18 (morning) — Twice-daily check-in (Opus 4.8):** All four repos green. **#29 closed** by
  Anthony, **#161 opened** (green; left for Anthony). No red builds. No branches deleted.
- **2026-07-09 — Post-merge CI verified (Opus 4.8 check-in):** main green after #136 + #150 merges. No action.
- **2026-07-09 — #150 + #136 merged (Anthony approved):** Marbel `0009` admin migration + voice SoundGate
  PR; re-verified. Closed old #5.
- **2026-07-09 — Merge waves 1 & 2 + Opus pin.** Merged the ready/docs/product set across amma + vbfh;
  recreated the caretaker Routine pinned to Opus 4.8. Post-merge CI verified green.
- **2026-07-08 — Setup run.** Surveyed 4 repos + GitHub + Vercel; added CI to amma + vbfh; fixed lint;
  triaged all open PRs; built branch-cleanup lists; stood up the twice-daily caretaker.
