// Local pipeline self-test — no database, no network, no secrets required.
//
//   npm run traffic:selftest
//
// Replays Vercel's documented `vercel.analytics.v2` samples plus edge cases
// through parse -> sanitize -> signature -> file store -> report, asserting the
// privacy and aggregation rules hold. Exits non-zero on any failure.

import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHmac } from "node:crypto";
import { parseDrainPayload } from "../src/lib/traffic/parse-drain";
import { sanitizePath } from "../src/lib/traffic/sanitize";
import { verifyDrainRequest } from "../src/lib/traffic/signature";
import { __test } from "../src/lib/traffic/store";
import { siteFilter, siteForPublicVisit, TRAFFIC_SITES } from "../src/lib/traffic/sites";
import { todayRange } from "../src/lib/traffic/date";

let failures = 0;
function check(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`  ✓ ${name}`);
  } else {
    failures += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function nowMs(): number {
  return Date.now();
}

async function main(): Promise<void> {
  console.log("\nTraffic counter self-test\n");

  // --- sanitization / privacy ---
  check("public menu path preserved", sanitizePath("/m/colattao") === "/m/colattao");
  check("opaque id collapsed", sanitizePath("/m/3f9a1c2b4d5e6f70819a2b3c4d5e6f70") === "/m/:id");
  check("numeric id collapsed", sanitizePath("/blog/12345") === "/blog/:id");
  check("owner portal anonymized", sanitizePath("/owner/abc/settings") === "/owner/:private");
  check("customers portal anonymized", sanitizePath("/customers/xyz/requests") === "/customers/:private");
  check("api route dropped", sanitizePath("/api/lead-arcade/dossier") === null);
  check("query string dropped", sanitizePath("/menu?utm_source=ig") === "/menu");

  // --- drain parsing (NDJSON + JSON array, both Vercel-documented shapes) ---
  const ts = nowMs();
  const ndjson = [
    JSON.stringify({ schema: "vercel.analytics.v2", eventType: "pageview", timestamp: ts, deviceId: 67890, origin: "https://finacalleos.com", path: "/for-restaurants" }),
    JSON.stringify({ schema: "vercel.analytics.v2", eventType: "pageview", timestamp: ts, deviceId: 11111, origin: "https://finacalleos.com", path: "/for-restaurants", referrer: "https://www.instagram.com/" }),
    JSON.stringify({ schema: "vercel.analytics.v2", eventType: "pageview", timestamp: ts, deviceId: 67890, origin: "https://finacalleos.com", path: "/api/secret" }),
    JSON.stringify({ schema: "vercel.analytics.v2", eventType: "event", eventName: "button_click", timestamp: ts, deviceId: 67890, origin: "https://finacalleos.com", path: "/for-restaurants" }),
    JSON.stringify({ schema: "vercel.analytics.v2", eventType: "pageview", timestamp: ts, deviceId: 999, origin: "https://finacalleos.com", path: "/customers/traffic" }),
    JSON.stringify({ schema: "vercel.analytics.v2", eventType: "pageview", timestamp: ts, deviceId: 999, origin: "https://amma-fina-calle-abc.vercel.app", path: "/for-restaurants" }),
  ].join("\n");
  const parsed = parseDrainPayload(ndjson);
  check("api event dropped during parse", parsed.every((e) => !e.path.startsWith("/api")), JSON.stringify(parsed.map((e) => e.path)));
  check("only verified public events parsed", parsed.length === 3, `got ${parsed.length}`);
  check("all Fina events attributed to Fina", parsed.every((e) => e.siteId === "fina-calle"));
  check("instagram referrer host extracted", parsed.some((e) => e.referrerHost === "instagram.com"));

  const arrayPayload = JSON.stringify([
    { schema: "vercel.analytics.v2", eventType: "pageview", timestamp: ts, deviceId: 222, origin: "https://colattao-cafe-rush.vercel.app", path: "/menu" },
  ]);
  check("json array payload parsed", parseDrainPayload(arrayPayload).length === 1);
  check("garbage payload is empty, not thrown", parseDrainPayload("not json at all").length === 0);
  check("same project Bodega host stays Bodega", siteForPublicVisit("bodegacafe757.com", "/demo/bodega")?.id === "bodega");
  check("hosted client path never becomes Fina marketing", !siteForPublicVisit("finacalleos.com", "/demo/project-seed"));
  check("preview deployment never becomes Colattao", !siteForPublicVisit("colattao-cafe-rush-abc.vercel.app", "/menu"));
  check("every API filter contains its own hostname", TRAFFIC_SITES.every((site) => siteFilter(site).includes(`requestHostname eq '${site.domains[0]}'`)));
  const spring = todayRange("America/New_York", Date.parse("2026-03-08T15:00:00Z"));
  const fall = todayRange("America/New_York", Date.parse("2026-11-01T15:00:00Z"));
  check("Eastern spring reporting day spans 23 hours", spring.dateStr === "2026-03-08" && spring.endMs - spring.startMs === 23 * 3600000);
  check("Eastern fall reporting day spans 25 hours", fall.dateStr === "2026-11-01" && fall.endMs - fall.startMs === 25 * 3600000);

  // --- signature ---
  const secret = "test-secret-123";
  check("header secret authorizes", verifyDrainRequest({ rawBody: ndjson, secret, headerSecret: secret, vercelSignature: null }));
  check("wrong header secret rejected", !verifyDrainRequest({ rawBody: ndjson, secret, headerSecret: "nope", vercelSignature: null }));
  check("missing secret fails closed", !verifyDrainRequest({ rawBody: ndjson, secret: undefined, headerSecret: secret, vercelSignature: null }));
  const sig = createHmac("sha1", secret).update(ndjson).digest("hex");
  check("vercel HMAC signature authorizes", verifyDrainRequest({ rawBody: ndjson, secret, headerSecret: null, vercelSignature: sig }));

  // --- file store + report (today aggregation) ---
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "traffic-selftest-"));
  const store = new __test.FileTrafficStore(dir);
  await store.insertEvents(parsed);
  await store.insertEvents(parseDrainPayload(arrayPayload));
  // Historical file rows without a site ID cannot safely enter any site report.
  await fs.appendFile(path.join(dir, "traffic-events.jsonl"), JSON.stringify({
    ts, path: "/for-restaurants", referrerHost: null, visitorId: "legacy", eventType: "pageview",
  }) + "\n", "utf8");
  // An event from yesterday must be excluded from "today".
  await store.insertEvents([{ siteId: "fina-calle", ts: ts - 48 * 60 * 60 * 1000, path: "/old", referrerHost: null, visitorId: "999", eventType: "pageview" }]);

  const report = await store.getTodayReport("fina-calle", "America/New_York");
  const colattaoReport = await store.getTodayReport("colattao", "America/New_York");
  check("Fina pageviews exclude Colattao", report.pageviews === 2, `got ${report.pageviews}`);
  check("Fina visitors exclude Colattao", report.uniqueVisitors === 2, `got ${report.uniqueVisitors}`);
  check("Colattao remains separate", colattaoReport.siteId === "colattao" && colattaoReport.pageviews === 1 && colattaoReport.uniqueVisitors === 1);
  check("top path is the Fina marketing page", report.topPaths[0]?.path === "/for-restaurants" && report.topPaths[0]?.count === 2);
  check("yesterday excluded from today", !report.topPaths.some((p) => p.path === "/old"));
  check("top referrer is instagram", report.topReferrers[0]?.referrer === "instagram.com");
  let unknownRejected = false;
  try { await store.getTodayReport("unknown-site", "America/New_York"); } catch { unknownRejected = true; }
  check("unknown site report rejected", unknownRejected);

  await fs.rm(dir, { recursive: true, force: true });

  console.log("");
  if (failures) {
    console.error(`${failures} check(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log("All checks passed.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
