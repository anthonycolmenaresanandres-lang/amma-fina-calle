// Optional browser QA. Requires Playwright supplied by the developer/QA runtime.
// MARACAIBO_CHROMIUM may point at an installed Chromium executable.
// --remote runs a local Phoenix signaling fixture with isolated browser contexts;
// the RTC links are real. This does not test a live Supabase account or real phones.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const remote = process.argv.includes("--remote");
const expectNetworkUnavailable = process.argv.includes("--expect-network-unavailable");
const output = process.env.MARACAIBO_QA_OUTPUT ?? await mkdtemp(path.join(tmpdir(), "maracaibo-qa-"));
const origin = "http://127.0.0.1:3010";
const errors = [];
const signals = [];
let signaling;
if (remote) {
  const { WebSocketServer } = require("next/dist/compiled/ws");
  signaling = new WebSocketServer({ port: 4100, host: "127.0.0.1" });
  const members = new Map();
  const send = (socket, topic, event, payload, ref = null, joinRef = null) => { if (socket.readyState === 1) socket.send(JSON.stringify([joinRef, ref, topic, event, payload])); };
  const sync = (topic) => {
    const state = {};
    for (const member of members.values()) if (member.topic === topic && member.data) state[member.id] = { metas: [{ ...member.data, phx_ref: member.id }] };
    for (const [socket, member] of members) if (member.topic === topic) send(socket, topic, "presence_state", state);
  };
  signaling.on("connection", (socket) => {
    socket.on("message", (raw) => {
      let frame;
      if (raw[0] === 3) {
        let offset = 7;
        const strings = [];
        for (const length of [raw[1], raw[2], raw[3], raw[4], raw[5]]) { strings.push(raw.subarray(offset, offset + length).toString()); offset += length; }
        const [joinRef, ref, topic, event] = strings;
        frame = [joinRef, ref, topic, "broadcast", { type: "broadcast", event, payload: JSON.parse(raw.subarray(offset).toString()) }];
      } else frame = JSON.parse(raw.toString());
      const [joinRef, ref, topic, event, payload] = frame;
      send(socket, topic, "phx_reply", { status: "ok", response: {} }, ref, joinRef);
      if (event === "phx_join") { members.set(socket, { topic, id: payload.config.presence.key }); sync(topic); }
      if (event === "presence") {
        const member = members.get(socket);
        if (member) { member.data = payload.event === "track" ? payload.payload : null; sync(topic); }
      }
      if (event === "broadcast") {
        signals.push(payload.payload?.payload?.kind);
        for (const [other, member] of members) if (other !== socket && member.topic === topic) send(other, topic, "broadcast", payload);
      }
      if (event === "phx_leave") { members.delete(socket); sync(topic); }
    });
    socket.on("close", () => { const member = members.get(socket); members.delete(socket); if (member) sync(member.topic); });
  });
}
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", remote ? "dev" : "start", "--hostname", "127.0.0.1", "--port", "3010"], {
  cwd: appDir, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", ...(remote ? { NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:4100", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_local_qa_fixture" } : {}) },
});
let serverLog = "";
for (const stream of [server.stdout, server.stderr]) stream.on("data", (data) => { serverLog = (serverLog + data).slice(-6000); });
let browser;
try {
  let response;
  for (let attempt = 0; attempt < 120; attempt++) {
    try { response = await fetch(`${origin}/table/maracaibo/1`); if (response.ok) break; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(response?.ok, serverLog);
  browser = await chromium.launch({ headless: true, executablePath: process.env.MARACAIBO_CHROMIUM, args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--allow-loopback-in-peer-connection", "--disable-features=WebRtcHideLocalIpsWithMdns"] });
  const common = remote ? null : await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const pages = [];
  async function pageFor(table, code) {
    const context = common ?? await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
    const page = await context.newPage();
    await page.addInitScript(() => {
      const Native = window.RTCPeerConnection;
      window.__footballQaPeers = [];
      window.RTCPeerConnection = class extends Native { constructor(...args) { super(...args); window.__footballQaPeers.push(this); } };
    });
    page.on("pageerror", (error) => errors.push(error.message));
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    await page.goto(`${origin}/table/maracaibo/${table}`);
    await page.getByRole("button", { name: "Play Table football · 90 seconds" }).click();
    if (code) await page.getByLabel("Joining friends? Enter their match code.").fill(code);
    await page.getByRole("button", { name: code ? "Join match" : "Create match", exact: true }).click();
    await page.waitForSelector("canvas");
    return page;
  }
  pages.push(await pageFor(1));
  const code = await pages[0].locator('[class*="matchRoom"] strong').innerText();
  for (let index = 1; index < 4; index++) pages.push(await pageFor(1, code));
  if (expectNetworkUnavailable) {
    assert.ok(remote, "Use --remote with --expect-network-unavailable");
    for (const page of pages) await page.getByText("The phones couldn’t connect. Try the same Wi-Fi, rejoin, or practice.", { exact: true }).waitFor({ timeout: 50_000 });
    assert.equal(new Set(await Promise.all(pages.map((page) => page.locator('[class*="connection"] > span').first().innerText()))).size, 4);
    assert.ok(signals.every((kind) => ["rtc", "leave"].includes(kind)));
    assert.ok(signals.length <= 36, "Handshake retries are bounded");
    await pages[0].getByRole("button", { name: "Menu", exact: true }).click();
    await pages[0].getByRole("heading", { name: "Menu", exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log(`MARACAIBO_BROWSER_RESULT ${JSON.stringify({ ok: true, mode: "network-unavailable-safety-check", reservedRoles: 4, boundedSignaling: signals.length, runtimeErrors: 0, menuAvailable: true, realRtcPlay: "unverified" })}`);
    process.exitCode = 0;
  } else {
  const expected = remote ? "4/4 phones · live match" : "4/4 browsers · same device only";
  try {
    for (const page of pages) { await page.getByText(expected, { exact: true }).waitFor({ timeout: 45_000 }); assert.equal(await page.locator("canvas").count(), 1); }
  } catch (error) {
    for (const page of pages) console.log("CONNECTION_DIAGNOSTIC", await page.locator("main").innerText(), await page.evaluate(() => window.__footballQaPeers.map((peer) => ({ connection: peer.connectionState, ice: peer.iceConnectionState, signaling: peer.signalingState, localCandidates: peer.localDescription?.sdp?.split("\n").filter((line) => line.startsWith("a=candidate")).length, remoteCandidates: peer.remoteDescription?.sdp?.split("\n").filter((line) => line.startsWith("a=candidate")).length }))));
    console.log("RUNTIME_ERRORS", errors);
    throw error;
  }
  let roles;
  for (let attempt = 0; attempt < 40; attempt++) {
    roles = await Promise.all(pages.map((page) => page.locator('[class*="connection"] > span').first().innerText()));
    if (new Set(roles).size === 4) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.equal(new Set(roles).size, 4, `Roles must converge: ${JSON.stringify(roles)}`);
  await pages[0].getByRole("button", { name: "Shoot", exact: true }).click();
  await pages[1].getByText("Playing", { exact: true }).waitFor();
  await pages[0].screenshot({ path: path.join(output, "match-mobile.png"), fullPage: true });
  const overflow = await pages[0].evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflow, false);
  const fifth = await pageFor(1, code);
  await fifth.getByText("Four players are already seated. Use a new code for another match.", { exact: true }).waitFor();
  await fifth.close();
  const isolated = await pageFor(2, code);
  await isolated.getByText("Waiting for phones…", { exact: true }).waitFor();
  await isolated.getByText("Move to start", { exact: true }).waitFor();
  assert.equal(await isolated.getByRole("button", { name: "Shoot", exact: true }).isEnabled(), false, "The same code at another table cannot start or join this match");
  await pages[0].getByText(expected, { exact: true }).waitFor();
  await pages[0].getByRole("button", { name: "Leave", exact: true }).click();
  for (const page of pages.slice(1)) await page.getByText(remote ? "3/4 phones · live match" : "3/4 browsers · same device only", { exact: true }).waitFor({ timeout: 15_000 });
  await pages[0].getByRole("button", { name: "Join match", exact: true }).click();
  for (const page of pages) await page.getByText(expected, { exact: true }).waitFor({ timeout: 45_000 });
  assert.equal(await pages[0].locator("canvas").count(), 1, "Rejoin must not leak canvases");
  await pages[1].setViewportSize({ width: 320, height: 700 });
  assert.equal(await pages[1].evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await pages[2].setViewportSize({ width: 1440, height: 1000 });
  assert.equal(await pages[2].evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await pages[2].screenshot({ path: path.join(output, "match-desktop.png"), fullPage: true });
  const signalCount = signals.length;
  await pages[1].getByRole("button", { name: "Menu", exact: true }).click();
  await pages[1].getByRole("heading", { name: "Menu", exact: true }).waitFor();
  assert.equal(await pages[1].locator("canvas").count(), 0);
  // One natural full round checks result/rematch without a production debug shortcut.
  await pages[2].getByRole("button", { name: "Play again", exact: true }).waitFor({ timeout: 100_000 });
  await pages[2].getByRole("button", { name: "Play again", exact: true }).click();
  await pages[2].getByText("Move to start", { exact: true }).waitFor();
  assert.equal(await pages[2].locator("canvas").count(), 1);
  assert.deepEqual(errors, []);
  if (remote) { assert.ok(signals.every((kind) => ["rtc", "leave", "full"].includes(kind)), "No gameplay/heartbeat broadcasts"); assert.ok(signals.length - signalCount < 5, "Active match does not increase Supabase traffic"); }
  const result = { ok: true, mode: remote ? "isolated-context-signaling-fixture" : "same-browser", simultaneousPlayers: 4, fullRoom: true, tableIsolation: true, hostDeparture: true, rejoin: true, naturalFinishAndReplay: true, runtimeErrors: errors.length, signalingMessages: signals.length, output };
  await writeFile(path.join(output, "result.json"), JSON.stringify(result, null, 2));
  console.log(`MARACAIBO_BROWSER_RESULT ${JSON.stringify(result)}`);
  }
} finally {
  await browser?.close();
  server.kill();
  for (const socket of signaling?.clients ?? []) socket.terminate();
  await new Promise((resolve) => signaling ? signaling.close(resolve) : resolve());
}
