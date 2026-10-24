import { WORLD_WIDTH, WORLD_HEIGHT, type HoleItem, type HoleState } from "./hole-engine";
import { applyGroundTransform, projectGround } from "./hole-camera";

// Original low-poly courtyard art. The same projected scene serves Phaser and
// the Canvas2D fallback; no assets, copied game art, or gameplay changes.
const C = {
  cream: "#fffaf0", green: "#244536", chili: "#9b382b", gold: "#b58a4a",
  floor: "#dfb18b", tile: "#d6a47b", grout: "#edccb0", clay: "#b96a42",
  dark: "#101c19", shadow: "rgba(69,43,28,.17)", wood: "#8d593b",
};
type Point3 = [number, number, number];
type Face = { points: Point3[]; fill: string };
type PropFrame = { x: number; y: number; z: number; rotation: number; scale: number };
let paving: HTMLCanvasElement | null = null;

function path(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index++) ctx.lineTo(points[index].x, points[index].y);
  ctx.closePath();
}

function flatCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, fill: string) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawPaving(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#eee6d7";
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  // The two visible slab faces establish height without enclosing the play area.
  for (const [edge, color] of [
    [[[WORLD_WIDTH, 0, 0], [WORLD_WIDTH, WORLD_HEIGHT, 0], [WORLD_WIDTH, WORLD_HEIGHT, -9], [WORLD_WIDTH, 0, -9]], "#9c684d"],
    [[[0, WORLD_HEIGHT, 0], [WORLD_WIDTH, WORLD_HEIGHT, 0], [WORLD_WIDTH, WORLD_HEIGHT, -9], [0, WORLD_HEIGHT, -9]], "#b5815d"],
  ] as [Point3[], string][]) {
    path(ctx, edge.map(([x,y,z]) => projectGround(x,y,z)));
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.save();
  applyGroundTransform(ctx);
  ctx.beginPath();
  ctx.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  ctx.clip();
  ctx.fillStyle = C.floor;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 8; col++) {
      const x = col * 64 + (row % 2 ? -30 : 0);
      const y = row * 68;
      ctx.fillStyle = (row + col) % 3 === 0 ? C.tile : C.floor;
      ctx.fillRect(x + 2, y + 2, 61, 65);
      ctx.strokeStyle = C.grout;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(x + 1, y + 1, 63, 67);
    }
  }
  // A low tile inlay stays inside the field. No walls obscure edge collectibles.
  ctx.strokeStyle = C.green;
  ctx.lineWidth = 8;
  ctx.strokeRect(5, 5, WORLD_WIDTH - 10, WORLD_HEIGHT - 10);
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(11, 11, WORLD_WIDTH - 22, WORLD_HEIGHT - 22);
  ctx.restore();
}

function backdrop(ctx: CanvasRenderingContext2D) {
  if (!paving && typeof document !== "undefined") {
    const surface = document.createElement("canvas");
    surface.width = WORLD_WIDTH;
    surface.height = WORLD_HEIGHT;
    const ink = surface.getContext("2d");
    if (ink) { drawPaving(ink); paving = surface; }
  }
  if (paving) ctx.drawImage(paving, 0, 0);
  else drawPaving(ctx);
}

function worldPoint(frame: PropFrame, [x,y,z]: Point3): Point3 {
  const cos = Math.cos(frame.rotation), sin = Math.sin(frame.rotation);
  return [frame.x + (x * cos - y * sin) * frame.scale, frame.y + (x * sin + y * cos) * frame.scale, frame.z + z * frame.scale];
}

function mesh(ctx: CanvasRenderingContext2D, frame: PropFrame, faces: Face[]) {
  // Internal faces use the viewing direction (the cross product of the camera's
  // screen axes). Whole props are sorted separately by their ground anchors.
  const p = projectGround(0,0,0), px = projectGround(1,0,0), py = projectGround(0,1,0), pz = projectGround(0,0,1);
  const a = px.x-p.x, b = py.x-p.x, c = pz.x-p.x;
  const d = px.y-p.y, e = py.y-p.y, f = pz.y-p.y;
  const depth = ([x,y,z]: Point3) => (b*f-c*e)*x + (c*d-a*f)*y + (a*e-b*d)*z;
  const projected = faces.map(face => {
    const vertices = face.points.map(point => worldPoint(frame, point));
    return { ...face, vertices, depth: vertices.reduce((total, vertex) => total + depth(vertex), 0) / vertices.length };
  }).sort((left, right) => left.depth - right.depth);
  for (const face of projected) {
    path(ctx, face.vertices.map(([x,y,z]) => projectGround(x,y,z)));
    ctx.fillStyle = face.fill;
    ctx.fill();
  }
}

function box(faces: Face[], x: number, y: number, z: number, width: number, depth: number, height: number, colors: [string,string,string]) {
  const x0 = x-width/2, x1 = x+width/2, y0 = y-depth/2, y1 = y+depth/2, top = z+height;
  faces.push(
    { points: [[x0,y0,z],[x1,y0,z],[x1,y0,top],[x0,y0,top]], fill: colors[1] },
    { points: [[x1,y0,z],[x1,y1,z],[x1,y1,top],[x1,y0,top]], fill: colors[2] },
    { points: [[x1,y1,z],[x0,y1,z],[x0,y1,top],[x1,y1,top]], fill: colors[2] },
    { points: [[x0,y1,z],[x0,y0,z],[x0,y0,top],[x0,y1,top]], fill: colors[1] },
    { points: [[x0,y0,top],[x1,y0,top],[x1,y1,top],[x0,y1,top]], fill: colors[0] },
  );
}

function disc(faces: Face[], x: number, y: number, z: number, radius: number, color: string, sides = 16) {
  faces.push({ fill: color, points: Array.from({ length: sides }, (_, index) => {
    const angle = index * Math.PI * 2 / sides;
    return [x + Math.cos(angle)*radius, y + Math.sin(angle)*radius, z] as Point3;
  }) });
}

function cylinder(faces: Face[], radius: number, height: number, colors: [string,string,string], bottom = radius, z = 0, sides = 16) {
  for (let index = 0; index < sides; index++) {
    const a = index * Math.PI * 2 / sides, b = (index+1) * Math.PI * 2 / sides;
    faces.push({ fill: Math.sin((a+b)/2) + Math.cos((a+b)/2)*0.4 > 0 ? colors[2] : colors[1], points: [
      [Math.cos(a)*bottom,Math.sin(a)*bottom,z], [Math.cos(b)*bottom,Math.sin(b)*bottom,z],
      [Math.cos(b)*radius,Math.sin(b)*radius,z+height], [Math.cos(a)*radius,Math.sin(a)*radius,z+height],
    ] });
  }
  disc(faces, 0, 0, z+height, radius, colors[0], sides);
}

function lime(faces: Face[], r: number) {
  cylinder(faces, r*.84, r*.6, ["#d3df84","#8da43f","#577c2c"], r*.57, 0, 10);
  const z = r*.6+.2;
  for (let index = 0; index < 5; index++) {
    const angle = index * Math.PI * 2 / 5;
    faces.push({ fill: "#a8bd55", points: [[0,0,z],[Math.cos(angle+.1)*r*.65,Math.sin(angle+.1)*r*.65,z],[Math.cos(angle+1.08)*r*.65,Math.sin(angle+1.08)*r*.65,z]] });
  }
}

function chili(faces: Face[], r: number) {
  const curve: Point3[] = [[-r*.6,-r*.45,2],[-r*.13,-r*.2,r*.43],[r*.4,r*.12,r*.31],[r*.43,r*.76,1]];
  const widths = [r*.18,r*.27,r*.19,0];
  for (let index = 0; index < curve.length-1; index++) {
    const [x,y,z] = curve[index], [nx,ny,nz] = curve[index+1];
    faces.push({ fill: index % 2 ? "#b54a32" : C.chili, points: [[x-widths[index],y,z],[nx-widths[index+1],ny,nz],[nx+widths[index+1],ny,nz],[x+widths[index],y,z]] });
    faces.push({ fill: "#773326", points: [[x-widths[index],y,0],[nx-widths[index+1],ny,0],[nx-widths[index+1],ny,nz],[x-widths[index],y,z]] });
  }
  box(faces,-r*.6,-r*.65,1,r*.16,r*.42,r*.18,["#69834c",C.green,C.green]);
}

function cup(faces: Face[], r: number) {
  const height = r*1.5;
  cylinder(faces,r*.64,height,[C.cream,"#e5d9bb","#bdad8c"],r*.49);
  disc(faces,0,0,height+.15,r*.49,"#5e3526");
  disc(faces,-r*.09,-r*.11,height+.3,r*.22,"#a16e43");
  for (let index = 0; index < 12; index++) {
    const a = index*Math.PI/6, b = (index+1)*Math.PI/6;
    const p = (angle:number,inner:boolean):Point3 => [r*.75+Math.cos(angle)*r*(inner?.14:.25),0,height*.52+Math.sin(angle)*height*(inner?.18:.29)];
    faces.push({ fill: index < 6 ? "#d7c7a7" : C.cream, points: [p(a,false),p(b,false),p(b,true),p(a,true)] });
  }
}

function taco(faces: Face[], r: number) {
  // A standing shell, rather than a flat icon: two curved walls and visible filling.
  for (const side of [-1,1]) {
    const points: Point3[] = [[-r*.86,side*r*.24,0]];
    for (let index = 0; index <= 10; index++) {
      const angle = Math.PI - index*Math.PI/10;
      points.push([Math.cos(angle)*r*.86,side*r*.24,Math.sin(angle)*r*.78+1]);
    }
    points.push([r*.86,side*r*.24,0]);
    faces.push({ points, fill: side < 0 ? "#e2b762" : "#c99442" });
  }
  for (let index = 0; index < 5; index++) {
    const x = (index-2)*r*.29, z = Math.sqrt(Math.max(0,1-(x/(r*.9))**2))*r*.78+1.5;
    box(faces,x,0,z,r*.23,r*.37,r*.12,[index%2?"#738c44":"#91a852","#587539",C.green]);
    box(faces,x+r*.05,r*.1,z+r*.12,r*.1,r*.12,r*.09,[C.chili,"#b95838","#803025"]);
  }
}

function planter(faces: Face[], r: number) {
  const height = r*.86;
  cylinder(faces,r*.64,height,["#c98b63",C.clay,"#8d4f33"],r*.44);
  cylinder(faces,r*.7,r*.14,["#d69d74","#c7845d","#a96845"],r*.7,height-r*.08);
  disc(faces,0,0,height+r*.07,r*.54,"#514531");
  for (let index = 0; index < 7; index++) {
    const angle = index*Math.PI*2/7, cos = Math.cos(angle), sin = Math.sin(angle);
    const leafHeight = r*(.95+(index%3)*.12);
    faces.push({ fill: index%2 ? "#688453" : C.green, points: [
      [0,0,height], [cos*r*.42-sin*r*.16,sin*r*.42+cos*r*.16,height+leafHeight*.61],
      [cos*r*.83,sin*r*.83,height+leafHeight], [cos*r*.43+sin*r*.13,sin*r*.43-cos*r*.13,height+leafHeight*.5],
    ] });
  }
}

function chair(faces: Face[], r: number) {
  const w = r*1.04, d = r*.92, seat = r*.7;
  const wood: [string,string,string] = ["#bd8756",C.wood,"#70442f"];
  for (const x of [-w*.38,w*.38]) {
    for (const y of [-d*.37,d*.37]) box(faces,x,y,0,r*.1,r*.1,seat,wood);
    box(faces,x,-d*.37,seat,r*.1,r*.1,r*.87,wood);
  }
  box(faces,0,0,seat-r*.1,w,d,r*.1,wood);
  for (const z of [seat+r*.23,seat+r*.49,seat+r*.75]) box(faces,0,-d*.37,z,w*.87,r*.09,r*.14,wood);
}

function table(faces: Face[], r: number) {
  const wood: [string,string,string] = ["#c39869","#9d724f","#795538"];
  for (const x of [-r*.3,r*.3]) for (const y of [-r*.3,r*.3]) box(faces,x,y,0,r*.08,r*.08,r*.67,wood);
  cylinder(faces,r*.63,r*.07,wood,r*.63,r*.65);
  box(faces,0,0,r*.7,r*.065,r*.065,r*.97,[C.gold,"#9d784a","#765b3c"]);
  const edge = r*1.35, peak = r*1.77, canopy = r*.9;
  for (let index = 0; index < 8; index++) {
    const a = index*Math.PI/4, b = (index+1)*Math.PI/4;
    const pa:Point3 = [Math.cos(a)*canopy,Math.sin(a)*canopy,edge];
    const pb:Point3 = [Math.cos(b)*canopy,Math.sin(b)*canopy,edge];
    const color = index%2 ? "#d5b58a" : "#ae6b4f";
    faces.push({ points: [[0,0,peak],pa,pb], fill: color });
    faces.push({ points: [pa,pb,[pb[0],pb[1],edge-r*.11],[pa[0],pa[1],edge-r*.11]], fill: index%2?"#b99970":"#8e513f" });
  }
  box(faces,0,0,peak,r*.07,r*.07,r*.065,[C.gold,C.gold,"#82613d"]);
}

const HEIGHT = { lime: 7, chili: 7, cup: 24, taco: 17, planter: 51, chair: 54, table: 82 };
const MODELS = { lime, chili, cup, taco, planter, chair, table };
const modelCache = new Map<string, Face[]>();

function propFrame(item: HoleItem, state: HoleState, reducedMotion: boolean): PropFrame {
  if (item.sink === 0) return { x:item.x,y:item.y,z:0,rotation:item.rotation,scale:1 };
  const sink = Math.min(1,item.sink), scale = reducedMotion ? 1 : 1-sink*.17;
  const dx = item.x-state.x, dy = item.y-state.y, distance = Math.hypot(dx,dy);
  const available = Math.max(0,state.radius-item.radius*scale-2);
  const offset = Math.min(1-sink,distance > 0 ? available/distance : 0);
  return {
    x:state.x+dx*offset,y:state.y+dy*offset,z:reducedMotion ? 0 : -(HEIGHT[item.kind]*1.08+state.radius*.9)*sink,
    rotation:item.rotation,scale,
  };
}

/** Clip a sinking silhouette above the projected aperture's FRONT INNER edge.
 * The ellipse basis comes from projectGround, so camera changes stay consistent.
 * No rim is repainted over props that are nearer to the viewer.
 */
function clipAtMouth(ctx: CanvasRenderingContext2D, state: HoleState) {
  const r = Math.max(1,state.radius-1.4);
  const center = projectGround(state.x,state.y), px = projectGround(state.x+r,state.y), py = projectGround(state.x,state.y+r);
  const ux = px.x-center.x, uy = px.y-center.y, vx = py.x-center.x, vy = py.y-center.y;
  const rx = Math.hypot(ux,vx), slope = (ux*uy+vx*vy)/(rx*rx);
  const ry = Math.sqrt(Math.max(0,uy*uy+vy*vy-slope*slope*rx*rx));
  ctx.beginPath();
  ctx.moveTo(center.x-rx,-WORLD_HEIGHT);
  ctx.lineTo(center.x+rx,-WORLD_HEIGHT);
  for (let index = 0; index <= 32; index++) {
    const angle = index*Math.PI/32, dx = rx*Math.cos(angle);
    ctx.lineTo(center.x+dx,center.y+slope*dx+ry*Math.sin(angle));
  }
  ctx.closePath();
  ctx.clip();
}

function drawGroundDetails(ctx: CanvasRenderingContext2D, state: HoleState, reducedMotion: boolean) {
  ctx.save();
  applyGroundTransform(ctx);
  ctx.beginPath(); ctx.rect(0,0,WORLD_WIDTH,WORLD_HEIGHT); ctx.clip();
  for (const item of state.items) {
    if (item.collected || item.sink > 0) continue;
    ctx.beginPath();
    ctx.ellipse(item.x+HEIGHT[item.kind]*.16,item.y+HEIGHT[item.kind]*.19,item.radius*.9,item.radius*.72,0,0,Math.PI*2);
    ctx.fillStyle = C.shadow; ctx.fill();
    if (item.radius <= state.radius*.82) {
      ctx.beginPath(); ctx.arc(item.x,item.y,item.radius+3,0,Math.PI*2);
      ctx.strokeStyle = "#956b30"; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(item.x,item.y,item.radius+1.4,0,Math.PI*2);
      ctx.strokeStyle = "#f8df9e"; ctx.lineWidth = 1.5; ctx.stroke();
    }
  }
  const {x,y,radius:r} = state;
  flatCircle(ctx,x,y+2,r+4,"rgba(61,40,27,.2)");
  flatCircle(ctx,x,y,r+3,C.cream);
  flatCircle(ctx,x,y,r+1.5,C.gold);
  flatCircle(ctx,x,y,r,C.dark);
  flatCircle(ctx,x,y-r*.05,r*.78,"#08120f");
  ctx.strokeStyle = "#294838"; ctx.lineWidth = Math.max(1,r*.035);
  const turn = reducedMotion ? 0 : state.elapsed/2200;
  for (let index=0;index<2;index++) {
    ctx.beginPath(); ctx.arc(x,y,r*(.34+index*.25),turn+index*2.7,turn+index*2.7+3.3); ctx.stroke();
  }
  ctx.restore();
}

export function drawCourtyard(ctx: CanvasRenderingContext2D, state: HoleState, reducedMotion: boolean): void {
  ctx.save();
  ctx.clearRect(0,0,WORLD_WIDTH,WORLD_HEIGHT);
  backdrop(ctx);
  drawGroundDetails(ctx,state,reducedMotion);
  const props = state.items.filter(item => !item.collected).map(item => {
    const frame = propFrame(item,state,reducedMotion);
    return { item,frame,depth:projectGround(frame.x,frame.y).y };
  }).sort((left,right) => left.depth-right.depth || left.item.id-right.item.id);
  for (const {item,frame} of props) {
    ctx.save();
    if (item.sink > 0) {
      clipAtMouth(ctx,state);
      // Finish below the front rim; a brief terminal fade avoids a last-frame pop.
      ctx.globalAlpha = reducedMotion ? 1-item.sink : Math.min(1,(1-item.sink)/.15);
    }
    const key = `${item.kind}:${item.radius}`;
    let faces = modelCache.get(key);
    if (!faces) { faces = []; MODELS[item.kind](faces,item.radius); modelCache.set(key,faces); }
    mesh(ctx,frame,faces);
    ctx.restore();
  }
  // The player's label is screen-space, while its opening and capture area stay
  // in world space. No global front-lip pass can overpaint a foreground prop.
  if (state.mode === "running" && state.elapsed < 2800) {
    const label = projectGround(state.x,state.y+state.radius+18);
    ctx.fillStyle = C.green; ctx.font = "700 9px Arial, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("YOU",label.x,Math.min(WORLD_HEIGHT-16,label.y));
  }
  ctx.restore();
}
