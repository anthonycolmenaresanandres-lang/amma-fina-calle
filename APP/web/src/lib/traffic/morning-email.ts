import "server-only";

import type { TrafficReport } from "./site-traffic";
import { renderMorningReport } from "./morning-format";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Readiness metadata only: never return a credential or email address. */
export function morningEmailStatus() {
  const missing = ["TRAFFIC_RESEND_API_KEY", "TRAFFIC_FROM_EMAIL", "TRAFFIC_MORNING_REPORT_EMAIL"]
    .filter((key) => !process.env[key]?.trim());
  const recipientValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.TRAFFIC_MORNING_REPORT_EMAIL?.trim() ?? "");
  return { configured: missing.length === 0 && recipientValid, missing, recipientValid };
}

export async function sendMorningReport(date: string, reports: TrafficReport[]): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.TRAFFIC_RESEND_API_KEY?.trim();
  const from = process.env.TRAFFIC_FROM_EMAIL?.trim();
  const to = process.env.TRAFFIC_MORNING_REPORT_EMAIL?.trim();
  if (!apiKey || !from || !to) return { sent: false, reason: "email_not_configured" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return { sent: false, reason: "invalid_report_recipient" };
  const content = renderMorningReport(date, reports);
  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `fina-calle-traffic-${date}`,
    },
    body: JSON.stringify({ from, to: [to], subject: content.subject, text: content.text }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) return { sent: false, reason: `email_http_${response.status}` };
  return { sent: true };
}
