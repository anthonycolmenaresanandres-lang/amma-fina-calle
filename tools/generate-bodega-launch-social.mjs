import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "../APP/web/node_modules/sharp/lib/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "APP/web/public/assets/bodega/launch");
const logoPath = path.join(root, "APP/web/public/assets/bodega/review/bodega-round-seal-review.webp");
const muffinPath = path.join(root, "APP/web/public/assets/bodega/fall/cinnamon-muffin.webp");
const goodPath = path.join(root, "APP/web/public/assets/bodega/fall/spanish-latte.webp");
const badPath = path.join(root, "APP/web/public/assets/bodega/fall/bad-vibes.webp");
await mkdir(out, { recursive: true });

const [logo, muffin, good, bad] = await Promise.all([logoPath, muffinPath, goodPath, badPath].map(async (file) => `data:image/webp;base64,${(await readFile(file)).toString("base64")}`));
const C = { ink: "#111111", white: "#fffefb", green: "#173c30", cream: "#fff3da", orange: "#d57a42", gray: "#dedbd7" };
const escape = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const lines = (items, x, y, size, leading, color = C.ink, anchor = "start", weight = 900) => `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="${size * -0.055}">${items.map((item, index) => `<tspan x="${x}" dy="${index ? leading : 0}">${escape(item)}</tspan>`).join("")}</text>`;
const mono = (text, x, y, size, color = C.ink, anchor = "start") => `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-family="Courier New, monospace" font-size="${size}" font-weight="700" letter-spacing="${size * 0.08}">${escape(text)}</text>`;
// Approved raster art is composited by Sharp after the exact-copy SVG renders.
// Keeping it out of the SVG avoids platform-dependent data-URI placeholders.
const image = () => "";
const progress = (width, y, filled = 5, color = C.ink) => Array.from({ length: 5 }, (_, index) => `<rect x="${80 + index * ((width - 190) / 5)}" y="${y}" width="${(width - 230) / 5}" height="14" fill="${index < filled ? color : C.gray}"/>`).join("");
const base = (width, height, background, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><pattern id="chalk" width="86" height="86" patternUnits="userSpaceOnUse"><path d="M4 18L29 11M52 41L81 34M8 72L44 64" stroke="${background === C.green ? "#fff" : "#111"}" stroke-width="2" opacity=".025" stroke-linecap="round"/></pattern></defs>
  <rect width="${width}" height="${height}" fill="${background}"/><rect width="${width}" height="${height}" fill="url(#chalk)"/>
  ${body}
</svg>`);

const feed = [
  { name: "feed-01-vibra-live.png", composites: [[logoPath,64,55,170,170],[muffinPath,665,830,380,390]], svg: base(1080, 1350, C.green, `
    ${image(logo, 64, 55, 170, 170)}${mono("BODEGA CAFE × FINA CALLE", 270, 125, 25, C.cream)}
    ${lines(["ES QUE NO", "ENTIENDEN", "LA VIBRA"], 70, 390, 118, 112, C.cream)}
    <rect x="70" y="775" width="660" height="82" fill="${C.orange}"/>${mono("BODEGA VIBRA IS LIVE", 101, 828, 31, C.ink)}
    ${image(muffin, 665, 830, 380, 390)}${progress(1080, 1260, 5, C.cream)}
  `) },
  { name: "feed-02-how-to-play.png", composites: [[goodPath,80,650,280,280],[badPath,700,650,280,280]], svg: base(1080, 1350, C.white, `
    ${mono("HOW TO CATCH THE VIBRA", 70, 100, 25, C.green)}${lines(["5 ROUNDS.", "10 SECONDS", "EACH."], 70, 270, 112, 108)}
    ${image(good, 80, 650, 280, 280)}${image(bad, 700, 650, 280, 280)}
    ${mono("CATCH THE GOOD STUFF", 65, 980, 22)}${mono("LET BAD VIBES FALL", 665, 980, 22)}
    ${lines(["LOSE OR LEAVE?", "BACK TO ROUND ONE."], 70, 1105, 48, 55, C.green)}${progress(1080, 1260, 2)}
  `) },
  { name: "feed-03-free-muffin.png", composites: [[muffinPath,470,500,570,560]], svg: base(1080, 1350, C.orange, `
    ${mono("COMPLETE THE COLLECTION", 70, 100, 25)}${lines(["CLEAR", "ALL FIVE."], 70, 285, 130, 120)}
    ${image(muffin, 470, 500, 570, 560)}
    <rect x="70" y="1000" width="940" height="180" fill="${C.ink}"/>${lines(["WIN ONE FREE", "MUFFIN."], 105, 1073, 61, 65, C.cream)}
    ${progress(1080, 1260, 5)}
  `) },
  { name: "feed-04-five-daily.png", composites: [[muffinPath,560,800,350,350]], svg: base(1080, 1350, C.white, `
    ${mono("DAILY MUFFIN DROP", 70, 100, 25, C.green)}
    <text x="50" y="730" fill="${C.ink}" font-family="Arial, Helvetica, sans-serif" font-size="720" font-weight="900" letter-spacing="-70">5</text>
    ${lines(["MUFFIN WINS", "EACH DAY."], 505, 395, 68, 72)}
    ${mono("FIRST FIVE VERIFIED WINS", 510, 650, 22, C.orange)}${mono("ACTIVE ROUNDS COUNT TOWARD THE LIMIT", 510, 705, 18)}
    ${image(muffin, 560, 800, 350, 350)}${progress(1080, 1260, 5, C.orange)}
  `) },
  { name: "feed-05-seven-days.png", svg: base(1080, 1350, C.green, `
    ${mono("THE LAUNCH RUN", 70, 100, 25, C.orange)}${lines(["7 DAYS.", "ONE PER", "PERSON."], 70, 305, 126, 120, C.cream)}
    <line x1="70" y1="760" x2="1010" y2="760" stroke="${C.cream}" stroke-width="4"/>
    ${lines(["REDEEM IN STORE", "THE SAME DAY."], 70, 870, 68, 76, C.cream)}
    ${mono("WHILE DAILY SUPPLIES LAST", 70, 1090, 22, C.orange)}${progress(1080, 1260, 5, C.cream)}
  `) },
  { name: "feed-06-play-while-you-wait.png", composites: [[goodPath,695,690,300,300]], svg: base(1080, 1350, C.white, `
    ${mono("YOUR ORDER IS IN. YOUR RUN STARTS NOW.", 70, 100, 22, C.green)}${lines(["PLAY WHILE", "WE MAKE", "YOUR ORDER."], 70, 310, 114, 112)}
    ${image(good, 695, 690, 300, 300)}
    <rect x="0" y="1070" width="1080" height="280" fill="${C.ink}"/>${mono("START AT", 70, 1145, 22, C.orange)}${lines(["BODEGACAFE757.COM"], 70, 1230, 53, 0, C.cream)}
  `) },
  { name: "feed-07-launch-details.png", composites: [[logoPath,390,70,300,300]], svg: base(1080, 1350, C.white, `
    ${image(logo, 390, 70, 300, 300)}${lines(["BODEGA CAFE", "× FINA CALLE"], 540, 475, 72, 75, C.ink, "middle")}
    <line x1="170" y1="650" x2="910" y2="650" stroke="${C.ink}" stroke-width="4"/>
    ${mono("3574 HOLLAND RD · VIRGINIA BEACH", 540, 735, 22, C.green, "middle")}
    ${mono("BODEGACAFE757.COM", 540, 805, 29, C.ink, "middle")}
    ${lines(["GOOD FINDS.", "ZERO BAD VIBES."], 540, 950, 67, 72, C.ink, "middle")}
    ${mono("NO PURCHASE REQUIRED · TERMS ON SITE", 540, 1150, 19, C.orange, "middle")}
    ${mono("NOT SPONSORED OR ADMINISTERED BY INSTAGRAM", 540, 1200, 16, C.ink, "middle")}${progress(1080, 1260, 5)}
  `) },
];

const stories = [
  { name: "story-01-launch.png", composites: [[logoPath,375,185,330,330],[muffinPath,610,1240,400,400]], svg: base(1080, 1920, C.green, `${image(logo, 375, 185, 330, 330)}${mono("BODEGA CAFE × FINA CALLE", 540, 545, 24, C.cream, "middle")}${lines(["ES QUE NO", "ENTIENDEN", "LA VIBRA"], 70, 770, 116, 118, C.cream)}<rect x="70" y="1190" width="760" height="90" fill="${C.orange}"/>${mono("BODEGA VIBRA IS LIVE", 105, 1248, 31)}${image(muffin, 610, 1240, 400, 400)}${mono("BODEGACAFE757.COM", 70, 1610, 27, C.cream)}${progress(1080, 1680, 5, C.cream)}`) },
  { name: "story-02-how-to-play.png", composites: [[goodPath,610,290,390,390],[badPath,650,960,330,330]], svg: base(1080, 1920, C.white, `${mono("HOW TO PLAY", 70, 140, 27, C.green)}${lines(["CATCH", "THE GOOD", "STUFF."], 70, 380, 124, 120)}${image(good, 610, 290, 390, 390)}<line x1="70" y1="850" x2="1010" y2="850" stroke="${C.ink}" stroke-width="4"/>${lines(["LET BAD", "VIBES FALL."], 70, 1070, 100, 105)}${image(bad, 650, 960, 330, 330)}${mono("5 ROUNDS · 10 SECONDS EACH", 70, 1435, 26, C.orange)}${mono("LOSE OR LEAVE = ROUND ONE", 70, 1500, 22)}<rect x="70" y="1560" width="940" height="130" fill="${C.ink}"/>${mono("TAP PLAY AT BODEGACAFE757.COM", 540, 1640, 24, C.cream, "middle")}`) },
  { name: "story-03-muffin.png", composites: [[muffinPath,430,650,580,580]], svg: base(1080, 1920, C.orange, `${mono("THE LAUNCH RUN", 70, 140, 27)}${lines(["WIN ONE", "FREE MUFFIN."], 70, 410, 118, 120)}${image(muffin, 430, 650, 580, 580)}<rect x="70" y="1270" width="940" height="300" fill="${C.ink}"/>${lines(["5 EACH DAY.", "7 DAYS.", "ONE PER PERSON."], 110, 1360, 55, 65, C.cream)}${mono("REDEEM IN STORE THE SAME DAY", 70, 1640, 22)}${mono("TERMS AT BODEGACAFE757.COM", 70, 1700, 22)}${progress(1080, 1770, 5)}`) },
];

const manifest = [];
for (const item of [...feed, ...stories]) {
  const target = path.join(out, item.name);
  const composites = await Promise.all((item.composites ?? []).map(async ([source, left, top, width, height]) => ({
    input: await sharp(source).resize({ width, height, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
    left,
    top,
  })));
  await sharp(item.svg).composite(composites).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(target);
  const buffer = await readFile(target);
  const metadata = await sharp(buffer).metadata();
  manifest.push({ file: item.name, width: metadata.width, height: metadata.height, sha256: createHash("sha256").update(buffer).digest("hex") });
}

await writeFile(path.join(out, "manifest.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  method: "Deterministic SVG composition rendered with Sharp; no generated logos or text.",
  sourceAssets: ["bodega-round-seal-review.webp", "cinnamon-muffin.webp", "spanish-latte.webp", "bad-vibes.webp"],
  assets: manifest,
}, null, 2) + "\n");
console.log(`Generated ${manifest.length} launch assets in ${out}`);
