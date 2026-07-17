import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export class BillingConfigurationError extends Error {
  constructor(message = "Billing is not configured.") {
    super(message);
    this.name = "BillingConfigurationError";
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new BillingConfigurationError();
  return value;
}

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(requiredEnv("STRIPE_SECRET_KEY"));
  }
  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  return requiredEnv("STRIPE_WEBHOOK_SECRET");
}

export function getRecurringPriceId(): string {
  return requiredEnv("STRIPE_RECURRING_PRICE_ID");
}

export function getBillingAppUrl(): string {
  const raw = requiredEnv("NEXT_PUBLIC_APP_URL");
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new BillingConfigurationError();
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new BillingConfigurationError();
  }
  if (url.username || url.password) throw new BillingConfigurationError();
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new BillingConfigurationError();
  }
  return url.origin;
}

export function isBillingRuntimeConfigured(): boolean {
  const supabaseServerKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const requiredValuesPresent = Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_WEBHOOK_SECRET?.trim() &&
      process.env.STRIPE_RECURRING_PRICE_ID?.trim() &&
      supabaseServerKey &&
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_APP_URL?.trim(),
  );
  if (!requiredValuesPresent) return false;
  try {
    getBillingAppUrl();
    return true;
  } catch {
    return false;
  }
}
