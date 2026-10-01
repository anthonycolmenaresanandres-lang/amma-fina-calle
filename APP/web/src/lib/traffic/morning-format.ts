import type { TrafficReport } from "./site-traffic";
import { TRAFFIC_SITES } from "./sites";

export function renderMorningReport(date: string, reports: TrafficReport[]) {
  if (reports.length !== TRAFFIC_SITES.length ||
      TRAFFIC_SITES.some((site) => reports.filter((report) => report.siteId === site.id).length !== 1)) {
    throw new Error("INCOMPLETE_SITE_REPORTS");
  }
  const lines = [
    `Production website traffic — ${date} (America/New_York)`,
    "Source: verified Vercel Web Analytics drain pageviews received since collection began. Sites are reported separately; there is no combined visitor or pageview total.",
    "",
  ];
  for (const site of TRAFFIC_SITES) {
    const report = reports.find((item) => item.siteId === site.id)!;
    lines.push(report.siteName, `Domains: ${report.domains.join(", ")}`);
    if (report.state === "ready") {
      lines.push(`Distinct tracked devices: ${report.visitors.toLocaleString("en-US")}`,
        `Pageviews: ${report.pageviews.toLocaleString("en-US")}`);
      if (Date.parse(report.firstObservedAt) > Date.parse(report.since)) {
        lines.push(`First verified pageview: ${report.firstObservedAt} (earlier traffic was not backfilled)`);
      }
    } else {
      lines.push(`Status: ${report.reason}`);
      if (report.state === "empty") lines.push(`Last verified pageview: ${report.lastObservedAt}`);
    }
    lines.push("");
  }
  lines.push("Only verified production hostnames and explicitly listed public pages are included.",
    "Device counts use anonymized Vercel identifiers, not identifiable people. This measures website visits, not guaranteed physical QR scans.",
    "Private dashboard: https://finacalleos.com/customers/traffic");
  return { subject: `Fina Calle traffic by site — ${date}`, text: lines.join("\n") };
}
