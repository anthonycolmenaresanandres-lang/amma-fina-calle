export const categories = ["All places", "Food & Drink", "Shopping", "Family Activities", "Experiences", "Beauty & Wellness"] as const;
export type Category = (typeof categories)[number];
export type Place = {
  id: string; name: string; category: Category; neighborhood: string;
  description: string; offer: string; cost: string; requirement: string; postDeadline: string;
  quota: number; lat: number; lon: number; area: string; hours: string;
  tone: string; symbol: "coffee" | "bag" | "kite" | "wave" | "flower";
  trail: boolean;
};

// Invented merchants and proposed offers. Coordinates locate sample neighborhood
// anchors, never a real merchant address or claim of participation.
export const places: Place[] = [
  { id: "tideline", name: "Tideline Coffee", category: "Food & Drink", neighborhood: "ViBe District", description: "A slow morning, a good cup, and a little room to wander.", offer: "A pastry with your coffee", cost: "Buy one coffee · sample price $5", requirement: "One honest social story naming Tideline Coffee and showing your coffee visit.", postDeadline: "Within 48 hours of visit, before campaign expiry.", quota: 12, lat: 36.8415, lon: -75.979, area: "Sample anchor near 18th Street & Cypress Avenue", hours: "Sample hours · Tue–Fri, 8 am–noon", tone: "coffee", symbol: "coffee", trail: true },
  { id: "thread", name: "Sunday Thread", category: "Shopping", neighborhood: "ViBe District", description: "Small finds for your wardrobe. Big personality for your weekend.", offer: "$10 off a $50 shop", cost: "Minimum purchase $50 · sample cap $10", requirement: "One honest social story naming Sunday Thread and showing your shopping experience.", postDeadline: "Within 48 hours of visit, before campaign expiry.", quota: 8, lat: 36.844, lon: -75.978, area: "Sample anchor near 19th Street & Baltic Avenue", hours: "Sample hours · Sat–Sun, 11 am–4 pm", tone: "shop", symbol: "bag", trail: true },
  { id: "little", name: "Little Kite Studio", category: "Family Activities", neighborhood: "Oceanfront", description: "A hands-on afternoon to make something together.", offer: "A family craft-kit add-on", cost: "One adult booking · sample price $24", requirement: "1 adult-created, honest social story naming Little Kite Studio. Show supplies or space, never children’s names/images. Adult booking only.", postDeadline: "Within 48 hours of visit, before campaign expiry.", quota: 6, lat: 36.853, lon: -75.976, area: "Sample anchor near 25th Street & Pacific Avenue", hours: "Sample hours · Sat, 1–4 pm", tone: "family", symbol: "kite", trail: false },
  { id: "salt", name: "Salt & Story Walks", category: "Experiences", neighborhood: "Oceanfront", description: "See the shoreline differently, one story at a time.", offer: "A sample $5 walk credit", cost: "Buy one adult ticket · sample price $20", requirement: "One honest social story naming Salt & Story Walks and sharing your walk experience.", postDeadline: "Within 48 hours of visit, before campaign expiry.", quota: 10, lat: 36.863, lon: -75.978, area: "Sample anchor near 31st Street & Atlantic Avenue", hours: "Sample hours · Sun, 9–11 am", tone: "experience", symbol: "wave", trail: false },
  { id: "bloom", name: "Bloom Ritual", category: "Beauty & Wellness", neighborhood: "ViBe District", description: "A quiet pause in the middle of a very good day.", offer: "A tea with your class", cost: "One adult class · sample price $18", requirement: "One honest social story naming Bloom Ritual and sharing your class experience.", postDeadline: "Within 48 hours of visit, before campaign expiry.", quota: 5, lat: 36.837, lon: -75.981, area: "Sample anchor near 16th Street & Cypress Avenue", hours: "Sample hours · Wed, 10 am–noon", tone: "wellness", symbol: "flower", trail: true },
];

export const DEMO_EXPIRY = "December 31, 2026, 11:59 pm ET";
export const STORAGE_KEY = "fina-calle-discover-demo-v1";
export type ClaimStage = "claimed" | "visited" | "proof" | "redeemed";
export type DemoState = { saved: string[]; destinations: string[]; claims: Partial<Record<string, ClaimStage>> };
export const INITIAL_STATE: DemoState = { saved: [], destinations: [], claims: {} };
export const stages: ClaimStage[] = ["claimed", "visited", "proof", "redeemed"];

export function parseState(raw: string | null): DemoState {
  if (!raw) return INITIAL_STATE;
  try {
    const value = JSON.parse(raw);
    const validIds = new Set(places.map(p => p.id));
    return {
      saved: Array.isArray(value?.saved) ? [...new Set<string>(value.saved.filter((id: unknown) => typeof id === "string" && validIds.has(id)))] : [],
      destinations: Array.isArray(value?.destinations) ? [...new Set<string>(value.destinations.filter((city: unknown) => typeof city === "string" && city.length <= 80))].slice(0, 20) : [],
      claims: Object.fromEntries(Object.entries(value?.claims && typeof value.claims === "object" ? value.claims : {}).filter((entry): entry is [string, ClaimStage] => validIds.has(entry[0]) && stages.includes(entry[1] as ClaimStage))),
    };
  } catch { return INITIAL_STATE; }
}

export function disclosureFor(place: Pick<Place, "name">): string {
  return `I received a perk from ${place.name} in exchange for my honest post.`;
}

export function advanceClaim(state: DemoState, id: string, expectedStage: ClaimStage | undefined, termsAccepted = false, proofAccepted = false): DemoState {
  if (!places.some(p => p.id === id)) return state;
  const stage = state.claims[id];
  if (stage !== expectedStage || stage === "redeemed" || (!stage && !termsAccepted) || (stage === "visited" && !proofAccepted)) return state;
  const next = stage ? stages[Math.min(stages.indexOf(stage) + 1, stages.length - 1)] : stages[0];
  return { ...state, claims: { ...state.claims, [id]: next } };
}

export function normalizeCity(input: string): string {
  const city = input.trim().replace(/\s+/g, " ").slice(0, 80);
  if (/^(virginia beach|virginia beach,? (va|virginia)|vb)$/i.test(city)) return "Virginia Beach, VA";
  return city;
}

export function placeIdFromHash(hash: string): string | null {
  if (!hash.startsWith("#offer-")) return null;
  const id = hash.slice("#offer-".length);
  return places.some(place => place.id === id) ? id : null;
}
