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

type EmailMetric = { state: string; pageviews?: number; identifiers?: number; summary: string };
type EmailSite = { name: string; kind: string; values: EmailMetric[] };

function htmlText(value: string | number): string {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

function renderDeliveryHtml(bundles: TrafficReportBundle[], labels: string[], sites: EmailSite[], caveats: string[]) {
  const ink = "#0d1115", muted = "#525a64", gold = "#c8aa72";
  const intervals = labels.map((label) => `<p style="margin:12px 0 0;color:#f0ece4;font-size:16px;line-height:1.6;">${htmlText(label)}</p>`).join("");
  const sections = sites.map((site) => {
    const metrics = site.values.map((metric, index) => {
      const unavailable = metric.pageviews === undefined || (metric.state !== "ready" && metric.pageviews === 0);
      const primary = unavailable
        ? `<p style="margin:8px 0 10px;color:${ink};font-size:21px;font-weight:700;line-height:1.4;">Data not yet available</p>`
        : `<p style="margin:8px 0 4px;color:${ink};font-family:'Courier New',monospace;font-size:38px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.15;">${htmlText(metric.pageviews!.toLocaleString("en-US"))}</p>
           <p style="margin:0 0 12px;color:${muted};font-size:14px;line-height:1.5;">recorded pageviews</p>`;
      // Recorded zero stays a detail, never a large measured-zero claim.
      const recordedDetail = unavailable && metric.pageviews !== undefined
        ? `<p style="margin:0 0 6px;color:${muted};font-size:14px;line-height:1.6;">${htmlText(metric.pageviews)} recorded pageviews; coverage is unverified.</p>` : "";
      return `<tr><td style="padding:${index ? "20px" : "16px"} 0 0;">
        <p style="margin:0;color:${muted};font-size:13px;font-weight:700;line-height:1.6;">${htmlText(labels[index])}</p>
        ${primary}${recordedDetail}
        <p style="margin:0;color:${ink};font-size:15px;line-height:1.6;"><strong>${metric.identifiers === undefined ? "Not collected" : htmlText(metric.identifiers.toLocaleString("en-US"))}</strong> ${metric.identifiers === undefined ? "&mdash; tracked identifiers" : "tracked identifiers"}</p>
        <p style="margin:6px 0 0;color:${muted};font-size:13px;line-height:1.6;">Coverage status: ${htmlText(metric.state)}</p>
      </td></tr>`;
    }).join("");
    return `<tr><td style="padding:30px 24px 32px;border-bottom:1px solid #dce0e4;">
      <h2 style="margin:0;color:${ink};font-size:23px;font-weight:700;line-height:1.3;">${htmlText(site.name)}</h2>
      <p style="margin:7px 0 0;color:${muted};font-size:12px;line-height:1.6;">Route type: ${htmlText(site.kind)}</p>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">${metrics}</table>
    </td></tr>`;
  }).join("");
  const exactRanges = bundles.map(({ period }, index) => `<p style="margin:16px 0 0;color:${muted};font-size:12px;line-height:1.7;">
    <strong>${htmlText(labels[index])}</strong><br>Start (inclusive): ${htmlText(period.range.since)}<br>End (exclusive): ${htmlText(period.range.until)}</p>`).join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>Fina Calle traffic by site</title></head>
<body style="margin:0;padding:0;background-color:#f2f3f5;color:${ink};font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f2f3f5"><tr><td align="center" style="padding:24px 0;">
    <!--[if mso]><table role="presentation" width="640" border="0" cellspacing="0" cellpadding="0" align="center"><tr><td><![endif]-->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="width:100%;max-width:640px;border-collapse:collapse;">
      <tr><td bgcolor="#07090b" style="padding:30px 24px 34px;border-top:5px solid ${gold};">
        <p style="margin:0 0 30px;color:${gold};font-family:'Arial Black',Arial,sans-serif;font-size:18px;font-weight:900;letter-spacing:1px;line-height:1.3;">FINA CALLE</p>
        <h1 style="margin:0;color:#f0ece4;font-size:34px;font-weight:700;line-height:1.15;">Traffic by site</h1>
        ${intervals}<p style="margin:8px 0 0;color:#b9c0c6;font-size:13px;line-height:1.6;">America/New_York &middot; Complete reporting periods</p>
      </td></tr>
      <tr><td style="padding:24px 24px 0;">
        <p style="margin:0 0 8px;color:${ink};font-size:15px;font-weight:700;line-height:1.6;">Coverage is unverified.</p>
        <p style="margin:0;color:${muted};font-size:14px;line-height:1.7;">A recorded zero is not verified zero traffic; missing/unavailable data is not zero.</p>
      </td></tr>
      ${sections}
      <tr><td style="padding:30px 24px 34px;">
        <h2 style="margin:0 0 12px;color:${ink};font-size:19px;line-height:1.4;">About these numbers</h2>
        ${caveats.map((line) => `<p style="margin:0 0 14px;color:${muted};font-size:14px;line-height:1.7;">${htmlText(line)}</p>`).join("")}
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:22px;"><tr><td bgcolor="${gold}" style="mso-padding-alt:14px 18px;">
          <a href="https://finacalleos.com/customers/traffic" style="display:inline-block;padding:14px 18px;color:${ink};font-size:14px;font-weight:700;line-height:1.6;text-decoration:underline;">Open your private dashboard</a>
        </td></tr></table>
        ${exactRanges}
      </td></tr>
    </table>
    <!--[if mso]></td></tr></table><![endif]-->
  </td></tr></table>
</body></html>`;
}

// One shared set of per-site values feeds HTML and plain text. Presentation only;
// independently queried daily/weekly intervals are never added together.
export function renderTrafficDeliveryReport(bundles: TrafficReportBundle[]) {
  if (bundles.length < 1 || bundles.length > 2 ||
    (bundles.length === 2 && (bundles[0].period.kind !== "daily" || bundles[1].period.kind !== "weekly" ||
      bundles[0].period.last !== bundles[1].period.last))) throw new Error("INVALID_DELIVERY_PERIODS");
  for (const { period, reports } of bundles) renderTrafficPeriodReport(period, reports);
  const labels = bundles.map(({ period }) => period.kind === "daily" ? `Yesterday ${period.first}` : `Week ${period.first} through ${period.last}`);
  const sites: EmailSite[] = TRAFFIC_SITES.map((site) => ({
    name: site.name, kind: site.kind,
    values: bundles.map(({ reports }) => {
      const report = reports.find((row) => row.siteId === site.id)!;
      const pageviews = report.state === "ready" ? report.pageviews : report.observedPageviews;
      const identifiers = report.identifiedPageviews ? report.state === "ready" ? report.visitors : report.observedIdentifiers : undefined;
      return { state: report.state, pageviews, identifiers,
        summary: pageviews === undefined ? `${report.state}: unavailable` :
          `${pageviews} recorded pageviews; ${identifiers ?? "uncollected"} tracked identifiers; ${report.state}` };
    }),
  }));
  const caveats = [
    "Each interval is queried independently; overlapping daily/weekly counts are not added.",
    "Coverage is unverified. A recorded zero is not verified zero traffic; missing/unavailable data is not zero.",
    "Tracked identifiers are not people. Anonymous first-party pageviews have no persistent identifier.",
    "No combined cross-brand distinct total or physical QR-scan claim.",
  ];
  const lines = ["Production website traffic - America/New_York",
    ...bundles.map(({ period }, index) => `${labels[index]}: [${period.range.since}, ${period.range.until})`), ""];
  for (const site of sites) {
    lines.push(`${site.name} (${site.kind})`, ...site.values.map((metric, index) =>
      `${labels[index]}: ${metric.pageviews === undefined || (metric.state !== "ready" && metric.pageviews === 0) ? "Data not yet available. " : ""}${metric.summary}`), "");
  }
  lines.push(...caveats, "Private dashboard: https://finacalleos.com/customers/traffic");
  const subjectPeriod = bundles.map(({ period }) => period.kind === "daily" ? period.first : `week ${period.first} through ${period.last}`).join(" + ");
  return { subject: `Fina Calle traffic by site - ${subjectPeriod}`, text: lines.join("\n"),
    html: renderDeliveryHtml(bundles, labels, sites, caveats) };
}
