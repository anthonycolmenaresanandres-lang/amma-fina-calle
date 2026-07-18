# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-07-18 (evening twice-daily check-in — all repos green)
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets) still wait for Anthony's explicit go-ahead.
**Caretaker model:** pinned to **Opus 4.8**. Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

1. **vbfh PR #4 — turn the daily email on (add SMTP secrets) + confirm the QA-routine plan.** New
   draft PR ("email a copy-paste-ready post package after each VBFH Daily Run"). Code is done and
   **green**, but no email will actually arrive until you add these in **vbfh-media-engine → Settings →
   Secrets and variables → Actions**: `EMAIL_TO`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
   (optional vars `SMTP_PORT`, `SMTP_SECURE`). The PR also asks you to confirm the separate "Claude QA's
   the images before emailing" routine before that half gets built. Kept as draft for your go-ahead.
2. **Review & merge PR #161 (Add ethical sales conversion system)** — your call. Evidence-first AMMA
   sales-conversion skill + scripts, routed through the business router. Build/Vercel **green**, touches
   no guardrail routes, but it's a substantive new feature — open the Vercel preview and merge when happy.
3. **(If not already done) Run the Marbel admin SQL in Supabase.** From #150: Supabase SQL editor →
   run `0009_admin_team_update.sql` (or `supabase db push`) to grant `marbeljsiado@gmail.com` admin.
   I can't see Supabase state from here — skip this if you already ran it.
4. **Before the first live phone call on the voice build:** re-verify the OpenAI Realtime event
   names still match (repo standing note); go-live is otherwise gated by your `OPENAI_API_KEY` + Twilio number.
5. **Optional:** say "clean the merged branches" to delete the growing set of provably-merged branches
   (includes the #157–#160 toolkit/skill branches).

_Resolved earlier today:_ **PR #29 (AI Request Desk) — you closed it on 2026-07-18.** No longer a
pending decision.

---

## Build health (as of 2026-07-18, evening)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — `CI — web` ✅ through 2026-07-18 (latest `422352b`). voice-gateway CI path-filtered, last run ✅ |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" scheduled | CI ✅ · master got **5 direct green pushes today** (Instagram-ready summaries, results-accuracy + standings hardening, delivery-proof docs). **VBFH Daily Run ✅** incl. 2026-07-18 05:59 UTC |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · last commit 2026-07-09 |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | Draft PR #1 (M1 scaffolds) landing incrementally; nothing to build in cloud |

## Open PRs

- **vbfh #4 — email a copy-paste-ready post package after each VBFH Daily Run** (open **draft**, CI
  **green** — `check` ✅). Additive: turns the email on in `daily.yml` + reworks the email into per-league
  copy-paste captions with inline images. Held as draft pending Anthony's SMTP secrets + QA-routine
  confirmation (see "what I need from you" #1). No guardrail routes touched.
- **amma #161 — Add ethical sales conversion system** (open, **green**, `mergeable_state: clean`).
  Awaiting Anthony's review/merge (item #2). No CI failures; only the Vercel bot comment.
- **amma #162 — Make owner portal installable** (open **draft**, CI **green** — `web` ✅ + Vercel ✅).
  Touches `/owner/[id]` metadata + manifest/icons only (no auth/DB/payments change per its notes), but
  it's on the protected owner route, so it stays a **hard-guardrail item** for Anthony — not caretaker-mergeable.
- **EscapeTheBomb-DC #1 — M1 master plan + P5–P8 scaffolds** (open **draft**, no CI). Authored without
  Unreal; not "green" until the M2 Windows compile-verify gate. Never merged without Anthony.
- No open PRs in shadow-engineer-rpa.

## Merged / closed since last run

- No new **PR** merges this window. amma main unchanged since the morning run (tip still `422352b`, #160).
- **vbfh master** advanced via 5 direct owner pushes (not PRs), all CI-green — see build health.
- Earlier today (morning run, already logged): amma merged **#157–#160** (visual/video-game toolkits +
  small-model/business routing); amma **closed (not merged) #29**.
- No merges in shadow-engineer-rpa or EscapeTheBomb-DC.

## Branch cleanup — awaiting one-click approval

Still awaiting Anthony's "clean the merged branches" go-ahead (never deleted unprompted). The prior
provably-merged amma list stands, extended by the merged branches behind #157–#160
(`codex/free-visual-toolkit-20260718`, `codex/free-video-game-visuals-20260718`,
`codex/small-model-skill-selector-20260718`). Keep active: `automation/status` (this dashboard) and
the current `claude/*` caretaker working branches.

**vbfh-media-engine:** `claude/build-automation-management-sh68i3`, `feat/facility-info`,
`claude/vbfh-broadcast-instagram-e6p75v` — all merged, safe to delete.
**EscapeTheBomb-DC:** `codex/*` exploration set + `phase2`–`phase7` ladder — none merged by commit.

## Run log

- **2026-07-18 (evening) — Twice-daily check-in (Opus 4.8):** All four repos green; no red builds,
  nothing to fix. New since the morning run: **vbfh #4 opened** (draft, daily-email post package —
  CI green, needs Anthony's SMTP secrets + QA-routine confirmation) and **5 green direct pushes to
  vbfh master** (Instagram-ready daily summaries, results/standings accuracy hardening, delivery-proof
  docs). **EscapeTheBomb #1** got more incremental M1 scaffold commits (still draft, no cloud build).
  amma main unchanged (`422352b`). Verified amma `CI — web`/`voice-gateway`, vbfh `CI`, and VBFH Daily
  Run all ✅. Refreshed this dashboard. No branches deleted.
- **2026-07-18 (morning) — Twice-daily check-in (Opus 4.8):** All four repos green. VBFH Daily Run ✅
  (2026-07-18 05:59 UTC, success all week). amma `CI — web` green on main through `422352b`.
  Found **#29 closed** by Anthony (removed from pending decisions) and **#161 opened** (green; left for
  Anthony to merge — fresh feature PR, no guardrail routes). Logged the #157–#160 merges + owner-portal/
  billing Clone commits. No red builds; nothing to fix. Refreshed this dashboard. No branches deleted.
- **2026-07-09 — Post-merge CI verified (Opus 4.8 check-in):** main green after the #136 + #150
  merges — voice-gateway typecheck ✅ (commit 344a2ec), web build ✅ (commit c1a369d). No action.
  (Marbel access still pending Anthony running the SQL in Supabase.)
- **2026-07-09 — #150 + #136 merged (Anthony approved):** Merged the Marbel `0009` admin migration
  (#150) and the voice SoundGate PR (#136). Before merging #136 did the requested cleanup: real
  `response.cancel` on barge-in (activeResponse tracking) + gated the barge-in stat to genuine
  interruptions; README updated; `tsc` + 48/48 simulate re-verified. Closed #5 (superseded by #150).
- **2026-07-09 — #5 prepped as #150 + #136 rebased.** Recreated the admin migration at slot `0009`;
  rebased #136 onto main keeping main's GA realtime + tuned server_vad + language lock, porting the
  SoundGate debounce + telemetry; dropped semantic_vad-default / allowLanguageSwitch + branch cruft.
- **2026-07-09 — Merge waves 1 & 2 + Opus pin.** Merged the ready/docs/product set across amma + vbfh;
  recreated the caretaker Routine pinned to Opus 4.8. Post-merge CI verified green.
- **2026-07-08 — Setup run.** Surveyed 4 repos + GitHub + Vercel; added CI to amma + vbfh; fixed lint;
  triaged all open PRs; built branch-cleanup lists; stood up the twice-daily caretaker.
