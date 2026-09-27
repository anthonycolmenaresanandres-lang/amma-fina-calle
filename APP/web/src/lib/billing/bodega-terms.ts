/** The approved Bodega offer is versioned so a Checkout can be tied to exact terms. */
export const BODEGA_BASIC_TERMS = {
  version: "bodega-basic-2026-09-27",
  plan: "Basic",
  amountCents: 19900,
  currency: "usd",
  trialStartedOn: "2026-09-26",
  firstChargeOn: "2026-10-26",
  interval: "month",
  setupFeeCents: 0,
  cancellation: "Cancel anytime before the next charge to stop future renewals.",
} as const;

export function bodegaTermsMatch(row: {
  amount_cents: number | null;
  currency: string | null;
  billing_interval: string | null;
  billing_interval_count: number | null;
  scheduled_first_charge_on: string | null;
}): boolean {
  return row.amount_cents === BODEGA_BASIC_TERMS.amountCents &&
    row.currency?.toLowerCase() === BODEGA_BASIC_TERMS.currency &&
    row.billing_interval === BODEGA_BASIC_TERMS.interval &&
    row.billing_interval_count === 1 &&
    row.scheduled_first_charge_on === BODEGA_BASIC_TERMS.firstChargeOn;
}
