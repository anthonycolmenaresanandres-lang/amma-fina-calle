import {captureRadius,canConsume,raceOutcome,type RaceRules} from './rules';
export type ActorId='player'|'rival'|`rival-${number}`;
export interface Direction{x:number;z:number}
export interface Ingredient extends Direction{uid:string;defId:string;tier:number;radius:number;points:number;growthValue:number;initialScale:number;rotationY:number;collected:boolean;sinkProgress:number}
export interface RaceItem extends Ingredient{owner:ActorId|null;renderX:number;renderZ:number}
export interface GrowthStage{tier:number;minMass:number;collectorRadius:number;speed:number;title:string}
export interface Actor extends Direction{id:ActorId;mass:number;tier:number;radius:number;speed:number;score:number;alive:boolean}
export interface Obstacle extends Direction{halfWidth:number;halfDepth:number}
export interface RaceWorld{spawns?:Direction[];obstacles?:Obstacle[];scheduledSpawns?:{at:number;items:Ingredient[]}[]}
export type EndReason='player-consumed'|'counter-cleared'|'time-up';
export type Outcome=ReturnType<typeof raceOutcome>|'player-consumed';
export interface RaceResult{reason:EndReason;outcome:Outcome;score:number;rivalScore:number;remaining:number;pointsBeforeCapture:number}
export interface RaceEvent{type:'claim'|'score'|'grow'|'capture';actor:ActorId;item?:RaceItem;tier?:number;prey?:ActorId;points?:number}
interface Brain{target:string|null;nextDecision:number;lastX:number;lastZ:number;stuck:number;path?:Direction[];pathTier?:number;intent?:'food'|'chase'|'flee';opponent?:ActorId}
const distance=(a:Direction,b:Direction)=>Math.hypot(a.x-b.x,a.z-b.z);
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export const createBrain=():Brain=>({target:null,nextDecision:0,lastX:0,lastZ:0,stuck:0,intent:'food'});
export const overlapsObstacle=(p:Direction,radius:number,o:Obstacle)=>Math.hypot(p.x-clamp(p.x,o.x-o.halfWidth,o.x+o.halfWidth),p.z-clamp(p.z,o.z-o.halfDepth,o.z+o.halfDepth))<radius;

/** All actors share movement, food, size gates, combat and earned-point accounting. */
export class CollectorRace{
 readonly player:Actor;readonly rivals:Actor[];readonly items:RaceItem[];readonly obstacles:Obstacle[];
 remaining:number;elapsed=0;events:RaceEvent[]=[];result:Readonly<RaceResult>|null=null;
 private cachedActors:Actor[];
 private brains=new Map<ActorId,Brain>();private holds=new Map<string,number>();
 private spawnQueue:{at:number;items:Ingredient[]}[];private pointsBeforeCapture=0;
 constructor(items:Ingredient[],readonly growth:readonly GrowthStage[],readonly width:number,readonly depth:number,readonly rules:RaceRules,world:RaceWorld={}){
  const first=growth[0],spawns=world.spawns||[{x:0,z:0},{x:-10,z:-10},{x:10,z:-10},{x:0,z:12}];
  const actor=(id:ActorId,p:Direction):Actor=>({id,...p,mass:0,tier:1,radius:first.collectorRadius,speed:first.speed,score:0,alive:true});
  this.player=actor('player',spawns[0]);this.rivals=Array.from({length:rules.rivalCount},(_,i)=>actor(i===0?'rival':`rival-${i+1}`,spawns[i+1]||spawns[0]));
  this.cachedActors=[this.player,...this.rivals];
  this.items=items.map(i=>this.place(i));this.obstacles=(world.obstacles||[]).map(o=>({...o}));this.remaining=rules.seconds;
  this.spawnQueue=(world.scheduledSpawns||[]).map(s=>({at:s.at,items:s.items.map(i=>({...i}))})).sort((a,b)=>a.at-b.at);
  this.rivals.forEach((a,i)=>{const brain=createBrain();brain.nextDecision=rules.rivalGrace+i*.15;this.brains.set(a.id,brain);});
  for(const a of this.actors)this.resolvePosition(a);
 }
 get actors(){return this.cachedActors;}
 get rival(){return this.rivals[0];}
 get leaderScore(){return Math.max(0,...this.rivals.filter(a=>a.alive).map(a=>a.score));}
 get pendingSpawns(){return this.spawnQueue.length;}
 get done(){return this.result!==null;}
 get outcome():Outcome{return this.result?.outcome||raceOutcome(this.player.score,this.leaderScore,this.rules.target);}
 private place(i:Ingredient):RaceItem{return{...i,collected:false,sinkProgress:0,owner:null,renderX:i.x,renderZ:i.z};}
 private flushSpawns(){while(this.spawnQueue.length&&this.spawnQueue[0].at<=this.elapsed+1e-9)this.items.push(...this.spawnQueue.shift()!.items.map(i=>this.place(i)));}
 private finish(reason:EndReason){if(this.result)return;this.result=Object.freeze({reason,outcome:reason==='player-consumed'?'player-consumed':raceOutcome(this.player.score,this.leaderScore,this.rules.target),score:this.player.score,rivalScore:this.leaderScore,remaining:this.remaining,pointsBeforeCapture:this.pointsBeforeCapture});}
 private checkEnd(){if(!this.player.alive)this.finish('player-consumed');else if(!this.pendingSpawns&&this.items.every(i=>i.collected))this.finish('counter-cleared');else if(this.remaining<=1e-8){this.remaining=0;this.finish('time-up');}}
 step(delta:number,direction:Direction,active=true){
  this.events=[];if(!active||this.done)return;this.flushSpawns();this.checkEnd();if(this.done)return;
  const budget=Math.min(Math.max(0,delta),this.remaining);let rest=Math.min(budget,.1);
  while(rest>1e-8&&!this.done){const dt=Math.min(rest,1/60);this.tick(dt,direction);rest-=dt;}
  // A slow frame never extends the 45-second active-time maximum or creates a costly catch-up loop.
  if(!this.done&&budget>.1){const skipped=budget-.1;this.elapsed+=skipped;this.remaining=Math.max(0,this.remaining-skipped);this.flushSpawns();this.checkEnd();}
 }
 private tick(dt:number,direction:Direction){
  this.remaining=Math.max(0,this.remaining-dt);this.elapsed+=dt;this.flushSpawns();this.move(this.player,direction,dt,1);
  const rivalActive=this.elapsed>=this.rules.rivalGrace;
  if(rivalActive)for(const rival of this.rivals)if(rival.alive)this.move(rival,this.steer(rival,this.brains.get(rival.id)!,this.rules.rivalReaction),dt,this.rules.rivalSpeed);
  for(const item of this.items){
   if(item.collected)continue;
   if(!item.owner){
    let winner:Actor|undefined,nearest=Infinity;
    for(const actor of this.actors){if(!actor.alive||actor.id!=='player'&&!rivalActive||item.tier>actor.tier)continue;const d=distance(actor,item);if(d<captureRadius(actor.radius)&&d<nearest){winner=actor;nearest=d;}}
    if(winner){item.owner=winner.id;item.sinkProgress=.01;this.events.push({type:'claim',actor:winner.id,item});}
   }else{
    const actor=this.actors.find(a=>a.id===item.owner)!;
    item.sinkProgress=Math.min(1,item.sinkProgress+dt*4.5);const p=item.sinkProgress;
    item.renderX=item.x+(actor.x-item.x)*p*.85;item.renderZ=item.z+(actor.z-item.z)*p*.85;
    if(p>=1){item.collected=true;actor.score+=item.points;actor.mass+=item.growthValue;this.events.push({type:'score',actor:actor.id,item});this.grow(actor);}
   }
  }
  this.combat(dt);this.checkEnd();
 }
 private grow(actor:Actor){const stage=[...this.growth].reverse().find(g=>actor.mass>=g.minMass)||this.growth[0];if(stage.tier>actor.tier){actor.tier=stage.tier;actor.radius=stage.collectorRadius;actor.speed=stage.speed;this.resolvePosition(actor);this.events.push({type:'grow',actor:actor.id,tier:actor.tier});}}
 private combat(dt:number){
  if(this.elapsed<this.rules.captureGrace)return;
  const contacts=new Set<string>(),actors=[...this.actors].sort((a,b)=>b.radius-a.radius);
  for(const predator of actors)for(const prey of actors){
   if(predator===prey||!predator.alive||!prey.alive||!canConsume(predator.radius,prey.radius,distance(predator,prey),this.rules.captureRatio))continue;
   const key=predator.id+'>'+prey.id;contacts.add(key);const held=(this.holds.get(key)||0)+dt;this.holds.set(key,held);
   if(held+1e-8<this.rules.captureHold)continue;
   const points=prey.score;if(prey.id==='player')this.pointsBeforeCapture=points;
   predator.score+=points;predator.mass+=prey.mass;prey.score=0;prey.mass=0;prey.alive=false;
   // In-flight food stays pending and completes exactly once for the surviving collector.
   for(const item of this.items)if(!item.collected&&item.owner===prey.id)item.owner=predator.id;
   this.grow(predator);this.events.push({type:'capture',actor:predator.id,prey:prey.id,points});
   if(prey.id==='player'){this.finish('player-consumed');return;}
  }
  for(const key of this.holds.keys())if(!contacts.has(key))this.holds.delete(key);
 }
 private move(actor:Actor,direction:Direction,dt:number,multiplier:number){
  if(!actor.alive)return;const length=Math.hypot(direction.x,direction.z);if(length<.02)return;
  const travel=actor.id==='player'?actor.speed*multiplier*dt:Math.min(length,actor.speed*multiplier*dt);
  actor.x+=direction.x/length*travel;actor.z+=direction.z/length*travel;this.resolvePosition(actor);
 }
 private resolvePosition(actor:Actor){
  const margin=captureRadius(actor.radius),bound=()=>{actor.x=clamp(actor.x,-this.width/2+margin,this.width/2-margin);actor.z=clamp(actor.z,-this.depth/2+margin,this.depth/2-margin);};bound();
  for(let pass=0;pass<3;pass++){
   for(const o of this.obstacles){
    const nx=clamp(actor.x,o.x-o.halfWidth,o.x+o.halfWidth),nz=clamp(actor.z,o.z-o.halfDepth,o.z+o.halfDepth),d=Math.hypot(actor.x-nx,actor.z-nz);
    if(d>=margin)continue;
    if(d>.00001){actor.x=nx+(actor.x-nx)/d*margin;actor.z=nz+(actor.z-nz)/d*margin;}
    else{const edges=[{d:Math.abs(actor.x-o.x+o.halfWidth),x:o.x-o.halfWidth-margin,z:actor.z},{d:Math.abs(actor.x-o.x-o.halfWidth),x:o.x+o.halfWidth+margin,z:actor.z},{d:Math.abs(actor.z-o.z+o.halfDepth),x:actor.x,z:o.z-o.halfDepth-margin},{d:Math.abs(actor.z-o.z-o.halfDepth),x:actor.x,z:o.z+o.halfDepth+margin}].sort((a,b)=>a.d-b.d);actor.x=edges[0].x;actor.z=edges[0].z;}bound();
   }
   for(const item of this.items){if(item.collected||item.owner||item.tier<=actor.tier)continue;const d=distance(actor,item),min=(actor.radius+item.radius)*.65;if(d<min){const angle=d>1e-8?Math.atan2(actor.z-item.z,actor.x-item.x):0;actor.x=item.x+Math.cos(angle)*min;actor.z=item.z+Math.sin(angle)*min;bound();}}
  }
 }
 private clearLine(actor:Actor,target:Direction){
  const count=Math.max(1,Math.ceil(distance(actor,target)/.6));
  for(let n=1;n<=count;n++){const p={x:actor.x+(target.x-actor.x)*n/count,z:actor.z+(target.z-actor.z)*n/count};if(this.obstacles.some(o=>overlapsObstacle(p,captureRadius(actor.radius)+.05,o)))return false;}
  return true;
 }
 /** Each collector makes its own decisions, including hunting/fleeing other rivals. */
 steer(actor:Actor,brain:Brain,reaction:number):Direction{
  if(!actor.alive)return{x:0,z:0};
  const target=this.items.find(i=>i.uid===brain.target&&!i.owner&&!i.collected&&i.tier<=actor.tier);
  if(this.elapsed>=brain.nextDecision){
   brain.intent='food';brain.opponent=undefined;
   if(this.rules.behavior!=='gather'&&this.elapsed>=this.rules.captureGrace){
    const others=this.actors.filter(a=>a!==actor&&a.alive).sort((a,b)=>distance(actor,a)-distance(actor,b));
    const threat=others.find(a=>a.radius>=actor.radius*this.rules.captureRatio&&distance(actor,a)<(this.rules.behavior==='hunt'?8:5));
    const prey=others.find(a=>actor.radius>=a.radius*this.rules.captureRatio&&distance(actor,a)<(this.rules.behavior==='hunt'?10:6)&&this.clearLine(actor,a));
    if(threat){brain.intent='flee';brain.opponent=threat.id;}else if(prey){brain.intent='chase';brain.opponent=prey.id;}
   }
   const moved=distance(actor,{x:brain.lastX,z:brain.lastZ});brain.stuck=moved<.15?brain.stuck+reaction:0;
   if(brain.intent==='food'&&(!target||!brain.path?.length||brain.pathTier!==actor.tier||brain.stuck>1)){this.planRoute(actor,brain);brain.stuck=0;}
   brain.lastX=actor.x;brain.lastZ=actor.z;brain.nextDecision=this.elapsed+reaction;
  }
  const opponent=this.actors.find(a=>a.id===brain.opponent&&a.alive);
  if(opponent&&brain.intent!=='food'){
   const sign=brain.intent==='flee'?-1:1,dx=(opponent.x-actor.x)*sign,dz=(opponent.z-actor.z)*sign;
   const norm=Math.hypot(dx,dz)||1,goal={x:actor.x+dx/norm*2,z:actor.z+dz/norm*2};
   if(this.clearLine(actor,goal))return{x:dx,z:dz};
  }
  if(!brain.path?.length)return{x:0,z:0};
  while(brain.path.length>1&&distance(actor,brain.path[0])<actor.speed/25)brain.path.shift();
  const point=brain.path[0];if(distance(actor,point)<.06){brain.path.shift();return{x:0,z:0};}return{x:point.x-actor.x,z:point.z-actor.z};
 }
  private planRoute(actor:Actor,brain:Brain){
    const spacing=.85,margin=captureRadius(actor.radius),left=-this.width/2+margin,top=-this.depth/2+margin;
    const cols=Math.floor((this.width-2*margin)/spacing)+1,rows=Math.floor((this.depth-2*margin)/spacing)+1,total=cols*rows;
    const blocked=this.items.filter(i=>!i.collected&&!i.owner&&i.tier>actor.tier);
    const point=(id:number)=>({x:left+(id%cols)*spacing,z:top+Math.floor(id/cols)*spacing});
    const free=new Uint8Array(total),parents=new Int32Array(total).fill(-2),steps=new Int32Array(total);
    let start=-1,nearest=Infinity;
    for(let id=0;id<total;id++){
      const p=point(id);let clear=!this.obstacles.some(o=>overlapsObstacle(p,margin+.06,o));
      for(const item of blocked){const dx=p.x-item.x,dz=p.z-item.z,r=(actor.radius+item.radius)*.65+.06;if(dx*dx+dz*dz<r*r){clear=false;break;}}
      if(clear){free[id]=1;const d=distance(actor,p);if(d<nearest){start=id;nearest=d;}}
    }
    brain.path=[];brain.target=null;brain.pathTier=actor.tier;if(start<0)return;
    const queue=new Int32Array(total);let head=0,tail=1;queue[0]=start;parents[start]=-1;
    while(head<tail){const id=queue[head++],x=id%cols,y=Math.floor(id/cols);
      for(const next of [x>0?id-1:-1,x<cols-1?id+1:-1,y>0?id-cols:-1,y<rows-1?id+cols:-1]){
        if(next<0||!free[next]||parents[next]!==-2)continue;
        parents[next]=id;steps[next]=steps[id]+1;queue[tail++]=next;
      }
    }
    let bestId=-1,bestCost=Infinity,bestItem:RaceItem|undefined;
    for(const item of this.items){
      if(item.owner||item.collected||item.tier>actor.tier)continue;
      const ix=Math.round((item.x-left)/spacing),iz=Math.round((item.z-top)/spacing),reach=Math.ceil(margin/spacing);
      for(let dy=-reach;dy<=reach;dy++)for(let dx=-reach;dx<=reach;dx++){
        const x=ix+dx,y=iz+dy;if(x<0||y<0||x>=cols||y>=rows)continue;
        const id=y*cols+x;if(parents[id]===-2||distance(point(id),item)>=margin*.80)continue;
        const cost=(steps[id]*spacing+nearest+.5)/Math.pow(item.points,this.rules.behavior==='contest'?.34:.22);
        if(cost<bestCost){bestCost=cost;bestId=id;bestItem=item;}
      }
    }
    if(bestId<0||!bestItem)return;
    const route:Direction[]=[];let id=bestId;while(id>=0){route.push(point(id));id=parents[id];}
    route.reverse();brain.path=route;brain.target=bestItem.uid;
  }
}
