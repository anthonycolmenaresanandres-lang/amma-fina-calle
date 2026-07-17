import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { isBillingRuntimeConfigured } from "@/lib/stripe/server";
import {
  normalizeBillingStatus,
  type BillingSummary,
} from "./types";

type BillingSummaryRow = {
  plan: string | null;
  billing_status: string | null;
  recurring_enabled: boolean | null;
  amount_cents: number | null;
  currency: string | null;
  billing_interval: string | null;
  billing_interval_count: number | null;
  latest_invoice_status: string | null;
  last_payment_at: string | null;
  current_period_end: string | null;
  next_payment_at: string | null;
};

function fallbackSummary(plan: string | null, billingStatus: string | null): BillingSummary {
  return {
    plan: plan || "AMMA service",
    status: normalizeBillingStatus(billingStatus),
    recurringEnabled: false,
    amountCents: null,
    currency: null,
    billingInterval: null,
    billingIntervalCount: null,
    latestInvoiceStatus: null,
    lastPaymentAt: null,
    currentPeriodEnd: null,
    nextPaymentAt: null,
    actionsEnabled: isBillingRuntimeConfigured(),
  };
}

export async function getOwnerBillingSummary(
  restaurantId: string,
  plan: string | null,
  billingStatus: string | null,
): Promise<BillingSummary> {
  const fallback = fallbackSummary(plan, billingStatus);
  const supabase = await createServerSupabase();
  if (!supabase) return fallback;

  const { data, error } = await supabase.rpc("get_owner_billing_summary", {
    p_restaurant_id: restaurantId,
  });
  if (error || !data) return fallback;

  const row = (Array.isArray(data) ? data[0] : data) as BillingSummaryRow | undefined;
  if (!row) return fallback;

  return {
    plan: row.plan || fallback.plan,
    status: normalizeBillingStatus(row.billing_status),
    recurringEnabled: Boolean(row.recurring_enabled),
    amountCents: row.amount_cents,
    currency: row.currency,
    billingInterval: row.billing_interval,
    billingIntervalCount: row.billing_interval_count,
    latestInvoiceStatus: row.latest_invoice_status,
    lastPaymentAt: row.last_payment_at,
    currentPeriodEnd: row.current_period_end,
    nextPaymentAt: row.next_payment_at,
    actionsEnabled: isBillingRuntimeConfigured(),
  };
}

export function getBillingNotice(value: unknown): string | null {
  switch (value) {
    case "success":
      return "Billing setup completed. Payment status will refresh after Stripe confirms it.";
    case "canceled":
      return "No billing changes were made.";
    case "not-started":
      return "Start recurring billing before opening billing management.";
    case "unavailable":
      return "Billing is temporarily unavailable. Contact AMMA if you need immediate help.";
    default:
      return null;
  }
}
