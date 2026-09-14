import type Stripe from "stripe";
import { automaticCollectionEnabled, stripeObjectId, subscriptionStillExists } from "./policy";

function iso(value: number | null | undefined): string | null {
  return value ? new Date(value * 1000).toISOString() : null;
}

/** Derive display state from current provider objects, never an event snapshot. */
export function currentBillingSnapshot(subscriptions: Stripe.Subscription[], invoices: Stripe.Invoice[]) {
  const existing = subscriptions.filter((subscription) => subscriptionStillExists(subscription.status));
  if (existing.length > 1) throw new Error("Multiple subscriptions require billing review.");
  const subscription = existing[0] ?? [...subscriptions].sort((a, b) => b.created - a.created)[0];
  const latestInvoice = [...invoices].filter((invoice) => invoice.status !== "draft")
    .sort((a, b) => b.created - a.created)[0];
  const lastPaidAt = invoices.filter((invoice) => invoice.status === "paid")
    .reduce((latest, invoice) => Math.max(latest, invoice.status_transitions?.paid_at ?? invoice.created), 0);
  const recurringEnabled = subscription ? automaticCollectionEnabled(subscription) : false;
  const periodEnd = subscription?.items.data.reduce((latest, item) => Math.max(latest, item.current_period_end), 0);
  const price = subscription?.items.data[0]?.price;
  const subscriptionInvoice = [...invoices].filter((invoice) => subscription &&
    stripeObjectId(invoice.parent?.subscription_details?.subscription) === subscription.id)
    .sort((a, b) => b.created - a.created)[0];
  return {
    stripe_subscription_id: subscription?.id ?? null,
    subscription_status: subscription?.status ?? "not_started",
    recurring_enabled: recurringEnabled,
    ...(price ? {
      amount_cents: price.unit_amount,
      currency: price.currency,
      billing_interval: price.recurring?.interval ?? null,
      billing_interval_count: price.recurring?.interval_count ?? null,
    } : {}),
    latest_invoice_status: latestInvoice?.status ?? null,
    // Preserve an older known paid date when it lies outside the invoice page.
    ...(lastPaidAt ? { last_payment_at: iso(lastPaidAt) } : {}),
    current_period_end: iso(periodEnd),
    next_payment_at: recurringEnabled
      ? iso(subscription?.status === "past_due" ? subscriptionInvoice?.next_payment_attempt : periodEnd) : null,
  };
}

export async function retrieveCurrentBilling(stripe: Stripe, customerId: string) {
  const [subscriptions, invoices] = await Promise.all([
    stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 }),
    stripe.invoices.list({ customer: customerId, limit: 100 }),
  ]);
  if (subscriptions.has_more) throw new Error("Subscription history requires billing review.");
  if (subscriptions.data.some((subscription) => stripeObjectId(subscription.customer) !== customerId) ||
      invoices.data.some((invoice) => stripeObjectId(invoice.customer) !== customerId)) {
    throw new Error("Billing customer mismatch.");
  }
  return currentBillingSnapshot(subscriptions.data, invoices.data);
}

/** Only supported billing events have a customer; ignore unrelated Stripe events. */
export function billingEventCustomer(event: Stripe.Event): string | null {
  switch (event.type) {
    case "checkout.session.completed":
      return event.data.object.mode === "subscription" ? stripeObjectId(event.data.object.customer) : null;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "invoice.paid":
    case "invoice.payment_failed":
    case "invoice.payment_action_required":
      return stripeObjectId(event.data.object.customer);
    default: return null;
  }
}
