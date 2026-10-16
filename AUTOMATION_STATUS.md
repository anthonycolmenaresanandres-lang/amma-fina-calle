# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-10-16 (evening check-in, `claude-opus-4-8`). **Headline: quiet, healthy run — nothing changed anywhere since the 2026-10-16 morning check-in; zero failing workflow runs across all four repos; no caretaker fix needed and nothing newly needs Anthony.** **No change since last run across every repo:** amma `main` UNCHANGED at `ea2f57e` (HEAD #342 “Refine Vital Vibes counter and scoped Fina Calle footer”; `CI — web` **#394 ✅** latest web run, `CI — voice-gateway` **#27 ✅**); vbfh `master` UNCHANGED at `75f9668` (build `CI` **#35 ✅**); shadow `5113ce5` (dormant); EscapeTheBomb `eee6a37` (dormant). **VBFH Daily Report — activation held: latest run still #121 (10-01) succeeded**, manual `workflow_dispatch` only, no #122 auto-fires by design. **Supabase migration set UNCHANGED** `0015`–`0023` + `20261004094018_maracaibo_table_visits` (+`0009`) — still the one real standing to-do for Anthony; #302’s `/customers/maracaibo-tables` game-seat surface unchanged, still flagged. **Eight** open amma drafts (#277/#259/#238/#225/#221/#219/#218/#197) unchanged — all author-held, all Vercel ✅, no new human review comments. No merge-conflict/base-branch notices; GitHub API healthy all run. #218 governance question stays open; #29 stays closed (07-18). Branch cleanup still awaiting Anthony’s approval (never deleted unprompted).
<!-- 2026-10-16 morning headline (superseded by the entry above; retained for history): quiet, healthy run — nothing changed anywhere since the 2026-10-15 evening check-in; zero failing workflow runs across all four repos; no caretaker fix needed and nothing newly needs Anthony. -->
The narrative below (migration to-do, heads-ups, standing gates) is unchanged this run (last real change: the 2026-10-15 Vital Vibes merges #340–#342). **amma `main` advanced `7caa2db`→`ea2f57e`** via Anthony’s own **#340** `67cedae` (add Vital Vibes visual menu at `/vital-vibes`, `CI — web` **#390 ✅**), **#341** `77815b0` (photoreal Vital Vibes item images + supplied cup logo, **#392 ✅**), **#342** `ea2f57e` (refine Vital Vibes counter + scoped Fina Calle footer, **#394 ✅** — current tip, latest web run). **Caretaker guardrail read: all three guardrail-clean — a new isolated additive `/vital-vibes` prospect menu; all diffs under `APP/web/src/app/vital-vibes/*` (static GET route), `APP/web/public/vital-vibes/*` (app.js, menu-data, CSS, original SVG cup artwork + AI food-item `.webp` images carrying AI/illustrative notices), `APP/web/scripts/vital-vibes-selftest.ts`, + `OPERATIONS/*` docs/evidence; the cup logo is owner-supplied (NOT AI-generated per guardrail); AI images are non-human food items (no faces/club/event marks); no `/m/[id]`, no `/owner/[id]`, no `/customers`, no Supabase migration, no Stripe/Square/POS, no secrets** → Anthony’s own → recorded, no caretaker action. `CI — voice-gateway` **#27 ✅** unchanged (no voice-gateway code this run). **vbfh `master` UNCHANGED at `75f9668`** (build `CI` **#35 ✅**); the “VBFH Daily Report — activation held” workflow stays manual `workflow_dispatch` only, so **#121 (10-01, green) remains the last run and no #122 auto-fires by design** (latest Daily-Run result = success). **Supabase migration set UNCHANGED** at `0015`–`0023` + `20261004094018_maracaibo_table_visits` (+`0009`) — still the one real standing to-do for Anthony; #302’s `/customers/maracaibo-tables` game-seat surface unchanged, still flagged (owner merge → never reverted). Default branches re-verified live: amma `ea2f57e`, vbfh `75f9668`, shadow `5113ce5` (dormant), EscapeTheBomb `eee6a37`. **Zero failing workflow runs across all four repos this run.** shadow & EscapeTheBomb have no CI workflows (0 runs). **Eight** open amma drafts (#277/#259/#238/#225/#221/#219/#218/#197 — all author-held, none changed since last run (newest `updated_at` 09-29); all Vercel ✅; no new human review comments). No merge-conflict/base-branch notices; GitHub API healthy all run. #218 governance question stays open; #29 stays closed (07-18). Branch cleanup still awaiting Anthony’s approval (open draft heads excluded; never deleted unprompted).
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

## Build health (as of 2026-10-16, evening)

> **✅ All columns re-verified live this run** — check-runs, Daily-Run jobs/steps, commit file-lists, and
> default-branch tips read directly via API. **Zero failing workflow runs anywhere this run.** **Evening run:
> no change since the 2026-10-16 morning check-in — amma `main` still `ea2f57e` (#342), vbfh `master` still
> `75f9668`, shadow `5113ce5`, EscapeTheBomb `eee6a37`; the narrative below remains the latest state.**

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip **`ea2f57e`** (“Refine Vital Vibes counter and scoped Fina Calle footer,” #342, 10-15 12:26 UTC; **Anthony’s own merge**, `CI — web` **#394 ✅**, the latest web run). **This run** `7caa2db`→`ea2f57e` via THREE of Anthony’s own merges, all `CI — web` ✅: **#340** `67cedae` add Vital Vibes visual menu at `/vital-vibes` (#390), **#341** `77815b0` photoreal Vital Vibes item images + supplied cup logo (#392), **#342** `ea2f57e` refine Vital Vibes counter + scoped Fina Calle footer (#394). **Caretaker guardrail read: guardrail-clean — new isolated additive `/vital-vibes` prospect menu; all diffs under `APP/web/src/app/vital-vibes/*` (static GET route), `APP/web/public/vital-vibes/*` (app.js, menu-data, CSS, original SVG cup artwork + AI food-item `.webp` images with AI/illustrative notices), `APP/web/scripts/vital-vibes-selftest.ts`, + `OPERATIONS/*` docs; owner-supplied cup logo (not AI-generated); AI images non-human food items (no faces/club/event marks); Colattao QR URL untouched; no `/m/[id]`, no `/owner/[id]`, no `/customers`, no Supabase migration, no Stripe/Square/POS, no secret values.** Anthony’s own → no caretaker action; recorded. `CI — voice-gateway` **#27 ✅** unchanged (no voice-gateway code this run). **Migration set UNCHANGED this run: `0015`–`0023` + `20261004094018_maracaibo_table_visits`** (+`0009`); #302’s migration + its `/customers/maracaibo-tables` game-seat surface remain the standing items that need Anthony. **Eight** open drafts held (see Open PRs). |
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

**Since the 2026-10-16 morning check-in, nothing merged or closed across all four repos.** amma `main` `ea2f57e` (#342), vbfh `75f9668`, shadow `5113ce5`, EscapeTheBomb `eee6a37` all unchanged; no new review comments; the eight open amma drafts are unchanged; nothing closed unmerged. The prior Vital Vibes merges #340–#342 (10-15, advancing `7caa2db`→`ea2f57e`) and earlier #334→#339 retained below.

- **amma #342 — “Refine Vital Vibes counter and scoped Fina Calle footer.”** Merged 10-15 12:26 UTC (`ea2f57e`, current main tip), `CI — web` **#394 ✅** (latest web run). Refines the Vital Vibes counter scene + adds a scoped Fina Calle footer; adds a photographic counter image + ingredient-doodle SVG. Touches `APP/web/{src/app,public,scripts}/vital-vibes/*` + `OPERATIONS/*` docs/evidence. **Isolated additive `/vital-vibes` prospect menu — no `/m/[id]`, `/owner/[id]`, `/customers`, Supabase, Stripe/Square/POS or secrets.** **Anthony’s own merge → recorded.**
- **amma #341 — “Add photoreal Vital Vibes item images and supplied logo.”** Merged 10-15 11:04 UTC (`77815b0`), `CI — web` **#392 ✅**. Adds 51 AI food-item images (+ mobile thumbs) with lazy thumbnails + native AI/illustrative disclosures, and recovers the **owner-supplied** cup logo. Touches `APP/web/public/vital-vibes/*` (artwork.js + `assets/ai/*.webp`) + `app.js`. **AI images are non-human food items (no faces/club/event marks); the logo is owner-supplied, NOT AI-generated (guardrail-compliant); no protected route, no migration, no secrets.** **Anthony’s own merge → recorded.**
- **amma #340 — “Add Vital Vibes visual menu at /vital-vibes.”** Merged 10-15 09:54 UTC (`67cedae`), `CI — web` **#390 ✅**. Publishes the reviewed Vital Vibes concept as an isolated static GET at `/vital-vibes` — original SVG category/cup artwork, seven source-backed categories / 51 names, accessible detail sheets, retained concept/noindex notices. New `APP/web/src/app/vital-vibes/*` route + `APP/web/public/vital-vibes/*` + `vital-vibes-selftest.ts` + `OPERATIONS/*`. **Additive isolated prospect route — no ordering/payments, no guessed business data, no `/m/[id]`, `/owner/[id]`, `/customers`, Supabase, Stripe/Square/POS or secrets.** **Anthony’s own merge → recorded.**

- **amma #339 — “Refresh Project Seed logo, red identity and menu dropdowns.”** Merged 10-13 20:59 UTC (`7caa2db`, current main tip), `CI — web` **#387 ✅** (latest web run). Regenerated Project Seed badge, red/blue/ivory/gold identity, original Latin sign lettering, native single-column menu disclosures. Touches `APP/web/src/app/(internal)/demo/project-seed/*` + `OPERATIONS/PROJECT_SEED/*` + a self-test script. **Isolated internal prospect demo; logo is an approved overlay, not AI-generated — no `/m/[id]`, `/owner/[id]`, `/customers`, Supabase, Stripe/Square/POS or secrets.** **Anthony's own merge → recorded.**
- **amma #338 — “Add Royal Chocolate prospect menu and chocolate collector demo.”** Merged 10-13 17:48 UTC (`abe55dd`), `CI — web` **#384 ✅**. Adds a local Royal Chocolate prospect menu + chocolate collector concept under `APP/web/src/app/royal-chocolate/*`, `DEMOS/royal-chocolate/*` + `OPERATIONS/ROYAL_CHOCOLATE/*`. **Non-human chocolate sprites, primitive fallback unaffected; isolated prospect route — no protected route, no migration, no secrets.** **Anthony's own merge → recorded.**
- **amma #337 — “Save approved menu baseline and add Olympia floating Play.”** Merged 10-13 16:53 UTC (`443de7d`), `CI — web` ✅. Records the approved menu baseline and adds a floating Play control to the Olympia prospect. Touches `APP/web/src/app/olympia/*` + `OPERATIONS/{OLYMPIA,MENU_DRAFT_BASELINE}*`. **Isolated `/olympia` prospect — no protected route, no migration, no secrets.** **Anthony's own merge → recorded.**
- **amma #336 — “Open Olympia menu layout and add original title lettering.”** Merged 10-13 16:12 UTC (`eeafc98`), `CI — web` ✅. Opens the Olympia menu layout and adds original title lettering (`olympia/*` + lettering-proof script). **Isolated prospect route only.** **Anthony's own merge → recorded.**
- **amma #335 — “Use Olympia menu navy for a calmer game backdrop.”** Merged 10-13 15:22 UTC (`a32c672`), `CI — web` ✅. Tunes the Olympia game backdrop to the menu navy. **Isolated prospect/demo visuals only — no protected route, no migration, no secrets.** **Anthony's own merge → recorded.**
- **amma #334 — “Simplify Olympia menu and add textured category accordions.”** Merged 10-13 15:11 UTC (`c8b90f4`), `CI — web` ✅. Simplifies the Olympia menu and adds textured category accordions (`olympia/*`). **Isolated prospect route only.** **Anthony's own merge → recorded.**

- **amma #333 — “Clarify Olympia round results and stabilize the counter camera.”** Merged 10-12 23:59 UTC (`379d315`, current main tip), `CI — web` **#373 ✅** (latest web run). Clarifies round-result reporting and steadies the collector game's counter camera. Touches `DEMOS/olympia-sandwich/*` + built bundle + review docs. **Collector-game iteration — no `/m/[id]`, `/owner/[id]`, `/customers`, Supabase, Stripe/Square/POS or secrets.** **Anthony's own merge → recorded.**
- **amma #332 — “Add reciprocal collector capture and three expanded rival levels.”** Merged 10-12 22:44 UTC (`ef198b2`), `CI — web` **#371 ✅**. Adds reciprocal collector-capture behavior and three expanded rival levels to the Olympia Sandwich Counter. Touches `DEMOS/olympia-sandwich/*`, `DEMOS/collector-standard/*` (shared engine) + built bundle. **Non-human food sprites, primitive fallback unaffected; no protected route, no migration, no secrets.** **Anthony's own merge → recorded.**
- **amma #331 — “Bring Olympia collector closer and add a fair rival challenge.”** Merged 10-12 22:03 UTC (`3af13e6`), `CI — web` **#369 ✅**. Records the verified Olympia Sandwich Counter production release, brings the collector view closer, and adds a reusable rival challenge. 25 files under `DEMOS/olympia-sandwich/*`, `DEMOS/collector-standard/*`, `APP/web/public/demo/olympia-sandwich/*`, `OPERATIONS/*`, and the `ci-web.yml` lint-exclude. **Standalone collector game — no protected route, no migration, no secrets.** **Anthony's own merge → recorded.**

- **amma #330 — “Make Olympia menu navigation visual and phone-first.”** Merged 10-12 21:43 UTC (`95cc040`), `CI — web` **#367 ✅** (current main tip, latest web run). Replaces the tall opening hero with direct photographic category navigation, keeps source-backed prices visible early on phones. Touches `APP/web/src/app/olympia/*` only + review docs. **Isolated `/olympia` prospect — no `/m/[id]`, `/owner/[id]`, `/customers`, Supabase, Stripe/Square/POS or secrets.** **Anthony's own merge → recorded.**
- **amma #329 — “Add Olympia Sandwich Counter with original deli artwork.”** Merged 10-12 20:09 UTC (`4c50c5d`), `CI — web` **#365 ✅**. Adds an isolated original-art sandwich-collector game (`DEMOS/olympia-sandwich/*` source + `APP/web/public/demo/olympia-sandwich/*` built bundle + `APP/web/src/app/olympia/play/*`), excludes the generated bundle from source lint, and records owner approval. **Non-human food sprites (bread/cheese/filling/sandwich), primitive fallback unaffected; standalone demo, no protected route, no migration, no secrets.** **Anthony's own merge → recorded.**
- **amma #328 — “Add supplied Olympia photos and improve phone layout.”** Merged 10-12 19:06 UTC (`cf88cd5`), `CI — web` **#363 ✅**. Integrates six verified supplied originals + responsive WebP display copies (`APP/web/public/assets/olympia/photos/*`), improves phone layout; preserves the source menu, native disclosures, shared game and other clients. **No protected route, no migration, no secrets.** **Anthony's own merge → recorded.**
- **amma #327 — “Make Olympia menu item details expandable.”** Merged 10-12 16:50 UTC (`69b1359`), `CI — web` **#361 ✅**. Expandable item details on the `/olympia` menu. **Isolated prospect route only.** **Anthony's own merge → recorded.**
- **amma #326 — “Source Olympia's selected menu from DoorDash.”** Merged 10-12 15:57 UTC (`820bcd6`), `CI — web` **#359 ✅**. Records verified DoorDash menu extraction + sourced selected menu for publication (`APP/web/src/app/olympia/doordash-menu.json` + menu-data) and balances the drinks layout. **Isolated prospect route + source docs only.** **Anthony's own merge → recorded.**
- **amma #325 — “Publish Olympia menu and Juice Rush prospect concept.”** Merged 10-12 13:52 UTC (`b852d10`), `CI — web` **#357 ✅**. Publishes the Olympia prospect concept at an established company route (`APP/web/src/app/olympia/page.tsx` + layout/menu/module.css) with QA + review docs/evidence. **Additive isolated `/olympia` prospect — no `/m/[id]`, `/owner/[id]`, `/customers`, Supabase, Stripe/Square/POS or secrets.** **Anthony's own merge → recorded.**

- **amma #324 — “Showcase Maracaibo art in lighter three-a-side football.”** Merged 10-11 17:26 UTC (`15ec17b`), `CI — web` **#355 ✅**. Adds `stadium.webp`/`turf.webp` art under `public/assets/maracaibo/street-football/` and tunes the demo to a lighter three-a-side match (html/js/manifest + `play/...page.tsx`) + an art-review doc + queue/handoff. **Additive `/play/maracaibo-street-football` game demo + non-human scenery art — no `/m/[id]`, `/owner/[id]`, `/customers`, Supabase, Stripe/Square/POS or secrets.** **Anthony's own merge → recorded.**
- **amma #323 — “Match Street Football to existing Maracaibo penalty artwork.”** Merged 10-11 16:20 UTC (`3fa4ce8`), `CI — web` **#353 ✅**. Visual revision of the same demo bundle (index.html/manifest/match.js/style.css) to match the approved Maracaibo penalty art + a visual-revision doc + queue/handoff. **Game-demo visuals only — no protected route, no migration, no secrets.** **Anthony's own merge → recorded.**
- **amma #322 — “Release Maracaibo Street Football with current assets.”** Merged 10-11 14:32 UTC (`7d363f6`), `CI — web` **#351 ✅**. Publishes the additive public `/play/maracaibo-street-football` five-a-side demo (`src/app/play/...page.tsx` + `public/games/maracaibo-street-football/*` static bundle incl. THIRD_PARTY_NOTICES) + a GAME_LIBRARY adaptation-status note + queue/handoff. **Additive game-demo route + static assets — not a Client OS route; no `/m/[id]`, `/owner/[id]`, `/customers`, Supabase, Stripe/Square/POS or secrets.** **Anthony's own merge → recorded.**

- **Older merged/closed history (amma #319 back through the Bodega / owner-portal waves, 2026-10-10 → late September) — trimmed on 2026-10-16 for maintainability.** Full per-PR detail is preserved in this file’s git history on `automation/status` and in each repo’s merge log. The standing items those merges created — the Supabase migration set `0015`–`0023` + `20261004094018_maracaibo_table_visits` (+`0009`), the `/customers/maracaibo-tables` surface, the `TRAFFIC_*` traffic-email activation, Bodega Basic Stripe billing, and the Square connector — are all carried in **👉 What Anthony needs to do** above.

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

- **2026-10-16 (evening check-in, `claude-opus-4-8`):** **🟢 Quiet, healthy run — nothing changed anywhere since the 2026-10-16 morning check-in; nothing broke, no caretaker fix needed and nothing newly needs Anthony.** Zero failing workflow runs across all four repos. **No change since the morning run across every repo:** amma `main` UNCHANGED at `ea2f57e` (HEAD still #342 “Refine Vital Vibes counter and scoped Fina Calle footer”; `CI — web` **#394 ✅** latest web run, `CI — voice-gateway` **#27 ✅**); vbfh `master` UNCHANGED at `75f9668` (build `CI` **#35 ✅**); shadow `5113ce5` (dormant, last commit 2026-07-09); EscapeTheBomb `eee6a37` (dormant, #1 merged 2026-07-30). **VBFH Daily Report — activation held: latest run still #121 (10-01) succeeded**, manual `workflow_dispatch` only (daily.yml carries `on: workflow_dispatch` only; the `schedule:` cron block stays commented out pending owner-approved activation), no #122 auto-fires by design. **No new/merged/closed PRs since the morning run** (org PR search `updated:>=2026-10-16` returned none). **Eight open amma drafts (#277/#259/#238/#225/#221/#219/#218/#197) unchanged — all author-held, all Vercel ✅, no new human review comments.** vbfh/shadow/EscapeTheBomb have no open PRs; shadow & EscapeTheBomb have no CI workflows (0 runs). **Supabase migration set UNCHANGED** `0015`–`0023` + `20261004094018_maracaibo_table_visits` (+`0009`) — still the one real standing to-do for Anthony; #302’s `/customers/maracaibo-tables` game-seat surface unchanged, still flagged. No merge-conflict/base-branch notices; GitHub API healthy all run. #218 governance question open; #29 closed (07-18). Branch cleanup still awaiting Anthony’s approval (never deleted unprompted). Push notification + email sent (nothing needed from Anthony beyond the standing Supabase-migration to-do).
- **2026-10-16 (morning check-in, `claude-opus-4-8`):** **🟢 Quiet, healthy run — nothing changed anywhere since the 2026-10-15 evening check-in; nothing broke, no caretaker fix needed and nothing newly needs Anthony.** Zero failing workflow runs across all four repos. **No change since last run across every repo:** amma `main` UNCHANGED at `ea2f57e` (HEAD still #342 “Refine Vital Vibes counter and scoped Fina Calle footer”; `CI — web` **#394 ✅** latest web run, `CI — voice-gateway` **#27 ✅**); vbfh `master` UNCHANGED at `75f9668` (build `CI` **#35 ✅**); shadow `5113ce5` (dormant, last commit 2026-07-09); EscapeTheBomb `eee6a37` (dormant, #1 merged 2026-07-30). **VBFH Daily Report — activation held: latest run still #121 (10-01) succeeded**, manual `workflow_dispatch` only, no #122 auto-fires by design. **No new/merged/closed PRs since last run** (PR search `updated:>=2026-10-16` returned none; no amma PR activity at all today). **Eight open amma drafts (#277/#259/#238/#225/#221/#219/#218/#197) unchanged — all author-held, all Vercel ✅, no new human review comments.** vbfh/shadow/EscapeTheBomb have no open PRs; shadow & EscapeTheBomb have no CI workflows (0 runs). **Supabase migration set UNCHANGED** `0015`–`0023` + `20261004094018_maracaibo_table_visits` (+`0009`) — still the one real standing to-do for Anthony; #302’s `/customers/maracaibo-tables` game-seat surface unchanged, still flagged. No merge-conflict/base-branch notices; GitHub API healthy all run. #218 governance question open; #29 closed (07-18). Branch cleanup still awaiting Anthony’s approval (never deleted unprompted). Push notification + email sent (nothing needed from Anthony beyond the standing Supabase-migration to-do).
- **2026-10-15 (evening check-in, `claude-opus-4-8`):** **🟢 Quiet, healthy run — nothing changed since the 2026-10-15 morning check-in; nothing broke, no caretaker fix needed and nothing newly needs Anthony.** Zero failing workflow runs across all four repos. amma `main` UNCHANGED at `ea2f57e` (#342); vbfh `master` `75f9668` (CI #35 ✅); shadow `5113ce5`; EscapeTheBomb `eee6a37`. VBFH Daily Run #121 (10-01) succeeded, activation held. No new/merged/closed PRs since the morning run; eight amma drafts unchanged; Supabase migration set unchanged; GitHub API healthy. Push notification + email sent.
- **2026-10-15 (morning check-in, `claude-opus-4-8`):** **🟢 Healthy run — the only change since the 2026-10-14 evening check-in is THREE of Anthony’s own guardrail-clean Vital Vibes prospect-menu merges on amma `main` (#340/#341/#342, advancing `7caa2db`→`ea2f57e`; `CI — web` #390/#392/#394 ✅); all guardrail-clean (isolated additive `/vital-vibes`), Anthony’s own, recorded.** vbfh `master` `75f9668`; VBFH Daily Run #121 held; shadow/EscapeTheBomb dormant. Supabase migration set unchanged; eight drafts unchanged; GitHub API healthy. Push notification + email sent.
- **2026-10-14 (evening & morning check-ins, `claude-opus-4-8`):** 🟢 Quiet, healthy runs — nothing changed; amma `main` `7caa2db` (#339), vbfh `75f9668`, shadow/EscapeTheBomb dormant; VBFH Daily Run #121 held; migration set unchanged; eight drafts unchanged; GitHub API healthy. Push notification + email sent each run.
- **2026-10-13 (evening check-in, `claude-opus-4-8`):** **🟢 Healthy run — SIX of Anthony's own guardrail-clean prospect/demo merges (#334–#339, advancing `379d315`→`7caa2db`; `/olympia`, `/royal-chocolate`, `(internal)/demo/project-seed`; `CI — web` green through #387) — all guardrail-clean, Anthony's own, recorded.** Migration set unchanged; vbfh `75f9668`; VBFH Daily Run #121 held. Push notification + email sent.
- **2026-10-13 (morning check-in, `claude-opus-4-8`):** **🟢 Healthy run — THREE of Anthony's own guardrail-clean Olympia-game merges (#331–#333, advancing `95cc040`→`379d315`; `CI — web` #369/#371/#373 ✅).** Migration set unchanged; vbfh `75f9668`; VBFH Daily Run #121 held. Push notification + email sent.
- **2026-10-12 (evening check-in, `claude-opus-4-8`):** **🟢 Healthy run — SIX of Anthony's own guardrail-clean Olympia-prospect merges (#325–#330, advancing `15ec17b`→`95cc040`; `CI — web` #357–#367 ✅).** Migration set unchanged; vbfh `75f9668`; VBFH Daily Run #121 held. Push notification + email sent.
- **2026-10-12 (morning check-in, `claude-opus-4-8`):** 🟢 Quiet, healthy run — nothing changed since the 10-11 afternoon run; amma `main` `15ec17b` (#324); migration set unchanged; eight drafts unchanged; GitHub API healthy. Push notification + email sent.
- **2026-10-11 (afternoon check-in, `claude-opus-4-8`):** **🟢 Healthy run — THREE of Anthony's own merges #322/#323/#324 (Maracaibo Street Football game demo, advancing `0fa62d3`→`15ec17b`; `CI — web` #351/#353/#355 ✅); guardrail-clean, recorded.** Migration set unchanged; vbfh `75f9668`; VBFH Daily Run #121 held. Push notification + email sent.
- **2026-10-11 (morning check-in, `claude-opus-4-8`):** **🟢 Quiet, healthy run — two of Anthony’s own voice-gateway merges advanced amma `main` `55e3fc7`→`0fa62d3` (`CI — voice-gateway` #25/#27 ✅); both within `services/voice-gateway/*` + docs, guardrail-clean, recorded; live Twilio/A2P activation for +1 757 300 1118 stays Anthony’s gate.** Migration set unchanged; vbfh `75f9668`; VBFH Daily Run #121 held. Push notification + email sent.
- **Older run-log entries (2026-10-10 evening back to the series’ start) — trimmed on 2026-10-16 for maintainability; preserved in full in this file’s git history on `automation/status`.** All were 🟢 healthy/quiet runs (or recorded Anthony’s own guardrail-clean merges); none left anything needing Anthony beyond the standing Supabase-migration to-do.
