import type Stripe from "stripe";
import { BillingSetupPendingError, subscriptionStillExists, trustedStripeUrl } from "./policy";

/** All inputs originate from reauthorized server-side restaurant/Stripe records. */
export async function recurringCheckoutDestination(
  stripe: Stripe,
  options: { customerId: string; restaurantId: string; priceId: string; trialEnd: number; appUrl: string },
): Promise<string> {
  const { customerId, restaurantId, priceId, trialEnd, appUrl } = options;
  const ownerPath = `/owner/${encodeURIComponent(restaurantId)}`;
  const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 });
  if (subscriptions.has_more) throw new BillingSetupPendingError();
  if (subscriptions.data.some((subscription) => subscriptionStillExists(subscription.status))) {
    const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: appUrl + ownerPath });
    return trustedStripeUrl(portal.url, "portal");
  }

  const enrollmentKey = `amma-owner-enroll-${customerId}-${priceId}-${trialEnd}`;
  const open = await stripe.checkout.sessions.list({ customer: customerId, status: "open", limit: 100 });
  if (open.has_more) throw new BillingSetupPendingError();
  const subscriptionSessions = open.data.filter((session) => session.mode === "subscription");
  if (subscriptionSessions.length) {
    if (subscriptionSessions.length !== 1 ||
        subscriptionSessions[0].metadata?.enrollment_key !== enrollmentKey ||
        subscriptionSessions[0].client_reference_id !== restaurantId) throw new BillingSetupPendingError();
    return trustedStripeUrl(subscriptionSessions[0].url, "checkout");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: restaurantId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { restaurant_id: restaurantId, enrollment_key: enrollmentKey },
    subscription_data: {
      metadata: { restaurant_id: restaurantId },
      trial_end: trialEnd,
      trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
    },
    success_url: appUrl + ownerPath + "?billing=success",
    cancel_url: appUrl + ownerPath + "?billing=canceled",
  }, { idempotencyKey: enrollmentKey });
  // A repeated request may receive a completed/expired idempotent response.
  // It must never create a replacement subscription or claim a successful payment.
  if (session.status !== "open") throw new BillingSetupPendingError();
  return trustedStripeUrl(session.url, "checkout");
}
