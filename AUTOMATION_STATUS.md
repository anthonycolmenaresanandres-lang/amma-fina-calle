# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-07-09 (#150 Marbel + #136 voice merged)
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets) still wait for Anthony's explicit go-ahead.
**Caretaker model:** pinned to **Opus 4.8**. Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

1. **Run the Marbel admin SQL in Supabase.** PR #150 merged the migration file, but access is
   NOT granted until you run it: Supabase SQL editor → run `0009_admin_team_update.sql`, or
   `supabase db push`. (One-time; adds `marbeljsiado@gmail.com` as a full admin.)
2. **Before the first live phone call on the new voice build:** re-verify the OpenAI Realtime
   event names still match (repo standing note) — go-live is otherwise gated by your
   `OPENAI_API_KEY` + Twilio number.
3. **Decide PR #29** (AI Request Desk): adopt (I rebase + re-verify) or close. It touches the
   protected `/owner/[id]` route + Supabase, so it's your call.
4. **Optional:** say "clean the merged branches" to delete the ~29 provably-merged branches.

---

## Build health (as of 2026-07-09)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main green through the merge wave; #136 voice + #150 migration just merged (post-merge CI check armed) |
| vbfh-media-engine | CI on master (lint + 185 tests); Daily Run untouched | CI ✅ · Daily Run ✅ all week |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant since 2026-06-21, clean |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | Dormant since 2026-06-23 |

## Everything merged / closed on 2026-07-09

amma merged: #149 (CI+dashboard), #142 (voice fallback), #100 (/news), #147 (VBFH knowledge),
#148, #36, #17 (docs), #115 (Bandstand), **#150 (Marbel admin `0009`)**, **#136 (voice SoundGate,
post-review cleanup)**. amma closed: #131, #24, #5 (superseded by #150).
vbfh merged: #3 (CI), #2 (facility endpoint), #1 (broadcast + Instagram).

**Only open PR left: amma #29** (see "what I need from you" #3).

> #136 shipped: SoundGate barge-in debounce + turn telemetry, and a post-review cleanup —
> real `response.cancel` on barge-in (was an overclaim) and interruption stats gated to genuine
> interruptions (normal turns no longer inflate them). Kept main's tuned `server_vad` + language
> lock; `semantic_vad`-default / `allowLanguageSwitch` left as proposed. `tsc` + 48/48 simulate green.
> #1 (vbfh Instagram): merged code posts nothing until you add IG secrets + dispatch the workflow.

## Branch cleanup — awaiting one-click approval

**amma-fina-calle — provably merged into main, safe to delete now** (survey set + today's merged
branches incl. `claude/ai-assistance-idea-check-t2d0xz` #136, `claude/admin-team-migration-0009` #150):
`claude/build-automation-management-sh68i3`, `voice/twiml-stream-fallback`, `claude/news-page`,
`claude/explanation-utilization-planning-rxu4vr`, `claude/anchorframe-daily-plan-aj7jmr`,
`claude/project-review-income-1WASn`, `codex/colattanini-campaign-plan`, `claude/player-sticker-replacement-8chwzf`,
`claude/vbfh-broadcast-instagram-e6p75v`, `codex/colattao-owner-polish`, `docs/voice-personalities-runbook`,
`feat/call-timing-warm-bookends`, `feat/colattao-info-line`, `feat/vbfh-info-line`,
`feat/voice-gateway-realtime-ga`, `feat/voice-quality-tuning`, `fix/render-blueprint-paths`,
`voice/colattao-tester`, `voice/colattao-tester-073433`, `voice/field-house-tester`,
`voice/natural-turn-taking`, `voice/original-barge-in-plus-noise-reduction`,
`voice/realtime-model-hotfix`, `voice/realtime-probe`, `voice/remove-noise-reduction-hotfix`,
`voice/restore-barge-in`, `voice/runtime-diagnostics`, `voice/session-probe`, `voice/vbfh-tester-171128`.
Keep active: `automation/status` (this dashboard).
- **~50 unmerged, no open PR** — mostly squash-merged `claude/penalty-*` / `claude/colattanini-*` /
  `claude/kicker-*`; delete after a spot-check (double-check `feat/owner-dashboard-premium`,
  `fix/auth-confirm-verify-types`, `fix/owner-login-token-hash`, `claude/burger-plus-*`).

**vbfh-media-engine:** `claude/build-automation-management-sh68i3`, `feat/facility-info`,
`claude/vbfh-broadcast-instagram-e6p75v` — all merged, safe to delete.
**EscapeTheBomb-DC:** `codex/*` exploration set + `phase2`–`phase7` ladder — none merged by commit.

## Run log

- **2026-07-09 — #150 + #136 merged (Anthony approved):** Merged the Marbel `0009` admin migration
  (#150) and the voice SoundGate PR (#136). Before merging #136 did the requested cleanup: real
  `response.cancel` on barge-in (activeResponse tracking) + gated the barge-in stat to genuine
  interruptions; README updated; `tsc` + 48/48 simulate re-verified. Closed #5 (superseded by #150).
  Access grant still requires Anthony to run the SQL in Supabase.
- **2026-07-09 — #5 prepped as #150 + #136 rebased.** Recreated the admin migration at slot `0009`;
  rebased #136 onto main keeping main's GA realtime + tuned server_vad + language lock, porting the
  SoundGate debounce + telemetry; dropped semantic_vad-default / allowLanguageSwitch + branch cruft.
- **2026-07-09 — Merge waves 1 & 2 + Opus pin.** Merged the ready/docs/product set across amma + vbfh;
  recreated the caretaker Routine pinned to Opus 4.8. Post-merge CI verified green.
- **2026-07-08 — Setup run.** Surveyed 4 repos + GitHub + Vercel; added CI to amma + vbfh; fixed lint;
  triaged all open PRs; built branch-cleanup lists; stood up the twice-daily caretaker.
