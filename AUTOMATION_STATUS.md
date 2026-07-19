# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-07-19 (evening twice-daily check-in — one red build still open: VBFH Daily Run)
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets) still wait for Anthony's explicit go-ahead.
**Caretaker model:** pinned to **Opus 4.8**. Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

1. **⚠️ STILL OPEN — the VBFH Daily Run fails every run until you add 5 email secrets.** (Flagged at the
   midday check-in; the scheduled run failed again at 13:25 UTC, so it's still red.) It succeeded all week
   until 2026-07-18, then went **red** on 2026-07-19 and stays red every run. Nothing is broken in
   the content pipeline — the run finishes its work, then **deliberately fails because the results email
   can't be sent**: email was switched on in `master` but the SMTP secrets don't exist yet, so delivery is
   "skipped_config_missing" and that's treated as a hard failure. **Fix (one time):** vbfh-media-engine →
   Settings → Secrets and variables → Actions → add `EMAIL_TO`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_USER`,
   `SMTP_PASS` (optional Variables `SMTP_PORT` default 587, `SMTP_SECURE` `true` only for port 465). Tell
   me your mail provider and I'll give you the exact host/port. Once added, the daily run goes green **and**
   you start getting the results email. (Same secrets ask as PR #4 below — doing it fixes both.)
2. **Review & merge PR #161 (Add ethical sales conversion system)** — your call. Evidence-first AMMA
   sales-conversion skill + scripts, routed through the business router. Build/Vercel **green**, touches
   no guardrail routes, but it's a substantive new feature — open the Vercel preview and merge when happy.
3. **PR #4 (vbfh) — confirm the "Claude QA's the images before emailing" routine.** The code half is
   done and green; it's held as draft. Beyond the SMTP secrets (item 1), it asks you to confirm the
   separate scheduled-QA routine before that piece gets built.
4. **PR #162 (owner portal installable) — your explicit go-ahead needed.** Draft, green. Adds an
   installable web-app manifest + icons to `/owner/[id]`. Its notes say no auth/DB/payments change, but it
   sits on a **protected owner route**, so it stays a hard-guardrail item — not caretaker-mergeable.
5. **(If not already done) Run the Marbel admin SQL in Supabase.** From #150: Supabase SQL editor →
   run `0009_admin_team_update.sql` (or `supabase db push`) to grant `marbeljsiado@gmail.com` admin.
   I can't see Supabase state from here — skip this if you already ran it.
6. **Optional:** say "clean the merged branches" to delete the growing set of provably-merged branches.

_Resolved:_ **PR #164 (mobile landing framed as sequential art) — you merged it to `main` at 20:22 UTC
today**; post-merge `CI — web` ✅, live/deploying. **PR #163 (landing redesign)** merged earlier today
(12:46 UTC). **PR #29 (AI Request Desk)** remains closed (from 2026-07-18). None is a pending decision.

---

## Build health (as of 2026-07-19, evening)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip `d13642b` (**#164 merged**, mobile landing sequential art); post-merge `CI — web` ✅. `#163` (landing redesign) also merged earlier today. voice-gateway CI path-filtered, last run ✅ |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" scheduled | CI ✅ on master (tip `25f5b83`, unchanged since midday). **VBFH Daily Run ❌ (still red)** — the 13:25 UTC scheduled run failed again on the email-delivery gate (`EMAIL_ENABLED=true` in `master` + no SMTP secrets → `skipped_config_missing` → exit 1). Content pipeline itself completes (`needs_review`, 0 dated game rows — the known DaySmart standings-only limitation, not a regression). Fixed by adding secrets (item 1). |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · last commit 2026-07-09 |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | Draft PR #1 (M1 scaffolds) landing incrementally; nothing to build in cloud |

## Open PRs

- **amma #161 — Add ethical sales conversion system** (open, **green**, no guardrail routes).
  Awaiting Anthony's review/merge (item 2). Only the Vercel bot comment; no human review comments.
- **amma #162 — Make owner portal installable** (open **draft**, CI **green** — `web` ✅ + Vercel ✅).
  Touches `/owner/[id]` metadata + manifest/icons only, but it's on the protected owner route, so it stays
  a **hard-guardrail item** for Anthony — not caretaker-mergeable (item 4).
- **vbfh #4 — email a copy-paste-ready post package after each VBFH Daily Run** (open **draft**, CI
  **green** — `check` ✅). Reworks the email into per-league copy-paste captions + inline images. Held as
  draft pending Anthony's SMTP secrets + QA-routine confirmation (items 1 & 3). No guardrail routes touched.
- **EscapeTheBomb-DC #1 — M1 master plan + P5–P8 scaffolds** (open **draft**, no CI). Authored without
  Unreal; not "green" until the M2 Windows compile-verify gate. Never merged without Anthony.
- No open PRs in shadow-engineer-rpa.

## Merged / closed since last run

- **amma #164 (Frame the Fina Calle mobile landing as sequential art)** — **merged to `main` by Anthony**
  (`d13642b`, 2026-07-19 20:22 UTC). Public landing only (`src/app/page.tsx`); no guardrail routes.
  Post-merge `CI — web` ✅ (`d13642b`). This is the only new merge since the midday run.
- **vbfh master** received no new pushes this window (tip still `25f5b83`); the Daily Run stays red for
  the same reason as midday — the already-merged `EMAIL_ENABLED=true` + "expose daily delivery failures"
  changes hitting runs with no SMTP secrets, not a new commit.
- No merges in shadow-engineer-rpa or EscapeTheBomb-DC (shadow last commit 2026-07-09; EscapeTheBomb #1
  unchanged since 10:56 UTC, before the midday run).

## Branch cleanup — awaiting one-click approval

Still awaiting Anthony's "clean the merged branches" go-ahead (never deleted unprompted). The prior
provably-merged amma list stands, extended by the merged branches behind #157–#160 and now
`codex/landing-premium-20260719` (behind the merged #163). Keep active: `automation/status` (this
dashboard) and the current `claude/*` caretaker working branches.

**vbfh-media-engine:** `claude/build-automation-management-sh68i3`, `feat/facility-info`,
`claude/vbfh-broadcast-instagram-e6p75v` — all merged, safe to delete.
**EscapeTheBomb-DC:** `codex/*` exploration set + `phase2`–`phase7` ladder — none merged by commit.

## Run log

- **2026-07-19 (evening) — Twice-daily check-in (Opus 4.8):** **VBFH Daily Run still red** — the 13:25
  UTC scheduled run failed again on the same by-design email-delivery gate (no SMTP secrets); re-confirmed
  the content pipeline itself completes (`needs_review`, 0 dated game rows = known DaySmart limitation).
  Not silently patched (it's Anthony's deliberate "expose delivery failures" gate) — kept as the top
  action. **New since midday: #164 merged to `main`** by Anthony (mobile landing sequential art, public
  route only), post-merge `CI — web` ✅ — main healthy at `d13642b`. All other builds green (amma
  `CI — web`/`voice-gateway`, vbfh `CI`). vbfh master, shadow, and EscapeTheBomb #1 unchanged since midday.
  No new review comments needing a reply (the only open one is the 07-18 Codex P2 note on #161, still for
  Anthony's call). No safe auto-mergeable PRs (all remaining are review-only/draft/guardrail). Refreshed
  this dashboard. No branches deleted.
- **2026-07-19 (midday) — Twice-daily check-in (Opus 4.8):** **One red build found: the VBFH Daily
  Run** (2026-07-19), diagnosed end-to-end — the content pipeline completes (`needs_review`, 0 dated game
  rows = the known DaySmart standings-only limitation), but the run deliberately exits 1 because
  `EMAIL_ENABLED=true` was merged to master yet no SMTP secrets exist (`skipped_config_missing`). This is
  a by-design "expose delivery failures" gate, so **not silently patched** — surfaced to Anthony as the
  top action (add 5 secrets). All other builds green: amma `CI — web`/`voice-gateway`, vbfh `CI`.
  **#163 merged to main by Anthony** during the run (landing redesign, release-approved). No new review
  comments needing a reply. No safe auto-mergeable PRs (all remaining are review-only/draft/guardrail).
  Refreshed this dashboard. No branches deleted.
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
