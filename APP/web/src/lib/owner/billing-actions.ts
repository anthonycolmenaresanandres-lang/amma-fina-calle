"use server";

import Stripe from "stripe";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOwnerContext } from "@/lib/owner/auth";
import {
  getOwnerBillingProfile,
  getOwnerBillingSnapshot,
  getStripeClient,
  type OwnerBillingProfile,
} from "@/lib/owner/billing";

async function ownerOrigin(): Promise<string> {
  const headerList = await headers();
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  const host = headerList.get("host");
  return process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`;
}

async function requireBillingAccess(restaurantId: string): Promise<{
  profile: OwnerBillingProfile;
  stripe: Stripe;
}> {
  const ctx = await getOwnerContext(restaurantId);
  if (ctx.state !== "authorized") {
    throw new Error("Not authorized for this restaurant.");
  }

  const stripe = getStripeClient();
  const profile = getOwnerBillingProfile(restaurantId, ctx.email);
  if (!stripe || !profile.secretConfigured) {
    throw new Error("Stripe is not configured yet.");
  }

  return { profile, stripe };
}

export async function openOwnerBillingPortal(restaurantId: string): Promise<void> {
  const { profile, stripe } = await requireBillingAccess(restaurantId);
  if (!profile.customerId) {
    redirect(`/owner/${restaurantId}?billing=missing-customer`);
  }

  const origin = await ownerOrigin();
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.customerId,
    return_url: `${origin}/owner/${restaurantId}`,
  });

  if (!session.url) redirect(`/owner/${restaurantId}?billing=portal-unavailable`);
  redirect(session.url);
}

export async function startOwnerSubscriptionCheckout(restaurantId: string): Promise<void> {
  const { profile, stripe } = await requireBillingAccess(restaurantId);
  if (!profile.priceId) {
    redirect(`/owner/${restaurantId}?billing=missing-price`);
  }

  const origin = await ownerOrigin();
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    client_reference_id: restaurantId,
    line_items: [{ price: profile.priceId, quantity: 1 }],
    success_url: `${origin}/owner/${restaurantId}?billing=success`,
    cancel_url: `${origin}/owner/${restaurantId}?billing=cancelled`,
    metadata: { restaurantId },
    subscription_data: { metadata: { restaurantId } },
  };

  if (profile.customerId) {
    sessionParams.customer = profile.customerId;
  } else if (profile.billingEmail) {
    sessionParams.customer_email = profile.billingEmail;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  if (!session.url) redirect(`/owner/${restaurantId}?billing=checkout-unavailable`);
  redirect(session.url);
}

export async function payOwnerBalance(restaurantId: string): Promise<void> {
  const { profile } = await requireBillingAccess(restaurantId);
  const snapshot = await getOwnerBillingSnapshot({
    restaurantId,
    ownerEmail: profile.billingEmail,
  });

  if (snapshot.latestInvoiceUrl) {
    redirect(snapshot.latestInvoiceUrl);
  }

  if (profile.customerId) {
    await openOwnerBillingPortal(restaurantId);
  }

  redirect(`/owner/${restaurantId}?billing=no-open-invoice`);
}
