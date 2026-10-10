import type {SkinConfig} from '../types';
// Presentation only. Rules and levels remain in the original gameplay modules.
export const COLATTAO={
  name:'Colattao Coffee House',gameTitle:'Pocket Café',logo:'./assets/colattao/logo.png',background:'./assets/colattao/cafe-background.webp',
  levelNames:['Café Corner','Coffee House','Grand Table'],tierNames:['Little sip','Coffee break','Café regular','Table collector','Full house'],
  products:[{name:'Pumpkin Pie',image:'./assets/colattao/pumpkin-pie.webp'},{name:'Campfire',image:'./assets/colattao/campfire.webp'},{name:'Croissant',image:'./assets/colattao/croissant.png'}]
};

export function createColattaoSkin(base:SkinConfig):SkinConfig{
  return {...base,id:'colattao',name:'Colattao Coffee House',description:'A warm café tabletop.',themeBadge:'Pocket Café',
    groundColor:'#d4bd91',groundSecondaryColor:'#dac9aa',groundPattern:'checkered',wallColor:'#493121',wallTrimColor:'#b58949',
    collectorRimColor:'#d4a24c',collectorVortexColor:'#a86534',skyColor:'#20150e',ambientColor:'#f5e9d0',sunColor:'#fff0ce',uiAccentColor:'#d4a24c',uiCardBg:'#1b0e08',
    items:{
      item_tiny_1:{displayName:'Sugar cube',color:'#f5e9d0',accentColor:'#d4a24c',meshType:'sugar_cube',scale:[1,1,1]},
      item_tiny_2:{displayName:'Coffee bean',color:'#59351f',accentColor:'#382214',meshType:'acorn',scale:[1,1,1]},
      item_small_1:{displayName:'Cappuccino',color:'#f5e9d0',accentColor:'#1f4365',meshType:'espresso_cup',scale:[1,1,1]},
      item_small_2:{displayName:'Iced matcha',color:'#6c8b4c',accentColor:'#e6cf96',meshType:'cafe_drink',scale:[1,1,1]},
      item_med_1:{displayName:'Croissant plate',color:'#f5e9d0',accentColor:'#d4a24c',meshType:'cafe_plate',scale:[1,1,1],texturePath:'./assets/colattao/croissant.png'},
      item_med_2:{displayName:'Coffee sharing tray',color:'#e4d7ba',accentColor:'#2b527a',meshType:'cafe_plate',scale:[1,1,1],texturePath:'./assets/colattao/coffee.png'},
      item_large_1:{displayName:'Croissant sharing tray',color:'#f5e9d0',accentColor:'#a96c36',meshType:'cafe_tray',scale:[1,1,1],texturePath:'./assets/colattao/pumpkin-pie.webp'},
      item_large_2:{displayName:'Matcha sharing tray',color:'#d4bd91',accentColor:'#3d2518',meshType:'cafe_tray',scale:[1,1,1],texturePath:'./assets/colattao/campfire.webp'},
      item_huge_1:{...base.items.item_huge_1,displayName:'Ceramic sharing table',color:'#c7aa70',accentColor:'#315478'},
      item_huge_2:{...base.items.item_huge_2,displayName:'Celebration cake',color:'#f5e9d0',accentColor:'#b88244'},
    },
  };
}
