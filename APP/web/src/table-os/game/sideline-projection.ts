/** Maracaibo presentation geometry only. Canonical engine units remain 0..100. */
export type PitchPoint = Readonly<{ x: number; y: number }>;
export type SidelineProjection = Readonly<{
  width: number; height: number; centerX: number;
  pitchTop: number; pitchHeight: number; nearWidth: number; farRatio: number;
  playerHeight: number;
}>;

export function sidelineProjection(width: number, height: number, hideHud = true): SidelineProjection {
  const inset = Math.max(14, Math.min(width, height) * 0.055);
  const contentTop = hideHud ? 0 : inset + 42;
  const contentHeight = Math.max(1, (hideHud ? height : height - inset - 24) - contentTop);
  // Fit the whole scene (both nets, character headroom and near touchline) as one unit.
  const nearWidth = Math.max(1, Math.min(width * 0.90, contentHeight * 1.14));
  // Portrait deepens the floor; shallow screens still fit both nets and full figures.
  const pitchHeight = Math.max(nearWidth * 0.46, Math.min(contentHeight * 0.50, nearWidth * 0.87));
  const playerHeight = nearWidth * 0.275;
  const sceneHeight = pitchHeight + playerHeight * 1.12 + nearWidth * 0.105;
  const sceneTop = contentTop + (contentHeight - sceneHeight) / 2;
  return { width, height, centerX: width / 2, pitchTop: sceneTop + playerHeight * 1.12, pitchHeight, nearWidth, farRatio: 0.78, playerHeight };
}

export function pitchToScreen(projection: SidelineProjection, x: number, y: number): PitchPoint {
  const depth = y / 100;
  const span = projection.nearWidth * (projection.farRatio + (1 - projection.farRatio) * depth);
  return { x: projection.centerX + (x / 100 - 0.5) * span, y: projection.pitchTop + depth * projection.pitchHeight };
}

/** Inverse of the floor projection; sprite height never enters input or physics. */
export function screenToPitch(projection: SidelineProjection, x: number, y: number): PitchPoint {
  const depth = (y - projection.pitchTop) / projection.pitchHeight;
  const span = projection.nearWidth * (projection.farRatio + (1 - projection.farRatio) * depth);
  return { x: 50 + (x - projection.centerX) * 100 / span, y: depth * 100 };
}

export function characterHeight(projection: SidelineProjection, depth: number): number {
  return projection.playerHeight * (0.86 + 0.14 * depth / 100);
}