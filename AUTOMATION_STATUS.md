# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-07-09 (merge wave 2 — "merge all")
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets) still wait for Anthony's explicit go-ahead.
**Caretaker model:** now pinned to **Opus 4.8** (runs `/model claude-opus-4-8` first thing each run).
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
| amma-fina-calle | CI live on main: web (lint + next build), voice-gateway (typecheck) | web + voice-gateway ✅ on merges so far; Bandstand (`/band`) build run pending verification (short check-in armed) · Vercel preview Ready |
| vbfh-media-engine | CI live on master (lint + 185 tests); Daily Run untouched | CI ✅ through #2; #1 (broadcast/IG) build run pending verification · Daily Run ✅ all week |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant since 2026-06-21, clean |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | Dormant since 2026-06-23 |

## Merged / closed on 2026-07-09 (Anthony authorized full merge)

**Wave 1 (merge-ready set):** amma #149 (CI+dashboard), #142 (voice fallback), #100 (/news),
#147 (VBFH knowledge); vbfh #3 (CI), #2 (facility endpoint). Closed: amma #131 (subset of #147),
#24 (superseded by ad-zone model).

**Wave 2 ("merge all"):** amma #148 (AnchorFrame plan, docs), #36 (income assessment, docs),
#17 (Colattanini campaign, docs), #115 (Bandstand `/band` route); vbfh #1 (broadcast cards +
Instagram publisher). All squash-merged clean.

> vbfh #1 note: merging did **not** arm Instagram — the publisher skips cleanly until you add
> `BLOB_READ_WRITE_TOKEN` + `IG_BUSINESS_ID` + `IG_ACCESS_TOKEN` as repo Actions secrets and
> dispatch the daily workflow. The outward-posting step is still entirely yours.

## Still open — HELD for your explicit decision (guardrail / can't-merge)

| PR | Why it's held |
|---|---|
| amma **#5** (Marbel admin migration) | ⚠️ Grants a new person **full admin over the customer registry** via Supabase — a hard-guardrail access grant only you can authorize. Also un-mergeable as-is: migration slot `0007` is already taken on main, so it must be recreated as `0009` on a fresh branch. Say the word and I'll prep the `0009` version for your review (I will not run it in Supabase). |
| amma **#29** (AI Request Desk Phase 0) | ⚠️ Touches the protected `/owner/[id]` route + drives Supabase RPCs, and currently conflicts with main. Needs your adopt-or-close call; if adopt, it needs a rebase + re-verify. |
| amma **#136** (voice human-feel + SoundGate) | 🔧 Real conflicts in 5 files after the realtime hotfixes (#137–#141). Not superseded conceptually, but needs a genuine rebase against main's newer realtime model and a re-run of its 48-check simulate suite — a dedicated pass, not a blind conflict-resolve. Say "rebase #136" and I'll do that pass. |

Everything else in both repos is now merged or closed. **0 other open PRs.**

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

**vbfh-media-engine:** `claude/build-automation-management-sh68i3`, `feat/facility-info`, and
`claude/vbfh-broadcast-instagram-e6p75v` all merged today — safe to delete.

**EscapeTheBomb-DC** (28 non-main branches): `codex/look-pass-*`, `codex/gate2-*`, `codex/scene-cleanup-*`
plus the `phase2`–`phase7` ladder. None merged by commit. Recommend deleting the `codex/*` set; keep the
`phaseN` ladder only if it still marks meaningful milestones.

_Say "clean the merged branches" / "clean all listed branches" and the caretaker will do it._

## Run log

- **2026-07-09 — Merge wave 2 ("merge all") + Opus pin:** Merged amma #148, #36, #17, #115 and
  vbfh #1 (squash). Held amma #5 (Supabase admin grant + duplicate-0007 migration), #29 (protected
  route + Supabase, conflicts), #136 (needs real rebase) — flagged, not merged, per hard guardrails.
  Recreated the caretaker Routine pinned to Opus 4.8. Armed a short check-in to confirm the Bandstand
  and IG/broadcast builds land green (real product code on default branches).
- **2026-07-09 — Merge wave 1 (Anthony authorized):** Merged amma #149, #142, #100, #147 and vbfh
  #3, #2. Closed amma #131, #24 with explanations. Verified post-merge CI green (amma web +
  voice-gateway, vbfh master). Correction: the amma Vercel project exists and deploys fine (preview
  Ready on #149) — it's just not visible to the connected Vercel integration.
- **2026-07-08 — Setup run:** Surveyed all 4 repos + GitHub + Vercel. Added CI to amma (web +
  voice-gateway) and vbfh (lint + tests). Fixed lint errors. Triaged all 14 open PRs. Built
  branch-cleanup lists. Stood up the twice-daily caretaker with push + email summaries.
