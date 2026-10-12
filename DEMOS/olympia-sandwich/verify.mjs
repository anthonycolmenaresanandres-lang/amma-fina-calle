import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const localRequire=createRequire(import.meta.url);
let ts;try{ts=localRequire('typescript');}catch{ts=createRequire(new URL('../../APP/web/package.json',import.meta.url))('typescript');}
const dir=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const provenance=JSON.parse(read('SOURCE_PROVENANCE.json'));
for(const[file,hash]of Object.entries(provenance.immutableNormalizedFiles)){
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,file),'utf8').replace(/\r\n/g,'\n')).digest('hex'),hash,file+' changed');
 assert.equal(Buffer.compare(fs.readFileSync(path.join(dir,file)),fs.readFileSync(path.join(dir,'../pocket-cafe',file))),0,file+' differs from source');
}
const extract=raw=>{const s=raw.replace(/\r\n/g,'\n'),start=s.indexOf('  useFrame((_, delta) => {');
 const marker=s.includes('// Presentation adapter.')?'\n  // Presentation adapter.':'\n  return (\n    <group>';
 return s.slice(start,s.indexOf(marker,start));
};
assert.equal(extract(read('art/original-Game.tsx.txt')),extract(fs.readFileSync(path.join(dir,'../pocket-cafe/Game.tsx'),'utf8')),'archived original simulation callback changed');
assert(!/colattao|CafeModels|CafePlate|CafeSign/.test(read('Game.tsx')));
assert(read('index.html').includes('noindex,nofollow,noarchive'));
assert(read('vite.config.mjs').includes("outDir:'../../APP/web/public/demo/olympia-sandwich'"));
assert(read('vite.config.mjs').includes('./.cache/vite'));
for(const command of Object.values(JSON.parse(read('package.json')).scripts).filter(s=>s.includes('vite')))assert(command.includes('--configLoader native'));
const transpiled=ts.transpileModule(read('CounterProjection.ts'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const projection=await import('data:text/javascript;base64,'+Buffer.from(transpiled).toString('base64'));
for(const[width,height]of [[390,720],[844,312],[320,610]]){
 const layout=projection.roomLayout(width,height);
 for(const [index,x,z]of [[0,-18,-18],[1,18,-18],[2,18,18],[3,-18,18]]){
  const at=projection.projectToCounter(x,z,36,36,layout);
  assert(Math.hypot(at.x-layout.quad[index].x,at.y-layout.quad[index].y)<1e-8,'counter corner mismatch');
  assert(at.scale>0&&at.depthScale>0);
 }
 assert(layout.quad.every(p=>p.x>=0&&p.x<=width&&p.y>=0&&p.y<=height),'play plane cropped');
}
const art=JSON.parse(read('art/runtime-manifest.json'));assert.equal(art.assets.length,7);assert(art.totalBytes<=1500000);
for(const asset of art.assets){
 const file=path.join(dir,'public',asset.file.replace(/^\.\//,''));
 assert.equal(fs.statSync(file).size,asset.bytes);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),asset.sha256);
}
assert.equal(art.assets.filter(a=>a.alpha).length,5,'food transparency missing');
await import('../collector-standard/verify-race.cjs');
console.log('PASS: 6 frozen catalog/input files, archived baseline simulation, opt-in race checks, 3 projection bounds, 7 unchanged hashed art assets, isolated cache/output and noindex.');
