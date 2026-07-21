# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-07-21 (evening twice-daily check-in — **VBFH Daily Run is now GREEN**: the 07-21 14:01 UTC scheduled run succeeded, confirming the PR #5 email-gate fix works. Nothing red anywhere; caretaker took no code action this run beyond this dashboard.)
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets) still wait for Anthony's explicit go-ahead.
**Caretaker model:** pinned to **Opus 4.8** (`/model` is a CLI command, not runnable from the shell in this env; ran as configured `claude-opus-4-8`). Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

1. **(Optional) Add the 5 VBFH email secrets so you actually RECEIVE the daily email.**
   The Daily Run is green again — it no longer fails on missing SMTP config. But it still won't *send*
   you anything until the secrets exist. Add them in vbfh-media-engine → Settings → Secrets and variables
   → Actions → `EMAIL_TO`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (optional Variables
   `SMTP_PORT` default 587, `SMTP_SECURE` `true` only for port 465). Tell me your mail provider and I'll
   give you the exact host/port. (Same secrets ask as PR #4.)
2. **Review & merge PR #161 (Add ethical sales conversion system)** — your call. Evidence-first AMMA
   sales-conversion skill + scripts, routed through the business router. Build/Vercel **green**, touches
   no guardrail routes, but it's a substantive new feature — open the Vercel preview and merge when happy.
3. **PR #168 (amma) — review the grant-application draft, then submit it yourself.**
   `BUSINESS/GRANT_APPLICATION_DEV_PC.md` — a paste-ready ~$1,900 dev-PC grant application. Draft, Vercel
   **green**, no code/guardrail routes. Nothing is auto-submitted. NOTE: its branch also carries the old
   screenshot-trap decoy commits that are now obsolete (the screenshot-trap effort concluded via merged
   #170→#171→#172); if you ever merge #168, take only the grant-app doc.
4. **PR #169 (amma) — likely close it; it's superseded.** "Screenshot Trap landing" (draft). The whole
   screenshot-trap experiment already played out on `main`: #170 shipped it, #171 restored the hero and
   removed the failed decoy, #172 added the visible AI-use notice. #169 is now stale. I left it open (it's
   your draft — I don't close your PRs unprompted); say the word and I'll close it.
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

_Resolved / no action:_ **VBFH Daily Run recovered** — first green scheduled run (07-21 14:01 UTC) since
the 07-19 breakage, confirming PR #5. **#29 stays closed** (Anthony, 07-18). **#170/#171/#172 merged by
Anthony** (07-21 evening) — the screenshot-trap saga is settled on `main`. shadow-engineer-rpa dormant (07-09).

---

## Build health (as of 2026-07-21, evening)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip `f70928d` (**#172**, "global screenshot-visible AI use notice"); latest `CI — web` ✅ (2026-07-21 20:26 UTC), also ✅ at #171 `fddc89d` and #170 `dd09786`. voice-gateway CI path-filtered, last run ✅ (no voice changes since 07-09). |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" scheduled | CI ✅ on master (`17d479e`). **VBFH Daily Run — GREEN.** The 07-21 14:01 UTC scheduled run **succeeded** — first green run since 07-19, confirming the PR #5 email-gate fix (`skipped_config_missing` now non-fatal; a real SMTP `failed` still fails). Content pipeline completes (`needs_review`, `gamesFound:0` = known DaySmart standings-only limitation, not a regression). |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · no workflows · last commit 2026-07-09 |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | Draft PR #1 (M1 scaffolds), tip `bb0eea8`, unchanged since 07-20; nothing to build in cloud |

## Open PRs

- **amma #161 — Add ethical sales conversion system** (open, **green**, no guardrail routes).
  Awaiting Anthony's review/merge (item 2). Bot comments only; no human review comments.
- **amma #168 — grant application draft (dev PC)** (open **draft**, Vercel **green**). Docs-only grant
  doc; branch also carries now-obsolete decoy commits (item 3). Bot comments only.
- **amma #169 — Screenshot Trap landing** (open **draft**, Vercel **green**). **Superseded** by the
  merged #170→#171→#172 sequence on `main`; recommend closing (item 4). Bot comment only.
- **amma #162 — Make owner portal installable** (open **draft**, CI **green** — `web` ✅ + Vercel ✅).
  Protected `/owner/[id]` route → hard-guardrail item for Anthony (item 6).
- **vbfh #4 — email a copy-paste-ready post package** (open **draft**, CI **green** — `check` ✅).
  Held pending Anthony's SMTP secrets + QA-routine confirmation (items 1 & 5). No guardrail routes.
- **EscapeTheBomb-DC #1 — M1 master plan + P5–P8 scaffolds** (open **draft**, no CI). Unchanged since
  07-20; not "green" until the M2 Windows compile-verify gate. Never merged without Anthony.
- No open PRs in shadow-engineer-rpa.

## Merged / closed since last run

- **amma #170, #171, #172 all merged to `main` by Anthony** (07-21 evening): #170 shipped the Screenshot
  Trap + AI-defense watermark (19:25), #171 restored the homepage hero and added `/robots.txt` + `/llms.txt`
  AI-crawler controls, removing the failed decoy (19:54), #172 added a visible screenshot-OCR AI-use notice
  (20:26). Post-merge `CI — web` ✅ at each step; main tip now `f70928d`.
- No other new merges: vbfh master unchanged since #5 (`17d479e`); EscapeTheBomb #1 unchanged since 07-20;
  shadow dormant (07-09). #29 stays closed (07-18).
- No new human review comments on any open PR (only Vercel bot on #161/#168/#169).

## Branch cleanup — awaiting one-click approval

Still awaiting Anthony's "clean the merged branches" go-ahead (never deleted unprompted). Prior
provably-merged amma list stands, now extended by the branches behind merged #170–#172. Keep active:
`automation/status` (this dashboard) and the current `claude/*` caretaker working branches. The
`voice/twiml-stream-fallback` and `voice/vbfh-tester-171128` branches are old (June, pre-#141) — leave for
Anthony to judge, not on the auto-clean list.

**vbfh-media-engine:** `claude/build-automation-management-sh68i3`, `feat/facility-info`,
`claude/vbfh-broadcast-instagram-e6p75v`, `claude/pensive-edison-hl5sxo` (PR #5) — all merged, safe to delete.
**EscapeTheBomb-DC:** `codex/*` exploration set + `phase2`–`phase7` ladder — none merged by commit.

## Run log

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
