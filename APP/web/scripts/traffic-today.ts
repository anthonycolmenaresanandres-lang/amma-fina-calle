// Read-only current-day inspection using an existing report token. No sends.
async function main() {
  const site = process.argv[2];
  const token = process.env.TRAFFIC_REPORT_TOKEN;
  if (!site || !token) { console.error("Usage: traffic:today -- SITE; existing TRAFFIC_REPORT_TOKEN required."); process.exitCode = 1; return; }
  const base = process.env.TRAFFIC_REPORT_URL || "http://localhost:3000";
  const url = new URL("/api/internal/traffic/today", base);
  url.searchParams.set("site", site);
  const response = await fetch(url, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000), cache: "no-store" });
  if (!response.ok) { console.error(`Traffic report unavailable (HTTP ${response.status}); missing data is not zero.`); process.exitCode = 1; return; }
  const report = await response.json();
  console.log(JSON.stringify(report, null, 2));
}
main().catch(() => { console.error("Traffic report read failed; no estimate shown."); process.exitCode = 1; });
