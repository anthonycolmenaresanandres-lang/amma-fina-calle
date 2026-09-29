/** Colattao's approved future recurring period, separate from the current payment. */
export const COLATTAO_BASIC_TERMS = {
  version: "colattao-basic-2026-09-29",
  amountCents: 14900,
  currency: "usd",
  firstChargeOn: "2026-10-20",
  interval: "month",
} as const;

export function colattaoTermsMatch(row: {
  amount_cents: number | null;
  currency: string | null;
  billing_interval: string | null;
  billing_interval_count: number | null;
  scheduled_first_charge_on: string | null;
}): boolean {
  return row.amount_cents === COLATTAO_BASIC_TERMS.amountCents &&
    row.currency?.toLowerCase() === COLATTAO_BASIC_TERMS.currency &&
    row.billing_interval === COLATTAO_BASIC_TERMS.interval &&
    row.billing_interval_count === 1 &&
    row.scheduled_first_charge_on === COLATTAO_BASIC_TERMS.firstChargeOn;
}
