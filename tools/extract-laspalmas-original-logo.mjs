#!/usr/bin/env node

import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const requireFromWeb = createRequire(
  new URL("../APP/web/package.json", import.meta.url),
);
const sharp = requireFromWeb("sharp");

const sourcePath = process.argv[2];
const outputPath =
  process.argv[3] ??
  path.resolve(
    "APP/web/public/assets/laspalmas/brand/las-palmas-original-sign-v1.png",
  );

if (!sourcePath) {
  console.error(
    "Usage: node tools/extract-laspalmas-original-logo.mjs <source.jpg> [output.png]",
  );
  process.exit(1);
}

const crop = { left: 205, top: 0, width: 770, height: 424 };
const mainSignMask = Buffer.from(`
  <svg width="770" height="424" viewBox="0 0 770 424" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="white"
      d="M164 384V178C164 120 261 69 402 64C551 60 671 100 711 156C718 167 721 181 721 195V382C721 389 717 392 709 392H177C169 392 164 389 164 384Z"
    />
  </svg>
`);

const [{ data: source, info }, { data: signMask }] = await Promise.all([
  sharp(sourcePath)
    .extract(crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true }),
  sharp(mainSignMask)
    .removeAlpha()
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true }),
]);

for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    const pixelIndex = y * info.width + x;
    const sourceIndex = pixelIndex * 4;
    const red = source[sourceIndex];
    const green = source[sourceIndex + 1];
    const blue = source[sourceIndex + 2];
    const brightestChannel = Math.max(red, green, blue);
    const darkestChannel = Math.min(red, green, blue);
    const chroma = brightestChannel - darkestChannel;

    const insideLeftPalm = x >= 120 && x <= 285 && y >= 54 && y <= 230;
    const insideCenterPalm = x >= 215 && x <= 500 && y <= 252;
    const neutralDarkness = Math.max(
      0,
      Math.min(1, (64 - brightestChannel) / 30),
    );
    const lowChroma = Math.max(0, Math.min(1, (48 - chroma) / 22));
    const palmThreshold = neutralDarkness * lowChroma;
    const palmAlpha =
      insideLeftPalm || insideCenterPalm
        ? Math.round(255 * palmThreshold)
        : 0;
    const exteriorBoundary = x <= 170 || x >= 700 || y >= 380;
    const cyanBackground =
      blue > 80 && blue > red * 1.1 && green > red * 1.05;
    const signAlpha =
      exteriorBoundary && cyanBackground ? 0 : signMask[pixelIndex];

    source[sourceIndex + 3] = Math.max(signAlpha, palmAlpha);
  }
}

const extractedAlpha = new Uint8Array(info.width * info.height);

for (let pixelIndex = 0; pixelIndex < extractedAlpha.length; pixelIndex += 1) {
  extractedAlpha[pixelIndex] = source[pixelIndex * 4 + 3];
}

for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    const pixelIndex = y * info.width + x;
    const sourceIndex = pixelIndex * 4;
    const red = source[sourceIndex];
    const green = source[sourceIndex + 1];
    const blue = source[sourceIndex + 2];
    const cyanBackground =
      blue > 80 && blue > red * 1.1 && green > red * 1.05;

    if (!cyanBackground || extractedAlpha[pixelIndex] === 0) {
      continue;
    }

    let touchesTransparency = false;

    for (let offsetY = -6; offsetY <= 6 && !touchesTransparency; offsetY += 1) {
      const nearbyY = y + offsetY;

      if (nearbyY < 0 || nearbyY >= info.height) {
        touchesTransparency = true;
        break;
      }

      for (let offsetX = -6; offsetX <= 6; offsetX += 1) {
        const nearbyX = x + offsetX;

        if (nearbyX < 0 || nearbyX >= info.width) {
          touchesTransparency = true;
          break;
        }

        if (extractedAlpha[nearbyY * info.width + nearbyX] === 0) {
          touchesTransparency = true;
          break;
        }
      }
    }

    if (touchesTransparency) {
      source[sourceIndex + 3] = 0;
    }
  }
}

await sharp(source, {
  raw: {
    width: info.width,
    height: info.height,
    channels: 4,
  },
})
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9, palette: false })
  .toFile(outputPath);

const output = await sharp(outputPath).metadata();
console.log(
  JSON.stringify(
    {
      output: outputPath,
      width: output.width,
      height: output.height,
      alpha: output.hasAlpha,
    },
    null,
    2,
  ),
);
