// Synthetic-only privacy tests. No historical production records, credentials,
// OpenAI session, carrier calls, or external notifications are accessed.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import WebSocket from "ws";
import { PrivateCallerLimiter } from "./voicePrivacy";

const service = fileURLToPath(new URL("..", import.meta.url));
const temp = mkdtempSync(path.join(os.tmpdir(), "demo-privacy-"));
const snapshot = path.join(temp, "synthetic-store.json");
const fixture = path.join(temp, "synthetic-tenants.json");
const syntheticCaller = "+15550001111";
let notifications = 0;
const trap = createServer((_req, res) => { notifications++; res.writeHead(204).end(); });
await new Promise<void>(resolve => trap.listen(0, "127.0.0.1", resolve));
const trapAddress = trap.address(); assert.ok(trapAddress && typeof trapAddress === "object");
const raw = JSON.parse(readFileSync(path.join(service, "tenants.json"), "utf8"));
const sourceDemo = raw.find((t: { id: string }) => t.id === "maracaibo-demo");
assert.deepEqual(sourceDemo.privacy, { retainCallerId: false, missedCallFollowup: false });
sourceDemo.notify = { staffWebhookUrl: "http://127.0.0.1:" + trapAddress.port + "/notification" };
raw.push({ id: "privacy-partial", phoneNumbers: [], privacy: { retainCallerId: false } });
writeFileSync(fixture, JSON.stringify(raw));
for (const key of Object.keys(process.env)) {
  if (/^(OPENAI_|TWILIO_|CALCOM_|SQUARE_|WEBHOOK_|STAFF_|STORE_|DEFAULT_TENANT_)/.test(key)) delete process.env[key];
}
Object.assign(process.env, { DOTENV_CONFIG_PATH: path.join(temp, "no-env"), TENANTS_FILE: fixture, STORE_SNAPSHOT: snapshot, PUBLIC_HOST: "voice.test", TWILIO_VALIDATE_WEBHOOKS: "false", LINE_PAUSED: "false", PER_CALLER_MAX_PER_HOUR: "2" });
const { getTenantById, getTenantByNumber, getTenantByVoiceNumber } = await import("./tenant");
const { store, createStore } = await import("./store");
const { finalizeCall } = await import("./orchestrator");
const { connectStreamTwiML } = await import("./twilio");
const demo = getTenantById("maracaibo-demo")!;
const vbfh = getTenantById("vbfh-info")!;
let checks = 0;
async function check(name: string, fn: () => unknown | Promise<unknown>) { await fn(); checks++; console.log("PASS " + name); }
let child: ReturnType<typeof spawn> | undefined;
try {
  await check("privacy false flags survive merge; unspecified fields retain compatible defaults", () => {
    assert.deepEqual(demo.privacy, { retainCallerId: false, missedCallFollowup: false });
    assert.deepEqual(vbfh.privacy, { retainCallerId: true, missedCallFollowup: true });
    assert.deepEqual(getTenantById("privacy-partial")!.privacy, { retainCallerId: false, missedCallFollowup: true });
  });
  await check("stream helper omits demo caller IDs while preserving VBFH parameters", () => {
    const demoXml = connectStreamTwiML(demo.id, syntheticCaller, demo.privacy);
    assert.doesNotMatch(demoXml, /name="from"/); assert.ok(!demoXml.includes(syntheticCaller));
    assert.ok(connectStreamTwiML(vbfh.id, syntheticCaller, vbfh.privacy).includes(syntheticCaller));
  });
  const answered = store.createCall(syntheticCaller, demo.id, demo.privacy);
  store.recordReplyAudioSent(answered.callId);
  await finalizeCall(answered.callId);
  const early = store.createCall(syntheticCaller, demo.id, demo.privacy);
  await finalizeCall(early.callId); await finalizeCall(early.callId);
  await check("answered and early-hangup outcomes remain anonymous with no follow-up records", () => {
    assert.equal(answered.fromPhone, undefined); assert.equal(early.fromPhone, undefined);
    assert.equal(store.callOutcome(answered.callId), "answered"); assert.equal(store.callOutcome(early.callId), "missed");
    assert.equal(store.stats(demo.id).endedCalls, 2);
    assert.equal(store.stats(demo.id).notificationRecords, 0);
    assert.deepEqual(store.notificationsForCall(early.callId), []);
    assert.equal(notifications, 0); // configured trap proves skip is policy-based, not a blank webhook side effect
  });
  await check("durable synthetic snapshots contain no demo caller ID, even after reload", () => {
    const serialized = readFileSync(snapshot, "utf8"); assert.ok(!serialized.includes(syntheticCaller));
    const reloaded = createStore(snapshot);
    assert.equal(reloaded.getCall(answered.callId)!.fromPhone, undefined);
    assert.equal(reloaded.getCall(early.callId)!.fromPhone, undefined);
    assert.equal(reloaded.stats(demo.id).answeredCalls, 1); assert.equal(reloaded.stats(demo.id).missedCalls, 1);
    assert.equal(reloaded.stats(demo.id).notificationRecords, 0);
  });
  await check("other tenants retain caller identity and their existing missed-call metadata", async () => {
    const other = store.createCall("+15550002222", vbfh.id, vbfh.privacy);
    await finalizeCall(other.callId);
    assert.equal(other.fromPhone, "+15550002222"); assert.equal(store.notificationsForCall(other.callId).length, 1);
    assert.equal(store.notificationsForCall(other.callId)[0]!.purpose, "missed_call");
  });
  let now = 1000;
  const limiter = new PrivateCallerLimiter({ now: () => now, windowMs: 100, maxKeys: 2, sweepIntervalMs: 0 });
  await check("pseudonymous counters normalize phone formats and isolate tenants", () => {
    assert.equal(limiter.allow(demo.id, syntheticCaller, 2), true);
    assert.equal(limiter.allow(demo.id, "+1 (555) 000-1111", 2), true);
    assert.equal(limiter.allow(demo.id, syntheticCaller, 2), false);
    assert.equal(limiter.keyCount, 1);
    assert.equal(limiter.allow("another-tenant", syntheticCaller, 2), true);
    assert.equal(limiter.keyCount, 2);
    assert.equal(limiter.allow(demo.id, "+15550003333", 2), false);
    assert.equal(limiter.keyCount, 2); // capacity cannot be abused to evict/restart an active counter
  });
  await check("expired counters release capacity without weakening the active window", () => {
    now += 100; limiter.prune(); assert.equal(limiter.keyCount, 0);
    assert.equal(limiter.allow(demo.id, syntheticCaller, 2), true);
  });
  limiter.close();
  await check("idle pseudonymous keys are removed by the background expiry sweep", async () => {
    const idle = new PrivateCallerLimiter({ windowMs: 10, sweepIntervalMs: 5 });
    idle.allow(demo.id, syntheticCaller, 2);
    await new Promise(resolve => setTimeout(resolve, 40));
    assert.equal(idle.keyCount, 0); idle.close();
  });

  // Exercise the actual HTTP and WebSocket ingress with synthetic IDs and no API key.
  const reservation = createServer(); await new Promise<void>(resolve => reservation.listen(0, "127.0.0.1", resolve));
  const address = reservation.address(); assert.ok(address && typeof address === "object"); const port = address.port;
  await new Promise<void>(resolve => reservation.close(() => resolve()));
  const ingressSnapshot = path.join(temp, "synthetic-ingress.json");
  child = spawn(process.execPath, ["--import", "tsx", "src/server.ts"], { cwd: service, env: { ...process.env, PORT: String(port), STORE_SNAPSHOT: ingressSnapshot }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  let logs = ""; child.stdout!.on("data", b => logs += b); child.stderr!.on("data", b => logs += b);
  const url = "http://127.0.0.1:" + port;
  let healthy = false;
  for (let i = 0; i < 300; i++) {
    if (child.exitCode !== null) throw Error("Local gateway exited: " + logs);
    try { healthy = (await fetch(url + "/healthz")).ok; } catch {}
    if (healthy) break; await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(healthy, "Synthetic local gateway startup timed out: " + logs);
  await check("real demo HTTP ingress omits From and still enforces caller rate limits", async () => {
    for (let i = 0; i < 3; i++) {
      const xml = await (await fetch(url + "/twiml", { method: "POST", body: new URLSearchParams({ To: "+17573001118", From: syntheticCaller }) })).text();
      assert.ok(!xml.includes(syntheticCaller)); assert.doesNotMatch(xml, /name="from"/);
      if (i < 2) assert.match(xml, /name="tenant" value="maracaibo-demo"/); else assert.match(xml, /reached the call limit/);
    }
  });
  await check("real 666 voice and 300 SMS handlers preserve identity routing and behavior", async () => {
    const voice = await (await fetch(url + "/twiml", { method: "POST", body: new URLSearchParams({ To: "+17576660078", From: syntheticCaller }) })).text();
    assert.match(voice, /name="tenant" value="vbfh-info"/); assert.ok(voice.includes(syntheticCaller));
    assert.equal(getTenantByNumber("+17573001118").id, "fina-calle"); assert.equal(getTenantByVoiceNumber("+17576660078").id, "vbfh-info");
    const sms = await (await fetch(url + "/sms", { method: "POST", body: new URLSearchParams({ To: "+17573001118", From: syntheticCaller, Body: "HELP" }) })).text();
    assert.match(sms, /Fina Calle:/);
  });
  await check("injected stream From cannot reach demo storage or missed-call delivery", async () => {
    const client = new WebSocket("ws://127.0.0.1:" + port + "/media");
    await new Promise<void>((resolve, reject) => { client.once("open", resolve); client.once("error", reject); });
    const closed = new Promise<void>(resolve => client.once("close", () => resolve()));
    client.send(JSON.stringify({ event: "start", start: { streamSid: "synthetic", customParameters: { tenant: demo.id, from: syntheticCaller } } }));
    // No key: startup fails before opening a model socket and finalizes anonymously.
    await closed;
    const payload = readFileSync(ingressSnapshot, "utf8"); assert.ok(!payload.includes(syntheticCaller));
    const ingressStore = createStore(ingressSnapshot);
    assert.equal(ingressStore.stats(demo.id).endedCalls, 1); assert.equal(ingressStore.stats(demo.id).missedCalls, 1);
    assert.equal(ingressStore.stats(demo.id).notificationRecords, 0); assert.equal(notifications, 0);
  });
  console.log("Demo privacy simulator: " + checks + " synthetic checks passed. No historical production records or actual phone audio evaluated.");
} finally {
  child?.kill(); if (child && child.exitCode === null) await new Promise<void>(resolve => child!.once("exit", () => resolve()));
  await new Promise<void>(resolve => trap.close(() => resolve()));
  // This is a newly created, verified synthetic test directory under the OS temp root.
  assert.ok(path.resolve(temp).startsWith(path.resolve(os.tmpdir()) + path.sep));
  rmSync(temp, { recursive: true });
}
