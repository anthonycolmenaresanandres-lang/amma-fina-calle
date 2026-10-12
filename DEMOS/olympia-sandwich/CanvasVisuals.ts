import {ART,ART_SLOTS,inspectedPath,type ArtSlot} from './assets';
import {RECIPE,type PickupId} from './recipe';
import {roomLayout,projectToCounter,type RoomLayout} from './CounterProjection';
import {collectorGeometry} from './CollectorGeometry';
import type {Actor,RaceItem} from '../collector-standard/engine';

type Loaded={image:HTMLImageElement;ready:boolean;failed:boolean};
export interface PaintState{collector:Actor;rival:Actor;items:RaceItem[];width:number;depth:number;active:boolean}
type Crumb={x:number;z:number;vx:number;vz:number;life:number};
export class CounterPainter{
 private ctx:CanvasRenderingContext2D;
 private images=new Map<string,Loaded>();private observer:ResizeObserver;
 private background=document.createElement('canvas');private layout:RoomLayout=roomLayout(1,1);
 private width=1;private height=1;private dpr=1;private dirty=true;
 private camera={x:0,z:0,zoom:0};
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
  this.layout=roomLayout(this.width,this.height);this.camera.zoom=0;this.dirty=true;}
 private image(slot:ArtSlot){const path=inspectedPath(slot);return path&&this.images.get(path)?.ready?this.images.get(path)!.image:null;}
 private backdrop(){
  const{width,height,layout}=this,density=Math.min(2.5,1200/width);
  this.background.width=Math.round(width*density);this.background.height=Math.round(height*density);
  const c=this.background.getContext('2d')!;c.scale(density,density);c.fillStyle='#a9aaa2';c.fillRect(0,0,width,height);
  c.strokeStyle='#929991';c.lineWidth=1;for(let x=0;x<width;x+=72){c.beginPath();c.moveTo(x,0);c.lineTo(x,height);c.stroke();}
  for(let y=0;y<height;y+=72){c.beginPath();c.moveTo(0,y);c.lineTo(width,y);c.stroke();}
  const room=this.image(ART.room);if(room)c.drawImage(room,layout.left,layout.top,layout.width,layout.height);
  const[tl,tr,br,bl]=layout.quad;c.save();c.beginPath();c.moveTo(tl.x,tl.y);c.lineTo(tr.x,tr.y);c.lineTo(br.x,br.y);c.lineTo(bl.x,bl.y);c.closePath();c.clip();
  if(!room){c.fillStyle='#ead7b5';c.fillRect(0,0,width,height);}
  const counter=this.image(ART.counter);
  if(counter){c.globalAlpha=room?.36:1;
   for(let n=0;n<48;n++){
    const v0=n/48,v1=(n+1)/48,a=projectToCounter(-.5,v0-.5,1,1,layout),b=projectToCounter(.5,v0-.5,1,1,layout);
    const d=projectToCounter(-.5,v1-.5,1,1,layout),e=projectToCounter(.5,v1-.5,1,1,layout);
    c.drawImage(counter,0,v0*counter.height,counter.width,counter.height/48,Math.min(a.x,d.x),a.y,Math.max(b.x,e.x)-Math.min(a.x,d.x),d.y-a.y+.7);
   }}c.restore();this.dirty=false;
 }
 private sprite(slot:ArtSlot,x:number,y:number,width:number,opacity=1,rotation=0){
  const image=this.image(slot);if(!image)return false;const c=this.ctx,height=width*image.height/image.width;
  c.save();c.globalAlpha=opacity;c.translate(x,y);c.rotate(rotation);c.drawImage(image,-slot.anchor[0]*width,-slot.anchor[1]*height,width,height);c.restore();return true;
 }
 private fallback(kind:string,x:number,y:number,width:number,color:string){
  const c=this.ctx;c.fillStyle=color;c.strokeStyle='#513722';c.lineWidth=1;c.beginPath();c.ellipse(x,y,width*.36,width*.2,0,0,Math.PI*2);c.fill();c.stroke();
  if(kind==='bread'){c.strokeStyle='#f8e3bb';c.beginPath();c.moveTo(x-width*.16,y-width*.1);c.lineTo(x+width*.08,y+width*.02);c.stroke();}
 }
 paint(state:PaintState,delta:number){
  const started=performance.now();if(this.dirty)this.backdrop();
  const c=this.ctx;c.setTransform(this.dpr,0,0,this.dpr,0,0);
  const lerp=this.reduced.matches?1:1-Math.exp(-14*Math.min(delta,.1));
  this.camera.x+=(state.collector.x-this.camera.x)*lerp;this.camera.z+=(state.collector.z-this.camera.z)*lerp;
  const base=(x:number,z:number)=>projectToCounter(x,z,state.width,state.depth,this.layout);
  const focus=base(this.camera.x,this.camera.z),radius=state.collector.radius;
  const wanted=Math.min(this.width*.14,this.height*.18)*Math.sqrt(.95/radius);
  const maxPPU=Math.min(this.width*.36,this.height*.45)/(radius*1.8);
  const desired=Math.max(1,Math.min(wanted,maxPPU)/focus.scale);
  this.camera.zoom=this.camera.zoom?this.camera.zoom+(desired-this.camera.zoom)*lerp:desired;
  const zoom=this.camera.zoom,anchorX=this.width*.5,anchorY=this.height*.53;
  // One camera transforms room, counter, rim and food together; no independent scenery drift.
  const cx=Math.max(anchorX/zoom,Math.min(this.width-(this.width-anchorX)/zoom,focus.x));
  const cy=Math.max(anchorY/zoom,Math.min(this.height-(this.height-anchorY)/zoom,focus.y));
  const ox=anchorX-cx*zoom,oy=anchorY-cy*zoom;
  c.drawImage(this.background,ox,oy,this.width*zoom,this.height*zoom);
  const project=(x:number,z:number)=>{const p=base(x,z);return{x:p.x*zoom+ox,y:p.y*zoom+oy,scale:p.scale*zoom,depthScale:p.depthScale*zoom};};
  const playerGeometry=collectorGeometry(state.collector.x,state.collector.z,radius,project);
  for(const actor of [state.rival,state.collector]){
   const shape=actor.id==='player'?playerGeometry:collectorGeometry(actor.x,actor.z,actor.radius,project),at=shape.center;
   const path=new Path2D();shape.rim.forEach((p,i)=>i?path.lineTo(p.x,p.y):path.moveTo(p.x,p.y));path.closePath();
   c.fillStyle='#35251f';c.fill(path);
   c.save();c.clip(path);
   if(!this.sprite(ART.openSandwich,at.x,at.y,shape.width))this.fallback('bread',at.x,at.y,shape.width,'#dfb16d');
   c.restore();c.strokeStyle=actor.id==='player'?'#177660':'#be632a';c.lineWidth=3;c.stroke(path);
   c.fillStyle=actor.id==='player'?'#145846':'#753d1c';c.font='700 11px system-ui';c.textAlign='center';
   const bottom=Math.max(...shape.rim.map(p=>p.y));c.fillText(actor.id==='player'?'YOU':'RIVAL',at.x,bottom+15);
  }
  let nearest:RaceItem|undefined,nearestDistance=Infinity;
  const visible=state.items.filter(item=>!item.collected).sort((a,b)=>a.z-b.z);
  for(const item of visible){
   const recipe=RECIPE.pickups[item.defId as PickupId],slot=ART.ingredients[recipe.kind],p=item.sinkProgress;
   const at=project(item.renderX,item.renderZ),locked=item.tier>state.collector.tier;
   const spriteWidth=item.radius*2.5*at.scale*item.initialScale*(1-p*.86);
   if(at.x<-spriteWidth||at.x>this.width+spriteWidth||at.y<-spriteWidth||at.y>this.height+spriteWidth)continue;
   const lift=this.reduced.matches?0:Math.sin(p*Math.PI)*10,drop=this.reduced.matches?0:Math.max(0,p-.52)*10;
   const rotation=(item.rotationY-Math.PI)*.065+(this.reduced.matches?0:p*.3);
   if(locked){c.strokeStyle='#5f5e5366';c.lineWidth=1;c.setLineDash([3,4]);c.beginPath();c.ellipse(at.x,at.y,item.radius*.65*at.scale,item.radius*.65*at.depthScale,0,0,Math.PI*2);c.stroke();c.setLineDash([]);}
   if(!this.sprite(slot,at.x,at.y-lift+drop,spriteWidth,1-Math.max(0,p-.65)/.35,rotation))this.fallback(recipe.kind,at.x,at.y-lift,spriteWidth,recipe.color);
   if(!locked&&!item.owner){const d=Math.hypot(item.x-state.collector.x,item.z-state.collector.z);if(d<nearestDistance){nearest=item;nearestDistance=d;}}
  }
  for(const item of state.items)if(item.collected&&!this.seen.has(item.uid)){
   this.seen.add(item.uid);if(!this.reduced.matches)for(let i=0;i<4;i++){
    const angle=i*Math.PI*.5,crumb=this.crumbs[this.cursor++%24];Object.assign(crumb,{x:item.renderX,z:item.renderZ,vx:Math.cos(angle)*1.4,vz:Math.sin(angle)*1.4,life:.28});
   }}
  const dt=state.active?Math.min(delta,.1):0;c.fillStyle='#bd833b';
  for(const crumb of this.crumbs){crumb.life=Math.max(0,crumb.life-dt);if(crumb.life<=0)continue;crumb.x+=crumb.vx*dt;crumb.z+=crumb.vz*dt;
   const at=project(crumb.x,crumb.z),t=1-crumb.life/.28;c.globalAlpha=crumb.life/.28;c.fillRect(at.x,at.y-Math.sin(t*Math.PI)*7,3,3);
  }c.globalAlpha=1;
  const rival=project(state.rival.x,state.rival.z);
  if(rival.x<32||rival.x>this.width-32||rival.y<95||rival.y>this.height-70){
   const dx=rival.x-this.width/2,dy=rival.y-this.height/2;
   const edge=Math.min((this.width/2-44)/Math.max(1,Math.abs(dx)),(this.height/2-100)/Math.max(1,Math.abs(dy)));
   const x=this.width/2+dx*edge,y=this.height/2+dy*edge;
   c.save();c.translate(x,y);c.rotate(Math.atan2(dy,dx));c.fillStyle='#a75426';c.beginPath();c.moveTo(9,0);c.lineTo(-6,-6);c.lineTo(-6,6);c.closePath();c.fill();c.restore();
   c.fillStyle='#753d1c';c.font='700 10px system-ui';c.textAlign='center';c.fillText('RIVAL',x,y+20);
  }
  this.elapsed+=delta;this.frameTotal++;this.paintTotal+=performance.now()-started;
  if(this.elapsed-this.metricAt>.25){
   const data=this.canvas.dataset;data.collectorX=state.collector.x.toFixed(3);data.collectorZ=state.collector.z.toFixed(3);
   data.collectorScreen=JSON.stringify(playerGeometry.center);data.collected=String(this.seen.size);
   data.rivalX=state.rival.x.toFixed(3);data.rivalZ=state.rival.z.toFixed(3);data.rivalScore=String(state.rival.score);
   data.loaded=String([...this.images.values()].filter(v=>v.ready).length);data.failed=String([...this.images.values()].filter(v=>v.failed).length);
   data.nearest=nearest?JSON.stringify({worldX:nearest.x,worldZ:nearest.z,tier:nearest.tier,...project(nearest.x,nearest.z)}):'null';
   data.paintMs=(this.paintTotal/this.frameTotal).toFixed(2);data.fps=(this.frameTotal/Math.max(.001,this.elapsed)).toFixed(1);
   data.rim=JSON.stringify(playerGeometry);data.cameraZoom=zoom.toFixed(2);data.counterQuad=JSON.stringify(this.layout.quad.map(p=>({x:p.x*zoom+ox,y:p.y*zoom+oy})));this.metricAt=this.elapsed;
  }
 }
}
