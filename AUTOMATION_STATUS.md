# Automation Status — build & project caretaker

_Living status file maintained by the automated caretaker. Latest state of builds,
PRs, and cleanup across all four repos. Updated on each scheduled run._

**Last updated:** 2026-10-18 (morning check-in, `claude-opus-4-8`). **Headline: healthy run — amma `main` advanced since the 10-17 evening check-in via FOUR of Anthony's OWN merges (#350–#353: traffic-email HTML/text polish + "unavailable identifier" state, then the big #352 "verified owner request flow + DISABLED Bodega pilot" building out the protected `/owner/[id]` + `/customers` routes with five NEW Supabase `proposals/` SQL files [release-gated, pilot disabled], and #353 an owner-portal mobile layout), all `CI — web` green and guardrail-noted; zero failing workflow runs across all four repos, no caretaker fix needed. Nothing NEW urgently needs Anthony beyond the standing Supabase-migration to-do + the owner-side traffic-email activation — but see the new #352 heads-up (protected-route buildout + new DB proposals, all gated OFF).** **Default branches:** amma `main` ADVANCED `e0b44dd7` (#349) → **`d3743c2`** (#353 "Give owner portal an open mobile layout"); `CI — web` **#425 ✅** (latest web run), `CI — voice-gateway` **#27 ✅** unchanged (no voice-gateway code this run); vbfh `master` UNCHANGED at `75f9668` (build `CI` **#35 ✅**); shadow `5113ce5` (dormant); EscapeTheBomb `eee6a37` (dormant). **Four merges since the 10-17 evening check-in — all Anthony's own:** #350 traffic-email spacious HTML/text layouts (`CI — web` #417 ✅, traffic code only, guardrail-clean), #351 preserve "unavailable identifier" status in traffic emails (#419 ✅, traffic code only, guardrail-clean), #352 verified owner request flow + disabled Bodega pilot (#422 ✅ — **touches hard-guardrail `/owner/[id]` + `/customers` routes + adds five `supabase/proposals/` SQL files + a Square boundary test; Bodega pilot explicitly DISABLED/release-gated in CI; migrations dir UNCHANGED; his own merge → flagged, not reverted**), #353 owner-portal open mobile layout (#425 ✅, `/owner/[id]` layout/CSS only). **The lone red run in the list, `CI — web` #420, was a transient iteration on #352's PR branch `codex/owner-request-audit-20261017` — fixed in the same PR (#421/#422 green) and merged green; no caretaker action.** **VBFH Daily Report — activation held: latest run still #121 (10-01) succeeded**, manual `workflow_dispatch` only, no #122 auto-fires by design. **Supabase migration set UNCHANGED** `0015`–`0023` + `20261004094018_maracaibo_table_visits` (+`0009`) — still the one real standing to-do for Anthony (the five NEW #352 SQL files are `proposals/`, NOT installable migrations; the pilot they back is disabled/gated, so nothing errors at runtime). **Eight** open amma drafts (#277/#259/#238/#225/#221/#219/#218/#197) — all unchanged author-held since ≤09-29; all Vercel ✅, no new human review comments. No merge-conflict/base-branch notices; GitHub API healthy all run. #218 governance question stays open; #29 stays closed (07-18). Branch cleanup still awaiting Anthony's approval (never deleted unprompted).
The narrative below (migration to-do, heads-ups, standing gates) is unchanged this run except as noted. The new activity since the last run is the four owner merges above (advancing `main` `e0b44dd7`→`d3743c2`). `CI — voice-gateway` **#27 ✅** unchanged. **vbfh `master` UNCHANGED at `75f9668`** (build `CI` **#35 ✅**); the "VBFH Daily Report — activation held" workflow stays manual `workflow_dispatch` only, so **#121 (10-01, green) remains the last run and no #122 auto-fires by design**. Default branches re-verified live: amma `d3743c2`, vbfh `75f9668`, shadow `5113ce5` (dormant), EscapeTheBomb `eee6a37` (dormant). **Zero failing workflow runs across all four repos this run** (the single red PR-branch run was superseded and merged green — see above). shadow & EscapeTheBomb have no CI workflows (0 runs).
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

🆕 **Heads-up (no fix needed, your own merge #352): the owner-request / Bodega-owner-pilot buildout landed on the
   protected `/owner/[id]` + `/customers` routes — and it is DISABLED / release-gated, not live.** #352 (merged 10-18,
   `CI — web` #422 ✅) added a lot: an authenticated owner request queue + request-desk actions, private account
   onboarding/enrollment, and a tenant-scoped **Bodega owner pilot** — plus a Square boundary regression test. It
   touches hard-guardrail Client OS routes (`APP/web/src/app/owner/[id]/requests/*`, `owner/enrollment/*`,
   `owner/bodega/page.tsx`, `customers/new`, `customers/onboarding/[candidateId]`), so **I don't modify or revert it —
   flagging for your awareness.** Two things to know: (1) it adds **five NEW SQL files under
   `APP/web/supabase/proposals/`** (`account_staging_v1`, `bodega_menu_adapter_v1`, `bodega_menu_manifest_v1`,
   `owner_request_queue_v1`, `owner_request_tracking_v1`) — these are **proposals, NOT `migrations/`**, so `supabase
   db push` will NOT pick them up and nothing runs them yet; the `migrations/` set is unchanged. (2) the PR itself
   records a **"blocked database installation"** and **gates the Bodega release in CI** — i.e. the pilot is
   intentionally **disabled until you install those DB prerequisites and switch it on.** Caretaker read: nothing errors
   at runtime (feature is gated OFF), CI/Vercel green. **Your call when/if you want the Bodega owner pilot live:**
   review `OPERATIONS/BODEGA_REVIEW_RELEASE_20261018.md` + `BODEGA_OWNER_PILOT_20261018.md` +
   `OWNER_ACCOUNT_ONBOARDING_20261017.md`, then decide whether to promote those `proposals/` SQL files into real
   migrations and run them. **DB + protected-route + Square territory — yours; I never run SQL or touch protected
   routes.**

🟡 **Heads-up — your traffic-email test send (10-17) got a provider (Resend) 400; no email was delivered.** The
   diagnosis doc #349 added (`APP/web/traffic/FAILED_TEST_DIAGNOSIS_20261017.md`) records that a single authorized
   dispatch sent `POST /api/internal/traffic/morning` and the app's outbound call to Resend returned **HTTP 400 in
   ~28ms** — app trigger auth and data/format were fine (so it is **not** a trigger-secret or DB problem), but the email
   was rejected and nothing landed in the inbox. The exact cause is **unproven**; a 400 from Resend is most often an
   **invalid/malformed API key** or a payload validation error. **#348/#349 (+ this run's #350/#351) are the
   fix-forward** — they add bounded, non-secret diagnostics so the next attempt reports a safe category
   (`invalid_api_key` / `validation_error` / `invalid_idempotency_key`) and preserve an "unavailable identifier" status
   rather than swallowing it. **What to do if you want the traffic email live:** re-check that
   **`TRAFFIC_RESEND_API_KEY`** is a valid, active Resend key (and `TRAFFIC_FROM_EMAIL` is on a Resend-verified sender
   domain), then run **one** more verification send and read the returned category. **Secrets/activation territory — I
   never handle the key values; this is yours.** Nothing sends on its own.

🆕 **Traffic morning-report email is code-complete (optional — only matters if you want it live).** Dedicated
   credentials (`TRAFFIC_RESEND_API_KEY`, `TRAFFIC_FROM_EMAIL`, `TRAFFIC_MORNING_REPORT_EMAIL`), **no fallback** to the
   shared request/pitch mail; native-cron Square token refresh **fails closed** unless `SQUARE_REFRESH_CRON_ENABLED=true`.
   #348 added per-site pageview reports + daily/weekly mail delivery; #349 added safe failure diagnostics; this run's
   #350 gave the emails spacious HTML/text layouts and #351 preserved an "unavailable identifier" status — all
   `CI — web` green and guardrail-clean (no Supabase/Stripe/Square schema change, no secrets in code). A
   `workflow_dispatch` "Traffic report mail (disabled until verified)" run (#4, 10-17) completed successfully (still
   gated off by design). **To turn it on:** follow `OPERATIONS/TRAFFIC_ONLY_ACTIVATION_20261004.md` — set those
   Production-only env vars yourself (plus `CRON_SECRET`), redeploy, confirm readiness at the private
   `/api/internal/traffic/morning?dryRun=1` (no-send), then run **one** verification send (see the Resend-400 heads-up
   above). **Secrets/activation territory — yours; I never handle secret values.** Nothing sends on its own (cron fails
   closed until configured).

🆕 **Heads-up (no fix needed, your own change): merge #302 added a page/API under the protected `/customers` route.**
   It added `APP/web/src/app/customers/maracaibo-tables/` (a staff "Table Visits Desk" page) and the `/api/maracaibo/tables`
   + `/api/maracaibo/visit/[tableId]` routes. `/customers` is a hard-guardrail Client OS route, so I **don't touch it**
   and **don't revert your own merge** — flagging it so you're aware a game-seat surface now lives under `/customers`.
   Caretaker read: it's game-membership tracking (no ordering/payment, no customer PII), and CI/Vercel are green. No
   action needed unless this wasn't the intent. (#352 this run added further `/customers` onboarding pages — see its
   heads-up above.)

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
   owner onboarding one-link flow, kept **read-only/private** with credentials + seller OAuth as separate gates. #352
   this run added a Square boundary regression test (no credential/activation change). If/when you want it live, **you**
   set the Square app credentials + run the OAuth connect.

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

_Resolved / no action needed from you:_ **amma #350/#351/#352/#353 — your own merges** (10-17→10-18; `CI — web`
#417/#419/#422/#425 green): #350 spacious HTML/text traffic-email layouts, #351 preserve "unavailable identifier"
status in traffic emails (both traffic-email code only, guardrail-clean), #352 verified owner request flow + DISABLED
Bodega owner pilot (protected-route + `supabase/proposals/` buildout — see its heads-up above; gated OFF; migrations
dir unchanged), #353 owner-portal open mobile layout (`/owner/[id]` layout/CSS only). **recorded.**
**amma #343/#344/#345/#346/#347/#348/#349 — your own merges** (10-17;
`CI — web` green through #414; all guardrail-clean): #343 Aji Ichiban + Elsa's Place `/aji-ichiban` + `/elsas-place`
concept menus & collector game, #344 their QR artwork, #345 Havana 58 `/havana-58` menu & game, #346 Havana 58 QR
artwork, #347 Project Seed illustrated menu, #348 per-site traffic reports + mail delivery, #349 bounded traffic-mail
validation diagnostics. **recorded.** **amma #310/#311/#312; #307/#308/#309; #304/#305/#306; #300/#301/#303;
#294–#299; #293; #290–#292; Project Seed #278–#289 — all your own guardrail-clean merges (10-01→10-13), recorded in
this file's git history on `automation/status`.** **VBFH Daily Run outage (09-26→09-28) — SELF-RESOLVED**
(#119/#120/#121 green; fix request withdrawn). **amma #276 "Fix stable client menu destinations" — your own merge**
(09-29; touches `/m/[id]` + owner QR routes, printed Café Rush QR untouched; recorded). **amma owner-portal + Bodega
waves (#260–#273) — your own merges** (migrations `0015`–`0023`). **GitHub API access** healthy. **amma #29 ("AI
Request Desk — Phase 0")** — closed since 07-18.

---

## Build health (as of 2026-10-18, morning)

> **✅ All columns re-verified live this run** — check-runs, Daily-Run workflow state, PR file-lists, migrations dir,
> and default-branch tips read directly via API. **Zero failing workflow runs anywhere this run** (one red PR-branch
> run during #352 dev was superseded and merged green). **amma `main` ADVANCED `e0b44dd7` (#349) → `d3743c2` (#353) via
> FOUR of Anthony's own merges (#350–#353), all `CI — web` green; vbfh `master` still `75f9668`, shadow `5113ce5`,
> EscapeTheBomb `eee6a37`.**

| Repo | Build/CI | State |
|---|---|---|
| amma-fina-calle | CI on main: web (lint + build), voice-gateway (typecheck) | main **green** — tip **`d3743c2`** ("Give owner portal an open mobile layout," #353, 10-18 12:40 UTC; **Anthony's own merge**, `CI — web` **#425 ✅**, the latest web run). **Main ADVANCED this run from `e0b44dd7` (#349) via FOUR owner merges #350–#353** (traffic-email HTML/text polish + "unavailable identifier" state; the big #352 owner-request/Bodega-owner-pilot buildout on the protected `/owner/[id]` + `/customers` routes with five new `supabase/proposals/` SQL files [release-gated, pilot DISABLED] + a Square boundary test; and #353 owner-portal mobile layout). `CI — voice-gateway` **#27 ✅** unchanged (no voice-gateway code this run). **#350/#351/#353 guardrail-clean; #352 touches hard-guardrail protected routes + adds DB proposals — Anthony's own merge, flagged (see heads-up), NOT caretaker-reverted.** **Migration set UNCHANGED this run: `0015`–`0023` + `20261004094018_maracaibo_table_visits`** (+`0009`); #352's five SQL files are `proposals/`, not installable migrations. #302's migration + its `/customers/maracaibo-tables` game-seat surface remain the standing items that need Anthony. **Eight** open drafts held (see Open PRs). |
| vbfh-media-engine | CI on master (lint + tests); "VBFH Daily Run" **now manual-dispatch (activation held)** | Build **CI ✅** — master tip **`75f9668`** (unchanged; Anthony's own **#12** "Reduce daily email to results and standings per league," latest run **#35 ✅**). **⚠️ "VBFH Daily Run" is `activation held`:** the reliability wave (#9–#12) renamed the workflow and **removed its active `schedule:` trigger** (`on: workflow_dispatch` only). **Last automatic run was #121 (10-01, green); no #122 fired or will auto-fire** — content now generates only on manual dispatch / owner-approved persistent-runner activation. Build is green; this is an intentional owner change, not a failure. **No caretaker code change needed or pushed.** Scheduled/dispatch mode stays zero-spend (AI/email off by default). **Zero open PRs.** |
| shadow-engineer-rpa | No CI (local-only CLI by design) | Dormant, clean · no open PRs · no workflows (0 runs) · master tip `5113ce5`, last commit 2026-07-09 (re-verified) |
| EscapeTheBomb-DC | No CI (Unreal project, cannot build in cloud) | **#1 merged** (M1 scaffolds, squash `eee6a37`, 2026-07-30; re-verified). zero open PRs · no workflows (0 runs). First Windows compile after pull is the real verify (M2 gate). |

## Open PRs

_(All eight drafts below are unchanged, author-held since ≤09-29. No new open PRs this run; #350–#353 all merged.)_
- **amma #277 (draft, docs-only) — "preserve and queue seasonal restaurant skins work orders."** Head
  `codex/seasonal-skins-queue-20260929`, base `main`. 25-theme seasonal-skins spec + 13-row work-order CSV + queue
  item 75 (QUEUED). `mergeable_state: clean`, Vercel ✅. Body: *"Commercial proposals still require review before
  release."* **Held; his draft; no caretaker merge.**
- **amma #259 (draft) — "Grúa: cable-crane R&D game on Stringman CDPR physics…"** Internal noindex `/grua-lab`
  Phaser 4 game + opt-in on-device training recorder + docs. Guardrail-clean. Vercel ✅. Body: *"Do not merge without
  Anthony's approval."* **Held.**
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

**Since the 2026-10-17 evening check-in, FOUR amma PRs merged to `main` — all Anthony's own, all `CI — web` green;
nothing in vbfh/shadow/EscapeTheBomb moved; nothing closed unmerged.** `main` advanced `e0b44dd7` (#349) → `d3743c2`
(#353).

- **amma #353 — "Give owner portal an open mobile layout."** Merged 10-18 12:40 UTC (`d3743c2`, current main tip), `CI — web` **#425 ✅**. 10 files / +73−22: `/owner/[id]` dashboard + portal CSS + the account request-form/progress components get an open mobile layout; preserves working request entry + critical field states. **`/owner/[id]` layout/CSS only — no billing/data/auth change, no migration, no Stripe/Square/POS, no secrets.** **Anthony's own merge → recorded.**
- **amma #352 — "Prepare verified owner request flow and disabled Bodega pilot."** Merged 10-18 01:43 UTC (`58497a1`), `CI — web` **#422 ✅** (PR-branch run #420 failed mid-iteration, fixed in #421/#422). +5088−124 across 101 files: authenticated owner request queue/desk, private account onboarding/enrollment, tenant-scoped **Bodega owner pilot** (DISABLED + release-gated in CI), a Square boundary regression test, five new `APP/web/supabase/proposals/*.sql` files, and `OPERATIONS/BODEGA_*_20261018` + `OWNER_ACCOUNT_*_20261017` evidence/docs. **Touches hard-guardrail `/owner/[id]` + `/customers` routes; adds DB proposals (NOT `migrations/`); migrations dir unchanged; pilot gated OFF (nothing errors at runtime).** **Anthony's own merge → flagged (see heads-up), recorded, not reverted.**
- **amma #351 — "Preserve unavailable identifier status in traffic emails."** Merged 10-17 23:18 UTC (`513f2d9`), `CI — web` **#419 ✅**. Traffic-email code preserves an "unavailable identifier" status instead of dropping it. **Traffic-email code only; no migration/protected route/Stripe/Square/secrets.** **Anthony's own merge → recorded.**
- **amma #350 — "Give traffic emails spacious HTML and plain-text layouts."** Merged 10-17 22:04 UTC (`14915a3`), `CI — web` **#417 ✅**. Spacious HTML + plain-text traffic-email layouts; scopes styled-preview idempotency to a stable test revision. A `workflow_dispatch` "Traffic report mail (disabled until verified)" run (#4) completed green (still gated off). **Traffic-email code only; guardrail-clean.** **Anthony's own merge → recorded.**

_Earlier history (amma #343–#349 on 10-17, the Vital Vibes merges #340–#342 on 10-15, and everything back through the
Olympia / Maracaibo / Bodega / owner-portal waves) retained in this file's git history on `automation/status`._ The
standing items those merges created — the Supabase migration set `0015`–`0023` + `20261004094018_maracaibo_table_visits`
(+`0009`), the `/customers/maracaibo-tables` surface, the `TRAFFIC_*` traffic-email activation, Bodega Basic Stripe
billing, and the Square connector — are all carried in **👉 What Anthony needs to do** above.

## Branch cleanup — ready to run (refreshed 2026-09-14 afternoon)

Anthony has approved deletion, but the session git proxy returns **HTTP 403 on any `push --delete`**
(server-side block, independent of permission), and the GitHub tooling here has no branch-delete API. Commands
below remain for Anthony to paste from a local clone. **Verified KEEP:** `main`, `automation/status`, `claude/*`
caretaker branches, **the eight open-draft heads**
`codex/seasonal-skins-queue-20260929` (#277), `claude/tech-research-integration-s66gw7` (#259),
`claude/menu-control-app` (#238), `claude/instagram-dm-ordering-m8i210` (#225), `claude/blissful-darwin-gtt3su` (#221),
`claude/las-palmas-loteria-hero` (#219), `claude/e-myth-ai-automation-gcetx0` (#218),
`claude/las-palmas-menu-game-59vtbg` (#197) (deleting any closes its open draft), unmerged `voice/*` (Anthony's
judgment). **Eligible** (merged since, no longer open-draft-protected): the eight Bodega codex branches from
#257/#258/#260–#264 plus `codex/bodega-launch-guest-notes-square-20260926` (#266), the #294–#309 merged heads, the
#343–#349 merged heads, and now the newest merged heads #350 (`codex/traffic-email-presentation-20261017`),
#351 (`codex/traffic-email-identifier-state-20261017`), #352 (`codex/owner-request-audit-20261017`),
#353 (`codex/owner-open-visual-release-20261018`) — add whichever your local clone still shows after pulling `main`.
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

- **2026-10-18 (morning check-in, `claude-opus-4-8`):** **🟢 Healthy run — amma `main` advanced since the 10-17 evening check-in via FOUR of Anthony's OWN merges (#350–#353), all `CI — web` green; zero failing workflow runs across all four repos; no caretaker fix needed. Nothing NEW urgently needs Anthony beyond the standing Supabase-migration + traffic-email-activation to-dos, but a new #352 heads-up was surfaced (protected-route + Bodega-pilot DB-proposal buildout, gated OFF).** `main` moved `e0b44dd7` (#349) → **`d3743c2`** (#353); latest `CI — web` **#425 ✅**, `CI — voice-gateway` **#27 ✅** unchanged. The four: #350 spacious HTML/text traffic-email layouts (#417 ✅), #351 preserve "unavailable identifier" status in traffic emails (#419 ✅) — both traffic-email code only, guardrail-clean; **#352** verified owner request flow + DISABLED Bodega owner pilot (#422 ✅) — builds out the hard-guardrail `/owner/[id]` + `/customers` routes (owner request queue/desk, account onboarding/enrollment, Bodega owner pilot), adds a Square boundary test and **five new `APP/web/supabase/proposals/*.sql` files (proposals, NOT installable `migrations/`)**, with the Bodega release explicitly **gated/DISABLED in CI** pending a blocked DB install — **Anthony's own merge touching protected routes → flagged for awareness, NOT caretaker-reverted; nothing errors at runtime**; #353 owner-portal open mobile layout (#425 ✅, `/owner/[id]` layout/CSS only). **`migrations/` dir re-verified UNCHANGED** (`0001`–`0023` present; standing to-do still `0015`–`0023` + `20261004094018_maracaibo_table_visits`, +`0009`). The single red run in the list, `CI — web` **#420**, was a transient iteration on #352's PR branch (`codex/owner-request-audit-20261017`) — fixed in-PR (#421/#422 green) and merged green; **no caretaker action.** **No change on other default branches:** vbfh `master` `75f9668` (build `CI` **#35 ✅**), VBFH Daily Report activation-held (#121 10-01 green, no #122 by design); shadow `5113ce5` (dormant); EscapeTheBomb `eee6a37` (dormant). **Eight** open amma drafts (#277/#259/#238/#225/#221/#219/#218/#197 — all author-held, Vercel ✅, no new human review comments; no new open PRs). vbfh/shadow/EscapeTheBomb have no open PRs; shadow & EscapeTheBomb have no CI workflows. No merge-conflict/base-branch notices; GitHub API healthy all run. #218 governance question open; #29 closed (07-18). Branch cleanup still awaiting Anthony's approval (eight open-draft heads excluded; never deleted unprompted). Push notification + email sent.
- **2026-10-17 (evening check-in, `claude-opus-4-8`):** **🟢 Healthy run — amma `main` advanced via SEVEN of Anthony's OWN merges (#343–#349), all `CI — web` green and guardrail-clean; zero failing workflow runs; no caretaker fix needed.** `main` moved `ea2f57e` (#342) → `e0b44dd7` (#349). Heads-up surfaced: #349's diagnosis doc shows Anthony's traffic-email test send got a Resend HTTP 400 (email not delivered; cause unproven — likely API key / payload validation); #348/#349 are the green fix-forward. vbfh `75f9668` (CI #35 ✅), Daily Report activation-held; shadow/EscapeTheBomb dormant. Eight drafts; migration set unchanged. Push notification + email sent.
- **2026-10-17 (morning check-in, `claude-opus-4-8`):** 🟢 Healthy run — the only change org-wide since 2026-10-16 evening was ONE new guardrail-clean amma draft, #343 (later merged by Anthony himself). No default branch moved; zero failing runs. Push notification + email sent.
- **2026-10-16 (evening & morning check-ins, `claude-opus-4-8`):** 🟢 Quiet, healthy runs — nothing changed anywhere; amma `main` `ea2f57e` (#342); vbfh `75f9668`; shadow/EscapeTheBomb dormant; VBFH Daily Run #121 held; migration set unchanged; eight drafts unchanged; GitHub API healthy. Push notification + email sent each run.
- **2026-10-15 (evening & morning check-ins, `claude-opus-4-8`):** 🟢 Evening quiet; morning recorded THREE of Anthony's own guardrail-clean Vital Vibes prospect-menu merges (#340/#341/#342, `7caa2db`→`ea2f57e`; `CI — web` #390/#392/#394 ✅; isolated `/vital-vibes`). Push notification + email sent each run.
- **2026-10-14 (evening & morning check-ins, `claude-opus-4-8`):** 🟢 Quiet, healthy runs — nothing changed; amma `main` `7caa2db` (#339), vbfh `75f9668`, shadow/EscapeTheBomb dormant; VBFH Daily Run #121 held; migration set unchanged; eight drafts unchanged. Push notification + email sent each run.
- **2026-10-13 (evening & morning check-ins, `claude-opus-4-8`):** 🟢 Healthy runs — recorded nine of Anthony's own guardrail-clean prospect/demo merges (#331–#339, `95cc040`→`7caa2db`; `CI — web` green through #387). Push notification + email sent each run.
- **Older run-log entries (2026-10-12 evening back to the series' start) — trimmed on 2026-10-17 for maintainability; preserved in full in this file's git history on `automation/status`.** All were 🟢 healthy/quiet runs (or recorded Anthony's own guardrail-clean merges); none left anything needing Anthony beyond the standing Supabase-migration to-do.
