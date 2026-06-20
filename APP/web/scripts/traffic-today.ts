// Codex / local CLI: prints today's traffic report from the protected endpoint.
//
//   npm run traffic:today
//
// Reads config from env (never prints secrets):
//   TRAFFIC_REPORT_URL    base URL of the deployment (default http://localhost:3000)
//   TRAFFIC_REPORT_TOKEN  bearer token for the report endpoint (required)

const baseUrl = (process.env.TRAFFIC_REPORT_URL || "http://localhost:3000").replace(/\/+$/, "");
const token = process.env.TRAFFIC_REPORT_TOKEN;

function bar(count: number, max: number, width = 24): string {
  if (max <= 0) return "";
  return "█".repeat(Math.max(1, Math.round((count / max) * width)));
}

async function main(): Promise<void> {
  if (!token) {
    console.error("TRAFFIC_REPORT_TOKEN is not set. Aborting (no token, no request).");
    process.exitCode = 1;
    return;
  }

  const url = `${baseUrl}/api/internal/traffic/today`;
  let response: Response;
  try {
    response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  } catch (error) {
    console.error(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
    return;
  }

  if (!response.ok) {
    console.error(`Report endpoint returned HTTP ${response.status}.`);
    process.exitCode = 1;
    return;
  }

  const report = (await response.json()) as {
    date: string;
    timezone: string;
    pageviews: number;
    uniqueVisitors: number;
    topPaths: { path: string; count: number }[];
    topReferrers: { referrer: string; count: number }[];
    lastUpdated: string;
  };

  console.log("");
  console.log(`  Traffic — ${report.date} (${report.timezone})`);
  console.log(`  ${"─".repeat(40)}`);
  console.log(`  Pageviews        ${report.pageviews}`);
  console.log(`  Unique visitors  ${report.uniqueVisitors}`);
  console.log(`  Last updated     ${report.lastUpdated}`);

  if (report.topPaths.length) {
    const max = report.topPaths[0].count;
    console.log("");
    console.log("  Top paths");
    for (const row of report.topPaths) {
      console.log(`    ${String(row.count).padStart(5)}  ${bar(row.count, max)}  ${row.path}`);
    }
  }

  if (report.topReferrers.length) {
    const max = report.topReferrers[0].count;
    console.log("");
    console.log("  Top referrers");
    for (const row of report.topReferrers) {
      console.log(`    ${String(row.count).padStart(5)}  ${bar(row.count, max)}  ${row.referrer}`);
    }
  }
  console.log("");
}

main();
