// Territories — multiple boards, each its own market with a geographic bounding
// box used to bias Survey lookups and to map lat/lon onto that board.

export interface Bbox { lonMin: number; lonMax: number; latMin: number; latMax: number }
export interface Territory { id: string; name: string; near: string; bbox: Bbox }

export const TERRITORIES: Territory[] = [
  { id: "hampton-roads", name: "Hampton Roads, VA", near: "Hampton Roads, VA", bbox: { lonMin: -76.6, lonMax: -75.9, latMin: 36.55, latMax: 37.3 } },
  { id: "richmond", name: "Richmond, VA", near: "Richmond, VA", bbox: { lonMin: -77.65, lonMax: -77.3, latMin: 37.45, latMax: 37.66 } },
  { id: "norfolk", name: "Norfolk, VA", near: "Norfolk, VA", bbox: { lonMin: -76.35, lonMax: -76.18, latMin: 36.82, latMax: 36.94 } },
];

export const DEFAULT_TERRITORY = TERRITORIES[0].id;

export function getTerritory(id: string): Territory {
  return TERRITORIES.find((t) => t.id === id) ?? TERRITORIES[0];
}

const KEY = "fina-calle-conquest-territory";

export function loadActiveTerritory(): string {
  if (typeof window === "undefined") return DEFAULT_TERRITORY;
  try { return window.localStorage.getItem(KEY) ?? DEFAULT_TERRITORY; } catch { return DEFAULT_TERRITORY; }
}

export function saveActiveTerritory(id: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, id); } catch { /* ignore */ }
}
