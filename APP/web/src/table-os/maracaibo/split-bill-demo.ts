// Fictional presentation data. Never a Toast check, tax calculation or payment record.
export const SAMPLE_BILL = { items: [{ label: "4 example mains", cents: 4800 }, { label: "4 example drinks", cents: 3000 }], taxCents: 843, totalCents: 8643 } as const;
export const MAX_GUESTS = 12;

export function allocateEqualShares(totalCents: number, guests: number): number[] {
  if (!Number.isSafeInteger(totalCents) || totalCents < 0 || !Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) throw new RangeError("Use whole cents and 1–12 guests.");
  const base = Math.floor(totalCents / guests);
  const remainder = totalCents % guests;
  return Array.from({ length: guests }, (_, index) => base + (index < remainder ? 1 : 0));
}

export type SplitDemoState = Readonly<{ guests: number; selected: number; previewed: boolean }>;
export type SplitDemoAction = { type: "guests"; guests: number } | { type: "select"; selected: number } | { type: "preview" } | { type: "reset" };
export const initialSplitDemo: SplitDemoState = { guests: 4, selected: 0, previewed: false };

export function splitDemoReducer(state: SplitDemoState, action: SplitDemoAction): SplitDemoState {
  if (action.type === "reset") return initialSplitDemo;
  if (action.type === "guests") {
    if (!Number.isInteger(action.guests) || action.guests < 1 || action.guests > MAX_GUESTS || action.guests === state.guests) return state;
    return { guests: action.guests, selected: 0, previewed: false };
  }
  if (action.type === "select") {
    if (!Number.isInteger(action.selected) || action.selected < 0 || action.selected >= state.guests || action.selected === state.selected) return state;
    return { ...state, selected: action.selected, previewed: false };
  }
  return state.previewed ? state : { ...state, previewed: true };
}

export function exampleRemainingCents(state: SplitDemoState): number {
  return SAMPLE_BILL.totalCents - (state.previewed ? allocateEqualShares(SAMPLE_BILL.totalCents, state.guests)[state.selected] : 0);
}

export const usd = (cents: number): string => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
