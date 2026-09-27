# Bodega Basic billing activation

## Approved offer

- Client: Bodega Cafe; tenant ID `bodega`; approved owner email `bodegacafe757@gmail.com` (Anthony's 2026-09-27 attestation).
- Fina Calle Basic: USD $199 each month. The current implementation has no setup fee.
- The 30-day free trial began 2026-09-26. First planned automatic charge: 2026-10-26 (Stripe trial end at 12:00 UTC / 08:00 Virginia Beach time). Subsequent charges follow Stripe's monthly billing cycle.
- Owner may cancel future renewals anytime before the next charge. Configure the Stripe customer portal to permit cancellation; verify this in test mode before enrollment.
- Terms version `bodega-basic-2026-09-27` lives in `APP/web/src/lib/billing/bodega-terms.ts`. Changing price, date, setup fee, or cancellation rule requires a new terms version and explicit client review.

## What the system records

The owner opens `/owner/bodega/billing`, receives a one-time email link, reads the exact plan, checks the authorization box, and continues to Stripe-hosted subscription Checkout. Only an allowlisted Bodega owner can invoke the server action. The server checks the database's approved $199/month and date against a tenant-specific active Stripe Price. It rejects stale dates or mismatches. Checkout collects the billing address and payment method. A completed Checkout is reconciled from verified Stripe webhooks; `billing_authorizations` records the signed-in email, terms version and snapshot, Stripe session/subscription IDs, and timestamps. The return URL alone is never evidence of enrollment or payment. No card number or secret enters the database or repository.

## Production prerequisites and sequence

1. Confirm this offer with Anthony. If a setup fee is agreed later, update the versioned terms, billing UI, and Stripe Checkout before activation. Do not add an undisclosed fee.
2. Apply migration `0023_bodega_basic_billing.sql` after migrations through `0022`. Read back the `bodega` row, owner email, `restaurant_billing` amount 19900 USD, interval month, first-charge date 2026-10-26, and private authorization-table RLS. The seed uses conflict-safe inserts; if a row already exists with different values, stop and reconcile it instead of overriding a live subscription.
3. In Fina Calle's Stripe account, create or select one active USD $199 monthly licensed recurring Price for Bodega Basic. Set `STRIPE_RECURRING_PRICE_ID_BODEGA` in the appropriate Vercel environment. Confirm `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `/api/stripe/webhook` delivery. Keep secret values only in provider settings, never here. The Bodega price cannot fall back to another client's Price.
4. Enable Stripe-hosted billing portal access to invoices, payment-method updates, and cancellation before the next renewal. Review Stripe's failed-payment retry and customer notification settings. This does not create a Bodega subscription.
5. Verify passwordless link delivery and both allowed redirect URLs. Test checkout in a non-production Stripe mode with the same price/interval, trial date, duplicate-click behavior, completed authorization record, renewal status, failed payment, and cancellation. Confirm the live page is private, mobile-friendly, and the public owner desk links to it.
6. Give the exact private URL to the approved owner. The owner enters payment details and confirms their own subscription in Stripe. Check the verified webhook record and Stripe status before marking enrollment complete. Never submit Checkout or payment details on the owner's behalf.

## Exceptions

- No tenant, owner allowlist, approved billing row, matching Price, or webhook: enrollment stays disabled. Fix configuration and read it back before inviting the owner.
- Existing subscription: open Stripe billing management. Do not create another subscription, even if an old trial date has passed.
- Stripe decline or action required: owner uses the billing portal to update the method or pay the invoice. Stripe retry settings can attempt collection; staff monitor unresolved cases.
- Trial date within 48 hours or past: current enrollment code blocks Checkout to avoid an accidental immediate charge. Reconfirm the date and versioned terms before changing it.
- Square catalog sync and the muffin reward are independent of billing activation. Do not switch on the reward or publish menu data through this procedure.
