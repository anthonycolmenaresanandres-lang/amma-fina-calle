# Codex Queue — paste-ready (Codex format)

_Claude writes; Codex executes. Mark `[x]` + date when done. Global guardrails: repo `amma-fina-calle`,
app `APP/web`, clone `C:\Users\antho\OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle`. `main` = prod
(Vercel auto-deploys). Supabase ref `eipypwifiorzqopindfl`; migrations applied MANUALLY in the SQL editor;
**next migration = 0009**. NEVER: enter/print secrets, add admins, ship the premium `/m/[id]` menu or
`/owner-preview` to prod (held on `feat/owner-dashboard-premium`). Always check IN/OUT in HANDOFF_LOG.md._

---

## [ ] 1 — Turn on request-notification emails

**Codex effort:** LOW
**Scope:** Verify 3 prod env vars exist → redeploy prod → send one test request → confirm email + DB row.
**Token-saving rule:** Targeted reads only (the route file + intake.ts); no broad scan; no tests beyond the single end-to-end check. Diffs only if any code change is needed (none expected).
**Why:** Requests already save to `change_requests`, but `sendChangeRequestEmail` (src/lib/requests/intake.ts) no-ops until all 3 vars are set + a redeploy. Two are set; Anthony adds `RESEND_API_KEY`.
**Exact prompt to paste:**
```
PREREQ: `vercel env ls production` must list RESEND_API_KEY. If missing, STOP — tell Anthony to add it.
1) Confirm REQUESTS_NOTIFICATION_EMAIL, REQUESTS_FROM_EMAIL, RESEND_API_KEY all present in production.
2) Redeploy prod: `vercel --prod`; wait for READY.
3) Read src/app/api/customer-requests/route.ts for the body shape, POST one test request to
   https://finacalleos.com/api/customer-requests.
PASS = HTTP 200 + email at anthonycolmenaresanandres@gmail.com ("New request — …") + new change_requests
row. Report the reference ID so Anthony can delete the test row. Never print the key.
```

---

## [ ] 2 — Game standardization, Phase A (sellable per-café like the menu)

**Codex effort:** MEDIUM
**Scope:** New branch off main. Migration 0009 `game_config` + `get_game_config` read; `/play/[id]` route loads config into the existing Penalty engine; seed Colattao. Engine internals untouched.
**Token-saving rule:** Read only PRODUCT_MODULES/GAME_STANDARDIZATION_PLAN.md + src/penalty/skin/campaigns.ts + the /penalty-shootout route; grep for getCampaign. Output diffs/new files only; do not touch engine/geometry/input/renderer. No full build except final verification.
**Why:** Anthony will sell the game too; this mirrors the menu (one engine + per-café DB config + /id route) so a new café = one row + an ad image, no code.
**Exact prompt to paste:**
```
Plan: PRODUCT_MODULES/GAME_STANDARDIZATION_PLAN.md. Branch off main. Do NOT change engine internals
(engine/geometry/input/renderer) — only add a config data source + per-id route.
1) Migration 0009_game_config.sql (apply via SQL editor; mirror get_public_menu security model):
   table game_config(restaurant_id, title, ad_zone_image_url, player_primary, player_secondary,
   keeper_primary, keeper_secondary, enabled, updated_at); RLS owner-scoped writes; public
   security-definer get_game_config(p_restaurant_id). Seed Colattao from its COLATTAO campaign
   (ad image + green keeper 0x2e8b6b/0x14332a).
2) /play/[id]: read game_config by id → build PenaltyCampaign from it (not hardcoded getCampaign) →
   mount PenaltyClient. Fall back to default skin if no row.
3) Keep /penalty-shootout as the demo, unchanged.
PASS = /play/colattao renders the Colattao-branded game from DB; new café = row + image, no code.
Build green. Open a PR; do NOT merge without Anthony's ok.
```

---

## Held — Anthony decides (not Codex tasks)
- [ ] Ship premium `/m/[id]` menu to prod? (held — "the vercel is the truth"; lives on `feat/owner-dashboard-premium`).
- [ ] Add 2nd admin `ammaventuresvb@gmail.com`? (one `admin_emails` insert — access control, Anthony runs).

---

## [ ] 3 - Reactivate Stripe billing-link path for customer-facing app

**Codex effort:** MEDIUM
**Scope:** New branch off main. Add the smallest approved Stripe surface without touching POS, card data, `/conquest`, or held premium `/m` work. Prefer Stripe-hosted Payment Links or Checkout Sessions; no custom card form.
**Token-saving rule:** Read only `src/data/customers.ts`, `supabase/migrations/0003_customer_registry_reads.sql`, the selected target route, and Stripe integration files added for this task. No prod deploy, no secrets printed, no main merge.
**Blocked until Anthony chooses one surface:**
1. `/request-update` secure deposit after scope.
2. `/m/[id]` customer checkout/deposit button.
3. `/customers/[id]` or owner/admin billing link only.
**Exact prompt to paste after decision:**
```
Reactivate Stripe billing-link path. Use Stripe-hosted Payment Links or Checkout Sessions only.
Do not collect card data in-app. Do not touch POS, /conquest, held /m premium branch, or secrets.
Add env-name documentation only; Anthony configures real Stripe keys/links in Vercel/Supabase.
PASS = selected surface exposes a safe Stripe handoff in test mode/local config, build green, PR opened.
```

## Done
- [x] 2026-06-08 — Owner dashboard + AI Request Desk + size editing → prod (dashboard-only).
- [x] 2026-06-08 — Per-size price editor (Ask bar + Featured slots).
- [x] 2026-06-08 — Applied missing inbox migrations to prod; `/customers/requests` works.
- [x] 2026-06-08 — Resolved migration-number collision (menu → 0007/0008).
- [x] 2026-06-08 — Added 2 of 3 notification env vars to Vercel prod.
