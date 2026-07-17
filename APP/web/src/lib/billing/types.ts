export type BillingStatus =
  | "not_started"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused"
  | "processing";

export type BillingSummary = {
  plan: string;
  status: BillingStatus;
  recurringEnabled: boolean;
  latestInvoiceStatus: string | null;
  lastPaymentAt: string | null;
  currentPeriodEnd: string | null;
  nextPaymentAt: string | null;
  actionsEnabled: boolean;
};

const BILLING_STATUSES = new Set<BillingStatus>([
  "not_started",
  "incomplete",
  "incomplete_expired",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "paused",
  "processing",
]);

export function normalizeBillingStatus(value: unknown): BillingStatus {
  if (typeof value !== "string") return "not_started";
  const normalized = value.trim().toLowerCase().replaceAll(" ", "_");
  if (normalized === "manual" || normalized === "pending") return "not_started";
  return BILLING_STATUSES.has(normalized as BillingStatus)
    ? (normalized as BillingStatus)
    : "not_started";
}
