import type {CollectorRace} from '../../../../../../DEMOS/collector-standard/engine';
import {COUNTERS,PICKUPS,type PickupKind} from '../game-config';
export function loadArt(){const art={} as Record<PickupKind,HTMLImageElement>;for(const kind of Object.keys(PICKUPS) as PickupKind[]){const image=new Image();image.src=`/assets/royal-chocolate/${kind}.svg`;art[kind]=image;}return art;}
function product(ctx:CanvasRenderingContext2D,kind:PickupKind,size:number){
 ctx.save();ctx.scale(size/20,size/20);ctx.lineCap='round';
 if(kind==='strawberry'){ctx.fillStyle='#cc4e70';ctx.beginPath();ctx.moveTo(-9,-6);ctx.bezierCurveTo(-16,-17,18,-18,10,-4);ctx.lineTo(0,15);ctx.closePath();ctx.fill();ctx.fillStyle='#523328';ctx.fillRect(-5,2,10,5);ctx.fillStyle='#b8ca97';ctx.fillRect(-6,-14,13,4);}
 else if(kind==='apple'){ctx.strokeStyle='#b98654';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(0,-19);ctx.stroke();ctx.fillStyle='#523328';ctx.beginPath();ctx.ellipse(0,1,13,14,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff2da';ctx.lineWidth=2;for(let n=-5;n<=7;n+=6){ctx.beginPath();ctx.moveTo(-10,n);ctx.lineTo(10,n+3);ctx.stroke();}}
 else if(kind==='wafer'){ctx.fillStyle='#e4be96';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b98654';for(const [x,y] of [[-4,-3],[5,-4],[0,6]]){ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();}}
 else if(kind==='marshmallow'){ctx.fillStyle='#fff2da';ctx.beginPath();ctx.roundRect(-10,-12,20,25,4);ctx.fill();ctx.fillStyle='#dac2b2';ctx.fillRect(6,-7,4,16);}
 else if(kind==='pretzel'){ctx.strokeStyle='#c69861';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-9,10);ctx.bezierCurveTo(11,-25,26,14,0,4);ctx.bezierCurveTo(-25,-15,-16,27,9,10);ctx.stroke();}
 else{ctx.fillStyle='#523328';ctx.fillRect(-12,-11,24,23);ctx.fillStyle='#b98654';for(const x of [-9,2])for(const y of [-8,3])ctx.fillRect(x,y,8,8);}
 ctx.restore();
}
export function drawCounter(ctx:CanvasRenderingContext2D,width:number,height:number,race:CollectorRace,level:number,art:Record<PickupKind,HTMLImageElement>,pointer:{x:number;y:number;dx:number;dy:number}|null){
 const spec=COUNTERS[level],scale=Math.max(12,Math.min(18,width/28));
 const camX=width/scale>=spec.size?0:Math.max(-spec.size/2+width/scale/2,Math.min(spec.size/2-width/scale/2,race.player.x));
 const camZ=height/scale>=spec.size?0:Math.max(-spec.size/2+height/scale/2,Math.min(spec.size/2-height/scale/2,race.player.z));
 const px=(x:number)=>width/2+(x-camX)*scale,pz=(z:number)=>height/2+(z-camZ)*scale;
 ctx.clearRect(0,0,width,height);ctx.fillStyle='#211b1a';ctx.fillRect(0,0,width,height);
 ctx.save();ctx.beginPath();ctx.rect(px(-spec.size/2),pz(-spec.size/2),spec.size*scale,spec.size*scale);ctx.clip();
 ctx.fillStyle=spec.color;ctx.fillRect(0,0,width,height);
 // One cohesive top-down chocolate-shop counter: subtle stone veins, inset edge, serving displays.
 ctx.strokeStyle='#fff2da0b';ctx.lineWidth=2;
 for(let n=-30;n<40;n+=6){ctx.beginPath();ctx.moveTo(px(n),pz(-spec.size/2));ctx.bezierCurveTo(px(n+12),pz(-5),px(n-10),pz(7),px(n+9),pz(spec.size/2));ctx.stroke();}
 ctx.strokeStyle='#b98654';ctx.lineWidth=9;ctx.strokeRect(px(-spec.size/2),pz(-spec.size/2),spec.size*scale,spec.size*scale);
 for(const o of race.obstacles){ctx.fillStyle='#211b1a';ctx.beginPath();ctx.roundRect(px(o.x-o.halfWidth),pz(o.z-o.halfDepth),o.halfWidth*2*scale,o.halfDepth*2*scale,8);ctx.fill();ctx.strokeStyle='#c69861';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#e4be96';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(level===1?'TASTING TRAY':'DISPLAY',px(o.x),pz(o.z)+4);}
 for(const actor of race.actors){if(!actor.alive)continue;const x=px(actor.x),y=pz(actor.z),r=actor.radius*.9*scale;
  const color=actor.id==='player'?'#b8ca97':actor.id==='rival'?'#f7c5c2':actor.id==='rival-2'?'#a5c2d0':'#f0b879';
  ctx.fillStyle='#140d0c';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=5;ctx.stroke();
  ctx.strokeStyle='#523328';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r*.68,.2,Math.PI*1.2);ctx.stroke();
  ctx.fillStyle=color;ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(actor.id==='player'?'YOU':actor.id==='rival'?'RIVAL 1':actor.id==='rival-2'?'RIVAL 2':'RIVAL 3',x,y-r-9);
 }
 for(const item of race.items){if(item.collected)continue;const x=px(item.renderX),y=pz(item.renderZ);if(x<-45||x>width+45||y<-45||y>height+45)continue;
  const kind=item.defId as PickupKind,size=Math.max(30,item.radius*scale*2.8)*(1-item.sinkProgress*.75),image=art[kind];
  ctx.save();ctx.translate(x,y);ctx.rotate(item.rotationY);ctx.globalAlpha=1-item.sinkProgress*.6;
  if(image?.complete&&image.naturalWidth>0)ctx.drawImage(image,-size/2,-size*.425,size,size*.85);else product(ctx,kind,size/2);
  ctx.restore();
 }
 ctx.restore();
 if(pointer){ctx.fillStyle='#fff2da20';ctx.strokeStyle='#fff2da88';ctx.lineWidth=1;ctx.beginPath();ctx.arc(pointer.x,pointer.y,32,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#b8ca97aa';ctx.beginPath();ctx.arc(pointer.x+pointer.dx*27,pointer.y+pointer.dy*27,11,0,Math.PI*2);ctx.fill();}
 // Compact overview keeps unseen products/rivals discoverable on the large later counters.
 const mini=64,left=width-mini-12,top=12;
 ctx.fillStyle='#211b1add';ctx.fillRect(left,top,mini,mini);ctx.strokeStyle='#fff2da55';ctx.strokeRect(left,top,mini,mini);
 const mx=(x:number)=>left+(x/spec.size+.5)*mini,mz=(z:number)=>top+(z/spec.size+.5)*mini;
 for(const item of race.items)if(!item.collected){ctx.fillStyle='#e4be9677';ctx.fillRect(mx(item.x),mz(item.z),1.5,1.5);}
 for(const actor of race.actors)if(actor.alive){ctx.fillStyle=actor.id==='player'?'#b8ca97':'#cc4e70';ctx.beginPath();ctx.arc(mx(actor.x),mz(actor.z),2.5,0,Math.PI*2);ctx.fill();}
}
