// Rebuild the six original October drink illustrations and café backdrop locally.
// The supplied café photograph is embedded only in the backdrop; the logo is not redrawn.
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/assets/project-seed");
const output = path.join(root, "october");
await mkdir(output, { recursive: true });

const recipes = [
  { id: "dwende-latte", body: "#674031", top: "#b67848", foam: "#fff1d4", accent: "#dfa72b", garnish: "marshmallow" },
  { id: "kapre-latte", body: "#ae5a25", top: "#eab265", foam: "#f5d49a", accent: "#b63133", garnish: "apple" },
  { id: "mumu-latte", body: "#b0a774", top: "#e8dfaf", foam: "#fff7de", accent: "#63834a", garnish: "pistachio" },
  { id: "manang-latte", body: "#482534", top: "#773449", foam: "#f2c6c8", accent: "#c42e56", garnish: "raspberry" },
  { id: "pms-latte", body: "#a75327", top: "#d58d43", foam: "#f2c996", accent: "#e4a342", garnish: "pumpkin" },
  { id: "bbl-refresher", body: "#5a2d65", top: "#9f6a9e", foam: "#f7edf3", accent: "#ba4f83", garnish: "berry" },
];

const toppings = {
  marshmallow: `<g fill="#fff4d9" stroke="#c88743" stroke-width="3"><rect x="72" y="42" width="36" height="28" rx="10" transform="rotate(-13 90 56)"/><rect x="109" y="34" width="38" height="30" rx="11" transform="rotate(8 128 49)"/><rect x="147" y="44" width="37" height="28" rx="10" transform="rotate(18 165 58)"/></g><path d="M73 73 Q123 94 185 70" fill="none" stroke="#d49c29" stroke-width="7" stroke-linecap="round"/><g fill="#b47942"><circle cx="76" cy="82" r="5"/><circle cx="180" cy="84" r="5"/><circle cx="157" cy="76" r="4"/></g>`,
  apple: `<path d="M83 52 Q107 23 130 44 Q153 21 177 52 Q160 88 130 92 Q99 86 83 52Z" fill="#f4c371" stroke="#ae3b36" stroke-width="5"/><path d="M129 42 Q131 23 144 15" fill="none" stroke="#5d572c" stroke-width="5" stroke-linecap="round"/><path d="M147 27 Q163 16 175 25 Q163 33 147 27Z" fill="#668141"/><path d="M91 64 Q126 84 167 62" fill="none" stroke="#fff0bc" stroke-width="5"/><path d="M84 88 L174 64" stroke="#70472d" stroke-width="6" stroke-linecap="round"/>`,
  pistachio: `<path d="M66 67 Q126 28 190 66 Q161 92 128 83 Q93 92 66 67Z" fill="#fff4dc" stroke="#83a367" stroke-width="5"/><path d="M77 69 Q128 43 177 68" fill="none" stroke="#7b985c" stroke-width="8" stroke-linecap="round"/><g fill="#63834a"><ellipse cx="85" cy="80" rx="8" ry="4" transform="rotate(-24 85 80)"/><ellipse cx="109" cy="86" rx="9" ry="4" transform="rotate(18 109 86)"/><ellipse cx="146" cy="86" rx="9" ry="4" transform="rotate(-12 146 86)"/><ellipse cx="170" cy="78" rx="9" ry="4" transform="rotate(22 170 78)"/></g>`,
  raspberry: `<g fill="#b82b57" stroke="#f3a3b2" stroke-width="3"><circle cx="92" cy="53" r="17"/><circle cx="116" cy="42" r="16"/><circle cx="139" cy="45" r="16"/><circle cx="163" cy="55" r="17"/></g><g fill="#e9788f"><circle cx="85" cy="48" r="4"/><circle cx="107" cy="39" r="4"/><circle cx="135" cy="40" r="4"/><circle cx="157" cy="49" r="4"/></g><path d="M71 77 Q130 95 187 74" fill="none" stroke="#43212d" stroke-width="10" stroke-linecap="round"/>`,
  pumpkin: `<path d="M91 55 Q95 35 112 39 Q128 25 144 39 Q161 34 168 55 Q169 77 130 83 Q91 76 91 55Z" fill="#d77d2f" stroke="#9a5027" stroke-width="5"/><path d="M130 42 Q126 29 133 24" stroke="#5c6b38" stroke-width="6" stroke-linecap="round"/><path d="M111 41 Q100 55 108 74 M146 40 Q158 55 150 74" fill="none" stroke="#edab55" stroke-width="4"/><path d="M77 84 Q129 105 183 82" fill="none" stroke="#f7d484" stroke-width="6" stroke-linecap="round"/>`,
  berry: `<g stroke="#3d294d" stroke-width="4"><circle cx="92" cy="58" r="19" fill="#44214e"/><circle cx="122" cy="44" r="18" fill="#5a2e65"/><circle cx="151" cy="55" r="19" fill="#4d245a"/></g><g fill="#f7ecdf" stroke="#dfa8a0" stroke-width="4"><circle cx="175" cy="66" r="17"/><circle cx="107" cy="84" r="13"/></g><g fill="#b66297"><circle cx="88" cy="53" r="4"/><circle cx="117" cy="39" r="4"/><circle cx="148" cy="49" r="4"/></g>`,
};

function drinkSvg({ id, body, top, foam, accent, garnish }) {
  const isRefresher = id === "bbl-refresher";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs><linearGradient id="liquid" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${top}"/><stop offset=".58" stop-color="${body}"/><stop offset="1" stop-color="#342032"/></linearGradient><linearGradient id="shine"><stop stop-color="#fff" stop-opacity=".66"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  <ellipse cx="128" cy="232" rx="72" ry="10" fill="#46241e" opacity=".17"/>
  <path d="M64 92 H192 L179 205 Q177 220 161 223 H95 Q79 220 77 205Z" fill="url(#liquid)" stroke="#4a2928" stroke-width="5" stroke-linejoin="round"/>
  ${isRefresher ? `<g fill="#ead8f0" opacity=".45"><rect x="94" y="124" width="23" height="23" rx="5" transform="rotate(13 106 136)"/><rect x="135" y="142" width="23" height="23" rx="5" transform="rotate(-17 147 154)"/></g>` : `<path d="M74 117 Q123 134 183 116" fill="none" stroke="#f8dfbc" stroke-opacity=".65" stroke-width="10"/>`}
  <path d="M83 104 L92 199 Q95 212 105 214" fill="none" stroke="url(#shine)" stroke-width="10" stroke-linecap="round"/>
  <path d="M66 92 Q127 109 190 92" fill="none" stroke="#fff6e8" stroke-width="12" stroke-linecap="round"/>
  <path d="M65 92 Q127 104 191 92" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
  <path d="M79 85 Q124 101 177 85" fill="${foam}" stroke="#e8c6a6" stroke-width="4"/>
  ${toppings[garnish]}
  <circle cx="129" cy="151" r="26" fill="#fff6ea" opacity=".9"/><path d="M129 168 C111 147 117 136 129 131 C141 137 147 149 129 168Z" fill="#a31d30"/><path d="M128 162 Q128 144 136 137" fill="none" stroke="#fff6ea" stroke-width="2"/>
  </svg>`;
}

for (const recipe of recipes) {
  await sharp(Buffer.from(drinkSvg(recipe))).resize(256, 256).webp({ quality: 88, effort: 6 }).toFile(path.join(output, `${recipe.id}-v1.webp`));
}

const photo = (await readFile(path.join(root, "brand/cafe-interior-reference.png"))).toString("base64");
const backdrop = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs><linearGradient id="wall" x2="0" y2="1"><stop stop-color="#fffaf0"/><stop offset="1" stop-color="#ead8bd"/></linearGradient><radialGradient id="glow"><stop stop-color="#fff2c1" stop-opacity=".9"/><stop offset="1" stop-color="#fff2c1" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="900" fill="url(#wall)"/>
  <image href="data:image/png;base64,${photo}" x="0" y="0" width="1200" height="900" preserveAspectRatio="xMidYMid slice" opacity=".24"/>
  <rect width="1200" height="900" fill="#fff9ed" opacity=".34"/>
  <path d="M0 0 H1200 V170 L0 222Z" fill="#a11e2c"/><path d="M0 24 H1200 M0 90 H1200 M0 162 H1200" stroke="#60121e" stroke-width="16"/><path d="M60 0 L340 194 M450 0 L620 187 M900 0 L900 177 M1150 0 L1040 177" stroke="#711320" stroke-width="24"/>
  <g stroke="#513730" stroke-width="5" fill="none"><path d="M200 0 V218 M565 0 V190 M1010 0 V182"/></g>
  <g fill="url(#glow)"><ellipse cx="200" cy="263" rx="160" ry="100"/><ellipse cx="565" cy="237" rx="140" ry="90"/><ellipse cx="1010" cy="224" rx="160" ry="90"/></g>
  <g fill="#d9b481" stroke="#765239" stroke-width="5"><path d="M139 218 Q200 183 261 218 L249 262 Q200 282 151 262Z"/><path d="M512 188 Q565 154 618 188 L606 234 Q565 250 524 234Z"/><path d="M950 182 Q1010 143 1070 182 L1056 232 Q1010 254 964 232Z"/></g>
  <g stroke="#966b48" stroke-width="3" fill="none" opacity=".8"><path d="M150 225 Q200 274 250 225 M160 218 Q200 268 240 218 M525 197 Q565 243 605 197 M965 192 Q1010 239 1055 192"/><path d="M164 223 L174 264 M190 213 L195 270 M220 212 L226 269 M241 224 L232 263 M536 190 L543 237 M586 190 L585 237 M977 184 L982 233 M1039 184 L1034 233"/></g>
  <path d="M0 760 Q400 742 1200 760 V900 H0Z" fill="#9e704e" opacity=".84"/><path d="M0 760 Q580 748 1200 760" fill="none" stroke="#70442b" stroke-width="18"/>
  <g fill="#5a8155" opacity=".65"><path d="M1140 808 Q1050 682 1147 510 Q1123 646 1188 736Z"/><path d="M1125 798 Q1025 749 1002 618 Q1097 660 1168 760Z"/><path d="M35 820 Q95 682 21 561 Q31 691 0 754Z"/></g>
</svg>`;
await sharp(Buffer.from(backdrop)).webp({ quality: 82, effort: 5 }).toFile(path.join(output, "cafe-backdrop-v1.webp"));
console.log(`Wrote ${recipes.length} October drinks and café backdrop to ${output}`);
