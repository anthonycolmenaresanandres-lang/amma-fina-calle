// GET is the authenticated read-only report contract. Only separately enabled
// and authenticated POST performs independent probes and stores health checks.
export { GET } from "../report/route";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { timingSafeEqual } from "node:crypto";
import { ALL_TRAFFIC_SITES } from "@/lib/traffic/sites";
import { getTrafficStore } from "@/lib/traffic/store";
import { activeSource } from "@/lib/traffic/first-party";
export async function POST(request: Request) {
  if (process.env.TRAFFIC_HEALTH_RECORD_ENABLED !== "true" || process.env.VERCEL_ENV !== "production") return Response.json({ reason: "health_recording_disabled" }, { status: 503 });
  const expected = process.env.CRON_SECRET?.trim() ?? "";
  const provided = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!expected || Buffer.byteLength(expected) !== Buffer.byteLength(provided) || !timingSafeEqual(Buffer.from(expected), Buffer.from(provided))) return Response.json({ reason: "unauthorized" }, { status: 401 });
  let store: ReturnType<typeof getTrafficStore>;
  try { store = getTrafficStore(); }
  catch { return Response.json({ reason: "durable_store_unavailable" }, { status: 503 }); }
  if (!store.recordCollectionProbe) return Response.json({ reason: "durable_store_required" }, { status: 503 });
  const recordProbe = store.recordCollectionProbe.bind(store);
  const checks = await Promise.all(ALL_TRAFFIC_SITES.map(async (site) => {
    let healthy = false;
    try {
      const probe = new URL(site.importantPaths[0], `https://${site.domains[0]}`);
      probe.searchParams.set("traffic_test", "health");
      const response = await fetch(probe, { redirect: "error", cache: "no-store", signal: AbortSignal.timeout(3000) });
      // An independent configuration/availability probe, not a real pageview.
      // It never tests by counting a synthetic guest or running page scripts.
      const text = (await response.text()).slice(0, 1000000);
      healthy = response.ok && activeSource() === "first-party" && /name=["']fc-traffic-collector["']\s+content=["']first-party-v1["']/.test(text);
    } catch { healthy = false; }
    try {
      await recordProbe(site.id, healthy, Date.now());
      return { siteId: site.id, healthy, evidence: "configuration-only" };
    } catch { return { siteId: site.id, healthy: false, evidence: "configuration-only", reason: "store_unavailable" }; }
  }));
  return Response.json({ checks, ingestionVerified: false, note: "Configuration-only checks cannot establish complete ingestion coverage or measured-zero traffic. Collector JS and event writes are unverified." }, { headers: { "Cache-Control": "private, no-store" } });
}
