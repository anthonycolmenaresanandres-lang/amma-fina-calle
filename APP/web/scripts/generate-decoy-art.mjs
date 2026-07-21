#!/usr/bin/env node
// Fina Calle — the Screenshot Trap generator (Anthony's ruling, 2026-07-21).
//
// One artwork, two messages, split by spatial frequency:
//   * HUMAN layer (high-frequency): the real headline drawn as fine hatched fill
//     plus a crisp outline — reads as solid letters at viewing distance, fully
//     legible. The hatch averages toward the background when the image is shrunk,
//     and its broken strokes give OCR stripe-soup instead of letterforms.
//   * MACHINE/DISTANCE layer (low-frequency): the anti-copy sentence in a heavy
//     blurred gold weight underneath — a soft glow up close, but it is what
//     survives downscaling, squinting, thumbnails, and what OCR/AI pulls out of
//     a screenshot: "YOU CAN COPY FINA CALLE, BUT YOU'LL NEVER BE FINA CALLE."
//
// Deterministic, dependency-free: emits static SVG committed to public/decoy/.
// Accessibility is NOT this file's job — the page keeps the real text in the DOM
// (visually hidden) for screen readers and SEO; the artwork is aria-hidden.
//
// Run:  node scripts/generate-decoy-art.mjs   ->  public/decoy/*.svg

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "decoy");

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/**
 * Machine layer: heavy weight, hard blur. Lines are width-fitted with textLength
 * so metrics stay deterministic without measuring fonts.
 */
function machineLayer(lines, { W, H, fill, opacity }) {
  const lineH = H / (lines.length + 0.5);
  const fontSize = lineH * 0.92;
  const rows = lines
    .map((line, i) => {
      const y = lineH * (i + 0.98);
      return `<text x="${W / 2}" y="${y.toFixed(1)}" text-anchor="middle" ` +
        `font-family="Arial Black, Arial, sans-serif" font-weight="900" ` +
        `font-size="${fontSize.toFixed(1)}" fill="${fill}" ` +
        `textLength="${(W * 0.94).toFixed(0)}" lengthAdjust="spacingAndGlyphs">${esc(line)}</text>`;
    })
    .join("\n    ");
  return `<g filter="url(#lowfreq)" opacity="${opacity}">\n    ${rows}\n  </g>`;
}

/**
 * Human layer: hatched fill (fine horizontal stripes) + crisp outline, over a
 * soft dark halo that separates it from the gold glow. Legible up close like a
 * solid letter; averages away when shrunk; hostile to OCR binarization.
 */
function humanLayer(text, { W, H, fontSize, stroke, halo }) {
  const y = H / 2 + fontSize * 0.34;
  const common =
    `x="${W / 2}" y="${y.toFixed(1)}" text-anchor="middle" ` +
    `font-family="Arial, Helvetica, sans-serif" font-weight="800" ` +
    `font-size="${fontSize.toFixed(1)}" ` +
    `textLength="${(W * 0.92).toFixed(0)}" lengthAdjust="spacingAndGlyphs"`;
  return [
    // dark halo: keeps the porcelain letters readable against the gold clouds
    `<text ${common} fill="none" stroke="${halo}" stroke-width="${(fontSize * 0.1).toFixed(1)}" opacity="0.6" filter="url(#halo)">${esc(text)}</text>`,
    // hatched body: the legible mass that disappears at low resolution
    `<text ${common} fill="url(#hatch)">${esc(text)}</text>`,
    // crisp edge: 1px-class contour for close-range sharpness
    `<text ${common} fill="none" stroke="${stroke}" stroke-width="${(fontSize * 0.012).toFixed(2)}" opacity="0.75">${esc(text)}</text>`,
  ].join("\n  ");
}

function decoySvg({ W, H, human, humanFontSize, machineLines, palette }) {
  const hatchPeriod = Math.max(4, Math.round(humanFontSize * 0.055));
  const hatchDuty = (hatchPeriod * 0.3).toFixed(2);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-hidden="true">
  <defs>
    <filter id="lowfreq" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${palette.blur}" />
    </filter>
    <filter id="halo" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${(palette.blur * 0.45).toFixed(1)}" />
    </filter>
    <pattern id="hatch" width="${hatchPeriod}" height="${hatchPeriod}" patternUnits="userSpaceOnUse">
      <rect width="${hatchPeriod}" height="${hatchDuty}" fill="${palette.humanFill}" />
    </pattern>
  </defs>
  ${machineLayer(machineLines, { W, H, fill: palette.machineFill, opacity: palette.machineOpacity })}
  ${humanLayer(human, { W, H, fontSize: humanFontSize, stroke: palette.humanStroke, halo: palette.halo })}
</svg>
`;
}

// ---------------------------------------------------------------------------
// The registry: every screenshot-trap artwork on the site lives here.
// Palette matches the live landing (page.module.css): ink / porcelain / gold.
// ---------------------------------------------------------------------------

const LANDING = {
  humanFill: "#f0ece4",   // --fc-porcelain
  humanStroke: "#f0ece4",
  halo: "#07090b",        // --fc-ink
  machineFill: "#c8aa72", // --fc-gold
  machineOpacity: 0.7,
};

const ART = [
  {
    file: "hero-masthead.svg",
    W: 1600,
    H: 430,
    human: "FINA CALLE OS",
    humanFontSize: 196,
    machineLines: ["YOU CAN COPY FINA CALLE,", "BUT YOU'LL NEVER", "BE FINA CALLE."],
    palette: { ...LANDING, blur: 13 },
  },
  {
    file: "hero-masthead-mobile.svg",
    W: 760,
    H: 430,
    human: "FINA CALLE OS",
    humanFontSize: 104,
    machineLines: ["YOU CAN COPY", "FINA CALLE, BUT", "YOU'LL NEVER BE", "FINA CALLE."],
    palette: { ...LANDING, blur: 9.5 },
  },
];

mkdirSync(OUT_DIR, { recursive: true });
for (const art of ART) {
  writeFileSync(join(OUT_DIR, art.file), decoySvg(art));
  console.log(`[OK] ${art.file}  human="${art.human}"  machine="${art.machineLines.join(" ")}"`);
}
console.log("DECOY_ART_GENERATED");
