// Lead Arcade — "Survey" dossier lookup. Server-side so we avoid browser CORS,
// can set a proper User-Agent, and keep the call off the client. Uses ONLY free,
// keyless OpenStreetMap / Nominatim (public data). Standalone internal endpoint —
// it does not touch Client OS, Supabase, Stripe, or any customer data.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Approx Hampton Roads bounding box (lon/lat) used to bias the search and to map
// a hit onto the illustrated board (x = west→east, y = north→south).
const BBOX = { lonMin: -76.6, lonMax: -75.9, latMin: 36.55, latMax: 37.3 };

function toBoard(lat: number, lon: number): { x: number; y: number } {
  const clamp = (v: number) => Math.min(0.94, Math.max(0.06, v));
  const x = clamp((lon - BBOX.lonMin) / (BBOX.lonMax - BBOX.lonMin));
  const y = clamp((BBOX.latMax - lat) / (BBOX.latMax - BBOX.latMin));
  return { x, y };
}

interface NominatimHit {
  lat: string; lon: string; display_name: string;
  category?: string; type?: string; addresstype?: string;
}

export async function GET(req: Request): Promise<NextResponse> {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ ok: false, error: "missing q" }, { status: 400 });

  const params = new URLSearchParams({
    q, format: "jsonv2", limit: "1", addressdetails: "1",
    viewbox: `${BBOX.lonMin},${BBOX.latMax},${BBOX.lonMax},${BBOX.latMin}`, bounded: "0",
  });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { "User-Agent": "FinaCalleConquest/1.0 (AMMA Ventures internal tool)", "Accept": "application/json" },
      signal: ctrl.signal,
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: `upstream ${res.status}` }, { status: 502 });
    const data = (await res.json()) as NominatimHit[];
    const hit = data[0];
    if (!hit) return NextResponse.json({ ok: false, error: "no match" });
    const lat = Number(hit.lat), lon = Number(hit.lon);
    return NextResponse.json({
      ok: true,
      displayName: hit.display_name,
      lat, lon,
      businessType: hit.type ?? hit.category ?? hit.addresstype ?? "business",
      board: toBoard(lat, lon),
    });
  } catch (err) {
    const msg = err instanceof Error && err.name === "AbortError" ? "timeout" : "fetch failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 504 });
  } finally {
    clearTimeout(timer);
  }
}
