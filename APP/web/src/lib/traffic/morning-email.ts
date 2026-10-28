import "server-only";

import type { TrafficReport } from "./site-traffic";
import type { TrafficDeliveryPeriod } from "./date";
import { renderTrafficDeliveryReport, type TrafficReportBundle } from "./morning-format";
import { getDeliveryLedger, trafficDeliveryKey, type DeliveryLedger } from "./delivery-ledger";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
export const VERIFIED_OWNER_EMAIL = "anthonycolmenaresanandres@gmail.com";
const VERIFIED_SENDER_DOMAIN = "finacalleos.com";
// Stable per presentation revision, test-only. Never use a random retry key.
const PREVIEW_REVISION = "spaced-html-20261017-v1";

function validSender(from: string): boolean {
  return /^(?:[^<>\r\n]+ <)?[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@finacalleos\.com>?$/i.test(from) &&
    !from.includes(",") && (!from.includes("<") || from.endsWith(">")) &&
    from.replace(/>$/, "").toLowerCase().endsWith("@" + VERIFIED_SENDER_DOMAIN);
}

type ProviderValidationCategory = "invalid_idempotency_key" | "validation_error" | "invalid_api_key";
type DeliveryResult = { sent: boolean; deduplicated?: boolean; reason?: string; providerError?: ProviderValidationCategory };

async function providerAcceptanceId(response: Response): Promise<string | undefined> {
  try {
    const reader = response.body?.getReader();
    if (!reader) return undefined;
    const chunks: Uint8Array[] = []; let bytes = 0;
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      bytes += value.byteLength;
      if (bytes > 2048) { await reader.cancel(); return undefined; }
      chunks.push(value);
    }
    const id = JSON.parse(Buffer.concat(chunks).toString("utf8"))?.id;
    return typeof id === "string" && /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(id) ? id : undefined;
  } catch { return undefined; }
}

export async function trafficDeliveryStatus(periods: TrafficDeliveryPeriod[]) {
  return getDeliveryLedger().status(trafficDeliveryKey(periods));
}

// Return fixed categories only. Never retain or expose arbitrary provider text,
// payloads or headers. A provider 400 alone does not identify the invalid field.
async function providerValidationCategory(response: Response): Promise<ProviderValidationCategory | undefined> {
  if (response.status !== 400) return undefined;
  try {
    const reader = response.body?.getReader();
    if (!reader) return undefined;
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 2048) { await reader.cancel(); return undefined; }
      chunks.push(value);
    }
    const result: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!result || typeof result !== "object" || Array.isArray(result)) return undefined;
    const error = result as { name?: unknown; message?: unknown };
    if (error.name === "invalid_idempotency_key") return "invalid_idempotency_key";
    if (error.name !== "validation_error") return undefined;
    // Resend documents this exact fixed message for invalid Authorization.
    // Do not include its message or infer which stored value caused it.
    return error.message === "API key is invalid" ? "invalid_api_key" : "validation_error";
  } catch { return undefined; }
}

/** Names/readiness only. Never return credentials or provider response payloads. */
export function morningEmailStatus() {
  const missing = ["TRAFFIC_RESEND_API_KEY", "TRAFFIC_FROM_EMAIL", "TRAFFIC_MORNING_REPORT_EMAIL"]
    .filter((key) => !process.env[key]?.trim());
  const recipientValid = process.env.TRAFFIC_MORNING_REPORT_EMAIL?.trim().toLowerCase() === VERIFIED_OWNER_EMAIL;
  const senderValid = validSender(process.env.TRAFFIC_FROM_EMAIL?.trim() ?? "");
  return { configured: missing.length === 0 && recipientValid && senderValid,
    enabled: process.env.VERCEL_ENV === "production" && process.env.TRAFFIC_EMAIL_ENABLED === "true",
    missing, recipientValid, senderValid };
}

export async function sendTrafficPeriodReport(
  period: TrafficDeliveryPeriod, reports: TrafficReport[], mode: "test" | "scheduled",
): Promise<DeliveryResult> {
  return sendTrafficDeliveryReport([{ period, reports }], mode);
}

export async function sendTrafficDeliveryReport(
  bundles: TrafficReportBundle[], mode: "test" | "scheduled",
): Promise<DeliveryResult> {
  if (!morningEmailStatus().enabled) return { sent: false, reason: "email_delivery_disabled" };
  if (mode === "test" && process.env.TRAFFIC_EMAIL_TEST_ENABLED !== "true") return { sent: false, reason: "test_delivery_disabled" };
  if (mode === "scheduled" && (process.env.TRAFFIC_SCHEDULE_ENABLED !== "true" ||
    process.env.TRAFFIC_EMAIL_TEST_READBACK_CONFIRMED !== "true")) return { sent: false, reason: "schedule_disabled_until_test_readback" };
  const apiKey = process.env.TRAFFIC_RESEND_API_KEY?.trim();
  const from = process.env.TRAFFIC_FROM_EMAIL?.trim();
  if (!apiKey || !from || !process.env.TRAFFIC_MORNING_REPORT_EMAIL?.trim()) return { sent: false, reason: "email_not_configured" };
  if (!morningEmailStatus().recipientValid) return { sent: false, reason: "invalid_report_recipient" };
  if (!validSender(from)) return { sent: false, reason: "invalid_report_sender" };
  const content = renderTrafficDeliveryReport(bundles);
  const idempotencyKey = `${trafficDeliveryKey(bundles.map(b => b.period))}${mode === "test" ? `-preview-${PREVIEW_REVISION}` : ""}`;
  let payload = JSON.stringify({ from, to: [VERIFIED_OWNER_EMAIL], subject: content.subject, text: content.text, html: content.html });
  let ledger: DeliveryLedger | undefined, attemptId: string | undefined;
  if (mode === "scheduled") {
    try {
      ledger = getDeliveryLedger();
      const existing = await ledger.status(idempotencyKey);
      if (existing?.state === "accepted") return { sent: true, deduplicated: true };
      if (existing && existing.state !== "pending") return { sent: false, reason: "delivery_reconciliation_required" };
      await ledger.freeze(idempotencyKey, payload);
      const claim = await ledger.claim(idempotencyKey);
      if (!claim) {
        const status = await ledger.status(idempotencyKey);
        return status?.state === "accepted" ? { sent: true, deduplicated: true } :
          { sent: false, reason: status?.state === "pending" ? "delivery_retry_exhausted" : "delivery_reconciliation_required" };
      }
      attemptId = claim.attemptId;
      payload = claim.payload; // exact frozen bytes, even if aggregates changed
      const frozen = JSON.parse(payload);
      if (frozen.to?.length !== 1 || frozen.to[0] !== VERIFIED_OWNER_EMAIL || !validSender(frozen.from ?? "")) {
        await ledger.finish(idempotencyKey, attemptId, "rejected", "invalid_frozen_payload");
        return { sent: false, reason: "invalid_frozen_payload" };
      }
    } catch { return { sent: false, reason: "delivery_ledger_unavailable" }; }
  }
  // One provider attempt per invocation. Only an explicit 429 can release the
  // claim for a later bounded attempt. Sending/unconfirmed claims never expire.
  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: payload,
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const providerError = await providerValidationCategory(response);
      if (ledger && attemptId) {
        const state = response.status === 429 ? "pending" : response.status >= 400 && response.status < 500 && response.status !== 409 ? "rejected" : "unconfirmed";
        await ledger.finish(idempotencyKey, attemptId, state, `email_http_${response.status}`);
      }
      return { sent: false, reason: response.status === 409 ? "delivery_outcome_unconfirmed" : `email_http_${response.status}`,
        ...(providerError ? { providerError } : {}) };
    }
    if (ledger && attemptId) await ledger.finish(idempotencyKey, attemptId, "accepted", null, await providerAcceptanceId(response));
    // A provider success means acceptance, not confirmed inbox delivery.
    return { sent: true };
  } catch {
    if (ledger && attemptId) {
      try { await ledger.finish(idempotencyKey, attemptId, "unconfirmed", "delivery_outcome_unconfirmed"); } catch { /* sending remains fenced for reconciliation */ }
    }
    // A timeout could follow provider acceptance. Never automatically retry it.
    return { sent: false, reason: "delivery_outcome_unconfirmed" };
  }
}
