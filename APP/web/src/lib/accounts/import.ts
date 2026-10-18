/** Pure preview adapters. None of these functions publish or authorize a write. */
export type MenuItem = { sourceId: string; categoryId: string; name: string; description: string; priceCents: number | null; available: boolean; order: number };
export type MenuSnapshot = { tenant: string; source: "manual-json-v1" | "bodega-static-v1"; version: string; currency: "USD"; categories: { sourceId: string; name: string }[]; items: MenuItem[] };
export type StagedMenu = { revision: number; snapshot: MenuSnapshot | null };
export type ImportChange = { sourceId: string; kind: "add" | "update" | "retain"; before: MenuItem | null; after: MenuItem; review: "owner_review" | "commercial_review" | "health_review" };
export type ImportPlan = { tenant: string; source: MenuSnapshot["source"]; sourceVersion: string; expectedRevision: number; changes: ImportChange[]; categoryChanges: { sourceId: string; before: string | null; after: string; retained: boolean }[]; snapshot: MenuSnapshot; canPublish: false };
const ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,95}$/;
export const TENANT_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const health = /allerg|gluten|dairy|nuts?|vegan|organic|healthy|sugar.free|cure|safe|kosher|halal/i;
function record(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(k => !keys.includes(k))) throw new Error("Use only the fields in the menu template.");
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number, label: string, empty = false): string {
  if (typeof value !== "string" || value.length > max || (!empty && !value.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new Error(`Check ${label}.`);
  return value.trim();
}
function id(value: unknown): string { const s = text(value, 96, "source IDs"); if (!ID.test(s)) throw new Error("Source IDs must be stable letters, numbers, dots, colons, underscores or hyphens."); return s; }
export function validateSnapshot(value: unknown, tenant: string): MenuSnapshot {
  const v = record(value, ["tenant", "source", "version", "currency", "categories", "items"]);
  if (tenant.length > 80 || !TENANT_ID.test(tenant) || v.tenant !== tenant) throw new Error("The menu must belong to this account.");
  if (v.source !== "manual-json-v1" && v.source !== "bodega-static-v1") throw new Error("This source has no supported preview adapter. Choose a manual menu snapshot.");
  if (v.currency !== "USD") throw new Error("This preview supports USD only.");
  if (!Array.isArray(v.categories) || v.categories.length < 1 || v.categories.length > 40 || !Array.isArray(v.items) || v.items.length < 1 || v.items.length > 200) throw new Error("Use 1–40 categories and 1–200 items. An empty import cannot remove a menu.");
  const categories = v.categories.map(c => { const r = record(c, ["sourceId", "name"]); return { sourceId: id(r.sourceId), name: text(r.name, 100, "category names") }; });
  const categoryIds = new Set(categories.map(c => c.sourceId));
  if (categoryIds.size !== categories.length) throw new Error("Category source IDs must be unique.");
  const items = v.items.map(i => {
    const r = record(i, ["sourceId", "categoryId", "name", "description", "priceCents", "available", "order"]);
    const categoryId = id(r.categoryId);
    if (!categoryIds.has(categoryId)) throw new Error("Every item needs a category from this snapshot.");
    if (r.priceCents !== null && (typeof r.priceCents !== "number" || !Number.isSafeInteger(r.priceCents) || r.priceCents < 0 || r.priceCents > 1000000)) throw new Error("Use a whole cent amount or null for an unknown price.");
    if (typeof r.available !== "boolean" || typeof r.order !== "number" || !Number.isInteger(r.order) || r.order < 0 || r.order > 10000) throw new Error("Check availability and item order.");
    return { sourceId: id(r.sourceId), categoryId, name: text(r.name, 120, "item names"), description: text(r.description, 800, "descriptions", true), priceCents: r.priceCents as number | null, available: r.available, order: r.order };
  });
  if (new Set(items.map(i => i.sourceId)).size !== items.length) throw new Error("Item source IDs must be unique; assign each variant its own ID.");
  if (new Set(items.map(i => `${i.categoryId}:${i.order}`)).size !== items.length) throw new Error("Two items cannot occupy the same category position.");
  return { tenant, source: v.source, version: text(v.version, 100, "source version"), currency: "USD", categories: categories.sort((a,b) => a.sourceId.localeCompare(b.sourceId, "en")), items: items.sort((a,b) => a.sourceId.localeCompare(b.sourceId, "en")) };
}
export function parseSnapshot(json: string, tenant: string): MenuSnapshot {
  if (new TextEncoder().encode(json).length > 256000) throw new Error("Keep the menu snapshot below 256 KB.");
  let value: unknown; try { value = JSON.parse(json); } catch { throw new Error("Use valid JSON from the menu template."); }
  return validateSnapshot(value, tenant);
}
export function planImport(incoming: MenuSnapshot, current: StagedMenu): ImportPlan {
  const next = validateSnapshot(incoming, incoming.tenant);
  if (!Number.isSafeInteger(current.revision) || current.revision < 0) throw new Error("Refresh the account revision.");
  const before = current.snapshot && validateSnapshot(current.snapshot, next.tenant);
  if (before && before.source !== next.source) throw new Error("Changing sources requires a reviewed ID mapping; it cannot duplicate this menu.");
  const old = new Map(before?.items.map(i => [i.sourceId, i]));
  const changes: ImportChange[] = [];
  for (const item of next.items) {
    const previous = old.get(item.sourceId) ?? null;
    if (previous && JSON.stringify(previous) === JSON.stringify(item)) continue;
    const words = `${previous?.name ?? ""} ${previous?.description ?? ""} ${item.name} ${item.description}`;
    changes.push({ sourceId: item.sourceId, kind: previous ? "update" : "add", before: previous, after: item, review: health.test(words) ? "health_review" : !previous || previous.priceCents !== item.priceCents ? "commercial_review" : "owner_review" });
  }
  for (const item of before?.items ?? []) if (!next.items.some(i => i.sourceId === item.sourceId)) changes.push({ sourceId: item.sourceId, kind: "retain", before: item, after: item, review: "owner_review" });
  const mergedItems = [...next.items, ...changes.filter(c => c.kind === "retain").map(c => c.after)];
  const mergedCategories = [...next.categories, ...(before?.categories ?? []).filter(c => !next.categories.some(n => n.sourceId === c.sourceId))];
  const categoryChanges = mergedCategories.flatMap(c => {
    const previous = before?.categories.find(p => p.sourceId === c.sourceId);
    return previous?.name === c.name ? [] : [{ sourceId: c.sourceId, before: previous?.name ?? null, after: c.name, retained: false }];
  });
  // Retained items may conflict with an incoming position. Never shuffle them silently.
  const snapshot = validateSnapshot({ ...next, items: mergedItems, categories: mergedCategories }, next.tenant);
  return { tenant: next.tenant, source: next.source, sourceVersion: next.version, expectedRevision: current.revision, changes, categoryChanges, snapshot, canPublish: false };
}
export async function snapshotDigest(snapshot: MenuSnapshot): Promise<string> {
  const canonical = validateSnapshot(snapshot, snapshot.tenant);
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(canonical))))).map(b => b.toString(16).padStart(2,"0")).join("");
}
export async function stageReviewedPlan(plan: ImportPlan, current: StagedMenu, approvedDigest: string): Promise<StagedMenu> {
  if (current.revision !== plan.expectedRevision) throw new Error("The account changed after this preview. Preview again.");
  if (!/^[a-f0-9]{64}$/.test(approvedDigest) || await snapshotDigest(plan.snapshot) !== approvedDigest) throw new Error("The menu changed after approval. Preview and review it again.");
  // This helper changes an in-memory preview only. Server storage must compare its own revision.
  return { revision: current.revision + 1, snapshot: validateSnapshot(plan.snapshot, plan.tenant) };
}
export const SOURCE_OPTIONS = [
  { id: "manual-json-v1", label: "Manual menu snapshot", detail: "Preview and stage a reviewed file. No automatic fetching or publication.", supported: true },
  { id: "bodega-static-v1", label: "Static café menu", detail: "Preview adapter for explicit item and variant IDs. Publishing adapter not certified.", supported: true },
  { id: "square", label: "Square", detail: "Account connection exists separately; onboarding menu sync is unsupported here.", supported: false },
  { id: "external-site", label: "External website", detail: "A separate source adapter and permission review are required.", supported: false },
] as const;

/** Static draft adapter requires an audited sidecar. Never derive identity from a name or array position. */
export function adaptStaticMenu(tenant: string, version: string, sections: { id: string; title: string; items: { name: string; description?: string; prices?: { label: string; cents: number | null }[] }[] }[], ids: { sectionId: string; itemIndex: number; variantIndex: number; sourceId: string; expectedName: string; expectedVariant: string }[]): MenuSnapshot {
  const items: MenuItem[] = [];
  let expectedCount = 0;
  for (const section of sections) {
    let order = 0;
    section.items.forEach((item, itemIndex) => {
      const variants = item.prices?.length ? item.prices : [{ label: "", cents: null }];
      variants.forEach((variant, variantIndex) => {
        expectedCount++;
        const matches = ids.filter(i => i.sectionId === section.id && i.itemIndex === itemIndex && i.variantIndex === variantIndex);
        const mapping = matches[0];
        if (matches.length !== 1 || mapping.expectedName !== item.name || mapping.expectedVariant !== variant.label) throw new Error("The static source changed. Review its stable ID sidecar before importing.");
        items.push({ sourceId: mapping.sourceId, categoryId: section.id, name: variant.label ? `${item.name} · ${variant.label}` : item.name, description: item.description ?? "", priceCents: variant.cents, available: true, order: order++ });
      });
    });
  }
  if (ids.length !== expectedCount) throw new Error("The ID sidecar contains missing or unused mappings.");
  return validateSnapshot({ tenant, source: "bodega-static-v1", version, currency: "USD", categories: sections.map(s => ({ sourceId: s.id, name: s.title })), items }, tenant);
}
