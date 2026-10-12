import {LOGICAL_ITEMS} from './gameplay';
import {LEVELS} from './levels';
import {overlapsObstacle,type RaceWorld,type Ingredient,type Direction,type Obstacle} from '../collector-standard/engine';
export interface RaceLevel extends RaceWorld{name:string;description:string;arenaWidth:number;arenaDepth:number;spawns:Direction[];obstacles:Obstacle[];pockets:Direction[]}
export const RACE_LEVELS:readonly RaceLevel[]=[
 {name:'Open counter',description:'Open space, scattered ingredients and one gathering rival.',arenaWidth:48,arenaDepth:48,spawns:[{x:0,z:0},{x:-12,z:-12}],obstacles:[],pockets:[]},
 {name:'Tray crossing',description:'Circle the serving tray. Two rivals contest the ingredient clusters.',arenaWidth:60,arenaDepth:60,spawns:[{x:0,z:14},{x:-14,z:-12},{x:14,z:-12}],obstacles:[{x:0,z:0,halfWidth:7,halfDepth:3}],pockets:[{x:-17,z:0},{x:17,z:0},{x:0,z:-17},{x:0,z:17}]},
 {name:'Deli circuit',description:'Loop around the islands. Three rivals hunt smaller sandwiches and flee larger ones.',arenaWidth:72,arenaDepth:72,spawns:[{x:0,z:0},{x:-20,z:-20},{x:20,z:-20},{x:0,z:22}],obstacles:[{x:-12,z:0,halfWidth:3,halfDepth:8},{x:12,z:0,halfWidth:3,halfDepth:8}],pockets:[{x:-24,z:-19},{x:24,z:-19},{x:-24,z:19},{x:24,z:19},{x:0,z:-24},{x:0,z:27}]},
];
const distance=(a:Direction,b:Direction)=>Math.hypot(a.x-b.x,a.z-b.z);
/** All food is present at round start. A spaced deterministic grid prevents old clumps. */
export function generateRaceItems(index:number):Ingredient[]{
 const spec=RACE_LEVELS[index];let seed=90210+index*1337;
 const rng=()=>{seed=(Math.imul(1664525,seed)+1013904223)|0;return(seed>>>0)/4294967296;};
 const cells:Direction[]=[];
 for(let z=-spec.arenaDepth/2+4.5;z<=spec.arenaDepth/2-4.5;z+=2.4)for(let x=-spec.arenaWidth/2+4.5;x<=spec.arenaWidth/2-4.5;x+=2.4){
  const cell={x:x+(rng()-.5)*.24,z:z+(rng()-.5)*.24};
  if(!spec.obstacles.some(o=>overlapsObstacle(cell,1.1,o))&&spec.spawns.every(s=>distance(cell,s)>2.7))cells.push(cell);
 }
 const defs=LEVELS[index].initialItems.flatMap(group=>Array.from({length:Math.ceil(group.count*1.3)},()=>({id:group.defId,...LOGICAL_ITEMS[group.defId]})));
 const items:Ingredient[]=[];
 const place=(def:typeof defs[number],cell:Direction)=>{cells.splice(cells.indexOf(cell),1);items.push({uid:`race-${index}-${items.length}`,defId:def.id,...cell,tier:def.tier,radius:def.radius,points:def.points,growthValue:def.growthValue,initialScale:1.05,rotationY:rng()*Math.PI*2,collected:false,sinkProgress:0});};
 // A fair starter ring for every independent collector, without large blockers at spawn.
 for(const spawn of spec.spawns)for(let n=0;n<12;n++){
  const i=defs.findIndex(d=>d.tier===1);if(i<0)throw new Error('Starter food budget exhausted');
  const def=defs.splice(i,1)[0],cell=[...cells].sort((a,b)=>distance(a,spawn)-distance(b,spawn))[0];if(!cell)throw new Error('No starter cell');place(def,cell);
 }
 defs.sort((a,b)=>b.tier-a.tier);
 for(let n=0;n<defs.length;n++){
  const def=defs[n],pocket=spec.pockets[n%Math.max(1,spec.pockets.length)];
  const candidates=cells.filter(c=>spec.spawns.every(s=>distance(c,s)>(def.tier>1?8:2.7))&&!spec.obstacles.some(o=>overlapsObstacle(c,Math.max(1.1,def.radius*1.25),o)));
  if(!candidates.length)throw new Error('Insufficient spaced food cells');
  let cell:Direction;
  if(pocket&&def.tier>=3)cell=candidates.map(c=>({c,cost:distance(c,pocket)+rng()*2})).sort((a,b)=>a.cost-b.cost)[0].c;
  else cell=candidates[Math.floor(rng()*candidates.length)];
  place(def,cell);
 }
 return items;
}
