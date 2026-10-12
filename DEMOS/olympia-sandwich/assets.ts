/** Original imagegen art, inspected locally. Runtime encodings preserve source proportions. */
export interface ArtSlot{path:string;anchor:[number,number];}
const slot=(file:string,anchor:[number,number]=[.5,.5]):ArtSlot=>({path:'./assets/art/'+file,anchor});
export const ART={
 counter:slot('countertop.webp'),room:slot('restaurant.webp'),
 openSandwich:slot('open-sandwich.webp',[.5,.558]),
 finishedSandwich:slot('finished-sandwich.webp'),
 ingredients:{bread:slot('bread.webp',[.501,.507]),filling:slot('cooked-filling.webp',[.508,.508]),cheese:slot('cheese.webp',[.5,.531])},
};
export const ART_SLOTS=[ART.counter,ART.room,ART.openSandwich,ART.finishedSandwich,...Object.values(ART.ingredients)];
export const forceFallback=()=>new URLSearchParams(location.search).get('art')==='fallback';
export function inspectedPath(slot:ArtSlot):string|null{
 return !forceFallback()&&slot.path.startsWith('./assets/art/')&&!slot.path.includes('..')?slot.path:null;
}
