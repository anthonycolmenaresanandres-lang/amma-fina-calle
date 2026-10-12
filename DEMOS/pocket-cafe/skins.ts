// tslint:disable
/* eslint-disable */
import {SkinConfig} from './types';
import {createColattaoSkin} from './brand/colattao';

/** Park Theme configuration */
export const PARK_SKIN: SkinConfig = {
  id: 'park',
  name: 'Park Promenade',
  description: 'Sunny park filled with fallen leaves, picnic drinks, benches, and gazebos.',
  themeBadge: '🌳 Park Props',
  groundColor: '#34d399',
  groundSecondaryColor: '#10b981',
  groundPattern: 'grass',
  wallColor: '#78350f',
  wallTrimColor: '#a16207',
  collectorRimColor: '#38bdf8',
  collectorVortexColor: '#0369a1',
  skyColor: '#0284c7',
  ambientColor: '#cbd5e1',
  sunColor: '#fffbeb',
  uiAccentColor: '#10b981',
  uiCardBg: '#064e3b',
  items: {
    item_tiny_1: {
      displayName: 'Autumn Leaf',
      color: '#f59e0b',
      accentColor: '#d97706',
      meshType: 'leaf',
      scale: [1, 1, 1],
    },
    item_tiny_2: {
      displayName: 'Acorn Berry',
      color: '#92400e',
      accentColor: '#451a03',
      meshType: 'acorn',
      scale: [1, 1, 1],
    },
    item_small_1: {
      displayName: 'Picnic Soda Can',
      color: '#ef4444',
      accentColor: '#ffffff',
      meshType: 'soda_can',
      scale: [1, 1, 1],
    },
    item_small_2: {
      displayName: 'Takeout Cup',
      color: '#f8fafc',
      accentColor: '#78350f',
      meshType: 'paper_cup',
      scale: [1, 1, 1],
    },
    item_med_1: {
      displayName: 'Park Bench',
      color: '#b45309',
      accentColor: '#1e293b',
      meshType: 'park_bench',
      scale: [1, 1, 1],
    },
    item_med_2: {
      displayName: 'Recycle Bin',
      color: '#059669',
      accentColor: '#0f172a',
      meshType: 'trash_bin',
      scale: [1, 1, 1],
    },
    item_large_1: {
      displayName: 'Picnic Table',
      color: '#a16207',
      accentColor: '#854d0e',
      meshType: 'picnic_table',
      scale: [1, 1, 1],
    },
    item_large_2: {
      displayName: 'Street Lantern',
      color: '#1e293b',
      accentColor: '#fef08a',
      meshType: 'street_lamp',
      scale: [1, 1, 1],
    },
    item_huge_1: {
      displayName: 'Park Gazebo',
      color: '#d97706',
      accentColor: '#fef3c7',
      meshType: 'gazebo',
      scale: [1, 1, 1],
    },
    item_huge_2: {
      displayName: 'Bronze Statue Fountain',
      color: '#0284c7',
      accentColor: '#fbbf24',
      meshType: 'fountain_statue',
      scale: [1, 1, 1],
    },
  },
};

/** Restaurant Tabletop Diner Theme configuration */
export const RESTAURANT_SKIN: SkinConfig = {
  id: 'restaurant',
  name: 'Bistro Tabletop',
  description: 'Cozy diner table packed with sugar cubes, condiments, burger plates, and cakes.',
  themeBadge: '🍽️ Tabletop Diner',
  groundColor: '#b91c1c',
  groundSecondaryColor: '#f8fafc',
  groundPattern: 'checkered',
  wallColor: '#451a03',
  wallTrimColor: '#ca8a04',
  collectorRimColor: '#f43f5e',
  collectorVortexColor: '#881337',
  skyColor: '#1c1917',
  ambientColor: '#fed7aa',
  sunColor: '#fff7ed',
  uiAccentColor: '#f97316',
  uiCardBg: '#431407',
  items: {
    item_tiny_1: {
      displayName: 'Sugar Cube',
      color: '#f8fafc',
      accentColor: '#e2e8f0',
      meshType: 'sugar_cube',
      scale: [1, 1, 1],
    },
    item_tiny_2: {
      displayName: 'Mint Garnish',
      color: '#22c55e',
      accentColor: '#15803d',
      meshType: 'mint_leaf',
      scale: [1, 1, 1],
    },
    item_small_1: {
      displayName: 'Mustard Bottle',
      color: '#eab308',
      accentColor: '#ca8a04',
      meshType: 'squeeze_bottle',
      scale: [1, 1, 1],
    },
    item_small_2: {
      displayName: 'Espresso Demitasse',
      color: '#f8fafc',
      accentColor: '#3e2723',
      meshType: 'espresso_cup',
      scale: [1, 1, 1],
    },
    item_med_1: {
      displayName: 'Gourmet Burger Plate',
      color: '#d97706',
      accentColor: '#f8fafc',
      meshType: 'burger_plate',
      scale: [1, 1, 1],
    },
    item_med_2: {
      displayName: 'Ceramic Teapot',
      color: '#0284c7',
      accentColor: '#f8fafc',
      meshType: 'teapot',
      scale: [1, 1, 1],
    },
    item_large_1: {
      displayName: 'Pizza Platter',
      color: '#b45309',
      accentColor: '#ef4444',
      meshType: 'pizza_platter',
      scale: [1, 1, 1],
    },
    item_large_2: {
      displayName: 'Sundae Parfait Glass',
      color: '#f43f5e',
      accentColor: '#38bdf8',
      meshType: 'sundae_glass',
      scale: [1, 1, 1],
    },
    item_huge_1: {
      displayName: 'Lazy Susan Turntable',
      color: '#78350f',
      accentColor: '#fef08a',
      meshType: 'lazy_susan',
      scale: [1, 1, 1],
    },
    item_huge_2: {
      displayName: 'Grand Wedding Cake',
      color: '#fdf4ff',
      accentColor: '#ec4899',
      meshType: 'grand_cake',
      scale: [1, 1, 1],
    },
  },
};

/** All registered skins catalogue */
export const AVAILABLE_SKINS: Record<string, SkinConfig> = {
  colattao: createColattaoSkin(RESTAURANT_SKIN),
  park: PARK_SKIN,
  restaurant: RESTAURANT_SKIN,
};

/** Safe helper to get skin config with fallback */
export function getSkinConfig(skinId: string): SkinConfig {
  return AVAILABLE_SKINS[skinId] || PARK_SKIN;
}
