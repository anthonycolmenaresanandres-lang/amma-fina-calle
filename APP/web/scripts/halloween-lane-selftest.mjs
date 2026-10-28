import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const roots=[fileURLToPath(new URL('..',import.meta.url))];
for(const root of roots){let src=fs.readFileSync(path.join(root,'src/components/seasonal/HalloweenSkin.tsx'),'utf8');let code=ts.transpileModule(src.slice(src.indexOf('// Midnight'),src.indexOf('export default function')), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;let ctx={exports:{},Date,Math};vm.runInNewContext(code,ctx);let lane=ctx.exports.ghostLane;assert.equal(ctx.exports.ghostScales(390).length,2);assert.equal(ctx.exports.ghostScales(1280).length,3);assert.equal(lane([ {top:0,bottom:844,left:0,right:390,width:390,height:844} ],390,844,72*.82,108*.82,72*.82).height,72*.82);const box=(top,bottom,width=390)=>({top,bottom,left:0,right:width,width,height:bottom-top});
for(const [label,boxes]of[['Colattao',[box(0,257.3),box(347.3,844)]],['Bodega',[box(0,306),box(401.3,844)]]]){const result=lane(boxes,390,844,72,108);assert.ok(result,label);assert.equal(result.height,72);assert.equal(result.width,48);assert.ok(boxes.every(b=>b.bottom<=result.top-4||b.top>=result.top+result.height+8));}
const dense=lane([box(0,844)],390,844,72,108);assert.ok(dense);assert.equal(dense.height,72);assert.equal(dense.opacity,.32);assert.ok(dense.top>=48&&dense.top+dense.height<844);assert.equal(lane([],390,844,72,108).height,108);assert.equal(lane([box(0,844,1)],390,844,72,108).height,108);console.log(root+': PASS real mobile-gap regressions; visible compact visitor, no protected text/control overlap, normal footprint preserved, dense-page translucent route prevents starvation');}
