import type { TrafficReport } from "./site-traffic";
import { TRAFFIC_SITES } from "./sites";

export function renderMorningReport(date: string, reports: TrafficReport[]) {
  if (reports.length !== TRAFFIC_SITES.length ||
      TRAFFIC_SITES.some((site) => reports.filter((report) => report.siteId === site.id && report.state === "ready").length !== 1)) {
    throw new Error("INCOMPLETE_SITE_REPORTS");
  }
  const ready = reports as Extract<TrafficReport, { state: "ready" }>[];
  const lines = [
    `Production website traffic — ${date} (America/New_York)`,
    "Source: verified Vercel Web Analytics drain pageviews since activation. Sites are reported separately; there is no combined visitor or pageview total.",
    "",
  ];
  for (const report of ready) {
    lines.push(report.siteName, `Domains: ${report.domains.join(", ")}`,
      `Unique visitors: ${report.visitors.toLocaleString("en-US")}`,
      `Pageviews: ${report.pageviews.toLocaleString("en-US")}`, "");
  }
  lines.push("Only verified production hostnames and explicitly listed public pages are included.",
    "This measures website visits, not guaranteed physical QR scans.",
    "Private dashboard: https://finacalleos.com/customers/traffic");
  return { subject: `Fina Calle traffic by site — ${date}`, text: lines.join("\n") };
}
