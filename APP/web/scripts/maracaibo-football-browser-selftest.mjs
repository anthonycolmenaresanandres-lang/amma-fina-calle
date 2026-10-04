// Optional browser QA; Playwright is supplied by the QA runtime, not an app dependency.
// --origin=http://127.0.0.1:3000 uses an existing production server.
// --remote uses a synthetic Phoenix fixture and isolated browser contexts. The target
// production build must embed the fixture URL/key. This never certifies real phones.
// --expect-network-unavailable explicitly checks recovery when this runtime has no ICE.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const remote = process.argv.includes("--remote");
const expectNetworkUnavailable = process.argv.includes("--expect-network-unavailable");
const diagnoseOnly = process.argv.includes("--diagnose-only");
const originArgument = process.argv.find((value) => value.startsWith("--origin="))?.slice(9);
const suppliedOrigin = originArgument ?? process.env.MARACAIBO_QA_ORIGIN;
const origin = suppliedOrigin ?? "http://127.0.0.1:3010";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(origin).hostname), "QA only targets a local server");
assert.ok(!expectNetworkUnavailable || remote, "Unavailable mode requires the isolated-context remote fixture");
const output = process.env.MARACAIBO_QA_OUTPUT ?? await mkdtemp(path.join(tmpdir(), "maracaibo-qa-"));
await mkdir(output, { recursive: true });
const visitIds = new Map();
const guestIds = new WeakMap();
const errors = [];
const writes = [];
const signals = [];
const stages = [];
const allowedSignalKinds = ["rtc", "leave", "full", "discover", "authority"];
const contexts = [];
const fixtureMembers = new Map();
let signaling;
let browser;
let server;
let serverLog = "";
let activePages = [];
const stage = (name) => { stages.push(name); console.log(`MARACAIBO_QA_STAGE ${name}`); };
async function describePages() {
  const results = await Promise.allSettled(activePages.filter((page) => !page.isClosed()).map((page) => Promise.race([page.evaluate(() => ({
    coarse: matchMedia("(pointer: coarse)").matches, touches: navigator.maxTouchPoints, hidden: document.hidden,
    text: document.querySelector("main")?.innerText, id: window.__footballQa.id,
    authority: window.__footballQa.authority, latest: window.__footballQa.latest,
    sends: window.__footballQa.events.filter((event) => event.direction === "send" && event.kind === "state").length,
    receivers: window.__footballQa.events.filter((event) => event.direction === "receive" && event.kind === "state").reduce((counts, event) => ({ ...counts, [event.sender ?? "rtc"]: (counts[event.sender ?? "rtc"] ?? 0) + 1 }), {}),
  })), new Promise((_, reject) => setTimeout(() => reject(new Error("Page diagnostic timed out")), 2000))])));
  return results.map((result) => result.status === "fulfilled" ? result.value : { diagnosticError: result.reason.message });
}
if (remote) {
  const { WebSocketServer } = require("next/dist/compiled/ws");
  signaling = new WebSocketServer({ port: 4100, host: "127.0.0.1" });
  const send = (socket, topic, event, payload, ref = null, joinRef = null) => { if (socket.readyState === 1) socket.send(JSON.stringify([joinRef, ref, topic, event, payload])); };
  const presenceState = (topic) => {
    const state = {};
    for (const member of fixtureMembers.values()) if (member.topic === topic && member.data) state[member.id] = { metas: [{ ...member.data, phx_ref: member.id }] };
    return state;
  };
  const difference = (member, joining) => {
    if (!member?.data) return;
    const entry = { [member.id]: { metas: [{ ...member.data, phx_ref: member.id }] } };
    for (const [socket, other] of fixtureMembers) if (other.topic === member.topic) send(socket, member.topic, "presence_diff", { joins: joining ? entry : {}, leaves: joining ? {} : entry });
  };
  signaling.on("connection", (socket) => {
    socket.on("message", (raw) => {
      try {
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
        if (event === "phx_join") { fixtureMembers.set(socket, { topic, id: payload.config.presence.key }); send(socket, topic, "presence_state", presenceState(topic)); }
        if (event === "presence") {
          const member = fixtureMembers.get(socket);
          if (member && payload.event === "track") { member.data = payload.payload; difference(member, true); }
          else if (member) { difference(member, false); member.data = null; }
        }
        if (event === "broadcast") {
          signals.push({ kind: payload.payload?.payload?.kind, topic, bytes: raw.length });
          for (const [other, member] of fixtureMembers) if (other !== socket && member.topic === topic) send(other, topic, "broadcast", payload);
        }
        if (event === "phx_leave") { const member = fixtureMembers.get(socket); fixtureMembers.delete(socket); difference(member, false); }
      } catch (error) { errors.push(`Fixture: ${error.message}`); }
    });
    socket.on("close", () => { const member = fixtureMembers.get(socket); fixtureMembers.delete(socket); difference(member, false); });
  });
}
if (!suppliedOrigin) {
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3010"], { cwd: appDir, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });
  for (const stream of [server.stdout, server.stderr]) stream.on("data", (data) => { serverLog = (serverLog + data).slice(-6000); });
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(check, message, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { if (await check()) return; await sleep(100); }
  assert.fail(message);
}
try {
  await until(async () => { try { return (await fetch(`${origin}/table/maracaibo/1`)).ok; } catch { return false; } }, `Production server unavailable: ${serverLog}`, 30_000);
  browser = await chromium.launch({ headless: true, executablePath: process.env.MARACAIBO_CHROMIUM, args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-dev-shm-usage", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows", "--allow-loopback-in-peer-connection", "--disable-features=WebRtcHideLocalIpsWithMdns"] });
  async function newContext(mobile = true) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, hasTouch: mobile, isMobile: mobile });
    contexts.push(context);
    await context.route("**/*", (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (!["127.0.0.1", "localhost"].includes(url.hostname)) return route.abort();
      if (request.method() === "POST" && url.pathname.startsWith("/api/maracaibo/visit/")) {
        // Gameplay fixture only. Real cookie/SQL lifecycle is exercised separately
        // by maracaibo-visits-browser-selftest.mjs against the actual Next API.
        const tableId = decodeURIComponent(url.pathname.split("/").at(-1));
        if (!visitIds.has(tableId)) visitIds.set(tableId, randomUUID());
        const page = request.frame().page();
        if (!guestIds.has(page)) guestIds.set(page, randomUUID());
        return route.fulfill({ contentType: "application/json", body: JSON.stringify({ status: "active", tableId,
          visitId: visitIds.get(tableId), guestId: guestIds.get(page), expiresAt: new Date(Date.now() + 30 * 60_000).toISOString() }) });
      }
      if (!["GET", "HEAD"].includes(request.method())) { writes.push(`${request.method()} ${url.pathname}`); return route.abort(); }
      return route.continue();
    });
    await context.routeWebSocket(/.*/, (socket) => {
      const host = new URL(socket.url()).hostname;
      if (remote && host === "127.0.0.1" && new URL(socket.url()).port === "4100") socket.connectToServer();
      else socket.close({ code: 1000, reason: "Local QA does not contact external signaling" });
    });
    return context;
  }
  const common = remote ? null : await newContext();
  async function pageFor(table, blockedArt = false, mobile = true) {
    const context = mobile ? common ?? await newContext() : await newContext(false);
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", (dialog) => dialog.accept());
    await page.addInitScript(() => {
      const qa = window.__footballQa = { events: [], peers: [], latest: null, id: null, authority: null, blockStateUntil: 0 };
      const record = (packet, direction, sender) => {
        if (!packet || typeof packet !== "object" || !["state", "input", "again"].includes(packet.kind)) return;
        if (packet.kind === "state") qa.latest = packet;
        qa.events.push({ at: performance.now(), direction, sender, kind: packet.kind, input: packet.kind === "input" ? packet.input ?? packet : undefined, state: packet.state });
        if (qa.events.length > 250) qa.events.splice(0, qa.events.length - 250);
      };
      const NativeChannel = window.BroadcastChannel;
      window.BroadcastChannel = class extends NativeChannel {
        constructor(name) {
          super(name);
          if (name.startsWith("maracaibo-local-game:")) this.addEventListener("message", (event) => {
            if (event.data?.packet?.kind === "state" && performance.now() < qa.blockStateUntil) { event.stopImmediatePropagation(); return; }
            record(event.data?.packet, "receive", event.data?.sender);
          });
          this.qaGame = name.startsWith("maracaibo-local-game:");
          this.qaBridge = name.startsWith("table-os:") && name.includes("-football-v3:");
        }
        postMessage(value) {
          if (this.qaGame) record(value?.packet, "send", value?.sender);
          if (this.qaBridge) { qa.id = value?.senderId ?? qa.id; if (value?.payload?.kind === "authority") qa.authority = value.payload.authority; }
          return super.postMessage(value);
        }
      };
      const observe = (channel) => {
        const send = channel.send.bind(channel);
        channel.send = (value) => { try { record(JSON.parse(value), "send"); } catch {} return send(value); };
        channel.addEventListener("message", (event) => { try { record(JSON.parse(event.data), "receive"); } catch {} });
      };
      const NativePeer = window.RTCPeerConnection;
      window.RTCPeerConnection = class extends NativePeer {
        constructor(...args) { super(...args); qa.peers.push(this); this.addEventListener("datachannel", (event) => observe(event.channel)); }
        createDataChannel(...args) { const channel = super.createDataChannel(...args); observe(channel); return channel; }
      };
    });
    if (blockedArt) await page.route(/\/assets\/maracaibo\/football\/(stadium|player-lago|player-rayo)\.webp$/, (route) => route.abort());
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    await page.goto(`${origin}/table/maracaibo/${table}`);
    assert.equal(await page.evaluate(() => matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 0), mobile, "QA device capability must match the intended phone/desktop path");
    return { page, cdp };
  }
  async function join(item, { waitCanvas = true } = {}) {
    const { page } = item;
    await page.getByRole("button", { name: "Play Multiplayer football · Solo penalties" }).click();
    await page.getByRole("button", { name: "Join table game", exact: true }).click();
    assert.equal(await page.locator('input[name="matchCode"]').count(), 0, "Joining a table must not require a code");
    const joinButton = page.getByRole("button", { name: /^(Join table match|Join match|Play with your table|Join your table|Play at this table)$/ });
    if (await joinButton.isVisible()) await joinButton.click();
    if (waitCanvas) await page.waitForSelector("canvas");
  }
  async function steer(page, fraction = 0.65) {
    await until(() => page.getByRole("button", { name: "Move up", exact: true }).isEnabled(), "The current pitch must be ready before steering");
    await page.locator("canvas").scrollIntoViewIfNeeded();
    const box = await page.locator("canvas").boundingBox();
    assert.ok(box, "Phone pitch is mounted");
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height * fraction);
  }
  async function capturePhone(page, filename) {
    await page.bringToFront();
    await page.locator("canvas").scrollIntoViewIfNeeded();
    if ((await page.viewportSize()).height < 500) await page.locator("canvas").evaluate((canvas) => canvas.scrollIntoView({ block: "start" }));
    await sleep(250);
    const stageBottom = await page.locator("canvas").evaluate((canvas) => canvas.parentElement.getBoundingClientRect().bottom);
    const controls = await page.locator('[class*="touchControls"]').boundingBox();
    assert.ok(controls && controls.y >= stageBottom - 0.5, "Movement controls stay below the complete pitch");
    await page.screenshot({ path: path.join(output, filename), fullPage: false });
    assert.ok(await page.evaluate(() => matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 0), "Capture preserves the phone capability gate");
  }
  const items = await Promise.all(Array.from({ length: 4 }, () => pageFor(1)));
  const pages = items.map(({ page }) => page);
  activePages = pages;
  await Promise.all(items.map(join));
  stage("concurrent-no-code-join");
  if (diagnoseOnly) {
    await sleep(4000);
    const connections = await describePages();
    await writeFile(path.join(output, "connection-diagnostic.json"), JSON.stringify(connections, null, 2));
    console.log("CONNECTION_DIAGNOSTIC", JSON.stringify(connections));
    throw Object.assign(new Error("Read-only diagnostics captured"), { diagnosticsOnly: true });
  }
  const role = async (page) => (await page.locator('[class*="connection"] > span').first().innerText()).replace(/^You’re /, "");
  const liveText = (count) => `${count}/4 players · ${remote ? "connected" : "this device only"}`;
  const ready = (page, count = 4) => page.getByText(liveText(count), { exact: true }).waitFor({ timeout: diagnoseOnly ? 10_000 : 45_000 });
  const sendsState = (page) => page.evaluate(() => window.__footballQa.events.some((event) => event.direction === "send" && event.kind === "state"));
  async function singleAuthority() {
    const claims = await Promise.all(pages.map((page) => page.evaluate(() => ({ id: window.__footballQa.id, host: window.__footballQa.authority?.hostId }))));
    assert.equal(new Set(claims.map(({ host }) => host)).size, 1, "All phones identify one authority");
    const index = claims.findIndex(({ id, host }) => id === host);
    assert.ok(index >= 0, "The identified authority is seated");
    // Focus emulation prevents lifecycle suspension; foreground the actual
    // authority as well so headless Chromium supplies real-time Phaser frames.
    await pages[index].bringToFront();
    await until(() => sendsState(pages[index]), "The identified authority must send actual snapshots", 5000);
    await sleep(300);
    assert.equal((await Promise.all(pages.map(sendsState))).filter(Boolean).length, 1, "Only the identified authority sends snapshots");
    return index;
  }
  const diagnostic = async () => Promise.all(pages.map((page) => page.evaluate(() => window.__footballQa.peers.map((peer) => ({
    connection: peer.connectionState, ice: peer.iceConnectionState, gathering: peer.iceGatheringState,
    localCandidates: peer.localDescription?.sdp?.split("\n").filter((line) => line.startsWith("a=candidate")).length ?? 0,
    remoteCandidates: peer.remoteDescription?.sdp?.split("\n").filter((line) => line.startsWith("a=candidate")).length ?? 0,
  })))));
  if (expectNetworkUnavailable) {
    await until(() => [...fixtureMembers.values()].filter((member) => member.data).length >= 4, "Fixture must see four independently tracked presences; build may not embed fixture URL", 15_000);
    for (const page of pages) await page.getByText(/The table match couldn’t connect/).waitFor({ timeout: 50_000 });
    const reservations = await Promise.all(pages.map((page) => page.evaluate(() => ({ id: window.__footballQa.id, authority: window.__footballQa.authority }))));
    assert.equal(new Set(reservations.map(({ id }) => id)).size, 4, "Four isolated phone contexts have unique presence identities");
    assert.equal(new Set(reservations.map(({ authority }) => authority?.generation)).size, 1, "Unavailable peers agree on one room generation");
    for (const { id, authority } of reservations) assert.ok(authority?.joinOrder.length === 4 && authority.joinOrder.includes(id), "All four presences reserve a place before RTC is ready");
    const seats = ["Lago forward", "Rayo forward", "Lago keeper", "Rayo keeper"];
    const roles = reservations.map(({ id, authority }) => seats[authority.joinOrder.indexOf(id)]);
    assert.equal(new Set(roles).size, 4, `Unavailable peers still reserve distinct roles: ${roles}`);
    for (const page of pages) {
      assert.equal(await page.getByRole("button", { name: "Shoot", exact: true }).count(), 0);
      assert.equal(await page.getByText(liveText(4), { exact: true }).count(), 0, "Unavailable peers cannot be presented as ready");
    }
    assert.ok(signals.filter(({ kind }) => kind === "rtc").length <= 36, "Six links have at most three offer/answer attempts each");
    assert.ok(signals.length <= 256, "Presence discovery and authority metadata remain bounded");
    assert.ok(signals.every(({ kind }) => allowedSignalKinds.includes(kind)), "No gameplay is relayed through signaling");
    const peers = await diagnostic();
    assert.ok(peers.flat().length > 0, "Real RTCPeerConnection was attempted");
    await pages[0].getByRole("button", { name: "Menu", exact: true }).click();
    await pages[0].getByRole("heading", { name: "Menu", exact: true }).waitFor();
    assert.equal(await pages[0].locator("canvas").count(), 0);
    await pages[1].getByRole("button", { name: "Play with computers", exact: true }).click();
    await pages[1].getByText("Practice · computer players", { exact: true }).waitFor();
    await steer(pages[1]);
    await pages[1].getByText("Playing", { exact: true }).waitFor();
    await pages[1].getByRole("button", { name: "Menu", exact: true }).click();
    assert.equal(await pages[1].locator("canvas").count(), 0);
    assert.deepEqual(errors, []); assert.deepEqual(writes, []);
    const result = { ok: true, mode: "network-unavailable-safety-check", concurrentNoCodeJoins: 4, reservedRoles: roles, boundedSignaling: signals.length, peers, runtimeErrors: 0, backendWrites: 0, menuCleanup: true, computerRecovery: true, realRtcPlay: "unverified", realPhones: "unverified", stages, output };
    await writeFile(path.join(output, "result.json"), JSON.stringify(result, null, 2));
    console.log(`MARACAIBO_BROWSER_RESULT ${JSON.stringify(result)}`);
  } else {
    try { await Promise.all(pages.map((page) => ready(page))); } catch (error) {
      const connections = await Promise.all(pages.map((page) => page.evaluate(() => ({
        coarse: matchMedia("(pointer: coarse)").matches, touches: navigator.maxTouchPoints,
        text: document.querySelector("main")?.innerText, id: window.__footballQa.id,
        authority: window.__footballQa.authority, latest: window.__footballQa.latest,
        sends: window.__footballQa.events.filter((event) => event.direction === "send" && event.kind === "state").length,
        receives: window.__footballQa.events.filter((event) => event.direction === "receive" && event.kind === "state").length,
      }))));
      await writeFile(path.join(output, "connection-diagnostic.json"), JSON.stringify(connections, null, 2));
      console.log("CONNECTION_DIAGNOSTIC", JSON.stringify(connections));
      console.log("RTC_DIAGNOSTIC", JSON.stringify(await diagnostic())); throw error;
    }
    await until(async () => new Set(await Promise.all(pages.map(role))).size === 4, "Four seats must converge");
    const roles = await Promise.all(pages.map(role));
    for (const page of pages) { assert.equal(await page.locator("canvas").count(), 1); await page.evaluate(() => { window.__footballQa.events = []; }); }
    let hostIndex = await singleAuthority();
    const controlIndex = (hostIndex + 1) % 4;
    const control = pages[controlIndex];
    for (const page of pages) assert.equal(await page.getByRole("button", { name: "Shoot", exact: true }).count(), 0, "Phone gameplay has no manual Shoot control");
    await steer(control);
    await pages[hostIndex].getByText("Playing", { exact: true }).waitFor();
    stage("unique-seats-and-one-authority");
    const fifth = await pageFor(1); await join(fifth, { waitCanvas: false });
    await fifth.page.getByText(/four places are taken/).waitFor();
    await fifth.page.close();
    const isolatedPair = await Promise.all([pageFor(2), pageFor(2)]);
    await Promise.all(isolatedPair.map(join));
    for (const { page } of isolatedPair) await ready(page, 2);
    const twoRoles = await Promise.all(isolatedPair.map(({ page }) => role(page)));
    assert.ok(twoRoles.every((value) => value.endsWith("forward")) && new Set(twoRoles.map((value) => value.split(" ")[0])).size === 2, `The first two players receive opposing forwards: ${twoRoles}`);
    await isolatedPair[0].page.getByText("Drag to start", { exact: true }).waitFor();
    await pages[hostIndex].getByText("Playing", { exact: true }).waitFor();
    await steer(isolatedPair[0].page);
    await isolatedPair[1].page.getByText("Playing", { exact: true }).waitFor();
    const isolatedRoom = await isolatedPair[0].page.evaluate(() => window.__footballQa.latest?.state.roomId);
    assert.notEqual(isolatedRoom, await pages[hostIndex].evaluate(() => window.__footballQa.latest?.state.roomId), "Different tables have distinct simulation rooms");
    await Promise.all(pages.map((page) => ready(page)));
    for (const { page } of isolatedPair) await page.close();
    stage("full-table-and-table-isolation");
    const sentInputs = () => control.evaluate(() => window.__footballQa.events.filter((event) => event.direction === "send" && event.kind === "input").map((event) => event.input));
    const fieldBox = await control.locator("canvas").boundingBox();
    assert.ok(fieldBox);
    const controlledRole = await role(control);
    const controlledSeat = `${controlledRole.startsWith("Lago") ? "home" : "away"}-${controlledRole.endsWith("keeper") ? "goalkeeper" : "forward"}`;
    const beforeDragY = await control.evaluate((seat) => window.__footballQa.latest?.state.players.find((player) => player.id === seat)?.y, controlledSeat);
    await control.evaluate(() => { window.__footballQa.events = []; });
    const point = (fraction) => ({ x: fieldBox.x + fieldBox.width / 2, y: fieldBox.y + fieldBox.height * fraction, id: 1 });
    await items[controlIndex].cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point(0.5)] });
    await items[controlIndex].cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point(0.25)] });
    await sleep(120);
    await items[controlIndex].cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await sleep(100);
    const inputs = await sentInputs();
    assert.ok(inputs.some((input) => input?.move === -1 || Number.isFinite(input?.targetY)), "One-finger pitch drag emits steering");
    assert.ok(inputs.every((input) => !input?.kick), "Phone gestures only steer; contact kicks are automatic");
    await until(async () => (await control.evaluate((seat) => window.__footballQa.latest?.state.players.find((player) => player.id === seat)?.y, controlledSeat)) < beforeDragY - 3, "Native finger drag moves the selected player's shared state");
    await items[controlIndex].cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point(0.65)] });
    await items[controlIndex].cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    stage("one-finger-steering-and-cancel");
    await steer(control, 0.7); await sleep(100);
    const moveButton = control.getByRole("button", { name: "Move up", exact: true });
    await moveButton.scrollIntoViewIfNeeded();
    const moveBox = await moveButton.boundingBox();
    assert.ok(moveBox);
    await control.evaluate(() => { window.__footballQa.events = []; });
    await items[controlIndex].cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ id: 1, x: moveBox.x + moveBox.width / 2, y: moveBox.y + moveBox.height / 2 }] });
    await sleep(350);
    await items[controlIndex].cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await sleep(300);
    const mixedInputs = await sentInputs();
    assert.ok(mixedInputs.some((input) => input?.move === -1), "Alternative button moves the selected rod");
    assert.equal(mixedInputs.at(-1)?.move, 0, "Releasing the button stops movement");
    assert.equal(mixedInputs.at(-1)?.targetY, undefined, "Button release cannot restore a retained field target");
    await steer(control, 0.7); await sleep(100);
    await control.evaluate(() => { window.__footballQa.events = []; Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
    await sleep(100);
    await control.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); document.dispatchEvent(new Event("visibilitychange")); });
    await sleep(350);
    assert.ok((await sentInputs()).every((input) => input?.targetY === undefined), "Tab hide clears retained field targets without requiring blur");
    await control.evaluate(() => { window.__footballQa.events = []; });
    await steer(control, 0.7); await sleep(100);
    assert.ok((await sentInputs()).some((input) => Number.isFinite(input?.targetY)), "Fresh touch works after button ownership and tab return");
    stage("mixed-button-release-and-hidden-target-reset");
    for (const [index, width, height] of [[0, 390, 844], [1, 320, 700], [2, 844, 390]]) {
      await pages[index].setViewportSize({ width, height });
      assert.equal(await pages[index].evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `No overflow at ${width}`);
      await capturePhone(pages[index], `match-${width}.png`);
      assert.equal(await pages[index].locator("canvas").count(), 1);
    }
    const desktop = await pageFor(1, false, false);
    await desktop.page.getByRole("button", { name: "Play Multiplayer football · Solo penalties" }).click();
    await desktop.page.getByRole("button", { name: "Join table game", exact: true }).click();
    await desktop.page.getByRole("heading", { name: "Play on your phone", exact: true }).waitFor();
    assert.equal(await desktop.page.getByAltText(/^QR code for/).count(), 0, "Use the printed table QR, never another screen QR");
    assert.equal(await desktop.page.locator("canvas").count(), 0, "Desktop provides a phone handoff instead of an active session");
    assert.equal(await desktop.page.getByRole("button", { name: "Shoot", exact: true }).count(), 0);
    await desktop.page.screenshot({ path: path.join(output, "desktop-phone-handoff.png"), fullPage: false });
    await desktop.page.close();
    const beforeRefresh = await pages[hostIndex].evaluate(() => window.__footballQa.latest);
    await pages[hostIndex].reload(); await join(items[hostIndex]);
    await Promise.all(pages.map((page) => ready(page)));
    await until(async () => { const packet = await pages[hostIndex].evaluate(() => window.__footballQa.latest); return packet && packet.round === beforeRefresh.round && packet.state.tick >= beforeRefresh.state.tick && packet.state.timeRemainingMs <= beforeRefresh.state.timeRemainingMs; }, "Refresh adopts surviving match instead of resetting clock", 15_000);
    assert.equal(await pages[hostIndex].locator("canvas").count(), 1);
    stage("real-refresh-preserves-progress");
    for (const page of pages) await page.evaluate(() => { window.__footballQa.events = []; });
    hostIndex = await singleAuthority();
    // A formerly authoritative tab returns while successor snapshots are delayed.
    await pages[hostIndex].evaluate(() => { const qa = window.__footballQa; qa.blockStateUntil = performance.now() + 1800; Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
    await sleep(500);
    await pages[hostIndex].evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); document.dispatchEvent(new Event("visibilitychange")); });
    await sleep(2000);
    await Promise.all(pages.map((page) => ready(page)));
    for (const page of pages) await page.evaluate(() => { window.__footballQa.events = []; });
    hostIndex = await singleAuthority();
    stage("hidden-host-return");
    await pages[hostIndex].getByRole("button", { name: "Leave", exact: true }).click();
    for (const page of pages.filter((_, index) => index !== hostIndex)) await ready(page, 3);
    assert.equal(await pages[hostIndex].locator("canvas").count(), 0);
    const rejoinButton = pages[hostIndex].getByRole("button", { name: /^(Join table match|Join match|Play with your table|Join your table|Play at this table)$/ });
    await rejoinButton.click(); await Promise.all(pages.map((page) => ready(page)));
    assert.equal(await pages[hostIndex].locator("canvas").count(), 1);
    await pages[controlIndex].getByRole("button", { name: "Menu", exact: true }).click();
    await pages[controlIndex].getByRole("heading", { name: "Menu", exact: true }).waitFor();
    assert.equal(await pages[controlIndex].locator("canvas").count(), 0);
    stage("leave-rejoin-and-menu-cleanup");
    const survivor = pages[(controlIndex + 1) % 4];
    const playingPages = pages.filter((_, index) => index !== controlIndex);
    await Promise.all(playingPages.map((page) => ready(page, 3)));
    const survivingClaims = await Promise.all(playingPages.map((page) => page.evaluate(() => ({ id: window.__footballQa.id, host: window.__footballQa.authority?.hostId }))));
    assert.equal(new Set(survivingClaims.map(({ host }) => host)).size, 1, "Surviving phones agree on one host");
    const survivingHost = playingPages[survivingClaims.findIndex(({ id, host }) => id === host)];
    assert.ok(survivingHost, "Surviving authority is present");
    await survivingHost.bringToFront();
    const clockBefore = await survivingHost.evaluate(() => ({ at: performance.now(), state: window.__footballQa.latest?.state }));
    await sleep(2000);
    const clockAfter = await survivingHost.evaluate(() => ({ at: performance.now(), state: window.__footballQa.latest?.state }));
    assert.ok(clockBefore.state && clockAfter.state, "The surviving host keeps publishing state");
    assert.ok(clockAfter.state.phase === "finished" || clockBefore.state.timeRemainingMs - clockAfter.state.timeRemainingMs >= 1000, "Foreground authority advances the natural clock in real time");
    await writeFile(path.join(output, "natural-clock.json"), JSON.stringify({ before: clockBefore, after: clockAfter }, null, 2));
    stage("foreground-natural-clock-progress");
    await survivor.getByRole("button", { name: "Play again", exact: true }).waitFor({ timeout: 100_000 });
    await survivor.getByRole("button", { name: "Play again", exact: true }).click();
    await survivor.getByText("Drag to start", { exact: true }).waitFor();
    await sleep(800);
    await survivor.getByText("Drag to start", { exact: true }).waitFor();
    await survivor.getByText("90s", { exact: true }).waitFor();
    assert.equal(await survivor.locator("canvas").count(), 1);
    stage("natural-90-second-finish-and-rematch");
    for (const width of [320, 390]) {
      const fallback = await pageFor(2, true); await fallback.page.setViewportSize({ width, height: 844 });
      await join(fallback);
      await fallback.page.getByRole("button", { name: "Leave", exact: true }).click();
      await fallback.page.getByRole("button", { name: "Play with computers", exact: true }).click();
      await fallback.page.waitForSelector("canvas");
      await fallback.page.getByText("Practice · computer players", { exact: true }).waitFor();
      await steer(fallback.page);
      await fallback.page.getByText("Playing", { exact: true }).waitFor();
      assert.equal(await fallback.page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await capturePhone(fallback.page, `fallback-${width}.png`);
      await fallback.page.getByRole("button", { name: "Menu", exact: true }).click();
      assert.equal(await fallback.page.locator("canvas").count(), 0); await fallback.page.close();
    }
    const practice = await pageFor(2); await join(practice);
    await practice.page.getByRole("button", { name: "Leave", exact: true }).click();
    await practice.page.getByRole("button", { name: "Play with computers", exact: true }).click();
    await practice.page.getByText("Practice · computer players", { exact: true }).waitFor();
    await practice.page.getByText("Drag to start", { exact: true }).waitFor();
    await capturePhone(practice.page, "practice-ready-390.png");
    await practice.page.close();
    assert.deepEqual(errors, []); assert.deepEqual(writes, []);
    if (remote) { assert.ok(signals.every(({ kind }) => allowedSignalKinds.includes(kind)), "Gameplay is never broadcast by signaling"); }
    const result = { ok: true, origin, mode: remote ? "isolated-context-signaling-fixture-real-rtc" : "same-browser-broadcast-channel", concurrentNoCodeJoins: 4, roles, fullTable: true, tableIsolation: true, realRefresh: true, hiddenHostReturn: true, hostDeparture: true, rejoin: true, oneFingerSteering: true, mixedButtonRelease: true, hiddenTargetReset: true, phoneLandscape: true, desktopPhoneHandoff: true, naturalFinishAndReplay: true, missingArtWidths: [320, 390], runtimeErrors: 0, backendWrites: 0, signalingMessages: signals.length, realRtcPlay: remote ? "fixture-verified" : "unverified", realPhones: "unverified", stages, output };
    await writeFile(path.join(output, "result.json"), JSON.stringify(result, null, 2));
    console.log(`MARACAIBO_BROWSER_RESULT ${JSON.stringify(result)}`);
  }
} catch (error) {
  if (!error.diagnosticsOnly) {
    await writeFile(path.join(output, "failure.json"), JSON.stringify({ ok: false, message: error.message, errors, writes, stages, serverLog, output }, null, 2));
    const connections = await describePages();
    await writeFile(path.join(output, "connection-diagnostic.json"), JSON.stringify(connections, null, 2));
    throw error;
  }
} finally {
  await browser?.close();
  server?.kill();
  for (const socket of signaling?.clients ?? []) socket.terminate();
  await new Promise((resolve) => signaling ? signaling.close(resolve) : resolve());
}
