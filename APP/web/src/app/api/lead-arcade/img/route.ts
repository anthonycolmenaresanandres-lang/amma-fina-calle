// Same-origin image proxy for the Lead Arcade mockup generator. Fetching an
// approved logo cross-origin would taint the client <canvas> and block export;
// proxying it through our origin keeps the canvas clean. Image content only,
// size-capped. Internal tool — no Client OS / customer data.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url).searchParams.get("url");
  if (!url || !/^https?:\/\//i.test(url)) return new NextResponse("bad url", { status: 400 });
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, { headers: { "User-Agent": "FinaCalleConquest/1.0" }, signal: ctrl.signal });
    if (!res.ok) return new NextResponse("upstream", { status: 502 });
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/")) return new NextResponse("not an image", { status: 415 });
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 5_000_000) return new NextResponse("too large", { status: 413 });
    return new NextResponse(buf, { headers: { "Content-Type": ct, "Cache-Control": "public, max-age=86400" } });
  } catch {
    return new NextResponse("fetch failed", { status: 504 });
  } finally {
    clearTimeout(t);
  }
}
