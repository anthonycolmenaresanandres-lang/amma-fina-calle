# Restaurant Owner Portal — Build Plan

Status doc + implementation plan for the secure restaurant-owner page where owners
sign in, see their project(s), edit their menu, and send change requests. Reached
from a QR code mounted in the restaurant.

This plan is the agreed direction before any portal code is written. It extends
`TECH_ARCHITECTURE/FINA_CALLE_OS_INFRASTRUCTURE_PLAN.md` (the "Owner Command Center"
and "Request / Update Portal" modules) and replaces the placeholder
`APP/ROUTE_PORTAL_PLAN.md` for the owner-facing surface.

---

## 1. Where we stand today (June 2026)

The app at `APP/web` (Next.js 16, React 19, Tailwind 4, deployed on Vercel) already
contains a partial owner system. It is roughly 40% of the target.

### Already built and working
| Piece | File | What it does |
|---|---|---|
| Per-restaurant page | `src/app/customers/[id]/page.tsx` | Renders one restaurant: plan, account status, billing status, live-site link, "Request Update" button, contact info, notes. |
| Customer registry | `src/data/customers.ts` | Typed list of restaurants. Correct shape, but hardcoded (1 entry: Colattao). This is the "database" today. |
| Accounts list | `src/app/customers/page.tsx` | Lists all restaurants with links to their page / live site / request form. |
| Request form | `src/components/CustomerRequestForm.tsx` + `src/app/request-update/page.tsx` | Owner submits business name, request type, priority, message, optional file attachments. |
| Request API | `src/app/api/customer-requests/route.ts` | Validates request + files (type, size, honeypot anti-spam), returns a reference ID. |

### Gaps to close
1. **No security.** Anyone with the URL sees any restaurant's page. The page text
   itself admits "not a secure admin portal yet."
2. **Requests are discarded.** The API validates, returns a reference ID, then only
   `console.log`s — no email, no storage, no persistence. (Intentional "Phase 1".)
3. **The database is a code file.** Adding a restaurant means editing `customers.ts`
   and redeploying.
4. **No menu data.** The owner page links to an external live site; there is no menu
   model owned by the app, so nothing to edit or connect a QR to.
5. **No per-restaurant owner QR.** Colattao has QR *assets*, but they point at the
   public menu, not a secure owner page.

---

## 2. Target experience

```
        ┌─────────────────────────┐
        │  QR on the wall (owner)  │  ← private, firmly mounted in back-of-house
        └───────────┬─────────────┘
                    │ scan
                    ▼
        /owner/colattao  → "Enter your email"
                    │ magic link emailed via Resend
                    ▼
        Click link → signed session cookie (30 days)
                    │
                    ▼
   ┌──────────────────────────────────────────────┐
   │  OWNER DASHBOARD  (/owner/colattao)            │
   │  • Project status & live site                  │
   │  • Edit menu (categories, items, prices, photo)│
   │  • Send change request (existing form, now     │
   │    persisted + emailed to AMMA)                │
   │  • Request history + status                    │
   └──────────────────────────────────────────────┘

   A second PUBLIC QR (customer-facing, on tables) → /m/colattao (read-only menu)
   Both menus read the SAME data → one source of truth.
```

Two QR codes per restaurant:
- **Public QR** (tables, window): customer menu `/m/{id}` — read-only.
- **Owner QR** (mounted firmly, staff-only area): `/owner/{id}` — secured.

---

## 3. Authentication: email magic link (chosen)

Owner enters their email → receives a one-time sign-in link → clicking it sets a
signed, http-only session cookie valid ~30 days. No passwords to store, reset, or
leak; self-service; "real account" feel. Costs one email send per login.

### Why this over the alternatives
- **No password database** to secure or breach.
- **Self-service** — owner doesn't depend on us handing out a PIN.
- Naturally **ties the login to an email we already collect** at intake.
- The wall QR carries no secret; security lives in the owner's inbox.

### Mechanics
1. `/owner/{id}` checks for a valid session cookie. If present → dashboard. If not →
   email-entry screen.
2. Owner submits email. We verify the email is on that restaurant's authorized list
   (`owner_emails`). If yes, we create a single-use token (random, hashed in DB,
   ~15-min expiry) and email a link: `/owner/{id}/verify?token=…`.
3. Clicking the link validates the token (exists, unexpired, unused, matches
   restaurant), marks it used, and sets a signed session cookie
   (JWT or signed value via `jose` / iron-session), http-only, secure, SameSite=Lax.
4. Middleware / a server check gates `/owner/{id}` routes on a valid cookie whose
   `restaurantId` matches the URL. Mismatch → re-auth.
5. Sign-out clears the cookie. No email enumeration: always show "check your inbox,"
   only send if the email is authorized.

### Security guardrails
- Tokens: cryptographically random, stored **hashed**, single-use, short expiry.
- Cookies: http-only, secure, SameSite=Lax, signed with a secret in Vercel env vars
  (never committed). Honors existing guardrail "No secrets in repos."
- Rate-limit the request-link endpoint (per-IP + per-email) to stop abuse.
- Each session is scoped to one `restaurantId`; one owner cannot read another's data.
- Optional later: a super-admin role for AMMA to view all restaurants.

---

## 4. Data model (move off the code file)

Stack stays inside the documented infra plan: **Vercel + Vercel Postgres + Vercel
Blob + Resend.** Postgres replaces `src/data/customers.ts` as the registry/database.

```
restaurants
  id (slug, e.g. "colattao")      plan            status
  business_name                   billing_status  site_url
  contact_name / email / phone    notes           created_at

owner_emails           -- who may sign in for a restaurant
  id  restaurant_id(fk)  email  role(owner|manager|admin)  created_at

login_tokens           -- magic-link tokens
  id  restaurant_id(fk)  email  token_hash  expires_at  used_at

menu_categories
  id  restaurant_id(fk)  name  sort_order

menu_items
  id  category_id(fk)  name  description  price  photo_url(Blob)  is_available  sort_order

change_requests        -- persisted version of today's intake
  id  restaurant_id(fk)  request_type  priority  message
  contact_info  status(new|in_progress|done)  reference_id  created_at

request_files          -- attachments stored in Vercel Blob
  id  request_id(fk)  blob_url  filename  content_type  size
```

Migration: seed `restaurants` + `owner_emails` from the current Colattao entry so
nothing is lost. Keep `getCustomerById` as a thin DB query so existing pages keep
working during the swap.

---

## 5. Connecting it to the menu

- One menu lives in `menu_categories` + `menu_items`, owned by the restaurant.
- **Owner dashboard** gets an "Edit Menu" section: add/edit/reorder categories and
  items, set prices, toggle availability, upload an item photo (→ Vercel Blob).
- **Public customer menu** at `/m/{id}` reads the *same* tables, read-only, styled for
  diners. The wall/table QR points here.
- Result: owner edits once, the live customer menu updates. No more "email us to
  change a price" for routine edits — that's the core value of the portal.

---

## 6. QR strategy (firmly on the wall)

- **Owner QR** → `/owner/{id}`. Mounted in a staff-only spot (back office / under the
  counter). Carries no secret — auth is the magic link — so a photo of the QR is
  harmless.
- **Public QR** → `/m/{id}`. Tables, window decal, receipt. Customer-facing.
- Generate both per restaurant through the existing asset pipeline
  (`ASSET_REGISTRY/.../qr_v1`), so they match brand styling and get versioned like
  every other approved asset.
- Print spec: high error-correction (level H) so a scuffed wall sticker still scans;
  matte laminate; test-scan before mounting.

---

## 7. Build order (each phase ships independently)

| Phase | Goal | Touches | Ship value |
|---|---|---|---|
| **A. Lock the door** | Magic-link auth over a new `/owner/{id}` route (initially mirroring today's `customers/[id]` content). Needs Resend + session secret + `login_tokens` + `owner_emails`. | new routes, middleware, Resend, minimal DB | Owners have a private page; nobody else does. |
| **B. Persist requests** | Save `change_requests` to DB, store files in Blob, email AMMA on submit, show request history on the dashboard. | upgrade existing API + dashboard | Requests stop vanishing; you get notified. |
| **C. Real database** | Move `restaurants` + `owner_emails` to Postgres; `customers.ts` becomes a query. Admin can add a restaurant without a deploy. | data layer swap | Scales past one restaurant; true customer database. |
| **D. Menu module** | `menu_*` tables, owner "Edit Menu" UI, public `/m/{id}` reader, both QR codes. | new menu UI + public page | The headline feature: self-serve menu tied to the QR. |
| **E. Polish (optional)** | Request status workflow, AMMA super-admin view, monthly summary, retention notes. | admin surface | Matches infra-plan Phase 6 without fake analytics. |

Recommended first deploy = **Phase A**. It directly answers "how do I password-secure
it" and is the prerequisite for everything else.

---

## 8. New dependencies & env vars (when Phase A starts)

- `resend` — magic-link + notification email.
- A session lib (`jose` or `iron-session`) — signed cookies.
- `@vercel/postgres` (or chosen serverless DB) — Phase C, can start in Phase A for
  `login_tokens`/`owner_emails`.
- Env vars (Vercel project settings, **never committed**): `SESSION_SECRET`,
  `RESEND_API_KEY`, `DATABASE_URL`, `APP_BASE_URL`.

## 9. Guardrail check (against the infrastructure plan)

- No secrets in repo — secrets live in Vercel env. ✅
- No payment data stored — billing stays Stripe-hosted links later. ✅
- Database/auth added now because the workflow finally proves it's needed (the plan
  explicitly allows this). ✅
- No POS integration. ✅
- No fake features — every dashboard element maps to real data. ✅

## 10. Open decisions for later (not blockers)

- Multiple owner emails per restaurant from day one, or single owner first?
- Should AMMA receive request emails, in-app only, or both?
- Public menu URL shape: `/m/{id}` vs a custom domain per restaurant.
- Session length (30 days proposed) and whether to offer "remember this device."
