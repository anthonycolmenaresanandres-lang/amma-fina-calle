import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/server";

export const runtime = "nodejs";

function objectId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function isoFromUnix(value: number | null | undefined): string | null {
  return value ? new Date(value * 1000).toISOString() : null;
}

async function restaurantIdForCustomer(
  admin: SupabaseClient,
  customerId: string | null,
): Promise<string | null> {
  if (!customerId) return null;
  const { data, error } = await admin
    .from("restaurant_billing")
    .select("restaurant_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (error) throw error;
  return (data?.restaurant_id as string | undefined) ?? null;
}

async function setRegistryStatus(
  admin: SupabaseClient,
  restaurantId: string,
  status: string,
): Promise<void> {
  const { error } = await admin
    .from("restaurants")
    .update({ billing_status: status })
    .eq("id", restaurantId);
  if (error) throw error;
}

async function syncCheckout(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const customerId = objectId(session.customer);
  const subscriptionId = objectId(session.subscription);
  const restaurantId =
    session.metadata?.restaurant_id ||
    session.client_reference_id ||
    (await restaurantIdForCustomer(admin, customerId));
  if (!restaurantId || !customerId) throw new Error("Checkout mapping unavailable.");

  const status = session.payment_status === "paid" ? "active" : "processing";
  const { error } = await admin.from("restaurant_billing").upsert(
    {
      restaurant_id: restaurantId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: status,
      recurring_enabled: true,
      latest_invoice_status: session.payment_status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "restaurant_id" },
  );
  if (error) throw error;
  await setRegistryStatus(admin, restaurantId, status);
}

async function syncSubscription(
  admin: SupabaseClient,
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = objectId(subscription.customer);
  const restaurantId =
    subscription.metadata.restaurant_id ||
    (await restaurantIdForCustomer(admin, customerId));
  if (!restaurantId || !customerId) throw new Error("Subscription mapping unavailable.");

  const periodEnd = subscription.items.data.reduce<number | null>(
    (latest, item) =>
      latest === null || item.current_period_end > latest
        ? item.current_period_end
        : latest,
    null,
  );
  const recurringEnabled = !["canceled", "incomplete_expired", "unpaid"].includes(
    subscription.status,
  );
  const { error } = await admin.from("restaurant_billing").upsert(
    {
      restaurant_id: restaurantId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      recurring_enabled: recurringEnabled,
      current_period_end: isoFromUnix(periodEnd),
      next_payment_at: recurringEnabled ? isoFromUnix(periodEnd) : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "restaurant_id" },
  );
  if (error) throw error;
  await setRegistryStatus(admin, restaurantId, subscription.status);
}

async function syncInvoice(
  admin: SupabaseClient,
  invoice: Stripe.Invoice,
  eventType: string,
): Promise<void> {
  const customerId = objectId(invoice.customer);
  const subscriptionDetails = invoice.parent?.subscription_details;
  const subscriptionId = objectId(subscriptionDetails?.subscription);
  const restaurantId =
    subscriptionDetails?.metadata?.restaurant_id ||
    (await restaurantIdForCustomer(admin, customerId));
  if (!restaurantId || !customerId) throw new Error("Invoice mapping unavailable.");

  const paid = eventType === "invoice.paid";
  const failed =
    eventType === "invoice.payment_failed" ||
    eventType === "invoice.payment_action_required";
  const status = paid ? "active" : failed ? "past_due" : "processing";

  const { error } = await admin.from("restaurant_billing").upsert(
    {
      restaurant_id: restaurantId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: status,
      recurring_enabled: true,
      latest_invoice_status: invoice.status || (paid ? "paid" : "open"),
      last_payment_at: paid ? new Date().toISOString() : undefined,
      next_payment_at: isoFromUnix(invoice.next_payment_attempt || invoice.period_end),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "restaurant_id" },
  );
  if (error) throw error;
  await setRegistryStatus(admin, restaurantId, status);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret(),
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let admin: SupabaseClient;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: "Billing unavailable." }, { status: 503 });
  }

  const { error: claimError } = await admin.from("stripe_webhook_events").insert({
    id: event.id,
    event_type: event.type,
  });
  if (claimError?.code === "23505") {
    return NextResponse.json({ received: true, duplicate: true });
  }
  if (claimError) {
    return NextResponse.json({ error: "Event claim failed." }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await syncCheckout(admin, event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(admin, event.data.object);
        break;
      case "invoice.paid":
      case "invoice.payment_failed":
      case "invoice.payment_action_required":
        await syncInvoice(admin, event.data.object, event.type);
        break;
      default:
        break;
    }

    const { error: processedError } = await admin
      .from("stripe_webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("id", event.id);
    if (processedError) throw processedError;
  } catch {
    await admin.from("stripe_webhook_events").delete().eq("id", event.id);
    return NextResponse.json({ error: "Event processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
