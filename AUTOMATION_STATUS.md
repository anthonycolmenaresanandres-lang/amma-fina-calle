# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-07-20 (evening twice-daily check-in — VBFH Daily Run still red; caretaker opened draft PR #5 to make the daily run resilient to the missing-secret state)
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets) still wait for Anthony's explicit go-ahead.
**Caretaker model:** pinned to **Opus 4.8** (`/model` is a CLI command, not runnable from the shell in this env; ran as configured `claude-opus-4-8`). Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

1. **⚠️ VBFH Daily Run — pick ONE of two one-click fixes (ideally both).** Still red; the 2026-07-20
   14:14 UTC noon run failed on the same gate, so it has now failed every scheduled run since 07-19.
   Nothing is broken in the content pipeline — the run finishes its work, then fails because the results
   email can't be sent: email was switched on in `master` but the SMTP secrets don't exist yet, so delivery
   is "skipped_config_missing" and the run currently treats that as a hard failure (exit 1). Your options:
   - **(A) Merge draft PR #5 (vbfh)** — I prepared it this run. It stops the daily run going red just
     because email isn't configured yet, while still failing on a *real* email send error once secrets
     exist. This turns the daily run green **now** without you touching secrets. Safe, no guardrail routes,
     no content/scraping/publish change. *You still won't receive the email until you also do (B).*
   - **(B) Add the 5 email secrets** so you actually receive the results email: vbfh-media-engine →
     Settings → Secrets and variables → Actions → `EMAIL_TO`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_USER`,
     `SMTP_PASS` (optional Variables `SMTP_PORT` default 587, `SMTP_SECURE` `true` only for port 465).
     Tell me your mail provider and I'll give you the exact host/port. (Same secrets ask as PR #4.)
   - Best path: do **both** — merge #5 (green + resilient) and add secrets (you get the email).
2. **Review & merge PR #161 (Add ethical sales conversion system)** — your call. Evidence-first AMMA
   sales-conversion skill + scripts, routed through the business router. Build/Vercel **green**, touches
   no guardrail routes, but it's a substantive new feature — open the Vercel preview and merge when happy.
3. **PR #168 (amma) — review the grant-application draft, then submit it yourself.** New this run.
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
7. **Optional:** say "clean the merged branches" to delete the growing set of provably-merged branches.

_Resolved / no action:_ **PRs #165, #166, #167 all merged to `main` by Anthony overnight** (fluid
editorial motion → scroll-linked color-dust landing effects; public `src/app/page.tsx` only, no guardrail
routes); post-merge `CI — web` ✅ at tip `10be3ef`. #164/#163 merged earlier. #29 stays closed. None is a
pending decision.

---

## Build health (as of 2026-07-20, morning)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip `10be3ef` (**#167 merged**, "keep color dust on the opening transformation"); latest `CI — web` ✅ (2026-07-20 09:04 UTC). #165/#166/#164/#163 also merged. voice-gateway CI path-filtered, last run ✅ (no voice changes since 07-09). |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" scheduled (cron `0 12 * * *`) | CI ✅ on master (tip `25f5b83`, unchanged since 07-18). **VBFH Daily Run ❌ (still red)** — latest run (07-20 14:14 UTC noon scheduled) failed on the same email-delivery gate (`EMAIL_ENABLED=true` in `master` + no SMTP secrets → `skipped_config_missing` → exit 1, `scripts/run-daily-league-content.ts:33-41`). Content pipeline itself completes (`needs_review`, 0 dated game rows — known DaySmart standings-only limitation, not a regression). **Caretaker opened draft PR #5** to stop `skipped_config_missing` failing the run (a real SMTP `failed` still fails it); merge #5 to go green now, add secrets to also receive the email (item 1). |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · last commit 2026-07-09 |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | Draft PR #1 (M1 scaffolds) landing incrementally; nothing to build in cloud |

## Open PRs

- **amma #161 — Add ethical sales conversion system** (open, **green**, no guardrail routes).
  Awaiting Anthony's review/merge (item 2). Only the Vercel bot comment; no new human review comments.
- **amma #168 — grant application draft (dev PC)** (open **draft**, Vercel **green**). New this run
  (07-20). Docs-only (`BUSINESS/GRANT_APPLICATION_DEV_PC.md`), no code/guardrail routes; nothing
  auto-submitted. Only the Vercel bot comment. For Anthony's review/submission (item 3).
- **vbfh #5 — stop VBFH Daily Run failing red when SMTP secrets aren't set** (open **draft**, caretaker-
  authored this run, branch `claude/pensive-edison-hl5sxo`). Treats `skipped_config_missing` as a setup
  gap, not a delivery failure; a real SMTP `failed` still fails the run. No guardrail routes. Merge to turn
  the daily run green now (item 1A). Not self-merged — offered as an alternative to Anthony's deliberate
  "expose delivery failures" gate.
- **amma #162 — Make owner portal installable** (open **draft**, CI **green** — `web` ✅ + Vercel ✅).
  Touches `/owner/[id]` metadata + manifest/icons only, but it's on the protected owner route, so it stays
  a **hard-guardrail item** for Anthony — not caretaker-mergeable (item 5).
- **vbfh #4 — email a copy-paste-ready post package after each VBFH Daily Run** (open **draft**, CI
  **green** — `check` ✅). Reworks the email into per-league copy-paste captions + inline images. Held as
  draft pending Anthony's SMTP secrets + QA-routine confirmation (items 1 & 3). No guardrail routes touched.
- **EscapeTheBomb-DC #1 — M1 master plan + P5–P8 scaffolds** (open **draft**, no CI). New commits
  2026-07-20 (headless Blender asset-factory generators + a recorded "Blender prerequisite" blocker,
  `AF-W0`). Authored without Unreal; not "green" until the M2 Windows compile-verify gate. Never merged
  without Anthony.
- No open PRs in shadow-engineer-rpa.

## Merged / closed since last run

- **No new merges/closes this window.** (Prior window: amma #165/#166/#167 merged to `main` by Anthony,
  `10be3ef` tip — public landing motion polish, `src/app/page.tsx` only, post-merge `CI — web` ✅.)
- **amma #168 opened** (07-20, draft — grant-application doc, no guardrail routes; item 3).
- **vbfh master** received no new pushes this window (tip still `25f5b83`); the Daily Run stays red for
  the same reason — the already-merged `EMAIL_ENABLED=true` + "expose daily delivery failures" gate hitting
  runs with no SMTP secrets. The 07-20 14:14 noon run confirmed failed on that gate. Caretaker opened
  draft **vbfh #5** as a resilience fix.
- **EscapeTheBomb-DC #1** advanced (new 07-20 commits: blender-mcp interactive-art lane declared,
  physics-free ending-trigger test hook, sky-light perf mode; terrain visual review recorded as BLOCKED
  on opaque capture output). Still draft, no cloud build. No merges.
- No merges in shadow-engineer-rpa (last commit 2026-07-09, dormant).

## Branch cleanup — awaiting one-click approval

Still awaiting Anthony's "clean the merged branches" go-ahead (never deleted unprompted). The prior
provably-merged amma list stands, extended by the merged branches behind #163–#167. Keep active:
`automation/status` (this dashboard) and the current `claude/*` caretaker working branches. The
`voice/twiml-stream-fallback` and `voice/vbfh-tester-171128` branches are old (June, pre-#141) — leave
for Anthony to judge, not on the auto-clean list.

**vbfh-media-engine:** `claude/build-automation-management-sh68i3`, `feat/facility-info`,
`claude/vbfh-broadcast-instagram-e6p75v` — all merged, safe to delete.
**EscapeTheBomb-DC:** `codex/*` exploration set + `phase2`–`phase7` ladder — none merged by commit.

## Run log

- **2026-07-20 (evening) — Twice-daily check-in (`claude-opus-4-8`):** VBFH Daily Run still red — the
  07-20 14:14 UTC noon scheduled run failed on the same by-design email-delivery gate (no SMTP secrets →
  `skipped_config_missing` → exit 1), so it has now failed every scheduled run since 07-19. Re-confirmed
  via job logs that the content pipeline itself completes (`needs_review`, `gamesFound:0` = known DaySmart
  limitation). **Action taken this run:** opened **draft PR #5 (vbfh, branch `claude/pensive-edison-hl5sxo`)**
  that treats `skipped_config_missing` (email switched on but not configured yet) as non-fatal while still
  failing on a real SMTP `failed` — turning the daily run green without secrets, but *not merged*, so
  Anthony's "expose delivery failures" intent is preserved and he chooses (merge #5 / add secrets / both).
  **New since last run:** **amma #168 opened** (draft grant-application doc, Vercel ✅, no guardrail routes);
  **EscapeTheBomb #1** advanced with 07-20 commits (blender-mcp art lane, ending-trigger test hook, sky
  perf mode; terrain review BLOCKED on opaque capture) — still draft, no cloud build. All other builds
  green (amma `CI — web` ✅ tip `10be3ef` / `voice-gateway` path-filtered ✅; vbfh `CI` ✅). shadow dormant
  (07-09). No new human review comments needing a reply (only the Vercel bot on #161/#168). No PRs
  self-merged (all remaining are review-only / draft / guardrail). Refreshed this dashboard. No branches
  deleted.
- **2026-07-20 (morning) — Twice-daily check-in (Opus 4.8):** **VBFH Daily Run still red** — latest run
  (07-19 13:25 UTC scheduled) failed on the same by-design email-delivery gate (no SMTP secrets); today's
  noon run had not appeared at check-in. Re-confirmed via job logs that the content pipeline itself
  completes (`needs_review`, `gamesFound:0` = known DaySmart limitation) and the exit-1 is purely the
  required-email gate (`run-daily-league-content.ts:37-41`). Not silently patched (Anthony's deliberate
  "expose delivery failures" choice) — kept as the top action. **New since last run: #165/#166/#167 all
  merged to `main`** by Anthony (public landing motion, `page.tsx` only), post-merge `CI — web` ✅ at
  `10be3ef` — main healthy. **EscapeTheBomb #1** advanced with 07-20 asset-factory commits (still draft,
  no cloud build). All other builds green (amma `CI — web`/`voice-gateway`, vbfh `CI`). shadow dormant
  (07-09). No new review comments needing a reply. No safe auto-mergeable PRs (all remaining are
  review-only/draft/guardrail). Refreshed this dashboard. No branches deleted.
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
