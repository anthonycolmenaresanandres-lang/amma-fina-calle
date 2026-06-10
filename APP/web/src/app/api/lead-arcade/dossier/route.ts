// Lead Arcade — "Survey" dossier lookup (richer). Server-side so we avoid browser
// CORS, set a proper User-Agent, and keep calls off the client. Uses ONLY free,
// keyless public data: OpenStreetMap/Nominatim (with extratags) for address /
// hours / website / phone / cuisine, plus a lightweight fetch of the business
// website for theme color, a logo candidate, and an operational check. Standalone
// internal endpoint — no Client OS, Supabase, Stripe, or customer data.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface Bbox { lonMin: number; lonMax: number; latMin: number; latMax: number }
const DEFAULT_BBOX: Bbox = { lonMin: -76.6, lonMax: -75.9, latMin: 36.55, latMax: 37.3 };

function toBoard(lat: number, lon: number, b: Bbox): { x: number; y: number } {
  const clamp = (v: number) => Math.min(0.94, Math.max(0.06, v));
  return {
    x: clamp((lon - b.lonMin) / (b.lonMax - b.lonMin)),
    y: clamp((b.latMax - lat) / (b.latMax - b.latMin)),
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

interface SiteInfo { operational: boolean; themeColor?: string; logoCandidate?: string; title?: string }

async function enrichSite(site: string): Promise<SiteInfo> {
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

interface YelpBiz {
  rating?: number; review_count?: number; price?: string; image_url?: string;
  is_closed?: boolean; url?: string; phone?: string;
  categories?: { title: string }[]; coordinates?: { latitude: number; longitude: number };
}

// Yelp Fusion enrichment — gated on YELP_API_KEY. Without the key it returns
// null and the dossier gracefully falls back to OpenStreetMap only. (Free tier;
// owner adds YELP_API_KEY in the Vercel project env to activate.)
async function yelpLookup(name: string, near: string): Promise<YelpBiz | null> {
  const key = process.env.YELP_API_KEY;
  if (!key) return null;
  try {
    const p = new URLSearchParams({ term: name, location: near, limit: "1" });
    const res = await timeoutFetch(`https://api.yelp.com/v3/businesses/search?${p}`, 6000, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { businesses?: YelpBiz[] };
    return data.businesses?.[0] ?? null;
  } catch {
    return null;
  }
}

interface FsqPlace {
  rating?: number; price?: number; tel?: string; website?: string;
  hours?: { display?: string; open_now?: boolean };
  categories?: { name: string }[];
  geocodes?: { main?: { latitude: number; longitude: number } };
  photos?: { prefix: string; suffix: string }[];
}

// Foursquare Places enrichment — gated on FOURSQUARE_API_KEY. Fills gaps Yelp/OSM
// miss (photo, hours, a cross-check rating). Null without the key (graceful).
async function foursquareLookup(name: string, near: string): Promise<FsqPlace | null> {
  const key = process.env.FOURSQUARE_API_KEY;
  if (!key) return null;
  try {
    const p = new URLSearchParams({
      query: name, near, limit: "1",
      fields: "rating,price,tel,website,hours,categories,geocodes,photos",
    });
    const res = await timeoutFetch(`https://api.foursquare.com/v3/places/search?${p}`, 6000, {
      headers: { Authorization: key, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: FsqPlace[] };
    return data.results?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: Request): Promise<NextResponse> {
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q")?.trim();
  if (!q) return NextResponse.json({ ok: false, error: "missing q" }, { status: 400 });

  const near = sp.get("near") || "Hampton Roads, VA";
  const num = (k: string, d: number) => { const v = Number(sp.get(k)); return Number.isFinite(v) && sp.get(k) !== null ? v : d; };
  const bbox: Bbox = {
    lonMin: num("lonMin", DEFAULT_BBOX.lonMin), lonMax: num("lonMax", DEFAULT_BBOX.lonMax),
    latMin: num("latMin", DEFAULT_BBOX.latMin), latMax: num("latMax", DEFAULT_BBOX.latMax),
  };

  const params = new URLSearchParams({
    q, format: "jsonv2", limit: "1", addressdetails: "1", extratags: "1", namedetails: "1",
    viewbox: `${bbox.lonMin},${bbox.latMax},${bbox.lonMax},${bbox.latMin}`, bounded: "0",
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
    const [site, yelp, fsq] = await Promise.all([
      website ? enrichSite(website) : Promise.resolve<SiteInfo>({ operational: false }),
      yelpLookup(q, near),
      foursquareLookup(q, near),
    ]);

    const coords = yelp?.coordinates ?? fsq?.geocodes?.main;
    const fsqRating = fsq?.rating != null ? Math.round((fsq.rating / 2) * 10) / 10 : null; // 0-10 → 0-5
    const fsqPhoto = fsq?.photos?.[0] ? `${fsq.photos[0].prefix}original${fsq.photos[0].suffix}` : null;
    const sources = ["osm", ...(yelp ? ["yelp"] : []), ...(fsq ? ["foursquare"] : [])];

    return NextResponse.json({
      ok: true,
      displayName: hit.display_name,
      lat, lon,
      board: coords ? toBoard(coords.latitude, coords.longitude, bbox) : toBoard(lat, lon, bbox),
      businessType: yelp?.categories?.[0]?.title ?? fsq?.categories?.[0]?.name ?? ex.cuisine ?? hit.type ?? hit.category ?? hit.addresstype ?? "business",
      hours: ex.opening_hours ?? fsq?.hours?.display ?? null,
      phone: yelp?.phone ?? fsq?.tel ?? ex.phone ?? ex["contact:phone"] ?? null,
      website: website ?? fsq?.website ?? null,
      themeColor: site.themeColor ?? null,
      logoCandidate: site.logoCandidate ?? null,
      operational: yelp ? yelp.is_closed === false : site.operational,
      siteTitle: site.title ?? null,
      rating: yelp?.rating ?? fsqRating,
      reviewCount: yelp?.review_count ?? null,
      price: yelp?.price ?? (fsq?.price ? "$".repeat(fsq.price) : null),
      photo: yelp?.image_url ?? fsqPhoto,
      yelpUrl: yelp?.url ?? null,
      sources,
    });
  } catch (err) {
    const msg = err instanceof Error && err.name === "AbortError" ? "timeout" : "fetch failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 504 });
  }
}
