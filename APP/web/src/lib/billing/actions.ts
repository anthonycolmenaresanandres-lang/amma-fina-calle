"use server";

import { redirect } from "next/navigation";
import { getOwnerContext } from "@/lib/owner/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getBillingAppUrl,
  getRecurringPriceId,
  getStripe,
} from "@/lib/stripe/server";

const STRIPE_MINIMUM_TRIAL_SECONDS = 48 * 60 * 60;

type RestaurantBillingProfile = {
  business_name: string;
  billing_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  billing_address_line1: string | null;
  billing_address_city: string | null;
  billing_address_state: string | null;
  billing_address_postal_code: string | null;
  billing_address_country: string | null;
};

function stripeCustomerProfile(
  restaurantId: string,
  restaurant: RestaurantBillingProfile,
) {
  const email = restaurant.contact_email?.trim().toLowerCase() ?? "";
  const address = {
    line1: restaurant.billing_address_line1?.trim() ?? "",
    city: restaurant.billing_address_city?.trim() ?? "",
    state: restaurant.billing_address_state?.trim() ?? "",
    postal_code: restaurant.billing_address_postal_code?.trim() ?? "",
    country: restaurant.billing_address_country?.trim().toUpperCase() ?? "",
  };
  if (
    !(restaurant.billing_name?.trim() || restaurant.business_name.trim()) ||
    !email.includes("@") ||
    Object.values(address).some((value) => !value)
  ) {
    throw new Error("Restaurant billing identity is incomplete.");
  }
  return {
    name: restaurant.billing_name?.trim() || restaurant.business_name.trim(),
    email,
    phone: restaurant.contact_phone?.trim() || undefined,
    address,
    metadata: {
      restaurant_id: restaurantId,
      billing_contact: restaurant.contact_name?.trim() || "Owner",
    },
  };
}

function trialEndForDate(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const epochSeconds = Math.floor(Date.parse(`${value}T12:00:00Z`) / 1000);
  return Number.isFinite(epochSeconds) ? epochSeconds : null;
}

function ownerPath(restaurantId: string, notice?: string): string {
  const base = "/owner/" + encodeURIComponent(restaurantId);
  return notice ? base + "?billing=" + encodeURIComponent(notice) : base;
}

async function requireOwner(restaurantId: string) {
  const context = await getOwnerContext(restaurantId);
  if (context.state !== "authorized") redirect(ownerPath(restaurantId));
  return context;
}

export async function startRecurringBilling(restaurantId: string): Promise<void> {
  await requireOwner(restaurantId);
  let checkoutUrl: string | null = null;

  try {
    const stripe = getStripe();
    const admin = getSupabaseAdmin();
    const appUrl = getBillingAppUrl();
    const priceId = getRecurringPriceId();

    const { data: restaurant, error: restaurantError } = await admin
      .from("restaurants")
      .select(
        "business_name, billing_name, contact_name, contact_email, contact_phone, billing_address_line1, billing_address_city, billing_address_state, billing_address_postal_code, billing_address_country",
      )
      .eq("id", restaurantId)
      .maybeSingle();
    if (restaurantError || !restaurant) throw new Error("Restaurant unavailable.");
    const customerProfile = stripeCustomerProfile(
      restaurantId,
      restaurant as RestaurantBillingProfile,
    );

    const { data: billing, error: billingError } = await admin
      .from("restaurant_billing")
      .select(
        "stripe_customer_id, stripe_subscription_id, subscription_status, scheduled_first_charge_on",
      )
      .eq("restaurant_id", restaurantId)
      .maybeSingle();
    if (billingError) throw billingError;

    let customerId = billing?.stripe_customer_id as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create(
        customerProfile,
        { idempotencyKey: "amma-owner-customer-" + restaurantId },
      );
      customerId = customer.id;

      const { error: upsertError } = await admin.from("restaurant_billing").upsert(
        {
          restaurant_id: restaurantId,
          stripe_customer_id: customerId,
          subscription_status: "not_started",
          recurring_enabled: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "restaurant_id" },
      );
      if (upsertError) throw upsertError;
    } else {
      await stripe.customers.update(customerId, customerProfile);
    }

    const terminalStatuses = new Set(["canceled", "incomplete_expired", "unpaid"]);
    const existingStatus = String(billing?.subscription_status || "not_started");
    if (billing?.stripe_subscription_id && !terminalStatuses.has(existingStatus)) {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: appUrl + ownerPath(restaurantId),
      });
      checkoutUrl = session.url;
    } else {
      const trialEnd = trialEndForDate(billing?.scheduled_first_charge_on);
      const now = Math.floor(Date.now() / 1000);
      if (
        trialEnd !== null &&
        trialEnd > now &&
        trialEnd - now < STRIPE_MINIMUM_TRIAL_SECONDS
      ) {
        throw new Error("Scheduled first charge is inside Stripe's trial window.");
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        client_reference_id: restaurantId,
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { restaurant_id: restaurantId },
        subscription_data: {
          metadata: { restaurant_id: restaurantId },
          ...(trialEnd !== null && trialEnd > now
            ? {
                trial_end: trialEnd,
                trial_settings: {
                  end_behavior: { missing_payment_method: "cancel" as const },
                },
              }
            : {}),
        },
        success_url: appUrl + ownerPath(restaurantId, "success"),
        cancel_url: appUrl + ownerPath(restaurantId, "canceled"),
      });
      checkoutUrl = session.url;
    }
  } catch {
    redirect(ownerPath(restaurantId, "unavailable"));
  }

  if (!checkoutUrl) redirect(ownerPath(restaurantId, "unavailable"));
  redirect(checkoutUrl);
}

export async function openBillingPortal(restaurantId: string): Promise<void> {
  await requireOwner(restaurantId);
  let portalUrl: string | null = null;
  let missingCustomer = false;

  try {
    const stripe = getStripe();
    const admin = getSupabaseAdmin();
    const appUrl = getBillingAppUrl();

    const { data: billing, error } = await admin
      .from("restaurant_billing")
      .select("stripe_customer_id")
      .eq("restaurant_id", restaurantId)
      .maybeSingle();
    if (error) throw error;

    const customerId = billing?.stripe_customer_id as string | undefined;
    if (!customerId) {
      missingCustomer = true;
    } else {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: appUrl + ownerPath(restaurantId),
      });
      portalUrl = session.url;
    }
  } catch {
    redirect(ownerPath(restaurantId, "unavailable"));
  }

  if (missingCustomer) redirect(ownerPath(restaurantId, "not-started"));
  if (!portalUrl) redirect(ownerPath(restaurantId, "unavailable"));
  redirect(portalUrl);
}
