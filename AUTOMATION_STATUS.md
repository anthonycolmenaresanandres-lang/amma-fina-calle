# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-07-21 (morning twice-daily check-in — caretaker **merged vbfh PR #5**, so the VBFH Daily Run no longer fails red on the missing-SMTP-secret setup gap; fix takes effect on the next scheduled Daily Run)
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets) still wait for Anthony's explicit go-ahead.
**Caretaker model:** pinned to **Opus 4.8** (`/model` is a CLI command, not runnable from the shell in this env; ran as configured `claude-opus-4-8`). Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

1. **(Optional but recommended) Add the 5 VBFH email secrets so you actually RECEIVE the daily email.**
   The red build is already fixed — I merged PR #5, so the Daily Run stops failing just because email
   isn't configured. But it still won't *send* you anything until the secrets exist. Add them in
   vbfh-media-engine → Settings → Secrets and variables → Actions → `EMAIL_TO`, `EMAIL_FROM`, `SMTP_HOST`,
   `SMTP_USER`, `SMTP_PASS` (optional Variables `SMTP_PORT` default 587, `SMTP_SECURE` `true` only for port
   465). Tell me your mail provider and I'll give you the exact host/port. (Same secrets ask as PR #4.)
2. **Review & merge PR #161 (Add ethical sales conversion system)** — your call. Evidence-first AMMA
   sales-conversion skill + scripts, routed through the business router. Build/Vercel **green**, touches
   no guardrail routes, but it's a substantive new feature — open the Vercel preview and merge when happy.
3. **PR #168 (amma) — review the grant-application draft, then submit it yourself.**
   `BUSINESS/GRANT_APPLICATION_DEV_PC.md` — a paste-ready ~$1,900 dev-PC grant application (studio
   summary, measured hardware need, traction, itemized budget). Draft, Vercel **green**, no code/guardrail
   routes. Nothing is auto-submitted — you review, adapt per program rules, and send. Merge/keep as you like.
4. **PR #4 (vbfh) — confirm the "Claude QA's the images before emailing" routine.** The code half is
   done and green; it's held as draft. Beyond the SMTP secrets (item 1), it asks you to confirm the
   separate scheduled-QA routine before that piece gets built.
5. **PR #162 (owner portal installable) — your explicit go-ahead needed.** Draft, green. Adds an
   installable web-app manifest + icons to `/owner/[id]`. Its notes say no auth/DB/payments change, but it
   sits on a **protected owner route**, so it stays a hard-guardrail item — not caretaker-mergeable.
6. **(If not already done) Run the Marbel admin SQL in Supabase.** From #150: Supabase SQL editor →
   run `0009_admin_team_update.sql` (or `supabase db push`) to grant `marbeljsiado@gmail.com` admin.
   I can't see Supabase state from here — skip this if you already ran it.
7. **Optional:** say "clean the merged branches" to delete the growing set of provably-merged branches
   (now including the merged `claude/pensive-edison-hl5sxo` behind PR #5).

_Resolved / no action:_ **vbfh PR #5 merged by the caretaker this run** (email-gate resilience — turns the
Daily Run green without secrets, still fails on a real SMTP error). **#29 stays closed** (Anthony, 07-18) —
not a pending decision. amma `main` unchanged since #167 (`10be3ef`). shadow-engineer-rpa dormant (07-09).

---

## Build health (as of 2026-07-21, morning)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip `10be3ef` (**#167**, "keep color dust on the opening transformation"); latest `CI — web` ✅ (2026-07-20 09:04 UTC). No new merges to main this window. voice-gateway CI path-filtered, last run ✅ (no voice changes since 07-09). |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" scheduled | CI ✅ on master. **VBFH Daily Run — fix merged (PR #5).** The email-delivery gate that turned every run red since 07-19 (`EMAIL_ENABLED=true` + no SMTP secrets → `skipped_config_missing` → exit 1) is fixed: `skipped_config_missing` is now a non-fatal setup gap while a real SMTP `failed` still fails the run. Expect the **next scheduled run to go green**; content pipeline already completes (`needs_review`, `gamesFound:0` = known DaySmart standings-only limitation, not a regression). |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · no workflows · last commit 2026-07-09 |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | Draft PR #1 (M1 scaffolds) landing incrementally; nothing to build in cloud |

## Open PRs

- **amma #161 — Add ethical sales conversion system** (open, **green**, no guardrail routes).
  Awaiting Anthony's review/merge (item 2). Only the Vercel bot comment; no new human review comments.
- **amma #168 — grant application draft (dev PC)** (open **draft**, Vercel **green**). Docs-only
  (`BUSINESS/GRANT_APPLICATION_DEV_PC.md`), no code/guardrail routes; nothing auto-submitted. Only the
  Vercel bot comment (a fresh preview build re-triggered 07-21). For Anthony's review/submission (item 3).
- **amma #162 — Make owner portal installable** (open **draft**, CI **green** — `web` ✅ + Vercel ✅).
  Touches `/owner/[id]` metadata + manifest/icons only, but it's on the protected owner route, so it stays
  a **hard-guardrail item** for Anthony — not caretaker-mergeable (item 5).
- **vbfh #4 — email a copy-paste-ready post package after each VBFH Daily Run** (open **draft**, CI
  **green** — `check` ✅). Reworks the email into per-league copy-paste captions + inline images. Held as
  draft pending Anthony's SMTP secrets + QA-routine confirmation (items 1 & 4). No guardrail routes touched.
- **EscapeTheBomb-DC #1 — M1 master plan + P5–P8 scaffolds** (open **draft**, no CI). Authored without
  Unreal; not "green" until the M2 Windows compile-verify gate. No change this window. Never merged
  without Anthony.
- No open PRs in shadow-engineer-rpa.

## Merged / closed since last run

- **vbfh #5 MERGED by the caretaker (squash → master, `17d479e`)** — email-gate resilience fix. This is
  the one caretaker action this run. Branch `claude/pensive-edison-hl5sxo` is now provably merged.
- No other new merges: amma `main` tip unchanged (`10be3ef`, still #167); vbfh had no other pushes;
  EscapeTheBomb #1 unchanged since 07-20; shadow dormant (last commit 07-09). #29 stays closed (07-18).
- No new human review comments on any open PR (only the Vercel bot on #161/#168).

## Branch cleanup — awaiting one-click approval

Still awaiting Anthony's "clean the merged branches" go-ahead (never deleted unprompted). The prior
provably-merged amma list stands, extended by the merged branches behind #163–#167. **Newly mergeable:**
vbfh `claude/pensive-edison-hl5sxo` (PR #5, merged this run). Keep active: `automation/status` (this
dashboard) and the current `claude/*` caretaker working branches. The `voice/twiml-stream-fallback` and
`voice/vbfh-tester-171128` branches are old (June, pre-#141) — leave for Anthony to judge, not on the
auto-clean list.

**vbfh-media-engine:** `claude/build-automation-management-sh68i3`, `feat/facility-info`,
`claude/vbfh-broadcast-instagram-e6p75v`, `claude/pensive-edison-hl5sxo` (PR #5) — all merged, safe to delete.
**EscapeTheBomb-DC:** `codex/*` exploration set + `phase2`–`phase7` ladder — none merged by commit.

## Run log

- **2026-07-21 (morning) — Twice-daily check-in (`claude-opus-4-8`):** **Acted:** verified vbfh PR #5
  end-to-end (root cause reconfirmed from the 07-20 failed-job env — `EMAIL_ENABLED=true` with all SMTP
  secrets empty; diff is a clean +14/−1 to `scripts/run-daily-league-content.ts` treating
  `skipped_config_missing` as a non-fatal setup gap while a real SMTP `failed` still fails), confirmed CI
  ✅ + `mergeable_state: clean` + no guardrail routes, marked it ready and **squash-merged it to master**
  (`17d479e`). The VBFH Daily Run — red every scheduled run since 07-19 — will go green on its next run
  without any secret change. **Checked, no action:** all other builds green (amma `CI — web` ✅ tip
  `10be3ef` / `voice-gateway` path-filtered ✅; vbfh `CI` ✅ on master; amma open PRs #161/#162/#168 have
  no red checks). No new merges to amma main; EscapeTheBomb #1 unchanged since 07-20; shadow dormant
  (07-09, no workflows). #29 confirmed closed (07-18). No new human review comments (only Vercel bot on
  #161/#168). Refreshed this dashboard. No branches deleted (awaiting Anthony's go-ahead).
- **2026-07-20 (evening) — Twice-daily check-in (`claude-opus-4-8`):** VBFH Daily Run still red — the
  07-20 14:14 UTC run failed on the same by-design email-delivery gate (no SMTP secrets →
  `skipped_config_missing` → exit 1), so it had failed every scheduled run since 07-19. Re-confirmed
  via job logs that the content pipeline itself completes (`needs_review`, `gamesFound:0` = known DaySmart
  limitation). **Action taken:** opened **draft PR #5 (vbfh, branch `claude/pensive-edison-hl5sxo`)**
  treating `skipped_config_missing` as non-fatal while still failing on a real SMTP `failed` — *not merged*
  that run, offered as an alternative to Anthony's "expose delivery failures" gate. (Merged 07-21 morning.)
  **New:** **amma #168 opened** (draft grant-application doc, Vercel ✅, no guardrail routes);
  **EscapeTheBomb #1** advanced with 07-20 commits (blender-mcp art lane, ending-trigger test hook, sky
  perf mode). All other builds green. shadow dormant (07-09). No new human review comments. No branches deleted.
- **2026-07-20 (morning) — Twice-daily check-in (Opus 4.8):** **VBFH Daily Run still red** — latest run
  (07-19 13:25 UTC scheduled) failed on the same by-design email-delivery gate (no SMTP secrets); today's
  noon run had not appeared at check-in. Re-confirmed via job logs that the content pipeline itself
  completes (`needs_review`, `gamesFound:0` = known DaySmart limitation) and the exit-1 is purely the
  required-email gate. **New: #165/#166/#167 all merged to `main`** by Anthony (public landing motion,
  `page.tsx` only), post-merge `CI — web` ✅ at `10be3ef` — main healthy. **EscapeTheBomb #1** advanced
  with 07-20 asset-factory commits. All other builds green. shadow dormant (07-09). No branches deleted.
- **2026-07-19 (evening) — Twice-daily check-in (Opus 4.8):** **VBFH Daily Run still red** — 13:25 UTC
  run failed again on the same email-delivery gate. **#164 merged to `main`** by Anthony (mobile landing
  sequential art), post-merge `CI — web` ✅ at `d13642b`. All other builds green. No branches deleted.
- **2026-07-19 (midday) — Twice-daily check-in (Opus 4.8):** **One red build: the VBFH Daily Run**,
  diagnosed end-to-end (content pipeline completes; run exits 1 because `EMAIL_ENABLED=true` merged to
  master yet no SMTP secrets). **#163 merged to main by Anthony.** All other builds green. No branches deleted.
- **2026-07-18 (evening) — Twice-daily check-in (Opus 4.8):** All four repos green. New: **vbfh #4
  opened** (draft daily-email post package) and 5 green pushes to vbfh master. **EscapeTheBomb #1** got
  more M1 scaffold commits. Refreshed this dashboard. No branches deleted.
- **2026-07-18 (morning) — Twice-daily check-in (Opus 4.8):** All four repos green. Found **#29 closed**
  by Anthony and **#161 opened** (green; left for Anthony to merge). No red builds. No branches deleted.
- **2026-07-09 — Post-merge CI verified (Opus 4.8 check-in):** main green after the #136 + #150
  merges — voice-gateway typecheck ✅, web build ✅. No action.
- **2026-07-09 — #150 + #136 merged (Anthony approved):** Marbel `0009` admin migration (#150) + voice
  SoundGate PR (#136); barge-in cleanup + README; `tsc` + 48/48 simulate re-verified. Closed old #5.
- **2026-07-09 — Merge waves 1 & 2 + Opus pin.** Merged the ready/docs/product set across amma + vbfh;
  recreated the caretaker Routine pinned to Opus 4.8. Post-merge CI verified green.
- **2026-07-08 — Setup run.** Surveyed 4 repos + GitHub + Vercel; added CI to amma + vbfh; fixed lint;
  triaged all open PRs; built branch-cleanup lists; stood up the twice-daily caretaker.
