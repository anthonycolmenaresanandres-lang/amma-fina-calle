export const ITEMS = [
  { id: "spanish", name: "Spanish Latte", key: "1" },
  { id: "canela", name: "Canela Love", key: "2" },
  { id: "muffin", name: "Coffee Cinnamon Muffin", key: "3" },
] as const;
export type ItemId = (typeof ITEMS)[number]["id"];
export const SHIFT_MS = 45_000;
export const BEST_KEY = "bodega-fall-rush-best-v1";
export type RushState = {
  phase: "ready" | "playing" | "paused" | "done";
  practice: boolean; elapsed: number; orderElapsed: number; ticket: ItemId[];
  filled: number; served: number; missed: number; score: number; streak: number;
  longest: number; perfect: boolean; goldenUntil: number; message: string;
};
export function newShift(practice = false): RushState {
  return { phase: "ready", practice, elapsed: 0, orderElapsed: 0,
    ticket: ["spanish", "muffin"], filled: 0, served: 0, missed: 0, score: 0,
    streak: 0, longest: 0, perfect: true, goldenUntil: 0,
    message: "A little cafecito. A little friendly competition." };
}
export function makeTicket(served: number, random: number): ItemId[] {
  const length = served < 3 ? 2 : served < 8 ? 3 : 4;
  let seed = Math.floor(Math.max(0, Math.min(0.999999, random)) * 0x7fffffff) + 1;
  const ticket: ItemId[] = [served % 3 === 0 ? "spanish" : ITEMS[seed % 3].id];
  for (let i = 1; i < length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const previous = ITEMS.findIndex((item) => item.id === ticket[i - 1]);
    ticket.push(ITEMS[(previous + 1 + (seed % 2)) % 3].id);
  }
  return ticket;
}
export const orderLimit = (served: number) => Math.max(4_500, 8_000 - served * 200);
export const isGolden = (state: RushState) => state.goldenUntil > state.elapsed;
type Action =
  | { type: "start"; practice: boolean }
  | { type: "pause" | "resume" | "finish" }
  | { type: "tick"; delta: number; random: number }
  | { type: "pick"; item: ItemId; random: number };
export function rushReducer(state: RushState, action: Action): RushState {
  if (action.type === "start") return { ...newShift(action.practice), phase: "playing", message: "Tap the ticket items in order, left to right." };
  if (action.type === "pause") return state.phase === "playing" ? { ...state, phase: "paused" } : state;
  if (action.type === "resume") return state.phase === "paused" ? { ...state, phase: "playing" } : state;
  if (state.phase !== "playing") return state;
  if (action.type === "finish") return { ...state, phase: "done", message: "Your shift is complete." };
  if (action.type === "tick") {
    if (!Number.isFinite(action.delta) || action.delta <= 0) return state;
    const elapsed = state.elapsed + action.delta;
    if (!state.practice && elapsed >= SHIFT_MS) return { ...state, elapsed: SHIFT_MS, phase: "done", message: "Your shift is complete." };
    const orderElapsed = state.orderElapsed + action.delta;
    if (!state.practice && orderElapsed >= orderLimit(state.served)) {
      return { ...state, elapsed, orderElapsed: 0, filled: 0, streak: 0, perfect: true,
        goldenUntil: 0, missed: state.missed + 1, ticket: makeTicket(state.served, action.random),
        message: "That order cooled off. Fresh ticket, fresh start!" };
    }
    return { ...state, elapsed, orderElapsed };
  }
  if (action.type === "pick") {
    if (action.item !== state.ticket[state.filled]) {
      return { ...state, score: Math.max(0, state.score - 10), streak: 0, perfect: false, goldenUntil: 0,
        message: "Oops! −10. Tap the highlighted item to keep going." };
    }
    const multiplier = isGolden(state) ? 2 : 1;
    const score = state.score + 10 * multiplier;
    if (state.filled + 1 < state.ticket.length) return { ...state, filled: state.filled + 1, score, message: `Nice! +${10 * multiplier}. Next item…` };
    const served = state.served + 1;
    const streak = state.perfect ? state.streak + 1 : 0;
    const golden = streak > 0 && streak % 4 === 0;
    const bonus = (100 + (state.ticket.length - 2) * 30) * multiplier;
    return { ...state, score: score + bonus, served, streak, longest: Math.max(state.longest, streak),
      filled: 0, orderElapsed: 0, perfect: true, ticket: makeTicket(served, action.random),
      goldenUntil: golden ? state.elapsed + 7_000 : state.goldenUntil,
      message: golden ? "Golden Hour! Double points for 7 seconds." : `Order up! +${bonus + 10 * multiplier}. Keep it warm.` };
  }
  return state;
}
