import { activeSource, AdmissionBudget, boundedText, parseFirstParty, verifiedOrigin } from "@/lib/traffic/first-party";
import { getTrafficStore } from "@/lib/traffic/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const budget = new AdmissionBudget();
const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
  // Disabled and preview deployments never touch storage. Guest UI does not
  // await this optional request and never changes behavior based on its result.
  if (process.env.VERCEL_ENV !== "production" || activeSource() !== "first-party") return new Response(null, { status: 202, headers });
  const origin = verifiedOrigin(request.headers.get("origin"));
  const collectorHost = new URL(request.url).hostname;
  if (!origin || !["finacalleos.com", "www.finacalleos.com", origin.hostname].includes(collectorHost)) return new Response(null, { status: 403, headers });
  if (request.headers.get("cookie")?.split(";").some((cookie) => cookie.trim() === "traffic_internal=1")) return new Response(null, { status: 204, headers });
  try {
    const event = parseFirstParty(JSON.parse(await boundedText(request)), origin.origin);
    if (!event) return new Response(null, { status: 400, headers });
    if (!budget.allow(event.siteId)) return new Response(null, { status: 429, headers });
    await getTrafficStore().insertEvents([event]);
  } catch {
    // No SQL, request body, identifier, or credential in logs. No guest retry storm.
    console.error("[traffic/pageview] collection unavailable");
    return new Response(null, { status: 503, headers });
  }
  return new Response(null, { status: 204, headers });
}
