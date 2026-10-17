import type {CollectorRace} from './collector-standard/engine';
import {countersFor,PICKUPS,type PickupKind} from './game-config';
import type {Venue} from './data';
const kinds=Object.keys(PICKUPS) as PickupKind[];
export function loadArt(venue:Venue){const art={} as Record<PickupKind,HTMLImageElement>;for(const [i,kind]of kinds.entries()){const image=new Image();image.src='/assets/'+venue.slug+'/'+venue.foods[i]+'.svg';art[kind]=image;}return art;}
export function drawCounter(ctx:CanvasRenderingContext2D,width:number,height:number,race:CollectorRace,level:number,art:Record<PickupKind,HTMLImageElement>,pointer:{x:number;y:number;dx:number;dy:number}|null,venue:Venue){
 const spec=countersFor(venue)[level],scale=Math.min((width-24)/spec.size,(height-26)/spec.size),px=(x:number)=>width/2+x*scale,pz=(z:number)=>height/2+z*scale;const aji=venue.short==='Aji';
 ctx.clearRect(0,0,width,height);ctx.fillStyle=aji?'#122736':'#283e30';ctx.fillRect(0,0,width,height);
 ctx.fillStyle=aji?'#294653':'#476349';ctx.beginPath();ctx.roundRect(px(-spec.size/2),pz(-spec.size/2),spec.size*scale,spec.size*scale,12);ctx.fill();
 ctx.strokeStyle=aji?'#f6ecd50b':'#f6e6c60d';ctx.lineWidth=1;for(let x=-spec.size/2+3;x<spec.size/2;x+=4){ctx.beginPath();ctx.moveTo(px(x),pz(-spec.size/2));ctx.lineTo(px(x),pz(spec.size/2));ctx.stroke();}
 for(const o of race.obstacles){ctx.fillStyle=aji?'#122736':'#283e30';ctx.beginPath();ctx.roundRect(px(o.x-o.halfWidth),pz(o.z-o.halfDepth),o.halfWidth*2*scale,o.halfDepth*2*scale,5);ctx.fill();}
 for(const actor of race.actors){if(!actor.alive)continue;const x=px(actor.x),y=pz(actor.z),r=actor.radius*.9*scale,color=actor.id==='player'?'#f4ce67':actor.id==='rival'?'#f66a49':actor.id==='rival-2'?'#97c9e3':'#e9a3ca';ctx.fillStyle='#101d22';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke();ctx.fillStyle=color;ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText(actor.id==='player'?'YOU':actor.id==='rival'?'1':actor.id==='rival-2'?'2':'3',x,y-r-5);}
 for(const item of race.items){if(item.collected)continue;const kind=item.defId as PickupKind,x=px(item.renderX),y=pz(item.renderZ),size=Math.max(18,item.radius*scale*3)*(1-item.sinkProgress*.75),image=art[kind];ctx.save();ctx.translate(x,y);ctx.rotate(item.rotationY);ctx.globalAlpha=1-item.sinkProgress*.6;if(image?.complete&&image.naturalWidth>0)ctx.drawImage(image,-size/2,-size*.425,size,size*.85);else{ctx.fillStyle=venue.short==='Aji'?'#efb668':'#f4ce67';ctx.beginPath();ctx.ellipse(0,0,size*.42,size*.30,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff2d0';ctx.lineWidth=1;ctx.stroke();}ctx.restore();}
 if(pointer){ctx.fillStyle='#f6ecd520';ctx.strokeStyle='#f6ecd588';ctx.lineWidth=1;ctx.beginPath();ctx.arc(pointer.x,pointer.y,32,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#f4ce67aa';ctx.beginPath();ctx.arc(pointer.x+pointer.dx*27,pointer.y+pointer.dy*27,11,0,Math.PI*2);ctx.fill();}
}
