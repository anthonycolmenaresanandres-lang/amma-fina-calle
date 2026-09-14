import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getOwnerContext } from "@/lib/owner/auth";
import { getRecurringPriceId, getStripe, isBillingManagementConfigured, isBillingRuntimeConfigured } from "@/lib/stripe/server";
import { approvedTrialEnd, priceMatchesApprovedTerms } from "./policy";
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
  scheduled_first_charge_on: string | null;
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
    scheduledFirstChargeOn: null,
    actionsEnabled: false,
    managementEnabled: false,
    enrollmentEnabled: false,
    setupMessage: "Contact Anthony to confirm your account's payment setup.",
    statusAvailable: false,
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

  let managementEnabled = false;
  let enrollmentEnabled = false;
  if (isBillingManagementConfigured()) {
    try {
      const context = await getOwnerContext(restaurantId);
      if (context.state === "authorized") {
        const { data: account, error: accountError } = await getSupabaseAdmin().from("restaurant_billing")
          .select("stripe_customer_id").eq("restaurant_id", restaurantId).maybeSingle();
        if (!accountError) managementEnabled = Boolean(account?.stripe_customer_id);
        if (!accountError && account && ["not_started", "canceled", "incomplete_expired"].includes(row.billing_status ?? "") &&
            isBillingRuntimeConfigured(restaurantId)) {
          approvedTrialEnd(row);
          const price = await getStripe().prices.retrieve(getRecurringPriceId(restaurantId));
          enrollmentEnabled = priceMatchesApprovedTerms(price, row);
        }
      }
    } catch {
      // A pending quote/date or unavailable provider never enables a charge.
      enrollmentEnabled = false;
    }
  }

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
    scheduledFirstChargeOn: row.scheduled_first_charge_on,
    actionsEnabled: managementEnabled || enrollmentEnabled,
    statusAvailable: true,
    managementEnabled,
    enrollmentEnabled,
    setupMessage: !enrollmentEnabled && ["not_started", "canceled", "incomplete_expired"].includes(row.billing_status ?? "")
      ? "Contact Anthony to confirm your plan and first-payment date before automatic-payment setup." : null,
  };
}

export function getBillingNotice(value: unknown): string | null {
  switch (value) {
    case "success":
      return "You returned from Stripe. Check the confirmed subscription and invoice status; this return link is not proof of enrollment or payment.";
    case "canceled":
      return "You returned from checkout. Automatic payments begin only after you confirm enrollment in Stripe.";
    case "not-started":
      return "Your billing account is not connected yet. Contact Anthony to arrange invoice access.";
    case "setup-pending":
      return "Your plan or first-payment date needs confirmation. Contact Anthony; no new checkout was opened.";
    case "unavailable":
      return "Billing is temporarily unavailable. Contact AMMA if you need immediate help.";
    default:
      return null;
  }
}
