import Phaser from "phaser";

export type BodegaSessionsResult = {
  correct: number;
  durationMs: number;
  rating: "Headliner" | "On beat" | "Warm-up set";
  total: number;
};

export type BodegaSessionsSceneOptions = {
  onComplete: (result: BodegaSessionsResult) => void;
  playTone: (padIndex: number) => void;
  reducedMotion: boolean;
};

type PadView = {
  disc: Phaser.GameObjects.Arc;
  indexText: Phaser.GameObjects.Text;
  label: Phaser.GameObjects.Text;
};

const PAD_COLORS = [0xb695e7, 0x86b8ee, 0xf0c34f, 0xefaac8] as const;
const PAD_LABELS = ["Cup", "Steam", "Bell", "Bass"] as const;
const PATTERNS = [
  [0, 2, 1],
  [3, 0, 2, 1],
  [1, 3, 2, 0, 3],
] as const;

export class BodegaSessionsScene extends Phaser.Scene {
  private readonly options: BodegaSessionsSceneOptions;
  private readonly pads: PadView[] = [];
  private waveform!: Phaser.GameObjects.Graphics;
  private eyebrow!: Phaser.GameObjects.Text;
  private status!: Phaser.GameObjects.Text;
  private progress!: Phaser.GameObjects.Text;
  private phase: "showing" | "input" | "complete" = "showing";
  private roundIndex = 0;
  private inputIndex = 0;
  private correct = 0;
  private startedAt = 0;
  private inputDeadline?: Phaser.Time.TimerEvent;

  constructor(options: BodegaSessionsSceneOptions) {
    super("BodegaSessionsScene");
    this.options = options;
  }

  create(): void {
    this.startedAt = performance.now();
    this.cameras.main.setBackgroundColor("#090909");

    this.waveform = this.add.graphics().setDepth(0);
    this.eyebrow = this.add
      .text(0, 0, "BODEGA SESSIONS / SIDE A", {
        color: "#a8c8a0",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        fontStyle: "bold",
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setDepth(2);
    this.status = this.add
      .text(0, 0, "Listen for the first pattern", {
        align: "center",
        color: "#fffdf7",
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "25px",
        wordWrap: { width: 320 },
      })
      .setOrigin(0.5)
      .setDepth(2);
    this.progress = this.add
      .text(0, 0, "ROUND 1 / 3", {
        color: "#f0c34f",
        fontFamily: "Courier New, monospace",
        fontSize: "11px",
        fontStyle: "bold",
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setDepth(2);

    PAD_LABELS.forEach((label, index) => {
      const disc = this.add
        .circle(0, 0, 64, 0x202120, 1)
        .setStrokeStyle(5, PAD_COLORS[index], 0.9)
        .setInteractive({ useHandCursor: true })
        .setDepth(2);
      disc.on("pointerdown", () => this.pressPad(index));

      const indexText = this.add
        .text(0, 0, String(index + 1), {
          color: `#${PAD_COLORS[index].toString(16).padStart(6, "0")}`,
          fontFamily: "Arial Black, Arial, sans-serif",
          fontSize: "31px",
        })
        .setOrigin(0.5)
        .setDepth(3);
      const labelText = this.add
        .text(0, 0, label.toUpperCase(), {
          color: "#fffdf7",
          fontFamily: "Courier New, monospace",
          fontSize: "10px",
          fontStyle: "bold",
          letterSpacing: 1,
        })
        .setOrigin(0.5)
        .setDepth(3);

      this.pads.push({ disc, indexText, label: labelText });
    });

    this.bindKeyboard();
    this.layout();
    this.scale.on("resize", this.layout, this);
    this.time.delayedCall(700, () => this.playRound());
  }

  shutdown(): void {
    this.scale.off("resize", this.layout, this);
    this.inputDeadline?.remove(false);
  }

  public pressPad(index: number): void {
    if (this.phase !== "input" || index < 0 || index >= this.pads.length) {
      return;
    }

    const pattern = PATTERNS[this.roundIndex];
    const expected = pattern[this.inputIndex];
    this.flashPad(index, false);
    this.options.playTone(index);

    if (index === expected) {
      this.correct += 1;
    }

    this.inputIndex += 1;
    this.progress.setText(
      `ROUND ${this.roundIndex + 1} / ${PATTERNS.length}  ·  BEAT ${this.inputIndex} / ${pattern.length}`,
    );

    if (this.inputIndex >= pattern.length) {
      this.inputDeadline?.remove(false);
      this.advanceRound();
    }
  }

  private bindKeyboard(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;

    const keys = keyboard.addKeys({
      one: Phaser.Input.Keyboard.KeyCodes.ONE,
      two: Phaser.Input.Keyboard.KeyCodes.TWO,
      three: Phaser.Input.Keyboard.KeyCodes.THREE,
      four: Phaser.Input.Keyboard.KeyCodes.FOUR,
    }) as Record<"one" | "two" | "three" | "four", Phaser.Input.Keyboard.Key>;

    ([keys.one, keys.two, keys.three, keys.four] as const).forEach((key, index) => {
      key.on("down", () => this.pressPad(index));
    });
  }

  private layout(): void {
    const { width, height } = this.scale.gameSize;
    const centerX = width / 2;
    const compact = height < 530;
    const top = Math.max(24, height * 0.045);

    this.eyebrow.setPosition(centerX, top);
    this.status.setPosition(centerX, top + (compact ? 40 : 48));
    this.status.setWordWrapWidth(Math.max(260, width - 44));
    this.progress.setPosition(centerX, top + (compact ? 78 : 92));

    this.drawWaveform(width, top + (compact ? 108 : 128));

    const radius = Phaser.Math.Clamp(Math.min(width * 0.145, height * 0.1), 45, 68);
    const horizontal = width * 0.26;
    const firstY = top + (compact ? 184 : 222);
    const vertical = compact ? radius * 2.25 : radius * 2.55;
    const positions = [
      { x: centerX - horizontal, y: firstY },
      { x: centerX + horizontal, y: firstY },
      { x: centerX - horizontal, y: firstY + vertical },
      { x: centerX + horizontal, y: firstY + vertical },
    ];

    this.pads.forEach((pad, index) => {
      const position = positions[index];
      pad.disc.setPosition(position.x, position.y).setRadius(radius);
      pad.indexText.setPosition(position.x, position.y - radius * 0.12);
      pad.indexText.setFontSize(Math.round(radius * 0.48));
      pad.label.setPosition(position.x, position.y + radius * 0.42);
      pad.label.setFontSize(Math.max(8, Math.round(radius * 0.15)));
    });
  }

  private drawWaveform(width: number, y: number): void {
    const left = Math.max(22, width * 0.08);
    const right = width - left;
    const span = right - left;
    const points = [0, 0.12, 0.2, 0.28, 0.37, 0.46, 0.55, 0.64, 0.74, 0.83, 1];
    const heights = [0, 0, -12, 20, -28, 25, -18, 12, 0, 0, 0];

    this.waveform.clear();
    this.waveform.lineStyle(4, 0x86b8ee, 0.9);
    this.waveform.beginPath();
    this.waveform.moveTo(left, y);
    points.slice(1).forEach((point, index) => {
      this.waveform.lineTo(left + span * point, y + heights[index + 1]);
    });
    this.waveform.strokePath();
  }

  private playRound(): void {
    if (this.phase === "complete") return;

    const pattern = PATTERNS[this.roundIndex];
    this.phase = "showing";
    this.inputIndex = 0;
    this.status.setText(`Round ${this.roundIndex + 1}. Listen.`);
    this.progress.setText(`ROUND ${this.roundIndex + 1} / ${PATTERNS.length}`);

    pattern.forEach((padIndex, sequenceIndex) => {
      this.time.delayedCall(360 + sequenceIndex * 470, () => {
        this.flashPad(padIndex, true);
        this.options.playTone(padIndex);
      });
    });

    this.time.delayedCall(610 + pattern.length * 470, () => {
      if (this.phase === "complete") return;
      this.phase = "input";
      this.status.setText("Your turn.");
      this.progress.setText(`ROUND ${this.roundIndex + 1} / ${PATTERNS.length}  ·  BEAT 0 / ${pattern.length}`);
      this.inputDeadline = this.time.delayedCall(4000, () => this.advanceRound());
    });
  }

  private flashPad(index: number, playback: boolean): void {
    const pad = this.pads[index];
    const color = PAD_COLORS[index];
    pad.disc.setFillStyle(color, playback ? 0.86 : 0.72);
    pad.indexText.setColor("#090909");
    pad.label.setColor("#090909");

    const restore = () => {
      pad.disc.setFillStyle(0x202120, 1);
      pad.indexText.setColor(`#${color.toString(16).padStart(6, "0")}`);
      pad.label.setColor("#fffdf7");
    };

    if (this.options.reducedMotion) {
      this.time.delayedCall(230, restore);
      return;
    }

    this.tweens.add({
      targets: [pad.disc, pad.indexText, pad.label],
      scale: 1.08,
      duration: 90,
      yoyo: true,
      ease: "Cubic.Out",
      onComplete: restore,
    });
  }

  private advanceRound(): void {
    if (this.phase === "complete") return;

    this.inputDeadline?.remove(false);
    this.phase = "showing";

    if (this.roundIndex >= PATTERNS.length - 1) {
      this.finishSession();
      return;
    }

    this.roundIndex += 1;
    this.status.setText("Flip the side.");
    this.progress.setText(`ROUND ${this.roundIndex + 1} INCOMING`);
    this.time.delayedCall(720, () => this.playRound());
  }

  private finishSession(): void {
    this.phase = "complete";
    const total = PATTERNS.reduce((sum, pattern) => sum + pattern.length, 0);
    const ratio = this.correct / total;
    const rating: BodegaSessionsResult["rating"] =
      ratio === 1 ? "Headliner" : ratio >= 0.75 ? "On beat" : "Warm-up set";

    this.status.setText(rating);
    this.progress.setText(`${this.correct} / ${total} BEATS`);
    this.pads.forEach((pad) => pad.disc.disableInteractive());
    this.options.onComplete({
      correct: this.correct,
      durationMs: Math.round(performance.now() - this.startedAt),
      rating,
      total,
    });
  }
}
