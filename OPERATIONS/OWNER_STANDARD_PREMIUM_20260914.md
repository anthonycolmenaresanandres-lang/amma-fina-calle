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

Candidate implementation3577f47 is in draft PR234. Exact-head GitHub CI34844695869 (lint, owner/billing tests and production build) and Vercel preview checks pass. Local owner-account13checks, owner-menu41checks, request intake/manifest suites and16synthetic billing tests pass. Billing tests include actual webhook and customer-reader modules with mocked providers; no live private records or payment action were involved.

The Colattao Contact path now prepares human review instead of claiming that a database-only edit changes its separate guest site. Tenant auth, account/reset gates, guest sources, database schema and configuration remain unchanged. Existing invoice management no longer depends on a recurring-price or webhook-secret setting; new enrollment still requires both plus exact approved future terms. The webhook uses the existing event table's received_at as a five-minute lease and retries unfinished work; authoritative billing state is read from current Stripe objects. Legacy admin fallback shows billing unavailable instead of a stale raw status.

Print kit: four-page owner manual and one-page Colattao sign-in handout. Root and print agent inspected all five final renders. Four native full-sheet/crop150/300DPI checks decode only https://finacalleos.com/owner/colattao; eight manual-page checks detect no unintended barcode. Six offline print-contract tests pass. zxing-cpp3.1.1 is an isolated QA dependency, not an application/global dependency. Initial OpenCV/legacy-logo failures are recorded, not relabeled passed. Original branding contained a legacy QR; display clipping retains the original upper wordmark without changing the source asset.

- Manual SHA256: b834d5d316b86d68c05e0cb5c85883deb401fa4acf8f681e7745552d7ef970e5.
- Handout SHA256: a7d23be79b83309f446050417eb0491946d29caac8fdf9e59627c434eae95642.
- Reusable protocol/registry/builder: OWNER_PORTAL_PRINT_PROTOCOL.md, PRINT_ASSETS/owner-portal/registry.json and tools/reports/build-owner-portal-kit.py.

Local cold Next compilation took about7.4minutes before the first synthetic login response; visual QA and final production-only local build are pending. Temporary qa-local is excluded from commits. No release yet. Physical100%proof/two-phone scans, authorized owner acceptance, actual billing readiness and customer delivery remain separate unperformed gates. A best-effort app PDF-panel request did not return confirmation and was stopped; do not claim the panel was shown.
