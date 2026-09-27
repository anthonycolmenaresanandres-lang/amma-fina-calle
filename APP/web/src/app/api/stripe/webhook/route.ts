import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/server";
import { webhookClaimState } from "@/lib/billing/policy";
import { billingEventCustomer, retrieveCurrentBilling } from "@/lib/billing/reconciliation";
import { BODEGA_BASIC_TERMS } from "@/lib/billing/bodega-terms";

export const runtime = "nodejs";
export const maxDuration = 60;

async function reconcileCustomer(admin: SupabaseClient, customerId: string): Promise<void> {
  // The authoritative customer mapping was saved before Checkout creation.
  // Stripe metadata cannot select or overwrite another restaurant's account.
  const { data: account, error } = await admin.from("restaurant_billing")
    .select("restaurant_id, updated_at, last_payment_at").eq("stripe_customer_id", customerId).maybeSingle();
  if (error) throw error;
  if (!account) return; // Other Stripe business activity is outside this module.

  const snapshot = await retrieveCurrentBilling(getStripe(), customerId);
  if (snapshot.last_payment_at && account.last_payment_at &&
      Date.parse(account.last_payment_at) > Date.parse(snapshot.last_payment_at)) {
    snapshot.last_payment_at = account.last_payment_at;
  }
  const stamp = new Date().toISOString();
  const { data: updated, error: updateError } = await admin.from("restaurant_billing")
    .update({ ...snapshot, updated_at: stamp })
    .eq("restaurant_id", account.restaurant_id)
    .eq("stripe_customer_id", customerId)
    .eq("updated_at", account.updated_at)
    .select("restaurant_id").maybeSingle();
  if (updateError) throw updateError;
  // Another event/manager changed the account during the provider read. Retry
  // from Stripe instead of overwriting newer state with this earlier snapshot.
  if (!updated) throw new Error("Billing state changed; retry reconciliation.");
  // Owner and ledger RPCs read restaurant_billing first. Do not dual-write the
  // legacy restaurants.billing_status column outside a database transaction.
}

async function recordBodegaAuthorization(admin: SupabaseClient, event: Stripe.Event): Promise<void> {
  if (event.type !== "checkout.session.completed") return;
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.metadata?.terms_version !== BODEGA_BASIC_TERMS.version) return;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  const acceptedBy = session.metadata.accepted_by?.trim().toLowerCase();
  if (session.client_reference_id !== "bodega" || session.metadata.restaurant_id !== "bodega" ||
      !customerId || !subscriptionId || !acceptedBy || session.status !== "complete") {
    throw new Error("Bodega authorization data is incomplete.");
  }
  const { data: account, error: accountError } = await admin.from("restaurant_billing")
    .select("restaurant_id").eq("stripe_customer_id", customerId).eq("restaurant_id", "bodega").maybeSingle();
  if (accountError || !account) throw new Error("Bodega billing customer mismatch.");
  const { error } = await admin.from("billing_authorizations").insert({
    checkout_session_id: session.id,
    restaurant_id: "bodega",
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    accepted_by_email: acceptedBy,
    terms_version: BODEGA_BASIC_TERMS.version,
    terms_snapshot: {
      plan: BODEGA_BASIC_TERMS.plan,
      amount_cents: BODEGA_BASIC_TERMS.amountCents,
      currency: BODEGA_BASIC_TERMS.currency,
      trial_started_on: BODEGA_BASIC_TERMS.trialStartedOn,
      first_charge_on: BODEGA_BASIC_TERMS.firstChargeOn,
      billing_interval: BODEGA_BASIC_TERMS.interval,
      setup_fee_cents: BODEGA_BASIC_TERMS.setupFeeCents,
      cancellation: BODEGA_BASIC_TERMS.cancellation,
    },
    accepted_at: new Date(session.created * 1000).toISOString(),
    checkout_completed_at: new Date(event.created * 1000).toISOString(),
  });
  if (error && error.code !== "23505") throw error;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, getStripeWebhookSecret());
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let admin: SupabaseClient;
  try { admin = getSupabaseAdmin(); }
  catch { return NextResponse.json({ error: "Billing unavailable." }, { status: 503 }); }

  // received_at doubles as a processing lease in the existing schema. A lease
  // lasts five minutes, longer than this route's one-minute execution limit.
  const lease = new Date().toISOString();
  const { error: claimError } = await admin.from("stripe_webhook_events")
    .insert({ id: event.id, event_type: event.type, received_at: lease });
  if (claimError?.code === "23505") {
    const { data: previous, error: readError } = await admin.from("stripe_webhook_events")
      .select("processed_at, received_at").eq("id", event.id).maybeSingle();
    if (readError || !previous) return NextResponse.json({ error: "Event state unavailable." }, { status: 500 });
    const state = webhookClaimState(previous);
    if (state === "processed") return NextResponse.json({ received: true, duplicate: true });
    if (state === "busy") return NextResponse.json({ error: "Event is processing; retry." }, { status: 503 });
    const { data: reclaimed, error: reclaimError } = await admin.from("stripe_webhook_events")
      .update({ received_at: lease }).eq("id", event.id)
      .eq("received_at", previous.received_at).is("processed_at", null).select("id").maybeSingle();
    if (reclaimError || !reclaimed) return NextResponse.json({ error: "Event retry unavailable." }, { status: 503 });
  } else if (claimError) {
    return NextResponse.json({ error: "Event claim failed." }, { status: 500 });
  }

  try {
    const customerId = billingEventCustomer(event);
    if (customerId) await reconcileCustomer(admin, customerId);
    await recordBodegaAuthorization(admin, event);
    const { data: processed, error: processedError } = await admin.from("stripe_webhook_events")
      .update({ processed_at: new Date().toISOString() }).eq("id", event.id)
      .eq("received_at", lease).is("processed_at", null).select("id").maybeSingle();
    if (processedError || !processed) throw new Error("Event confirmation unavailable.");
  } catch {
    // Retain unprocessed events so a crash or failure is retryable. A retry
    // re-reads current Stripe state; it never initiates a charge or subscription.
    return NextResponse.json({ error: "Event processing failed; retry." }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
