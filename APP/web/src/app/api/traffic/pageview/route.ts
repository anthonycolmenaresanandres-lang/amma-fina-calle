import { activeSource, AdmissionBudget, boundedText, verifiedOrigin } from "@/lib/traffic/first-party";
import { getTrafficStore } from "@/lib/traffic/store";
import { parseCollectionEvent, trialCollectionEnabled, enabledTrialSites } from "@/lib/traffic/trial-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const budget = new AdmissionBudget();
const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
  // Disabled and preview deployments never touch storage. Guest UI does not
  // await this optional request and never changes behavior based on its result.
  const trialEnabled = trialCollectionEnabled();
  if (process.env.VERCEL_ENV !== "production" || (activeSource() !== "first-party" && !trialEnabled)) return new Response(null, { status: 202, headers });
  const origin = verifiedOrigin(request.headers.get("origin"));
  const collectorHost = new URL(request.url).hostname;
  if (!origin || !["finacalleos.com", "www.finacalleos.com", origin.hostname].includes(collectorHost)) return new Response(null, { status: 403, headers });
  if (request.headers.get("cookie")?.split(";").some((cookie) => cookie.trim() === "traffic_internal=1")) return new Response(null, { status: 204, headers });
  try {
    const input = JSON.parse(await boundedText(request));
    const event = parseCollectionEvent(input, origin.origin, { trials: trialEnabled, trialSites: enabledTrialSites(), firstParty: activeSource() === "first-party" });
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
