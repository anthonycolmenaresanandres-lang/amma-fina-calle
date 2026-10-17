import type { TrafficReport } from "./site-traffic";
import { ALL_TRAFFIC_SITES as TRAFFIC_SITES } from "./sites";

export function renderMorningReport(date: string, reports: TrafficReport[]) {
  if (reports.length !== TRAFFIC_SITES.length ||
      TRAFFIC_SITES.some((site) => reports.filter((report) => report.siteId === site.id).length !== 1)) {
    throw new Error("INCOMPLETE_SITE_REPORTS");
  }
  const lines = [
    `Production website traffic — ${date} (America/New_York)`,
    "Source: first-party pageviews and earlier attributed drain events since collection began. Each site stays separate; no combined distinct total.",
    "",
  ];
  for (const site of TRAFFIC_SITES) {
    const report = reports.find((item) => item.siteId === site.id)!;
    lines.push(report.siteName, `Type: ${site.kind} (route classification; no business approval or collection status inferred)`, `Domains: ${report.domains.join(", ")}`);
    lines.push(`Interval [start, end): ${report.since ?? "unknown"} to ${report.until ?? "unknown"}; timezone ${report.timezone ?? "America/New_York"}`,
      `Configuration check: ${report.checkedAt ?? "unverified"}; last successful configuration check: ${report.lastSuccessfulCheck ?? "unverified"}; collection start: ${report.collectionStart ?? "unknown"}`);
    if (report.state === "ready") {
      lines.push(`Distinct tracked identifiers (not people): ${report.identifiedPageviews === 0 ? "not collected" : report.visitors.toLocaleString("en-US")} (anonymous first-party pageviews have no persistent identifier)`,
        `Pageviews: ${report.pageviews.toLocaleString("en-US")}`);
      if (Date.parse(report.firstObservedAt) > Date.parse(report.since)) {
        lines.push(`First verified pageview: ${report.firstObservedAt} (earlier traffic was not backfilled)`);
      }
    } else {
      lines.push(`Status: ${report.reason}`);
      if (report.observedPageviews !== undefined) lines.push(`Recorded pageviews (coverage ${report.state}): ${report.observedPageviews}`);
      if (report.state === "empty") lines.push(`Last verified pageview: ${report.lastObservedAt}`);
    }
    lines.push("");
  }
  lines.push("Only verified production hostnames and explicitly listed public pages are included.",
    "Tracked identifiers are not identifiable people. Anonymous first-party collection measures pageviews only, not physical QR scans. Configuration probes do not verify ingestion or prove zero traffic.",
    "Private dashboard: https://finacalleos.com/customers/traffic");
  return { subject: `Fina Calle traffic by site — ${date}`, text: lines.join("\n") };
}
