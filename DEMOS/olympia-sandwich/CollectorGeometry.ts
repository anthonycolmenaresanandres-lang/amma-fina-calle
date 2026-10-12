import {captureRadius} from '../collector-standard/rules';
import footprint from './sandwich-footprint.json';
export type ScreenPoint={x:number;y:number};
type Project=(x:number,z:number)=>ScreenPoint;
/** Exact projection of the gameplay capture circle; food alpha hull stays inside it. */
export function collectorGeometry(x:number,z:number,radius:number,project:Project){
 const center=project(x,z),r=captureRadius(radius);
 const rim=Array.from({length:64},(_,i)=>{const a=i/64*Math.PI*2;return project(x+Math.cos(a)*r,z+Math.sin(a)*r);});
 let width=Infinity;
 for(let i=0;i<rim.length;i++){
  const a=rim[i],b=rim[(i+1)%rim.length],ex=b.x-a.x,ey=b.y-a.y;
  const room=ex*(center.y-a.y)-ey*(center.x-a.x);
  for(const [dx,dy] of footprint.points){const outward=-(ex*dy-ey*dx);if(outward>0)width=Math.min(width,room/outward);}
 }
 return{center,rim,width:Math.max(0,width*.94),captureRadius:r};
}
