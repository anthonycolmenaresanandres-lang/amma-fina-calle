# Premium owner portal and standard delivery kit

## Scope and plan

Anthony approved a scoped live owner-portal improvement on2026-09-14. Keep the separate Colattao guest website, menu and game unchanged. No customer account activation, access grants, database/configuration changes, payment transactions, client send or print order are authorized by this release.

1. Give existing owner tools a premium hospitality presentation: Edit menu, Payments, Contact Fina Calle, History and Owner guide. Preserve current tenant authorization and forced password reset.
2. Retain Stripe-hosted invoice/payment management. Permit recurring enrollment only against explicit per-client approved terms; never treat an active subscription or return URL as proof that all invoices are paid. Protect duplicate/retry behavior using existing infrastructure.
3. Document actual owner features, not planned capability. Menu updates are sequential, one field at a time; Colattao uses change requests because its separate live menu is not connected here.
4. Create a standard manual and a one-page Colattao private-office sign-in QR handout. Encode only the stable public sign-in URL, never a credential or private identifier. Decode final renders and require a physical proof before a batch.
5. Verify the combined application and final print, then publish only the approved owner scope. Record live route/deployment evidence separately from authenticated acceptance still requiring a real authorized owner.

## Verified starting state

- Production base: a08c51a3ad8629a4e900a010dc61a33c7a363ed0, merged PR233. Las Palmas existing online-order link already released at its permanent /demo/las-palmas QR.
- Public owner routes: /owner/colattao returns200; /owner/las-palmas-lynnhaven and /owner/aj-gators return404. A known-client setup-pending notice is presentation only, not an active account or access grant.
- Source includes account information, audit history, scoped menu mutations, change requests, online-only owner app manifest, Stripe-hosted billing and optional manual payment reporting.
- Source-level billing gaps: global enrollment readiness, missed-date immediate-start risk, existing unpaid subscription duplication, webhook duplicate-event crash gap, stale event snapshots and one-off invoice confusion.
- Live database grants, tenant billing terms, provider configuration and authenticated owner/payment operation are not verified by these public/source checks.

## Research decisions

Reuse hosted Stripe checkout/portal instead of collecting payment details or building a custom card form. The portal supports existing invoice customers as well as subscriptions. Saving a payment method is not the same as agreeing to recurring enrollment. Stripe events can retry or arrive out of order; use durable state and current provider reads, and fail safely when uncertain.

Primary references checked2026-09-14:

- https://docs.stripe.com/customer-management
- https://docs.stripe.com/invoicing/hosted-invoice-page
- https://docs.stripe.com/billing/subscriptions/overview
- https://docs.stripe.com/webhooks

## Verification and delivery

Pending implementation. Record targeted tests, inspected views, PDF decode counts, exact PR/production revision, actual public route checks and remaining private/physical acceptance below. Never infer successful payments or menu publication from a fixture or a sign-in page.
