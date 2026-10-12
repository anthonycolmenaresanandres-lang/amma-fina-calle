import {captureRadius,raceOutcome,type RaceRules} from './rules';
export type ActorId = 'player'|'rival';
export interface Ingredient {
  uid:string;defId:string;x:number;z:number;tier:number;radius:number;
  points:number;growthValue:number;initialScale:number;rotationY:number;
  collected:boolean;sinkProgress:number;
}
export interface RaceItem extends Ingredient {owner:ActorId|null;renderX:number;renderZ:number}
export interface GrowthStage {tier:number;minMass:number;collectorRadius:number;speed:number;title:string}
export interface Actor {id:ActorId;x:number;z:number;mass:number;tier:number;radius:number;speed:number;score:number}
export interface RaceEvent {type:'claim'|'score'|'grow';actor:ActorId;item?:RaceItem;tier?:number}
export interface Direction {x:number;z:number}
interface Brain {target:string|null;nextDecision:number;turn:number;lastX:number;lastZ:number;stuck:number;path?:Direction[];pathTier?:number}
const distance=(a:Direction,b:Direction)=>Math.hypot(a.x-b.x,a.z-b.z);
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));

/** Pure, fixed-substep simulation: both collectors obey the same physical rules. */
export class CollectorRace {
  readonly player:Actor;
  readonly rival:Actor;
  readonly items:RaceItem[];
  remaining:number;
  elapsed=0;
  events:RaceEvent[]=[];
  private brain:Brain={target:null,nextDecision:0,turn:1,lastX:0,lastZ:0,stuck:0};
  constructor(items:Ingredient[],readonly growth:readonly GrowthStage[],readonly width:number,readonly depth:number,readonly rules:RaceRules) {
    const first=growth[0];
    const actor=(id:ActorId,x:number,z:number):Actor=>({id,x,z,mass:0,tier:1,radius:first.collectorRadius,speed:first.speed,score:0});
    this.player=actor('player',0,0);this.rival=actor('rival',0,0);
    this.items=items.map(item=>({...item,collected:false,sinkProgress:0,owner:null,renderX:item.x,renderZ:item.z}));
    this.remaining=rules.seconds;
    this.resolvePosition(this.rival);
  }
  get outcome(){return raceOutcome(this.player.score,this.rival.score,this.rules.target);}
  step(delta:number,direction:Direction,active=true) {
    this.events=[];
    if(!active||this.remaining<=0)return;
    let rest=Math.min(Math.max(0,delta),0.1,this.remaining);
    while(rest>1e-8){const dt=Math.min(rest,1/60);this.tick(dt,direction);rest-=dt;}
    if(this.remaining<1e-8)this.remaining=0;
  }
  private tick(dt:number,direction:Direction) {
    this.remaining=Math.max(0,this.remaining-dt);this.elapsed+=dt;
    this.move(this.player,direction,dt,1);
    const rivalActive=this.elapsed>=this.rules.rivalGrace;
    if(rivalActive)this.move(this.rival,this.steer(this.rival,this.brain,this.rules.rivalReaction),dt,this.rules.rivalSpeed);
    for(const item of this.items){
      if(item.collected)continue;
      if(!item.owner){
        const pd=item.tier<=this.player.tier?distance(this.player,item):Infinity;
        const rd=rivalActive&&item.tier<=this.rival.tier?distance(this.rival,item):Infinity;
        const p=pd<captureRadius(this.player.radius),r=rd<captureRadius(this.rival.radius);
        if(p||r){item.owner=p&&(!r||pd<=rd)?'player':'rival';item.sinkProgress=0.01;this.events.push({type:'claim',actor:item.owner,item});}
      }else{
        const actor=this[item.owner];
        item.sinkProgress=Math.min(1,item.sinkProgress+dt*4.5);
        const p=item.sinkProgress;
        item.renderX=item.x+(actor.x-item.x)*p*.85;item.renderZ=item.z+(actor.z-item.z)*p*.85;
        if(p>=1){
          item.collected=true;actor.score+=item.points;actor.mass+=item.growthValue;
          this.events.push({type:'score',actor:actor.id,item});
          const stage=[...this.growth].reverse().find(g=>actor.mass>=g.minMass)||this.growth[0];
          if(stage.tier>actor.tier){actor.tier=stage.tier;actor.radius=stage.collectorRadius;actor.speed=stage.speed;this.resolvePosition(actor);this.events.push({type:'grow',actor:actor.id,tier:actor.tier});}
        }
      }
    }
  }
  private move(actor:Actor,direction:Direction,dt:number,multiplier:number){
    const length=Math.hypot(direction.x,direction.z);if(length<.02)return;
    const travel=actor.id==='rival'?Math.min(length,actor.speed*multiplier*dt):actor.speed*multiplier*dt;
    actor.x+=direction.x/length*travel;actor.z+=direction.z/length*travel;
    this.resolvePosition(actor);
  }
  private resolvePosition(actor:Actor){
    const margin=captureRadius(actor.radius),halfW=this.width/2,halfD=this.depth/2;
    const bound=()=>{actor.x=clamp(actor.x,-halfW+margin,halfW-margin);actor.z=clamp(actor.z,-halfD+margin,halfD-margin);};
    bound();
    for(let pass=0;pass<3;pass++)for(const item of this.items){
      if(item.collected||item.owner||item.tier<=actor.tier)continue;
      const d=distance(actor,item),min=(actor.radius+item.radius)*.65;
      if(d<min){const angle=d>1e-8?Math.atan2(actor.z-item.z,actor.x-item.x):0;actor.x=item.x+Math.cos(angle)*min;actor.z=item.z+Math.sin(angle)*min;bound();}
    }
  }
  /** Grid routes use current eligible food and obstacles, never player inputs or future state. */
  steer(actor:Actor,brain:Brain,reaction:number):Direction {
    const target=this.items.find(i=>i.uid===brain.target&&!i.owner&&!i.collected&&i.tier<=actor.tier);
    if(this.elapsed>=brain.nextDecision){
      const moved=distance(actor,{x:brain.lastX,z:brain.lastZ});
      brain.stuck=moved<.15?brain.stuck+reaction:0;
      if(!target||!brain.path?.length||brain.pathTier!==actor.tier||brain.stuck>1){
        this.planRoute(actor,brain);brain.stuck=0;
      }
      brain.lastX=actor.x;brain.lastZ=actor.z;brain.nextDecision=this.elapsed+reaction;
    }
    if(!brain.path?.length)return{x:0,z:0};
    while(brain.path.length>1&&distance(actor,brain.path[0])<actor.speed/25)brain.path.shift();
    const point=brain.path[0];
    if(distance(actor,point)<.06){brain.path.shift();return{x:0,z:0};}
    return{x:point.x-actor.x,z:point.z-actor.z};
  }
  private planRoute(actor:Actor,brain:Brain){
    const spacing=.7,margin=captureRadius(actor.radius),left=-this.width/2+margin,top=-this.depth/2+margin;
    const cols=Math.floor((this.width-2*margin)/spacing)+1,rows=Math.floor((this.depth-2*margin)/spacing)+1,total=cols*rows;
    const blocked=this.items.filter(i=>!i.collected&&!i.owner&&i.tier>actor.tier);
    const point=(id:number)=>({x:left+(id%cols)*spacing,z:top+Math.floor(id/cols)*spacing});
    const free=new Uint8Array(total),parents=new Int32Array(total).fill(-2),steps=new Int32Array(total);
    let start=-1,nearest=Infinity;
    for(let id=0;id<total;id++){
      const p=point(id);let clear=true;
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
        const cost=(steps[id]*spacing+nearest+.5)/Math.pow(item.points,.22);
        if(cost<bestCost){bestCost=cost;bestId=id;bestItem=item;}
      }
    }
    if(bestId<0||!bestItem)return;
    const route:Direction[]=[];let id=bestId;while(id>=0){route.push(point(id));id=parents[id];}
    route.reverse();brain.path=route;brain.target=bestItem.uid;
  }
}
/** Deterministic public-world driver used only by balance tests, never by the player adapter. */
export const createBrain=():Brain=>({target:null,nextDecision:0,turn:1,lastX:0,lastZ:0,stuck:0});
