import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SecondLocationMenu, sealPath, signatureItems } from "../src/app/(internal)/bodega-second-location-preview/second-location-menu";

assert.deepEqual(signatureItems.map(({ name }) => name), [
  "Bodega Cat", "Spanish Latte", "Coco Loco", "La Isla", "Canela Love",
]);
const seal = fs.readFileSync(path.join("public", sealPath)).toString("base64");
const section = renderToStaticMarkup(React.createElement(SecondLocationMenu, { seal: "data:image/webp;base64," + seal }));
assert.equal((section.match(/<li>/g) ?? []).length, 5);
assert.doesNotMatch(section, /Holland|Bodega Bites|Matcha|Autumn Brew|Checkout|\$\d/i);
assert.match(section, /Location 02/);
assert.match(section, /Draft for review/);
const previewPath = process.argv[2];
if (previewPath) {
  const style = fs.readFileSync("src/app/(internal)/bodega-second-location-preview/second-location.css", "utf8");
  fs.writeFileSync(previewPath, `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Bodega Café | Location 02 menu</title><style>body{margin:0}${style}</style></head><body>${section}</body></html>`);
}
console.log("Bodega location 02: exact signature-only menu verified.");

