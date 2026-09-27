import { STRINGMAN, type Vec3 } from "./profile";

// Pure cable-robot math. No rendering, no randomness, no clocks.

export function distance(a: Vec3, b: Vec3) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** Inverse kinematics of a cable robot: each line's free span is simply the straight-line
 * distance from its corner eyelet to the gantry. */
export function cableLengths(gantry: Vec3, corners: readonly Vec3[] = STRINGMAN.corners): number[] {
  return corners.map((corner) => distance(corner, gantry));
}

function solve3(m: number[][], b: number[]): number[] | null {
  const [a, c, e] = [m[0], m[1], m[2]];
  const det = a[0] * (c[1] * e[2] - c[2] * e[1]) - a[1] * (c[0] * e[2] - c[2] * e[0]) + a[2] * (c[0] * e[1] - c[1] * e[0]);
  if (Math.abs(det) < 1e-12) return null;
  const replace = (col: number) => m.map((row, i) => row.map((v, j) => (j === col ? b[i] : v)));
  const d = (n: number[][]) => n[0][0] * (n[1][1] * n[2][2] - n[1][2] * n[2][1]) - n[0][1] * (n[1][0] * n[2][2] - n[1][2] * n[2][0]) + n[0][2] * (n[1][0] * n[2][1] - n[1][1] * n[2][0]);
  return [d(replace(0)) / det, d(replace(1)) / det, d(replace(2)) / det];
}

/** Static line tensions (newtons) holding a hanging mass at the gantry.
 *
 * Four lines and three force equations leave one degree of freedom. We take the
 * minimum-norm split, which spreads the load evenly; if that asks a line to push (a
 * negative tension), that line would go slack in reality, so we solve with the other
 * three and keep the feasible split with the smallest peak. Returns null when no split
 * holds the load, which means the gantry cannot be held there at all. */
export function lineTensions(gantry: Vec3, mass: number, corners: readonly Vec3[] = STRINGMAN.corners): number[] | null {
  const units = corners.map((c) => {
    const d = distance(c, gantry);
    return [(c[0] - gantry[0]) / d, (c[1] - gantry[1]) / d, (c[2] - gantry[2]) / d];
  });
  const w = [0, 0, mass * STRINGMAN.gravity];
  const aat = [0, 1, 2].map((i) => [0, 1, 2].map((j) => units.reduce((sum, u) => sum + u[i] * u[j], 0)));
  const lambda = solve3(aat, w);
  if (lambda) {
    const t = units.map((u) => u[0] * lambda[0] + u[1] * lambda[1] + u[2] * lambda[2]);
    if (t.every((v) => v >= -1e-9)) return t.map((v) => Math.max(0, v));
  }
  let best: number[] | null = null;
  for (let skip = 0; skip < units.length; skip++) {
    const idx = [0, 1, 2, 3].filter((i) => i !== skip);
    const m = [0, 1, 2].map((row) => idx.map((i) => units[i][row]));
    const s = solve3(m, w);
    if (!s || s.some((v) => v < -1e-9)) continue;
    const full = [0, 0, 0, 0];
    idx.forEach((i, k) => { full[i] = Math.max(0, s[k]); });
    if (!best || Math.max(...full) < Math.max(...best)) best = full;
  }
  return best;
}

export function peakTension(gantry: Vec3, mass: number) {
  const t = lineTensions(gantry, mass);
  return t ? Math.max(...t) : Infinity;
}

export type Swing = { angle: [number, number]; rate: [number, number] };

/** One step of the pole swinging under the gantry, per horizontal axis.
 * angle'' = -(g/L) angle - accel/L - 2 zeta omega angle' ; semi-implicit Euler. */
export function stepSwing(swing: Swing, gantryAccel: [number, number], dt: number, dampingRatio: number): Swing {
  const L = STRINGMAN.swingLength;
  const omega = Math.sqrt(STRINGMAN.gravity / L);
  const angle: [number, number] = [0, 0];
  const rate: [number, number] = [0, 0];
  for (const k of [0, 1] as const) {
    const acc = -(omega * omega) * swing.angle[k] - gantryAccel[k] / L - 2 * dampingRatio * omega * swing.rate[k];
    rate[k] = swing.rate[k] + acc * dt;
    angle[k] = swing.angle[k] + rate[k] * dt;
  }
  return { angle, rate };
}

export function swingPeriod() {
  return 2 * Math.PI * Math.sqrt(STRINGMAN.swingLength / STRINGMAN.gravity);
}

/** Horizontal swing amplitude of the gripper in metres, independent of phase. */
export function swingAmplitude(swing: Swing) {
  const omega = Math.sqrt(STRINGMAN.gravity / STRINGMAN.swingLength);
  const ax = Math.hypot(swing.angle[0], swing.rate[0] / omega);
  const ay = Math.hypot(swing.angle[1], swing.rate[1] / omega);
  return Math.hypot(ax, ay) * STRINGMAN.poleOffset;
}

export function gripperPosition(gantry: Vec3, swing: Swing): Vec3 {
  const L = STRINGMAN.poleOffset;
  const [tx, ty] = swing.angle;
  return [gantry[0] + L * Math.sin(tx), gantry[1] + L * Math.sin(ty), gantry[2] - L * Math.cos(tx) * Math.cos(ty)];
}
