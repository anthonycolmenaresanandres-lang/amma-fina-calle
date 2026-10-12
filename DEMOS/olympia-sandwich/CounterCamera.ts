import {projectToCounter,roomLayout} from './CounterProjection';

interface CameraInput {
 width:number;height:number;rearEdge:number;arenaWidth:number;arenaDepth:number;
 x:number;z:number;radius:number;active:boolean;reducedMotion:boolean;
}
const clampAxis=(position:number,min:number,max:number)=>min>max?0:Math.max(min,Math.min(max,position));
/** A parallel counter plane: movement cannot change scale or bend its screen direction. */
export class CounterCamera {
 private x=0;private z=0;private ppu=0;
 reset(){this.ppu=0;}
 update(input:CameraInput,delta:number){
  const{width,height,rearEdge,arenaWidth,arenaDepth,radius}=input;
  const center=projectToCounter(0,0,1,1,roomLayout(width,height));
  const depthRatio=center.depthScale/center.scale;
  const target=Math.min(Math.min(width*.14,height*.18)*Math.sqrt(.95/radius),Math.min(width*.36,height*.45)/(radius*1.8));
  const anchorX=width*.5,anchorY=height*.53;
  const bounds={left:12,right:width-12,top:rearEdge+12,bottom:height-Math.min(84,height*.2)};
  if(!this.ppu||input.active){
   // Follow immediately; ease only growth. Pausing freezes both framing and scale.
   const blend=!this.ppu||input.reducedMotion?1:1-Math.exp(-4.5*Math.max(0,Math.min(delta,.1)));
   this.ppu+=(target-this.ppu)*blend;
   // A capture can skip several tiers: fit the rim immediately, then ease the remaining zoom.
   const fit=Math.min(anchorX-bounds.left,bounds.right-anchorX,(anchorY-bounds.top)/depthRatio,(bounds.bottom-anchorY)/depthRatio)/(radius*.9);
   this.ppu=Math.min(this.ppu,Math.max(target,fit));
   this.x=clampAxis(input.x,-arenaWidth/2+(anchorX-bounds.left)/this.ppu,arenaWidth/2-(bounds.right-anchorX)/this.ppu);
   this.z=clampAxis(input.z,-arenaDepth/2+(anchorY-bounds.top)/(this.ppu*depthRatio),arenaDepth/2-(bounds.bottom-anchorY)/(this.ppu*depthRatio));
  }
  const x=this.x,z=this.z,scale=this.ppu,depthScale=scale*depthRatio;
  return {x,z,scale,depthScale,target,anchorX,anchorY,bounds,
   project:(worldX:number,worldZ:number)=>({x:anchorX+(worldX-x)*scale,y:anchorY+(worldZ-z)*depthScale,scale,depthScale})};
 }
}
