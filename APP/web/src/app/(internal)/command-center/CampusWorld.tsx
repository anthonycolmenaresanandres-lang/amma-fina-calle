import type { Place, PlaceId } from "./campus";
import styles from "./command-center.module.css";

// A deterministic vector miniature: no textures, engine, network or render loop.
export function project(x: number, y: number, z = 0): [number, number] {
  return [520 + (x - y) * 0.866, 115 + (x + y) * 0.5 - z];
}
function points(vertices: number[][]): string {
  return vertices.map(([x, y, z]) => project(x, y, z).join(",")).join(" ");
}
function Box({ x, y, w, d, h, top = "#427cf1", left = "#2456c6", right = "#163d9f", z = 0 }: {
  x: number; y: number; w: number; d: number; h: number;
  top?: string; left?: string; right?: string; z?: number;
}) {
  return <g>
    <polygon points={points([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]])} fill={left} />
    <polygon points={points([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]])} fill={right} />
    <polygon points={points([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]])} fill={top} />
  </g>;
}
function Tree({ x, y }: { x: number; y: number }) {
  const [sx, sy] = project(x, y);
  return <g>
    <ellipse cx={sx+9} cy={sy+4} rx="19" ry="9" fill="#9fbaa8" opacity=".3" />
    <path d={`M ${sx} ${sy} v -36`} stroke="#688677" strokeWidth="5" />
    <ellipse cx={sx} cy={sy-44} rx="15" ry="24" fill="#449d75" />
    <ellipse cx={sx-4} cy={sy-49} rx="10" ry="18" fill="#65bc8b" />
  </g>;
}
function Forklift({ x, y }: { x: number; y: number }) {
  const [sx,sy] = project(x,y);
  return <g transform={`translate(${sx} ${sy})`}>
    <ellipse cx="8" cy="5" rx="27" ry="10" fill="#7894ad" opacity=".2" />
    <path d="M -18 -3 L 8 11 L 27 0 L 0 -14 Z" fill="#d99923" />
    <path d="M -18 -17 L 8 -3 L 8 11 L -18 -3 Z" fill="#ffc842" />
    <path d="M 8 -3 L 27 -14 L 27 0 L 8 11 Z" fill="#e4ab24" />
    <path d="M -14 -16 V -44 L 7 -33 V -3 M -14 -44 L 1 -53 L 22 -42 L 7 -33 M 22 -42 V -14" fill="none" stroke="#28394e" strokeWidth="4" strokeLinejoin="round" />
    <path d="M 28 -35 V 6 L 43 14 M 34 -31 V 2 L 48 10" fill="none" stroke="#40566a" strokeWidth="3" />
    <ellipse cx="-10" cy="1" rx="5" ry="7" fill="#28394e" /><ellipse cx="19" cy="6" rx="5" ry="7" fill="#28394e" />
  </g>;
}
function Building({ place, selected }: { place: Place; selected: boolean }) {
  const { x, y, width: w, depth: d, height: h } = place;
  return <g>
    <polygon points={points([[x-10,y-10,1],[x+w+10,y-10,1],[x+w+10,y+d+10,1],[x-10,y+d+10,1]])} fill={selected ? "#d9e7ff" : "#d9e1e7"} stroke={selected ? "#2363dc" : "#ccd7e0"} strokeWidth={selected ? 3 : 1} />
    <polygon points={points([[x+15,y+d,1],[x+w+35,y+d,1],[x+w+35,y+d+35,1],[x+15,y+d+35,1]])} fill="#97adc2" opacity=".2" />
    <Box x={x} y={y} w={w} d={d} h={h} />
    <Box x={x-5} y={y-5} w={w+10} d={d+10} h={7} z={h} top={selected ? "#538cff" : "#427cf1"} />
    {[0,1,2,3].map(i => <polygon key={i} points={points([[x+16+i*(w-24)/4,y+d+.5,h-22],[x+31+i*(w-24)/4,y+d+.5,h-22],[x+31+i*(w-24)/4,y+d+.5,h-41],[x+16+i*(w-24)/4,y+d+.5,h-41]])} fill="#a9d5f6" />)}
    <polygon points={points([[x+w*.38,y+d+1,1],[x+w*.66,y+d+1,1],[x+w*.66,y+d+1,39],[x+w*.38,y+d+1,39]])} fill={place.id === "studio" ? "#ffd157" : "#183f98"} />
    <polygon points={points([[x+w,y+d*.18,h-20],[x+w,y+d*.75,h-20],[x+w,y+d*.75,h-44],[x+w,y+d*.18,h-44]])} fill="#77a7ec" />
    {place.id === "clients" && <Box x={x+30} y={y+25} w={w-60} d={45} h={20} z={h+7} top="#b6d4fa" left="#77a4ec" right="#5383d1" />}
    {place.id === "product" && <g>
      <Box x={x+20} y={y+25} w={85} d={65} h={9} z={h+7} top="#194894" left="#133678" right="#102b62" />
      {[0,1,2].map(i=><polyline key={i} points={points([[x+25+i*26,y+25,h+17],[x+25+i*26,y+90,h+17]])} fill="none" stroke="#719fdb" strokeWidth="2" />)}
    </g>}
    {place.id === "infrastructure" && [0,1].map(i => <Box key={i} x={x+13} y={y+25+i*62} w={42} d={40} h={16} z={h+7} top="#ccdcec" left="#9baec7" right="#738dac" />)}
    {place.id === "sales" && <Box x={x-5} y={y+d-28} w={w+10} d={35} h={6} z={47} top="#ffdc75" left="#ffc741" right="#d79b21" />}
  </g>;
}

export default function CampusWorld({ places, selected, onSelect }: { places: Place[]; selected: PlaceId; onSelect: (id: PlaceId) => void }) {
  return <svg className={styles.campusSvg} viewBox="0 0 1100 820" aria-hidden="true">
    <defs>
      <filter id="campus-shadow" x="-30%" y="-30%" width="170%" height="180%"><feGaussianBlur stdDeviation="15" /></filter>
      <pattern id="campus-paving" width="36" height="20" patternUnits="userSpaceOnUse"><path d="M 0 20 L 36 0" stroke="#d2dfe7" strokeWidth=".65" /></pattern>
    </defs>
    <ellipse cx="548" cy="609" rx="407" ry="81" fill="#6d8bab" opacity=".16" filter="url(#campus-shadow)" />
    <Box x={0} y={0} w={590} d={540} h={18} z={-18} top="#e3eaf0" left="#c3d1df" right="#acbed1" />
    <polygon points={points([[0,0,1],[590,0,1],[590,540,1],[0,540,1]])} fill="url(#campus-paving)" />
    <polygon points={points([[220,0,2],[285,0,2],[285,540,2],[220,540,2]])} fill="#c4d1de" />
    <polygon points={points([[0,205,2],[590,205,2],[590,268,2],[0,268,2]])} fill="#c4d1de" />
    <polyline points={points([[253,0,3],[253,540,3]])} fill="none" stroke="#f7fafc" strokeWidth="3" strokeDasharray="13 13" />
    <polyline points={points([[0,237,3],[590,237,3]])} fill="none" stroke="#f7fafc" strokeWidth="3" strokeDasharray="13 13" />
    <polygon points={points([[8,455,3],[190,455,3],[190,524,3],[8,524,3]])} fill="#c0d7ca" />
    {[[23,25],[115,25],[205,25],[310,25],[400,25],[505,25],[570,35],[20,295],[20,385],[28,480],[110,492],[180,492],[325,495],[440,492],[550,492]].map(([x,y])=><Tree key={x+"-"+y} x={x} y={y} />)}
    {places.map(place=><g data-building={place.id} key={place.id} onClick={()=>onSelect(place.id)} className={styles.building}><Building place={place} selected={selected===place.id} /></g>)}
    {[[175,185],[185,170],[160,172],[450,172],[467,180],[476,163]].map(([x,y],i)=><Box key={i} x={x} y={y} w={18} d={18} h={i%2 ? 32 : 23} top="#f1ce85" left="#d9b365" right="#b99048" />)}
    {[[78,285],[102,285],[126,285]].map(([x,y])=><Box key={x} x={x} y={y} w={19} d={19} h={23} top="#74a4f5" left="#4477d4" right="#2857ac" />)}
    <Forklift x={210} y={181} /><Forklift x={250} y={455} />
    <Box x={65} y={230} w={50} d={19} h={22} top="#ffffff" left="#dce6f0" right="#b0c1d2" />
    <Box x={115} y={230} w={19} d={19} h={18} top="#f5cc59" left="#e5b631" right="#c4931b" />
    <text x="552" y="740" textAnchor="middle" fill="#6b8199" fontSize="13" letterSpacing="6" fontFamily="var(--font-geist-mono), monospace">AMMA VENTURES / FINA CALLE</text>
  </svg>;
}
