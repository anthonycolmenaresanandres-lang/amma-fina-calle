// Offline production-path checks: no model generation, carrier call, staff message or credentials.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const service = fileURLToPath(new URL("..", import.meta.url));
for (const key of Object.keys(process.env)) {
  if (/^(OPENAI_|TWILIO_|CALCOM_|SQUARE_|WEBHOOK_|STAFF_|STORE_|DEFAULT_TENANT_)/.test(key)) delete process.env[key];
}
Object.assign(process.env, { DOTENV_CONFIG_PATH: path.join(service, "offline-test-no-env"), TENANTS_FILE: path.join(service, "tenants.json"), PUBLIC_HOST: "voice.test", TWILIO_VALIDATE_WEBHOOKS: "false", LINE_PAUSED: "false" });
const { getTenantByVoiceNumber, getTenantByNumber, allTenants } = await import("./tenant");
const { buildRealtimeSessionUpdate, buildGreetingResponse } = await import("./realtime");
const { runTool } = await import("./orchestrator");
const { tools } = await import("./tools");
const { store } = await import("./store");
const demo = getTenantByVoiceNumber("+17573001118");
let checks = 0;
const check = (name: string, fn: () => void) => { fn(); checks++; console.log("PASS " + name); };
check("entire VBFH persona stays identical to main except removal of 300 voice override", () => {
  const raw = JSON.parse(readFileSync(path.join(service, "tenants.json"), "utf8")) as { id: string }[];
  const hash = createHash("sha256").update(JSON.stringify(raw.find(t => t.id === "vbfh-info"))).digest("hex");
  // Reviewed base 55e3fc7, with voicePhoneNumbers changed to [] only.
  assert.equal(hash, "cfe6b81722e73b599994d985ff38d5cbd3ce455acff0aeda84dd99654816e998");
});
check("voice-only override isolates 300 SMS and 666 across number formats", () => {
  for (const to of ["+17573001118", "+1 (757) 300-1118", "17573001118"]) {
    assert.equal(getTenantByVoiceNumber(to).id, "maracaibo-demo");
    assert.equal(getTenantByNumber(to).id, "fina-calle");
  }
  assert.equal(getTenantByVoiceNumber("+17576660078").id, "vbfh-info");
  assert.equal(getTenantByNumber("+17576660078").id, "vbfh-info");
  assert.equal(getTenantByVoiceNumber().id, "colattao-info");
});
const session = buildRealtimeSessionUpdate(demo).session as { instructions: string; tools: { name: string }[]; audio: { output: { voice: string } } };
check("actual session greets in Spanish, identifies Fina Calle demo and exposes no tools", () => {
  assert.equal(demo.language, "Spanish"); assert.equal(session.audio.output.voice, "marin");
  assert.deepEqual(session.tools, []); assert.equal(demo.notify?.staffWebhookUrl, "");
  assert.match(session.instructions, /por defecto en español natural/);
  assert.match(session.instructions, /no un cliente confirmado/);
  assert.match(session.instructions, /No tomes, registres ni confirmes pedidos, reservas, pagos, mensajes/);
  assert.match(JSON.stringify(buildGreetingResponse(demo)), /demostración de Fina Calle/);
  assert.match(JSON.stringify(buildGreetingResponse(demo)), /Esta llamada puede grabarse/);
  assert.doesNotMatch(session.instructions, /You may record a message|A staff notification route is configured/);
});
check("verified contact, hours and menu reach isolated production payload", () => {
  assert.match(session.instructions, /2876 Virginia Beach Boulevard/);
  assert.match(session.instructions, /757-917-5187/);
  assert.match(session.instructions, /Domingo a jueves de diez de la mañana a nueve de la noche/);
  assert.match(session.instructions, /Viernes y sábado de diez de la mañana a diez de la noche/);
  assert.match(session.instructions, /quesillo y tres leches/);
  assert.match(session.instructions, /pueden cambiar/);
  assert.match(session.instructions, /no tienes un reloj actual confiable/);
  assert.match(session.instructions, /Para alergias, pide consultar directamente al restaurante/);
  const sources = demo.knowledge!.match(/https:\/\/[^\s;\]]+/g)!;
  assert.ok(sources.length >= 3);
  for (const url of sources) assert.equal(new URL(url).hostname, "maracaibobistrovab.com");
  for (const other of allTenants().filter(t => t.id !== demo.id)) {
    assert.ok(!session.instructions.includes(other.knowledge!));
    assert.ok(!JSON.stringify(buildRealtimeSessionUpdate(other)).includes(demo.knowledge!));
  }
});
const before = store.stats();
for (const tool of tools) {
  const result = await runTool(demo, "offline-denied", tool.name, { customer_name: "Test", customer_phone: "000", draft_id: "none", service: "table", date: "2026-10-10" });
  assert.match(result, /Esta demostración es solo informativa/);
}
check("all unadvertised function calls are denied without recording or booking", () => assert.deepEqual(store.stats(), before));
check("undefined tool list retains default capability behavior for existing integrations", () => {
  const defaultSession = buildRealtimeSessionUpdate({ ...demo, tools: undefined }).session as { tools: unknown[] };
  assert.equal(defaultSession.tools.length, tools.length);
  const vbfh = buildRealtimeSessionUpdate(getTenantByVoiceNumber("+17576660078")).session as { tools: { name: string }[] };
  assert.deepEqual(vbfh.tools.map(t => t.name), ["take_message"]);
});
const reservation = createServer();
await new Promise<void>(resolve => reservation.listen(0, "127.0.0.1", resolve));
const address = reservation.address(); assert.ok(address && typeof address === "object"); const port = address.port;
await new Promise<void>(resolve => reservation.close(() => resolve()));
const child = spawn(process.execPath, ["--import", "tsx", "src/server.ts"], { cwd: service, env: { ...process.env, PORT: String(port) }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
let logs = ""; child.stdout.on("data", b => logs += b); child.stderr.on("data", b => logs += b);
try {
  const url = "http://127.0.0.1:" + port;
  let healthy = false;
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw Error("Gateway exited: " + logs);
    try { healthy = (await fetch(url + "/healthz")).ok; } catch {}
    if (healthy) break; await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(healthy, logs);
  for (const [number, expected] of [["+17573001118", "maracaibo-demo"], ["+17576660078", "vbfh-info"]]) {
    const response = await fetch(url + "/twiml", { method: "POST", body: new URLSearchParams({ To: number! }) });
    const xml = await response.text();
    check("real HTTP voice handler " + number, () => { assert.equal(response.status, 200); assert.ok(xml.includes('name="tenant" value="' + expected + '"')); });
  }
  const sms = await fetch(url + "/sms", { method: "POST", body: new URLSearchParams({ To: "+17573001118", Body: "HELP" }) });
  const xml = await sms.text();
  check("real SMS HELP retains Fina Calle and omits restaurant demo", () => { assert.equal(sms.status, 200); assert.match(xml, /Fina Calle:/); assert.doesNotMatch(xml, /Maracaibo/); });
  const registry = await (await fetch(url + "/tenants")).json() as { tenants: { id: string; language: string; voice: string; toolNames: string[] }[] };
  check("safe live diagnostics expose Spanish and disabled tools", () => { const tenant = registry.tenants.find(t => t.id === demo.id)!; assert.equal(tenant.language, "Spanish"); assert.equal(tenant.voice, "marin"); assert.deepEqual(tenant.toolNames, []); });
} finally { child.kill(); if (child.exitCode === null) await new Promise<void>(resolve => child.once("exit", () => resolve())); }
console.log("Maracaibo simulator: " + checks + " deterministic checks passed. Actual phone audio and model responses remain unverified.");
