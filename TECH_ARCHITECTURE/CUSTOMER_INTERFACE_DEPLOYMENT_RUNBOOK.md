# Customer Interface — Deployment Runbook & Work Record

> Owner-facing runbook for activating and using the Fina Calle OS customer
> interface (customer registry, request inbox, intake uploads). Also records
> what was built across the June 2026 sessions so the work is not lost.
> Production domain: **finacalleos.com** (deploys from `main`).

---

## 1. What exists now (after PR #3)

### Customer-facing (public)
| Page | URL | Purpose |
| --- | --- | --- |
| Home | `/` | Landing |
| Request a Build | `/request-update` | Customer intake form (name, contact, type, priority, message, file uploads) |
| Contact | `/contact` | Business email + "Request a Build" CTA + Colattao proof link |
| Content Engine (test brand) | `/content-engine` | Isolated content-generation brand test; not linked in nav |
| QR menu | `/m/<id>` (e.g. `/m/colattao`) | Public restaurant menu |

### Admin-facing (magic-link login required)
| Page | URL | Shows |
| --- | --- | --- |
| Customer list | `/customers` | All customers (restaurants): plan, status, billing |
| Customer account | `/customers/<id>` (e.g. `/customers/colattao`) | One customer's plan, status, contact, notes, actions |
| Request inbox | `/customers/requests` | Every submitted change request, newest first |
| Request detail | `/customers/requests/<id>` | Full message + uploaded files (signed-URL downloads) |

The owner-facing per-restaurant dashboard lives at `/owner/<id>` (separate magic-link login on the owner allowlist).

---

## 2. Activation checklist (do this once)

The app **degrades gracefully**: with no Supabase configured, admin pages show a
"Setup needed" screen and intake still accepts submissions (just doesn't store
them). To make data flow, complete all three:

### Step A — Supabase env vars in Vercel
In the Vercel project (`amma-fina-calle`) → Settings → Environment Variables,
confirm these exist for Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional (enables intake email notifications via Resend):
- `RESEND_API_KEY`, `REQUESTS_NOTIFICATION_EMAIL`, `REQUESTS_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL` (e.g. `https://finacalleos.com`) — used for magic-link redirects.

Redeploy after changing env vars.

### Step B — Run the database migrations (in order)
Apply every migration in `APP/web/supabase/migrations/` that has not been run
yet. They are idempotent and safe to re-run. Order matters:

1. `0001_owner_portal_foundation.sql`
2. `0002_change_requests_intake.sql`
3. `0003_customer_registry_reads.sql`
4. `0004_admin_gating.sql`
5. `0005_change_request_reads_and_attachments.sql`  ← request inbox + uploads
6. `0006_private_uploads_and_admin.sql`             ← private uploads + business admin

**How to run them — option 1 (Supabase SQL editor, simplest):**
1. Open your project at supabase.com → SQL Editor → New query.
2. Open the migration file from the repo, copy its entire contents.
3. Paste into the editor and click **Run**.
4. Repeat for each migration not yet applied, in numeric order.
5. Expect "Success. No rows returned" — these are schema/function changes.

**How to run them — option 2 (CLI):**
```bash
# from APP/web, with the Supabase CLI linked to your project
supabase db push
```

Then seed the starter data (Colattao + admin/owner emails) if not already present:
- Run `APP/web/supabase/seed.sql` the same way (SQL editor or `supabase db reset`/seed).

### Step C — Confirm your admin email
Admin login is an allowlist (`public.admin_emails`). After migrations:
- `anthonycolmenaresanandres@gmail.com` — seeded in `0004`.
- `ammaventuresvb@gmail.com` — added in `0006`.

You must be able to **receive the magic-link email** at whichever address you use.

---

## 3. How to log in and see customers

1. Go to **finacalleos.com/customers**.
2. Enter an admin email → click **Send sign-in link**.
3. Open the email, click the magic link → you land back on `/customers`, authorized.
4. From there:
   - Click a customer to open their account page.
   - Click **Request Inbox** (top-right) to see submitted requests.
   - Open a request to read it and download any uploaded files.

Sign out anytime via the **Sign out** button (top-right of any admin page).

Troubleshooting:
- **"Setup needed"** → Step A env vars missing.
- **"Not authorized"** → your email isn't in `admin_emails` (Step C).
- **Empty inbox / empty registry** → migrations not applied, or no data yet.

---

## 4. How a customer request flows end-to-end

```
Customer fills /request-update  ──POST──▶  /api/customer-requests
        │                                        │ validates (type, size, honeypot)
        │                                        ▼
        │                          submit_change_request()  ──▶ public.change_requests
        │                                        │
        │                          storeRequestAttachments() ──▶ Storage: request-uploads (private)
        │                                        │                add_change_request_attachment()
        │                                        ▼                  └▶ public.change_request_attachments
        │                          sendChangeRequestEmail() (Resend, optional)
        ▼
   Success screen: reference id + status
                                          ┌───────────────────────────────┐
   Admin opens /customers/requests  ◀─────┤ get_change_requests() (admin)  │
   Opens a request  ◀─────────────────────┤ get_change_request() + signed  │
                                          │ URLs minted at read time        │
                                          └───────────────────────────────┘
```

Every backend stage is best-effort and never breaks the customer's submission.

---

## 5. Security posture (as shipped)

- **Private uploads.** `request-uploads` bucket is private; the inbox reads files
  via short-lived (5 min) **signed URLs**. No public file URLs are stored.
- **No trusted client URLs.** The anon attachment-write RPC stores only a
  validated `bucket` + `path`; the app signs URLs itself.
- **Locked data access.** All reads/writes go through `security definer` RPCs;
  admin reads are gated by `is_current_user_admin()`. RLS is on for every table.
- **Security headers** (app-wide via `next.config.ts`): `X-Content-Type-Options`,
  `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, `HSTS`.
- **Honeypot** field on the intake form blocks naive bots.

### Known follow-up (not yet shipped)
- **Durable rate limiting** on `POST /api/customer-requests`. The honeypot helps,
  but a determined actor can still spam. Recommended: Upstash Redis (or similar)
  keyed by IP. This is the top remaining hardening item.

---

## 6. Work record (June 2026 sessions)

- **Content Engine test brand** — isolated `/content-engine` route reframing
  Fina Calle OS as a content-generation brand (7 prompt systems, copy-to-clipboard
  cards). Idea doc: `PRODUCT_MODULES/FINA_CALLE_CONTENT_ENGINE.md`.
- **Customer interface, end-to-end** — admin request inbox
  (`/customers/requests` + detail), intake file storage, finished `/contact`.
  Migration `0005`.
- **Trust + security pass** — business contact email (`Ammaventuresvb@gmail.com`),
  contact trust copy, intake reassurance line, private signed-URL uploads,
  hardened attachment RPC, security headers, business email added to admin
  allowlist. Migration `0006`.
- **Merged** to `main` via PR #3 (merge commit `f8db81e`).

Key source paths:
- Routes: `APP/web/src/app/customers/`, `APP/web/src/app/{contact,request-update,content-engine}/`
- Data: `APP/web/src/data/{customers,requests}.ts`
- Intake: `APP/web/src/app/api/customer-requests/route.ts`, `APP/web/src/lib/requests/intake.ts`
- DB: `APP/web/supabase/migrations/000{1..6}_*.sql`, `APP/web/supabase/seed.sql`
