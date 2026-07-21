#!/usr/bin/env node
// Fina Calle — decoy hybrid-heading generator (Anthony's ruling, 2026-07-21).
//
// The Screenshot Trap: one artwork, two messages, split by spatial frequency.
//   * HUMAN layer (high-frequency): sharp concentric OUTLINE strokes — crisp and
//     legible at reading distance; dissolves when the image is shrunk; its
//     outline-in-outline letterforms are hostile to OCR.
//   * MACHINE/DISTANCE layer (low-frequency): the anti-copy sentence in a heavy
//     blurred weight underneath — a soft glow up close, but it is what survives
//     downscaling, squinting, thumbnails, and what OCR/AI pulls out of a screenshot.
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

const W = 1280;

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/**
 * Machine/distance layer: heavy weight, hard blur. Lines width-fitted with
 * textLength so metrics stay deterministic without measuring fonts.
 */
function machineLayer(lines, H, p) {
  const lineH = H / (lines.length + 0.5);
  const fontSize = lineH * 0.85;
  const rows = lines
    .map((line, i) => {
      const y = lineH * (i + 0.95);
      return `<text x="${W / 2}" y="${y.toFixed(1)}" text-anchor="middle" ` +
        `font-family="Arial Black, Arial, sans-serif" font-weight="900" ` +
        `font-size="${fontSize.toFixed(1)}" fill="${p.machineFill}" ` +
        `textLength="${(W * 0.96).toFixed(0)}" lengthAdjust="spacingAndGlyphs">${esc(line)}</text>`;
    })
    .join("\n    ");
  return `<g filter="url(#lowfreq)" opacity="${p.machineOpacity}">\n    ${rows}\n  </g>`;
}

/**
 * Human layer: no fill, concentric sharp strokes (outline-in-outline). Legible up
 * close, dissolves small, and hands OCR contour soup instead of letterforms. Serif
 * to match the live site's display face; `italic: true` mirrors the hero's <em>.
 */
function humanLayer(lines, H, p) {
  const lineH = H / lines.length;
  const fontSize = lineH * 0.62;
  const rows = [];
  lines.forEach((line, i) => {
    const y = lineH * (i + 0.72);
    const style = line.italic ? `font-style="italic" ` : "";
    const common =
      `x="${W / 2}" y="${y.toFixed(1)}" text-anchor="middle" ` +
      `font-family="Didot, 'Bodoni MT', 'Bodoni Moda', Georgia, serif" font-weight="600" ${style}` +
      `font-size="${fontSize.toFixed(1)}" fill="none" ` +
      `textLength="${(W * 0.92).toFixed(0)}" lengthAdjust="spacingAndGlyphs"`;
    rows.push(
      // faint dark halo — separates the sharp strokes from the blur mass up close
      `<text ${common} stroke="${p.humanGlow}" stroke-width="6" opacity="0.6">${esc(line.text)}</text>`,
      // concentric sharp strokes: the outline-in-outline signature
      `<text ${common} stroke="${p.humanStroke}" stroke-width="2.6">${esc(line.text)}</text>`,
      `<text ${common} stroke="${p.humanStroke}" stroke-width="0.9" opacity="0.9">${esc(line.text)}</text>`,
    );
  });
  return rows.join("\n  ");
}

function decoySvg({ humanLines, machineLines, height, palette }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${height}" role="img" aria-hidden="true">
  <defs>
    <filter id="lowfreq" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${palette.blur}" />
    </filter>
  </defs>
  ${machineLayer(machineLines, height, palette)}
  ${humanLayer(humanLines, height, palette)}
</svg>
`;
}

// ---------------------------------------------------------------------------
// Registry: every screenshot-trap heading on the site lives here.
// ---------------------------------------------------------------------------

// Live-site palette: porcelain type on ink (see page.module.css --fc-* vars).
const PORCELAIN_ON_INK = {
  humanStroke: "#f2ede1",
  humanGlow: "#0c0e11",
  machineFill: "#c9bda4",
  machineOpacity: 0.85,
  blur: 8,
};

const ART = [
  {
    file: "hero-live.svg",
    height: 560,
    humanLines: [
      { text: "A sharper digital presence." },
      { text: "A calmer business behind it.", italic: true },
    ],
    machineLines: ["YOU CAN COPY FINA CALLE,", "BUT YOU'LL NEVER", "BE FINA CALLE."],
    palette: PORCELAIN_ON_INK,
  },
];

mkdirSync(OUT_DIR, { recursive: true });
for (const art of ART) {
  writeFileSync(join(OUT_DIR, art.file), decoySvg(art));
  console.log(
    `[OK] ${art.file}  human="${art.humanLines.map((l) => l.text).join(" ")}"  ` +
    `machine="${art.machineLines.join(" ")}"`,
  );
}
console.log("DECOY_ART_GENERATED");
