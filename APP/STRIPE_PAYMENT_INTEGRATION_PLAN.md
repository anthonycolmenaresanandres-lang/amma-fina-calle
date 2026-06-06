# Stripe Payment Integration Plan

Planning only — **no live Stripe is integrated**, and no payment code exists in
the app yet. This document defines how AMMA/Fina Calle will collect deposits and
payments later, consistent with the guardrails in
`TECH_ARCHITECTURE/FINA_CALLE_OS_INFRASTRUCTURE_PLAN.md`:
**Stripe-hosted links/checkout only, no card data stored in the app, billing kept
separate from client POS.**

## 1. Where payments fit the journey

```
Public funnel (live today)            Payment layer (this plan)
──────────────────────────            ─────────────────────────
/ "Request a Build"  ─►  /request-update  ─►  request saved (Phase B)
                                              │
                                  AMMA reviews + scopes
                                              │
                              ┌───────────────┴───────────────┐
                          Deposit link                   Full invoice
                       (Stripe Payment Link            (Stripe hosted
                        or Checkout Session)            invoice)
                                              │
                                  webhook ► mark paid in DB
```

Payment is **operator-initiated after a human scopes the work** — not an
instant self-serve checkout. That fits a premium, quote-led local-business
service and avoids charging before scope is agreed.

## 2. Package tiers

Reuse the existing `plan` values already in `restaurants` / the registry
(`Starter`, `Interactive`, `Premium`) so billing and the account view stay
aligned. Indicative structure (final prices set by Anthony, not committed here):

| Tier | Who it's for | Includes (indicative) | Setup | Monthly |
|---|---|---|---|---|
| **Starter** | Single QR menu + branded page | Digital menu, public QR, owner request flow | one-time deposit + setup | small care plan |
| **Interactive** | Starter + interactive layer | + mini-game/experience, owner dashboard editing | higher setup | mid care plan |
| **Premium** | Full branded system | + campaign assets, priority updates, multi-surface QR | custom | custom |

Deposits unlock build; monthly "care plan" covers updates. Keep tiers few and
legible — no pricing maze.

## 3. Deposit / payment flow

1. Owner submits `/request-update` → request persisted (Phase B).
2. AMMA reviews, picks a tier, agrees scope.
3. AMMA generates a **deposit link** for that restaurant (Payment Link or a
   Checkout Session with the deposit amount).
4. Owner pays on Stripe-hosted UI. App never sees card data.
5. Stripe **webhook** marks the deposit paid → `restaurants.billing_status`
   moves (e.g. `invoice_sent` → `paid`) and an optional `payments` row is
   recorded (amount, status, stripe ids — **never** card data).
6. Build proceeds; remaining balance billed via a hosted **invoice** at delivery.

## 4. Checkout Session strategy

- Use **Stripe Checkout** (hosted) for deposits/setup fees when a dynamic amount
  or line items are needed. Create the session **server-side** in a Route Handler
  (e.g. `POST /api/billing/checkout`) — admin-gated, reusing the `getAdminContext`
  pattern so only AMMA can mint sessions.
- Pass `client_reference_id = restaurant.id` and `metadata = { restaurant_id }`
  so the webhook can reconcile.
- `success_url` / `cancel_url` return to an admin confirmation page, not a public
  route.
- No `NEXT_PUBLIC_` Stripe secret — the secret key stays server-only.

## 5. Invoice / payment-link strategy

- For simple, repeatable deposits: **Stripe Payment Links** (created once in the
  Stripe dashboard, reused), lowest-code path — matches the infra plan's
  "hosted links later."
- For per-client balances and monthly care: **Stripe Invoices** (hosted invoice
  URL emailed by Stripe). Store only the resulting `hosted_invoice_url` +
  status, mirroring the deferred `stripeInvoiceUrl` / `stripePortalUrl` fields
  we intentionally left out in Phase C.
- For ongoing care plans later: **Stripe Billing/subscriptions** + the **Customer
  Portal** (hosted) for owners to manage their plan — again, hosted, no card data
  in-app.

## 6. Webhook needs

A single server-side Route Handler `POST /api/billing/webhook`:
- Verify the signature with `STRIPE_WEBHOOK_SECRET` (raw body — disable body
  parsing / read the raw request). Reject unverified events.
- Handle: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
  and (later) `customer.subscription.updated/deleted`.
- On success: update `billing_status` and upsert a `payments` row via a
  **security-definer RPC** (same locked-rail pattern as `apply_owner_change` /
  `submit_change_request`) so there is no broad table write grant.
- Idempotent: key on the Stripe event/object id to avoid double-processing
  webhook retries.

## 7. Required env vars (all server-only — never `NEXT_PUBLIC_`)

- `STRIPE_SECRET_KEY` — server API calls.
- `STRIPE_WEBHOOK_SECRET` — webhook signature verification.
- (Optional) `STRIPE_PRICE_STARTER` / `_INTERACTIVE` / `_PREMIUM` — price ids if
  using fixed Prices.
- Reuse existing `NEXT_PUBLIC_APP_URL` for success/cancel redirects.
- Set in Vercel project env; never committed. The publishable key is only needed
  if a client-side Stripe.js element is ever used (hosted Checkout/Links don't
  require it).

## 8. Schema additions (when implemented, not now)

```
payments
  id  restaurant_id(fk)  kind(deposit|balance|care_plan)
  amount_cents  currency  status(pending|paid|failed|refunded)
  stripe_object_id  hosted_url  created_at
-- restaurants: revisit deferred billing-link columns then
```
Plus a `record_payment()` security-definer RPC for the webhook to call. No card
data, ever.

## 9. Safety / security notes

- **No card data in the app or DB** — Stripe-hosted UI only. Keeps PCI scope
  minimal.
- **Secrets server-only**, in Vercel env, never committed; no `NEXT_PUBLIC_`
  Stripe secret.
- **Webhook signature verification mandatory**; ignore unverified events.
- **Admin-gate** session creation (`getAdminContext`) so only AMMA mints
  checkout/invoices.
- **Idempotent** webhook handling against retries.
- **Writes via locked RPC**, consistent with the existing rail philosophy.
- **Separate from client POS** — Fina Calle bills for its own services only; it
  does not touch Square/Toast/Clover.
- **Fail closed / graceful**: if Stripe env is absent, billing endpoints no-op
  with a clear "not configured" response, exactly like the Supabase/Resend
  pattern — unrelated routes keep working.

## 10. Recommended Stripe sequence

1. **S0 (now):** this plan + public funnel polish (no Stripe).
2. **S1:** Stripe account + a single hosted **Payment Link** for a deposit;
   share manually. Zero app code — validates willingness to pay.
3. **S2:** `payments` table + `record_payment()` RPC + **webhook** so paid status
   reflects in `billing_status` automatically.
4. **S3:** admin-gated **Checkout Session** endpoint for dynamic deposits, with
   reconciliation via `client_reference_id`.
5. **S4:** hosted **Invoices** for balances; surface `hosted_invoice_url` on the
   (admin-gated) customer detail page — re-introduces the deferred Phase C fields.
6. **S5 (optional):** subscriptions + Customer Portal for monthly care plans.

Gate each step behind the prior one shipping green, same discipline as the
owner-portal phases. **Do not start S1 until migration `0004` is confirmed** and
the registry/admin layer is verified live.
