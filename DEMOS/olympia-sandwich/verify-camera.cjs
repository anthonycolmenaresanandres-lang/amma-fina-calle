const assert=require('node:assert/strict'),path=require('node:path');
const{load}=require('../collector-standard/verify-race.cjs');
const{CounterCamera}=load(path.join(__dirname,'CounterCamera.ts'));
const{resultSummary}=load(path.join(__dirname,'ResultSummary.ts'));
const{collectorGeometry}=load(path.join(__dirname,'CollectorGeometry.ts'));
const{GROWTH_TIERS}=load(path.join(__dirname,'gameplay.ts'));
const footprint=load(path.join(__dirname,'sandwich-footprint.json'));
const near=(a,b,label)=>assert(Math.abs(a-b)<1e-8,label);
const input={width:390,height:720,rearEdge:152.1,arenaWidth:48,arenaDepth:48,x:0,z:0,radius:.95,active:true,reducedMotion:false};
let camera=new CounterCamera(),view=camera.update(input,1/60);
const first=view;
for(const[x,z]of[[0,8],[8,8],[-8,-8],[0,0]]){
 view=camera.update({...input,x,z},1/60);
 near(view.scale,first.scale,'depth changed food scale');
 near(view.project(x,z).x,first.anchorX,'lateral follow drift');near(view.project(x,z).y,first.anchorY,'depth follow drift');
 near(view.project(x+1,z).x-view.project(x,z).x,first.scale,'inconsistent horizontal speed');
 near(view.project(x+1,z+1).x,view.project(x+1,z).x,'depth movement sheared X');
 near(view.project(x,z+1).y-view.project(x,z).y,first.depthScale,'inconsistent depth speed');
}
// Holding still does not keep recentering the world.
let stopped=view;view=camera.update(input,.1);near(view.x,stopped.x);near(view.z,stopped.z);near(view.scale,stopped.scale);
// Only a growth event changes zoom, monotonically and without overshoot.
view=camera.update({...input,radius:2},1/60);assert(view.scale<first.scale&&view.scale>view.target);
const beforePause=view;
view=camera.update({...input,x:12,z:12,radius:4.6,active:false},.1);
near(view.x,beforePause.x);near(view.z,beforePause.z);near(view.scale,beforePause.scale,'pause moved camera');
let previous=view.scale;
for(let i=0;i<150;i++){view=camera.update({...input,radius:2},1/60);assert(view.scale<=previous&&view.scale>=view.target);previous=view.scale;}
assert(Math.abs(view.scale-view.target)<.001);
view=camera.update({...input,radius:4.6,reducedMotion:true},1/60);near(view.scale,view.target);
camera=new CounterCamera();camera.update(input,1/60);
view=camera.update({...input,radius:4.6},1/60);
assert(collectorGeometry(0,0,4.6,view.project).rim.every(p=>p.x>=view.bounds.left&&p.x<=view.bounds.right&&p.y>=view.bounds.top&&p.y<=view.bounds.bottom),'capture growth clipped rim during zoom');
// Clamp to real arena edges, not the decorative room bitmap; player rims stay in frame.
let fits=0;
for(const[width,height]of[[390,720],[320,610],[844,312]])for(const tier of GROWTH_TIERS)for(const xSign of[-1,0,1])for(const zSign of[-1,0,1]){
 const radius=tier.collectorRadius,arenaWidth=72,arenaDepth=72;
 const x=xSign*(arenaWidth/2-radius),z=zSign*(arenaDepth/2-radius),rearEdge=Math.min(height*.26,Math.max(105,width*.39));
 camera=new CounterCamera();view=camera.update({...input,width,height,arenaWidth,arenaDepth,radius,x,z,rearEdge},1/60);
 const expected=Math.min(Math.min(width*.14,height*.18)*Math.sqrt(.95/radius),Math.min(width*.36,height*.45)/(radius*1.8));
 near(view.scale,expected,'existing food size changed');
 if(xSign===-1)near(view.project(-arenaWidth/2,z).x,view.bounds.left);
 if(xSign===1)near(view.project(arenaWidth/2,z).x,view.bounds.right);
 if(zSign===-1)near(view.project(x,-arenaDepth/2).y,view.bounds.top);
 if(zSign===1)near(view.project(x,arenaDepth/2).y,view.bounds.bottom);
 const geometry=collectorGeometry(x,z,radius,view.project);
 assert(geometry.rim.every(p=>p.x>=0&&p.x<=width&&p.y>=rearEdge&&p.y<=height),'player rim clipped');
 for(const[dx,dy]of footprint.points){const p={x:geometry.center.x+dx*geometry.width,y:geometry.center.y+dy*geometry.width};for(let i=0;i<geometry.rim.length;i++){const a=geometry.rim[i],b=geometry.rim[(i+1)%geometry.rim.length];assert((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x)>=-1e-8,'sandwich art outside collection rim');}}
 fits++;
}
camera.reset();view=camera.update({...input,width:320,height:610,active:false},1/60);assert(Number.isFinite(view.scale)&&view.scale>0,'resize invalid');
const resultInput={won:false,reason:'time-up',score:2200,target:3000,rivalScore:1000,pointsBeforeCapture:0};
let result=resultSummary(resultInput);assert.equal(result.title,'You lose');assert.equal(result.reason,'Target missed by 800 points.');assert.equal(result.score,2200);
result=resultSummary({...resultInput,won:true,score:3500,reason:'counter-cleared'});assert.equal(result.title,'You win!');assert.equal(result.ending,'Counter cleared');assert(result.reason.startsWith('Target reached.'));
result=resultSummary({...resultInput,reason:'player-consumed',score:0,pointsBeforeCapture:2200});assert.equal(result.title,'You lose');assert.equal(result.score,0);assert.equal(result.reason,'A larger rival ate your sandwich.');assert(result.captureNote.includes('2,200'));
result=resultSummary({...resultInput,score:3500,rivalScore:3500});assert(result.reason.includes('tied'));
result=resultSummary({...resultInput,score:3500,rivalScore:4000});assert(result.reason.includes('rival finished ahead'));
console.log(`PASS: stable movement/scale, world-edge clamping, paused/growth/reduced-motion camera, ${fits} unchanged-scale alpha/rim cases, five explicit ending summaries.`);
