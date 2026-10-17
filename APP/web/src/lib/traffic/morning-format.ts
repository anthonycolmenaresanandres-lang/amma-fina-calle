import type { TrafficReport } from "./site-traffic";
import { calendarRange, type TrafficDeliveryPeriod } from "./date";
import { ALL_TRAFFIC_SITES as TRAFFIC_SITES } from "./sites";

export function renderMorningReport(date: string, reports: TrafficReport[]) {
  return renderTrafficPeriodReport({ kind: "daily", first: date, last: date, range: calendarRange(date, date) }, reports);
}

export function renderTrafficPeriodReport(period: TrafficDeliveryPeriod, reports: TrafficReport[]) {
  const date = period.kind === "weekly" ? `week ${period.first} through ${period.last}` : period.first;
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
      if (report.observedPageviews !== undefined) {
        lines.push(`Recorded pageviews (coverage ${report.state}; zero is not a verified measured zero): ${report.observedPageviews}`);
        lines.push(`Distinct tracked identifiers within this whole period (not people): ${report.identifiedPageviews ? report.observedIdentifiers ?? "unverified" : "not collected"}`);
      }
      if (report.state === "empty") lines.push(`Last verified pageview: ${report.lastObservedAt}`);
    }
    lines.push("");
  }
  lines.push("Only verified production hostnames and explicitly listed public pages are included.",
    "Tracked identifiers are not identifiable people. Anonymous first-party collection measures pageviews only, not physical QR scans. Configuration probes do not verify ingestion or prove zero traffic.",
    "Private dashboard: https://finacalleos.com/customers/traffic");
  return { subject: `Fina Calle traffic by site — ${date}`, text: lines.join("\n") };
}

export type TrafficReportBundle = { period: TrafficDeliveryPeriod; reports: TrafficReport[] };

// Compact per-site update: overlapping periods stay separate and are never added.
export function renderTrafficDeliveryReport(bundles: TrafficReportBundle[]) {
  if (bundles.length < 1 || bundles.length > 2 ||
    (bundles.length === 2 && (bundles[0].period.kind !== "daily" || bundles[1].period.kind !== "weekly" ||
      bundles[0].period.last !== bundles[1].period.last))) throw new Error("INVALID_DELIVERY_PERIODS");
  for (const { period, reports } of bundles) renderTrafficPeriodReport(period, reports); // registry completeness
  const labels = bundles.map(({ period }) => period.kind === "daily" ? `Yesterday ${period.first}` : `Week ${period.first} through ${period.last}`);
  const lines = [
    "Production website traffic — America/New_York",
    ...bundles.map(({ period }, index) => `${labels[index]}: [${period.range.since}, ${period.range.until})`),
    "",
    `Site | ${labels.join(" | ")}`,
  ];
  for (const site of TRAFFIC_SITES) {
    const values = bundles.map(({ reports }) => {
      const report = reports.find((row) => row.siteId === site.id)!;
      const pageviews = report.state === "ready" ? report.pageviews : report.observedPageviews;
      const identifiers = report.identifiedPageviews ? report.state === "ready" ? report.visitors : report.observedIdentifiers : undefined;
      return pageviews === undefined ? `${report.state}: unavailable` :
        `${pageviews} recorded pageviews; ${identifiers ?? "uncollected"} tracked identifiers; ${report.state}`;
    });
    lines.push(`${site.name} (${site.kind}) | ${values.join(" | ")}`);
  }
  lines.push("", "Each interval is queried independently; overlapping daily/weekly counts are not added.",
    "Coverage is unverified. A recorded zero is not verified zero traffic; missing/unavailable data is not zero.",
    "Tracked identifiers are not people. Anonymous first-party pageviews have no persistent identifier.",
    "No combined cross-brand distinct total or physical QR-scan claim.",
    "Private dashboard: https://finacalleos.com/customers/traffic");
  const subjectPeriod = bundles.map(({ period }) => period.kind === "daily" ? period.first : `week ${period.first} through ${period.last}`).join(" + ");
  return { subject: `Fina Calle traffic by site - ${subjectPeriod}`, text: lines.join("\n") };
}
