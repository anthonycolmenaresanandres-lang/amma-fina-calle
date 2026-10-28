const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{createRequire}=require('node:module'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),local=createRequire(path.join(root,'APP/web/package.json')),ts=local('typescript'),cache=new Map();
function load(file){file=path.resolve(file);if(!path.extname(file))file+='.ts';if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInThisContext('(function(require,module,exports){'+code+'\n})',{filename:file})(name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name)):local(name),module,module.exports);return module.exports;}
const {createChocolateRace,generateChocolateItems,COUNTERS,GROWTH}=load(path.join(root,'APP/web/src/app/royal-chocolate/game-config.ts'));
const {CollectorRace,overlapsObstacle}=load(path.join(root,'APP/web/src/app/royal-chocolate/collector-standard/engine.ts'));
const {COLLECTOR_RACE_V2,captureRadius,canConsume}=load(path.join(root,'APP/web/src/app/royal-chocolate/collector-standard/rules.ts'));
const report=[];
for(let level=0;level<3;level++){
 const spec=COUNTERS[level],items=generateChocolateItems(level),r=createChocolateRace(level);assert.equal(items.length,spec.count);assert.equal(r.rivals.length,level+1);assert.deepEqual(items,generateChocolateItems(level));assert.equal(new Set(items.map(i=>i.uid)).size,items.length);
 assert(items.reduce((s,i)=>s+i.points,0)>spec.target*2);assert(items.every(a=>items.every(b=>a===b||Math.hypot(a.x-b.x,a.z-b.z)>2.3)));
 for(const spawn of spec.spawns)assert(items.filter(i=>i.tier===1&&Math.hypot(i.x-spawn.x,i.z-spawn.z)<8).length>=8,'starter food');
 // At maximum size, all walkable cells form one connected component and all products are reachable.
 const radius=captureRadius(GROWTH.at(-1).collectorRadius),step=.75,left=-spec.size/2+radius,cols=Math.floor((spec.size-2*radius)/step)+1;
 const point=id=>({x:left+(id%cols)*step,z:left+Math.floor(id/cols)*step});const free=new Set();for(let id=0;id<cols*cols;id++)if(!spec.obstacles.some(o=>overlapsObstacle(point(id),radius+.08,o)))free.add(id);
 const visited=new Set(),queue=[free.values().next().value];while(queue.length){const id=queue.pop();if(visited.has(id)||!free.has(id))continue;visited.add(id);const x=id%cols,y=Math.floor(id/cols);if(x>0)queue.push(id-1);if(x<cols-1)queue.push(id+1);if(y>0)queue.push(id-cols);if(y<cols-1)queue.push(id+cols);}
 assert.equal(visited.size,free.size,'disconnected max-size route');for(const item of items)assert([...visited].some(id=>Math.hypot(point(id).x-item.x,point(id).z-item.z)<radius*.8),'unreachable product level '+level+' '+JSON.stringify(item));
 const before=JSON.stringify({...r,events:[]});r.step(.5,{x:1,z:1},false);assert.equal(JSON.stringify({...r,events:[]}),before);r.step(60,{x:0,z:0});assert(r.done);assert.equal(r.result.reason,'time-up');assert.equal(r.remaining,0);const stopped=JSON.stringify(r.result);r.step(10,{x:1,z:1});assert.equal(JSON.stringify(r.result),stopped);
 assert.equal(r.rules.rivalSpeed,COLLECTOR_RACE_V2[level].rivalSpeed);assert.equal(r.rules.behavior,COLLECTOR_RACE_V2[level].behavior);
 report.push({level:level+1,products:items.length,target:spec.target,totalPoints:items.reduce((s,i)=>s+i.points,0),rivals:r.rivals.length,connectedCells:visited.size});
}
const food={uid:'last',defId:'chocolate',x:0,z:0,tier:1,radius:.44,points:40,growthValue:1,initialScale:1,rotationY:0,collected:false,sinkProgress:0};
const make=(items=[{...food,x:14,z:14}],spawns=[{x:0,z:0},{x:0,z:0}])=>new CollectorRace(items,GROWTH,38,38,{...COLLECTOR_RACE_V2[0],captureGrace:0,rivalGrace:0,rivalSpeed:0,target:40},{spawns});
const advance=(r,s)=>{for(let n=0;n<Math.ceil(s*60);n++)r.step(1/60,{x:0,z:0});};
assert(!canConsume(1.299,1,0));assert(canConsume(1.3,1,0));assert(!canConsume(1.5,1,.5));
for(const reverse of [false,true]){const r=make(),big=reverse?r.rival:r.player,small=reverse?r.player:r.rival;Object.assign(big,{radius:3,tier:3,mass:24,score:80});small.score=50;small.mass=8;advance(r,.1);assert(small.alive);advance(r,.11);assert(!small.alive);assert.equal(big.score,130);assert.equal(big.mass,32);assert.equal(small.score,0);if(reverse){assert.equal(r.result.outcome,'player-consumed');assert.equal(r.result.pointsBeforeCapture,50);}}
let r=make([{...food}],[{x:0,z:0},{x:10,z:10}]);advance(r,.1);assert(!r.done);advance(r,.3);assert.equal(r.result.reason,'counter-cleared');assert.equal(r.result.outcome,'won');assert.equal(r.result.score,40);assert(r.remaining>44);const elapsed=r.elapsed;advance(r,10);assert.equal(r.elapsed,elapsed);
r=make([]);r.step(.01,{x:0,z:0});assert.equal(r.result.reason,'counter-cleared');assert.equal(r.result.outcome,'target-missed');
for(const p of ['DEMOS/collector-standard/engine.ts','DEMOS/collector-standard/rules.ts']){const old=execFileSync('git',['show','443de7dd54303cbc8ea81ee8fcd835ab4566c73f:'+p],{cwd:root});const now=fs.readFileSync(path.join(root,p));assert.equal(now.toString().replaceAll('\r\n','\n'),old.toString().replaceAll('\r\n','\n'),'shared core changed');const snapshot=fs.readFileSync(path.join(root,'APP/web/src/app/royal-chocolate/collector-standard',path.basename(p)));assert.equal(snapshot.toString().replaceAll('\r\n','\n'),old.toString().replaceAll('\r\n','\n'),'runtime core snapshot changed');}
const menu=load(path.join(root,'APP/web/src/app/royal-chocolate/menu-data.ts')).royalMenu;assert.equal(menu.length,3);assert.equal(menu.flatMap(g=>g.items).length,10);assert(menu.flatMap(g=>g.items).every(i=>!('price' in i)));assert(!JSON.stringify(menu).includes('$'));

// Real Royal configuration: reciprocal capture, interrupted contact, tied sizes,
// contention, in-flight food and reset all keep the frozen accounting contract.
const isolatedRoyal=()=>{
 const game=createChocolateRace(0);
 game.items.forEach((item,i)=>{item.collected=i!==0;item.owner=null;});
 Object.assign(game.items[0],{x:20,z:20,renderX:20,renderZ:20});
 game.rules.captureGrace=0;game.rules.rivalGrace=999;
 Object.assign(game.player,{x:0,z:0});Object.assign(game.rival,{x:0,z:0});
 return game;
};
for(const reverse of [false,true]){
 const game=isolatedRoyal(),big=reverse?game.rival:game.player,small=reverse?game.player:game.rival;
 Object.assign(big,{radius:3,tier:3,mass:24,score:80});Object.assign(small,{score:50,mass:8});
 const captures=[];
 for(let i=0;i<30;i++){game.step(1/60,{x:0,z:0});captures.push(...game.events.filter(e=>e.type==='capture'));}
 assert(!small.alive);assert.equal(captures.length,1);assert.equal(captures[0].prey,small.id);assert.equal(big.score,130);assert.equal(big.mass,32);
 if(reverse){assert.equal(game.result.reason,'player-consumed');assert.equal(game.result.pointsBeforeCapture,50);const result=game.result;advance(game,1);assert.equal(game.result,result);}
 else assert(!game.done,'eating a rival must not end a still-populated round');
}
for(const radius of [1.55,1.55*1.299]){
 const game=isolatedRoyal();game.player.radius=radius;advance(game,.5);
 assert(game.player.alive&&game.rival.alive,'equal/similar collectors may not eat each other');
}
{
 const game=isolatedRoyal();Object.assign(game.player,{radius:3,tier:3,mass:24});
 advance(game,.1);game.rival.x=5;advance(game,.1);game.rival.x=0;advance(game,.1);assert(game.rival.alive,'leaving containment resets the hold');
 advance(game,.11);assert(!game.rival.alive);
}
{
 const game=isolatedRoyal();Object.assign(game.player,{radius:3,tier:3,mass:24});
 Object.assign(game.items[0],{owner:game.rival.id,sinkProgress:.01,points:40,growthValue:1});
 advance(game,.21);assert(!game.rival.alive);assert.equal(game.items[0].owner,'player');
 advance(game,.1);assert(game.items[0].collected);assert.equal(game.player.score,40);assert.equal(game.player.mass,25);assert.equal(game.result.reason,'counter-cleared');
}
{
 const game=new CollectorRace([{...food,x:14,z:14}],GROWTH,38,38,{...COLLECTOR_RACE_V2[1],captureGrace:0,rivalGrace:999},{spawns:[{x:0,z:0},{x:0,z:0},{x:0,z:0}]});
 Object.assign(game.player,{radius:3,tier:3,mass:24});Object.assign(game.rivals[0],{radius:3,tier:3,mass:24});game.rivals[1].score=70;
 const captures=[];for(let i=0;i<30;i++){game.step(1/60,{x:0,z:0});captures.push(...game.events.filter(e=>e.prey==='rival-2'));}
 assert.equal(captures.length,1,'two predators cannot consume the same prey twice');assert.equal(game.player.score+game.rivals[0].score,70);
}
{
 const fine=isolatedRoyal(),full=isolatedRoyal(),diagonal=isolatedRoyal();
 for(const game of [fine,full,diagonal])game.rival.x=-20;
 fine.step(.1,{x:.25,z:0});full.step(.1,{x:1,z:0});diagonal.step(.1,{x:1,z:1});
 assert(Math.abs(fine.player.x/full.player.x-.25)<1e-8,'short drag must give quarter speed');
 assert(Math.abs(Math.hypot(diagonal.player.x,diagonal.player.z)-full.player.x)<1e-8,'diagonal input must not boost speed');
 assert.equal(fine.remaining,full.remaining,'fine steering must not slow the timer');assert.equal(fine.player.speed,GROWTH[0].speed);
 const restarted=createChocolateRace(0);assert.equal(restarted.player.score,0);assert(restarted.player.alive&&restarted.rival.alive);assert.equal(restarted.elapsed,0);assert.equal(restarted.remaining,45);assert.equal(restarted.result,null);
}
for(let level=0;level<3;level++){
 const game=createChocolateRace(level),spec=COUNTERS[level],oldSize=[38,46,54][level];
 assert(spec.size*spec.size>oldSize*oldSize*2,'world area should more than double');
 assert.equal(game.player.radius,1.55);assert.equal(game.rules.seconds,45);assert.equal(game.rules.target,[1300,2200,3200][level]);
 // Expanded regions contain food, including every quadrant beyond the old walls.
 for(const sx of [-1,1])for(const sz of [-1,1])assert(game.items.some(i=>i.x*sx>oldSize/2&&i.z*sz>oldSize/2),'new outer quadrant has no food');
 // Sample the traversable counter: no empty area is more than a short walk from food.
 for(let z=-spec.size/2+5;z<spec.size/2-5;z+=5)for(let x=-spec.size/2+5;x<spec.size/2-5;x+=5){
  if(spec.obstacles.some(o=>overlapsObstacle({x,z},2,o)))continue;
  assert(game.items.some(i=>Math.hypot(x-i.x,z-i.z)<9),'empty expansion region');
 }
 game.rules.rivalGrace=999;game.rules.captureGrace=999;
 for(const direction of [{x:1,z:0},{x:-1,z:0},{x:0,z:1},{x:0,z:-1}]){
  // All food collected except a distant dummy removes item blocking without ending.
  game.items.forEach(i=>i.collected=true);Object.assign(game.items[0],{collected:false,x:0,z:0,tier:1});
  game.remaining=999;game.result=null;Object.assign(game.player,{x:spec.size/2-2,z:spec.size/2-2});
  for(let n=0;n<200;n++)game.step(.1,direction);
  const margin=captureRadius(game.player.radius);assert(Math.abs(game.player.x)<=spec.size/2-margin+1e-8);assert(Math.abs(game.player.z)<=spec.size/2-margin+1e-8);
 }
}
report.push({regressions:'two-way Royal capture, tied/similar size safety, interrupted hold, single capture under contention, pending-food transfer, analog speed/clock, clean restart, expanded populated world/boundaries'});


const {drawCounter}=load(path.join(root,'APP/web/src/app/royal-chocolate/play/renderer.ts'));
for(let level=0;level<3;level++)for(const [width,height] of [[320,600],[390,700],[844,280],[1440,750]]){
 const game=createChocolateRace(level),half=COUNTERS[level].size/2;
 for(const sx of [-1,1])for(const sz of [-1,1]){
  Object.assign(game.player,{x:sx*(half-2),z:sz*(half-2)});
  const labels=[],arcs=[];
  const ctx=new Proxy({fillText:(text,x,y)=>labels.push({text,x,y}),arc:(x,y,r)=>arcs.push({x,y,r})},{get:(target,key)=>target[key]||(()=>{}),set:(target,key,value)=>(target[key]=value,true)});
  drawCounter(ctx,width,height,game,level,{},null);
  const player=labels.find(l=>l.text==='YOU');assert(player.x>=0&&player.x<=width&&player.y>=-30&&player.y<=height,'camera lost player at world edge');
  assert(Math.abs(arcs[0].r-1.55*.9*Math.max(12,Math.min(18,width/28)))<1e-8,'object scale changed');
 }
}
const {createBrain}=load(path.join(root,'APP/web/src/app/royal-chocolate/collector-standard/engine.ts'));
const simulations=[];
for(let level=0;level<3;level++){
 const game=createChocolateRace(level),brain=createBrain(),started=performance.now();let frames=0;
 while(!game.done&&frames++<2800)game.step(1/60,game.steer(game.player,brain,.12));
 assert(game.done);assert(game.result.outcome==='won','full-speed legal route must be able to win level '+(level+1)+': '+JSON.stringify(game.result));
 simulations.push({level:level+1,score:game.result.score,outcome:game.result.outcome,simulatedSeconds:game.elapsed,wallMs:Math.round(performance.now()-started)});
}
report.push({camera:'all four world corners at 320/390/844/1440; player retained; unchanged object scale',legalRouteWins:simulations});

console.log(JSON.stringify({status:'PASS',coverage:'3 deterministic layouts, spacing/starter budgets, max-size route/product reachability, pause/clock/end/replay accounting, reciprocal capture/hold/threshold, clear/win/loss, menu price omission, frozen core',levels:report},null,2));
