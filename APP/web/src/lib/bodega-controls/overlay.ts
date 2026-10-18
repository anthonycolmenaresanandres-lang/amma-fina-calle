import { BODEGA_MANIFEST, verifiedCatalog } from "./catalog";
import { classicDrinks, classicExtras, espressoDrinks, draftMenuSections, seasonalDrinks } from "../../app/(internal)/demo/bodega/menu-draft";
import type { PublishedItem } from "./source";
import type { PublicMenuControl } from "../../venue-menu/menu-controls";

export type BodegaSnapshot = { tenant: "bodega"; manifest_hash: string; snapshot_version: number; items: PublicMenuControl[] };
export type BodegaMenuState = { mode: "off" | "live" | "fallback"; snapshot: BodegaSnapshot | null; reason?: "unavailable" | "source_changed" | "invalid_snapshot" };
type RpcResult = { data: unknown; error: unknown };
type RpcOperation = PromiseLike<RpcResult> & { abortSignal?: (signal: AbortSignal) => PromiseLike<RpcResult> };
export type BodegaReader = { rpc(name: string, args: Record<string, unknown>): RpcOperation };
const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
export const bodegaControlsEnabled = (env: Record<string,string|undefined> = process.env) => env.BODEGA_MENU_CONTROLS_ENABLED === "true";
export function parseBodegaSnapshot(value: unknown): BodegaSnapshot | null {
  try {
    const entries = verifiedCatalog();
    if (!isRecord(value) || Object.keys(value).some(k => !["tenant","manifest_hash","snapshot_version","items"].includes(k)) || value.tenant !== "bodega" || value.manifest_hash !== BODEGA_MANIFEST.hash || typeof value.snapshot_version !== "number" || !Number.isSafeInteger(value.snapshot_version) || value.snapshot_version < 0 || !Array.isArray(value.items) || value.items.length !== entries.length) return null;
    const seen = new Set<string>(), positions = new Set<string>(); const items: PublicMenuControl[] = [];
    for (const item of value.items) {
      if (!isRecord(item) || Object.keys(item).some(k => !["id","available","order","version"].includes(k)) || typeof item.id !== "string" || typeof item.available !== "boolean" || typeof item.order !== "number" || !Number.isInteger(item.order) || item.order < 0 || item.order > 10000 || typeof item.version !== "number" || !Number.isSafeInteger(item.version) || item.version < 0 || item.version > value.snapshot_version) return null;
      const entry = entries.find(e => e.id === item.id);
      if (!entry || seen.has(item.id) || positions.has(`${entry.scope}:${item.order}`)) return null;
      seen.add(item.id); positions.add(`${entry.scope}:${item.order}`);
      items.push({ id: item.id, available: item.available, order: item.order, version: item.version });
    }
    return { tenant: "bodega", manifest_hash: BODEGA_MANIFEST.hash, snapshot_version: value.snapshot_version, items };
  } catch { return null; }
}
export async function resolveBodegaMenu(getClient: () => Promise<BodegaReader | null>, env: Record<string,string|undefined> = process.env): Promise<BodegaMenuState> {
  if (!bodegaControlsEnabled(env)) return { mode: "off", snapshot: null };
  try { verifiedCatalog(); } catch { return { mode: "fallback", snapshot: null, reason: "source_changed" }; }
  const controller = new AbortController(); let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<null>(resolve => { timer = setTimeout(() => { controller.abort(); resolve(null); }, 8000); });
    const load = async () => {
      const client = await getClient(); if (!client) return null;
      const operation = client.rpc("get_bodega_menu_controls_v1", { p_manifest_hash: BODEGA_MANIFEST.hash });
      const result = await (operation.abortSignal ? operation.abortSignal(controller.signal) : operation);
      if (controller.signal.aborted || result.error) return null;
      return parseBodegaSnapshot(result.data);
    };
    const snapshot = await Promise.race([load(), timeout]);
    return snapshot ? { mode: "live", snapshot } : { mode: "fallback", snapshot: null, reason: "unavailable" };
  } catch { return { mode: "fallback", snapshot: null, reason: "unavailable" }; }
  finally { if (timer) clearTimeout(timer); }
}
function project<T extends PublishedItem>(scope: string, items: readonly T[], state: BodegaMenuState): (T & { publicControl?: PublicMenuControl })[] {
  if (state.mode !== "live" || !state.snapshot) return items.map(i => ({ ...i }));
  const entries = verifiedCatalog().filter(e => e.scope === scope);
  const projected = items.map(item => {
    const entry = entries.find(e => e.name === item.name);
    const control = entry && state.snapshot!.items.find(c => c.id === entry.id);
    if (!entry || !control) throw new Error("Incomplete Bodega source association.");
    return { ...item, publicControl: { ...control } };
  });
  return projected.sort((a,b) => a.publicControl.order - b.publicControl.order);
}
export function projectBodegaMenu(input: BodegaMenuState) {
  const build = (state: BodegaMenuState) => ({
    state,
    seasonal: project("seasonal", seasonalDrinks, state),
    espresso: project("espresso", espressoDrinks, state),
    classics: project("classics", classicDrinks, state),
    extras: project("extras", classicExtras, state),
    sections: draftMenuSections.map(section => ({ ...section, items: project(section.id, section.items, state) })),
  });
  try {
    if (input.mode === "live" && !parseBodegaSnapshot(input.snapshot)) throw new Error("Invalid control snapshot.");
    return build(input);
  } catch { return build({ mode: "fallback", snapshot: null, reason: "invalid_snapshot" }); }
}
export type BodegaMenuProjection = ReturnType<typeof projectBodegaMenu>;
