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
const badResponses = [];
const aswangResponses = [];
let id = 0;
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) { const { resolve, reject } = pending.get(message.id); pending.delete(message.id); if (message.error) reject(new Error(message.error.message)); else resolve(message.result); }
  if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error" && !message.params.entry.text.includes("/_vercel/insights/script.js") && !message.params.entry.text.startsWith("Failed to load resource:")) errors.push(message.params.entry.text);
  if (message.method === "Network.responseReceived" && message.params.response.status >= 400 && !message.params.response.url.includes("/_vercel/insights/script.js")) badResponses.push(`${message.params.response.status} ${message.params.response.url}`);
  if (message.method === "Network.responseReceived" && message.params.response.url.includes("/assets/project-seed/seed-rush/aswang-v1.webp")) aswangResponses.push({ status: message.params.response.status, fromDiskCache: message.params.response.fromDiskCache });
});
function send(method, params = {}) { const current = ++id; socket.send(JSON.stringify({ id: current, method, params })); return new Promise((resolve, reject) => pending.set(current, { resolve, reject })); }
async function pause(ms = 700) { await new Promise((resolve) => setTimeout(resolve, ms)); }
async function nav(url) { await send("Page.navigate", { url }); await send("Page.bringToFront"); await pause(1800); }
async function viewport(width, height, mobile) { await send("Emulation.setDeviceMetricsOverride", { width, height, screenWidth: width, screenHeight: height, deviceScaleFactor: 1, mobile }); }
async function evalInPage(expression) { const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); return result.result.value; }
async function waitFor(expression, timeoutMs = 12_000) { const deadline = Date.now() + timeoutMs; while (Date.now() < deadline) { if (await evalInPage(expression)) return true; await pause(250); } return false; }
async function shot(name) { const result = await send("Page.captureScreenshot", { format: "png", fromSurface: true }); await writeFile(path.join(output, name), Buffer.from(result.data, "base64")); }

await mkdir(output, { recursive: true });
await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable"); await send("Network.enable");
await send("Emulation.setFocusEmulationEnabled", { enabled: true });
await viewport(390, 844, true);
await nav(`${app}/project-seed/menu`);
const mobileMenu = await evalInPage(`(() => ({ href:location.pathname, title:document.title, width:innerWidth, scroll:document.documentElement.scrollWidth, items:document.querySelectorAll('li[id]').length, nav:[...document.querySelectorAll('nav a')].every(a=>document.querySelector(a.hash)), noindex:document.querySelector('meta[name="robots"]')?.content, forms:document.forms.length, gameLink:!!document.querySelector('a[href="/play/project-seed"]') }))()`);
await shot("menu-mobile.png");
await viewport(320, 700, true);
await nav(`${app}/demo/project-seed`);
const narrowMenu = await evalInPage(`(() => ({ width:innerWidth, scroll:document.documentElement.scrollWidth, items:document.querySelectorAll('li[id]').length }))()`);
await shot("menu-narrow.png");
await viewport(768, 900, false);
await nav(`${app}/demo/project-seed`);
const tabletMenu = await evalInPage(`(() => ({ width:innerWidth, scroll:document.documentElement.scrollWidth, items:document.querySelectorAll('li[id]').length }))()`);
await shot("menu-tablet.png");
await viewport(1440, 1000, false);
await nav(`${app}/demo/project-seed`);
const desktopMenu = await evalInPage(`(() => ({ width:innerWidth, scroll:document.documentElement.scrollWidth, items:document.querySelectorAll('li[id]').length, title:document.title }))()`);
await shot("menu-desktop.png");
await viewport(390, 844, true);
await nav(`${app}/play/project-seed`);
const intro = await evalInPage(`(() => ({ title:document.title, heading:document.querySelector('h1')?.innerText, width:innerWidth, scroll:document.documentElement.scrollWidth, start:!![...document.querySelectorAll('button')].find(b=>b.textContent.includes('Start Seed Rush')), aswang:document.body.innerText.includes('Aswang · avoid'), passage:(document.body.innerText.match(/Tabi-tabi po\./g)||[]).length }))()`);
await shot("game-intro-mobile.png");
await evalInPage(`document.querySelectorAll('[aria-label="Featured drinks"] button')[1].click()`);
const pandanIntro = await evalInPage(`(async () => {
  const icon = document.querySelector('[class*="instructions"] [class*="demoCup"]');
  const image = new Image();
  image.src = '/assets/project-seed/seed-rush/buko-pandan-latte-v1.webp';
  const loaded = await new Promise((resolve) => { image.onload = () => resolve(true); image.onerror = () => resolve(false); });
  return { selected: document.querySelectorAll('[aria-label="Featured drinks"] button')[1].getAttribute('aria-pressed'), background: getComputedStyle(icon, '::after').backgroundImage, loaded, width: image.naturalWidth, height: image.naturalHeight };
})()`);
await shot("game-intro-pandan-mobile.png");
await evalInPage(`document.querySelectorAll('[aria-label="Featured drinks"] button')[0].click()`);
await evalInPage(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Start Seed Rush')).click()`);
await waitFor(`!!document.querySelector('canvas') && !document.body.innerText.includes('Preparing cups')`);
await evalInPage(`(() => { const original = Math.random; let calls = 0; Math.random = () => calls++ < 4 ? 0 : original(); })()`);
await pause(1600);
await shot("game-playing-aswang-mobile.png");
await pause(3400);
const playing = await evalInPage(`(() => ({ canvas:!!document.querySelector('canvas'), round:document.querySelector('h1')?.innerText, hud:document.querySelector('[class*="hud"]')?.innerText, width:innerWidth, scroll:document.documentElement.scrollWidth, pause:!![...document.querySelectorAll('button')].find(b=>b.textContent==='Pause'), hidden:document.hidden }))()`);
await shot("game-playing-mobile.png");
await evalInPage(`[...document.querySelectorAll('button')].find(b=>b.textContent==='Pause')?.click()`);
const paused = await evalInPage(`(() => ({ label:document.body.innerText.includes('Paused'), hud:document.querySelector('[class*="hud"]')?.innerText }))()`);
await pause(1700);
const stillPaused = await evalInPage(`document.querySelector('[class*="hud"]')?.innerText`);
await evalInPage(`[...document.querySelectorAll('button')].find(b=>b.textContent==='Resume')?.click()`);
await pause(1200);
const resumed = await evalInPage(`document.querySelector('[class*="hud"]')?.innerText`);
await evalInPage(`[...document.querySelectorAll('button')].find(b=>b.textContent==='Exit game')?.click()`);
const exited = await evalInPage(`!![...document.querySelectorAll('button')].find(b=>b.textContent.includes('Start Seed Rush'))`);
await evalInPage(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Start Seed Rush'))?.click()`);
await pause(1800);
await evalInPage(`document.querySelector('[role="application"]')?.focus()`);
for (let attempt = 0; attempt < 3; attempt += 1) {
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight" });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight" });
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", text: " " });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space" });
  await pause(700);
}
const caught = await evalInPage(`(() => ({ hud:document.querySelector('[class*="hud"]')?.innerText, result:!!document.querySelector('[class*="result"]') }))()`);
await nav(`${app}/play/project-seed`);
await waitFor(`!![...document.querySelectorAll('button')].find(b=>b.textContent.includes('Start Seed Rush'))`);
await evalInPage(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Start Seed Rush'))?.click()`);
await waitFor(`!!document.querySelector('canvas')`);
await pause(22500);
const loss = await evalInPage(`(() => ({ heading:document.querySelector('h1')?.innerText, retry:!![...document.querySelectorAll('button')].find(b=>b.textContent.includes('Retry this round')) }))()`);
await evalInPage(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Retry this round'))?.click()`);
await pause(1300);
const retry = await evalInPage(`(() => ({ canvas:!!document.querySelector('canvas'), heading:document.querySelector('h1')?.innerText }))()`);
await evalInPage(`[...document.querySelectorAll('button')].find(b=>b.textContent==='Exit game')?.click()`);
await waitFor(`!![...document.querySelectorAll('button')].find(b=>b.textContent.includes('Start Seed Rush'))`);
await pause(500);
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Network.setBlockedURLs", { urls: ["*aswang-v1.webp*"] });
await evalInPage(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Start Seed Rush'))?.click()`);
await waitFor(`!!document.querySelector('canvas') && !document.body.innerText.includes('Preparing cups')`);
await evalInPage(`(() => { const original = Math.random; let calls = 0; Math.random = () => calls++ < 4 ? 0 : original(); })()`);
await pause(4200);
const fallback = await evalInPage(`(() => ({ canvas:!!document.querySelector('canvas'), loadError:document.body.innerText.includes('Game could not load.'), help:document.querySelector('[class*="roundHelp"]')?.innerText }))()`);
await shot("game-playing-fallback-mobile.png");
await send("Network.setBlockedURLs", { urls: [] });
await send("Network.setCacheDisabled", { cacheDisabled: false });
const failures = [];
if (mobileMenu.href !== "/demo/project-seed" || mobileMenu.items !== 25 || !mobileMenu.nav || mobileMenu.forms || !mobileMenu.gameLink || !mobileMenu.noindex?.includes("noindex")) failures.push("mobile menu route/content");
if (mobileMenu.scroll > mobileMenu.width || narrowMenu.scroll > narrowMenu.width || tabletMenu.scroll > tabletMenu.width || desktopMenu.scroll > desktopMenu.width || intro.scroll > intro.width || playing.scroll > playing.width) failures.push("horizontal overflow");
if (desktopMenu.items !== 25 || !intro.start || !playing.canvas || !playing.pause) failures.push("desktop menu or game boot");
if (!intro.aswang || intro.passage !== 1) failures.push("aswang legend or respectful passage framing");
if (pandanIntro.selected !== "true" || !pandanIntro.background.includes("buko-pandan-latte-v1.webp") || !pandanIntro.loaded || pandanIntro.width !== 256 || pandanIntro.height !== 256) failures.push("Buko Pandan intro sprite");
if (!aswangResponses.some((entry) => entry.status === 200)) failures.push("aswang asset did not load successfully");
if (!paused.label || paused.hud !== stillPaused || paused.hud === resumed) failures.push("pause/resume behavior");
if ((!caught.hud || !/SCORE\s+\d*[1-9]\d*/.test(caught.hud)) && !caught.result) failures.push("keyboard catch did not change game state");
if (!exited) failures.push("exit game did not return to intro");
if (!loss.retry || !retry.canvas) failures.push("loss/retry behavior");
if (!fallback.canvas || fallback.loadError || !fallback.help?.includes("Avoid the aswang")) failures.push("missing-asset primitive fallback");
if (errors.length) failures.push(`browser errors: ${errors.join(" | ")}`);
if (badResponses.length) failures.push(`HTTP errors: ${badResponses.join(" | ")}`);
console.log(JSON.stringify({ mobileMenu, narrowMenu, tabletMenu, desktopMenu, intro, pandanIntro, playing, paused, stillPaused, resumed, caught, exited, loss, retry, fallback, aswangResponses, errors, badResponses, failures }, null, 2));
socket.close();
if (failures.length) process.exitCode = 1;
