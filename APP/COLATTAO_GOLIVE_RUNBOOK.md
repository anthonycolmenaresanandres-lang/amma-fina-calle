# Colattao Go-Live Runbook — Fina Calle Client OS

Colattao is the **first live customer**. This runbook takes it from "code shipped"
to "fully set up and verified." **Billu's / any second restaurant does not start
until every check below passes for Colattao.** No code changes here — setup +
verification only.

Owner email to use for testing: the seeded `anthonycolmenaresanandres@gmail.com`
(swap to the real Colattao owner before handing off — see Gap G3).

---

## 1. Required Supabase migrations

Run in the Supabase **SQL Editor**, in order. All are idempotent (safe to re-run).
Source: `APP/web/supabase/migrations/`.

| Order | File | Adds | Confirm by |
|---|---|---|---|
| 1 | `0001_owner_portal_foundation.sql` | Tables, RLS, `apply_owner_change`, `get_public_menu` | ✅ already run |
| 2 | `0002_change_requests_intake.sql` | Intake columns + `submit_change_request` | `\d change_requests` shows `business_name` |
| 3 | `0003_customer_registry_reads.sql` | `get_customer_registry` / `get_customer` | functions exist |
| 4 | `0004_admin_gating.sql` | `admin_emails`, lock registry to admins, revoke anon | `select email from admin_emails;` |

Then run `supabase/seed.sql` (only seeds if Colattao has no categories yet).

Also one-time (not a migration): create a **public** Storage bucket `menu-images`
with an insert/update policy for `authenticated` (owner photo uploads).

---

## 2. Colattao seed / registry data to verify

After migrations + seed, confirm in the SQL Editor:

```sql
select id, business_name, plan, billing_status from restaurants where id='colattao';
select email, role from owner_emails where restaurant_id='colattao';
select name, price, is_available from menu_items where restaurant_id='colattao' order by sort_order;
select text from promos where restaurant_id='colattao' and is_active;
select day_of_week, open_time, close_time, is_closed from hours where restaurant_id='colattao' order by day_of_week;
```

Expected: Colattao / Interactive / manual; owner email present; items Espresso 3.50,
Cortado 4.00, Almond Croissant 4.50; promo about the mini-game; Mon–Sat open, Sun closed.

---

## 3. Owner portal checklist (`/owner/colattao`)

- [ ] Unconfigured guard gone — page shows **sign-in form**, not "Setup needed".
- [ ] Enter the authorized owner email → "check your inbox" neutral message.
- [ ] Magic-link email arrives → clicking lands on the **dashboard**.
- [ ] Dashboard shows the seeded menu, promo, and empty change history.
- [ ] Edit an item **price** → saves → appears in **Change history** with old→new value.
- [ ] Toggle an item **availability** → reflects on the public menu.
- [ ] Upload an item **photo** → "Photo set" (requires `menu-images` bucket).
- [ ] **Negative:** a non-owner email → same neutral message, **no email** sent.
- [ ] **Negative:** signed-in non-owner visiting `/owner/colattao` → "Not authorized".
- [ ] `/owner/does-not-exist` → 404. Sign out works.

---

## 4. Public menu QR checklist (`/m/colattao`)

- [ ] `/m/colattao` renders Colattao, categories, items + prices, promo, hours.
- [ ] Hidden/unavailable items do **not** appear publicly.
- [ ] Only safe columns show — **no** contact info / notes / billing leak.
- [ ] `/m/does-not-exist` → 404.
- [ ] Decide the **final production URL** before printing (see Gap G1).
- [ ] Generate **two** QR codes via the asset pipeline (`ASSET_REGISTRY/.../qr_v1`):
  - **Public QR → `/m/colattao`** (tables, window, receipt).
  - **Owner QR → `/owner/colattao`** (staff-only, firmly mounted).
- [ ] Print spec: error-correction **level H**, matte laminate, test-scan before mounting.

---

## 5. Request / update checklist (`/request-update`)

- [ ] Page shows the premium "Request a Build" funnel + 3-step trust path.
- [ ] Submit a test request → success panel shows a **reference ID**.
- [ ] Row appears in `change_requests` (requires `0002`):
      `select reference_id, business_name, status from change_requests order by created_at desc limit 3;`
- [ ] If Resend env set → notification email arrives at `REQUESTS_NOTIFICATION_EMAIL`.
- [ ] Invalid input (empty business name) → 400, no row written.
- [ ] Attachments: accepted + validated, **not stored yet** (expected; see Gap G5).

---

## 6. Admin `/customers` checklist (requires `0004`)

- [ ] Anonymous → `/customers` shows **admin sign-in**.
- [ ] Admin email → magic link → registry lists **Colattao**.
- [ ] `/customers/colattao` shows plan/status/billing + contact + notes (admin only).
- [ ] **Negative:** authenticated non-admin (e.g. the owner) → "Not authorized".
- [ ] **Direct-RPC lock:** anon calling `get_customer_registry()` → **permission denied**;
      authenticated non-admin → **zero rows**.
- [ ] Sign out works.

---

## 7. Production-readiness gaps

- **G1 — QR URL stability (high).** QR codes glued to a wall are costly to change.
  Lock the **final domain** (custom domain vs `*.vercel.app`) and set
  `NEXT_PUBLIC_APP_URL` to it **before** printing/mounting any QR.
- **G2 — Auth email deliverability (high).** Supabase's built-in auth email is
  rate-limited and unbranded — fine for testing, weak for a real owner. Configure
  **custom SMTP** (or Resend) for auth emails before relying on owner sign-in.
- **G3 — Real owner email.** Replace the seeded test email in `owner_emails` with
  the actual Colattao owner's address; keep an AMMA address as backup owner.
- **G4 — Storage bucket.** `menu-images` bucket + authenticated insert policy must
  exist or photo upload fails. Verify in checklist §3.
- **G5 — Request attachments not stored.** Intake validates files but doesn't store
  them (Vercel Blob deferred). Set owner expectation: AMMA may follow up to collect.
- **G6 — Deployment Protection.** Previews 403 to automation, so external/automated
  verification is manual. Decide whether production stays protected.
- **G7 — Single admin.** Add a second admin email for redundancy (lockout risk).
- **G8 — Rate limiting.** Magic-link request endpoints have no rate limit yet;
  acceptable at one customer, revisit before scale.
- **G9 — Backups.** Confirm Supabase plan/backup posture before depending on it.

---

## 8. Exact next safe implementation step

**None until Colattao is verified live.** The platform code for every Colattao
surface is shipped and green; what remains is **operational** (run `0002`–`0004`,
seed checks, manual magic-link verification) — not code.

The only code worth doing *before* live verification, if anything, is **G1**:
ensuring QR/magic-link URLs are pinned to the final production origin
(`NEXT_PUBLIC_APP_URL`) so printed QR codes never break. That's a config/env step,
not a feature. Hold all other implementation (Stripe S1, onboarding automation,
second restaurant) until this runbook passes end-to-end for Colattao.
