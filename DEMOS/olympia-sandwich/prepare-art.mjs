import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const sharp=require(process.argv[2]||'C:/dev/amma/amma-fina-calle/APP/web/node_modules/sharp');
sharp.concurrency(1);sharp.cache(false);
const root=path.dirname(fileURLToPath(import.meta.url));
const src=path.join(root,'art/generated'),out=path.join(root,'public/assets/art');
fs.mkdirSync(out,{recursive:true});
const definitions=[
 ['open-sandwich-v1.png','open-sandwich.webp',512,null],
 ['finished-sandwich-v1.png','finished-sandwich.webp',720,{left:31,top:394,width:1193,height:500}],
 ['cooked-filling-v2.png','cooked-filling.webp',256,null],
 ['cheese-v1.png','cheese.webp',256,null],
 ['bread-pickup-v1.png','bread.webp',256,null],
 ['restaurant-backdrop-v1.png','restaurant.webp',768,null],
 ['countertop-v1.png','countertop.webp',512,null],
];
const assets=[];
for(const [original,file,width,crop]of definitions){
 const input=path.join(src,original),output=path.join(out,file);
 let image=sharp(input);if(crop)image=image.extract(crop);
 await image.resize({width,withoutEnlargement:true}).webp({quality:84,alphaQuality:100,effort:2}).toFile(output);
 const meta=await sharp(output).metadata(),before=await sharp(input).metadata();
 if(before.hasAlpha&&!meta.hasAlpha)throw new Error('Alpha lost: '+file);
 assets.push({original,file:'./assets/art/'+file,width:meta.width,height:meta.height,alpha:!!meta.hasAlpha,bytes:fs.statSync(output).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex'),originalSha256:crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex'),crop:crop||null});
}
const totalBytes=assets.reduce((n,a)=>n+a.bytes,0);
if(totalBytes>1500000)throw new Error('Art exceeds 1.5 MB budget');
fs.writeFileSync(path.join(root,'art/runtime-manifest.json'),JSON.stringify({assets,totalBytes,notes:'Mechanical runtime derivatives only; original imagegen art preserved. Encoded sequentially with one worker, no shared dependency writes.'},null,2));
console.log(JSON.stringify({totalBytes,assets},null,2));
