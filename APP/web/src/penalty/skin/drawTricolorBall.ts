import type Phaser from "phaser";

/** Original Mexico-color match ball. No federation, club or official-ball marks. */
export function drawTricolorBall(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, spin: number, green: number, red: number): void {
  g.save();
  g.translateCanvas(x, y);
  g.rotateCanvas(spin);
  g.fillStyle(0xfffdf5, 1);
  g.fillCircle(0, 0, r);
  const cap = (start: number, end: number, color: number) => {
    g.fillStyle(color, 1);
    g.beginPath();
    for (let i = 0; i <= 16; i++) {
      const angle = start + (end - start) * i / 16;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath(); g.fillPath();
  };
  cap(Math.acos(-0.32), Math.PI * 2 - Math.acos(-0.32), green);
  cap(-Math.acos(0.32), Math.acos(0.32), red);
  g.lineStyle(Math.max(0.6, r * 0.045), 0x18362b, 0.7);
  g.fillStyle(0x18362b, 1);
  g.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + i * Math.PI * 2 / 5;
    const px = Math.cos(angle) * r * 0.28;
    const py = Math.sin(angle) * r * 0.28;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.closePath(); g.fillPath();
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + i * Math.PI * 2 / 5;
    g.lineBetween(Math.cos(angle) * r * 0.28, Math.sin(angle) * r * 0.28, Math.cos(angle) * r * 0.98, Math.sin(angle) * r * 0.98);
  }
  g.lineStyle(Math.max(0.75, r * 0.06), 0xfffdf5, 0.9);
  g.strokeCircle(0, 0, r);
  g.fillStyle(0xffffff, 0.25);
  g.fillEllipse(-r * 0.25, -r * 0.45, r * 0.5, r * 0.25);
  g.restore();
}
