# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-07-18 (twice-daily check-in — all repos green)
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets) still wait for Anthony's explicit go-ahead.
**Caretaker model:** pinned to **Opus 4.8**. Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

1. **Review & merge PR #161 (Add ethical sales conversion system)** — your call. It's a fresh
   Codex feature PR (37 files, +910/−111): an evidence-first AMMA sales-conversion skill + scripts,
   routed through the business router. Build/Vercel are **green** and it touches no guardrail routes,
   but it's a substantive new feature you just opened, so I left the merge to you. Open the Vercel
   preview, and merge when happy.
2. **(If not already done) Run the Marbel admin SQL in Supabase.** From #150: Supabase SQL editor →
   run `0009_admin_team_update.sql` (or `supabase db push`) to actually grant `marbeljsiado@gmail.com`
   admin. I can't see Supabase state from here — skip this if you already ran it.
3. **Before the first live phone call on the voice build:** re-verify the OpenAI Realtime event
   names still match (repo standing note); go-live is otherwise gated by your `OPENAI_API_KEY` + Twilio number.
4. **Optional:** say "clean the merged branches" to delete the growing set of provably-merged branches
   (now also includes the #157–#160 toolkit/skill branches).

_Resolved since last run:_ **PR #29 (AI Request Desk) — you closed it on 2026-07-18.** No longer a
pending decision; removed from this list.

---

## Build health (as of 2026-07-18)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — `CI — web` ✅ through 2026-07-18 (latest `422352b`). voice-gateway CI path-filtered, last run ✅ |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" scheduled | CI ✅ · **VBFH Daily Run ✅** every morning incl. 2026-07-18 05:59 UTC |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | Dormant · no open PRs |

## Open PRs

- **amma #161 — Add ethical sales conversion system** (open, **green**, `mergeable_state: clean`).
  Awaiting Anthony's review/merge (see "what I need from you" #1). No CI failures; only the Vercel bot comment.
- No open PRs in vbfh-media-engine, shadow-engineer-rpa, or EscapeTheBomb-DC.

## Merged / closed since last run (2026-07-09 → 2026-07-18)

amma merged to main (all CI-green): **#157** (free visual design toolkit), **#158** (video/game visual
toolkit), **#159** (record video/game toolkit publication), **#160** (small-model + AMMA business skill
routing). Plus a run of owner-merged Clone commits: owner-portal password policy + first-login reset,
four-character onboarding standard, `feat(billing)` Colattao activation + Supabase secret-key support,
and Stripe/Supabase ops-record docs. amma **closed (not merged): #29** (AI Request Desk — Anthony's call).

No new merges in vbfh, shadow-engineer-rpa, or EscapeTheBomb-DC.

## Branch cleanup — awaiting one-click approval

Still awaiting Anthony's "clean the merged branches" go-ahead (never deleted unprompted). The prior
provably-merged amma list stands, now extended by the merged branches behind #157–#160
(`codex/free-visual-toolkit-20260718`, `codex/free-video-game-visuals-20260718`,
`codex/small-model-skill-selector-20260718`). Keep active: `automation/status` (this dashboard) and
the four `claude/*-sove8x` caretaker working branches.

**vbfh-media-engine:** `claude/build-automation-management-sh68i3`, `feat/facility-info`,
`claude/vbfh-broadcast-instagram-e6p75v` — all merged, safe to delete.
**EscapeTheBomb-DC:** `codex/*` exploration set + `phase2`–`phase7` ladder — none merged by commit.

## Run log

- **2026-07-18 — Twice-daily check-in (Opus 4.8):** All four repos green. VBFH Daily Run ✅
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
