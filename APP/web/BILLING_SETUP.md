# Owner billing activation

The prepared owner portal supports two deliberately separate payment rails:

- Stripe is the authoritative recurring-billing rail. Card and bank details stay inside Stripe.
- Zelle is a manual Bank of America rail. An owner can report a payment, but the report stays `reported` until the AMMA billing manager matches the deposit and marks it `verified` or `rejected`.

The application never connects to Mercury or Bank of America credentials and never treats an owner report as proof of payment.

## Current Colattao billing policy - 2026-07-17

- Price: USD 149 per store, billed monthly.
- Current footprint: one store, with a second store expected later.
- Verified billing customer: `colattao coffee house`; Yurika Torres;
  `colattao@hotmail.com`; 757-761-9757; 1115 Independence Boulevard,
  Virginia Beach, VA 23455.
- First charge is confirmed for 2026-07-20 and is displayed separately in the owner portal; the Stripe customer and subscription remain pending approved activation.
- Checkout will not charge before that date. It uses Stripe's fixed trial end while the date is at least 48 hours away; inside Stripe's required 48-hour window, enrollment fails closed for AMMA to complete manually.
- The prepared Checkout must be started before 2026-07-18 08:00 America/New_York to preserve the July 20 trial end. If that window is missed, stop and use an approved manual Stripe setup or approve a new first-charge date; never charge immediately as a fallback.
- Cancellation takes effect at the end of the current paid billing period.
- Live Stripe product: `prod_UtyehInjHwhIV8`.
- Live recurring price: `price_1TuAgoKCddGPSxQC2oVxknqc`.
- Test Stripe product: `prod_UtyVNsyc9d3D8L`.
- Test recurring price: `price_1TuAYUKCddGPSxQCUFoEAARC`.
- Live cards, Apple Pay, Link, Cash App Pay, and Google Pay are enabled; `finacalleos.com` is registered and verified as a payment-method domain.
- Test ACH Direct Debit is enabled and supports recurring payments. Do not enable live ACH until the signed webhook is deployed and verified because settlement is asynchronous.
- The live Customer Portal already allows payment-method updates, invoice history, and end-of-period cancellation.
- Anthony selected Mercury as the Stripe USD payout bank.

## Architecture

1. Restaurant owner signs into /owner/[id].
2. Start recurring billing creates a Stripe Checkout subscription session.
3. Manage billing opens Stripe Customer Portal for payment-method and invoice
   management.
4. Stripe sends signed events to /api/stripe/webhook.
5. The webhook updates the private restaurant_billing table and the safe status
   shown in the owner portal.
6. Stripe payouts settle to Mercury after Anthony configures that relationship directly in Stripe.
7. A restaurant owner may instead send Zelle to the server-configured Bank of America recipient, then report the amount in the portal.
8. `/customers/payments` shows the private AMMA reconciliation queue. Only a billing manager can verify or reject a report.

## Human-only activation order

Do not paste credentials into source files, chat, tickets, or this document.

1. Confirm the applied Supabase migration state. Migration 0009 must be
   accounted for before assigning or applying 0010.
2. Review migrations `0010_owner_billing_subscriptions.sql`, `0011_client_ledger_and_team_access.sql`, and `0012_zelle_payment_notices.sql`.
3. Confirm migrations 0010 through 0013 are already present, review
   `0014_colattao_billing_identity_and_managers.sql`, then apply 0014 manually.
4. Use the prepared Colattao test price above for the test-mode matrix. Use the
   prepared live price only after the remaining production gates pass.
5. Keep Stripe Customer Portal configured for payment-method updates, invoice
   history, and cancellation at the end of the paid billing period.
6. Keep cards and compatible wallets enabled. Enable live US ACH Direct Debit
   only after the signed webhook is deployed and verified because ACH settlement
   and returns are asynchronous.
7. Add the following server values directly in Vercel:
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - STRIPE_RECURRING_PRICE_ID
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_APP_URL
8. Set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS application origin. Production billing rejects HTTP callback origins.
9. Create the Stripe webhook endpoint:
   https://<production-domain>/api/stripe/webhook
10. Subscribe only to:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.paid
   - invoice.payment_failed
   - invoice.payment_action_required
11. Run the complete test-mode matrix before any live-mode switch.

## Zelle activation

Mercury is not Zelle-compatible. Use only an eligible Bank of America business account that Anthony has enrolled directly with Bank of America.

Verified display values:

- Recipient name: `Amma ventures llc`
- Enrolled email: `ammaventuresvb@gmail.com`
- Authorized billing managers: Anthony and Marbel

The database permission lets both managers verify or reject Zelle reports inside
Fina Calle OS. Stripe Dashboard access is separate: Anthony must invite Marbel
as an individual Stripe team member with the minimum billing role required;
never share Anthony's Stripe login.

1. In Bank of America, confirm the exact enrolled business recipient name and enrolled email or mobile number.
2. Optionally create the official Bank of America Zelle QR code. Store the image at an AMMA-controlled HTTPS URL; do not generate a QR code from unverified text.
3. Add these server values directly in Vercel:
   - ZELLE_RECIPIENT_NAME
   - ZELLE_RECIPIENT_HANDLE
   - ZELLE_QR_IMAGE_URL (optional HTTPS image)
4. Test with a small management-approved amount. Confirm the recipient name in the bank application before sending.
5. In `/customers/payments`, match amount, timing, sender, recipient, and bank confirmation. Verify only after the deposit is visible in Bank of America. Reject mismatches and contact the owner outside the payment form.
6. Record the verified payment in the accounting system. A verified Zelle notice does not alter Stripe subscription state or fabricate a Stripe invoice.

## Bank setup

- Set Mercury as Stripe's default USD payout account.
- Keep Bank of America as the Zelle receiving and reserve/business-continuity account if Anthony approves that operating policy.
- Do not add Mercury or Bank of America credentials to the application.
- Use a management-approved weekly or monthly transfer from Mercury to Bank of
  America after Stripe settlement.
- Anthony and accounting choose the reserve amount or percentage. No percentage
  is assumed by the code.

## Test-mode acceptance

- Unauthorized visitors cannot create Checkout or Portal sessions.
- An owner can act only for the restaurant in the current URL.
- The recurring price is read only from the server environment.
- Checkout returns to the same owner portal.
- Customer Portal uses the server-side Stripe customer mapping.
- An invalid webhook signature returns HTTP 400.
- A repeated Stripe event is acknowledged without applying it twice.
- Card success changes the portal to Paid and active.
- Failed payment changes the portal to Payment due.
- ACH can show Processing before final success or failure.
- No Stripe customer, subscription, card, or bank identifiers render in the UI.
- A Zelle report remains `reported` until a billing manager reviews the actual bank deposit.
- A non-billing employee can view the payment inbox but cannot verify or reject reports.
- Zelle verification never changes Stripe subscription or invoice state.
- Zelle recipient instructions render only inside an authorized restaurant-owner session.
- More than five reports from one owner/account inside ten minutes are rejected by the database.

## Approval boundary

Code preparation and local testing may be completed on the feature branch.
Applying the migration, entering credentials, configuring bank access, enabling
live Stripe mode, deploying, pushing, or merging requires Anthony's explicit
approval at that step.

As of 2026-07-17, the linked Vercel project returns no project environment
variables for production, preview, or development. Do not redeploy until every
required Supabase, application URL, Stripe, and Zelle variable in `.env.example`
has been restored directly in Vercel and verified by name without exposing its
value.
