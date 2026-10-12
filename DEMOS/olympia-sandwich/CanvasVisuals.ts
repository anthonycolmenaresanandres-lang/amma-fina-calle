import {ART,ART_SLOTS,inspectedPath,type ArtSlot} from './assets';
import {RECIPE,type PickupId} from './recipe';
import {CounterCamera} from './CounterCamera';
import {collectorGeometry} from './CollectorGeometry';
import type {Actor,RaceItem,Obstacle} from '../collector-standard/engine';

type Loaded={image:HTMLImageElement;ready:boolean;failed:boolean};
export interface PaintState{collector:Actor;rivals:Actor[];obstacles:Obstacle[];captureRatio:number;items:RaceItem[];width:number;depth:number;active:boolean}
type Crumb={x:number;z:number;vx:number;vz:number;life:number};
export class CounterPainter{
 private ctx:CanvasRenderingContext2D;
 private images=new Map<string,Loaded>();private observer:ResizeObserver;
 private background=document.createElement('canvas');
 private rearEdge=120;private width=1;private height=1;private dpr=1;private dirty=true;
 private camera=new CounterCamera();
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
  this.rearEdge=Math.min(this.height*.26,Math.max(105,this.width*.39));this.camera.reset();this.dirty=true;}
 private image(slot:ArtSlot){const path=inspectedPath(slot);return path&&this.images.get(path)?.ready?this.images.get(path)!.image:null;}
 private backdrop(){
  const{width,height,dpr,rearEdge}=this;
  this.background.width=Math.round(width*dpr);this.background.height=Math.round(height*dpr);
  const c=this.background.getContext('2d')!;c.scale(dpr,dpr);c.fillStyle='#8d9a84';c.fillRect(0,0,width,height);
  const room=this.image(ART.room),roomWidth=width*1.03,roomHeight=roomWidth*1672/941;
  // The measured rear counter edge touches the enlarged foreground table; no floor gap.
  if(room)c.drawImage(room,(width-roomWidth)/2,rearEdge-roomHeight*.308,roomWidth,roomHeight);
  c.fillStyle='#ead7b5';c.fillRect(0,rearEdge,width,height-rearEdge);
  const counter=this.image(ART.counter);if(counter){c.globalAlpha=.75;c.drawImage(counter,0,rearEdge,width,height-rearEdge);c.globalAlpha=1;}
  c.fillStyle='#5e6659';c.fillRect(0,rearEdge-3,width,3);c.fillStyle='#4d433a25';c.fillRect(0,rearEdge,width,6);this.dirty=false;
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
  const radius=state.collector.radius;
  const view=this.camera.update({width:this.width,height:this.height,rearEdge:this.rearEdge,arenaWidth:state.width,arenaDepth:state.depth,x:state.collector.x,z:state.collector.z,radius,active:state.active,reducedMotion:this.reduced.matches},delta);
  const project=view.project;
  c.drawImage(this.background,0,0,this.width,this.height);
  c.save();c.beginPath();c.rect(0,this.rearEdge,this.width,this.height-this.rearEdge);c.clip();
  for(const tray of state.obstacles){
   const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>project(tray.x+x*tray.halfWidth,tray.z+z*tray.halfDepth));
   c.beginPath();corners.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle='#aab0a0';c.fill();c.strokeStyle='#4c6257';c.lineWidth=4;c.stroke();
   c.beginPath();c.moveTo(corners[0].x,corners[0].y+4);c.lineTo(corners[1].x,corners[1].y+4);c.strokeStyle='#e8e8d6';c.lineWidth=2;c.stroke();
  }
  const playerGeometry=collectorGeometry(state.collector.x,state.collector.z,radius,project);
  for(const actor of [...state.rivals,state.collector]){
   if(!actor.alive)continue;const rivalIndex=state.rivals.indexOf(actor),rivalColor=['#be632a','#315b8b','#855381'][rivalIndex]||'#be632a';
   const shape=actor.id==='player'?playerGeometry:collectorGeometry(actor.x,actor.z,actor.radius,project),at=shape.center;
   const path=new Path2D();shape.rim.forEach((p,i)=>i?path.lineTo(p.x,p.y):path.moveTo(p.x,p.y));path.closePath();
   c.fillStyle='#35251f';c.fill(path);
   c.save();c.clip(path);
   if(!this.sprite(ART.openSandwich,at.x,at.y,shape.width))this.fallback('bread',at.x,at.y,shape.width,'#dfb16d');
   c.restore();c.strokeStyle=actor.id==='player'?'#177660':rivalColor;c.lineWidth=3;c.stroke(path);
   c.fillStyle=actor.id==='player'?'#145846':rivalColor;c.font='700 11px system-ui';c.textAlign='center';
   const bottom=Math.max(...shape.rim.map(p=>p.y));c.fillText(actor.id==='player'?'YOU':`R${rivalIndex+1}${actor.radius>=state.collector.radius*state.captureRatio?' · DANGER':''}`,at.x,bottom+15);
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
  c.restore();
  state.rivals.forEach((actor,index)=>{if(!actor.alive)return;const rival=project(actor.x,actor.z);
   if(rival.x<32||rival.x>this.width-32||rival.y<this.rearEdge+20||rival.y>this.height-70){
    const dx=rival.x-this.width/2,dy=rival.y-this.height/2,edge=Math.min((this.width/2-44)/Math.max(1,Math.abs(dx)),Math.max(20,this.height/2-100)/Math.max(1,Math.abs(dy)));
    const x=this.width/2+dx*edge,y=Math.max(this.rearEdge+24,this.height/2+dy*edge),color=['#a75426','#315b8b','#855381'][index];
    c.save();c.translate(x,y);c.rotate(Math.atan2(dy,dx));c.fillStyle=color;c.beginPath();c.moveTo(9,0);c.lineTo(-6,-6);c.lineTo(-6,6);c.closePath();c.fill();c.restore();
    c.fillStyle=color;c.font='700 10px system-ui';c.textAlign='center';c.fillText(`R${index+1}${actor.radius>=state.collector.radius*state.captureRatio?' !':''}`,x,y+20);
   }
  });
  this.elapsed+=delta;this.frameTotal++;this.paintTotal+=performance.now()-started;
  if(this.elapsed-this.metricAt>.25){
   const data=this.canvas.dataset;data.collectorX=state.collector.x.toFixed(3);data.collectorZ=state.collector.z.toFixed(3);
   data.collectorScreen=JSON.stringify(playerGeometry.center);data.collected=String(this.seen.size);
   data.rivals=JSON.stringify(state.rivals.map(a=>({id:a.id,x:a.x,z:a.z,alive:a.alive,score:a.score})));data.rearEdge=String(this.rearEdge);
   data.loaded=String([...this.images.values()].filter(v=>v.ready).length);data.failed=String([...this.images.values()].filter(v=>v.failed).length);
   data.nearest=nearest?JSON.stringify({worldX:nearest.x,worldZ:nearest.z,tier:nearest.tier,...project(nearest.x,nearest.z)}):'null';
   data.paintMs=(this.paintTotal/this.frameTotal).toFixed(2);data.fps=(this.frameTotal/Math.max(.001,this.elapsed)).toFixed(1);
   data.rim=JSON.stringify(playerGeometry);data.cameraScale=view.scale.toFixed(2);data.cameraCenter=JSON.stringify({x:view.x,z:view.z});data.counterQuad=JSON.stringify([[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>project(x*state.width/2,z*state.depth/2)));this.metricAt=this.elapsed;
  }
 }
}
