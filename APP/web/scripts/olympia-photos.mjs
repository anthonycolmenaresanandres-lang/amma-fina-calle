import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Owner-supplied originals imported from c63151eb5d9ebc8961f9ffef05b16bbdbc2eb6cf.
// Crops remove screenshot chrome only. Never overwrite or enlarge an original.
const sources = [
  ['01', '7828400ce16f2355706f2504f671f842d7266da2a723b3c157c5df56811839ad', {left:55,top:0,width:503,height:455}],
  ['02', 'edfd071cac337203373cf00f6739e389e85a557ec0eaabcfe6d14d260a4db8fe', {left:53,top:0,width:558,height:412}],
  ['03', 'b6f561c82a4853afd4681b85323aadb52e9fbdfa138fec05b866ee02b538a975', {left:6,top:32,width:339,height:446}],
  ['04', '3095e7385a103a02046ec10d3f01fcc7cadee5f5ec367f5b12cede7f2f6e8383', {left:0,top:0,width:586,height:306}],
  ['05', '1a09539525e51e58f0d3115dc3de1dccd655ff3442108def7c064dcb0bea6a4a', {left:2,top:34,width:341,height:459}],
  ['06', '7044c369e8bab308a89b370cf65f2d7df60346b4f8123e62d7ce273fe45095d4', {left:0,top:0,width:565,height:372}],
];
const assetRoot = new URL('../public/assets/olympia/photos/', import.meta.url);
const manifest = {};
let originalBytes = 0;
let displayBytes = 0;
for (const [id, expected, crop] of sources) {
  const original = await readFile(new URL(`photo-${id}.png`, assetRoot));
  assert.equal(createHash('sha256').update(original).digest('hex'), expected, `Original ${id} must match pinned source`);
  originalBytes += original.length;
  const variants = [];
  for (const width of [Math.min(320,crop.width), crop.width]) {
    const name = `photo-${id}-${width}.webp`;
    const { data, info } = await sharp(original).extract(crop).resize({width,withoutEnlargement:true}).webp({quality:82,effort:6}).toBuffer({resolveWithObject:true});
    await writeFile(new URL(name, assetRoot), data);
    variants.push({src:`/assets/olympia/photos/${name}`,width:info.width,height:info.height,bytes:data.length});
  }
  const largest = variants.at(-1);
  displayBytes += largest.bytes;
  manifest[id] = {src:largest.src,width:largest.width,height:largest.height,srcSet:variants.map(v=>`${v.src} ${v.width}w`).join(', '),originalSha256:expected,crop,variants};
}
await writeFile(new URL('../src/app/olympia/photo-data.json', import.meta.url),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({originalBytes,largestDisplayBytes:displayBytes,reduction:1-displayBytes/originalBytes,photos:manifest},null,2));
