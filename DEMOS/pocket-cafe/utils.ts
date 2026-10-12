import * as THREE from 'three';

export {
  MenuOverlay,
  Overlay,
  clamp,
  formatTime,
  gameAudio,
  useAutoFocus,
  useIsMobile,
  type GamePhase,
  type GameState,
  type MusicTrack,
} from './utils/helper';

/** Converts degrees to radians. */
export function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/** Converts radians to degrees. */
export function radToDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

/** Random float in [min, max). */
export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Random integer in [min, max] (inclusive). */
export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

// Rapier-safe conversions
export function toVec3(v: {x: number; y: number; z: number}): {
  x: number;
  y: number;
  z: number;
} {
  return {
    x: v.x,
    y: v.y,
    z: v.z,
  };
}

export function toQuat(q: {x: number; y: number; z: number; w: number}): {
  x: number;
  y: number;
  z: number;
  w: number;
} {
  return {
    x: q.x,
    y: q.y,
    z: q.z,
    w: q.w,
  };
}

// Scratch temporaries for zero-allocation loops
export const tempVec3 = new THREE.Vector3();
export const tempVec3B = new THREE.Vector3();
export const tempQuat = new THREE.Quaternion();
export const tempMatrix = new THREE.Matrix4();
export const tempEuler = new THREE.Euler();
