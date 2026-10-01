import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderMorningReport } from "../src/lib/traffic/morning-format";
import { TRAFFIC_SITES } from "../src/lib/traffic/sites";
import type { TrafficReport } from "../src/lib/traffic/site-traffic";

async function read(relative: string) {
  return readFile(path.resolve(relative), "utf8");
}

async function main() {
  const [lib, sites, page, central, customers, env, cron, morning] = await Promise.all([
    read("src/lib/traffic/site-traffic.ts"),
    read("src/lib/traffic/sites.ts"),
    read("src/app/customers/bodega-traffic/page.tsx"),
    read("src/app/customers/traffic/page.tsx"),
    read("src/app/customers/page.tsx"),
    read(".env.example"),
    read("vercel.json"),
    read("src/app/api/internal/traffic/morning/route.ts"),
  ]);

  assert.match(lib, /import "server-only"/);
  assert.match(sites, /bodegacafe757\.com/);
  assert.match(sites, /www\.bodegacafe757\.com/);
  assert.match(sites, /finacalleos\.com/);
  assert.match(sites, /colattao-cafe-rush\.vercel\.app/);
  assert.match(lib, /getTrafficStore\(\)\.getRangeReport/);
  assert.match(lib, /"\/bodega-sessions-review"/);
  assert.match(lib, /TRAFFIC_DATABASE_URL/);
  assert.match(lib, /getAllSiteTrafficReports/);
  assert.match(lib, /Promise\.all\(TRAFFIC_SITES\.map/);
  assert(!lib.includes("NEXT_PUBLIC_VERCEL"), "Analytics credentials must stay server-only");

  assert.match(page, /getAdminContext\(\)/);
  assert.match(page, /admin\.state !== "authorized"/);
  assert.match(page, /getBodegaTrafficReport\(30\)/);
  assert.match(page, /Unique visitors/);
  assert.match(page, /Game opens/);
  assert.match(page, /not a guaranteed count of physical QR scans/);
  assert.match(central, /getAdminContext\(\)/);
  assert.match(central, /admin\.state !== "authorized"/);
  assert.match(central, /reports\.map/);
  assert(!central.includes("grandTotal"), "No cross-site grand total");
  assert.match(customers, /href="\/customers\/traffic"/);
  assert.match(env, /TRAFFIC_DATABASE_URL=/);
  assert.match(env, /TRAFFIC_MORNING_REPORT_EMAIL=/);
  assert.match(cron, /\/api\/internal\/traffic\/morning/);
  assert.match(morning, /CRON_SECRET/);
  assert.match(morning, /unavailable\.length/);

  const sampleReports: TrafficReport[] = TRAFFIC_SITES.map((site, index) => ({
    state: "ready", siteId: site.id, siteName: site.name, domains: site.domains, analyticsUrl: site.analyticsUrl,
    source: "Vercel Web Analytics drain", lastUpdated: "2026-09-30T12:00:00.000Z",
    since: "2026-09-30T04:00:00.000Z", until: "2026-10-01T04:00:00.000Z",
    pageviews: (index + 1) * 10, visitors: index + 1,
    daily: [], topPaths: [], topReferrers: [],
  }));
  const email = renderMorningReport("2026-09-30", sampleReports);
  for (const site of TRAFFIC_SITES) assert.match(email.text, new RegExp(site.name));
  assert.equal((email.text.match(/Unique visitors:/g) ?? []).length, TRAFFIC_SITES.length);
  assert.equal((email.text.match(/Pageviews:/g) ?? []).length, TRAFFIC_SITES.length);
  assert(!email.text.includes("Total visitors:"), "No cross-client visitor total");
  assert.throws(() => renderMorningReport("2026-09-30", [...sampleReports.slice(0, -1), {
    state: "unavailable", siteId: "colattao", siteName: "Colattao Coffee House",
    domains: TRAFFIC_SITES[2].domains, analyticsUrl: TRAFFIC_SITES[2].analyticsUrl, reason: "test",
  }]), /INCOMPLETE_SITE_REPORTS/);

  console.log("PASS: per-site production registry, admin dashboard, Bodega compatibility, and guarded morning cron are wired.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
