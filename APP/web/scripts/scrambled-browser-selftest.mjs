import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const cdpOrigin = process.env.SCRAMBLED_CDP_ORIGIN ?? "http://127.0.0.1:9223";
const appOrigin = process.env.SCRAMBLED_APP_ORIGIN ?? "http://127.0.0.1:3137";
const outputDirectory = process.env.SCRAMBLED_BROWSER_EVIDENCE ?? path.resolve(".scrambled-browser-evidence");

const targets = await fetch(`${cdpOrigin}/json`).then((response) => response.json());
const pageTarget = targets.find((target) => target.type === "page" && target.url.startsWith(appOrigin));

if (!pageTarget?.webSocketDebuggerUrl) {
  throw new Error(`No Scrambled browser target found at ${appOrigin}.`);
}

const socket = new WebSocket(pageTarget.webSocketDebuggerUrl);
const pending = new Map();
const eventWaiters = new Map();
const browserErrors = [];
let messageId = 0;

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);

  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
    return;
  }

  if (message.method === "Runtime.exceptionThrown") {
    browserErrors.push(message.params.exceptionDetails.text);
  }

  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
    browserErrors.push(message.params.entry.text);
  }

  const waiters = eventWaiters.get(message.method);
  if (waiters?.length) waiters.shift()(message.params);
});

function send(method, params = {}) {
  messageId += 1;
  socket.send(JSON.stringify({ id: messageId, method, params }));
  return new Promise((resolve, reject) => pending.set(messageId, { resolve, reject }));
}

function nextEvent(method, timeoutMs = 20_000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${method}.`)), timeoutMs);
    const waiter = (params) => {
      clearTimeout(timeout);
      resolve(params);
    };
    const waiters = eventWaiters.get(method) ?? [];
    waiters.push(waiter);
    eventWaiters.set(method, waiters);
  });
}

async function navigate(url) {
  const loaded = nextEvent("Page.loadEventFired");
  await send("Page.navigate", { url });
  await loaded;
  await new Promise((resolve) => setTimeout(resolve, 1_000));
}

async function setViewport(width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  });
}

async function inspect() {
  const result = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const navLinks = [...document.querySelectorAll('nav[aria-label="Menu sections"] a')];
      const ids = navLinks.map((link) => link.hash.slice(1));
      const heroLead = document.querySelector('[class*="heroLead"]')?.getBoundingClientRect();
      return {
        href: location.href,
        title: document.title,
        heading: document.querySelector('h1')?.textContent?.trim(),
        innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        heroLeadRight: heroLead?.right,
        forms: document.forms.length,
        ownerLinks: document.querySelectorAll('a[href*="/owner/"]').length,
        navLabels: navLinks.map((link) => link.textContent?.trim()),
        anchorsResolve: ids.every((id) => document.getElementById(id)),
        menuItems: document.querySelectorAll('li').length,
      };
    })()`,
  });
  return result.result.value;
}

async function capture(name) {
  const screenshot = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
  await writeFile(path.join(outputDirectory, name), Buffer.from(screenshot.data, "base64"));
}

await mkdir(outputDirectory, { recursive: true });
await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");

await setViewport(390, 844, true);
await navigate(`${appOrigin}/demo/scrambled`);
const mobile = await inspect();
await capture("scrambled-mobile.png");

await navigate(`${appOrigin}/scrambled/menu`);
const redirect = await inspect();

await setViewport(1440, 1000, false);
await navigate(`${appOrigin}/demo/scrambled`);
const desktop = await inspect();
await capture("scrambled-desktop.png");

const failures = [];
for (const [label, result] of [["mobile", mobile], ["desktop", desktop]]) {
  if (result.documentWidth > result.innerWidth || result.bodyWidth > result.innerWidth) failures.push(`${label}: horizontal overflow`);
  if (result.heroLeadRight > result.innerWidth + 0.5) failures.push(`${label}: hero copy is clipped`);
  if (result.forms !== 0) failures.push(`${label}: guest form found`);
  if (result.ownerLinks !== 0) failures.push(`${label}: owner portal link found`);
  if (!result.anchorsResolve) failures.push(`${label}: navigation target missing`);
  if (result.menuItems < 90) failures.push(`${label}: menu inventory appears incomplete`);
}

if (!redirect.href.endsWith("/demo/scrambled")) failures.push("stable route did not redirect to the menu preview");
if (browserErrors.length) failures.push(`browser errors: ${browserErrors.join(" | ")}`);

console.log(JSON.stringify({ mobile, redirect, desktop, browserErrors, failures }, null, 2));
socket.close();

if (failures.length) process.exitCode = 1;
