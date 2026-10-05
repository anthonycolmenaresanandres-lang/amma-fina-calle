# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-10-05 (evening check-in, `claude-opus-4-8`). **Headline: quiet, healthy build run — zero failing workflows anywhere; no caretaker fix needed. Since this morning's run amma `main` advanced `e3bf7b5`→`6f7c66b` via THREE more of Anthony's own merges #310/#311/#312 (all `CI — web` green #329/#331/#333).** The merges: **#310** "Add Maracaibo lakefront cartoon penalty stadium" (`CI — web` **#329 ✅**) — an original 5.8 KB cartoon lakefront-stadium SVG (Rafael Urdaneta-inspired bridge, palms, Venezuelan tricolor terraces + eight stars) behind the Maracaibo penalty pitch via the existing optional-background path; primitive fallback preserved; **#311** "Integrate full-screen Maracaibo Penalty Rush artwork" (`CI — web` **#331 ✅**) — reuses the saved full-screen Penalty Rush layout and layers the approved stadium + transparent-grass images behind existing markings/goal/cartoon characters; multiplayer + primitive fallback preserved; **#312** "Build local isometric Command Center campus" (`CI — web` **#333 ✅**) — rebuilds the **internal** `(internal)/command-center` route as a selectable isometric AMMA ops campus (all 54 existing links preserved + a full-list fallback, keyboard nav, mobile access), explicitly "no backend, dependency, billing or game changes; destination authorization + noindex unchanged." **No new Supabase migration this run** — the pending set is **unchanged** at `0015`–`0023` + `20261004094018_maracaibo_table_visits` (+`0009`). **Caretaker guardrail read: all three are Anthony's own merges and guardrail-clean — game art (national-colors/landmark scenery, non-human/caricature, no club/league/event mark, no real face, no client logo) + an internal ops-directory UI; the diff touches only `(internal)/command-center/*`, `penalty/*`, `table-os/maracaibo/*`, two stadium PNG/SVG assets and OPERATIONS docs — no `/m/[id]`, no `/owner/[id]`, no `/customers`, no Supabase, no Stripe/Square/POS, no secrets.** **#302's standing items are UNCHANGED and still need Anthony:** (1) the pending Supabase migrations incl. `20261004094018_maracaibo_table_visits.sql`, and (2) the `/customers/maracaibo-tables` game-seat surface it added (owner's own merge → flagged, never reverted). **vbfh `master` unchanged at `75f9668`** — the "VBFH Daily Run" stays `activation held` (manual-dispatch only; **#121 (10-01) remains the last automatic run; no #122 fired or will auto-fire** by design; workflow state `active`, `schedule:` trigger commented out). **No new drafts; none of the 8 held drafts changed; no new human review comments anywhere (#310–#312 carry only Vercel + Codex-review bots; all author-approved + merged within minutes).** Default branches re-verified live: amma **`6f7c66b`** (advanced), vbfh `75f9668` (unchanged), shadow `5113ce5` (dormant), EscapeTheBomb `eee6a37` (unchanged). amma `CI — web` ✅ (**#333** on main) + `CI — voice-gateway` ✅ (**#23**, unchanged — no voice-gateway code this run); vbfh build `CI` ✅ (**#35** on master). **Zero failing workflow runs across all four repos this run.** shadow & EscapeTheBomb have no CI workflows (0 runs). **Eight** open amma drafts (#277/#259/#238/#225/#221/#219/#218/#197 — all held, all Vercel ✅; no new human review comments). No merge-conflict/base-branch notices; GitHub API healthy all run. #218 governance question stays open; #29 stays closed (07-18). Branch cleanup still 403-blocked (open draft heads excluded).
**Autonomy level:** fix + push + PRs + **merge green/safe PRs**; hard-guardrail PRs (Supabase / protected routes / access grants / secrets / Stripe / Square / POS / customer data / Twilio-SMS go-live) still wait for Anthony's explicit go-ahead. Drafts are held by their author and are not caretaker-merged. Supabase migrations are prepared as code only — **Anthony runs the SQL**.
**Caretaker model:** pinned to **Opus 4.8** (`/model` is a CLI command, not runnable from the shell in this env; ran as configured `claude-opus-4-8`). Every summary leads with **👉 WHAT I NEED FROM YOU** in plain terms.
**Reporting:** push notification + email summary after each twice-daily run, plus this file.

---

## 👉 What Anthony needs to do right now

🟡 **The one real standing to-do: run the pending Supabase migrations — `0015` through `0023` PLUS
   `20261004094018_maracaibo_table_visits.sql`.** All under `APP/web/supabase/migrations/`. The set: rewards
   `0015`–`0018` (#260–#264), Bodega launch + Square `0019`–`0022` (#266), Bodega Basic billing `0023` (#270),
   `20261004094018_maracaibo_table_visits.sql` (#302 — two RLS-enabled, `service_role`-only tables + a `maracaibo_visit`
   RPC for the table-QR game-seat feature, explicitly *game membership only — never authorizes ordering or payment*),
   plus `0009` Marbel admin grant. **Unchanged this run — no new migration landed.** The site **builds and deploys
   green** (Vercel/CI never touch the DB), but the Bodega rewards + guest-notes + Square read-model + Bodega Basic
   billing features **and the Maracaibo table-visit / multiplayer football game error at runtime until the matching
   migration is applied.** **What to do:** Supabase SQL editor → run `0015`…`0023` in order, then the
   `20261004094018_...` file (or just `supabase db push` from `APP/web/`, which applies all of them in order and folds
   in `0009` Marbel). **Skip any you've already run.** _(I never run SQL against Supabase — the migrations are prepared
   code; you run them.)_

🆕 **Traffic morning-report email is now code-ready (optional — your own merge #305; only matters if you want it live).**
   #305 isolated the daily traffic email onto **dedicated credentials** (`TRAFFIC_RESEND_API_KEY`, `TRAFFIC_FROM_EMAIL`,
   `TRAFFIC_MORNING_REPORT_EMAIL`) with **no fallback** to the shared request/pitch mail, and made the native-cron Square
   token refresh **fail closed** unless `SQUARE_REFRESH_CRON_ENABLED=true` (so adding report credentials can never
   accidentally start refreshing Square). **To turn the traffic email on:** follow the runbook
   `OPERATIONS/TRAFFIC_ONLY_ACTIVATION_20261004.md` — set those 4 Production-only env vars yourself (plus `CRON_SECRET`),
   redeploy, confirm readiness at the private `/api/internal/traffic/morning?dryRun=1` (no-send), then run **one**
   verification send. **This is secrets/activation territory, so it's yours — I never handle secret values.** No action
   if you don't want the email yet; nothing sends on its own (cron fails closed until configured).

🆕 **Heads-up (no fix needed, your own change): merge #302 added a page/API under the protected `/customers` route.**
   It added `APP/web/src/app/customers/maracaibo-tables/` (a staff "Table Visits Desk" page) and the `/api/maracaibo/tables`
   + `/api/maracaibo/visit/[tableId]` routes. `/customers` is a hard-guardrail Client OS route, so I **don't touch it**
   and **don't revert your own merge** — flagging it so you're aware a game-seat surface now lives under `/customers`.
   Caretaker read: it's game-membership tracking (no ordering/payment, no customer PII), and CI/Vercel are green. No
   action needed unless this wasn't the intent.

🆕 **Heads-up (no fix needed, your own change): the VBFH "Daily Run" no longer runs itself.** Your reliability-wave
   merges (#9–#12) renamed the workflow to *"VBFH Daily Report — activation held"* and removed its auto-schedule, so
   it's now **manual-dispatch only**. **#121 (10-01, green) was the last automatic run; there will be no daily #122+
   until you activate it.** **Your call:** (a) leave it manual and fire it yourself from the Actions tab
   (`Run workflow`) when you want content, or (b) tell me to re-enable a daily auto-schedule (I can prepare the
   workflow change as a PR; the PRs flag that a persistent runner + independent QA watch are the proper home for
   auto-activation). No action if you're happy running it on demand.

_The items below are unchanged standing gates — no new action this run; listed so nothing falls through._

🆕 **Fina Calle voice + SMS line — live Twilio activation is yours (phone-line territory).** The voice-gateway code
   keeps advancing via your own merges (#272 landed the base; **#294** added voice-only second-number routing +
   refreshed VBFH knowledge; **#297** corrected call-outcome + staff-notification reporting; all `CI — voice-gateway`
   green). **This is all code + docs + `tenants.json` — live routing, Twilio number registration, and A2P/10DLC brand
   approval for +1 757 300 1118 remain your manual steps.** Nothing dials or texts automatically.

🆕 **Bodega Basic billing (Stripe) is wired — activation is yours (payments territory).** Prior merge **#270** added
   the private monthly enrollment (`/owner/bodega/billing`, `api/stripe/webhook`, `lib/billing/*`,
   `lib/stripe/server.ts`) + migration `0023`. **Charging real money needs you** to set the live Stripe keys/price and
   switch it on — nothing bills automatically.

🟡 **Square connector activation is yours (payments/POS territory).** #266/#268/#269 added the Square OAuth connector +
   owner onboarding one-link flow, kept **read-only/private** with credentials + seller OAuth as separate gates. If/when
   you want it live, **you** set the Square app credentials + run the OAuth connect.

⚠️ **Governance question inside draft PR #218 — please confirm or deny (no action taken).** Draft **#218** ("E-Myth
   Revision 4", docs-only, Vercel ✅) has an open flag: its Revision-4 commits were authored by **"Clone"** asserting
   *"Anthony explicitly directed `Revise pr218`."* `CLAUDE.md` scopes Clone to **watching**, not authoring. **Did you
   direct that revision?** Yes → stays a held draft for your merge call; No → you may want to close it / reset the branch.

🆕 **Draft PR #238 "Menu Control owner app plan" — two items still need your call (held docs draft).**
   - **Reconcile the Colattao menu (blocks queue item 49).** Guest menu at the printed QR is a **static file** while
     the owner portal writes to **Supabase**; the two have **drifted** ("Fall Drinks"/51 vs "Seasonal Drinks"/~54).
   - **A confirmed live bug on the guest menu.** A price of `0` should read "Ask staff," but the guest screen renders
     `$0.00`. `House Brew` is seeded at `0` and is first on the menu. Queued for Codex (item 49); touching `/m/[id]`
     is outside what I'm allowed to do. _(Your own merge #276 "Fix stable client menu destinations" touched
     `/m/[id]/page.tsx` + `lib/guest-menu.ts` — if that already fixed the `$0.00` display, let me know and I'll close
     the item.)_

🆕 **Four demos/add-ons still open for your review & merge call (held drafts, guardrail-clean):**
   - **#277 Seasonal restaurant skins work orders** — docs-only (spec + 13-row CSV under
     `OPERATIONS/WORK_ORDERS/SEASONAL_SKINS/` + queue item 75, QUEUED/NOT STARTED). `mergeable_state: clean`, Vercel ✅.
     Body notes *"Commercial proposals still require review before release."* **Held.**
   - **#225 Instagram Ordering Activation add-on** — docs + local tooling only. `mergeable_state: clean`, Vercel ✅.
   - **#221 Order Drop** — Colattao Churro Latte promo → Uber Eats. `web` CI ✅, Vercel ✅.
   - **#219 Las Palmas lotería hero** — playable penalty shootout minting a lotería card per goal. Vercel ✅.
   Open each preview and merge if you like it, or tell me what to change. **I don't auto-merge your drafts.**
   _(#259 "Grúa cable-crane R&D game" also stays held — internal noindex `/grua-lab`, body says "do not merge without
   Anthony's approval". #215's Table Duel deploy step is still yours — set the Render blueprint + `NEXT_PUBLIC_TABLE_DUEL_WS`.)_

1. **Add the 5 VBFH email secrets (optional — only matters once you want the email send).** vbfh-media-engine →
   Settings → Secrets and variables → Actions: `EMAIL_TO`/`EMAIL_FROM`/`SMTP_USER` = `anthonycolmenaresanandres@gmail.com`,
   `SMTP_HOST` = `smtp.gmail.com`, `SMTP_PASS` = a Gmail **App Password** (myaccount.google.com/apppasswords; needs
   2-Step Verification). Port 587 default is correct. The Daily Run is green, so the send step is now reachable
   once these exist (fire it via manual `workflow_dispatch`).
2. **Confirm the "Claude QA's the images before emailing" routine (PR #4's open question).** Code half landed
   (#5+#7); #4 closed as superseded. Say yes + timing and I'll build it.
3. **Runway credits — still blocked (#197 draft logs Day 06 blocked).** Top up, or schedule client art after the daily shot.
4. **Grant application is on `main` — submit it yourself when ready.** `BUSINESS/GRANT_APPLICATION_DEV_PC.md`.
5. **(If not already done) Run the Marbel admin SQL** — folds into the `supabase db push` above (`0009`).
6. **⛔ Branch cleanup — you approved it, the environment still physically blocks it.** `git push --delete` returns
   **HTTP 403 from the session's git proxy** (server-side) and the GitHub tooling here has no branch-delete API.
   Paste-ready safe-to-delete commands are below; they run fine from your local clone. Excludes the eight open draft heads.

_Resolved / no action needed from you:_ **amma #310/#311/#312 — your own merges** (10-05; `CI — web`
#329/#331/#333 green; #310 Maracaibo lakefront-stadium SVG scenery, #311 full-screen Penalty Rush artwork, #312 internal
isometric Command Center campus — game art + internal ops-directory UI; no migration, no `/m`/`/owner`/`/customers`, no
Stripe/Square/POS, no secrets; recorded). **amma #307/#308/#309 — your own merges** (10-04→10-05; `CI — web`
#323/#325/#327 green). **#307** realistic Venezuelan flag + Fina Calle credit in the Maracaibo header (demo visuals;
public-domain flag concept); **#308** tequeño shooter + satirical keeper goal-reaction sprites (your own supplied,
reviewed, explicitly approved game art — "Great place them and merge," 22:38 UTC; non-human/caricature, primitive
fallback kept); **#309** a route-export build fix (removes the invalid `export` from the Bodega + Colattao billing
page helpers so the Next.js build passes) + three Maracaibo visual files. **Guardrail read: #309 touches two `/owner`
billing pages but as export VISIBILITY only — ZERO diff in billing terms/actions/provider config or database; no
migration, no Stripe/Square/POS, no secrets, no `/m/[id]`; flagged for your awareness, not reverted.** **amma #304/#305/#306
— your own merges** (10-04; `CI — web` #317/#319/#321 green; #304 code-native SVG header wordmark, #305 traffic-email
isolation onto dedicated `TRAFFIC_*` credentials [optional activation above], #306 transform-only flag sway; recorded).
**amma #300/#301/#303 — your own merges** (10-03→10-04; `CI — web`
#309/#311/#315 green; Maracaibo table-OS **game** work — four-player football + Venezuela stadium skin/kits + Venezuelan
lettering word-art; **no migration, no Stripe/Square/POS, no secrets, no `/m/[id]` or `/owner/[id]`**; national-colors
game art only; recorded). _(#302 is your own merge too but is listed ABOVE under the to-do list — it carries the
Supabase migration + the `/customers` game-seat surface, which need you.)_ **amma #294/#295/#296/#297/#298/#299 — your
own merges** (10-02→10-03; all CI green; voice-gateway code + docs + `tenants.json`, internal Bodega demo menu + docs,
Maracaibo table-OS demo + supplied/approved logo + public-domain flag concept + docs; **no migration, no
Supabase/Stripe/Square/POS, no secrets, no protected route**; recorded).
**amma #293 "Use Neon-injected Production traffic database URL" — your own merge** (10-01; `CI — web` #301 green; reads
the Neon integration traffic DB URL; `.env.example` var names only; no Supabase migration). **amma site-scoped traffic /
morning-report wave (#290/#291/#292) — your own merges** (10-01; `CI — web` green, no migration). **amma "Project Seed"
waves (#278/#280/#282/#283 + October #287/#288/#289) — your own merges** (09-29→09-30; `CI — web` green, no migration;
additive `/play/project-seed` + internal demo + non-human aswang mascot; no protected route / Supabase / Stripe / Square).
**VBFH Daily Run outage (09-26→09-28) — SELF-RESOLVED** (#119/#120/#121 green; fix request withdrawn). **amma #276 "Fix
stable client menu destinations" — your own merge** (09-29; `CI — web` #274 green; touches `/m/[id]` + owner QR routes +
new `lib/guest-menu.ts`, no migration, printed Café Rush QR untouched; recorded). **amma owner-portal wave
(#273/#270/#272) + Bodega waves (#260–#272) — your own merges** (migrations `0015`–`0023`). **GitHub API access** healthy.
**amma #29 ("AI Request Desk — Phase 0")** — closed since 07-18.

---

## Build health (as of 2026-10-05, evening)

> **✅ All columns re-verified live this run** — check-runs, Daily-Run jobs/steps, commit file-lists, and
> default-branch tips read directly via API. **Zero failing workflow runs anywhere this run.**

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip **`6f7c66b`** ("Build local isometric Command Center campus (#312)," 10-05 18:20 UTC; **Anthony's own merge**, `CI — web` **#333 ✅**). **Advanced since the morning run** `e3bf7b5`→`6f7c66b` via **THREE of Anthony's own merges** (all `CI — web` green): **#310** "Add Maracaibo lakefront cartoon penalty stadium" (`#329 ✅`) — an original cartoon lakefront-stadium SVG (bridge/palms/tricolor terraces + eight stars) via the existing optional-background path, primitive fallback preserved; **#311** "Integrate full-screen Maracaibo Penalty Rush artwork" (`#331 ✅`) — full-screen Penalty Rush layout + approved stadium/grass images behind existing markings/goal/characters, multiplayer + primitive fallback preserved; **#312** "Build local isometric Command Center campus" (`#333 ✅`) — rebuilds the **internal** `(internal)/command-center` route as an isometric ops campus (all 54 links preserved + list fallback, keyboard nav, mobile), "no backend, dependency, billing or game changes; destination authorization + noindex unchanged." **Caretaker view: all three are Anthony's own merges and guardrail-clean — game art (national-colors/landmark scenery, non-human/caricature, no club/league/event mark, no real face, no client logo) + an internal ops-directory UI; diff touches only `(internal)/command-center/*`, `penalty/*`, `table-os/maracaibo/*`, two stadium PNG/SVG assets + OPERATIONS docs. No `/m/[id]`, no `/owner/[id]`, no `/customers`, no Supabase, no Stripe/Square/POS, no secrets.** **Anthony's own → no caretaker action; recorded.** **Migration set UNCHANGED this run: `0015`–`0023` + `20261004094018_maracaibo_table_visits`** (+`0009`); #302's migration + its `/customers/maracaibo-tables` game-seat surface remain the standing items that need Anthony. **Eight** open drafts held (see Open PRs). |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" **now manual-dispatch (activation held)** | Build **CI ✅** — master tip **`75f9668`** (unchanged; Anthony's own **#12** "Reduce daily email to results and standings per league," latest run **#35 ✅**). **⚠️ "VBFH Daily Run" is `activation held`:** the reliability wave (#9–#12) renamed the workflow and **removed its active `schedule:` trigger** (`75f9668` has `on: workflow_dispatch` only). **Last automatic run was #121 (10-01, green ~24 min); no #122 fired or will auto-fire** — content now generates only on manual dispatch / owner-approved persistent-runner activation. Build is green; this is an intentional owner change, not a failure. **No caretaker code change needed or pushed.** Scheduled/dispatch mode stays zero-spend (AI/email off by default). **Zero open PRs.** |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · no workflows (0 runs) · master tip `5113ce5`, last commit 2026-07-09 (re-verified) |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | **#1 merged** (M1 scaffolds, squash `eee6a37`, 2026-07-30); zero open PRs · no workflows (0 runs). First Windows compile after pull is the real verify (M2 gate). |

## Open PRs

- **amma #277 (draft, docs-only) — "preserve and queue seasonal restaurant skins work orders."** Head
  `codex/seasonal-skins-queue-20260929`, base `main`. Adds a 25-theme seasonal-skins spec + 13-row work-order CSV
  under `OPERATIONS/WORK_ORDERS/SEASONAL_SKINS/`, queue item 75 (QUEUED — NOT STARTED), and a handoff-log entry.
  `mergeable_state: clean`, Vercel ✅. Body: *"Commercial proposals still require review before release."* **Held;
  his draft; no caretaker merge (unchanged since 09-29).**
- **amma #259 (draft) — "Grúa: cable-crane R&D game on Stringman CDPR physics…"** Internal noindex `/grua-lab`
  Phaser 4 game + opt-in on-device training recorder + docs. Guardrail-clean. Vercel ✅ (head `52b6eac`). PR body:
  *"Do not merge without Anthony's approval."* Only the Vercel bot has commented. **Held.**
- **amma #238 (draft, docs-only) — "Menu Control owner app plan + Codex queue 49/50."** Guardrail-clean, Vercel ✅,
  `mergeable_state: clean`. **Held.** Surfaces two items for Anthony (Colattao static-vs-Supabase menu; `$0.00` vs
  "Ask staff" bug on `/m/[id]` — possibly touched by #276).
- **amma #225 (draft) — "Instagram Ordering Activation add-on."** Docs + local tooling only. Guardrail-clean,
  Vercel ✅, `mergeable_state: clean`. **Held.**
- **amma #221 (draft) — "Order Drop — one-item Instagram → Uber Eats (#220 slice)."** Static `noindex` demo.
  Guardrail-clean. `web` CI ✅, Vercel ✅. **Held.**
- **amma #219 (draft) — "lead Las Palmas with a playable lotería hero."** Primitive art, no client logo.
  Guardrail-clean. Vercel ✅. **Held.**
- **amma #218 (draft, docs-only) — "E-Myth Revision 4 — evidence-bound automation controls."** Vercel ✅,
  path-filtered (no CI). **Held.** ⚠️ Open "Clone"-authored governance question (see top).
- **amma #197 (draft, docs-only) — "Odyssey Daily log — Day 06 blocked (Runway pool empty)."** Vercel ✅,
  path-filtered. **Held.**
- **vbfh / shadow-engineer-rpa / EscapeTheBomb-DC: zero open PRs.**

## Merged / closed since last run

**Since the morning run, amma `main` advanced `e3bf7b5`→`6f7c66b` via THREE of Anthony's own merges #310/#311/#312**
(`CI — web` #329/#331/#333 ✅). vbfh `master` unchanged at `75f9668`; shadow `5113ce5` / EscapeTheBomb `eee6a37`
unchanged. Nothing closed unmerged; **no new actionable human review comments** anywhere (#310–#312 carry only Vercel
deploy previews + the Codex-review bot; all author-approved and merged within minutes). Prior merges #294→#309 retained below.

- **amma #312 — "Build local isometric Command Center campus."** Merged 10-05 18:20 UTC (`6f7c66b`), `CI — web`
  **#333 ✅**. Rebuilds the **internal** `APP/web/src/app/(internal)/command-center` route as a selectable isometric AMMA
  ops campus (new `CampusWorld.tsx`/`CommandCenterClient.tsx`/`campus.ts`/`command-center.module.css` + a
  `command-center-selftest.ts`), preserving all 54 existing destinations with a full-list fallback, global search,
  keyboard nav and mobile access. PR states "no backend, dependency, billing or game changes; destination authorization
  and noindex unchanged." **Internal ops-directory UI only — not a Client OS route; no `/m/[id]`, `/owner/[id]`,
  `/customers`, Supabase, Stripe/Square/POS or secrets.** **Anthony's own merge → no caretaker action; recorded.**
- **amma #311 — "Integrate full-screen Maracaibo Penalty Rush artwork."** Merged 10-05 17:00 UTC (`144aa51`), `CI — web`
  **#331 ✅**. Reuses the saved full-screen Penalty Rush layout and layers the approved Maracaibo stadium + transparent
  grass images behind existing markings/goal/cartoon characters; Back-to-menu control, gameplay, multiplayer and the
  primitive asset fallback preserved. **Game art only — no migration, no `/m/[id]` or `/owner/[id]`, no secrets.**
  **Anthony's own merge → recorded.**
- **amma #310 — "Add Maracaibo lakefront cartoon penalty stadium."** Merged 10-05 13:20 UTC (`178bd13`), `CI — web`
  **#329 ✅**. Adds an original ~5.8 KB cartoon lakefront-stadium SVG (Rafael Urdaneta-inspired bridge, tropical palms,
  Venezuelan tricolor terraces + eight stars) behind the Maracaibo penalty pitch via the existing optional-background
  path, plus the `stadium-lakefront.svg` + two preview PNGs and penalty-renderer wiring. The approved tequeño player,
  keeper/sad-on-goal reaction, controls, scoring, menu and primitive fallback are preserved; "no generated likenesses."
  **Game art only — national-colors/landmark scenery, no club/league/event mark, no real face, no client logo; no
  migration, no route, no secrets.** **Anthony's own merge → recorded.**

- **amma #309 — "Fix billing route exports and refine Maracaibo branding."** Merged 10-05 00:29 UTC (`e3bf7b5`),
  `CI — web` **#327 ✅**. Two one-keyword route-export fixes — removes the invalid `export` from `BodegaBillingContent`
  (`APP/web/src/app/owner/bodega/billing/page.tsx`) and `ColattaoPayments` (`APP/web/src/app/owner/colattao/plan/page.tsx`)
  so Next.js 16 production route validation accepts the page modules (both helpers have only internal callers) — plus
  three Maracaibo visual files (`MaracaiboExperience.tsx` slogan removal + "Venezuelan Food" caption, `MaracaiboFlag.tsx`
  stronger cloth-fold shader, `maracaibo.module.css` sizing) and CODEX_QUEUE/HANDOFF_LOG/two review docs. **⚠️ Touches
  two `/owner` billing pages — but as export VISIBILITY only; PR confirms ZERO diff in billing terms/policies/actions/
  provider configuration, database files, or Maracaibo game code (21 synthetic billing-selftest checks still pass). No
  migration, no Stripe/Square/POS, no secrets, no `/m/[id]`.** **Anthony's own merge → no caretaker action; recorded + billing-page touch flagged.**
- **amma #308 — "feat(maracaibo): add tequeno shooter and keeper goal reaction."** Merged 10-04 22:54 UTC (`b4e4712`),
  `CI — web` **#325 ✅**. Maracaibo penalty-game sprites: a tequeño vinotinto shooter, a satirical keeper, and a
  goal-conceded sad reaction, with scoped lint/types + responsive/goal/save/miss/reset/replay/fallback checks. **Game
  art only — Anthony-supplied, reviewed, and explicitly approved for placement + merge ("Great place them and merge,"
  22:38 UTC per HANDOFF_LOG); non-human/caricature sprites with the primitive fallback preserved; no client logo, no
  league/event/club mark, no real-face branding generated here; no `/m/[id]` or `/owner/[id]`, no migration, no
  secrets.** **Anthony's own merge → no caretaker action; recorded.**
- **amma #307 — "Show realistic Venezuelan flag in Maracaibo header and credit Fina Calle."** Merged 10-04 21:58 UTC
  (`767714e`), `CI — web` **#323 ✅**. Deforms the flag fabric with joined SVG sections + smooth textured deformation,
  places the flag in the Maracaibo demo header, and credits Fina Calle. **Demo header visuals only — public-domain
  national-flag concept (no club/league/event mark, no real face, no client logo); no migration, no route, no secrets.**
  **Anthony's own merge → recorded.**
- **amma #306 — "style(maracaibo): add subtle flag wave."** Merged 10-04 20:53 UTC (`176093b`), `CI — web` **#321 ✅**.
  `MaracaiboMarks.tsx` (+flag class) + `maracaibo.module.css` (4.8s transform-only keyframes, reduced-motion static) +
  `MARACAIBO_FLAG_WAVE_REVIEW_20261004.md` + CODEX_QUEUE/HANDOFF_LOG. **Demo visual only — transform on the existing
  flag image; no new assets, no migration, no route, no secrets.** **Anthony's own merge → recorded.**
- **amma #305 — "Isolate daily traffic reports from Square refresh and shared email."** Merged 10-04 20:47 UTC
  (`50c070d`), `CI — web` **#319 ✅**. `morning-email.ts` → dedicated `TRAFFIC_RESEND_API_KEY`/`TRAFFIC_FROM_EMAIL`
  (no shared fallback); `api/integrations/square/refresh/route.ts` now returns 503 `square_refresh_disabled` unless
  `SQUARE_REFRESH_CRON_ENABLED=true` (**fails closed**); `api/internal/traffic/morning/route.ts` gains an
  admin-authenticated `?dryRun=1` no-send readiness path; new `scripts/traffic-morning-selftest.mjs` (offline VM
  fixtures) wired into `ci-web.yml`; `.env.example` adds var **names only**; new runbook
  `OPERATIONS/TRAFFIC_ONLY_ACTIVATION_20261004.md` + `MULTI_SITE_TRAFFIC.md` update. **Guardrail-clean: NO Supabase
  migration (traffic DB is Neon), NO secret values, tightens (not loosens) the Square gate, `/customers` not newly
  touched. The only open piece is Anthony's optional Production env-var setup + one verification if he wants the email
  live (see to-do list).** **Anthony's own merge → no caretaker action; recorded.**
- **amma #304 — "style(maracaibo): add geometric header wordmark."** Merged 10-04 20:06 UTC (`de44790`), `CI — web`
  **#317 ✅**. New `src/table-os/maracaibo/MaracaiboWordmark.tsx` + `public/assets/maracaibo/maracaibo-bistro-wordmark.svg`
  (code-native vector, 1,975 bytes), `MaracaiboExperience.tsx`/CSS wiring, `ASSET_REGISTRY/MARACAIBO/GEOMETRIC_WORDMARK_20261004.json`
  provenance, `MARACAIBO_GEOMETRIC_WORDMARK_REVIEW_20261004.md` + CODEX_QUEUE/HANDOFF_LOG. **Demo header lettering —
  newly authored geometric SVG "interpretation, not an original font," accessible real-text fallback; no generated
  raster, no external font, no migration, no route, no secrets.** **Anthony's own merge → recorded.**
- **amma #303 — "Maracaibo: Venezuelan lettering and instant solo play."** Merged 10-04 11:25 UTC (`340c0ffb`),
  `CI — web` **#315 ✅**. 17 `public/assets/maracaibo/lettering/*.webp` word-art tiles + `MaracaiboLettering.tsx` /
  `lettering-assets.ts`, `MaracaiboExperience`/`MaracaiboPenaltyClient`/CSS tweaks, `ASSET_REGISTRY/MARACAIBO/SIGNWRITER_20261004.json`
  provenance, `OPERATIONS/MARACAIBO_SIGNWRITER_REVIEW_20261004.md`, `design-qa.md`. +784/−143, 29 files. **Table-OS
  game word-art (custom Venezuelan hand-lettering, no club/league/event mark, no real face, no client logo); no
  `/m/[id]` or `/owner/[id]`, no Supabase migration, no Stripe/Square, no secrets.** **Anthony's own merge → recorded.**
- **amma #302 — "Use printed table QR visits for Maracaibo football and penalties."** Merged 10-04 10:07 UTC
  (`f3a1dca`), `CI — web` **#313 ✅**. +732/−70, 24 files. `src/table-os/maracaibo/*` (football client + new penalty
  client, `use-table-visit.ts`/`use-phone.ts`/`visit-contract.ts`), `src/table-os/realtime.ts`. **⚠️ Two
  guardrail-crossing items (both flagged in the to-do list; Anthony's own merge, so recorded not reverted):** (1) **new
  Supabase migration** `APP/web/supabase/migrations/20261004094018_maracaibo_table_visits.sql` — RLS-enabled,
  `service_role`-only `maracaibo_table_visits` + `maracaibo_table_guests` tables + `maracaibo_visit` RPC, headed *"Game
  membership only. These records never authorize ordering or payment."*; (2) **`/customers` route touched** — added
  `src/app/customers/maracaibo-tables/{page.tsx,TableVisitsDesk.tsx}` (staff visits desk) + `src/app/api/maracaibo/tables/route.ts`
  + `src/app/api/maracaibo/visit/[tableId]/route.ts`, and a 1-line edit to `src/app/customers/page.tsx`. **No Stripe/Square/POS,
  no secrets, no `/m/[id]` or `/owner/[id]`.** **Anthony's own merge → no caretaker action; recorded + flagged.**
- **amma #301 — "Make Maracaibo phone matches automatic and add Venezuela stadium skin."** Merged 10-04 02:10 UTC
  (`c172ce1`), `CI — web` **#311 ✅**. +2118/−262, 23 files. New `src/table-os/game/StadiumTableFootballRenderer.ts`,
  `TableFootballScene`/`input`/`types`, football session/view/peers, 3 game-art webp (`player-lago`, `player-rayo`,
  `stadium`), `venue-config`, `ASSET_REGISTRY/MARACAIBO/FOOTBALL_{KITS_VENEZUELA,SKIN}_20261004.json`, selftests +
  review docs. **Table-OS game visuals; Venezuela national-colors kit/stadium (no club/league/event mark, no face, no
  client logo); no `/m/[id]` or `/owner/[id]`, no Supabase migration, no Stripe/Square, no secrets.** **Anthony's own
  merge → recorded.**
- **amma #300 — "Maracaibo: stable four-player football with bounded peer gameplay."** Merged 10-03 21:55 UTC
  (`fed86c5`), `CI — web` **#309 ✅**. +980/−13, 16 files. New `src/table-os/maracaibo/{MaracaiboFootballClient.tsx,
  football-peers.ts,football-session.ts,football-view.ts}`, `src/table-os/game/{TableFootballScene,input}`,
  `src/table-os/realtime.ts`, selftests + review doc. **Table-OS multiplayer game code; no `/m/[id]` or `/owner/[id]`,
  no Supabase migration, no Stripe/Square, no secrets.** **Anthony's own merge → recorded.**
- **amma #299 — "Align Maracaibo table demo with its approved kitchen and cocktails identity."** Merged 10-03 16:14
  UTC (`07874fa6`), `CI — web` **#307 ✅**. `APP/web/src/table-os/maracaibo/*` (Experience/Marks/MatchView + CSS),
  `TableMatchClient`/`TableFootballScene`/`client.ts`/`venue-config` wiring, four `public/assets/maracaibo/*` art
  assets (citrus-drink, football, service-bell webp + a supplied circular `maracaibo-kitchen-cocktails-logo.png`), and
  four OPERATIONS Maracaibo review notes. +566/−295, 18 files. **Table-OS demo visuals + a supplied/owner-approved
  client logo (not AI-generated; body: Anthony approved this exact reviewed version with "Merge"); no payment,
  staff-routing or multiplayer activated; no `/m/[id]` or `/owner/[id]`, no Supabase/Stripe/Square, no migration, no
  secrets.** **Anthony's own merge → no caretaker action; recorded.**
- **amma #298 — "Refresh Maracaibo table demo with approved flag artwork."** Merged 10-03 12:26 UTC (`40132ec`),
  `CI — web` **#305 ✅**. New `APP/web/src/table-os/maracaibo/*` experience/match views + CSS, `TableExperience`/
  `TableMatchClient`/`venue-config` wiring, two `venezuelan-flag-concept-*.webp` assets, and
  `MARACAIBO_VISUAL_REVIEW_20261003.md`. +586/−16. **Game/table-OS visuals; the flag is a public-domain national-flag
  concept (not a club/league/event mark, no real face, no client logo); no `/m/[id]` or `/owner/[id]`, no Supabase/
  Stripe/Square, no migration, no secrets.** **Anthony's own merge → no caretaker action; recorded.**
- **amma #297 — "Correct voice call outcomes and staff notification reporting."** Merged 10-03 00:44 UTC (`2fb2da8`),
  `CI — voice-gateway` **#23 ✅**. `services/voice-gateway/src/*` (orchestrator, notify, store, report, types, new
  `callActivity.ts`, new `simulateReliability.ts`) + README + `VOICE_RELIABILITY_REVIEW_2026-10-03.md`. +712/−103.
  **Voice-gateway code + docs only; live Twilio routing/registration/A2P remains your manual gate; no Supabase/Stripe/
  Square, no secrets, no protected route.** **Anthony's own merge → no caretaker action; recorded.**
- **amma #296 — "Record verified Bodega menu release and close queue."** Merged 10-02 22:51 UTC (`8415eea`).
  Docs/queue bookkeeping closing out the #295 menu work. **Anthony's own merge → recorded.**
- **amma #295 — "Complete Bodega signature and matcha menu from photographed boards."** Merged 10-02 22:47 UTC
  (`1ff51bc`), `CI — web` **#303 ✅**. `(internal)/demo/bodega/{bodega-menu-nav.tsx,menu-draft.ts,page.tsx}` +
  `OPERATIONS/BODEGA_BOARD_MENU_20261002.md` + CODEX_QUEUE/HANDOFF_LOG. +64/−6. **Internal demo menu data + docs only;
  NO migration (pending set stays `0015`–`0023`); no `/m/[id]`, no Supabase/Stripe/Square, no secrets.** **Anthony's
  own merge → no caretaker action; recorded.**
- **amma #294 — "Refresh VBFH knowledge and add voice-only second-number routing."** Merged 10-02 22:03 UTC
  (`bd72101`), `CI — voice-gateway` **#21 ✅**. `services/voice-gateway/*` (PERSONALITIES, VBFH_KNOWLEDGE_SOURCES,
  new VBFH_KNOWLEDGE_AUDIT, server/tenant, new `simulateVbfh.ts`, `tenants.json`) + CODEX_QUEUE/HANDOFF_LOG + CI
  workflow. +443/−81. **Voice-gateway code + docs + `tenants.json` (adds a voice-only second number route); live Twilio
  activation remains your manual gate; no Supabase/Stripe/Square, no secrets, no protected route.** **Anthony's own
  merge → no caretaker action; recorded.**

Prior merges retained below for the audit trail.

- **amma #293 — "Use Neon-injected Production traffic database URL."** Merged 10-01 14:03 UTC (`8eb6239`), `CI — web`
  **#301 ✅**. Reads the Neon-integration traffic DB URL + records the activation handoff. `.env.example` var names
  only, traffic selftests/libs + `MULTI_SITE_TRAFFIC.md`/`TRAFFIC_COUNTER.md` docs. **The Neon DB is the internal
  traffic-analytics store, not Supabase; no customer data; no migration; no Stripe/Square/POS; no secrets; no protected
  route.** **Anthony's own merge → recorded.**
- **amma #290/#291/#292 — site-scoped traffic / morning-report wave.** Merged 10-01, `CI — web` **#294/#296/#298 ✅**.
  Rework the internal traffic-analytics + morning-report surface (`src/lib/traffic/*`, internal dashboards, selftests).
  **No migration; no Supabase/Stripe/Square/POS; no secrets; no protected route.** **Anthony's own merges → recorded.**
- **amma #287/#288/#289 + #278/#280/#282/#283 — "Project Seed" concept waves.** Merged 09-29→09-30, `CI — web` green.
  Additive `/play/project-seed`, `(internal)/demo/project-seed`, `/project-seed/menu`, original product art, a
  public-domain Philippine flag/boundary SVG, Halloween landing skin + `ASSET_REGISTRY/PROJECT_SEED/` docs. **No
  migration; non-human aswang mascot only; no protected route / Supabase / Stripe / Square.** **Anthony's own merges → recorded.**
- **vbfh #9/#10/#11/#12 — VBFH pilot reliability-engineering wave + compact daily email.** Merged 10-01→10-02,
  `CI` **#28/#31/#33/#35 ✅**. Repairs daily-mail content readiness + bounded/durable delivery; verifies soccer/
  volleyball source identity; fixes a live Dash pagination race; compacts the daily email to two images per league.
  Media-engine code + docs only; production SMTP + recurring schedules remain disabled by default; **also moved the
  Daily Run workflow to `activation held` (auto-schedule removed).** **Anthony's own merges → recorded.**
- **amma #276 — "Fix stable client menu destinations."** Merged `45560104` 09-29, `CI — web` **#274 ✅**.
  Guest `/m/[id]/page.tsx`, owner QR routes, new `lib/guest-menu.ts`, selftests. **No migration.** Printed Café Rush
  QR URL unchanged (stable-QR guardrail intact). **Anthony's own merge → recorded.**
- **amma #273/#270/#272/#271 — owner-portal + Bodega billing/voice wave.** Merged 09-27→09-29, `CI` green. `/owner/[id]`
  refactor + owner plans/QR + Bodega Basic Stripe billing (migration `0023`, go-live your gate) + Fina Calle voice-
  gateway base (#272, `CI — voice-gateway` #19 ✅; Twilio go-live your gate). **Anthony's own merges → recorded.**
- **amma #266–#269 (Bodega launch + Square connector + analytics + onboarding) — Anthony's own merges** (09-26/09-27;
  `CI — web` green; migrations `0019`–`0022` in #266). **amma #260–#264 (Bodega Fall Rush wave) — Anthony's own merges
  09-26** (migrations `0015`–`0018`).
- **vbfh #8 — MERGED 09-21** ("Make VBFH Daily Mail fail closed and verify Dash results," `b7af2c9`, `CI` #26 ✅).
- **amma #237…#216** — Las Palmas/Cantina/owner/Café-Rush/offer waves (08-17→09-17), all Anthony's own merges;
  full per-run detail in git history.

## Branch cleanup — ready to run (refreshed 2026-09-14 afternoon)

Anthony has approved deletion, but the session git proxy returns **HTTP 403 on any `push --delete`**
(server-side block, independent of permission), and the GitHub tooling here has no branch-delete API. Commands
below remain for Anthony to paste from a local clone. **Verified KEEP:** `main`, `automation/status`, `claude/*`
caretaker branches, **the eight open-draft heads** `codex/seasonal-skins-queue-20260929` (#277),
`claude/tech-research-integration-s66gw7` (#259), `claude/menu-control-app` (#238),
`claude/instagram-dm-ordering-m8i210` (#225), `claude/blissful-darwin-gtt3su` (#221),
`claude/las-palmas-loteria-hero` (#219), `claude/e-myth-ai-automation-gcetx0` (#218),
`claude/las-palmas-menu-game-59vtbg` (#197) (deleting any closes its open draft), unmerged `voice/*` (Anthony's
judgment). **Eligible** (merged since, no longer open-draft-protected): the eight Bodega codex branches from
#257/#258/#260–#264 plus `codex/bodega-launch-guest-notes-square-20260926` (#266), and now the merged heads for
#294 (`codex/vbfh-knowledge-20261002`), #297 (`codex/voice-reliability-20261002`),
#298 (`codex/maracaibo-visual-refresh-20261003`), #299 (`codex/maracaibo-brand-iteration-20261003`),
#295/#296 (Bodega board menu), and the newest merged heads #300 (`codex/maracaibo-multiplayer-20261003`),
#301 (`codex/maracaibo-stadium-skin-20261004`), #302 (`codex/maracaibo-table-visits-20261004`),
#303 (`codex/maracaibo-signwriter-20261004`), #304 (`codex/maracaibo-geometric-wordmark-20261004`),
#305 (`codex/traffic-only-report-20261004`), #306 (`codex/maracaibo-flag-wave-20261004`), and the newest merged heads
#307 (`codex/maracaibo-flag-ripple-20261004`), #308 (`codex/maracaibo-tequeno-keeper-20261004`),
#309 (`codex/maracaibo-brand-refinement-20261004`) — add them to your local delete run.
Still not auto-deleted here (proxy 403 + no branch-delete API).

**amma-fina-calle** (verified merged or closed-superseded):
```
git -C amma-fina-calle push origin --delete \
  codex/free-video-game-visuals-20260718 codex/free-visual-toolkit-20260718 \
  codex/small-model-skill-selector-20260718 ops/data-center-docs \
  claude/screenshot-trap-landing claude/screenshot-trap-live agent/bodega-line-motion-20260722 \
  claude/blissful-darwin-ddej93 codex/ethical-sales-conversion-20260718 \
  claude/escape-bomb-dc-plan-n6bfj5 feat/las-palmas-lynnhaven-table-os \
  codex/aj-gators-landing-hub-20260801 codex/las-palmas-original-menu-20260802 \
  claude/restaurant-hub-buttons claude/aj-gators-shootout \
  codex/qr-proof-release-20260803 codex/aj-gators-bw-qr-20260803 \
  codex/owner-portal-comic-20260804 codex/owner-request-intake-20260805 \
  voice/volleyball-fr voice/larissa-offgrid voice/vbfh-return \
  claude/table-duel codex/las-palmas-goal-keeper-20260910 \
  codex/owner-standard-premium-20260914 codex/consulting-comic-20260917 \
  codex/bodega-articulated-signature codex/bodega-photo-menu-20260925 \
  codex/bodega-owner-live-20260925 codex/bodega-five-levels-20260926 \
  codex/bodega-minute-rush-20260926 codex/bodega-bad-vibes-reset-20260926 \
  codex/bodega-muffin-meter-20260926 codex/bodega-no-save-faster-20260926 \
  codex/bodega-launch-guest-notes-square-20260926 \
  codex/vbfh-knowledge-20261002 codex/voice-reliability-20261002 \
  codex/maracaibo-visual-refresh-20261003 codex/maracaibo-brand-iteration-20261003
```
**vbfh-media-engine** (verified merged or closed-superseded):
```
git -C vbfh-media-engine push origin --delete \
  claude/pensive-edison-hl5sxo claude/build-automation-management-sh68i3 \
  feat/facility-info claude/vbfh-broadcast-instagram-e6p75v \
  claude/pensive-edison-sb3ujd claude/pensive-edison-sove8x
```

## Run log

- **2026-10-05 (evening check-in, `claude-opus-4-8`):** **🟢 Quiet, healthy run — nothing broke, no caretaker fix
  needed.** Zero failing workflow runs across all four repos. **amma `main` advanced `e3bf7b5`→`6f7c66b` via THREE more
  of Anthony's own merges #310/#311/#312** (`CI — web` #329/#331/#333 ✅): **#310** original cartoon lakefront-stadium
  SVG behind the Maracaibo penalty pitch (bridge/palms/tricolor terraces + eight stars, optional-background path,
  primitive fallback preserved); **#311** full-screen Penalty Rush layout + approved stadium/grass art behind existing
  markings/goal/characters (multiplayer + primitive fallback preserved); **#312** internal `(internal)/command-center`
  rebuilt as an isometric ops campus (all 54 links preserved + list fallback, keyboard nav, mobile; "no backend,
  dependency, billing or game changes; destination authorization + noindex unchanged"). **Caretaker guardrail read:
  all three Anthony's own merges, guardrail-clean — game art (national-colors/landmark scenery, non-human/caricature,
  no club/league/event mark, no real face, no client logo) + an internal ops-directory UI; diff touches only
  `(internal)/command-center/*`, `penalty/*`, `table-os/maracaibo/*`, two stadium assets + OPERATIONS docs. No
  `/m/[id]`, `/owner/[id]`, `/customers`, Supabase, Stripe/Square/POS or secrets.** **Migration set UNCHANGED
  `0015`–`0023` + `20261004094018_maracaibo_table_visits`** (+`0009`); #302's standing items (pending migration +
  `/customers` game-seat surface) unchanged, still need Anthony. vbfh `master` unchanged at `75f9668`; VBFH Daily Run
  latest **#121 (10-01) succeeded** and stays `activation held` (no #122 auto-fires by design — reliability-wave #9–#12
  commented out the `schedule:` trigger; manual `workflow_dispatch` only). Default branches re-verified: amma `6f7c66b`
  (advanced), vbfh `75f9668`, shadow `5113ce5` (dormant), EscapeTheBomb `eee6a37`. amma `CI — web` #333 ✅ +
  `CI — voice-gateway` #23 ✅ (unchanged, no voice-gateway code this run); vbfh build `CI` #35 ✅; shadow & EscapeTheBomb
  no CI (0 runs). **No new drafts; none of the 8 held drafts changed; no new human review comments (#310–#312 carry only
  Vercel + Codex-review bots); nothing closed unmerged; no merge-conflict/base-branch notices; GitHub API healthy.**
  #218 governance question open; #29 closed. Branch cleanup still 403-blocked. Push notification + email sent (standing:
  run the pending Supabase migrations incl. the Maracaibo one; optional: activate the traffic email via the #305 runbook).
- **2026-10-05 (morning check-in, `claude-opus-4-8`):** **🟢 Quiet, healthy run — nothing broke, no caretaker fix
  needed.** Zero failing workflow runs across all four repos. **amma `main` advanced `176093b`→`e3bf7b5` via THREE of
  Anthony's own merges #307/#308/#309** (`CI — web` #323/#325/#327 ✅): **#307** realistic Venezuelan flag + Fina Calle
  credit in the Maracaibo demo header (public-domain flag concept, demo visuals); **#308** tequeño vinotinto shooter +
  satirical keeper goal-conceded reaction sprites (Anthony's own supplied/reviewed/explicitly-approved game art — "Great
  place them and merge," 22:38 UTC; non-human/caricature, primitive fallback preserved, no client logo/league mark);
  **#309** a route-export build fix (removes the invalid `export` keyword from the `BodegaBillingContent` +
  `ColattaoPayments` page helpers so the Next.js production build passes) + three Maracaibo visual files. **Caretaker
  guardrail read: #309 touches two `/owner` billing pages but as export VISIBILITY only (`export function`→`function`) —
  the PR confirms ZERO diff in billing terms/actions/provider config or database files (21 synthetic billing checks
  still pass); flagged, not reverted (Anthony's own merge).** **Migration set UNCHANGED `0015`–`0023` +
  `20261004094018_maracaibo_table_visits`** (+`0009`); #302's standing items (pending migration + `/customers`
  game-seat surface) unchanged, still need Anthony. vbfh `master` unchanged at `75f9668`; VBFH Daily Run latest **#121
  (10-01) succeeded** and stays `activation held` (no #122 auto-fires by design). Default branches re-verified: amma
  `e3bf7b5` (advanced), vbfh `75f9668`, shadow `5113ce5` (dormant), EscapeTheBomb `eee6a37`. amma `CI — web` #327 ✅ +
  `CI — voice-gateway` #23 ✅ (unchanged, no voice-gateway code this run); vbfh build `CI` #35 ✅; shadow & EscapeTheBomb
  no CI (0 runs). **No new drafts; none of the 8 held drafts changed; no new human review comments (#307–#309 carry only
  Vercel + Codex-review bots); nothing closed unmerged; no merge-conflict/base-branch notices; GitHub API healthy.**
  #218 governance question open; #29 closed. Branch cleanup still 403-blocked. Push notification + email sent (standing:
  run the pending Supabase migrations incl. the Maracaibo one; optional: activate the traffic email via the #305 runbook).
- **2026-10-04 (evening check-in, `claude-opus-4-8`):** **🟢 Quiet, healthy run — nothing broke, no caretaker fix
  needed.** Zero failing workflow runs across all four repos. **amma `main` advanced `340c0ffb`→`176093b` via THREE of
  Anthony's own merges #304/#305/#306** (`CI — web` #317/#319/#321 ✅): **#304** code-native geometric SVG header
  wordmark for the Maracaibo demo (interpretation + accessible fallback; no migration/route/secret); **#305** isolate
  the daily traffic-report email onto dedicated `TRAFFIC_*` credentials + make the native-cron Square refresh fail
  closed behind `SQUARE_REFRESH_CRON_ENABLED=true` + admin-only `?dryRun=1` readiness + offline CI selftest + owner
  runbook (**guardrail-clean: env-var names only, NO Supabase migration — traffic DB is Neon, tightens the Square
  gate; `/customers` not newly touched**); **#306** transform-only CSS flag sway, reduced-motion static. **Migration
  set UNCHANGED `0015`–`0023` + `20261004094018_maracaibo_table_visits`** (+`0009`). **🆕 One new optional owner item:
  #305 makes the traffic email code-ready — to turn it on Anthony sets 4 Production env vars + runs one verification
  per the runbook; secrets/activation territory, his gate, nothing sends on its own.** #302's standing items
  (pending migration + `/customers` game-seat surface) are unchanged and still need Anthony. vbfh `master` unchanged at
  `75f9668`; VBFH Daily Run latest **#121 (10-01) succeeded** and stays `activation held` (no #122 auto-fires by
  design). Default branches re-verified: amma `176093b` (advanced), vbfh `75f9668`, shadow `5113ce5` (dormant),
  EscapeTheBomb `eee6a37`. amma `CI — web` #321 ✅ + `CI — voice-gateway` #23 ✅; vbfh build `CI` #35 ✅; shadow &
  EscapeTheBomb no CI (0 runs). **No new drafts; none of the 8 held drafts changed; no new human review comments
  (#304–#306 carry only Vercel + Codex-review bots); nothing closed unmerged; no merge-conflict/base-branch notices;
  GitHub API healthy.** #218 governance question open; #29 closed. Branch cleanup still 403-blocked. Push notification
  + email sent (optional for Anthony: activate the traffic email via the #305 runbook; standing: run the pending
  Supabase migrations incl. the Maracaibo one).
- **2026-10-04 (morning check-in, `claude-opus-4-8`):** **🟢 Quiet, healthy build run — zero failing workflow runs
  across all four repos; no caretaker fix needed. But two items in Anthony's own merge #302 need him** (flagged, not
  acted on). amma `main` advanced `07874fa6`→`340c0ffb` via **FOUR of Anthony's own merges #300/#301/#302/#303** (all
  Maracaibo table-OS demo/game work, `CI — web` #309/#311/#313/#315 ✅). **🆕 #302 carries a NEW Supabase migration
  `20261004094018_maracaibo_table_visits.sql`** (pending set is no longer just `0015`–`0023`; the Maracaibo table-visit
  / multiplayer game errors at runtime until applied — RLS+`service_role`-only game-seat tables, "never authorize
  ordering or payment") **and touches the protected `/customers` route** (adds `/customers/maracaibo-tables` staff desk
  + `/api/maracaibo/*`). Both arrived via the owner's own merge → recorded, no caretaker revert, surfaced to Anthony.
  #300/#301/#303 are Maracaibo game code + national-colors/lettering game art (no club/league/event mark, no face, no
  client logo). vbfh `master` unchanged at `75f9668`; VBFH Daily Run latest **#121 (10-01) succeeded** and stays
  `activation held` (workflow `active`, `schedule:` removed; no #122 auto-fires by design). Default branches
  re-verified: amma `340c0ffb` (advanced), vbfh `75f9668`, shadow `5113ce5` (dormant), EscapeTheBomb `eee6a37`. amma
  `CI — web` #315 ✅ + `CI — voice-gateway` #23 ✅; vbfh build `CI` #35 ✅; shadow & EscapeTheBomb no CI (0 runs). **No
  new drafts; none of the 8 held drafts changed; no new human review comments (#300–#303 carry only Vercel + Codex-review
  bots); nothing closed unmerged; no merge-conflict/base-branch notices; GitHub API healthy.** #218 governance question
  open; #29 closed. Branch cleanup still 403-blocked. Push notification + email sent (needed from Anthony: run the
  pending migrations incl. the new Maracaibo one, and note the `/customers` game-seat surface).
- **2026-10-03 (evening check-in, `claude-opus-4-8`):** **🟢 Quiet, healthy run — nothing broke, no caretaker fix
  needed.** Zero failing workflow runs across all four repos. **The one change since this morning: amma `main`
  advanced `40132ec`→`07874fa6` via Anthony's own merge #299** "Align Maracaibo table demo with its approved kitchen
  and cocktails identity" (`CI — web` #307 ✅) — table-OS Maracaibo demo refresh (`src/table-os/maracaibo/*` + game
  scene/`venue-config` + 4 webp/png art assets incl. a supplied/owner-approved circular Maracaibo logo + 4 OPERATIONS
  review docs; **no migration, no `/m/[id]` or `/owner/[id]`, no Supabase/Stripe/Square, no secrets**) → Anthony's own
  → recorded, no caretaker action. **Migration set unchanged `0015`–`0023`** (+`0009`). vbfh `master` unchanged at
  `75f9668`; VBFH Daily Run latest **#121 (10-01) succeeded** and stays `activation held` (no #122 auto-fires by
  design). Default branches re-verified: amma `07874fa6` (advanced), vbfh `75f9668`, shadow `5113ce5` (dormant),
  EscapeTheBomb `eee6a37`. amma `CI — web` #307 ✅ + `CI — voice-gateway` #23 ✅; vbfh build `CI` #35 ✅; shadow &
  EscapeTheBomb no CI (0 runs). **No new drafts; none of the 8 held drafts changed; no new actionable human review
  comments; nothing closed unmerged; no merge-conflict/base-branch notices; GitHub API healthy.** #218 governance
  question open; #29 closed. Branch cleanup still 403-blocked. Push notification + email sent (nothing needed from
  Anthony beyond the standing Supabase-migration to-do + the Daily-Run run-on-demand-vs-reactivate heads-up).
- **2026-10-03 (morning check-in, `claude-opus-4-8`):** **🟢 Quiet, healthy run — nothing broke, no caretaker fix
  needed.** Zero failing workflow runs across all four repos. **amma `main` advanced `8eb6239`→`40132ec` via FIVE of
  Anthony's own merges:** **#294** voice-only second-number routing + VBFH-knowledge refresh (`CI — voice-gateway`
  #21 ✅), **#295** Bodega signature/matcha demo menu from photographed boards (`CI — web` #303 ✅, **no migration**),
  **#296** record verified Bodega menu release + close queue (docs), **#297** correct voice call outcomes + staff-
  notification reporting (`CI — voice-gateway` #23 ✅), **#298** Maracaibo table-OS demo refresh + public-domain
  Venezuelan-flag concept asset (`CI — web` #305 ✅). **All guardrail-clean (caretaker view): voice-gateway code + docs
  + `tenants.json`; internal Bodega demo menu + docs; table-OS game visuals with a national-flag concept (no club/
  league/event mark, no face, no client logo); no Supabase migration, no Stripe/Square/POS, no secrets, no `/m/[id]` or
  `/owner/[id]` touched; voice/Twilio go-live stays Anthony's gate** → Anthony's own → recorded, no caretaker action.
  **Migration set unchanged `0015`–`0023`** (+`0009`). vbfh `master` unchanged at `75f9668`; the "VBFH Daily Run" stays
  `activation held` (manual-dispatch only; **#121 (10-01) remains the last automatic run — no #122 fired or will
  auto-fire** by design). Default branches re-verified: amma `40132ec` (advanced), vbfh `75f9668`, shadow `5113ce5`
  (dormant), EscapeTheBomb `eee6a37`. amma `CI — web` #305 ✅ + `CI — voice-gateway` #23 ✅; vbfh build `CI` #35 ✅;
  shadow & EscapeTheBomb no CI (0 runs). **No new drafts; none of the 8 held drafts changed; no new human review
  comments (all PR `updated_at` predate last run); nothing closed unmerged; no merge-conflict/base-branch notices;
  GitHub API healthy.** #218 governance question open; #29 closed. Branch cleanup still 403-blocked. Push notification
  + email sent (nothing needed from Anthony beyond the standing Supabase-migration to-do + the Daily-Run
  run-on-demand-vs-reactivate heads-up).
- **2026-10-02 (evening check-in, `claude-opus-4-8`):** **🟢 Quiet, healthy run — nothing broke, no caretaker fix
  needed. VBFH "Daily Run" moved to `activation held` / manual dispatch (intentional, owner-made #9–#12).** Zero
  failing workflow runs anywhere. vbfh `master` advanced `bef1a8f`→`75f9668` via Anthony's own **#12** "Reduce daily
  email to results and standings per league" (`CI #34/#35 ✅`). #121 (10-01) was the last automatic Daily Run. amma
  `main` unchanged at `8eb6239`. Migration set `0015`–`0023`. No new drafts / review comments.
- **2026-10-02 (midday check-in, `claude-opus-4-8`):** **🟢 Quiet, healthy run.** vbfh `master` `b7af2c9`→`bef1a8f`
  via Anthony's own reliability wave #9/#10/#11 (`CI #28/#31/#33 ✅`). amma `main` unchanged `8eb6239`. Migration set
  unchanged.
- **2026-10-01 (evening check-in, `claude-opus-4-8`):** **🟢 VBFH Daily Run #121 fired green** (~24 min), outage fully
  behind us. amma `main` `0149b74`→`8eb6239` via Anthony's own **#293** (`CI — web` #301 ✅, Neon traffic DB URL, no
  migration). Migration set `0015`–`0023`.
- **2026-10-01 (midday check-in, `claude-opus-4-8`):** **🟢 Quiet, healthy run.** amma `main` `43ebcaf`→`0149b74` via
  Anthony's own site-scoped traffic / morning-report wave #290/#291/#292 (`CI — web` #294/#296/#298 ✅, no migration).
- **2026-09-30 (both check-ins, `claude-opus-4-8`):** **🟢 Quiet, healthy; VBFH Daily Run #120 fired green.** amma
  `main` advanced via the Project Seed October wave #287/#288/#289 and the concept wave #278/#280/#282/#283 (`CI — web`
  green, no migration, non-human mascot, Anthony's own).
- **2026-09-29 (both check-ins, `claude-opus-4-8`):** **🟢 VBFH Daily Run RECOVERED — outage over** (#119 green). amma
  `main` advanced via #276 + owner-portal merges #273/#270/#272 (Anthony's own, `CI — web`/`voice-gateway` green).
  Draft #277 opened (held).
- **2026-09-28 (both, `claude-opus-4-8`):** 🔴 VBFH Daily Run #117/#118 CANCELLED at the 45-min cap (outage).
  amma `main` advanced via #271 + #272 (Anthony's own, green, no migration). Push + email sent.
- **2026-09-27 (both, `claude-opus-4-8`):** 🔴 VBFH Daily Run #115/#116/#117 CANCELLED (outage). amma `main` advanced
  via #267/#268/#269 + #270 (Anthony's own; migration `0023` + Stripe in #270).
- **2026-09-26 (both, `claude-opus-4-8`):** 🔴 VBFH Daily Run went DOWN (#115/#116 cancelled). amma `main` advanced via
  #260–#264 (Bodega Fall Rush, migrations `0015`–`0018`) + #266 (Square + guest-notes, migrations `0019`–`0022`).
- **2026-09-25 → 09-22 (both each day, `claude-opus-4-8`):** All four green. vbfh #8 MERGED (`b7af2c9`, `CI` #26 ✅);
  VBFH #111–#114 fired green. amma #257/#258 merged (Anthony's own).
- **2026-09-21 → 09-14 (both each day, `claude-opus-4-8`):** All four green. Anthony merged #234–#237 + the
  09-11→09-13 waves; VBFH #103–#110 each fired green. Drafts #238 (09-20) and vbfh #8 (09-19) opened.
- **2026-09-13 → 09-02 (both each day):** All four green; each afternoon's only change was that day's VBFH Daily Run
  (#91–#102) firing green. No pushes.
- **2026-09-01 — API outage then restore.** Morning `401 Bad credentials`; worked around via direct git; cleared by
  evening. VBFH #90 fired green.
- **2026-08-31 … 08-16 and prior:** all four green; VBFH #74–#89 each fired + SUCCEEDED. #29 confirmed closed
  (07-18). _(Full per-run detail in git history.)_
