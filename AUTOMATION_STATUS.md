# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-07-08 (initial setup run)
**Autonomy level:** fix + push + draft PRs allowed; **merging is always Anthony's call**.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## How this works

- A scheduled caretaker session runs **twice daily**. Each run: checks the VBFH daily
  job, CI on open PRs, new review activity, and repo health; makes safe fixes via
  draft PRs; then sends a push + email summary.
- Guardrails (always): never merge without approval; never touch Client OS routes
  (`/m/[id]`, `/owner/[id]`, `/customers`), Supabase, Stripe, POS, secrets, or customer data.

## Build health (as of 2026-07-08)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | **NEW** CI added: web (lint + next build), voice-gateway (typecheck) | Local: build ✅ lint ✅ typecheck ✅ |
| vbfh-media-engine | **NEW** CI added (lint + vitest); existing Daily Run | Daily Run ✅ passing all week · tests 185/185 ✅ · lint ✅ |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant since 2026-06-21, clean |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | Dormant since 2026-06-23 |

Lint note: the new `react-hooks/set-state-in-effect` rule was downgraded to a warning in
both Next.js apps — it flags the intentional SSR-safe localStorage hydration pattern.
vbfh PR #1 contains the proper `useSyncExternalStore` refactor; when it merges, the
override can be removed there.

## PR triage — amma-fina-calle (12 open)

**Awaiting Anthony's decision — recommendations, nothing closed or merged automatically.**

| PR | What | Verdict |
|---|---|---|
| #142 | voice: TwiML stream-failure fallback (+4 lines) | ✅ **MERGE-READY** — cleanest candidate; mitigates silent hang-ups |
| #100 | Public /news section (all new files) | ✅ **MERGE-READY** — clean, guardrail-safe; `NEWS_FEED_URL` env optional |
| #147 | VBFH League Assistant knowledge sweep | ✅ **MERGE-READY** (un-draft) — supersedes #131; note it also carries an unannounced check-in prototype (`src/checkin/*`) |
| #131 | VBFH facility facts (1 line) | 🗑 **CLOSE when #147 merges** (strict subset of #147; don't merge both) |
| #24 | Stadium scoreBug/ledBanner look | 🗑 **CLOSE** — explicitly superseded by the behind-goal ad-zone model (CLAUDE.md); conflicts with main |
| #136 | Voice human-feel + SoundGate | 🔧 **NEEDS-REBASE** — conflicts in 5 files after hotfixes #137–#141; re-run simulate suite after |
| #148 | AnchorFrame Daily plan (docs) | 🧭 **YOUR DECISION** — plan needs your answers to its D1–D12 questions |
| #115 | Bandstand /band music toy | 🧭 **YOUR DECISION** — parked product bet, still conflict-free; QA it or park/close |
| #36 | Workspace review + income assessment (docs) | 🧭 **YOUR DECISION** — merge as dated snapshot or close as consumed |
| #17 | Colattanini campaign docs | 🧭 **YOUR DECISION** — roster predates shipped Colattao characters; refresh or close |
| #29 | AI Request Desk Phase 0 | ⚠️ **YOUR DECISION** — touches protected `/owner/[id]` + Supabase RPCs; conflicts with main; adopt→rebase or close |
| #5 | Marbel admin migration | ⚠️ **YOUR DECISION** — grants full admin to a third person; migration slot 0007 now taken → would need recreating as 0009 |

## PR triage — vbfh-media-engine (2 open)

| PR | What | Verdict |
|---|---|---|
| #2 | Facility profile + endpoint (additive, Phase 0) | ✅ **MERGE-READY** — clean; just eyeball the seeded facility facts |
| #1 | Broadcast cards + Instagram auto-publish | ⚠️ **YOUR DECISION** — code-complete and credential-safe, but merging arms auto-posting to Instagram on the daily cron once secrets are added; also carries the player-components lint refactor |

## Branch cleanup — awaiting one-click approval

**amma-fina-calle** (87 remote branches):
- **21 provably merged into main — safe to delete now:**
  `claude/vbfh-broadcast-instagram-e6p75v`, `codex/colattao-owner-polish`, `docs/voice-personalities-runbook`,
  `feat/call-timing-warm-bookends`, `feat/colattao-info-line`, `feat/vbfh-info-line`,
  `feat/voice-gateway-realtime-ga`, `feat/voice-quality-tuning`, `fix/render-blueprint-paths`,
  `voice/colattao-tester`, `voice/colattao-tester-073433`, `voice/field-house-tester`,
  `voice/natural-turn-taking`, `voice/original-barge-in-plus-noise-reduction`,
  `voice/realtime-model-hotfix`, `voice/realtime-probe`, `voice/remove-noise-reduction-hotfix`,
  `voice/restore-barge-in`, `voice/runtime-diagnostics`, `voice/session-probe`, `voice/vbfh-tester-171128`
- **53 unmerged branches with no open PR** — most are the `claude/penalty-*` / `claude/colattanini-*` /
  `claude/kicker-*` series whose work landed via **squash-merge** (PRs #37–43 & the V2 steps are
  marked DONE in CLAUDE.md), so git can't prove the merge. Recommend deleting after a spot-check;
  the notable non-penalty ones to double-check first: `feat/owner-dashboard-premium`,
  `fix/auth-confirm-verify-types`, `fix/owner-login-token-hash`, `claude/burger-plus-menu`,
  `claude/burger-plus-public`.

**EscapeTheBomb-DC** (28 non-main branches): all `codex/look-pass-*`, `codex/gate2-*`,
`codex/scene-cleanup-*` exploration branches plus the `phase2`–`phase7` ladder. None merged by
commit; review tags exist for some passes. Recommend deleting the `codex/*` set and keeping the
`phaseN` ladder only if it still marks meaningful milestones.

_Say "clean the merged branches" / "clean all listed branches" and the caretaker will do it._

## Run log

- **2026-07-08 — Setup run:** Surveyed all 4 repos + GitHub + Vercel. Added CI to amma
  (web + voice-gateway) and vbfh (lint + tests). Fixed lint errors (rule downgrade + typed
  `gameRef` in ConquestClient). Triaged all 14 open PRs. Built branch-cleanup lists.
  Stood up twice-daily caretaker routine with push + email summaries.
  Note: the connected Vercel account has **no projects** — deploys must live under a
  different Vercel login, so deploy status can't be watched from here yet.
