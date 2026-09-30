import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const cdp = process.env.SEED_CDP_ORIGIN ?? "http://127.0.0.1:9227";
const app = process.env.SEED_APP_ORIGIN ?? "http://127.0.0.1:3138";
const output = process.env.SEED_BROWSER_EVIDENCE ?? path.resolve(".project-seed-browser-evidence");
const targets = await fetch(`${cdp}/json`).then((response) => response.json());
const target = targets.find((entry) => entry.type === "page" && entry.url.startsWith(app));
if (!target?.webSocketDebuggerUrl) throw new Error(`No browser tab for ${app}`);
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
const errors = [];
const assetLoads = new Set();
let id = 0;
let inGame = false;
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) { const { resolve, reject } = pending.get(message.id); pending.delete(message.id); if (message.error) reject(new Error(message.error.message)); else resolve(message.result); }
  if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.exception?.description ?? JSON.stringify(message.params.exceptionDetails));
  if (message.method === "Network.responseReceived" && inGame && message.params.response.status < 400 && message.params.response.url.includes("/assets/project-seed/seed-rush/")) assetLoads.add(path.basename(new URL(message.params.response.url).pathname));
});
function send(method, params = {}) { const current = ++id; socket.send(JSON.stringify({ id: current, method, params })); return new Promise((resolve, reject) => pending.set(current, { resolve, reject })); }
async function pause(ms = 300) { await new Promise((resolve) => setTimeout(resolve, ms)); }
async function evalInPage(expression) { const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; }
async function waitFor(expression, timeoutMs = 12_000) { const deadline = Date.now() + timeoutMs; while (Date.now() < deadline) { if (await evalInPage(expression)) return true; await pause(); } return false; }
async function shot(name) { const result = await send("Page.captureScreenshot", { format: "png", fromSurface: true }); await writeFile(path.join(output, name), Buffer.from(result.data, "base64")); }
async function catchVisible() {
  await evalInPage(`document.querySelector('[role="application"]')?.focus()`);
  for (const [key, code, text] of [["ArrowRight", "ArrowRight", undefined], [" ", "Space", " "]]) {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, text });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key, code });
  }
}

await mkdir(output, { recursive: true });
await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
await send("Emulation.setFocusEmulationEnabled", { enabled: true });
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, screenWidth: 390, screenHeight: 844, deviceScaleFactor: 1, mobile: true });
await send("Page.navigate", { url: `${app}/play/project-seed` });
await send("Page.bringToFront");
if (!await waitFor(`!![...document.querySelectorAll('button')].find(b=>b.textContent.includes('Start Seed Rush'))`)) throw new Error("Intro did not load");
await pause(1800); // allow client hydration before clicking the server-rendered button
inGame = true;
await evalInPage(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Start Seed Rush')).click()`);
const rounds = [];
for (let round = 0; round < 3; round += 1) {
  if (!await waitFor(`!!document.querySelector('canvas') && !document.body.innerText.includes('Preparing cups')`)) throw new Error(`Round ${round + 1} did not boot: ${JSON.stringify(await evalInPage(`({ text:document.body.innerText.slice(-500), canvas:!!document.querySelector('canvas') })`))}; ${errors.join(" | ")}`);
  await evalInPage(`(() => { window.__seedOriginalRandom = Math.random; Math.random = () => 0.5; })()`); // deterministic good-item sequence after Phaser boots
  const start = Date.now();
  let captured = false;
  let outcome = "";
  while (Date.now() - start < 37_000) {
    await catchVisible();
    if (!captured && Date.now() - start > 4000) { await shot(`game-round-${round + 1}-mobile.png`); captured = true; }
    outcome = await evalInPage(`document.querySelector('h1')?.innerText || ''`);
    if (outcome === "NICE CATCH." || outcome === "GROWN." || outcome === "TRY AGAIN.") break;
    await pause(260);
  }
  const details = await evalInPage(`({ heading:document.querySelector('h1')?.innerText, summary:document.querySelector('[class*="result"] > p:not([class*="eyebrow"])')?.innerText, next:!![...document.querySelectorAll('button')].find(b=>b.textContent.includes('Next round')), complete:!![...document.querySelectorAll('button')].find(b=>b.textContent.includes('Play again')) })`);
  rounds.push(details);
  await evalInPage(`Math.random = window.__seedOriginalRandom`);
  if (round < 2) {
    if (outcome !== "NICE CATCH." || !details.next) throw new Error(`Round ${round + 1} did not win: ${JSON.stringify(details)}`);
    await evalInPage(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Next round')).click()`);
  } else if (outcome !== "GROWN." || !details.complete) throw new Error(`Final round did not complete: ${JSON.stringify(details)}`);
}
if (errors.length) throw new Error(`Browser errors after ${JSON.stringify(rounds)}: ${errors.join(" | ")}`);
const expected = ["buko-pandan-latte-v1.webp", "dark-iced-coffee-v1.webp", "borahae-latte-v1.webp", "iced-green-latte-v1.webp", "sugar-custard-swirl-pastry-v1.webp", "purple-rolled-pastry-v1.webp", "aswang-v1.webp"];
const missing = expected.filter((name) => !assetLoads.has(name));
if (missing.length) throw new Error(`Gameplay did not load assets: ${missing.join(", ")}`);
console.log(JSON.stringify({ rounds, assetLoads: [...assetLoads], errors }, null, 2));
socket.close();
