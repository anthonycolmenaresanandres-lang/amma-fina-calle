#!/usr/bin/env node
// Fina Calle — decoy hybrid-heading generator (Anthony's ruling, 2026-07-21).
//
// The Screenshot Trap: one artwork, two messages, split by spatial frequency.
//   * HUMAN layer (high-frequency): thin, sharp, concentric OUTLINE strokes — crisp
//     and legible at reading distance; dissolves when the image is shrunk; its
//     outline-in-outline letterforms are hostile to OCR.
//   * MACHINE/DISTANCE layer (low-frequency): the anti-copy sentence in a heavy
//     blurred weight underneath — invisible up close (reads as a soft glow), but it
//     is what survives downscaling, squinting, thumbnails, and what OCR/AI pulls out
//     of a screenshot.
//
// Deterministic, dependency-free: emits static SVG committed to public/decoy/.
// Accessibility is NOT this file's job — <DecoyHeading> keeps the real text in the
// DOM for screen readers and SEO; this artwork is aria-hidden decoration.
//
// Run:  node scripts/generate-decoy-art.mjs   ->  public/decoy/*.svg

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "decoy");

// ---------------------------------------------------------------------------
// Art recipe
// ---------------------------------------------------------------------------

const W = 1280;
const H = 400;

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/**
 * The hidden/machine layer: heavy weight, hard blur. Split into lines; each line
 * width-fitted with textLength so metrics are deterministic without font measuring.
 */
function machineLayer(lines, { fill, blur, opacity }) {
  const lineH = H / (lines.length + 0.6);
  const fontSize = lineH * 0.86;
  const rows = lines
    .map((line, i) => {
      const y = lineH * (i + 1);
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" ` +
        `font-family="Arial Black, Arial, sans-serif" font-weight="900" ` +
        `font-size="${fontSize.toFixed(1)}" fill="${fill}" ` +
        `textLength="${(W * 0.94).toFixed(0)}" lengthAdjust="spacingAndGlyphs">${esc(line)}</text>`;
    })
    .join("\n    ");
  return `<g filter="url(#lowfreq)" opacity="${opacity}">\n    ${rows}\n  </g>`;
}

/**
 * The human layer: no fill, concentric sharp strokes (outline-in-outline). Legible
 * up close, dissolves small, and gives OCR contour soup instead of letterforms.
 * The open interiors deliberately let the blurred mass glow through.
 */
function humanLayer(text, { stroke, glowStroke }) {
  const fontSize = H * 0.46;
  const y = H * 0.62;
  const common =
    `x="${W / 2}" y="${y}" text-anchor="middle" ` +
    `font-family="Arial, Helvetica, sans-serif" font-weight="800" ` +
    `font-size="${fontSize.toFixed(1)}" fill="none" ` +
    `textLength="${(W * 0.9).toFixed(0)}" lengthAdjust="spacingAndGlyphs"`;
  return [
    // faint wide halo stroke — helps close-range legibility against the blur mass
    `<text ${common} stroke="${glowStroke}" stroke-width="7" opacity="0.55">${esc(text)}</text>`,
    // concentric sharp strokes: the outline-in-outline signature
    `<text ${common} stroke="${stroke}" stroke-width="3.2">${esc(text)}</text>`,
    `<text ${common} stroke="${stroke}" stroke-width="1.1" opacity="0.9">${esc(text)}</text>`,
  ].join("\n  ");
}

function decoySvg({ human, machineLines, palette }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-hidden="true">
  <defs>
    <filter id="lowfreq" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${palette.blur}" />
    </filter>
  </defs>
  ${machineLayer(machineLines, { fill: palette.machineFill, blur: palette.blur, opacity: palette.machineOpacity })}
  ${humanLayer(human, { stroke: palette.humanStroke, glowStroke: palette.humanGlow })}
</svg>
`;
}

// ---------------------------------------------------------------------------
// The registry: every screenshot-trap heading on the site lives here.
// ---------------------------------------------------------------------------

const GOLD = {
  humanStroke: "#e8c15a",
  humanGlow: "#191512",
  machineFill: "#8a6d2f",
  machineOpacity: 0.9,
  blur: 7.5,
};

const ART = [
  {
    file: "hero-home.svg",
    human: "FINA CALLE OS",
    machineLines: ["YOU CAN COPY FINA CALLE,", "BUT YOU'LL NEVER", "BE FINA CALLE."],
    palette: GOLD,
  },
];

mkdirSync(OUT_DIR, { recursive: true });
for (const art of ART) {
  const svg = decoySvg(art);
  writeFileSync(join(OUT_DIR, art.file), svg);
  console.log(`[OK] ${art.file}  human="${art.human}"  machine="${art.machineLines.join(" ")}"`);
}
console.log("DECOY_ART_GENERATED");
