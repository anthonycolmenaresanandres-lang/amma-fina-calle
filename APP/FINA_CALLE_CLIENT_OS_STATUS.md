# Fina Calle Client OS — Workstream Status

Single source of truth for the **customer portal / Client OS** workstream (not
asset production). Tracks the platform that lets restaurant owners reach their
page, manage their menu, send requests, and (later) pay.

Branch: `claude/restaurant-owner-page-status-TUOJ6` · PR #1
Last updated: 2026-06-06

## 🚧 Active blocker
**Supabase migration `0004_admin_gating.sql` must be run in the Supabase SQL
Editor.** Until it's confirmed:
- Do **not** add Billu's or any second restaurant.
- The `/customers` direct-RPC lock isn't active (pages already fail closed).
- Stripe step **S1** does not start.

Earlier migrations (`0002`, `0003`) should also be confirmed applied; only `0001`
is confirmed run. Run order + phone-safe steps are in `APP/web/SUPABASE_SETUP.md`.

## Tracked items

| # | Item | Status | Where | Next |
|---|---|---|---|---|
| 1 | **Owner portal** (magic-link auth, audited write rail, dashboard) | ✅ Shipped, live-verify pending | `/owner/[id]`, `apply_owner_change` | Confirm magic-link sign-in live |
| 2 | **Public menu QR** (read-only menu) | ✅ Shipped, needs live data | `/m/[id]`, `get_public_menu` | Generate owner+public QR assets once data live |
| 3 | **Customer registry** (DB-backed) | ✅ Shipped | `restaurants`, `/customers` reads | Verify reads after `0003` confirmed |
| 4 | **Request / update intake** (persist + email) | ✅ Shipped | `/request-update`, `api/customer-requests`, `submit_change_request` | Run `0002`; optional Resend env |
| 5 | **Premium customer funnel** | ✅ Shipped | `/request-update` copy + trust path | Iterate after live review |
| 6 | **Stripe planning** | ✅ Plan only | `APP/STRIPE_PAYMENT_INTEGRATION_PLAN.md` | Start S1 after `0004` |
| 7 | **Supabase migrations** | ⏳ Partial | `APP/web/supabase/migrations/` | Run `0002`, `0003`, `0004` |
| 8 | **Admin-gated `/customers`** | ✅ Shipped, inert until `0004` | `admin_emails`, `getAdminContext` | Run `0004`; confirm admin sign-in |
| 9 | **Future restaurant onboarding** | ⛔ Blocked | — | Unblocks when `0004` confirmed |

## Migrations ledger

| File | Purpose | State |
|---|---|---|
| `0001_owner_portal_foundation.sql` | Tables, RLS, `apply_owner_change`, public read | ✅ Confirmed run |
| `0002_change_requests_intake.sql` | Intake columns + `submit_change_request` | ⏳ Run pending/unconfirmed |
| `0003_customer_registry_reads.sql` | `get_customer_registry` / `get_customer` | ⏳ Run pending/unconfirmed |
| `0004_admin_gating.sql` | `admin_emails`, lock registry to admins, revoke anon | 🚧 **Blocker — run next** |

## Build/deploy health
All commits build green and deploy on Vercel (Foundation Pass 001 → Phase B →
Phase C → admin gating → funnel/Stripe plan). Live black-box verification is
blocked by Vercel **Deployment Protection** (403 to automation) — environmental,
not a build failure. Magic-link round-trips need the owner/admin inbox.

## Phase ledger (shipped)

| Phase | Commit | Summary |
|---|---|---|
| Plan + locked decisions | `67fd190` | Supabase, audit rail, RLS decided |
| Foundation Pass 001 | `c052681` | Owner magic-link auth, audited rail, public menu |
| Phase B | `175ced4` | Persist + email change requests |
| Phase C | `645651f` | Customer registry on Supabase |
| Admin gating | `70a3156` | `/customers` behind admin magic-link |
| Funnel + Stripe plan | `ecd1a29` | Premium `/request-update`, Stripe plan doc |

## Next safe work (while `0004` pending)
Planning / docs / non-data-exposing only:
- QR asset strategy doc (owner QR vs public QR placement + print spec).
- Owner onboarding runbook (how a new restaurant is added once `0004` is live).
- Stripe S1 prep checklist (account setup, first deposit Payment Link).
- Live verification checklist hand-off (the manual magic-link steps).

Do not add restaurants or expose private data until `0004` is confirmed.
