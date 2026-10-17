
// Offline-only. Synthetic inputs and mocked fetch; no environment files,
// real credentials, HTTP traffic or provider sends.
import assert from "node:assert/strict";
import { triggerMail, mailTriggerDiagnostic } from "./traffic-mail-trigger.mjs";
const fixtureSecret = "synthetic-mail-trigger-at-least-32-characters";
const env = { TRAFFIC_MAIL_TRIGGER_SECRET: fixtureSecret, TRAFFIC_MAIL_MODE: "test" };
let groups = 0;
async function failure(fetcher, overrides = {}) {
  let calls = 0, error;
  try { await triggerMail({ ...env, ...overrides }, (...args) => { calls++; return fetcher(...args); }); }
  catch (caught) { error = caught; }
  assert(error, "Failure fixture must reject");
  return { calls, diagnostic: mailTriggerDiagnostic(error) };
}
const invalid = await failure(() => { throw Error("Must never call network"); }, { TRAFFIC_MAIL_TRIGGER_SECRET: "too-short" });
assert.equal(invalid.calls, 0);
assert.deepEqual(invalid.diagnostic, { code: "trigger_configuration_invalid", phase: "before_request" }); groups++;
for (const [status, reason] of [[401, "unauthorized"], [503, "mail_trigger_not_configured"],
  [503, "report_data_unavailable"], [503, "email_not_configured"], [503, "invalid_report_sender"]]) {
  const result = await failure(async () => Response.json({ ok: false, reason, credential: "private-fixture-never-output" }, { status }));
  assert.equal(result.calls, 1);
  assert.deepEqual(result.diagnostic, { code: "trigger_http_failure", phase: "before_provider", status, reason });
  assert(!JSON.stringify(result.diagnostic).includes("private-fixture")); groups++;
}
for (const reason of ["email_http_403", "email_http_429", "email_http_500"]) {
  const result = await failure(async () => Response.json({ ok: false, reason }, { status: 502 }));
  assert.equal(result.calls, 1); assert.equal(result.diagnostic.phase, "provider_response");
  assert.equal(result.diagnostic.reason, reason); groups++;
}
for (const reason of ["delivery_outcome_unconfirmed", "report_delivery_unconfirmed"]) {
  const result = await failure(async () => Response.json({ ok: false, reason }, { status: 502 }));
  assert.equal(result.calls, 1); assert.equal(result.diagnostic.phase, "unknown"); groups++;
}
for (const response of [
  new Response("private provider details", { status: 401 }),
  Response.json({ reason: "unauthorized\nBearer private-fixture", token: "private-fixture" }, { status: 401 }),
  new Response("private-fixture".repeat(1000), { status: 503 }),
]) {
  const result = await failure(async () => response);
  assert.equal(result.calls, 1); assert.equal(result.diagnostic.phase, "unknown");
  assert(!("reason" in result.diagnostic)); assert(!JSON.stringify(result.diagnostic).includes("private")); groups++;
}
const transport = await failure(async () => { throw Error("Authorization: private-fixture"); });
assert.equal(transport.calls, 1);
assert.deepEqual(transport.diagnostic, { code: "transport_outcome_unconfirmed", phase: "unknown" }); groups++;
assert.deepEqual(mailTriggerDiagnostic(Error("private-fixture")), { code: "outcome_unconfirmed", phase: "unknown" }); groups++;
const malformed = await failure(async () => Response.json({ ok: true }));
assert.equal(malformed.calls, 1); assert.equal(malformed.diagnostic.code, "response_outcome_unconfirmed"); groups++;
let acceptedCalls = 0;
await triggerMail({ ...env, TRAFFIC_MAIL_TRIGGER_SECRET: " \n" + fixtureSecret + "\n " }, async (url, options) => {
  acceptedCalls++; assert.equal(url, "https://finacalleos.com/api/internal/traffic/morning");
  assert.equal(options.headers.Authorization, "Bearer " + fixtureSecret);
  assert.deepEqual(JSON.parse(options.body), { mode: "test" }); assert.equal(options.redirect, "error");
  return Response.json({ ok: true, accepted: true });
});
assert.equal(acceptedCalls, 1); groups++;
console.log(`PASS ${groups} offline mail diagnostic groups: safe phase/status codes, bounded bodies, matching token normalization and no retries; no live requests.`);
