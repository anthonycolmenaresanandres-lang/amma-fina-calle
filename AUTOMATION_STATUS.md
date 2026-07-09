# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-07-09 (#150 + #136 CI verified green)
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets) still wait for Anthony's explicit go-ahead.
**Caretaker model:** pinned to **Opus 4.8** (runs `/model claude-opus-4-8` first thing each run).
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## How this works

- A scheduled caretaker session runs **twice daily as Opus 4.8**. Each run: checks the VBFH
  daily job, CI on open PRs + latest default-branch pushes, review activity, and repo health;
  makes safe fixes/merges; then sends a push + email summary.
- Guardrails (always): never touch Client OS routes (`/m/[id]`, `/owner/[id]`, `/customers`),
  Supabase, Stripe, POS, secrets, customer data, or admin/access grants without explicit approval.

## Build health (as of 2026-07-09)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI live on main: web (lint + next build), voice-gateway (typecheck) | main green. Open PRs verified: #150 web build ✅ · #136 voice-gateway typecheck ✅ (both conflict-free) |
| vbfh-media-engine | CI live on master (lint + 185 tests); Daily Run untouched | CI ✅ (incl. #1 broadcast/IG) · Daily Run ✅ all week |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant since 2026-06-21, clean |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | Dormant since 2026-06-23 |

## Awaiting your decision — prepared & ready for you to act

| Item | State | Your move |
|---|---|---|
| **#150** (admin migration `0009`, replaces #5) | ✅ Prepared, draft PR, **CI green**. Correctly numbered `0009_admin_team_update.sql`; idempotent insert adding `marbeljsiado@gmail.com` to `admin_emails`. **I did not touch Supabase.** | Confirm you want Marbel as a full admin → then run the SQL in Supabase (SQL editor or `supabase db push`). Close the old #5 in favor of #150. |
| **#136** (voice SoundGate) | ✅ Rebased onto main, single clean commit, **conflict-free, CI green**. `tsc` clean + 48/48 simulate checks pass. Draft. | Review + merge when ready. Kept main's tuned `server_vad` + language lock; did **not** adopt #136's `semantic_vad`-default / `allowLanguageSwitch` (flagged in a PR comment). First live call still needs a Realtime event-name re-verify. |
| **#29** (AI Request Desk Phase 0) | ⚠️ Untouched — touches protected `/owner/[id]` + Supabase RPCs; conflicts with main. | Adopt (I'll rebase + re-verify) or close. |
| **#5** (original Marbel migration) | Superseded by #150 (duplicate `0007` slot). | Close in favor of #150. |

Everything else in both repos is merged or closed.

## Branch cleanup — awaiting one-click approval

**amma-fina-calle:**
- **Provably merged into main — safe to delete now** (21 from the setup survey, plus today's merged branches:
  `claude/build-automation-management-sh68i3`, `voice/twiml-stream-fallback`, `claude/news-page`,
  `claude/explanation-utilization-planning-rxu4vr`, `claude/anchorframe-daily-plan-aj7jmr`,
  `claude/project-review-income-1WASn`, `codex/colattanini-campaign-plan`, `claude/player-sticker-replacement-8chwzf`):
  `claude/vbfh-broadcast-instagram-e6p75v`, `codex/colattao-owner-polish`, `docs/voice-personalities-runbook`,
  `feat/call-timing-warm-bookends`, `feat/colattao-info-line`, `feat/vbfh-info-line`,
  `feat/voice-gateway-realtime-ga`, `feat/voice-quality-tuning`, `fix/render-blueprint-paths`,
  `voice/colattao-tester`, `voice/colattao-tester-073433`, `voice/field-house-tester`,
  `voice/natural-turn-taking`, `voice/original-barge-in-plus-noise-reduction`,
  `voice/realtime-model-hotfix`, `voice/realtime-probe`, `voice/remove-noise-reduction-hotfix`,
  `voice/restore-barge-in`, `voice/runtime-diagnostics`, `voice/session-probe`, `voice/vbfh-tester-171128`
- **~50 unmerged branches with no open PR** — mostly the `claude/penalty-*` / `claude/colattanini-*` /
  `claude/kicker-*` series whose work landed via squash-merge (PRs #37–43 & the V2 steps marked DONE in
  CLAUDE.md). Recommend deleting after a spot-check; double-check first: `feat/owner-dashboard-premium`,
  `fix/auth-confirm-verify-types`, `fix/owner-login-token-hash`, `claude/burger-plus-menu`, `claude/burger-plus-public`.
- Keep active: `automation/status` (this dashboard), `claude/admin-team-migration-0009` (#150), `claude/ai-assistance-idea-check-t2d0xz` (#136).

**vbfh-media-engine:** `claude/build-automation-management-sh68i3`, `feat/facility-info`, and
`claude/vbfh-broadcast-instagram-e6p75v` all merged today — safe to delete.

**EscapeTheBomb-DC** (28 non-main branches): `codex/look-pass-*`, `codex/gate2-*`, `codex/scene-cleanup-*`
plus the `phase2`–`phase7` ladder. None merged by commit. Recommend deleting the `codex/*` set; keep the
`phaseN` ladder only if it still marks meaningful milestones.

_Say "clean the merged branches" / "clean all listed branches" and the caretaker will do it._

## Run log

- **2026-07-09 — #150 + #136 CI verified (Opus 4.8 check-in):** Both prepared PRs green and
  conflict-free — #150 web build ✅, #136 voice-gateway typecheck ✅. No action; awaiting Anthony's
  merge/run decisions.
- **2026-07-09 — #5 prepped as #150 + #136 rebased (your two picks):** (1) Recreated the Marbel-admin
  migration correctly numbered as `0009` on branch `claude/admin-team-migration-0009` → draft PR #150
  (did not run it in Supabase). (2) Rebased #136 onto main: resolved 6 conflicts, kept main's GA
  realtime architecture + tuned server_vad + language lock, ported only the SoundGate barge-in debounce
  + turn telemetry (wrapping main's accurate media-clock truncate), dropped #136's semantic_vad-default /
  allowLanguageSwitch and unrelated branch cruft. Verified `tsc` clean + 48/48 simulate checks.
- **2026-07-09 — Post-merge CI verified (Opus 4.8 check-in):** All default-branch builds green after the
  merge wave — Bandstand `/band` ✅, voice-gateway (#142) ✅, vbfh (#1) ✅.
- **2026-07-09 — Merge wave 2 ("merge all") + Opus pin:** Merged amma #148, #36, #17, #115 and vbfh #1.
  Held #5/#29/#136 per hard guardrails. Recreated caretaker Routine pinned to Opus 4.8.
- **2026-07-09 — Merge wave 1 (Anthony authorized):** Merged amma #149, #142, #100, #147 and vbfh #3, #2.
  Closed amma #131, #24 with explanations. Verified post-merge CI green.
- **2026-07-08 — Setup run:** Surveyed all 4 repos + GitHub + Vercel. Added CI to amma + vbfh. Fixed lint
  errors. Triaged all 14 open PRs. Built branch-cleanup lists. Stood up the twice-daily caretaker.
