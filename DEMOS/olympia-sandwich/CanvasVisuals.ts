import type * as THREE from 'three';
import {ART,ART_SLOTS,inspectedPath,type ArtSlot} from './assets';
import {RECIPE,type PickupId} from './recipe';
import {isItemEligible} from './gameplay';
import type {PlacedItem,ObjectTier} from './types';
import {roomLayout,projectToCounter,type RoomLayout} from './CounterProjection';

type Loaded={image:HTMLImageElement;ready:boolean;failed:boolean};
export interface CollectorState{x:number;z:number;radius:number;tier:ObjectTier;}
export interface PaintState{
 collector:CollectorState;items:PlacedItem[];meshes:Record<string,THREE.Group|null>;
 width:number;depth:number;active:boolean;growing:boolean;
}
type Crumb={x:number;z:number;vx:number;vz:number;life:number};
export class CounterPainter{
 private ctx:CanvasRenderingContext2D;
 private images=new Map<string,Loaded>();
 private observer:ResizeObserver;
 private background=document.createElement('canvas');
 private layout:RoomLayout=roomLayout(1,1);
 private width=1;private height=1;private dpr=1;private dirty=true;
 private reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 private seen=new Set<string>();private crumbs:Crumb[]=Array.from({length:24},()=>({x:0,z:0,vx:0,vz:0,life:0}));
 private cursor=0;private elapsed=0;private paintTotal=0;private frameTotal=0;private metricAt=0;
 constructor(private canvas:HTMLCanvasElement){
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('2D canvas unavailable');this.ctx=ctx;
  for(const slot of ART_SLOTS){const path=inspectedPath(slot);if(!path)continue;
   const image=new Image(),entry={image,ready:false,failed:false};this.images.set(path,entry);
   image.onload=()=>{entry.ready=true;this.dirty=true;};image.onerror=()=>{entry.failed=true;this.dirty=true;};image.src=path;
  }
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);this.resize();
 }
 dispose(){this.observer.disconnect();for(const entry of this.images.values()){entry.image.onload=null;entry.image.onerror=null;}this.images.clear();}
 private resize(){const box=this.canvas.getBoundingClientRect();this.width=Math.max(1,Math.round(box.width));this.height=Math.max(1,Math.round(box.height));
  this.dpr=Math.min(window.devicePixelRatio||1,1.5);this.canvas.width=Math.round(this.width*this.dpr);this.canvas.height=Math.round(this.height*this.dpr);
  this.layout=roomLayout(this.width,this.height);this.dirty=true;}
 private image(slot:ArtSlot){const path=inspectedPath(slot);return path&&this.images.get(path)?.ready?this.images.get(path)!.image:null;}
 private backdrop(){
  const{width,height,dpr,layout}=this;this.background.width=Math.round(width*dpr);this.background.height=Math.round(height*dpr);
  const c=this.background.getContext('2d')!;c.scale(dpr,dpr);c.fillStyle='#a9aaa2';c.fillRect(0,0,width,height);
  // Quiet floor continues outside the portrait illustration on wide screens.
  c.strokeStyle='#929991';c.lineWidth=1;for(let x=0;x<width;x+=72){c.beginPath();c.moveTo(x,0);c.lineTo(x,height);c.stroke();}
  for(let y=0;y<height;y+=72){c.beginPath();c.moveTo(0,y);c.lineTo(width,y);c.stroke();}
  const room=this.image(ART.room);if(room)c.drawImage(room,layout.left,layout.top,layout.width,layout.height);
  const[tl,tr,br,bl]=layout.quad;c.save();c.beginPath();c.moveTo(tl.x,tl.y);c.lineTo(tr.x,tr.y);c.lineTo(br.x,br.y);c.lineTo(bl.x,bl.y);c.closePath();c.clip();
  if(!room){c.fillStyle='#ead7b5';c.fillRect(0,0,width,height);}
  const counter=this.image(ART.counter);
  if(counter){c.globalAlpha=room ? .36 : 1;
   // A projected strip mesh maps the square texture inside the photographed-art rim.
   const steps=48;for(let n=0;n<steps;n++){
    const v0=n/steps,v1=(n+1)/steps;
    const a=projectToCounter(-.5,v0-.5,1,1,layout),b=projectToCounter(.5,v0-.5,1,1,layout);
    const d=projectToCounter(-.5,v1-.5,1,1,layout),e=projectToCounter(.5,v1-.5,1,1,layout);
    const left=Math.min(a.x,d.x),right=Math.max(b.x,e.x);
    c.drawImage(counter,0,v0*counter.height,counter.width,counter.height/steps,left,a.y,right-left,d.y-a.y+.7);
   }}
  c.restore();this.dirty=false;
 }
 private sprite(slot:ArtSlot,x:number,y:number,width:number,opacity=1,rotation=0){
  const image=this.image(slot);if(!image)return false;const c=this.ctx,height=width*image.height/image.width;
  c.save();c.globalAlpha=opacity;c.translate(x,y);c.rotate(rotation);
  c.drawImage(image,-slot.anchor[0]*width,-slot.anchor[1]*height,width,height);c.restore();return true;
 }
 private foodFallback(kind:string,x:number,y:number,width:number,color:string){
  const c=this.ctx;c.fillStyle=color;c.strokeStyle='#513722';c.lineWidth=1;
  c.beginPath();c.ellipse(x,y,width*.36,width*.2,0,0,Math.PI*2);c.fill();c.stroke();
  if(kind==='bread'){c.strokeStyle='#f8e3bb';c.beginPath();c.moveTo(x-width*.16,y-width*.10);c.lineTo(x+width*.08,y+width*.02);c.stroke();}
 }
 paint(state:PaintState,delta:number){
  const started=performance.now();if(this.dirty)this.backdrop();
  const c=this.ctx;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.width,this.height);
  c.drawImage(this.background,0,0,this.width,this.height);
  const project=(x:number,z:number)=>projectToCounter(x,z,state.width,state.depth,this.layout);
  const collector=project(state.collector.x,state.collector.z);
  const radius=state.collector.radius;
  // The input/collision center is the open bread cradle, not the image rectangle center.
  const sandwichWidth=radius*collector.scale*5.2;
  c.save();c.fillStyle='#55391920';c.beginPath();c.ellipse(collector.x,collector.y+2,sandwichWidth*.41,sandwichWidth*.16,0,0,Math.PI*2);c.fill();c.restore();
  if(!this.sprite(ART.openSandwich,collector.x,collector.y,sandwichWidth)){
   c.fillStyle='#c89042';c.strokeStyle='#513722';c.lineWidth=2;c.beginPath();c.ellipse(collector.x,collector.y,radius*collector.scale*1.8,radius*collector.depthScale*1.45,0,0,Math.PI*2);c.fill();c.stroke();
   c.fillStyle='#f4dfac';c.beginPath();c.ellipse(collector.x,collector.y,radius*collector.scale*.92,radius*collector.depthScale*.92,0,0,Math.PI*2);c.fill();
  }
  if(state.growing&&!this.reduced.matches){c.strokeStyle='#b68537';c.lineWidth=2;c.beginPath();c.ellipse(collector.x,collector.y,sandwichWidth*.52,sandwichWidth*.24,0,0,Math.PI*2);c.stroke();}
  let nearest:PlacedItem|undefined,nearestDistance=Infinity;
  const visible=state.items.filter(item=>!item.collected).sort((a,b)=>a.z-b.z);
  for(const item of visible){
   const recipe=RECIPE.pickups[item.defId as PickupId],slot=ART.ingredients[recipe.kind];
   const p=Math.min(1,item.sinkProgress),mesh=state.meshes[item.uid];
   const px=p>0&&mesh?mesh.position.x:item.x,pz=p>0&&mesh?mesh.position.z:item.z;
   const at=project(px,pz),locked=!isItemEligible(state.collector.tier,item.tier);
   const spriteWidth=Math.max(11,item.radius*2.5*at.scale)*item.initialScale*(1-p*.86);
   const lift=this.reduced.matches?0:Math.sin(p*Math.PI)*8;
   const drop=this.reduced.matches?0:Math.max(0,p-.52)*8;
   const rotation=(item.rotationY-Math.PI)*.065+(this.reduced.matches?0:p*.3);
   if(locked){c.strokeStyle='#5f5e5348';c.lineWidth=1;c.setLineDash([2,3]);c.beginPath();
    c.ellipse(at.x,at.y,item.radius*.65*at.scale,item.radius*.65*at.depthScale,0,0,Math.PI*2);c.stroke();c.setLineDash([]);}
   if(!this.sprite(slot,at.x,at.y-lift+drop,spriteWidth,1-Math.max(0,p-.65)/.35,rotation))
    this.foodFallback(recipe.kind,at.x,at.y-lift,spriteWidth,recipe.color);
   if(!locked&&p===0){const distance=Math.hypot(item.x-state.collector.x,item.z-state.collector.z);if(distance<nearestDistance){nearest=item;nearestDistance=distance;}}
  }
  for(const item of state.items)if(item.collected&&!this.seen.has(item.uid)){
   this.seen.add(item.uid);if(!this.reduced.matches)for(let i=0;i<4;i++){
    const angle=i*Math.PI*.5,crumb=this.crumbs[this.cursor++%24];Object.assign(crumb,{x:item.sinkTargetX,z:item.sinkTargetZ,vx:Math.cos(angle)*1.4,vz:Math.sin(angle)*1.4,life:.28});
   }}
  const dt=state.active?Math.min(delta,.1):0;c.fillStyle='#bd833b';
  for(const crumb of this.crumbs){crumb.life=Math.max(0,crumb.life-dt);if(crumb.life<=0)continue;crumb.x+=crumb.vx*dt;crumb.z+=crumb.vz*dt;
   const at=project(crumb.x,crumb.z),t=1-crumb.life/.28;c.globalAlpha=crumb.life/.28;c.fillRect(at.x,at.y-Math.sin(t*Math.PI)*7,2,2);
  }c.globalAlpha=1;
  this.elapsed+=delta;this.frameTotal++;this.paintTotal+=performance.now()-started;
  if(this.elapsed-this.metricAt>.25){
   const data=this.canvas.dataset;data.collectorX=state.collector.x.toFixed(3);data.collectorZ=state.collector.z.toFixed(3);
   data.collectorScreen=JSON.stringify({x:collector.x,y:collector.y});data.collected=String(this.seen.size);
   data.loaded=String([...this.images.values()].filter(v=>v.ready).length);data.failed=String([...this.images.values()].filter(v=>v.failed).length);
   data.nearest=nearest?JSON.stringify({worldX:nearest.x,worldZ:nearest.z,tier:nearest.tier,...project(nearest.x,nearest.z)}):'null';
   data.paintMs=(this.paintTotal/this.frameTotal).toFixed(2);data.fps=(this.frameTotal/Math.max(.001,this.elapsed)).toFixed(1);
   data.counterQuad=JSON.stringify(this.layout.quad);this.metricAt=this.elapsed;
  }
 }
}
