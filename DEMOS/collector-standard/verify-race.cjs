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
const {CollectorRace,createBrain}=load(path.join(__dirname,'engine.ts'));
const {COLLECTOR_RACE_V1,captureRadius,raceOutcome}=load(path.join(__dirname,'rules.ts'));
const {GROWTH_TIERS}=load(path.join(root,'olympia-sandwich/gameplay.ts'));
const {LEVELS,generateLevelItems}=load(path.join(root,'olympia-sandwich/levels.ts'));
const growth=GROWTH_TIERS.map(g=>({...g,minMass:g.requiredMass}));
const item=(uid,x=0,z=0,tier=1)=>({uid,defId:'tiny_1',x,z,tier,radius:.35,points:10,growthValue:2,initialScale:1,rotationY:0,collected:false,sinkProgress:0});
const race=(items,rules={...COLLECTOR_RACE_V1[0],rivalGrace:0})=>new CollectorRace(items,growth,36,36,rules);
const advance=(r,seconds,direction={x:0,z:0})=>{for(let t=0;t<seconds;t+=1/60)r.step(1/60,direction);};
let r=race([item('inside',captureRadius(.95)-.001),item('outside',captureRadius(.95)+.001)]);
r.step(1/60,{x:0,z:0});assert.equal(r.items[0].owner,'player');assert.equal(r.items[1].owner,null,'capture boundary inflated');
r=race([item('large',0,0,2)]);advance(r,.5);assert.equal(r.player.score,0,'larger ingredient collected too early');
r=race([item('shared')]);r.rival.x=0;r.rival.z=0;advance(r,.5);assert.equal(r.player.score,10,'equal-distance tie should favor player');assert.equal(r.rival.score,0);advance(r,1);assert.equal(r.player.score+r.rival.score,10,'double credit');
r=race([item('owned')]);r.step(1/60,{x:0,z:0});r.rival.x=0;r.rival.z=0;r.player.x=2;advance(r,.3);assert.equal(r.player.score,10,'claimed food stolen');
r=race([item('pause')]);r.step(1/60,{x:0,z:0});const before=JSON.stringify(r);r.step(.1,{x:1,z:1},false);assert.equal(JSON.stringify({...r,events:[]}),JSON.stringify({...JSON.parse(before),events:[]}),'pause changed world');
r=race([]);advance(r,8,{x:1,z:1});assert(r.player.x<=18-captureRadius(r.player.radius)+1e-8);assert(r.player.z<=18-captureRadius(r.player.radius)+1e-8);
r=race([item('deadline')],{...COLLECTOR_RACE_V1[0],seconds:.01});r.step(.1,{x:0,z:0});assert.equal(r.remaining,0);const score=r.player.score;advance(r,1);assert.equal(r.player.score,score,'post-deadline score');
assert.equal(raceOutcome(2390,100,2400),'target-missed');assert.equal(raceOutcome(2400,2400,2400),'rival-ahead');assert.equal(raceOutcome(2400,2390,2400),'won');
r=race([item('grace',-4,-4)],COLLECTOR_RACE_V1[0]);r.rival.x=-4;r.rival.z=-4;advance(r,2);assert.equal(r.rival.score,0);assert.equal(r.items[0].owner,null);advance(r,1);assert.equal(r.rival.score,10);
const fresh=race([item('fresh')]);assert.equal(fresh.player.score,0);assert.equal(fresh.rival.score,0);assert.equal(fresh.elapsed,0);assert.equal(fresh.player.tier,1);

// Fit every nonzero-alpha hull point inside the visible projected capture rim.
const {collectorGeometry}=load(path.join(root,'olympia-sandwich/CollectorGeometry.ts'));
const {roomLayout,projectToCounter}=load(path.join(root,'olympia-sandwich/CounterProjection.ts'));
const footprint=load(path.join(root,'olympia-sandwich/sandwich-footprint.json'));
let fits=0;
for(const [w,h] of [[390,720],[320,610],[844,312]])for(const g of growth)for(const x of [-12,0,12])for(const z of [-12,0,12]){
 const project=(x,z)=>projectToCounter(x,z,36,36,roomLayout(w,h));
 const geometry=collectorGeometry(x,z,g.collectorRadius,project);
 assert(geometry.width>0);assert.equal(geometry.captureRadius,captureRadius(g.collectorRadius));
 for(const [dx,dy] of footprint.points){const p={x:geometry.center.x+dx*geometry.width,y:geometry.center.y+dy*geometry.width};
  for(let i=0;i<geometry.rim.length;i++){const a=geometry.rim[i],b=geometry.rim[(i+1)%geometry.rim.length];assert((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x)>=-1e-8,'sandwich alpha escapes rim');}
 }fits++;
}
const balance=[];
for(let level=0;level<3;level++)for(const mode of ['idle','efficient','delayed']){
 const spec=LEVELS[level],r=new CollectorRace(generateLevelItems(level),growth,spec.arenaWidth,spec.arenaDepth,COLLECTOR_RACE_V1[level]),brain=createBrain();
 while(r.remaining>0){const d=mode==='idle'||mode==='delayed'&&r.elapsed<15?{x:0,z:0}:r.steer(r.player,brain,.2);r.step(1/30,d);}
 const claimed=r.items.filter(i=>i.collected).reduce((sum,i)=>sum+i.points,0);assert.equal(r.player.score+r.rival.score,claimed,'score not earned from unique ingredients');
 assert(r.rival.score>0,'rival made no progress');
 balance.push({level:level+1,mode,score:r.player.score,rival:r.rival.score,playerTier:r.player.tier,rivalTier:r.rival.tier,target:r.rules.target,outcome:r.outcome,x:r.player.x,z:r.player.z});
}
assert(balance.filter(r=>r.mode==='efficient').every(r=>r.outcome==='won'),'efficient route must be winnable at every level');
assert(balance.filter(r=>r.mode==='idle').every(r=>r.outcome!=='won'),'idle play must lose');
assert(balance.some(r=>r.mode==='delayed'&&r.outcome!=='won'),'slow starts should create a losing race');
console.log(JSON.stringify({checks:'boundary, eligibility, tie, ownership, pause, arena containment, deadline, grace, reset, unique earned scores',footprintCases:fits,balance},null,2));
module.exports={load,balance};
