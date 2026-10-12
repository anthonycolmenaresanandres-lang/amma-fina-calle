// tslint:disable
/* eslint-disable */
import {LOGICAL_ITEMS} from './gameplay';
import {LevelSpec, PlacedItem} from './types';

/** Level 1, 2, 3 designs */
export const LEVELS: LevelSpec[] = [
  {
    levelNumber: 1,
    name: 'Sunny Plaza',
    arenaWidth: 36,
    arenaDepth: 36,
    timeLimit: 60,
    targetScore: 1800,
    description: 'Swallow leaves, cans, and benches to reach Tier 3 and conquer the plaza!',
    initialItems: [
      {defId: 'item_tiny_1', count: 32, spreadRadius: 15},
      {defId: 'item_tiny_2', count: 28, spreadRadius: 15},
      {defId: 'item_small_1', count: 22, spreadRadius: 14},
      {defId: 'item_small_2', count: 18, spreadRadius: 14},
      {defId: 'item_med_1', count: 10, spreadRadius: 13},
      {defId: 'item_med_2', count: 8, spreadRadius: 13},
      {defId: 'item_large_1', count: 4, spreadRadius: 11},
      {defId: 'item_large_2', count: 3, spreadRadius: 11},
      {defId: 'item_huge_1', count: 1, spreadRadius: 6, clusterCenter: [0, 0]},
    ],
  },
  {
    levelNumber: 2,
    name: 'Grand Promenade',
    arenaWidth: 44,
    arenaDepth: 44,
    timeLimit: 60,
    targetScore: 3800,
    description: 'Advance quickly from tiny snacks to large lamp posts and the golden statue!',
    initialItems: [
      {defId: 'item_tiny_1', count: 45, spreadRadius: 19},
      {defId: 'item_tiny_2', count: 40, spreadRadius: 19},
      {defId: 'item_small_1', count: 30, spreadRadius: 18},
      {defId: 'item_small_2', count: 26, spreadRadius: 18},
      {defId: 'item_med_1', count: 16, spreadRadius: 16},
      {defId: 'item_med_2', count: 14, spreadRadius: 16},
      {defId: 'item_large_1', count: 8, spreadRadius: 15},
      {defId: 'item_large_2', count: 6, spreadRadius: 14},
      {defId: 'item_huge_1', count: 2, spreadRadius: 10, clusterCenter: [-6, 6]},
      {defId: 'item_huge_2', count: 1, spreadRadius: 8, clusterCenter: [6, -6]},
    ],
  },
  {
    levelNumber: 3,
    name: 'Metropolitan Commons',
    arenaWidth: 52,
    arenaDepth: 52,
    timeLimit: 60,
    targetScore: 6800,
    description: 'A massive playground packed with props. Become the ultimate cosmic collector!',
    initialItems: [
      {defId: 'item_tiny_1', count: 60, spreadRadius: 23},
      {defId: 'item_tiny_2', count: 55, spreadRadius: 23},
      {defId: 'item_small_1', count: 42, spreadRadius: 22},
      {defId: 'item_small_2', count: 36, spreadRadius: 22},
      {defId: 'item_med_1', count: 24, spreadRadius: 20},
      {defId: 'item_med_2', count: 20, spreadRadius: 20},
      {defId: 'item_large_1', count: 14, spreadRadius: 18},
      {defId: 'item_large_2', count: 10, spreadRadius: 17},
      {defId: 'item_huge_1', count: 3, spreadRadius: 15, clusterCenter: [-8, -8]},
      {defId: 'item_huge_2', count: 2, spreadRadius: 12, clusterCenter: [8, 8]},
    ],
  },
];

/** Seeded PRNG for reproducible level placements */
function createRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate concrete placed item list for a level */
export function generateLevelItems(levelIndex: number): PlacedItem[] {
  const level = LEVELS[levelIndex % LEVELS.length];
  const rng = createRng(42 + levelIndex * 1337);
  const items: PlacedItem[] = [];
  let itemUidCounter = 1;

  const halfW = level.arenaWidth / 2 - 2;
  const halfD = level.arenaDepth / 2 - 2;

  level.initialItems.forEach((group) => {
    const def = LOGICAL_ITEMS[group.defId];
    if (!def) return;

    for (let i = 0; i < group.count; i++) {
      let x = 0;
      let z = 0;

      // Ensure items are not spawned directly on the player start position (0, 0)
      let attempts = 0;
      let valid = false;

      while (attempts < 20 && !valid) {
        attempts++;
        if (group.clusterCenter) {
          const spread = group.spreadRadius || 8;
          const angle = rng() * Math.PI * 2;
          const r = Math.sqrt(rng()) * spread;
          x = group.clusterCenter[0] + Math.cos(angle) * r;
          z = group.clusterCenter[1] + Math.sin(angle) * r;
        } else {
          const spread = group.spreadRadius || halfW;
          const angle = rng() * Math.PI * 2;
          const r = (0.2 + rng() * 0.8) * spread;
          x = Math.cos(angle) * r;
          z = Math.sin(angle) * r;
        }

        // Clamp inside arena walls
        x = Math.max(-halfW, Math.min(halfW, x));
        z = Math.max(-halfD, Math.min(halfD, z));

        // Start clearance around center (radius 2.5)
        const distFromCenter = Math.hypot(x, z);
        if (distFromCenter > 2.5) {
          valid = true;
        }
      }

      items.push({
        uid: `item_${levelIndex}_${itemUidCounter++}`,
        defId: group.defId,
        tier: def.tier,
        x,
        z,
        radius: def.radius,
        points: def.points,
        growthValue: def.growthValue,
        collected: false,
        sinkProgress: 0,
        sinkTargetX: 0,
        sinkTargetZ: 0,
        initialScale: 0.9 + rng() * 0.2,
        rotationY: rng() * Math.PI * 2,
      });
    }
  });

  return items;
}
