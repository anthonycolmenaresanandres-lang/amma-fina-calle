# Owner billing activation

The code path is prepared for Stripe-hosted recurring billing. It stores only
Stripe identifiers and safe status fields. Card and bank-account details remain
inside Stripe.

## Architecture

1. Restaurant owner signs into /owner/[id].
2. Start recurring billing creates a Stripe Checkout subscription session.
3. Manage billing opens Stripe Customer Portal for payment-method and invoice
   management.
4. Stripe sends signed events to /api/stripe/webhook.
5. The webhook updates the private restaurant_billing table and the safe status
   shown in the owner portal.
6. Stripe payouts settle to Mercury. Bank of America stays outside the app as
   the reserve/continuity account.

## Human-only activation order

Do not paste credentials into source files, chat, tickets, or this document.

1. Confirm the applied Supabase migration state. Migration 0009 must be
   accounted for before assigning or applying 0010.
2. Review supabase/migrations/0010_owner_billing_subscriptions.sql.
3. Apply migration 0010_owner_billing_subscriptions.sql manually in Supabase.
4. In Stripe test mode, create the AMMA recurring product and recurring price.
   Anthony must choose the amount, frequency, trial policy, and cancellation
   policy; the application does not assume them.
5. Configure Stripe Customer Portal to allow payment-method updates and invoice
   history. Enable subscription cancellation only if it matches Anthony's
   chosen policy.
6. Enable the desired Stripe payment methods. Cards are the baseline. Enable US
   ACH Direct Debit only if AMMA accepts its asynchronous settlement and return
   behavior.
7. Add the following server values directly in Vercel:
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - STRIPE_RECURRING_PRICE_ID
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_APP_URL
8. Create the Stripe webhook endpoint:
   https://<production-domain>/api/stripe/webhook
9. Subscribe only to:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.paid
   - invoice.payment_failed
   - invoice.payment_action_required
10. Run the complete test-mode matrix before any live-mode switch.

## Bank setup

- Set Mercury as Stripe's default USD payout account.
- Keep Bank of America as a reserve and business-continuity account.
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

## Approval boundary

Code preparation and local testing may be completed on the feature branch.
Applying the migration, entering credentials, configuring bank access, enabling
live Stripe mode, deploying, pushing, or merging requires Anthony's explicit
approval at that step.
