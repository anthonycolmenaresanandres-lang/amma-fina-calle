/** Art uses only the visibly supported subset. No named menu product is claimed. */
export const RECIPE={
 status:'provisional' as const,title:'Sandwich study',
 source:{photo:'photo-06.png',commit:'c63151eb5d9ebc8961f9ffef05b16bbdbc2eb6cf',
  observation:'Soft golden bread, brown cooked chopped filling and pale melted cheese.'},
 unconfirmed:['Owner recipe selection','Meat species','Cheese variety','Bread variety','Match to a named menu item'],
 // Visual mappings only: original radii, counts, eligibility, points and growth remain frozen.
 pickups:{
  item_tiny_1:{name:'Bread crumb',kind:'bread',color:'#e8ac53'},
  item_tiny_2:{name:'Cooked filling piece',kind:'filling',color:'#9d522e'},
  item_small_1:{name:'Pale cheese',kind:'cheese',color:'#f0d8a4'},
  item_small_2:{name:'Bread piece',kind:'bread',color:'#e8ac53'},
  item_med_1:{name:'Cooked filling',kind:'filling',color:'#9d522e'},
  item_med_2:{name:'Pale cheese fold',kind:'cheese',color:'#f0d8a4'},
  item_large_1:{name:'Bread portion',kind:'bread',color:'#e8ac53'},
  item_large_2:{name:'Cooked filling portion',kind:'filling',color:'#9d522e'},
  item_huge_1:{name:'Pale cheese portion',kind:'cheese',color:'#f0d8a4'},
  item_huge_2:{name:'Bread portion',kind:'bread',color:'#e8ac53'},
 },
} as const;
export type PickupId=keyof typeof RECIPE.pickups;
export type IngredientKind=(typeof RECIPE.pickups)[PickupId]['kind'];
