import { BODEGA_MANIFEST, verifiedCatalog } from "./catalog";
import { projectBodegaMenu, type BodegaSnapshot } from "./overlay";
export const BODEGA_FIXTURE_COMMIT = "a".repeat(40);

/** Public source content + synthetic control changes. No owner or customer records. */
export function bodegaFixtureSnapshot(): BodegaSnapshot {
  return { tenant: "bodega", manifest_hash: BODEGA_MANIFEST.hash, snapshot_version: 0,
    items: verifiedCatalog().map(e => ({ id: e.id, available: true, order: e.baselineOrder, version: 0 })) };
}
export function bodegaFixtureMenu(mode: "baseline" | "live" | "fallback") {
  if (mode === "baseline") return projectBodegaMenu({ mode: "off", snapshot: null });
  if (mode === "fallback") return projectBodegaMenu({ mode: "fallback", snapshot: null, reason: "unavailable" });
  const snapshot = bodegaFixtureSnapshot();
  const unavailable = BODEGA_MANIFEST.entries.find(e => e.sourceId === "cafecito-bodega-cat")!;
  const moved = BODEGA_MANIFEST.entries.find(e => e.sourceId === "classic-mocha")!;
  snapshot.items.find(i => i.id === unavailable.id)!.available = false;
  snapshot.items.find(i => i.id === unavailable.id)!.version = 1;
  snapshot.items.find(i => i.id === moved.id)!.order = 0;
  snapshot.items.find(i => i.id === moved.id)!.version = 1;
  snapshot.snapshot_version = 2;
  return projectBodegaMenu({ mode: "live", snapshot });
}
