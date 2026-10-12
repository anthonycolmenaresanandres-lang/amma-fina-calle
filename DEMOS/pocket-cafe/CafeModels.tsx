import React, {useEffect, useMemo} from 'react';
import {useLoader} from '@react-three/fiber';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

type Kind='cup'|'pastry'|'matcha';
type Pose={kind:Kind;x:number;z:number;turn?:number};
const MODELS={
  cup:{path:'./assets/models/colattao-cup-saucer.glb',radius:.0753825311500986,height:.13487054445028304},
  pastry:{path:'./assets/models/colattao-croissant.glb',radius:.07076722681611439,height:.08551284472923726},
  matcha:{path:'./assets/models/colattao-iced-matcha.glb',radius:.0371500015719568,height:.15512643952388316},
};
// Poses are fractions of the unchanged logical radius. Presentation only.
const RECIPES:Record<string,{name:string;poses:Pose[];footprint:number}>={
  item_small_1:{name:'Cappuccino',poses:[{kind:'cup',x:0,z:0}],footprint:.90},
  item_small_2:{name:'Matcha break',poses:[{kind:'matcha',x:-.30,z:-.10},{kind:'pastry',x:.34,z:.14,turn:.20}],footprint:.38},
  item_med_1:{name:'Croissant plate',poses:[{kind:'pastry',x:0,z:0}],footprint:.88},
  item_med_2:{name:'Coffee sharing tray',poses:[{kind:'cup',x:-.42,z:0},{kind:'cup',x:.42,z:0,turn:Math.PI}],footprint:.35},
  item_large_1:{name:'Croissant sharing tray',poses:[{kind:'pastry',x:-.40,z:-.24,turn:.1},{kind:'pastry',x:.40,z:-.24,turn:-.1},{kind:'pastry',x:0,z:.40,turn:Math.PI}],footprint:.29},
  item_large_2:{name:'Matcha sharing tray',poses:[{kind:'matcha',x:-.40,z:-.15},{kind:'matcha',x:.40,z:-.15,turn:Math.PI},{kind:'pastry',x:0,z:.40,turn:Math.PI}],footprint:.29},
};
export const supportsCafeModel=(id:string)=>Boolean(RECIPES[id]);
const primitiveOnly=typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('primitive')==='1';
if(typeof window!=='undefined'&&!primitiveOnly)for(const {path} of Object.values(MODELS))useLoader.preload(GLTFLoader,path);

function ServingTray({radius,height,isLocked=false,outerRadius=radius*.96,rimColor='#17364b'}:{radius:number;height:number;isLocked?:boolean;outerRadius?:number;rimColor?:string}){
  const r=outerRadius,h=Math.min(.085,height*.10),color=isLocked?'#c2bda9':'#f3e5c8';
  return <group>
    <mesh position={[0,h*.45,0]} castShadow receiveShadow><cylinderGeometry args={[r,r*.96,h*.9,32]}/><meshStandardMaterial color={color} roughness={.4}/></mesh>
    <mesh position={[0,h*.9,0]} rotation={[-Math.PI/2,0,0]} castShadow><torusGeometry args={[r*.91,Math.min(.022,r*.018),4,32]}/><meshStandardMaterial color={rimColor} roughness={.35}/></mesh>
  </group>;
}
function SolidFallback({radius,height}:{radius:number;height:number}){
  const trayH=Math.min(.085,height*.10),bodyH=height-trayH,foamRadius=Math.min(radius*.24,bodyH*.12);
  return <group><ServingTray radius={radius} height={height}/><mesh position={[0,trayH+bodyH*.45,0]} castShadow><cylinderGeometry args={[radius*.25,radius*.20,bodyH*.85,12]}/><meshStandardMaterial color="#f3e5c8" roughness={.4}/></mesh><mesh position={[0,trayH+bodyH*.85,0]}><sphereGeometry args={[foamRadius,12,6,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#fff2d5" roughness={.7}/></mesh></group>;
}
export class CafeModelBoundary extends React.Component<{radius:number;height:number;children:React.ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed||primitiveOnly?<SolidFallback radius={this.props.radius} height={this.props.height}/>:this.props.children;}
}
function LoadedModel({kind,scale,x,z,y,turn,isLocked}:{kind:Kind;scale:number;x:number;z:number;y:number;turn:number;isLocked:boolean}){
  const gltf=useLoader(GLTFLoader,MODELS[kind].path);
  const model=useMemo(()=>{const copy=gltf.scene.clone(true);copy.traverse(object=>{if(object instanceof THREE.Mesh){const materials:THREE.Material[]=Array.isArray(object.material)?object.material:[object.material];object.castShadow=!materials[0].transparent;object.receiveShadow=true;const clones=materials.map(material=>{const m=material.clone();if(isLocked&&m instanceof THREE.MeshStandardMaterial)m.color.multiplyScalar(.80);return m;});object.material=Array.isArray(object.material)?clones:clones[0];}});return copy;},[gltf.scene,isLocked]);
  useEffect(()=>()=>{model.traverse(object=>{if(object instanceof THREE.Mesh){const materials:THREE.Material[]=Array.isArray(object.material)?object.material:[object.material];materials.forEach(m=>m.dispose());}});},[model]);
  return <primitive object={model} scale={scale} position={[x,y,z]} rotation={[0,turn,0]} dispose={null}/>;
}
export function CafeModels({defId,radius,height,isLocked}:{defId:string;radius:number;height:number;isLocked:boolean}){
  const recipe=RECIPES[defId],presentation=modelPresentation(defId,radius,height);
  return <group>{presentation.trayRadius>0&&<ServingTray radius={radius} height={height} outerRadius={presentation.trayRadius} rimColor="#76614b" isLocked={isLocked}/>}{recipe.poses.map((pose,i)=><LoadedModel key={i} kind={pose.kind} scale={presentation.scale} x={pose.x*radius} z={pose.z*radius} y={presentation.trayHeight} turn={pose.turn||0} isLocked={isLocked}/>)}</group>;
}

// Presentation only: never feed these dimensions back into collision or growth.
// The single cup already contains its authentic saucer. Other orders get a tray
// fitted to their conservative posed footprint instead of a fixed oversized disc.
export function modelPresentation(defId:string,radius:number,height:number){
  const recipe=RECIPES[defId],ownSaucer=defId==='item_small_1';
  const trayHeight=ownSaucer?0:Math.min(.085,height*.10);
  const availableHeight=height*(ownSaucer ? .98 : .96)-trayHeight;
  const scale=Math.min(...recipe.poses.map(p=>Math.min(availableHeight/MODELS[p.kind].height,(radius*recipe.footprint)/MODELS[p.kind].radius)));
  const occupiedRadius=Math.max(...recipe.poses.map(p=>Math.hypot(p.x*radius,p.z*radius)+scale*MODELS[p.kind].radius));
  const trayRadius=ownSaucer?0:Math.min(.94*radius,occupiedRadius+.045*radius);
  return {scale,trayHeight,trayRadius,occupiedRadius};
}

// Shared by the static verification: all vertices must stay in the logical
// cylinder/height after each pose, before the original item.initialScale.
export function modelFitSummary(){return Object.fromEntries(Object.entries(RECIPES).map(([id,recipe])=>[id,{...recipe,models:MODELS}]));}
