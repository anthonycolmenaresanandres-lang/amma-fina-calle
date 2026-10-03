// Synthetic-only regression checks. No provider socket, paid model, real recipient or .env.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { mkdtempSync, writeFileSync, readFileSync, unlinkSync, rmdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { CallRecord, Draft } from "./types";

const temp = mkdtempSync(path.join(os.tmpdir(), "voice-reliability-"));
const snapshot = path.join(temp, "store.json");
const tenants = path.join(temp, "tenants.json");
const alphaUrl = "https://offline.invalid/alpha";
const betaUrl = "https://offline.invalid/beta";
for (const key of Object.keys(process.env)) {
  if (/^(OPENAI_|TWILIO_|CALCOM_|SQUARE_|WEBHOOK_|STAFF_|STORE_|DEFAULT_TENANT_)/.test(key)) delete process.env[key];
}
process.env.DOTENV_CONFIG_PATH = path.join(temp, "no-env");
process.env.TENANTS_FILE = tenants;
process.env.STORE_SNAPSHOT = snapshot;
process.env.BOOKING_CONNECTOR = "mock";
writeFileSync(tenants, JSON.stringify([
  { id: "alpha", phoneNumbers: ["+15550000001"], connector: "proposeconfirm",
    business: { name: "Synthetic Alpha" }, notify: { staffWebhookUrl: alphaUrl } },
  { id: "beta", phoneNumbers: ["+15550000002"], connector: "mock",
    business: { name: "Synthetic Beta" }, notify: { staffWebhookUrl: betaUrl } },
]));
const legacy: CallRecord = { callId: "legacy", tenantId: "alpha", status: "ended", startedAt: 1, endedAt: 2 };
writeFileSync(snapshot, JSON.stringify({ calls: { legacy }, drafts: {}, messages: [],
  audit: [{ auditId: "old-summary", entityType: "call", entityId: "legacy", eventType: "call.summary", after: { outcome: "missed" }, at: 2 }] }));

let checks = 0;
async function check(name: string, fn: () => unknown | Promise<unknown>) {
  await fn(); checks++; console.log("PASS " + name);
}
type Mode = number | "network" | "timeout" | "held";
let mode: Mode = 204;
const requests: { url: string; init?: RequestInit }[] = [];
let release: ((response: Response) => void) | undefined;
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = String(input);
  assert.ok(url === alphaUrl || url === betaUrl, "Unexpected destination blocked in offline tests");
  requests.push({ url, init });
  if (mode === "network") throw new Error("synthetic network failure containing a private destination");
  if (mode === "timeout") {
    return new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true }));
  }
  if (mode === "held") return new Promise<Response>((resolve) => { release = resolve; });
  return new Response(null, { status: mode });
};

try {
  const { store, createStore } = await import("./store");
  const { notifyStaff } = await import("./notify");
  const { takeMessage, confirmBooking, finalizeCall, summarizeCall } = await import("./orchestrator");
  const { getTenantById } = await import("./tenant");
  const { RealtimeSession, buildRealtimeSessionUpdate, buildGreetingResponse } = await import("./realtime");
  const { ReplyAudioEvidence } = await import("./callActivity");
  const { BargeInGate } = await import("./soundgate");
  const alpha = getTenantById("alpha")!;
  const beta = getTenantById("beta")!;

  await check("old snapshots load without notification fields; ambiguous history stays unknown", () => {
    assert.equal(store.stats("alpha").unknownCalls, 1);
    assert.equal(store.stats("alpha").missedCalls, 0);
    assert.equal(store.stats("alpha").notificationRecords, 0);
    assert.equal(summarizeCall("legacy").outcome, "unknown");
    assert.equal(JSON.parse(readFileSync(snapshot, "utf8")).audit[0].after.outcome, "missed");
  });
  await check("missing and whitespace-only destinations never attempt a send", async () => {
    const before = requests.length;
    assert.deepEqual(await notifyStaff("synthetic"), { status: "not_configured" });
    assert.deepEqual(await notifyStaff("synthetic", "  "), { status: "not_configured" });
    assert.equal(requests.length, before);
  });
  await check("200, 202 and 204 mean endpoint acceptance only; payload contract is preserved", async () => {
    for (const status of [200, 202, 204]) {
      mode = status;
      assert.deepEqual(await notifyStaff("synthetic message", alphaUrl), { status: "accepted", httpStatus: status });
      const req = requests.at(-1)!;
      assert.equal(req.init?.method, "POST");
      assert.equal(req.init?.redirect, "manual");
      assert.deepEqual(JSON.parse(String(req.init?.body)), { text: "synthetic message" });
    }
  });
  await check("redirects, rejected requests and server errors never count as acceptance", async () => {
    for (const status of [302, 400, 403, 429, 500, 503]) {
      mode = status;
      assert.deepEqual(await notifyStaff("synthetic", alphaUrl), { status: "failed", failure: "http_error", httpStatus: status });
    }
  });
  await check("network failures are explicit and do not expose exception/destination content", async () => {
    mode = "network";
    assert.deepEqual(await notifyStaff("synthetic", alphaUrl), { status: "failed", failure: "network_error" });
  });
  await check("a stalled webhook aborts after the bounded timeout without retry", async () => {
    mode = "timeout"; const before = requests.length;
    assert.deepEqual(await notifyStaff("synthetic", alphaUrl), { status: "failed", failure: "timeout" });
    assert.equal(requests.length, before + 1);
  });
  await check("message and pending delivery state are captured before awaiting a failed webhook", async () => {
    mode = "held";
    const call = store.createCall(undefined, alpha.id);
    const result = takeMessage(alpha, call.callId, { name: "Synthetic" }, "offline callback request");
    assert.equal(store.messagesForCall(call.callId).length, 1);
    assert.equal(store.notificationsForCall(call.callId)[0]?.result.status, "pending");
    const pendingReload = createStore(snapshot);
    assert.equal(pendingReload.notificationsForCall(call.callId)[0]?.result.status, "pending");
    release!(new Response(null, { status: 500 }));
    const captured = await result;
    assert.match(captured.text, /recorded your message/);
    assert.match(captured.text, /could not notify staff/);
    assert.doesNotMatch(captured.text, /someone will|team will|will follow up/i);
    assert.equal(store.notificationsForCall(call.callId)[0]?.result.status, "failed");
    assert.equal(store.messagesForCall(call.callId).length, 1);
    await finalizeCall(call.callId);
    assert.equal(summarizeCall(call.callId).outcome, "message");
  });
  await check("unconfigured capture offers direct contact without claiming a callback", async () => {
    const call = store.createCall(undefined, alpha.id);
    const before = requests.length;
    const result = await takeMessage({ ...alpha, notify: { staffWebhookUrl: "" } }, call.callId, {}, "synthetic");
    assert.match(result.text, /cannot notify staff from this line/);
    assert.equal(requests.length, before);
    assert.equal(store.notificationsForCall(call.callId)[0]?.result.status, "not_configured");
  });
  await check("accepted alerts retain tenant destination and do not imply human receipt", async () => {
    mode = 202;
    const call = store.createCall(undefined, beta.id);
    const result = await takeMessage(beta, call.callId, {}, "synthetic beta message");
    assert.equal(requests.at(-1)?.url, betaUrl);
    assert.match(result.text, /cannot confirm anyone has read it or promise a callback/);
    assert.equal(store.notificationsForCall(call.callId)[0]?.result.status, "accepted");
    assert.equal(store.stats("alpha").notificationsAccepted, 0);
    assert.equal(store.stats("beta").notificationsAccepted, 1);
  });
  await check("pending bookings and idempotent replays stay unconfirmed and do not resend alerts", async () => {
    mode = 503;
    const call = store.createCall(undefined, alpha.id);
    const draft: Draft = { draftId: store.id(), callId: call.callId, tenantId: alpha.id, service: "Synthetic",
      slot: { startIso: "2030-01-08T14:00:00Z", endIso: "2030-01-08T15:00:00Z" }, customer: {},
      status: "open", createdAt: Date.now(), expiresAt: Date.now() + 60000 };
    store.putDraft(draft);
    const first = await confirmBooking(draft.draftId);
    const before = requests.length;
    const replay = await confirmBooking(draft.draftId);
    assert.equal(replay.idempotent, true);
    assert.equal(replay.bookingRef, first.bookingRef);
    assert.match(first.text, /not a confirmed booking/);
    assert.match(replay.text, /could not notify staff/);
    assert.equal(requests.length, before);
    assert.equal(store.notificationsForCall(call.callId).length, 1);
    assert.equal(summarizeCall(call.callId).outcome, "booking_requested");
  });

  await check("session handoff rules cover configured and absent routes without leaking destination", () => {
    for (const tenant of [alpha, { ...alpha, notify: { staffWebhookUrl: "" } }]) {
      const payload = buildRealtimeSessionUpdate(tenant).session as { instructions: string };
      assert.match(payload.instructions, /HANDOFF ACCURACY/);
      assert.match(payload.instructions, /does not prove human receipt/);
      assert.match(payload.instructions, /per-call report is sent; that capability is not implemented/);
      assert.ok(!payload.instructions.includes(alphaUrl));
      assert.match(payload.instructions, tenant.notify?.staffWebhookUrl ? /route is configured/ : /No staff notification route is configured/);
    }
    const greeting = buildGreetingResponse(alpha).response as { metadata: { gatewayPurpose: string } };
    assert.equal(greeting.metadata.gatewayPurpose, "greeting");
  });
  await check("reply evidence excludes pre-caller audio, delayed greeting and wrap-up", () => {
    const evidence = new ReplyAudioEvidence();
    evidence.responseCreated({ id: "before" });
    evidence.callerTurnStopped();
    evidence.responseCreated({ id: "greeting", metadata: { gatewayPurpose: "greeting" } });
    evidence.responseCreated({ id: "wrap", metadata: { gatewayPurpose: "wrap_up" } });
    assert.equal(evidence.isReply("before"), false);
    assert.equal(evidence.isReply("greeting"), false);
    assert.equal(evidence.isReply("wrap"), false);
    evidence.responseCreated({ id: "answer" });
    assert.equal(evidence.isReply("answer"), true);
    evidence.responseDone("answer");
    assert.equal(evidence.isReply("answer"), false);
    evidence.responseCreated({ id: "cancelled" }); evidence.cancel();
    assert.equal(evidence.isReply("cancelled"), false);
  });
  await check("actual Realtime event handler flags a reply, but not empty or cancelled audio, without a socket", async () => {
    const call = store.createCall(undefined, alpha.id);
    const forwarded: boolean[] = [];
    // Use the real event handler on an inert instance; never construct the network client.
    const engine = Object.create(RealtimeSession.prototype) as {
      onMessage(data: Buffer): Promise<void>; closedByUs: boolean; truncatedItemId: string | null;
    };
    Object.assign(engine, {
      tenant: alpha, callId: call.callId, closedByUs: false,
      replyEvidence: new ReplyAudioEvidence(), gate: new BargeInGate({ bargeInMinMs: 0 }),
      bargeInTimer: null, lastAssistantItem: null, truncatedItemId: null, userTurnEndedAt: 0,
      activeResponse: false, ws: { readyState: 0 },
      hooks: { onAudio: (_b64: string, _item?: string, reply?: boolean) => {
        forwarded.push(Boolean(reply));
        if (reply) store.recordReplyAudioSent(call.callId);
      }, onUserSpeechStarted: () => {} },
    });
    const event = async (value: object) => engine.onMessage(Buffer.from(JSON.stringify(value)));
    await event({ type: "response.created", response: { id: "g", metadata: { gatewayPurpose: "greeting" } } });
    await event({ type: "input_audio_buffer.speech_stopped" });
    await event({ type: "response.output_audio.delta", response_id: "g", item_id: "g-item", delta: "AA==" });
    assert.equal(store.getCall(call.callId)?.replyAudioSentAt, undefined);
    await event({ type: "response.created", response: { id: "r" } });
    await event({ type: "response.output_audio.delta", response_id: "r", item_id: "r-item", delta: "" });
    assert.equal(store.getCall(call.callId)?.replyAudioSentAt, undefined);
    await event({ type: "response.output_audio.delta", response_id: "r", item_id: "r-item", delta: "AA==" });
    assert.deepEqual(forwarded, [false, true]);
    assert.equal(summarizeCall(call.callId).outcome, "answered");
    engine.truncatedItemId = "r-item";
    await event({ type: "response.output_audio.delta", response_id: "r", item_id: "r-item", delta: "AA==" });
    assert.equal(forwarded.length, 2);
    engine.closedByUs = true;
    await event({ type: "response.output_audio.delta", response_id: "r", item_id: "other-item", delta: "AA==" });
    assert.equal(forwarded.length, 2);
    const notices = requests.length;
    await finalizeCall(call.callId);
    assert.equal(requests.length, notices);
    assert.equal(store.notificationsForCall(call.callId).length, 0);
  });
  await check("new no-response calls are missed; concurrent finalization alerts exactly once", async () => {
    mode = 204;
    const call = store.createCall(undefined, beta.id);
    const before = requests.length;
    await Promise.all([finalizeCall(call.callId), finalizeCall(call.callId)]);
    assert.equal(summarizeCall(call.callId).outcome, "missed");
    assert.equal(requests.length, before + 1);
    assert.equal(store.notificationsForCall(call.callId).length, 1);
  });

  await check("distinct completed-call rates cannot inflate from multiple actions or active calls", () => {
    const file = path.join(temp, "metrics.json");
    writeFileSync(file, JSON.stringify({ calls: { legacy } }));
    const metrics = createStore(file);
    const create = (tenantId = "alpha") => metrics.createCall(undefined, tenantId);
    const draft = (c: CallRecord, pendingConfirm = false) => {
      const d: Draft = { draftId: metrics.id(), callId: c.callId, tenantId: c.tenantId, service: "Synthetic",
        slot: { startIso: "", endIso: "" }, customer: {}, status: "committed", createdAt: 1, expiresAt: 2,
        bookingRef: "fixture", pendingConfirm };
      metrics.putDraft(d); return d;
    };
    const message = (c: CallRecord) => metrics.putMessage({ messageId: metrics.id(), callId: c.callId,
      tenantId: c.tenantId, customer: {}, reason: "fixture", at: 1 });
    const booked = create(); const d = draft(booked); draft(booked); message(booked); message(booked); metrics.endCall(booked.callId);
    const captured = create(); message(captured); message(captured); metrics.endCall(captured.callId);
    const answered = create(); metrics.recordReplyAudioSent(answered.callId); metrics.endCall(answered.callId);
    const pending = create(); draft(pending, true); draft(pending, true); metrics.endCall(pending.callId);
    const missed = create(); metrics.endCall(missed.callId);
    const active = create(); draft(active);
    const other = create("beta"); draft(other); message(other); metrics.endCall(other.callId);
    metrics.audit("call", booked.callId, "fixture");
    metrics.audit("draft", d.draftId, "fixture");
    metrics.audit("call", other.callId, "fixture");
    metrics.audit("unknown", "orphan", "fixture");
    const s = metrics.stats("alpha");
    assert.equal(s.calls, 7); assert.equal(s.activeCalls, 1); assert.equal(s.endedCalls, 6);
    assert.equal(s.bookings, 5); assert.equal(s.messages, 4);
    assert.equal(s.handledCalls, 4); assert.equal(s.handledPct, 67); assert.equal(s.conversionPct, 17);
    assert.equal(s.confirmedBookingCalls, 1); assert.equal(s.pendingBookingCalls, 1);
    assert.equal(s.messageCalls, 1); assert.equal(s.answeredCalls, 1);
    assert.equal(s.missedCalls, 1); assert.equal(s.unknownCalls, 1);
    assert.equal(s.endedCalls, s.confirmedBookingCalls + s.pendingBookingCalls + s.messageCalls + s.answeredCalls + s.missedCalls + s.unknownCalls);
    assert.equal(s.audits, 2); assert.equal(metrics.stats("beta").audits, 1);
    assert.equal(metrics.stats("beta").handledPct, 100);
    assert.equal(metrics.stats().calls, s.calls + metrics.stats("beta").calls);
    assert.equal(metrics.stats("absent").handledPct, 0);
    assert.equal(metrics.stats("absent").conversionPct, 0);
    // Even a malformed cross-tenant linked message must not mark alpha's call handled.
    message({ ...missed, tenantId: "beta" });
    assert.equal(metrics.callOutcome(missed.callId), "missed");
    assert.equal(createStore(file).callOutcome(answered.callId), "answered");
  });
  await check("CLI report states tenant, denominator, unknown history and transport-only acceptance", () => {
    const report = spawnSync(process.execPath,
      ["--import", "tsx", fileURLToPath(new URL("./report.ts", import.meta.url)), "alpha"],
      { cwd: fileURLToPath(new URL("..", import.meta.url)), env: { ...process.env, STORE_SNAPSHOT: path.join(temp, "metrics.json") }, encoding: "utf8", timeout: 15000 });
    assert.equal(report.status, 0, report.stderr);
    assert.match(report.stdout, /tenant: alpha/);
    assert.match(report.stdout, /with recorded handling 4 \/ 6 = 67%/);
    assert.match(report.stdout, /unknown legacy calls  1/);
    assert.match(report.stdout, /Webhook acceptance does not prove human receipt/);
  });
  await check("notification result states and tenant counts survive snapshot reload", () => {
    const reloaded = createStore(snapshot);
    assert.deepEqual(reloaded.stats("alpha"), store.stats("alpha"));
    assert.deepEqual(reloaded.stats("beta"), store.stats("beta"));
    const s = store.stats();
    assert.equal(s.notificationRecords, s.notificationsAccepted + s.notificationsFailed + s.notificationsNotConfigured + s.notificationsPending);
    assert.ok(s.notificationsAccepted > 0 && s.notificationsFailed > 0 && s.notificationsNotConfigured > 0);
  });
  console.log("ALL " + checks + " RELIABILITY CHECKS PASSED");
} finally {
  globalThis.fetch = originalFetch;
  for (const name of ["metrics.json", "store.json", "tenants.json"]) {
    try { unlinkSync(path.join(temp, name)); } catch {}
  }
  try { rmdirSync(temp); } catch {}
}
