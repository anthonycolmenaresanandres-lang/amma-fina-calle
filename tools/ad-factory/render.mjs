// Ad factory — renders every campaign variant at every placement size to PNG.
//
// Deterministic and offline: the artwork is HTML/CSS in the Fina Calle palette,
// painted by the Chromium that is already installed, plus a real scannable QR
// generated locally. Nothing is AI-generated, nothing is licensed, no client
// logo or photo is used, and no network call is made. Re-running with the same
// campaign.mjs produces byte-comparable output.
//
//   node render.mjs                 # all variants, all sizes
//   node render.mjs --variant b-flat-price --size square
//
// Prints one AD_FACTORY_RESULT line — parse that, not the log.

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import QRCode from "qrcode";
import { OFFER, SIZES, VARIANTS } from "./campaign.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(HERE, "../../output/ads");

// Fina Calle OS palette, read off the live site's own tokens.
const INK = "#171717";
const GOLD = "#d8b36d";
const GOLD_LIGHT = "#e3c17d";
const PAPER = "#f1f4f5";

/**
 * Find the Chromium that ships with this environment. The versioned directory
 * name changes between images, so glob for it rather than pinning a path.
 */
function resolveChromium() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  const candidates = [];
  try {
    for (const entry of readdirSync(root)) {
      if (entry.startsWith("chromium-")) candidates.push(path.join(root, entry, "chrome-linux", "chrome"));
      if (entry.startsWith("chromium_headless_shell-")) candidates.push(path.join(root, entry, "chrome-linux", "headless_shell"));
    }
  } catch {
    // fall through to the plain name and let Playwright report it
  }
  const found = candidates.find((file) => existsSync(file));
  if (!found) throw new Error(`no Chromium found under ${root}`);
  return found;
}

function arg(flag) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? null : process.argv[index + 1];
}

/**
 * One ad, as a full HTML document.
 *
 * The signature element is the QR block: the ad performs the product's own
 * gesture, so a passer-by can scan the ad itself and land on a working menu.
 * Everything else stays quiet around it — one gold rule, one weight change in
 * the headline, and generous space. Layout shifts with aspect ratio rather than
 * scaling one design down, so the story format is genuinely vertical rather
 * than a square with padding.
 */
function adHtml({ variant, size, qrDataUri }) {
  const tall = size.h / size.w >= 1.5;
  const wide = size.w / size.h >= 1.6;
  const unit = size.w / 1080; // every measurement scales off the 1080 reference

  const headlineSize = wide ? 92 * unit : tall ? 128 * unit : 116 * unit;
  const pad = wide ? 74 * unit : 96 * unit;
  const qrSize = wide ? 200 * unit : tall ? 260 * unit : 236 * unit;

  return `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  @page { margin: 0 }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${size.w}px; height: ${size.h}px; }
  body {
    display: flex;
    flex-direction: ${wide ? "row" : "column"};
    ${wide ? "align-items: center;" : tall ? "justify-content: center;" : "justify-content: space-between;"}
    gap: ${wide ? 60 * unit : tall ? 150 * unit : 0}px;
    padding: ${pad}px;
    background:
      radial-gradient(120% 90% at 8% 0%, #22201d 0%, transparent 58%),
      ${INK};
    color: ${PAPER};
    font-family: Georgia, "Times New Roman", serif;
    overflow: hidden;
  }
  .stack { display: flex; flex-direction: column; ${wide ? "flex: 1 1 auto;" : ""} }
  .kicker {
    color: ${GOLD};
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: ${25 * unit}px;
    font-weight: 700;
    letter-spacing: ${5 * unit}px;
    text-transform: uppercase;
  }
  .rule {
    width: ${86 * unit}px;
    height: ${3 * unit}px;
    margin: ${26 * unit}px 0 ${34 * unit}px;
    background: linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT});
  }
  h1 {
    font-size: ${headlineSize}px;
    font-weight: 400;
    letter-spacing: ${-1.5 * unit}px;
    line-height: 1.02;
    white-space: pre-line;
  }
  h1 em { font-style: italic; color: ${GOLD_LIGHT}; }
  .sub {
    max-width: ${wide ? 620 * unit : 860 * unit}px;
    margin-top: ${30 * unit}px;
    color: #cfd4d6;
    font-size: ${wide ? 30 * unit : 38 * unit}px;
    line-height: 1.45;
  }
  .foot {
    display: flex;
    align-items: center;
    gap: ${28 * unit}px;
    ${wide ? "" : `margin-top: ${44 * unit}px;`}
  }
  .qr {
    width: ${qrSize}px;
    height: ${qrSize}px;
    flex: none;
    padding: ${14 * unit}px;
    background: ${PAPER};
    border-radius: ${10 * unit}px;
    box-shadow: 0 0 0 ${3 * unit}px ${GOLD};
  }
  .qr img { display: block; width: 100%; height: 100%; }
  .footText { display: flex; flex-direction: column; gap: ${10 * unit}px; }
  .cta {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: ${wide ? 30 * unit : 38 * unit}px;
    font-weight: 700;
    letter-spacing: ${-0.3 * unit}px;
  }
  .price { color: ${GOLD}; }
  .meta {
    color: #9aa3a6;
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: ${wide ? 22 * unit : 27 * unit}px;
    letter-spacing: ${1.5 * unit}px;
  }
  .proof {
    margin-top: ${18 * unit}px;
    padding-left: ${20 * unit}px;
    border-left: ${3 * unit}px solid ${GOLD};
    color: #b9c0c3;
    font-size: ${wide ? 24 * unit : 30 * unit}px;
    font-style: italic;
  }
</style></head>
<body>
  <div class="stack">
    <div class="kicker">${variant.kicker}</div>
    <div class="rule"></div>
    <h1>${variant.headline.replace(/\n/g, "\n")}</h1>
    <p class="sub">${variant.sub}</p>
    <p class="proof">${variant.proof}</p>
  </div>
  <div class="foot">
    <div class="qr"><img src="${qrDataUri}" alt=""></div>
    <div class="footText">
      <span class="cta">${variant.cta}</span>
      <span class="cta price">${OFFER.price} · ${OFFER.terms}</span>
      <span class="meta">${OFFER.site.toUpperCase()}</span>
    </div>
  </div>
</body></html>`;
}

async function main() {
  const onlyVariant = arg("--variant");
  const onlySize = arg("--size");
  const variants = VARIANTS.filter((v) => !onlyVariant || v.id === onlyVariant);
  const sizes = SIZES.filter((s) => !onlySize || s.id === onlySize);

  if (variants.length === 0 || sizes.length === 0) {
    console.log(`AD_FACTORY_RESULT ${JSON.stringify({ ok: false, detail: "no matching variant or size" })}`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  // One QR for the campaign landing page. Generated locally, high error
  // correction so it still scans off a phone screen at an angle.
  const qrDataUri = await QRCode.toDataURL(OFFER.landing, {
    errorCorrectionLevel: "H",
    margin: 0,
    width: 600,
    color: { dark: INK, light: "#00000000" },
  });

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? resolveChromium(),
  });
  const written = [];

  try {
    for (const variant of variants) {
      for (const size of sizes) {
        const page = await browser.newPage({
          viewport: { width: size.w, height: size.h },
          deviceScaleFactor: 1,
        });
        await page.setContent(adHtml({ variant, size, qrDataUri }), { waitUntil: "load" });
        const file = path.join(OUT_DIR, `${variant.id}-${size.id}.png`);
        await page.screenshot({ path: file, type: "png" });
        await page.close();
        written.push(path.relative(path.resolve(HERE, "../.."), file));
      }
    }
  } finally {
    await browser.close();
  }

  // A plain-text sheet of every headline, so the copy can be reviewed without
  // opening a single image.
  const sheet = [
    `Fina Calle OS — ad copy sheet (${new Date().toISOString().slice(0, 10)})`,
    `Landing page: ${OFFER.landing}`,
    "",
    ...VARIANTS.filter((v) => variants.includes(v)).flatMap((v) => [
      `[${v.id}] ${v.angle}`,
      `  ${v.kicker}`,
      `  ${v.headline.replace(/\n/g, " ")}`,
      `  ${v.sub}`,
      `  ${v.proof}`,
      `  CTA: ${v.cta} · ${OFFER.price} ${OFFER.terms}`,
      "",
    ]),
  ].join("\n");
  await writeFile(path.join(OUT_DIR, "AD_COPY_SHEET.txt"), sheet, "utf8");

  console.log(
    `AD_FACTORY_RESULT ${JSON.stringify({
      ok: true,
      images: written.length,
      variants: variants.length,
      sizes: sizes.length,
      out: "output/ads",
    })}`,
  );
}

main().catch((error) => {
  console.log(`AD_FACTORY_RESULT ${JSON.stringify({ ok: false, detail: String(error?.message ?? error) })}`);
  process.exit(1);
});
