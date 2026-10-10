// tslint:disable
/* eslint-disable */
import {GrowthTierSpec, LogicalItemDef, ObjectTier} from './types';

/** 5-tiered logical item catalogue */
export const LOGICAL_ITEMS: Record<string, LogicalItemDef> = {
  // Tier 1: Tiny scatter items
  item_tiny_1: {
    id: 'item_tiny_1',
    tier: 1,
    radius: 0.35,
    height: 0.3,
    points: 10,
    growthValue: 2,
    symbol: '🍃',
  },
  item_tiny_2: {
    id: 'item_tiny_2',
    tier: 1,
    radius: 0.4,
    height: 0.35,
    points: 15,
    growthValue: 3,
    symbol: '🌰',
  },

  // Tier 2: Small items (soda cans, cups, apples)
  item_small_1: {
    id: 'item_small_1',
    tier: 2,
    radius: 0.65,
    height: 0.7,
    points: 35,
    growthValue: 6,
    symbol: '🥤',
  },
  item_small_2: {
    id: 'item_small_2',
    tier: 2,
    radius: 0.75,
    height: 0.8,
    points: 50,
    growthValue: 8,
    symbol: '☕',
  },

  // Tier 3: Medium props (benches, trash bins, plates, teapots)
  item_med_1: {
    id: 'item_med_1',
    tier: 3,
    radius: 1.15,
    height: 1.2,
    points: 110,
    growthValue: 15,
    symbol: '🪑',
  },
  item_med_2: {
    id: 'item_med_2',
    tier: 3,
    radius: 1.35,
    height: 1.4,
    points: 150,
    growthValue: 20,
    symbol: '🗑️',
  },

  // Tier 4: Large structures (picnic tables, lamps, pizza platters)
  item_large_1: {
    id: 'item_large_1',
    tier: 4,
    radius: 1.85,
    height: 1.9,
    points: 320,
    growthValue: 35,
    symbol: '🎪',
  },
  item_large_2: {
    id: 'item_large_2',
    tier: 4,
    radius: 2.1,
    height: 2.3,
    points: 420,
    growthValue: 45,
    symbol: '🏮',
  },

  // Tier 5: Huge centerpieces (gazebos, statues, dinner carousel, wedding cake)
  item_huge_1: {
    id: 'item_huge_1',
    tier: 5,
    radius: 2.8,
    height: 3.0,
    points: 900,
    growthValue: 75,
    symbol: '🏛️',
  },
  item_huge_2: {
    id: 'item_huge_2',
    tier: 5,
    radius: 3.2,
    height: 3.5,
    points: 1250,
    growthValue: 100,
    symbol: '👑',
  },
};

/** Collector growth tiers with progression specs */
export const GROWTH_TIERS: GrowthTierSpec[] = [
  {
    tier: 1,
    requiredMass: 0,
    collectorRadius: 0.95,
    cameraHeight: 12.0,
    cameraDistance: 11.0,
    speed: 9.0,
    title: 'Micro Collector',
  },
  {
    tier: 2,
    requiredMass: 25,
    collectorRadius: 1.5,
    cameraHeight: 14.5,
    cameraDistance: 13.0,
    speed: 9.6,
    title: 'Pocket Sweeper',
  },
  {
    tier: 3,
    requiredMass: 75,
    collectorRadius: 2.3,
    cameraHeight: 17.5,
    cameraDistance: 15.5,
    speed: 10.2,
    title: 'Urban Vacuum',
  },
  {
    tier: 4,
    requiredMass: 150,
    collectorRadius: 3.3,
    cameraHeight: 21.0,
    cameraDistance: 18.5,
    speed: 10.8,
    title: 'Mega Vortex',
  },
  {
    tier: 5,
    requiredMass: 250,
    collectorRadius: 4.6,
    cameraHeight: 25.5,
    cameraDistance: 22.5,
    speed: 11.5,
    title: 'Cosmic Singularity',
  },
];

/** Check which growth tier corresponds to a given mass amount */
export function getTierForMass(mass: number): GrowthTierSpec {
  for (let i = GROWTH_TIERS.length - 1; i >= 0; i--) {
    if (mass >= GROWTH_TIERS[i].requiredMass) {
      return GROWTH_TIERS[i];
    }
  }
  return GROWTH_TIERS[0];
}

/** Check if an item can be swallowed based on collector's current tier */
export function isItemEligible(
  collectorTier: ObjectTier,
  itemTier: ObjectTier,
): boolean {
  return itemTier <= collectorTier;
}

/** Calculate distance in X-Z plane */
export function distanceXZ(
  x1: number,
  z1: number,
  x2: number,
  z2: number,
): number {
  const dx = x1 - x2;
  const dz = z1 - z2;
  return Math.sqrt(dx * dx + dz * dz);
}

/** Clamp coordinate inside arena rectangular boundaries with radius margin */
export function clampToArena(
  pos: {x: number; z: number},
  halfWidth: number,
  halfDepth: number,
  margin = 0.5,
): {x: number; z: number} {
  const minX = -halfWidth + margin;
  const maxX = halfWidth - margin;
  const minZ = -halfDepth + margin;
  const maxZ = halfDepth - margin;

  return {
    x: Math.max(minX, Math.min(maxX, pos.x)),
    z: Math.max(minZ, Math.min(maxZ, pos.z)),
  };
}
