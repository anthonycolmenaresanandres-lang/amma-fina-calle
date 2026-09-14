"use server";

import { redirect } from "next/navigation";
import { getOwnerContext } from "@/lib/owner/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { recurringCheckoutDestination } from "./checkout";
import { approvedTrialEnd, BillingSetupPendingError, priceMatchesApprovedTerms, stripeObjectId, subscriptionStillExists, trustedStripeUrl, type ApprovedBillingTerms } from "./policy";
import {
  getBillingAppUrl,
  getRecurringPriceId,
  getStripe,
  isBillingManagementConfigured,
  isBillingRuntimeConfigured,
} from "@/lib/stripe/server";

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
    if (!isBillingManagementConfigured()) throw new BillingSetupPendingError();
    const stripe = getStripe();
    const admin = getSupabaseAdmin();
    const appUrl = getBillingAppUrl();

    const { data: billing, error: billingError } = await admin
      .from("restaurant_billing")
      .select(
        "stripe_customer_id, stripe_subscription_id, subscription_status, amount_cents, currency, billing_interval, billing_interval_count, scheduled_first_charge_on",
      )
      .eq("restaurant_id", restaurantId)
      .maybeSingle();
    if (billingError) throw billingError;
    if (!billing) throw new BillingSetupPendingError();

    let customerId = billing?.stripe_customer_id as string | undefined;
    // Resolve an existing subscription before requiring new-enrollment terms.
    // An old trial date must never block access to invoices or payment recovery.
    if (customerId) {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted || (customer.metadata.restaurant_id && customer.metadata.restaurant_id !== restaurantId)) {
        throw new BillingSetupPendingError();
      }
      if (billing.stripe_subscription_id) {
        const subscription = await stripe.subscriptions.retrieve(billing.stripe_subscription_id);
        if (stripeObjectId(subscription.customer) !== customerId) throw new BillingSetupPendingError();
        if (subscriptionStillExists(subscription.status)) {
          const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: appUrl + ownerPath(restaurantId) });
          checkoutUrl = trustedStripeUrl(session.url, "portal");
        }
      }
      if (!checkoutUrl) {
        const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 });
        if (subscriptions.has_more) throw new BillingSetupPendingError();
        if (subscriptions.data.some((subscription) => subscriptionStillExists(subscription.status))) {
          const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: appUrl + ownerPath(restaurantId) });
          checkoutUrl = trustedStripeUrl(session.url, "portal");
        }
      }
    }

    if (!checkoutUrl) {
      if (!isBillingRuntimeConfigured(restaurantId)) throw new BillingSetupPendingError();
      const terms = billing as ApprovedBillingTerms;
      const trialEnd = approvedTrialEnd(terms);
      const priceId = getRecurringPriceId(restaurantId);
      const price = await stripe.prices.retrieve(priceId);
      if (!priceMatchesApprovedTerms(price, terms)) throw new BillingSetupPendingError();

      if (!customerId) {
        const { data: restaurant, error: restaurantError } = await admin.from("restaurants")
          .select("business_name, billing_name, contact_name, contact_email, contact_phone, billing_address_line1, billing_address_city, billing_address_state, billing_address_postal_code, billing_address_country")
          .eq("id", restaurantId).maybeSingle();
        if (restaurantError || !restaurant) throw new BillingSetupPendingError();
        const customerProfile = stripeCustomerProfile(restaurantId, restaurant as RestaurantBillingProfile);
        const customer = await stripe.customers.create(
          customerProfile,
          { idempotencyKey: "amma-owner-customer-" + restaurantId },
        );
        customerId = customer.id;

        const { data: mapped, error: upsertError } = await admin.from("restaurant_billing").update({
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        }).eq("restaurant_id", restaurantId).is("stripe_customer_id", null).select("stripe_customer_id").maybeSingle();
        if (upsertError) throw upsertError;
        // Concurrent enrollment can map the same idempotently-created customer.
        if (!mapped) {
          const { data: current, error: mappingError } = await admin.from("restaurant_billing")
            .select("stripe_customer_id").eq("restaurant_id", restaurantId).maybeSingle();
          if (mappingError || current?.stripe_customer_id !== customerId) throw new BillingSetupPendingError();
        }
      }
      checkoutUrl = await recurringCheckoutDestination(stripe, { customerId, restaurantId, priceId, trialEnd, appUrl });
    }
  } catch (error) {
    redirect(ownerPath(restaurantId, error instanceof BillingSetupPendingError ? "setup-pending" : "unavailable"));
  }

  if (!checkoutUrl) redirect(ownerPath(restaurantId, "unavailable"));
  redirect(checkoutUrl);
}

export async function openBillingPortal(restaurantId: string): Promise<void> {
  await requireOwner(restaurantId);
  let portalUrl: string | null = null;
  let missingCustomer = false;

  try {
    if (!isBillingManagementConfigured()) throw new BillingSetupPendingError();
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
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted || (customer.metadata.restaurant_id && customer.metadata.restaurant_id !== restaurantId)) {
        throw new BillingSetupPendingError();
      }
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: appUrl + ownerPath(restaurantId),
      });
      portalUrl = trustedStripeUrl(session.url, "portal");
    }
  } catch {
    redirect(ownerPath(restaurantId, "unavailable"));
  }

  if (missingCustomer) redirect(ownerPath(restaurantId, "not-started"));
  if (!portalUrl) redirect(ownerPath(restaurantId, "unavailable"));
  redirect(portalUrl);
}
