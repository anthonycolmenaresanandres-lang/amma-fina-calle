// tslint:disable
/* eslint-disable */

/** 3D Vector coordinate */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** 3D Position as a tuple */
export type Position3D = [number, number, number];

/** Represents an object in the 3D scene */
export interface Entity3D {
  id: string | number;
  type?: string;
  position: Vec3 | Position3D;
  rotation?: Vec3 | Position3D;
  scale?: Vec3 | Position3D;
  velocity?: Vec3;
  active?: boolean;
  [key: string]: any;
}

/** Particle data structure for growth and vortex sparks */
export interface Particle {
  id: string | number;
  position: Vec3 | Position3D;
  velocity?: Vec3 | Position3D;
  life: number;
  maxLife: number;
  color?: string;
  size?: number;
  [key: string]: any;
}

/** Object tier ranking from 1 (smallest) to 5 (largest) */
export type ObjectTier = 1 | 2 | 3 | 4 | 5;

/** Logical item definition independent of skin */
export interface LogicalItemDef {
  id: string;
  tier: ObjectTier;
  radius: number; // Collision & eligibility radius
  height: number;
  points: number;
  growthValue: number;
  symbol: string; // Unicode icon / glyph for accessibility
}

/** Placed level item instance */
export interface PlacedItem {
  uid: string;
  defId: string;
  tier: ObjectTier;
  x: number;
  z: number;
  radius: number;
  points: number;
  growthValue: number;
  collected: boolean;
  sinkProgress: number; // 0 (normal) -> 1 (fully swallowed)
  sinkTargetX: number;
  sinkTargetZ: number;
  initialScale: number;
  rotationY: number;
}

/** Skin definition for visual appearance */
export interface SkinVisualDef {
  displayName: string;
  color: string;
  accentColor: string;
  meshType: string;
  texturePath?: string;
  scale: [number, number, number];
  rotationOffset?: [number, number, number];
  positionOffset?: [number, number, number];
}

/** Skin theme bundle */
export interface SkinConfig {
  id: 'park' | 'restaurant' | 'colattao';
  name: string;
  description: string;
  themeBadge: string;
  groundColor: string;
  groundSecondaryColor: string;
  groundPattern: 'grass' | 'checkered';
  wallColor: string;
  wallTrimColor: string;
  collectorRimColor: string;
  collectorVortexColor: string;
  skyColor: string;
  ambientColor: string;
  sunColor: string;
  uiAccentColor: string;
  uiCardBg: string;
  items: Record<string, SkinVisualDef>;
}

/** Collector growth tier specifications */
export interface GrowthTierSpec {
  tier: ObjectTier;
  requiredMass: number;
  collectorRadius: number;
  cameraHeight: number;
  cameraDistance: number;
  speed: number;
  title: string;
}

/** Level design specification */
export interface LevelSpec {
  levelNumber: number;
  name: string;
  arenaWidth: number;
  arenaDepth: number;
  timeLimit: number;
  targetScore: number;
  description: string;
  initialItems: {
    defId: string;
    count: number;
    spreadRadius?: number;
    clusterCenter?: [number, number];
  }[];
}
