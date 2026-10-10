import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {modelFitSummary,modelPresentation} from './CafeModels.tsx';
import {LOGICAL_ITEMS} from './gameplay.ts';

const root=path.dirname(fileURLToPath(import.meta.url)),records=[];
const provenance=JSON.parse(await fs.readFile(path.join(root,'MODEL-PROVENANCE.json'),'utf8'));
for(const [id,recipe] of Object.entries(modelFitSummary())){
  const def=LOGICAL_ITEMS[id],{scale,trayHeight,trayRadius}=modelPresentation(id,def.radius,def.height);
  if(trayRadius>def.radius||trayHeight>def.height)throw Error(`Tray leaves existing bounds: ${id}`);
  if(id==='item_small_1'&&(trayRadius!==0||trayHeight!==0))throw Error('Single cup must use its own saucer');
  let maxRadius=0,maxHeight=0,vertices=0;
  for(const pose of recipe.poses){
    const filename=path.resolve(root,'public',recipe.models[pose.kind].path),b=await fs.readFile(filename),jl=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+jl).toString()),bin=b.subarray(28+jl),angle=pose.turn||0,c=Math.cos(angle),s=Math.sin(angle);
    const name=path.basename(filename,'.glb'),expected=provenance.variants[name];
    if(crypto.createHash('sha256').update(b).digest('hex')!==expected.sha256)throw Error(`Corrected model hash mismatch: ${name}`);
    if(Math.abs(recipe.models[pose.kind].radius-expected.footprintRadius)>1e-8||Math.abs(recipe.models[pose.kind].height-expected.bounds.size[1])>1e-8)throw Error(`Stale model dimensions: ${name}`);
    for(const mesh of j.meshes)for(const primitive of mesh.primitives){
      const a=j.accessors[primitive.attributes.POSITION],v=j.bufferViews[a.bufferView],offset=(v.byteOffset||0)+(a.byteOffset||0);
      for(let i=0;i<a.count;i++){
        const x=bin.readFloatLE(offset+i*12)*scale,y=bin.readFloatLE(offset+i*12+4)*scale+trayHeight,z=bin.readFloatLE(offset+i*12+8)*scale,xx=x*c+z*s+pose.x*def.radius,zz=-x*s+z*c+pose.z*def.radius,r=Math.hypot(xx,zz);
        if(!Number.isFinite(r+y)||r>def.radius+1e-5||y>def.height+1e-5||y<0)throw Error(`Model leaves existing bounds: ${id}`);
        if(trayRadius>0&&r>trayRadius+1e-5)throw Error(`Tray does not support model: ${id}`);
        maxRadius=Math.max(maxRadius,r);maxHeight=Math.max(maxHeight,y);vertices++;
      }
    }
  }
  records.push({id,pass:true,logicalRadius:def.radius,logicalHeight:def.height,modelMaxRadius:maxRadius,modelMaxHeight:maxHeight,trayRadius,trayHeight,uniformModelScale:scale,instances:recipe.poses.length,verticesChecked:vertices});
}
const repo=path.resolve(root,'../..'),base='7959ff050126ed881cedfbd2e188736d06b5171e',preserved=[];
for(const name of ['Game.tsx','gameplay.ts','levels.ts','constants.ts','input.ts','utils.ts','CafeApp.tsx','brand/colattao.ts']){
  const file=`DEMOS/pocket-cafe/${name}`;
  const a=execFileSync('git',['-c',`safe.directory=${repo.replaceAll('\\','/')}`,'-C',repo,'show',`${base}:${file}`]);
  const b=await fs.readFile(path.join(root,name));
  if(!a.equals(b))throw Error(`Game/core source changed: ${name}`);
  preserved.push({name,sha256:crypto.createHash('sha256').update(b).digest('hex')});
}
const modelHashes=[];
for(const name of ['colattao-cup-saucer','colattao-croissant','colattao-iced-matcha']){
  const bytes=await fs.readFile(path.join(root,'public/assets/models',name+'.glb'));
  modelHashes.push({name,bytes:bytes.length,triangles:provenance.variants[name].triangles,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
const report={date:new Date().toISOString(),pass:true,scope:'Corrected GLB hashes, measured presentation dimensions and actual posed vertices fit unchanged logical radii/heights; game/core sources byte-identical to prior demo commit. Not exhaustive gameplay or mobile performance QA.',base,records,preserved,modelHashes};
await fs.writeFile(path.join(root,'3D-FIT-CHECKS.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
