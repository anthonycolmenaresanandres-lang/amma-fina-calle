// Restrained, code-native background using Natural Earth's public-domain geography.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/assets/project-seed");
const geometry = JSON.parse(await readFile(path.join(root, "brand/philippines-boundary.json"), "utf8"));
const rings = geometry.coordinates.flat();
const points = rings.flat();
const west = Math.min(...points.map(([lon]) => lon));
const east = Math.max(...points.map(([lon]) => lon));
const south = Math.min(...points.map(([, lat]) => lat));
const north = Math.max(...points.map(([, lat]) => lat));
const longitudeScale = Math.cos(13 * Math.PI / 180);

for (const [name, width, height] of [["portrait", 800, 1100], ["landscape", 1200, 1000]]) {
  const mapHeight = height * 0.56;
  const scale = mapHeight / (north - south);
  const mapWidth = (east - west) * longitudeScale * scale;
  const left = (width - mapWidth) / 2;
  const top = height * 0.30;
  const map = rings.map((ring) => ring.map(([lon, lat], index) => `${index ? "L" : "M"}${(left + (lon - west) * longitudeScale * scale).toFixed(2)},${(top + (north - lat) * scale).toFixed(2)}`).join(" ") + "Z").join(" ");
  const roof = height * 0.16;
  const beams = [0.1, 0.38, 0.69, 0.96].map((x) => `<path d="M${width * x} 0 L${width * (0.5 + (x - 0.5) * 1.18)} ${roof}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#eee9df"/>
    <path d="${map}" fill="#b59069" fill-rule="evenodd"/>
    <rect width="${width}" height="${roof}" fill="#8d2730"/>
    <path d="M0 ${roof * 0.32}H${width}M0 ${roof * 0.67}H${width}" fill="none" stroke="#a03a40" stroke-width="4"/>
    <g fill="none" stroke="#681e27" stroke-width="18">${beams}</g>
    <path d="M0 ${roof - 3}H${width}" stroke="#5b1c23" stroke-width="13"/>
    <path d="M0 ${roof + 9}H${width}" stroke="#d6cfc2" stroke-width="5"/>
  </svg>`;
  const base = path.join(root, "october", `cafe-roof-map-${name}-v2`);
  await writeFile(`${base}.svg`, svg);
  await sharp(Buffer.from(svg)).webp({ quality: 88, effort: 6 }).toFile(`${base}.webp`);
}
