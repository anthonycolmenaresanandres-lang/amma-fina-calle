import {CollectorRace,overlapsObstacle,type Ingredient,type GrowthStage,type Direction,type Obstacle} from '../../../../../DEMOS/collector-standard/engine';
import {COLLECTOR_RACE_V2} from '../../../../../DEMOS/collector-standard/rules';
export const PICKUPS={
 chocolate:{name:'Chocolate square',tier:1,radius:.44,points:30,growthValue:1},
 wafer:{name:'Vanilla wafer',tier:1,radius:.48,points:40,growthValue:1.2},
 strawberry:{name:'Dipped strawberry',tier:2,radius:.64,points:70,growthValue:2},
 marshmallow:{name:'Marshmallow',tier:2,radius:.62,points:60,growthValue:1.8},
 pretzel:{name:'Pretzel',tier:3,radius:.83,points:100,growthValue:2.8},
 apple:{name:'Chocolate apple',tier:3,radius:.96,points:140,growthValue:4},
} as const;
export type PickupKind=keyof typeof PICKUPS;
export const GROWTH:readonly GrowthStage[]=[
 {tier:1,minMass:0,collectorRadius:1.55,speed:12,title:'Little dip'},
 {tier:2,minMass:8,collectorRadius:2.15,speed:13,title:'Sweet scoop'},
 {tier:3,minMass:24,collectorRadius:3,speed:14,title:'Chocolate swirl'},
 {tier:4,minMass:55,collectorRadius:3.8,speed:15,title:'Counter royal'},
 {tier:5,minMass:95,collectorRadius:4.6,speed:16,title:'Grand collector'},
];
interface Counter {name:string;description:string;size:number;target:number;count:number;spawns:Direction[];obstacles:Obstacle[];color:string}
export const COUNTERS:readonly Counter[]=[
 {name:'The dipping counter',description:'An open counter. One gathering rival.',size:38,target:1300,count:116,spawns:[{x:0,z:0},{x:-11,z:-10}],obstacles:[],color:'#785742'},
 {name:'The tasting tray',description:'Circle the tray. Two rivals contest the sweets.',size:46,target:2200,count:170,spawns:[{x:0,z:12},{x:-14,z:-12},{x:14,z:-12}],obstacles:[{x:0,z:0,halfWidth:6,halfDepth:2.5}],color:'#6d5145'},
 {name:'The chocolate circuit',description:'Loop around two displays. Three rivals hunt and retreat.',size:54,target:3200,count:232,spawns:[{x:0,z:0},{x:-17,z:-17},{x:17,z:-17},{x:0,z:19}],obstacles:[{x:-10,z:0,halfWidth:2.3,halfDepth:6},{x:10,z:0,halfWidth:2.3,halfDepth:6}],color:'#5e4d44'},
];
export function generateChocolateItems(level:number):Ingredient[]{
 const spec=COUNTERS[level];let seed=131026+level*777;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
 const cells:Direction[]=[];
 for(let z=-spec.size/2+3;z<=spec.size/2-3;z+=2.5)for(let x=-spec.size/2+3;x<=spec.size/2-3;x+=2.5){
  const cell={x:x+(random()-.5)*.18,z:z+(random()-.5)*.18};
  if(!spec.obstacles.some(o=>overlapsObstacle(cell,1.3,o))&&spec.spawns.every(s=>Math.hypot(s.x-cell.x,s.z-cell.z)>2.5))cells.push(cell);
 }
 const items:Ingredient[]=[];
 const place=(kind:PickupKind,cell:Direction)=>{cells.splice(cells.indexOf(cell),1);items.push({uid:`royal-${level}-${items.length}`,defId:kind,...cell,...PICKUPS[kind],initialScale:1,rotationY:(random()-.5)*.3,collected:false,sinkProgress:0});};
 // Equal nearby starter portions; no large products block the spawns.
 for(const spawn of spec.spawns)for(let n=0;n<8;n++){
  const cell=[...cells].sort((a,b)=>Math.hypot(a.x-spawn.x,a.z-spawn.z)-Math.hypot(b.x-spawn.x,b.z-spawn.z))[0];
  if(!cell)throw new Error('Missing starter space');place(n%2?'wafer':'chocolate',cell);
 }
 const kinds=Object.keys(PICKUPS) as PickupKind[];
 while(items.length<spec.count){
  const kind=kinds[Math.floor(random()*kinds.length)];
  const candidates=cells.filter(c=>PICKUPS[kind].tier===1||spec.spawns.every(s=>Math.hypot(s.x-c.x,s.z-c.z)>6));
  const cell=candidates[Math.floor(random()*candidates.length)];if(!cell)throw new Error('Pickup budget exceeds counter space');place(kind,cell);
 }
 return items;
}
export function createChocolateRace(level:number){const spec=COUNTERS[level];return new CollectorRace(generateChocolateItems(level),GROWTH,spec.size,spec.size,{...COLLECTOR_RACE_V2[level],id:`royal-chocolate/1/${level+1}`,target:spec.target},spec);}
