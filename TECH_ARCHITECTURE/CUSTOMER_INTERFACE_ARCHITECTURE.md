# Customer & Admin Interface — Architecture Overview

> How the Fina Calle OS customer-facing and admin interfaces are built, why they
> live on Vercel + Supabase, and how that maps onto the design system. Companion
> to `CUSTOMER_INTERFACE_DEPLOYMENT_RUNBOOK.md` (the activation steps).

---

## 1. One app, two audiences

Everything is a single Next.js app (App Router) deployed on **Vercel**, backed by
**Supabase**. There is no separate "admin app" — public and admin surfaces are
the same codebase and the same design system, separated only by an auth gate.

| Layer | Runs on | Responsibility |
| --- | --- | --- |
| All pages (public + admin) | Vercel (Next.js) | Rendering, routing, the dark/champagne-gold design shell |
| Data, auth, file storage | Supabase | Postgres tables, magic-link Auth, Storage (private uploads) |
| Email (optional) | Resend | Intake notifications; recommended for Auth SMTP too |

```
            Customer browser                    Owner / Admin browser
                  │                                     │
        public routes (SSR/static)            gated routes (force-dynamic)
   /  /content-engine  /request-update        /customers  /customers/requests
   /contact  /m/[id]  /case-studies           /customers/[id]  /owner/[id]
                  │                                     │
                  └───────────────  Vercel (Next.js)  ──┘
                                        │
                         server components / route handlers / server actions
                                        │  (anon + cookie session)
                                        ▼
                                   Supabase
                     Postgres (RLS + security-definer RPCs)
                     Auth (magic links + allowlists)
                     Storage (request-uploads, menu-images — private/public)
```

## 2. Public vs admin is routing + a gate, not two sites

- **Public** pages render for anyone: the landing page, the Content Engine test
  brand, the intake form, contact, and per-restaurant QR menus (`/m/[id]`).
- **Admin** pages (`/customers/*`) and **owner** pages (`/owner/[id]`) call
  `getAdminContext()` / owner auth first and render a login gate unless the
  visitor holds a valid Supabase session whose email is on the right allowlist.
- Same components, same styling tokens, same shell — the only difference is the
  gate. This keeps the premium look consistent across the whole product.

## 3. Multi-tenant by id (no redeploy to onboard)

Customers are rows in Supabase (`public.restaurants`), not hardcoded routes:

- `/m/<id>` — public QR menu
- `/owner/<id>` — owner dashboard (owner allowlist)
- `/customers/<id>` — admin account view (admin allowlist)

Adding a client = inserting a row (and its owner email) in Supabase. Brand assets
drop into `/public/assets/<id>/` and register in `src/lib/brand.ts`. **No code
deploy is required to onboard a new customer.**

## 4. Security model (lives in the database, not the UI)

- **RLS on every table.** Direct table writes are not granted; all reads/writes
  go through `security definer` RPCs (migrations `0001`–`0006`).
- **Admin gating** via `is_current_user_admin()`; owner gating via
  `is_owner_email()`. Reads fail closed (empty results) for the wrong caller.
- **Passwordless auth.** Supabase magic links; allowlists (`admin_emails`,
  `owner_emails`) decide who gets in. No passwords stored.
- **Private file uploads** served via short-lived signed URLs.
- **App-wide security headers** via `next.config.ts`.

Because the rules live in Postgres, the serverless frontend can't accidentally
leak data — the database refuses it regardless of what the UI requests.

## 5. Can it keep living on Vercel as-is? Yes.

This is a standard, production-grade pattern: **Next.js on Vercel + Supabase**.
It fits the current scale (a handful of local-business tenants, lightweight admin)
with room to grow. Nothing needs to move off Vercel.

### Get these right in production
1. **Deployment Protection** — keep previews protected but **Production public**,
   or customers hit a Vercel login wall. (See runbook §7.)
2. **Auth email deliverability** — point Supabase Auth at **custom SMTP** (e.g.
   Resend) so magic-link sign-in emails actually arrive. (See runbook §8.)

### When you'd add to this setup (not now)
- Background/scheduled work → **Vercel Cron** or a queue.
- Abuse protection on public intake → **durable rate limiting** (e.g. Upstash).
- Heavy multi-tenant admin (bulk ops, analytics) → a richer dashboard, still on
  the same stack.

The single-app-on-Vercel model is the right call until one of those pressures
actually shows up.
