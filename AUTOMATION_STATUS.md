# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-07-09 (merge wave, Anthony-authorized)
**Autonomy level:** fix + push + draft PRs allowed; merges on Anthony's go-ahead (given 2026-07-09 for the merge-ready set).
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## How this works

- A scheduled caretaker session runs **twice daily**. Each run: checks the VBFH daily
  job, CI on open PRs, new review activity, and repo health; makes safe fixes via
  draft PRs; then sends a push + email summary.
- Guardrails (always): never merge without approval; never touch Client OS routes
  (`/m/[id]`, `/owner/[id]`, `/customers`), Supabase, Stripe, POS, secrets, or customer data.

## Build health (as of 2026-07-09)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI **live on main**: web (lint + next build), voice-gateway (typecheck) | Post-merge main runs: web ✅ voice-gateway ✅ · Vercel preview deployed Ready |
| vbfh-media-engine | CI **live on master** (lint + 185 vitest tests); Daily Run untouched | Post-merge master CI ✅ · Daily Run ✅ passing all week |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant since 2026-06-21, clean |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | Dormant since 2026-06-23 |

Lint note: `react-hooks/set-state-in-effect` is a warning in both Next.js apps — it flags
the intentional SSR-safe localStorage hydration pattern. vbfh PR #1 contains the proper
`useSyncExternalStore` refactor; when it merges, the override can be removed there.

## Merged / closed on 2026-07-09 (Anthony authorized "merge all that needs merging")

| PR | Outcome |
|---|---|
| amma #149 (CI + dashboard) | ✅ MERGED — CI green on first main runs |
| amma #142 (voice stream-failure fallback) | ✅ MERGED — Render auto-deploys voice-gateway |
| amma #100 (public /news section) | ✅ MERGED — set `NEWS_FEED_URL` in Vercel when ready (optional) |
| amma #147 (VBFH knowledge sweep + check-in prototype rider) | ✅ MERGED — run its post-merge phone verify when convenient |
| amma #131 (VBFH facts, subset of #147) | 🗑 CLOSED with explanation |
| amma #24 (scoreBug/ledBanner, superseded by ad-zone model) | 🗑 CLOSED with explanation |
| vbfh #3 (CI workflow) | ✅ MERGED — CI green on master |
| vbfh #2 (facility profile + endpoint) | ✅ MERGED — eyeball the seeded facility facts when convenient |

## PR triage — amma-fina-calle (6 still open)

| PR | What | Verdict |
|---|---|---|
| #136 | Voice human-feel + SoundGate | 🔧 **NEEDS-REBASE** — conflicts in 5 files after hotfixes #137–#141; semantic conflicts with main's newer realtime direction, so left for a dedicated pass; re-run the 48-check simulate suite after |
| #148 | AnchorFrame Daily plan (docs) | 🧭 **YOUR DECISION** — plan needs your answers to its D1–D12 questions |
| #115 | Bandstand /band music toy | 🧭 **YOUR DECISION** — parked product bet, conflict-free; QA it or park/close |
| #36 | Workspace review + income assessment (docs) | 🧭 **YOUR DECISION** — merge as dated snapshot or close as consumed |
| #17 | Colattanini campaign docs | 🧭 **YOUR DECISION** — roster predates shipped Colattao characters; refresh or close |
| #29 | AI Request Desk Phase 0 | ⚠️ **YOUR DECISION** — touches protected `/owner/[id]` + Supabase RPCs; conflicts with main; adopt→rebase or close |

Plus: **#5** (Marbel admin migration) — ⚠️ access-control grant only you can authorize; if yes it must be recreated as migration 0009 on a fresh branch.

## PR triage — vbfh-media-engine (1 still open)

| PR | What | Verdict |
|---|---|---|
| #1 | Broadcast cards + Instagram auto-publish | ⚠️ **YOUR DECISION** — code-complete and credential-safe, but merging arms auto-posting to Instagram on the daily cron once secrets are added |

## Branch cleanup — awaiting one-click approval

**amma-fina-calle** (~90 remote branches):
- **Provably merged into main — safe to delete now** (21 from setup survey, plus the four merged today: `claude/build-automation-management-sh68i3`, `voice/twiml-stream-fallback`, `claude/news-page`, `claude/explanation-utilization-planning-rxu4vr`):
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

**vbfh-media-engine**: `claude/build-automation-management-sh68i3` and `feat/facility-info` merged today — safe to delete.

**EscapeTheBomb-DC** (28 non-main branches): all `codex/look-pass-*`, `codex/gate2-*`,
`codex/scene-cleanup-*` exploration branches plus the `phase2`–`phase7` ladder. None merged by
commit; review tags exist for some passes. Recommend deleting the `codex/*` set and keeping the
`phaseN` ladder only if it still marks meaningful milestones.

_Say "clean the merged branches" / "clean all listed branches" and the caretaker will do it._

## Run log

- **2026-07-09 — Merge wave (Anthony authorized):** Merged amma #149, #142, #100, #147 and
  vbfh #3, #2 (squash). Closed amma #131 (subset of #147) and #24 (superseded by ad-zone
  model) with explanatory comments. Verified post-merge CI green on amma main (web +
  voice-gateway) and vbfh master. Held for explicit approval: #5 (admin grant), #29
  (protected route), vbfh #1 (arms Instagram posting), #136 (semantic rebase). Correction
  from setup run: the amma Vercel project exists and deploys fine (preview Ready on #149) —
  it's just not visible to the connected Vercel integration.
- **2026-07-08 — Setup run:** Surveyed all 4 repos + GitHub + Vercel. Added CI to amma
  (web + voice-gateway) and vbfh (lint + tests). Fixed lint errors (rule downgrade + typed
  `gameRef` in ConquestClient). Triaged all 14 open PRs. Built branch-cleanup lists.
  Stood up twice-daily caretaker routine with push + email summaries.
