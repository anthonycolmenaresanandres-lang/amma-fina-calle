# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-07-25 (evening twice-daily check-in — **everything green, nothing red anywhere, no code action needed.** Since the 07-25 morning run: (1) the **VBFH Daily Run fired 07-25 13:42 UTC and SUCCEEDED** (run #52 — five scheduled runs in a row green: 07-21/22/23/24/25), and (2) one **new additive docs-only draft** opened in amma — **#189** (Odyssey Daily production log: Day 02 shot blocked because the Runway credit pool is exhausted; +6 lines to `STUDIO/ODYSSEY_DAILY/DAILY_LOG.md` only, Vercel **green**, no app routes / Supabase / Stripe / secrets). No new merges to any default branch — amma `main` tip still `90f31bb` (#188), vbfh master `fec7266` (#6), shadow `5113ce5` (07-09), all unchanged. Open-PR set is now #189/#180/#161/#168/#162 (amma), vbfh #4, EscapeTheBomb #1 — all checks green, only Vercel bot comments, no new human review comments anywhere. Caretaker took no code action beyond this dashboard.)
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets) still wait for Anthony's explicit go-ahead. Drafts are held by their author and are not caretaker-merged.
**Caretaker model:** pinned to **Opus 4.8** (`/model` is a CLI command, not runnable from the shell in this env; ran as configured `claude-opus-4-8`). Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

1. **(Optional) Add the 5 VBFH email secrets so you actually RECEIVE the daily email.**
   The Daily Run is green and staying green — it no longer fails on missing SMTP config. But it still
   won't *send* you anything until the secrets exist. Add them in vbfh-media-engine → Settings → Secrets
   and variables → Actions → `EMAIL_TO`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (optional
   Variables `SMTP_PORT` default 587, `SMTP_SECURE` `true` only for port 465). Tell me your mail provider
   and I'll give you the exact host/port. (Same secrets ask as PR #4.)
2. **PR #180 (amma): review the `vercel-dash-report` skill, then mark it "Ready" (or say "merge it").**
   Additive skill + scripts + 7 passing tests that turn your Vercel-dashboard screenshots into a traffic
   ledger feeding this daily report. Vercel **green**, `clean`, no app routes / Supabase / Stripe / secrets.
   It's a **draft**, so I left it for you — flip it to Ready (or tell me to merge) and I'll land it.
3. **Review & merge PR #161 (Add ethical sales conversion system)** — your call. Evidence-first AMMA
   sales-conversion skill + scripts, routed through the business router. Build/Vercel **green**, touches
   no guardrail routes, but it's a substantive new feature — open the Vercel preview and merge when happy.
4. **PR #168 (amma) — review the grant-application draft, then submit it yourself.**
   `BUSINESS/GRANT_APPLICATION_DEV_PC.md` — a paste-ready ~$1,900 dev-PC grant application. Draft, Vercel
   **green**, no code/guardrail routes. Nothing is auto-submitted. NOTE: its branch also carries the old
   screenshot-trap decoy commits that are now obsolete; if you ever merge #168, take only the grant-app doc.
5. **PR #4 (vbfh) — confirm the "Claude QA's the images before emailing" routine.** The code half is
   done and green; held as draft. Beyond the SMTP secrets (item 1), it asks you to confirm the separate
   scheduled-QA routine before that piece gets built.
6. **PR #162 (owner portal installable) — your explicit go-ahead needed.** Draft, green. Adds an
   installable web-app manifest + icons to `/owner/[id]`. Sits on a **protected owner route**, so it stays
   a hard-guardrail item — not caretaker-mergeable.
7. **PR #189 (amma) — new docs-only draft, nothing needed unless you want it landed.** Odyssey Daily
   production-log entry (Day 02 shot blocked — Runway credit pool exhausted). Vercel **green**, docs only.
   Held as a draft by its author; flip to Ready or say "merge it" and I'll land it. Ops note inside: the
   daily film shot and client art share one Runway credit pool — top up credits or schedule client art
   *after* the daily shot so a heavy art day doesn't starve the next morning's shot.
8. **(If not already done) Run the Marbel admin SQL in Supabase.** From #150: Supabase SQL editor →
   run `0009_admin_team_update.sql` (or `supabase db push`) to grant `marbeljsiado@gmail.com` admin.
   I can't see Supabase state from here — skip this if you already ran it.
9. **⛔ Branch cleanup — still needs you to run it (or approve deletion).** You asked to clean the
   branches. I identified the safe-to-delete set (below), but this environment's safety classifier blocks
   automated branch deletion (`git push --delete`) in auto mode, and there's no branch-delete API tool. So
   the stale branches are still there. **Two ways to clear them:** (a) paste the two commands in the
   "Branch cleanup — ready to run" section below, or (b) reply "you have permission to delete branches" and
   I'll retry. I will NOT delete anything until one of those.

_Resolved / no action:_ **VBFH Daily Run stays GREEN** — 07-25 13:42 UTC run #52 succeeded (five in a
row). **Las Palmas demo wave merged by Anthony** — **#187** (photo dropdown menu + fiesta game art +
Odyssey Daily docs), **#188** (full square menu photos fix); both post-merge `CI — web` ✅, main tip
`90f31bb`. Additive demo assets, non-human Burrito/Quesabirria mascots with primitive fallback,
demo/noindex routes only, no protected Client-OS routes / DB / billing / secrets, Colattao QR URL
untouched. Earlier **prospect/demo wave** (#183/#184/#185/#186), **Table-OS wave** (#181/#182) and
**Bodega menu-review wave** (#175/#176/#178/#179) stay merged. The 3 superseded drafts closed 07-23
(#169/#173/#177) stay closed. **#29 stays closed** (07-18). shadow-engineer-rpa dormant (07-09).

---

## Build health (as of 2026-07-25, evening)

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip `90f31bb` (**#188**, "full square menu photos in Las Palmas dropdowns"); latest `CI — web` ✅ (2026-07-25 10:47 UTC). No new commits to main since the morning run. voice-gateway CI path-filtered, last run ✅ (no voice changes since 07-09). |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" scheduled | CI ✅ on master (2026-07-22 02:08 UTC); master tip `fec7266` (**#6**, "Fail closed on missing scheduled league data") — unchanged. **VBFH Daily Run — GREEN.** Latest scheduled run **07-25 13:42 UTC succeeded** (run #52; 07-21/22/23/24 also ✅ — **five green in a row**). The email-gate fix holds (`skipped_config_missing` non-fatal; a real SMTP `failed` still fails). Content pipeline completes (`needs_review`, `gamesFound:0` = known DaySmart standings-only limitation, not a regression). |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · no workflows (0 runs) · master tip `5113ce5`, last commit 2026-07-09 |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | Draft PR #1 (M1 scaffolds), tip `bb0eea8`, unchanged since 07-20; nothing to build in cloud |

## Open PRs

- **amma #189 — Odyssey Daily log — Day 02 blocked (Runway credit pool exhausted)** (open **draft**,
  Vercel **green**). Docs-only, +6 lines to `STUDIO/ODYSSEY_DAILY/DAILY_LOG.md`; no app routes / Supabase /
  Stripe / secrets. Held as draft → Anthony to mark Ready or say "merge it" (item 7). Bot comment only.
- **amma #180 — `vercel-dash-report` skill (traffic ledger feeding the daily report)** (open **draft**,
  Vercel **green**, `mergeable_state: clean`). Additive skill + scripts + 7 passing tests; appends to
  `BUSINESS/ANALYTICS/vercel-traffic-ledger.jsonl`; no app routes / Supabase / Stripe / secrets. Held as
  draft → Anthony to mark Ready or say "merge it" (item 2). Vercel bot comment only.
- **amma #161 — Add ethical sales conversion system** (open, **green**, no guardrail routes).
  Awaiting Anthony's review/merge (item 3). Bot comments only; no human review comments.
- **amma #168 — grant application draft (dev PC)** (open **draft**, Vercel **green**). Docs-only grant
  doc; branch also carries now-obsolete decoy commits (item 4). Bot comments only.
- **amma #162 — Make owner portal installable** (open **draft**, CI **green** — `web` ✅ + Vercel ✅).
  Protected `/owner/[id]` route → hard-guardrail item for Anthony (item 6).
- **vbfh #4 — email a copy-paste-ready post package** (open **draft**, CI **green** — `check` ✅).
  Held pending Anthony's SMTP secrets + QA-routine confirmation (items 1 & 5). No guardrail routes. No comments.
- **EscapeTheBomb-DC #1 — M1 master plan + P5–P8 scaffolds** (open **draft**, no CI). Unchanged since
  07-20; not "green" until the M2 Windows compile-verify gate. Never merged without Anthony.
- No open PRs in shadow-engineer-rpa.

## Merged / closed since last run

- **No merges and no new commits on any default branch** since the 07-25 morning run. amma `main` tip
  still `90f31bb` (#188), vbfh master `fec7266` (#6), shadow `5113ce5`, EscapeTheBomb head `bb0eea8`.
- **New:** draft **#189** opened in amma (Odyssey Daily docs, docs-only, Vercel ✅) — see Open PRs. The
  VBFH Daily Run fired 07-25 13:42 UTC and succeeded (run #52).
- No new human review comments anywhere (only Vercel bot comments on the open PRs). The Las Palmas demo
  wave (#187/#188), prospect/demo wave (#183/#184/#185/#186), Table-OS wave (#181/#182), Bodega wave
  (#175/#176/#178/#179), and the 3 superseded drafts closed 07-23 (#169/#173/#177) stay as-is. #29 stays closed.

## Branch cleanup — ready to run (2026-07-23, updated 2026-07-25 eve)

Anthony gave the go-ahead ("clean branches please"), but this environment's safety classifier blocks
automated branch deletion, so the commands below are ready for Anthony to paste (or to authorize the
caretaker to retry). Every branch listed is either **provably merged** or a **just-closed superseded**
draft. **Verified KEEP (do NOT delete):** `main`, `automation/status`, the `claude/*` caretaker working
branches, and all open-PR heads — amma `codex/ethical-sales-conversion-20260718` (#161),
`codex/owner-portal-app-20260718` (#162), `claude/escape-bomb-dc-plan-n6bfj5` (#168),
`claude/blissful-darwin-ddej93` (#180 head), **`claude/las-palmas-menu-game-59vtbg` (now the open #189
head — NO LONGER safe to delete; it carries #189's unmerged docs commit)**; vbfh
`claude/pensive-edison-sove8x` (#4 head). Old June `voice/twiml-stream-fallback` /
`voice/vbfh-tester-171128` are NOT merged — left for Anthony's judgment. EscapeTheBomb `codex/*` +
`phase2`–`phase7` are unmerged exploration — left in place.

**amma-fina-calle** (4 merged + 3 closed-superseded):
```
git -C amma-fina-calle push origin --delete \
  codex/free-video-game-visuals-20260718 codex/free-visual-toolkit-20260718 \
  codex/small-model-skill-selector-20260718 ops/data-center-docs \
  claude/screenshot-trap-landing claude/screenshot-trap-live agent/bodega-line-motion-20260722
```
**vbfh-media-engine** (4 merged):
```
git -C vbfh-media-engine push origin --delete \
  claude/pensive-edison-hl5sxo claude/build-automation-management-sh68i3 \
  feat/facility-info claude/vbfh-broadcast-instagram-e6p75v
```

## Run log

- **2026-07-25 (evening) — Twice-daily check-in (`claude-opus-4-8`):** **Checked, all green, no code
  action needed.** No merges or new commits on any default branch since the morning run (amma `main`
  `90f31bb`, vbfh master `fec7266`, shadow `5113ce5` — all unchanged). **VBFH Daily Run fired 07-25 13:42
  UTC and SUCCEEDED** (run #52 — five scheduled runs green in a row). One new additive docs-only draft in
  amma — **#189** (Odyssey Daily production log, Day 02 shot blocked on exhausted Runway credit pool; +6
  lines to `STUDIO/ODYSSEY_DAILY/DAILY_LOG.md`, Vercel ✅, no app routes / Supabase / Stripe / secrets),
  held as draft for Anthony. Corrected the branch-cleanup note: `claude/las-palmas-menu-game-59vtbg` now
  carries #189's open commit and is no longer safe to delete. All open-PR checks green
  (#189/#180/#161/#162/#168 Vercel/web ✅; vbfh #4 `check` ✅); only Vercel bot comments, no new human
  review comments anywhere. EscapeTheBomb #1 unchanged (07-20); shadow dormant. #29 stays closed. No
  branches deleted (still awaiting Anthony to run the ready commands or authorize a retry).
- **2026-07-25 (morning) — Twice-daily check-in (`claude-opus-4-8`):** **Checked, all green, no code
  action needed.** Anthony merged **#187** (Las Palmas photo dropdown menu + fiesta game art with
  non-human Burrito/Quesabirria die-cut mascot kickers + Odyssey Daily docs) and **#188** (full square
  menu photos, no cropping). Both post-merge `CI — web` ✅; main tip `90f31bb`. VBFH Daily Run green.
- **2026-07-24 (evening) — Twice-daily check-in (`claude-opus-4-8`):** **Checked, all green.** Anthony
  merged **#183/#184/#185/#186** (Las Palmas penalty-skin demo, stable Bodega slug, prospect QR field
  pack, docs); post-merge `CI — web` ✅, main tip `e8fdafb`. VBFH Daily Run 07-24 13:52 UTC ✅ (run #51).
- **2026-07-24 (morning) — Twice-daily check-in (`claude-opus-4-8`):** All green; Table-OS prospect PRs
  #181/#182 merged (post-merge `CI — web` ✅, main tip `b05007d`); new draft #180 held for Anthony.
- **2026-07-23 (evening) — Twice-daily check-in (`claude-opus-4-8`):** All green; VBFH Daily Run
  (07-23 14:10 UTC) succeeded — three green in a row. No merges/PRs/commits/human review since midday.
- **2026-07-23 (midday) — Owner request "close all that need closing + clean branches" (`claude-opus-4-8`):**
  Closed the 3 superseded drafts — #169, #173, #177. Built the verified branch-cleanup set; deletion
  blocked by the env safety classifier — left ready-to-run commands.
- **2026-07-23 (morning) — Twice-daily check-in (`claude-opus-4-8`):** Bodega menu-review wave merged
  (#175/#176/#178/#179), post-merge `CI — web` ✅, main tip `ad9773a`. VBFH Daily Run GREEN.
- **2026-07-22 (evening) — Twice-daily check-in (`claude-opus-4-8`):** All green; VBFH Daily Run
  (07-22 14:04 UTC) succeeded. No merges/PRs/commits/human-review since morning.
- **2026-07-22 (morning) — Twice-daily check-in (`claude-opus-4-8`):** #174 merged. Stale draft #173
  flagged superseded. VBFH Daily Run green. All open-PR checks green.
- **2026-07-21 (evening) — Twice-daily check-in (`claude-opus-4-8`):** VBFH Daily Run recovered (07-21
  14:01 UTC ✅). Anthony merged #170→#171→#172; flagged #169 superseded. All green.
- **2026-07-21 (morning) — Twice-daily check-in (`claude-opus-4-8`):** **Acted:** squash-merged vbfh #5
  to master (`17d479e`) to stop the Daily Run failing on the missing-SMTP gate. All else green.
- **2026-07-20 (evening) — Twice-daily check-in (`claude-opus-4-8`):** VBFH Daily Run red (by-design email
  gate). **Opened draft PR #5 (vbfh)** treating `skipped_config_missing` as non-fatal. #168 opened.
- **2026-07-20 (morning) — Twice-daily check-in (Opus 4.8):** VBFH Daily Run red. #165/#166/#167 merged.
- **2026-07-19 (evening/midday) — Twice-daily check-ins (Opus 4.8):** VBFH Daily Run red (diagnosed).
  #163/#164 merged to main. All other builds green.
- **2026-07-18 (evening/morning) — Twice-daily check-ins (Opus 4.8):** All four repos green. vbfh #4 +
  amma #161 opened; #29 closed by Anthony. No red builds.
- **2026-07-09 — Merge waves + Opus pin + post-merge CI verified.** #150 + #136 merged; Marbel `0009`
  admin migration prepared for Anthony. Recreated caretaker Routine pinned to Opus 4.8.
- **2026-07-08 — Setup run.** Surveyed 4 repos + GitHub + Vercel; added CI to amma + vbfh; fixed lint;
  triaged all open PRs; built branch-cleanup lists; stood up the twice-daily caretaker.
