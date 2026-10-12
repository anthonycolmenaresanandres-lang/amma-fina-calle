import {RECIPE} from './recipe';
import {SkinConfig} from './types';
const olympia:SkinConfig={
 id:'olympia',name:'Olympia sandwich study',description:'Provisional deli-counter draft',themeBadge:'DRAFT',
 groundColor:'#dbd5c9',groundSecondaryColor:'#cbc4b8',groundPattern:'checkered',
 wallColor:'#122838',wallTrimColor:'#aab3af',collectorRimColor:'#c79754',collectorVortexColor:'#ecd9ad',
 skyColor:'#c9cec8',ambientColor:'#f4efe3',sunColor:'#fff3d9',uiAccentColor:'#f0cf88',uiCardBg:'#122838',
 items:Object.fromEntries(Object.entries(RECIPE.pickups).map(([id,item])=>[id,{
  displayName:item.name,color:item.color,accentColor:'#f2e1bd',meshType:item.kind,scale:[1,1,1],
 }])),
};
export function getSkinConfig(_id:string):SkinConfig{return olympia;}
