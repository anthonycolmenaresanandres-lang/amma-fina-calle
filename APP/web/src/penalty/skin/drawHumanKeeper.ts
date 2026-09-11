import type Phaser from "phaser";
import type { KeeperAppearance, KitSpec } from "../types";
import type { RenderState } from "./PenaltyRenderer";

/** Fictional keeper: natural features, athletic stance, and an unbranded kit. */
export function drawHumanKeeper(
  g: Phaser.GameObjects.Graphics,
  state: RenderState,
  appearance: KeeperAppearance,
  kit: Required<KitSpec>,
): void {
  const { layout, keeperPos, keeperRest } = state;
  const diving = state.match.phase === "shooting" || state.match.phase === "result";
  const catching = state.match.phase === "result" && state.match.results.at(-1) === "save";
  const lean = diving && !catching ? (keeperPos.x - keeperRest.x) / layout.goalWidth : 0;
  const scale = Math.min(layout.keeperHeight * 1.55 / 150, layout.goalWidth / 240);
  const ink = 0x201b20;
  const glove = 0xf6eee2;

  g.fillStyle(0x000000, 0.26);
  g.fillEllipse(keeperPos.x, layout.keeperLineY + 2, 68 * scale, 12 * scale);
  g.save();
  // Lift/tilt around the hips instead of stretching the character's limbs.
  g.translateCanvas(keeperPos.x, keeperPos.y - 65 * scale);
  g.rotateCanvas(lean * 0.8);
  g.scaleCanvas(scale, scale);
  g.translateCanvas(0, 65);

  const polygon = (color: number, points: number[][]) => {
    g.fillStyle(color, 1);
    g.lineStyle(2, ink, 1);
    g.beginPath();
    g.moveTo(points[0][0], points[0][1]);
    for (const [x, y] of points.slice(1)) g.lineTo(x, y);
    g.closePath();
    g.fillPath();
    g.strokePath();
  };
  const limb = (points: number[][], color: number, width: number) => {
    for (let i = 1; i < points.length; i += 1) {
      const [x, y] = points[i];
      const [px, py] = points[i - 1];
      g.lineStyle(width + 3, ink, 1).lineBetween(px, py, x, y);
      g.fillStyle(ink, 1).fillCircle(x, y, (width + 3) / 2);
    }
    for (let i = 1; i < points.length; i += 1) {
      const [x, y] = points[i];
      const [px, py] = points[i - 1];
      g.lineStyle(width, color, 1).lineBetween(px, py, x, y);
      g.fillStyle(color, 1).fillCircle(x, y, width / 2);
    }
  };

  // Bent knees, fitted socks and boots planted at y=0.
  for (const side of [-1, 1]) {
    limb([[side * 11, -59], [side * 22, -36], [side * 23, -9]], appearance.skinTone, 12);
    limb([[side * 22, -28], [side * 23, -9]], kit.secondary, 11);
    g.lineStyle(3, kit.primary, 1).lineBetween(side * 17, -27, side * 27, -27);
    g.fillStyle(ink, 1).fillRoundedRect(side * 23 - 10, -9, 21, 9, 3);
    g.fillStyle(glove, 1).fillRect(side * 23 - 8, -3, 17, 2);
  }
  polygon(kit.secondary, [[-19, -74], [19, -74], [20, -48], [5, -46], [0, -57], [-5, -46], [-20, -48]]);

  // Raised open gloves and long sleeves, with darker underarm panels.
  for (const side of [-1, 1]) {
    const handX = side * (catching ? 8 : 44);
    const handY = catching ? -103 : -121;
    limb([[side * 18, -108], [side * 34, -94], [handX, handY + 11]], kit.primary, 13);
    g.lineStyle(3, 0xbd3674, 1).lineBetween(side * 23, -102, side * 33, -96);
    g.fillStyle(kit.secondary, 1).fillRoundedRect(handX - 7, handY + 7, 14, 7, 2);
    g.fillStyle(glove, 1).fillRoundedRect(handX - 7, handY - 8, 14, 17, 5);
    g.lineStyle(2, ink, 1).strokeRoundedRect(handX - 7, handY - 8, 14, 17, 5);
    g.fillStyle(glove, 1).fillCircle(handX - side * 8, handY + 3, 4);
    g.lineStyle(1, 0xb8c1c8, 1).lineBetween(handX, handY - 5, handX, handY + 2);
  }
  polygon(kit.primary, [[-21, -112], [-10, -117], [10, -117], [21, -112], [17, -75], [-17, -75]]);
  g.fillStyle(0xbd3674, 0.75).fillTriangle(-19, -103, -16, -77, -9, -77);
  g.fillStyle(0xffa3cb, 0.85).fillTriangle(-10, -108, 13, -108, 13, -101);
  g.lineStyle(2, glove, 0.9).lineBetween(-14, -80, 14, -80);
  // Plain number 1, drawn as strokes to avoid another font/texture.
  g.lineStyle(3, glove, 1).lineBetween(-2, -99, 2, -102);
  g.lineBetween(2, -102, 2, -88);
  g.lineBetween(-2, -88, 6, -88);

  // Neck, ears and face; short textured natural hair, no real-person likeness.
  g.fillStyle(appearance.skinTone, 1).fillRoundedRect(-6, -124, 12, 13, 3);
  g.lineStyle(3, kit.secondary, 1).lineBetween(-9, -115, 0, -111);
  g.lineBetween(0, -111, 9, -115);
  g.fillStyle(appearance.skinTone, 1).fillEllipse(-12, -133, 6, 9);
  g.fillEllipse(12, -133, 6, 9);
  g.fillRoundedRect(-12, -147, 24, 31, { tl: 10, tr: 10, bl: 9, br: 9 });
  g.lineStyle(2, ink, 1).strokeRoundedRect(-12, -147, 24, 31, 9);
  g.fillStyle(0xa96b47, 0.7).fillEllipse(-5, -131, 7, 13);
  g.fillStyle(appearance.hairColor, 1).fillRoundedRect(-13, -151, 26, 12, 5);
  for (let i = 0; i < 6; i += 1) g.fillCircle(-10 + i * 4, -148 - (i % 2), 3.5);
  g.lineStyle(2, ink, 1).lineBetween(-8, -136, -3, -137);
  g.lineBetween(3, -137, 8, -136);
  g.fillStyle(glove, 1).fillEllipse(-5, -133, 4, 2.5);
  g.fillEllipse(5, -133, 4, 2.5);
  g.fillStyle(ink, 1).fillCircle(-5, -133, 1.1);
  g.fillCircle(5, -133, 1.1);
  g.lineStyle(1.5, 0x4d2e25, 1).lineBetween(0, -132, -1, -127);
  g.lineStyle(1.5, ink, 1).lineBetween(-4, -123, 4, -123);
  if (catching) {
    for (const side of [-1, 1]) {
      g.fillStyle(glove, 1).fillRoundedRect(side * 8 - 7, -111, 14, 17, 5);
      g.lineStyle(2, ink, 1).strokeRoundedRect(side * 8 - 7, -111, 14, 17, 5);
    }
  }
  g.restore();
}
