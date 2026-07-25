#!/usr/bin/env node
/**
 * Las Palmas Lynnhaven — DoorDash menu media harvester.
 *
 * Opens the restaurant's public DoorDash Commerce Platform page (the same
 * source the demo prices came from, retrieved 2026-07-23), clicks each menu
 * item to open its modal, and captures: exact name, description, and photo.
 * Photos are downloaded into APP/web/public/assets/laspalmas/menu/ and a
 * name-keyed media map is written to
 * APP/web/src/table-os/menu/las-palmas-lynnhaven-media.json — the menu module
 * merges it automatically; items without an entry keep rendering name+price.
 *
 * RIGHTS: these are the restaurant's own marketing photos from its public
 * ordering page. Demo/owner-review use only — PENDING CLIENT APPROVAL before
 * any production/customer-facing use (see GAME_CUSTOMIZATION_PROTOCOL
 * guardrails; same rule as the price data).
 *
 * MUST run on a machine with open internet (the remote CCR container's
 * network policy blocks order.online/cdn4dd). Usage:
 *   npm i playwright sharp   (one-time, anywhere; sharp optional)
 *   node tools/laspalmas-menu-scrape.mjs [--headed] [--limit N]
 *
 * DoorDash markup changes frequently. Selectors below are candidate lists —
 * if a run finds 0 items, re-run with --headed, inspect, and extend the
 * CANDIDATES arrays. The script never fails the whole run on one item.
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STORE_URL =
  "https://order.online/store/las-palmas-mexican-restaurant-%26-cantina-virginia-beach-285708/?hideModal=true&pickup=true";
const ASSET_DIR = join(ROOT, "APP/web/public/assets/laspalmas/menu");
const MEDIA_JSON = join(ROOT, "APP/web/src/table-os/menu/las-palmas-lynnhaven-media.json");
const DATASET = join(ROOT, "APP/web/src/table-os/menu/las-palmas-lynnhaven.ts");

const HEADED = process.argv.includes("--headed");
const LIMIT = (() => {
  const i = process.argv.indexOf("--limit");
  return i > -1 ? Number(process.argv[i + 1]) : Infinity;
})();

// Only harvest items that exist in our curated dataset (39 names).
const targetNames = [...readFileSync(DATASET, "utf8").matchAll(/item\("([^"]+)"/g)].map(
  (m) => m[1],
);

const CARD_CANDIDATES = [
  '[data-anchor-id="MenuItem"]',
  '[data-testid="MenuItem"]',
  '[data-item-id]',
  '[data-testid="image-action-card-container"]',
  'div[role="button"][aria-label]',
];
const MODAL_CANDIDATES = ['[role="dialog"]', '[data-testid="ItemModal"]'];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const media = existsSync(MEDIA_JSON) ? JSON.parse(readFileSync(MEDIA_JSON, "utf8")) : {};
mkdirSync(ASSET_DIR, { recursive: true });

const browser = await chromium.launch({ headless: !HEADED, slowMo: HEADED ? 50 : 0 });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(STORE_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(4000);

// Scroll the whole catalog into the DOM (lazy sections).
for (let i = 0; i < 30; i++) {
  await page.mouse.wheel(0, 2200);
  await page.waitForTimeout(350);
}

let cardSelector = null;
for (const sel of CARD_CANDIDATES) {
  if ((await page.locator(sel).count()) > 10) {
    cardSelector = sel;
    break;
  }
}
if (!cardSelector) {
  console.error("No item cards found — DoorDash markup changed. Re-run with --headed and update CARD_CANDIDATES.");
  await browser.close();
  process.exit(2);
}

const cards = page.locator(cardSelector);
const total = await cards.count();
console.log(`Found ${total} item cards via ${cardSelector}; targeting ${targetNames.length} dataset items.`);

const wanted = new Map(targetNames.map((n) => [norm(n), n]));
let done = 0;
let skipped = 0;

for (let i = 0; i < total && done < Math.min(LIMIT, targetNames.length); i++) {
  const card = cards.nth(i);
  let label = "";
  try {
    label = (await card.getAttribute("aria-label")) || (await card.innerText()).split("\n")[0];
  } catch {
    continue;
  }
  const match = [...wanted.entries()].find(([k]) => norm(label).includes(k));
  if (!match) continue;
  const exactName = match[1];
  if (media[exactName]?.photo) continue; // already harvested

  try {
    await card.scrollIntoViewIfNeeded();
    await card.click({ timeout: 5000 });
    const modal = page.locator(MODAL_CANDIDATES.join(", ")).first();
    await modal.waitFor({ state: "visible", timeout: 8000 });
    await page.waitForTimeout(700);

    const description = await modal
      .locator("p, span")
      .allInnerTexts()
      .then((ts) =>
        ts
          .map((t) => t.trim())
          .filter((t) => t.length > 25 && !/\$|calorie|required|select|add to/i.test(t))
          .sort((a, b) => b.length - a.length)[0] ?? "",
      );

    let photoPath;
    const imgSrc = await modal
      .locator("img")
      .first()
      .getAttribute("src")
      .catch(() => null);
    if (imgSrc && /^https?:/.test(imgSrc)) {
      const res = await fetch(imgSrc.replace(/width=\d+/, "width=800").replace(/height=\d+/, "height=800"));
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const base = `${slug(exactName)}`;
        let outFile = `${base}.jpg`;
        try {
          const sharp = (await import("sharp")).default;
          outFile = `${base}.webp`;
          await sharp(buf).resize(640, 640, { fit: "cover" }).webp({ quality: 78 }).toFile(join(ASSET_DIR, outFile));
        } catch {
          writeFileSync(join(ASSET_DIR, outFile), buf);
        }
        photoPath = `/assets/laspalmas/menu/${outFile}`;
      }
    }

    media[exactName] = {
      ...(description ? { description } : {}),
      ...(photoPath ? { photo: photoPath } : {}),
    };
    done++;
    console.log(`OK  ${exactName}  ${photoPath ?? "(no photo)"}  "${description.slice(0, 60)}"`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(800);
  } catch (err) {
    skipped++;
    console.warn(`SKIP ${exactName}: ${String(err).split("\n")[0]}`);
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(500);
  }
}

writeFileSync(MEDIA_JSON, JSON.stringify(media, null, 2) + "\n");
await browser.close();
console.log(`\nWrote ${MEDIA_JSON}`);
console.log(`Harvested ${done}, skipped ${skipped}, missing ${targetNames.length - Object.keys(media).length}.`);
console.log("Next: npm run build in APP/web, review /demo/las-palmas, commit assets + JSON.");
