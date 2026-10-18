import { createHash } from "node:crypto";
import manifest from "./manifest.json";
import { publishedContent, publishedGroups, type PublishedItem } from "./source";

export const BODEGA_MANIFEST = manifest;
export type CatalogEntry = (typeof manifest.entries)[number];
export function verifiedCatalog(): readonly CatalogEntry[] {
  const hash = createHash("sha256").update(JSON.stringify({ content: publishedContent(), entries: manifest.entries })).digest("hex");
  if (manifest.tenant !== "bodega" || manifest.schema !== "bodega-controls-v1" || manifest.guestPath !== "/demo/bodega" || manifest.hash !== hash || manifest.entries.length !== 50) throw new Error("Bodega's reviewed source manifest changed.");
  for (const group of publishedGroups()) {
    const entries = manifest.entries.filter(e => e.scope === group.scope);
    if (entries.length !== group.items.length) throw new Error("Bodega source association changed.");
    group.items.forEach((item, i) => {
      if (entries[i].name !== item.name || entries[i].contentHash !== createHash("sha256").update(JSON.stringify(item)).digest("hex")) throw new Error("Bodega source content changed.");
    });
  }
  return manifest.entries;
}
export function sourceItem(entry: CatalogEntry): PublishedItem {
  const item = publishedGroups().find(g => g.scope === entry.scope)?.items.find(i => i.name === entry.name);
  if (!item) throw new Error("Bodega item association changed.");
  return item;
}
