// Read-only local export using an EXISTING dedicated connection supplied through
// environment. No credential discovery, helpers with DDL, or raw-event export.
import { calendarRange } from "../src/lib/traffic/date";
import { ALL_TRAFFIC_SITES } from "../src/lib/traffic/sites";
import { trafficDatabaseUrl, __test } from "../src/lib/traffic/store";
import { assessCoverage } from "../src/lib/traffic/coverage";
async function main() {
  const [first,last,timezone="America/New_York"] = process.argv.slice(2);
  if (!first || !last) throw Error("Usage: traffic-export.ts YYYY-MM-DD YYYY-MM-DD [America/New_York]");
  const range = calendarRange(first,last,timezone);
  const connection = trafficDatabaseUrl();
  if (!connection) throw Error("No existing dedicated traffic connection. Stop; do not retrieve or decrypt secrets.");
  const store = new __test.PostgresTrafficStore(connection);
  const reports = [];
  for (const site of ALL_TRAFFIC_SITES) {
    try {
      const metrics = await store.getRangeReport(site.id,Date.parse(range.since),Date.parse(range.until),timezone);
      const checks = await store.getCollectionChecks(site.id,Date.parse(range.since),Date.parse(range.until));
      const observation = await store.getObservationWindow(site.id);
      const coverage = assessCoverage(checks,range.since,range.until,metrics.pageviews);
      reports.push({siteId:site.id,domains:site.domains,observation, coverage,
        ...(coverage.complete ? { pageviews: metrics.pageviews } : { recordedPageviews: metrics.pageviews }),
        distinctTrackedIdentifiers: metrics.identifiedPageviews ? metrics.uniqueVisitors : null,
        identifiedPageviews: metrics.identifiedPageviews, recordedDaily: metrics.daily, recordedTopPaths: metrics.topPaths,
        identifierLabel:"Distinct tracked identifiers; not people. First-party pageviews have no persistent identifier."});
    } catch { reports.push({siteId:site.id,state:"unavailable",reason:"Dedicated store read failed; no measured zero inferred"}); }
  }
  console.log(JSON.stringify({range,reports},null,2));
}
main().catch(()=>{console.error("Read-only traffic export unavailable. Check dates and existing authorized connection; no secrets printed.");process.exitCode=1;});
