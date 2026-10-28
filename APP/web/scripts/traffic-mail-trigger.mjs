
// Native scheduler client. Fixed destination, one request, no automatic retry.
// Diagnostics contain only reviewed codes/statuses; never headers, keys,
// request/response bodies, provider messages or raw exception text.
const endpoint = "https://finacalleos.com/api/internal/traffic/morning";
const reasons = new Set([
  "unauthorized", "mail_trigger_not_configured", "unsupported_query",
  "invalid_request", "invalid_schedule", "invalid_mode", "test_delivery_disabled",
  "schedule_disabled_until_test_readback", "outside_delivery_window",
  "report_data_unavailable", "email_delivery_disabled", "email_not_configured",
  "invalid_report_recipient", "invalid_report_sender",
  "delivery_outcome_unconfirmed", "report_delivery_unconfirmed",
  "not_due", "inactive_dst_slot", "before_delivery_window", "delivery_window_missed",
  "invalid_delivery_date", "recovery_not_authorized", "due_report_not_accepted",
  "delivery_ledger_unavailable", "delivery_reconciliation_required", "delivery_retry_exhausted", "invalid_frozen_payload",
]);
const providerErrors = new Set(["invalid_idempotency_key", "validation_error", "invalid_api_key"]);
const beforeProvider = new Set([
  "unauthorized", "mail_trigger_not_configured", "unsupported_query", "invalid_request",
  "invalid_schedule", "invalid_mode", "test_delivery_disabled",
  "schedule_disabled_until_test_readback", "report_data_unavailable",
  "email_delivery_disabled", "email_not_configured", "invalid_report_recipient",
  "invalid_report_sender",
  "invalid_delivery_date", "recovery_not_authorized", "delivery_window_missed", "due_report_not_accepted", "delivery_ledger_unavailable",
]);
class TriggerFailure extends Error {
  constructor(code, phase, status, reason, providerError) {
    super("Traffic mail trigger unsuccessful");
    this.code = code; this.phase = phase; this.status = status; this.reason = reason; this.providerError = providerError;
  }
}
export function mailTriggerDiagnostic(error) {
  if (!(error instanceof TriggerFailure)) return { code: "outcome_unconfirmed", phase: "unknown" };
  return { code: error.code, phase: error.phase,
    ...(Number.isInteger(error.status) && error.status >= 100 && error.status <= 599 ? { status: error.status } : {}),
    ...(error.phase === "provider_response" && providerErrors.has(error.providerError) ? { providerError: error.providerError } : {}),
    ...(typeof error.reason === "string" && (reasons.has(error.reason) || /^email_http_[45]\d{2}$/.test(error.reason)) ? { reason: error.reason } : {}),
  };
}
async function boundedResult(response) {
  try {
    const reader = response.body?.getReader();
    if (!reader) return null;
    const chunks = []; let bytes = 0;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 2048) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    const text = Buffer.concat(chunks).toString("utf8");
    const result = JSON.parse(text);
    if (!result || typeof result !== "object" || Array.isArray(result)) return null;
    const reason = typeof result.reason === "string" &&
      (reasons.has(result.reason) || /^email_http_[45]\d{2}$/.test(result.reason)) ? result.reason : undefined;
    return { ok: result.ok === true, accepted: result.accepted === true,
      skipped: result.skipped === true, reason,
      providerError: reason === "email_http_400" && providerErrors.has(result.providerError) ? result.providerError : undefined };
  } catch { return null; }
}
export async function triggerMail(env = process.env, fetcher = fetch) {
  // Match the server's existing normalization; no credential is printed.
  const secret = env.TRAFFIC_MAIL_TRIGGER_SECRET?.trim();
  const mode = env.TRAFFIC_MAIL_MODE;
  if (!secret || secret.length < 32 || secret.length > 512 || !["test", "scheduled", "check", "recovery"].includes(mode)) {
    throw new TriggerFailure("trigger_configuration_invalid", "before_request");
  }
  const body = mode === "test" ? { mode } : { mode, deliveryDate: env.TRAFFIC_MAIL_DELIVERY_DATE,
    ...(mode === "scheduled" ? { schedule: env.TRAFFIC_MAIL_SCHEDULE } : {}) };
  if (mode !== "test" && !/^\d{4}-\d{2}-\d{2}$/.test(body.deliveryDate ?? "")) throw new TriggerFailure("delivery_date_invalid", "before_request");
  if (mode === "scheduled" && !["0 12 * * *", "0 13 * * *", "17 12 * * *", "17 13 * * *", "17 16 * * *", "17 20 * * *"].includes(body.schedule)) {
    throw new TriggerFailure("schedule_invalid", "before_request");
  }
  let response;
  try {
    response = await fetcher(endpoint, {
      method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify(body), signal: AbortSignal.timeout(45000), redirect: "error",
    });
  } catch { throw new TriggerFailure("transport_outcome_unconfirmed", "unknown"); }
  const result = await boundedResult(response);
  if (!response.ok) {
    const phase = beforeProvider.has(result?.reason) ? "before_provider" :
      /^email_http_[45]\d{2}$/.test(result?.reason ?? "") ? "provider_response" : "unknown";
    throw new TriggerFailure("trigger_http_failure", phase, response.status, result?.reason, result?.providerError);
  }
  if (result?.ok && result.skipped && ["not_due", "inactive_dst_slot", "before_delivery_window"].includes(result.reason)) {
    console.log("Traffic mail intentional skip:", result.reason);
  } else if (result?.ok && result.accepted) {
    console.log("Aggregate email acceptance recorded; inbox delivery requires Gmail readback. No blind retry.");
  } else throw new TriggerFailure("response_outcome_unconfirmed", "unknown", response.status, result?.reason);
}
if (process.argv[1]?.replaceAll("\\", "/").endsWith("/traffic-mail-trigger.mjs")) {
  triggerMail().catch(error => {
    console.error("Traffic mail trigger diagnostic:", JSON.stringify(mailTriggerDiagnostic(error)));
    console.error("No automatic retry. Inspect before another authorized attempt.");
    process.exitCode = 1;
  });
}
