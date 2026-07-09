import "server-only";
import Stripe from "stripe";

const STRIPE_API_VERSION = "2026-06-24.dahlia";

export type OwnerBillingSnapshot = {
  configured: boolean;
  stripeReady: boolean;
  customerId: string | null;
  priceConfigured: boolean;
  billingEmail: string | null;
  planLabel: string;
  subscriptionStatus: string;
  balanceDueCents: number;
  currency: string;
  openInvoiceCount: number;
  latestInvoiceUrl: string | null;
  latestInvoiceLabel: string | null;
  message: string | null;
  updatedAt: string;
};

export type OwnerBillingProfile = {
  restaurantId: string;
  envKey: string;
  secretConfigured: boolean;
  customerId: string | null;
  priceId: string | null;
  billingEmail: string | null;
  planLabel: string;
};

let stripeClient: Stripe | null = null;

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function firstEnv(keys: string[]): string | null {
  for (const key of keys) {
    const value = clean(process.env[key]);
    if (value) return value;
  }
  return null;
}

export function restaurantEnvKey(restaurantId: string): string {
  return restaurantId.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
}

function restaurantIdFromEnvKey(envKey: string): string | null {
  const cleaned = envKey.trim().toLowerCase().replace(/_+/g, "-");
  return cleaned ? cleaned : null;
}

export function getRestaurantIdForStripeCustomer(customerId: string | null): string | null {
  if (!customerId) return null;

  for (const [key, value] of Object.entries(process.env)) {
    if (value !== customerId) continue;

    const leadingMatch = key.match(/^STRIPE_(.+)_CUSTOMER_ID$/);
    if (leadingMatch?.[1]) return restaurantIdFromEnvKey(leadingMatch[1]);

    const trailingMatch = key.match(/^STRIPE_CUSTOMER_ID_(.+)$/);
    if (trailingMatch?.[1]) return restaurantIdFromEnvKey(trailingMatch[1]);
  }

  return null;
}

export function getStripeClient(): Stripe | null {
  const secret = clean(process.env.STRIPE_SECRET_KEY);
  if (!secret) return null;

  if (!stripeClient) {
    stripeClient = new Stripe(secret, {
      apiVersion: STRIPE_API_VERSION,
      maxNetworkRetries: 2,
    });
  }

  return stripeClient;
}

export function getOwnerBillingProfile(
  restaurantId: string,
  ownerEmail?: string | null,
): OwnerBillingProfile {
  const envKey = restaurantEnvKey(restaurantId);

  return {
    restaurantId,
    envKey,
    secretConfigured: Boolean(clean(process.env.STRIPE_SECRET_KEY)),
    customerId: firstEnv([`STRIPE_${envKey}_CUSTOMER_ID`, `STRIPE_CUSTOMER_ID_${envKey}`]),
    priceId: firstEnv([
      `STRIPE_${envKey}_PRICE_ID`,
      `STRIPE_PRICE_ID_${envKey}`,
      "STRIPE_FINACALLE_OS_PRICE_ID",
      "STRIPE_MONTHLY_PRICE_ID",
    ]),
    billingEmail:
      firstEnv([`STRIPE_${envKey}_BILLING_EMAIL`, `${envKey}_BILLING_EMAIL`]) ??
      ownerEmail ??
      null,
    planLabel:
      firstEnv([`STRIPE_${envKey}_PLAN_LABEL`, `${envKey}_PLAN_LABEL`, "FINA_CALLE_OS_PLAN_LABEL"]) ??
      "Fina Calle OS Monthly",
  };
}

function emptySnapshot(
  profile: OwnerBillingProfile,
  message: string | null,
  stripeReady: boolean,
): OwnerBillingSnapshot {
  return {
    configured: false,
    stripeReady,
    customerId: profile.customerId,
    priceConfigured: Boolean(profile.priceId),
    billingEmail: profile.billingEmail,
    planLabel: profile.planLabel,
    subscriptionStatus: "Not connected",
    balanceDueCents: 0,
    currency: "usd",
    openInvoiceCount: 0,
    latestInvoiceUrl: null,
    latestInvoiceLabel: null,
    message,
    updatedAt: new Date().toISOString(),
  };
}

function chooseSubscription(subscriptions: Stripe.Subscription[]): Stripe.Subscription | null {
  return (
    subscriptions.find((sub) =>
      ["active", "trialing", "past_due", "unpaid"].includes(sub.status),
    ) ??
    subscriptions[0] ??
    null
  );
}

export async function getOwnerBillingSnapshot({
  restaurantId,
  ownerEmail,
}: {
  restaurantId: string;
  ownerEmail?: string | null;
}): Promise<OwnerBillingSnapshot> {
  const profile = getOwnerBillingProfile(restaurantId, ownerEmail);
  const stripe = getStripeClient();

  if (!profile.secretConfigured || !stripe) {
    return emptySnapshot(profile, "Stripe is not configured yet.", false);
  }

  if (!profile.customerId) {
    return emptySnapshot(profile, `Add STRIPE_${profile.envKey}_CUSTOMER_ID to show live balance.`, true);
  }

  try {
    const [invoices, subscriptions] = await Promise.all([
      stripe.invoices.list({
        customer: profile.customerId,
        status: "open",
        limit: 10,
      }),
      stripe.subscriptions.list({
        customer: profile.customerId,
        status: "all",
        limit: 10,
      }),
    ]);

    const openInvoices = invoices.data;
    const totalDue = openInvoices.reduce((sum, invoice) => sum + invoice.amount_remaining, 0);
    const latestInvoice =
      openInvoices.find((invoice) => Boolean(invoice.hosted_invoice_url)) ?? openInvoices[0] ?? null;
    const subscription = chooseSubscription(subscriptions.data);

    return {
      configured: true,
      stripeReady: true,
      customerId: profile.customerId,
      priceConfigured: Boolean(profile.priceId),
      billingEmail: profile.billingEmail,
      planLabel: profile.planLabel,
      subscriptionStatus: subscription ? subscription.status.replace(/_/g, " ") : "No subscription",
      balanceDueCents: totalDue,
      currency: latestInvoice?.currency ?? subscription?.currency ?? "usd",
      openInvoiceCount: openInvoices.length,
      latestInvoiceUrl: latestInvoice?.hosted_invoice_url ?? null,
      latestInvoiceLabel: latestInvoice?.number ?? latestInvoice?.id ?? null,
      message: null,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return emptySnapshot(profile, "Stripe balance is temporarily unavailable.", true);
  }
}
