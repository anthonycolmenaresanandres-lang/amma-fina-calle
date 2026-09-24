import Phaser from "phaser";

/** Optional scenery only. The accessible game never depends on a canvas. */
export class FallScene extends Phaser.Scene {
  private leaves: Phaser.GameObjects.Ellipse[] = [];
  private scenery!: Phaser.GameObjects.Graphics;
  public moving = true;
  constructor() { super("BodegaFallScenery"); }
  create() {
    this.scenery = this.add.graphics();
    this.paint();
    for (let i = 0; i < 12; i++) {
      const leaf = this.add.ellipse((i * 83) % this.scale.width, (i * 43) % this.scale.height, 13, 6,
        [0xf0c34f, 0xd37a45, 0xa8c8a0][i % 3], 0.75);
      leaf.rotation = i;
      this.leaves.push(leaf);
    }
    this.scale.on("resize", this.paint, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.paint, this); this.leaves = [];
    });
  }
  private paint() {
    const { width: w, height: h } = this.scale;
    const g = this.scenery;
    g.clear();
    g.fillStyle(0xf0c34f, 0.05).fillCircle(w * 0.76, h * 0.25, h * 0.7);
    g.lineStyle(1, 0xfff2d8, 0.09);
    for (let x = 0; x < w; x += 76) g.lineBetween(x, 0, x - 30, h);
    g.fillStyle(0x201d24, 0.5).fillRect(0, h - 44, w, 44);
    g.lineStyle(2, 0xf0c34f, 0.25).lineBetween(0, h - 44, w, h - 44);
  }
  update(time: number, delta: number) {
    if (!this.moving) return;
    const step = Math.min(delta, 50) / 1000;
    this.leaves.forEach((leaf, i) => {
      leaf.y += (12 + i * 2) * step;
      leaf.x += Math.sin(time / 1400 + i) * 13 * step;
      leaf.rotation += step * 0.3;
      if (leaf.y > this.scale.height + 12) { leaf.y = -12; leaf.x = (i * 83 + time / 10) % this.scale.width; }
    });
  }
}
