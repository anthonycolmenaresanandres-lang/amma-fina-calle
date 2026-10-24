import type { HoleInput } from "./hole-engine";

/** Fixed elevated camera: original orthographic courtyard, no camera drift/zoom.
 * Both renderers share this basis; gameplay coordinates and hit areas stay intact.
 * Height is projected upward, leaving ground objects and their footprints aligned.
 */
const CAMERA = { xx: 0.76, xy: -0.16, yx: 0.16, yy: 0.52, height: 0.86 } as const;
const ORIGIN = { x: 210, y: 320 };
const CENTER = { x: 210, y: 280 };

export function projectGround(x: number, y: number, z = 0): { x: number; y: number } {
  return {
    x: ORIGIN.x + CAMERA.xx * (x - CENTER.x) + CAMERA.xy * (y - CENTER.y),
    y: ORIGIN.y + CAMERA.yx * (x - CENTER.x) + CAMERA.yy * (y - CENTER.y) - CAMERA.height * z,
  };
}

export function applyGroundTransform(context: CanvasRenderingContext2D): void {
  const origin = projectGround(0, 0);
  context.transform(CAMERA.xx, CAMERA.yx, CAMERA.xy, CAMERA.yy, origin.x, origin.y);
}

/** Invert camera direction, then retain bounded stick strength and world speed.
 * Screen-up stays screen-up for keyboard and touch, despite the angled ground.
 */
export function screenToWorldInput(input: HoleInput): HoleInput {
  const strength = Math.min(1, Math.hypot(input.x, input.y));
  if (!strength) return { x: 0, y: 0 };
  const determinant = CAMERA.xx * CAMERA.yy - CAMERA.xy * CAMERA.yx;
  const x = (CAMERA.yy * input.x - CAMERA.xy * input.y) / determinant;
  const y = (-CAMERA.yx * input.x + CAMERA.xx * input.y) / determinant;
  const length = Math.hypot(x, y);
  return { x: x / length * strength, y: y / length * strength };
}
