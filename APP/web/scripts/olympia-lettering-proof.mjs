import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { letteringWords } from '../src/app/olympia/lettering.ts';
import { olympiaMenu } from '../src/app/olympia/menu-data.ts';

// A vector specimen at actual CSS heading sizes, not a rendered-page screenshot.
const destination = new URL('../../../OPERATIONS/OLYMPIA/2026-10-13/', import.meta.url);
await mkdir(destination, { recursive: true });
for (const viewport of [320, 390]) {
  const gutter = viewport < 360 ? 16 : 20;
  const contentWidth = viewport - gutter * 2;
  let y = 84;
  const body = [];
  const display = (text, size, color, measure = contentWidth) => {
    let x = 0;
    let lineHeight = 0;
    for (const { width, glyphs } of letteringWords(text)) {
      const scale = Math.min(size / 80, measure / width);
      const wordWidth = width * scale;
      if (x > 0 && x + wordWidth > measure) {
        x = 0;
        y += lineHeight + size * .05;
        lineHeight = 0;
      }
      body.push(`<g transform="translate(${gutter + x} ${y}) scale(${scale})" fill="none" stroke="${color}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">${glyphs.map(({ path, x: glyphX }) => `<path d="${path}" transform="translate(${glyphX} 0)"/>`).join('')}</g>`);
      x += wordWidth + size * .28;
      lineHeight = Math.max(lineHeight, 80 * scale);
    }
    y += lineHeight;
  };
  display('Selected menu.', viewport < 360 ? 30 : 32, '#f4f1e8', contentWidth - 88);
  y += 38;
  for (const group of olympiaMenu) {
    display(group.name, 34, '#f36c21', contentWidth - 82);
    y += 28;
  }
  y += 4;
  display('Fresh', 46, '#f4f1e8');
  y += 3;
  display('energy.', 46, '#f36c21');
  y += 30;
  display('Juice Rush', 38, '#ffd171');
  y += 40;
  body.push(`<text x="${gutter}" y="${y}" fill="#f4f1e8" font-family="Arial,sans-serif" font-size="14" font-weight="600">Proudly serving the CNU community</text>`);
  y += 34;
  display('Come by.', 38, '#f4f1e8');
  const height = Math.ceil(y + 35);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewport}" height="${height}" viewBox="0 0 ${viewport} ${height}"><title>Olympia Counter lettering proof at ${viewport} pixels</title><rect width="100%" height="100%" fill="#10283f"/><g fill="#b9c8d2" font-family="Arial,sans-serif" font-size="11"><text x="${gutter}" y="25">OLYMPIA COUNTER / ${viewport} PX PROOF</text><text x="${gutter}" y="45">Original vector lettering. Not a page screenshot.</text><text x="${gutter}" y="62">Category titles use a ${contentWidth - 82}px measure.</text></g>${body.join('')}</svg>`;
  const name = `lettering-proof-${viewport}`;
  await writeFile(new URL(name + '.svg', destination), svg);
  await sharp(Buffer.from(svg)).png().toFile(fileURLToPath(new URL(name + '.png', destination)));
  console.log(`${name}: ${viewport}x${height}; all current display titles rendered from original paths.`);
}
