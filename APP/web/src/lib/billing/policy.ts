import type Stripe from "stripe";

export type ApprovedBillingTerms = {
  amount_cents: number | null;
  currency: string | null;
  billing_interval: string | null;
  billing_interval_count: number | null;
  scheduled_first_charge_on: string | null;
};

export class BillingSetupPendingError extends Error {
  constructor() { super("Billing terms or scheduled start need confirmation."); }
}

/** Existing private billing rows are service-written, never owner form input. */
export function approvedTrialEnd(terms: ApprovedBillingTerms | null, now = Date.now()): number {
  const date = terms?.scheduled_first_charge_on;
  const stamp = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? Date.parse(`${date}T12:00:00Z`) : NaN;
  if (!terms || !Number.isSafeInteger(terms.amount_cents) || terms.amount_cents! < 0 ||
      !/^[a-z]{3}$/i.test(terms.currency ?? "") ||
      !["day", "week", "month", "year"].includes(terms.billing_interval ?? "") ||
      !Number.isSafeInteger(terms.billing_interval_count) || terms.billing_interval_count! < 1 ||
      !Number.isFinite(stamp) || new Date(stamp).toISOString().slice(0, 10) !== date ||
      stamp - now < 48 * 60 * 60 * 1000) {
    throw new BillingSetupPendingError();
  }
  return Math.floor(stamp / 1000);
}

export function priceMatchesApprovedTerms(price: Stripe.Price, terms: ApprovedBillingTerms): boolean {
  return price.active && price.type === "recurring" && price.billing_scheme === "per_unit" &&
    price.unit_amount === terms.amount_cents && price.currency === terms.currency?.toLowerCase() &&
    price.recurring?.interval === terms.billing_interval &&
    price.recurring?.interval_count === terms.billing_interval_count &&
    price.recurring?.usage_type === "licensed";
}

/** Unpaid, paused and incomplete subscriptions still exist; resolve them in Stripe. */
export function subscriptionStillExists(status: Stripe.Subscription.Status): boolean {
  return status !== "canceled" && status !== "incomplete_expired";
}

export function trustedStripeUrl(value: string | null | undefined, kind: "checkout" | "portal"): string {
  if (!value) throw new Error("Billing destination unavailable.");
  const url = new URL(value);
  const host = kind === "checkout" ? "checkout.stripe.com" : "billing.stripe.com";
  if (url.protocol !== "https:" || url.hostname !== host || url.port || url.username || url.password) {
    throw new Error("Billing destination unavailable.");
  }
  return url.href;
}

export function stripeObjectId(value: string | { id: string } | null | undefined): string | null {
  return typeof value === "string" ? value : value?.id ?? null;
}

/** Subscription existence, automatic collection, and a paid invoice are distinct. */
export function automaticCollectionEnabled(subscription: Stripe.Subscription): boolean {
  return subscription.collection_method === "charge_automatically" &&
    ["active", "trialing", "past_due"].includes(subscription.status) &&
    !subscription.pause_collection && !subscription.cancel_at_period_end && !subscription.cancel_at;
}

export function webhookClaimState(
  row: { processed_at: string | null; received_at: string }, now = Date.now(),
): "processed" | "busy" | "retry" {
  if (row.processed_at) return "processed";
  const receivedAt = Date.parse(row.received_at);
  return Number.isFinite(receivedAt) && now - receivedAt >= 5 * 60 * 1000 ? "retry" : "busy";
}
