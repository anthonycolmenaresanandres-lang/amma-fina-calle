const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'..');
const local=createRequire(path.join(root,'olympia-sandwich/package.json'));
let ts;try{ts=local('typescript');}catch{ts=createRequire(path.join(root,'../APP/web/package.json'))('typescript');}
const cache=new Map();
function load(file){
 file=path.resolve(file);if(!path.extname(file))file+='.ts';
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 if(cache.has(file))return cache.get(file).exports;
 const module={exports:{}};cache.set(file,module);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 const req=name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name)):local(name);
 vm.runInThisContext('(function(require,module,exports){'+code+'\n})',{filename:file})(req,module,module.exports);return module.exports;
}
const {CollectorRace,createBrain,overlapsObstacle}=load(path.join(__dirname,'engine.ts'));
const {COLLECTOR_RACE_V2,captureRadius,canConsume,raceOutcome}=load(path.join(__dirname,'rules.ts'));
const {GROWTH_TIERS}=load(path.join(root,'olympia-sandwich/gameplay.ts'));
const {LEVELS,generateLevelItems}=load(path.join(root,'olympia-sandwich/levels.ts'));
const {RACE_LEVELS,generateRaceItems}=load(path.join(root,'olympia-sandwich/raceLevels.ts'));
const growth=GROWTH_TIERS.map(g=>({...g,minMass:g.requiredMass}));
const food=(uid,x=15,z=15)=>({uid,defId:'item_tiny_1',x,z,tier:1,radius:.35,points:10,growthValue:2,initialScale:1,rotationY:0,collected:false,sinkProgress:0});
const rules={...COLLECTOR_RACE_V2[0],rivalSpeed:0,rivalGrace:0,captureGrace:0,target:10};
const make=(items=[food('far')],overrides={},world={spawns:[{x:0,z:0},{x:0,z:0}]})=>new CollectorRace(items,growth,36,36,{...rules,...overrides},world);
const advance=(r,seconds,d={x:0,z:0})=>{for(let n=0;n<Math.ceil(seconds*60);n++)r.step(1/60,d);};
const big=a=>Object.assign(a,{radius:1.5,tier:2,mass:25,score:120});
assert(!canConsume(1,1,0));assert(!canConsume(1.299,1,0));assert(canConsume(1.3,1,0));
assert(canConsume(1.5,.95,.494));assert(!canConsume(1.5,.95,.496),'mere rim overlap must not capture');
let r=make();big(r.player);r.rival.mass=10;r.rival.score=50;advance(r,.1);assert(r.rival.alive,'capture hold too short');advance(r,.11);
assert(!r.rival.alive);assert.equal(r.player.score,170);assert.equal(r.player.mass,35);assert.equal(r.rival.score,0);assert(!r.done,'surviving food ends round too soon');advance(r,.5);assert.equal(r.player.score,170,'repeat capture reward');
r=make();big(r.rival);r.player.mass=10;r.player.score=50;advance(r,.21);assert(!r.player.alive);assert.equal(r.result.reason,'player-consumed');assert.equal(r.result.outcome,'player-consumed');assert.equal(r.result.pointsBeforeCapture,50);assert.equal(r.rival.score,170);
const ended=r.result,endedScore=r.rival.score;advance(r,1);assert.strictEqual(r.result,ended,'result evaluated twice');assert.equal(r.rival.score,endedScore);
r=make();advance(r,1);assert(r.player.alive&&r.rival.alive,'equal-size capture');
r=make();big(r.player);r.rival.x=.5;advance(r,.3);assert(r.rival.alive);r.rival.x=0;advance(r,.1);r.rival.x=.6;advance(r,1/60);r.rival.x=0;advance(r,.1);assert(r.rival.alive,'containment hold failed to reset');advance(r,.11);assert(!r.rival.alive);
r=make(undefined,{captureGrace:4});big(r.player);advance(r,3.9);assert(r.rival.alive);advance(r,.3);assert(!r.rival.alive);
r=make(undefined,{rivalCount:2,behavior:'hunt'},{spawns:[{x:-12,z:12},{x:0,z:0},{x:.1,z:0}]});big(r.rival);r.rivals[1].score=40;r.rivals[1].mass=6;
const brain=createBrain();r.steer(r.rival,brain,.4);assert.equal(brain.opponent,r.rivals[1].id,'rival must consider other rivals as prey');advance(r,.21);assert(!r.rivals[1].alive&&r.player.alive);assert.equal(r.rival.score,160);
r=make([food('pending',0,0)],{captureHold:.05});big(r.player);r.rival.score=50;r.rival.mass=10;r.items[0].owner='rival';r.items[0].sinkProgress=.01;
advance(r,.06);assert(!r.rival.alive);assert.equal(r.items[0].owner,'player');assert(!r.items[0].collected&&!r.done,'pending pickup was discarded');advance(r,.3);assert.equal(r.player.score,180);assert.equal(r.result.reason,'counter-cleared');assert(r.remaining>44);
r=make([food('last',0,0)]);r.step(1/60,{x:0,z:0});assert(!r.done);assert(r.items[0].sinkProgress>0);advance(r,.3);assert.equal(r.result.reason,'counter-cleared');assert(r.rival.alive,'food clear should not require rival defeat');assert.equal(r.result.score,10);
r=make([]);r.step(1/60,{x:0,z:0});assert.equal(r.result.reason,'counter-cleared');assert.equal(r.remaining,45);
r=make([],{},{spawns:[{x:0,z:0},{x:-10,z:-10}],scheduledSpawns:[{at:.4,items:[food('scheduled',0,0)]}]});advance(r,.3);assert(!r.done&&r.pendingSpawns===1);advance(r,.15);assert(!r.done&&r.pendingSpawns===0);advance(r,.3);assert.equal(r.result.reason,'counter-cleared');
r=make([],{seconds:.1},{scheduledSpawns:[{at:2,items:[food('later')]}]});advance(r,.2);assert.equal(r.result.reason,'time-up');assert.equal(r.remaining,0);
r=make([food('cutoff',0,0)],{seconds:.05});advance(r,.1);assert.equal(r.result.reason,'time-up');assert.equal(r.player.score,0);advance(r,1);assert.equal(r.player.score,0,'post-cutoff score');
r=make();big(r.player);advance(r,.1);const paused=JSON.stringify({...r,events:[]});r.step(.1,{x:1,z:1},false);assert.equal(JSON.stringify({...r,events:[]}),paused,'pause changed combat or world');
const fresh=make();assert(!fresh.done);assert(fresh.actors.every(a=>a.alive&&a.score===0&&a.mass===0&&a.tier===1));assert.equal(fresh.elapsed,0);assert.equal(fresh.remaining,45);
r=make([food('inside',captureRadius(.95)-.001,0),food('outside',captureRadius(.95)+.001,0)]);r.rival.x=-10;r.step(1/60,{x:0,z:0});assert.equal(r.items[0].owner,'player');assert.equal(r.items[1].owner,null);
r=make();r.step(60,{x:0,z:0});assert.equal(r.result.reason,'time-up');assert.equal(r.remaining,0);assert.equal(r.elapsed,45,'slow frame extended maximum round duration');
assert.equal(raceOutcome(10,9,10),'won');assert.equal(raceOutcome(10,10,10),'rival-ahead');

const {collectorGeometry}=load(path.join(root,'olympia-sandwich/CollectorGeometry.ts'));
const {roomLayout,projectToCounter}=load(path.join(root,'olympia-sandwich/CounterProjection.ts'));
const footprint=load(path.join(root,'olympia-sandwich/sandwich-footprint.json'));
let fits=0;
for(const[w,h]of[[390,720],[320,610],[844,312]])for(const g of growth)for(const x of[-12,0,12])for(const z of[-12,0,12]){
 const geometry=collectorGeometry(x,z,g.collectorRadius,(x,z)=>projectToCounter(x,z,36,36,roomLayout(w,h)));
 for(const[dx,dy]of footprint.points){const p={x:geometry.center.x+dx*geometry.width,y:geometry.center.y+dy*geometry.width};for(let i=0;i<geometry.rim.length;i++){const a=geometry.rim[i],b=geometry.rim[(i+1)%geometry.rim.length];assert((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x)>=-1e-8);}}fits++;
}
const nearestMean=items=>items.reduce((sum,a)=>sum+Math.min(...items.filter(b=>b!==a).map(b=>Math.hypot(a.x-b.x,a.z-b.z))),0)/items.length;
const reports=[];
for(let index=0;index<3;index++){
 const spec=RACE_LEVELS[index],items=generateRaceItems(index),old=generateLevelItems(index),profile=COLLECTOR_RACE_V2[index];
 assert(items.length>old.length*1.29);assert(nearestMean(items)>nearestMean(old)*1.15,'spacing did not improve');
 assert.equal(spec.spawns.length,profile.rivalCount+1);assert(spec.spawns.every((a,i)=>spec.spawns.slice(i+1).every(b=>Math.hypot(a.x-b.x,a.z-b.z)>=12)),'unfair spawn spacing');
 // Flood every walkable maximum-size cell; every food item must touch that component.
 const radius=captureRadius(growth.at(-1).collectorRadius),step=1,left=-spec.arenaWidth/2+radius,top=-spec.arenaDepth/2+radius;
 const cols=Math.floor((spec.arenaWidth-2*radius)/step)+1,rows=Math.floor((spec.arenaDepth-2*radius)/step)+1,free=new Set(),point=id=>({x:left+id%cols,z:top+Math.floor(id/cols)});
 for(let id=0;id<cols*rows;id++)if(!spec.obstacles.some(o=>overlapsObstacle(point(id),radius+.02,o)))free.add(id);
 const seen=new Set(),queue=[free.values().next().value];while(queue.length){const id=queue.pop();if(seen.has(id))continue;seen.add(id);const x=id%cols,y=Math.floor(id/cols);for(const next of[x? id-1:-1,x<cols-1?id+1:-1,y?id-cols:-1,y<rows-1?id+cols:-1])if(free.has(next)&&!seen.has(next))queue.push(next);}
 assert.equal(seen.size,free.size,'maximum-size route disconnected');
 const positions=[...seen].map(point);for(const item of items)assert(positions.some(p=>Math.hypot(p.x-item.x,p.z-item.z)<radius),'unreachable ingredient');
 const budget=items.reduce((n,i)=>n+i.points,0);assert(profile.target<budget/(profile.rivalCount+1)*1.5,'unreachable target share');
 const simulation=new CollectorRace(items,growth,spec.arenaWidth,spec.arenaDepth,profile,spec),driver=createBrain();
 while(!simulation.done){simulation.step(1/30,simulation.steer(simulation.player,driver,.15));}
 assert(simulation.elapsed<=45.00001);assert.equal(simulation.actors.reduce((n,a)=>n+a.score,0),simulation.items.filter(i=>i.collected).reduce((n,i)=>n+i.points,0),'capture created or lost earned points');
 reports.push({level:index+1,size:spec.arenaWidth,items:items.length,previousItems:old.length,meanSpacing:Number(nearestMean(items).toFixed(2)),previousMeanSpacing:Number(nearestMean(old).toFixed(2)),rivals:profile.rivalCount,behavior:profile.behavior,pointBudget:budget,target:profile.target,driverScore:simulation.result.pointsBeforeCapture||simulation.player.score,leader:simulation.leaderScore,outcome:simulation.outcome,end:simulation.result.reason,seconds:Number(simulation.elapsed.toFixed(2))});
}
console.log(JSON.stringify({checks:'both capture directions; rival versus rival; equal-size/overlap safety; continuous hold/grace; bounded transfer and in-flight ownership; immediate food clear; scheduled spawns; one immutable result; pause/reset/timer cutoff; maximum-size connectivity and all-food reachability',footprintCases:fits,levels:reports},null,2));
module.exports={load,reports};
