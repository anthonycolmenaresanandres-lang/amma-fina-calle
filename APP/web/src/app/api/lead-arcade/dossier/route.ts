// Lead Arcade — "Survey" dossier lookup (richer). Server-side so we avoid browser
// CORS, set a proper User-Agent, and keep calls off the client. Uses ONLY free,
// keyless public data: OpenStreetMap/Nominatim (with extratags) for address /
// hours / website / phone / cuisine, plus a lightweight fetch of the business
// website for theme color, a logo candidate, and an operational check. Standalone
// internal endpoint — no Client OS, Supabase, Stripe, or customer data.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BBOX = { lonMin: -76.6, lonMax: -75.9, latMin: 36.55, latMax: 37.3 };

function toBoard(lat: number, lon: number): { x: number; y: number } {
  const clamp = (v: number) => Math.min(0.94, Math.max(0.06, v));
  return {
    x: clamp((lon - BBOX.lonMin) / (BBOX.lonMax - BBOX.lonMin)),
    y: clamp((BBOX.latMax - lat) / (BBOX.latMax - BBOX.latMin)),
  };
}

interface Extratags { website?: string; "contact:website"?: string; opening_hours?: string; phone?: string; "contact:phone"?: string; cuisine?: string; brand?: string }
interface NominatimHit { lat: string; lon: string; display_name: string; category?: string; type?: string; addresstype?: string; extratags?: Extratags }

function timeoutFetch(url: string, ms: number, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(t));
}

function meta(html: string, attr: string, val: string): string | undefined {
  const re = new RegExp(`<meta[^>]+${attr}=["']${val}["'][^>]+content=["']([^"']+)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${val}["']`, "i");
  return html.match(re)?.[1] ?? html.match(re2)?.[1];
}

async function enrichSite(site: string): Promise<{ operational: boolean; themeColor?: string; logoCandidate?: string; title?: string }> {
  try {
    const url = site.startsWith("http") ? site : `https://${site}`;
    const res = await timeoutFetch(url, 5000, { headers: { "User-Agent": "FinaCalleConquest/1.0", Accept: "text/html" }, redirect: "follow" });
    if (!res.ok) return { operational: false };
    const html = (await res.text()).slice(0, 200000);
    const base = res.url || url;
    const og = meta(html, "property", "og:image") ?? meta(html, "name", "og:image");
    const fav = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i)?.[1];
    const abs = (u?: string) => { try { return u ? new URL(u, base).href : undefined; } catch { return undefined; } };
    return {
      operational: true,
      themeColor: meta(html, "name", "theme-color"),
      logoCandidate: abs(og) ?? abs(fav),
      title: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim(),
    };
  } catch {
    return { operational: false };
  }
}

export async function GET(req: Request): Promise<NextResponse> {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ ok: false, error: "missing q" }, { status: 400 });

  const params = new URLSearchParams({
    q, format: "jsonv2", limit: "1", addressdetails: "1", extratags: "1", namedetails: "1",
    viewbox: `${BBOX.lonMin},${BBOX.latMax},${BBOX.lonMax},${BBOX.latMin}`, bounded: "0",
  });

  try {
    const res = await timeoutFetch(`https://nominatim.openstreetmap.org/search?${params}`, 6000, {
      headers: { "User-Agent": "FinaCalleConquest/1.0 (AMMA Ventures internal tool)", Accept: "application/json" },
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: `upstream ${res.status}` }, { status: 502 });
    const hit = ((await res.json()) as NominatimHit[])[0];
    if (!hit) return NextResponse.json({ ok: false, error: "no match" });

    const lat = Number(hit.lat), lon = Number(hit.lon);
    const ex = hit.extratags ?? {};
    const website = ex.website ?? ex["contact:website"];
    const site = website ? await enrichSite(website) : { operational: false };

    return NextResponse.json({
      ok: true,
      displayName: hit.display_name,
      lat, lon,
      board: toBoard(lat, lon),
      businessType: ex.cuisine ?? hit.type ?? hit.category ?? hit.addresstype ?? "business",
      hours: ex.opening_hours ?? null,
      phone: ex.phone ?? ex["contact:phone"] ?? null,
      website: website ?? null,
      themeColor: site.themeColor ?? null,
      logoCandidate: site.logoCandidate ?? null,
      operational: site.operational,
      siteTitle: site.title ?? null,
    });
  } catch (err) {
    const msg = err instanceof Error && err.name === "AbortError" ? "timeout" : "fetch failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 504 });
  }
}
