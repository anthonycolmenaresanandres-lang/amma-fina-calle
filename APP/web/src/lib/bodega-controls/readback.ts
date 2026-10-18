import { createHash } from "node:crypto";
import { BODEGA_MANIFEST, verifiedCatalog } from "./catalog";
import { parseBodegaSnapshot, type BodegaSnapshot } from "./overlay";

export type BodegaReadbackProof = { tenant: "bodega"; path: "/demo/bodega"; manifest_hash: string; snapshot_version: number; item_id: string; item_version: number; available: boolean; sort_order: number; html_sha256: string; origin: string; deployment_commit: string };
const LIMIT = 512000;
const VOID = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
function attributes(tag: string): Record<string,string> {
  const attrs: Record<string,string> = {};
  for (const m of tag.matchAll(/\s([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    const name = m[1].toLowerCase();
    if (Object.hasOwn(attrs,name)) throw new Error("Duplicate markup attribute.");
    attrs[name] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return attrs;
}
/** Conservative scan of our fixed SSR markup, excluding comments/raw text/hidden ancestors. */
export function verifyRenderedBodegaMenu(html: string, expected: BodegaSnapshot, itemId: string, origin: string, deploymentCommit: string): BodegaReadbackProof | null {
  try {
    if (!/^[a-f0-9]{40}$/.test(deploymentCommit) || new TextEncoder().encode(html).length > LIMIT || !parseBodegaSnapshot(expected)) return null;
    const catalog = verifiedCatalog(); const seen = new Set<string>(); const lastOrders = new Map<string,number>();
    const stack: { tag: string; hidden: boolean; controlId?: string }[] = []; const texts = new Map<string,string>(); let raw: string | null = null; let root = false, closed = false;
    for (const token of html.matchAll(/<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>|[^<]+/g)) {
      const tag = token[0]; if (tag.startsWith("<!--")) continue;
      if (!tag.startsWith("<")) {
        if (!raw && root && !stack.at(-1)?.hidden) { const current = stack.findLast(e => e.controlId); if (current?.controlId) texts.set(current.controlId,(texts.get(current.controlId) ?? "") + " " + tag); }
        continue;
      }
      const name = /^<\/?([a-zA-Z][\w:-]*)/.exec(tag)?.[1].toLowerCase(); if (!name) return null;
      const closing = tag.startsWith("</");
      if (raw) { if (closing && name === raw) raw = null; else continue; }
      if (closing) {
        if (root && name === "main") { if (stack.at(-1)?.tag !== "main") return null; root = false; closed = true; }
        if (stack.length) { if (stack.at(-1)?.tag !== name) return null; stack.pop(); }
        continue;
      }
      const attrs = attributes(tag);
      const hidden = !!stack.at(-1)?.hidden || ["template","noscript"].includes(name) || Object.hasOwn(attrs,"hidden") || attrs["aria-hidden"] === "true" || /display\s*:\s*none|visibility\s*:\s*hidden/i.test(attrs.style ?? "");
      if (name === "main" && attrs["data-menu-source"] === "bodega-controls-v1") {
        if (root || closed || hidden || attrs["data-menu-mode"] !== "live" || attrs["data-menu-manifest"] !== expected.manifest_hash || attrs["data-menu-snapshot-version"] !== String(expected.snapshot_version) || attrs["data-menu-deployment"] !== deploymentCommit) return null;
        root = true;
      }
      const id = attrs["data-menu-control-id"];
      if (id) {
        if (!root || hidden || !["li","tr"].includes(name) || seen.has(id)) return null;
        const row = expected.items.find(i => i.id === id), entry = catalog.find(e => e.id === id);
        if (!row || !entry || attrs["data-menu-available"] !== String(row.available) || attrs["data-menu-order"] !== String(row.order) || attrs["data-menu-version"] !== String(row.version) || row.order <= (lastOrders.get(entry.scope) ?? -1)) return null;
        seen.add(id); lastOrders.set(entry.scope,row.order);
      }
      if (!VOID.has(name) && !tag.endsWith("/>")) stack.push({ tag: name, hidden, controlId: id });
      if (["script","style","textarea","title"].includes(name)) raw = name;
    }
    const item = expected.items.find(i => i.id === itemId);
    if (!closed || root || seen.size !== catalog.length || !item) return null;
    for (const entry of catalog) {
      const row = expected.items.find(i => i.id === entry.id)!;
      const text = (texts.get(entry.id) ?? "").replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos);/gi, (_all, entity: string) => {
        if (entity.startsWith("#")) { const n = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2),16) : Number(entity.slice(1)); return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "?"; }
        return ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" } as Record<string,string>)[entity.toLowerCase()];
      }).replace(/\s+/g," ").trim();
      if (!text.startsWith(entry.name.replace(/\s+/g," ")) || text.includes("Sold out") !== !row.available) return null;
    }
    return { tenant: "bodega", path: "/demo/bodega", manifest_hash: BODEGA_MANIFEST.hash, snapshot_version: expected.snapshot_version, item_id: item.id, item_version: item.version, available: item.available, sort_order: item.order, html_sha256: createHash("sha256").update(html).digest("hex"), origin, deployment_commit: deploymentCommit };
  } catch { return null; }
}
export async function readBodegaPublicMenu(expected: BodegaSnapshot, itemId: string, options: { fetcher?: typeof fetch; origin?: string; fixture?: boolean; expectedCommit?: string; env?: Record<string,string|undefined> } = {}): Promise<{ ok: true; proof: BodegaReadbackProof } | { ok: false; reason: "unavailable" | "unverified" }> {
  const origin = options.origin ?? "https://finacalleos.com"; const env = options.env ?? process.env;
  const fixtureAllowed = options.fixture === true && env.LOCAL_PILOT_PREVIEW === "1" && !env.VERCEL && /^http:\/\/127\.0\.0\.1:\d{1,5}$/.test(origin);
  if (!options.expectedCommit || !/^[a-f0-9]{40}$/.test(options.expectedCommit) || origin !== "https://finacalleos.com" && !fixtureAllowed) return { ok: false, reason: "unavailable" };
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(),8000);
  try {
    const response = await (options.fetcher ?? fetch)(`${origin}/demo/bodega`, { redirect: "error", cache: "no-store", signal: controller.signal, headers: { "Cache-Control": "no-cache" } });
    if (response.status !== 200 || !response.headers.get("content-type")?.toLowerCase().startsWith("text/html") || !response.body || Number(response.headers.get("content-length") ?? 0) > LIMIT) return { ok: false, reason: "unavailable" };
    const reader = response.body.getReader(); const parts: Uint8Array[] = []; let size = 0;
    try { while (true) { const chunk = await reader.read(); if (chunk.done) break; size += chunk.value.length; if (size > LIMIT) { await reader.cancel(); return { ok: false, reason: "unavailable" }; } parts.push(chunk.value); } } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(size); let offset = 0; for (const part of parts) { bytes.set(part,offset); offset += part.length; }
    const proof = verifyRenderedBodegaMenu(new TextDecoder("utf-8", { fatal: true }).decode(bytes), expected, itemId, origin, options.expectedCommit);
    return proof ? { ok: true, proof } : { ok: false, reason: "unverified" };
  } catch { return { ok: false, reason: "unavailable" }; }
  finally { clearTimeout(timer); }
}
