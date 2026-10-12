export type Point={x:number;y:number};
export interface RoomLayout{left:number;top:number;width:number;height:number;quad:[Point,Point,Point,Point];}
/** Measured artwork plane. World X/Z square projects onto this quadrilateral. */
export const COUNTER_QUAD=[[.114,.308],[.881,.308],[.957,.713],[.042,.713]] as const;
export function roomLayout(width:number,height:number):RoomLayout{
 // Portrait keeps the room. Landscape crops decorative ceiling/floor, not the play plane.
 const landscape=width>height*1.15;
 const roomHeight=landscape?height*1.75:Math.min(height,width*1672/941);
 const roomWidth=roomHeight*941/1672;
 const left=(width-roomWidth)/2,top=landscape?height*.08-roomHeight*.308:(height-roomHeight)/2;
 const quad=COUNTER_QUAD.map(([x,y])=>({x:left+x*roomWidth,y:top+y*roomHeight})) as RoomLayout['quad'];
 return{left,top,width:roomWidth,height:roomHeight,quad};
}
export function projectToCounter(x:number,z:number,arenaWidth:number,arenaDepth:number,layout:RoomLayout){
 const [tl,tr,br,bl]=layout.quad,u=x/arenaWidth+.5,v=z/arenaDepth+.5;
 const ratio=(tr.x-tl.x)/(br.x-bl.x),denominator=1+(ratio-1)*v;
 const left=(tl.x*(1-v)+ratio*bl.x*v)/denominator;
 const right=(tr.x*(1-v)+ratio*br.x*v)/denominator;
 const y=(tl.y*(1-v)+ratio*bl.y*v)/denominator;
 return{x:left+(right-left)*u,y,scale:(right-left)/arenaWidth,
  depthScale:ratio*(bl.y-tl.y)/(denominator*denominator)/arenaDepth};
}
