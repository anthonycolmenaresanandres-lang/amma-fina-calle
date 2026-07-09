import Stripe from "stripe";
import { getRestaurantIdForStripeCustomer, getStripeClient } from "@/lib/owner/billing";
import { createServiceSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BillingWebhookUpdate = {
  restaurantId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  latestInvoiceId: string | null;
  objectId: string | null;
  eventType: string;
  billingStatus: string | null;
  amountDueCents: number | null;
  currency: string | null;
};

function clean(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function stripeId(value: unknown): string | null {
  if (typeof value === "string") return clean(value);
  const record = asRecord(value);
  return record ? clean(record.id) : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function metadataValue(value: unknown, key: string): string | null {
  const record = asRecord(value);
  const metadata = asRecord(record?.metadata);
  return clean(metadata?.[key]);
}

function restaurantIdFromObject(value: unknown, customerId: string | null): string | null {
  const record = asRecord(value);
  return (
    metadataValue(value, "restaurantId") ??
    metadataValue(value, "restaurant_id") ??
    clean(record?.client_reference_id) ??
    getRestaurantIdForStripeCustomer(customerId)
  );
}

function invoiceRestaurantId(invoice: unknown, customerId: string | null): string | null {
  const record = asRecord(invoice);
  const parent = asRecord(record?.parent);
  const subscriptionDetails = asRecord(parent?.subscription_details);
  const metadata = asRecord(subscriptionDetails?.metadata);

  return (
    metadataValue(invoice, "restaurantId") ??
    metadataValue(invoice, "restaurant_id") ??
    clean(metadata?.restaurantId) ??
    clean(metadata?.restaurant_id) ??
    getRestaurantIdForStripeCustomer(customerId)
  );
}

function invoiceStatus(eventType: string, invoice: Stripe.Invoice): string | null {
  if (eventType === "invoice.payment_failed") return "past_due";
  if (eventType === "invoice.paid" || eventType === "invoice.payment_succeeded") return "current";
  if (invoice.status === "paid") return "current";
  if (invoice.status === "open") return "open";
  if (invoice.status === "void" || invoice.status === "uncollectible") return invoice.status;
  return null;
}

function billingUpdateForEvent(event: Stripe.Event): BillingWebhookUpdate | null {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const record = asRecord(session);
    const customerId = stripeId(record?.customer);

    return {
      restaurantId: restaurantIdFromObject(session, customerId),
      customerId,
      subscriptionId: stripeId(record?.subscription),
      latestInvoiceId: stripeId(record?.invoice),
      objectId: session.id,
      eventType: event.type,
      billingStatus: "current",
      amountDueCents: 0,
      currency: clean(record?.currency) ?? "usd",
    };
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const record = asRecord(subscription);
    const customerId = stripeId(record?.customer);

    return {
      restaurantId: restaurantIdFromObject(subscription, customerId),
      customerId,
      subscriptionId: subscription.id,
      latestInvoiceId: stripeId(record?.latest_invoice),
      objectId: subscription.id,
      eventType: event.type,
      billingStatus: subscription.status,
      amountDueCents: null,
      currency: clean(record?.currency) ?? "usd",
    };
  }

  if (
    event.type === "invoice.finalized" ||
    event.type === "invoice.updated" ||
    event.type === "invoice.paid" ||
    event.type === "invoice.payment_succeeded" ||
    event.type === "invoice.payment_failed"
  ) {
    const invoice = event.data.object as Stripe.Invoice;
    const record = asRecord(invoice);
    const customerId = stripeId(record?.customer);

    return {
      restaurantId: invoiceRestaurantId(invoice, customerId),
      customerId,
      subscriptionId: stripeId(record?.subscription),
      latestInvoiceId: invoice.id,
      objectId: invoice.id,
      eventType: event.type,
      billingStatus: invoiceStatus(event.type, invoice),
      amountDueCents: numberValue(record?.amount_remaining),
      currency: clean(record?.currency) ?? "usd",
    };
  }

  return null;
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = clean(process.env.STRIPE_WEBHOOK_SECRET);
  const supabase = createServiceSupabase();

  if (!stripe || !webhookSecret || !supabase) {
    return Response.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const update = billingUpdateForEvent(event);
  if (!update) {
    return Response.json({ received: true, ignored: true });
  }

  const { data, error } = await supabase.rpc("record_stripe_billing_event", {
    p_stripe_event_id: event.id,
    p_restaurant_id: update.restaurantId,
    p_stripe_customer_id: update.customerId,
    p_stripe_subscription_id: update.subscriptionId,
    p_stripe_latest_invoice_id: update.latestInvoiceId,
    p_stripe_object_id: update.objectId,
    p_event_type: update.eventType,
    p_billing_status: update.billingStatus,
    p_amount_due_cents: update.amountDueCents,
    p_currency: update.currency,
    p_event_created_at: new Date(event.created * 1000).toISOString(),
  });

  if (error) {
    return Response.json({ error: "Billing event could not be recorded." }, { status: 500 });
  }

  return Response.json({ received: true, result: data });
}
