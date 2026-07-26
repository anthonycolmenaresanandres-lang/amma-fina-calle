"use client";

import { useEffect, useRef } from "react";
import styles from "./LasPalmasSilverPalmMotion.module.css";

type SamplePoint = {
  seed: number;
  u: number;
  v: number;
};

type ArtworkSample = {
  aspectRatio: number;
  canvas: HTMLCanvasElement;
  points: SamplePoint[];
};

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const lerp = (start: number, end: number, progress: number) =>
  start + (end - start) * progress;

const smoothstep = (start: number, end: number, value: number) => {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
};

const seededRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

function drawPalm(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
): void {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#d9dce0";
  context.fillStyle = "#eef0f2";

  context.lineWidth = 3.2;
  context.beginPath();
  context.moveTo(-2, 38);
  context.quadraticCurveTo(-7, 15, 2, -1);
  context.stroke();

  const fronds = [
    { controlX: -31, controlY: -18, endX: -44, endY: -8 },
    { controlX: -24, controlY: -31, endX: -37, endY: -31 },
    { controlX: -10, controlY: -38, endX: -16, endY: -48 },
    { controlX: 7, controlY: -38, endX: 12, endY: -50 },
    { controlX: 24, controlY: -30, endX: 38, endY: -33 },
    { controlX: 31, controlY: -15, endX: 45, endY: -7 },
  ];

  context.lineWidth = 4.4;
  fronds.forEach((frond) => {
    context.beginPath();
    context.moveTo(1, 0);
    context.quadraticCurveTo(
      frond.controlX,
      frond.controlY,
      frond.endX,
      frond.endY,
    );
    context.stroke();
  });

  context.beginPath();
  context.arc(1, 0, 4.4, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function createPalmSprite(): HTMLCanvasElement {
  const sprite = document.createElement("canvas");
  sprite.width = 72;
  sprite.height = 72;
  const context = sprite.getContext("2d");

  if (!context) {
    return sprite;
  }

  const silver = context.createLinearGradient(8, 0, 64, 72);
  silver.addColorStop(0, "#f7f8f9");
  silver.addColorStop(0.38, "#aeb4bb");
  silver.addColorStop(0.62, "#ffffff");
  silver.addColorStop(1, "#858c94");
  context.strokeStyle = silver;
  context.fillStyle = silver;
  context.shadowColor = "rgb(225 231 237 / 0.32)";
  context.shadowBlur = 5;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.translate(36, 49);
  context.scale(0.58, 0.58);

  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(-2, 35);
  context.quadraticCurveTo(-5, 14, 1, 0);
  context.stroke();

  [
    [-30, -16, -43, -7],
    [-22, -29, -36, -31],
    [-8, -37, -15, -49],
    [8, -38, 13, -50],
    [24, -29, 39, -32],
    [31, -14, 45, -5],
  ].forEach(([controlX, controlY, endX, endY]) => {
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(1, 0);
    context.quadraticCurveTo(controlX, controlY, endX, endY);
    context.stroke();
  });

  context.beginPath();
  context.arc(1, 0, 4, 0, Math.PI * 2);
  context.fill();
  return sprite;
}

function createArtwork(
  kind: "brand" | "menu",
  displayFont: string,
  lowPower: boolean,
): ArtworkSample | null {
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = kind === "brand" ? 560 : 340;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return null;
  }

  const silver = context.createLinearGradient(0, 40, canvas.width, canvas.height);
  silver.addColorStop(0, "#f8fafb");
  silver.addColorStop(0.3, "#aab1b8");
  silver.addColorStop(0.56, "#f4f6f7");
  silver.addColorStop(0.8, "#8c949c");
  silver.addColorStop(1, "#e7eaed");
  context.fillStyle = silver;
  context.strokeStyle = silver;
  context.textAlign = "center";
  context.textBaseline = "middle";

  if (kind === "brand") {
    context.save();
    context.strokeStyle = silver;
    context.fillStyle = silver;
    drawPalm(context, 408, 178, 1.42);
    drawPalm(context, 480, 154, 1.72);
    drawPalm(context, 554, 178, 1.42);
    context.restore();

    context.font = `700 128px ${displayFont}, Georgia, serif`;
    context.fillText("LAS PALMAS", canvas.width / 2, 330);
    context.font = `600 27px ui-sans-serif, system-ui, sans-serif`;
    context.fillText("MEXICAN RESTAURANT & CANTINA", canvas.width / 2, 433);
  } else {
    context.shadowColor = "rgb(235 239 243 / 0.22)";
    context.shadowBlur = 18;
    context.font = `700 246px ${displayFont}, Georgia, serif`;
    context.fillText("MENU", canvas.width / 2, canvas.height / 2 + 8);
    context.shadowBlur = 0;
  }

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const sampleStep = lowPower ? 10 : 8;
  const points: SamplePoint[] = [];

  for (let y = 0; y < canvas.height; y += sampleStep) {
    for (let x = 0; x < canvas.width; x += sampleStep) {
      const pixelIndex = (y * canvas.width + x) * 4;

      if (pixels[pixelIndex + 3] < 52) {
        continue;
      }

      const seedIndex = y * canvas.width + x;
      points.push({
        seed: seededRandom(seedIndex + (kind === "brand" ? 17 : 71)),
        u: (x + sampleStep / 2) / canvas.width,
        v: (y + sampleStep / 2) / canvas.height,
      });
    }
  }

  if (points.length === 0) {
    return null;
  }

  const maximumPoints = lowPower ? 480 : 660;
  const sampledPoints =
    points.length <= maximumPoints
      ? points
      : Array.from({ length: maximumPoints }, (_, index) => {
          const sourceIndex = Math.floor((index * points.length) / maximumPoints);
          return points[sourceIndex];
        });

  return {
    aspectRatio: canvas.width / canvas.height,
    canvas,
    points: sampledPoints,
  };
}

function PalmGlyph({ className }: { className: string }): React.JSX.Element {
  return (
    <svg viewBox="0 0 32 40" aria-hidden className={className} fill="currentColor">
      <path d="M15 38c-1-8-1-16 .4-24l1.6.2c-1.2 8-1 16 0 23.8z" />
      <path d="M16 15C11 11 5.6 10 1 12.4c4.4 3 9.8 3.4 15 1.4z" />
      <path d="M16 15c5-4 10.4-5 15-2.6-4.4 3-9.8 3.4-15 1.4z" />
      <path d="M16 14.6C12.4 9.6 8 7 3.4 7.6 6 12 10.8 14.6 16 14.6z" />
      <path d="M16 14.6c3.6-5 8-7.6 12.6-7C26 12 21.2 14.6 16 14.6z" />
      <path d="M15.6 14c-1.2-5.4 0-9.6 2.4-11.6 1.6 3.6.8 8-1.2 11.8z" />
    </svg>
  );
}

export default function LasPalmasSilverPalmMotion(): React.JSX.Element {
  const shellRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;

    if (!shell || !stage || !canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!context || reducedMotion.matches) {
      stage.dataset.motionState = "static";
      shell.dataset.motionState = "static";
      return;
    }

    let animationFrame = 0;
    let cancelled = false;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let brandSample: ArtworkSample | null = null;
    let menuSample: ArtworkSample | null = null;
    const palmSprite = createPalmSprite();

    const resize = () => {
      const bounds = stage.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const artworkRect = (sample: ArtworkSample, maximumWidth: number) => {
      const artworkWidth = Math.min(width * 0.9, maximumWidth);
      const artworkHeight = artworkWidth / sample.aspectRatio;

      return {
        height: artworkHeight,
        left: (width - artworkWidth) / 2,
        top: (height - artworkHeight) / 2,
        width: artworkWidth,
      };
    };

    const draw = () => {
      animationFrame = 0;

      if (cancelled || !brandSample || !menuSample) {
        return;
      }

      const activeBrandSample = brandSample;
      const activeMenuSample = menuSample;
      const shellRect = shell.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 0;
      const morphDistance = Math.max(280, shellRect.height - stageRect.height);
      const progress = clamp((stickyTop - shellRect.top) / morphDistance);
      const travel = smoothstep(0.035, 0.965, progress);
      const airborne = Math.sin(travel * Math.PI);
      const sourceOpacity = 1 - smoothstep(0.015, 0.12, progress);
      const targetOpacity = smoothstep(0.87, 0.995, progress);
      const particleOpacity =
        smoothstep(0.02, 0.14, progress) *
        (1 - smoothstep(0.88, 0.99, progress));
      const sourceRect = artworkRect(activeBrandSample, 610);
      const targetRect = artworkRect(activeMenuSample, 450);

      context.clearRect(0, 0, width, height);
      stage.dataset.motionProgress = progress.toFixed(3);
      stage.dataset.motionPhase =
        progress <= 0.015
          ? "brand"
          : progress >= 0.985
            ? "menu"
            : "transform";

      if (sourceOpacity > 0) {
        context.globalAlpha = sourceOpacity;
        context.drawImage(
          activeBrandSample.canvas,
          sourceRect.left,
          sourceRect.top,
          sourceRect.width,
          sourceRect.height,
        );
        context.globalAlpha = 1;
      }

      activeBrandSample.points.forEach((point, index) => {
        const targetPoint =
          activeMenuSample.points[(index * 137) % activeMenuSample.points.length];

        if (!targetPoint) {
          return;
        }

        const sourceX = sourceRect.left + sourceRect.width * point.u;
        const sourceY = sourceRect.top + sourceRect.height * point.v;
        const destinationX = targetRect.left + targetRect.width * targetPoint.u;
        const destinationY = targetRect.top + targetRect.height * targetPoint.v;
        const curl =
          airborne *
          Math.sin(point.seed * 31 + travel * Math.PI * 3) *
          (18 + point.seed * 48);
        const lift = airborne * (14 + point.seed * 42);
        const x = lerp(sourceX, destinationX, travel) + curl;
        const y =
          lerp(sourceY, destinationY, travel) -
          lift +
          Math.cos(point.seed * 27 + travel * Math.PI * 4) *
            airborne *
            (10 + point.seed * 28);
        const alpha = particleOpacity * (0.58 + point.seed * 0.38);
        const settle = smoothstep(0.76, 0.97, travel);
        const release = smoothstep(0.03, 0.22, travel);

        if (release < 0.3 || settle > 0.78) {
          const particleSize = lerp(2.15, 1.5, settle);
          context.fillStyle = `rgba(220, 225, 230, ${alpha})`;
          context.fillRect(
            x - particleSize / 2,
            y - particleSize / 2,
            particleSize,
            particleSize,
          );
          return;
        }

        const renderSize =
          (4.8 + point.seed * 4.4) * (1 + airborne * 0.42);
        context.save();
        context.globalAlpha = alpha;
        context.translate(x, y);
        context.rotate(
          (point.seed - 0.5) * 0.72 +
            Math.sin(travel * Math.PI * 4 + point.seed * 19) * 0.16,
        );
        context.drawImage(
          palmSprite,
          -renderSize / 2,
          -renderSize / 2,
          renderSize,
          renderSize,
        );
        context.restore();
      });

      if (targetOpacity > 0) {
        context.globalAlpha = targetOpacity;
        context.drawImage(
          activeMenuSample.canvas,
          targetRect.left,
          targetRect.top,
          targetRect.width,
          targetRect.height,
        );
        context.globalAlpha = 1;
      }
    };

    const scheduleDraw = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    const handleResize = () => {
      resize();
      scheduleDraw();
    };

    const prepare = async () => {
      if ("fonts" in document) {
        await document.fonts.ready;
      }

      if (cancelled) {
        return;
      }

      const navigatorWithMemory = navigator as Navigator & {
        deviceMemory?: number;
      };
      const lowPower =
        window.innerWidth <= 600 ||
        navigator.hardwareConcurrency <= 4 ||
        (navigatorWithMemory.deviceMemory ?? 8) <= 4;
      const displayFont =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--font-playfair")
          .trim() || "Georgia";
      brandSample = createArtwork("brand", displayFont, lowPower);
      menuSample = createArtwork("menu", displayFont, lowPower);

      if (!brandSample || !menuSample) {
        stage.dataset.motionState = "static";
        shell.dataset.motionState = "static";
        return;
      }

      resize();
      stage.dataset.motionState = "ready";
      shell.dataset.motionState = "ready";
      stage.dataset.motionInput = "scroll";
      stage.dataset.motionTarget = "menu";
      stage.dataset.particleCount = String(brandSample.points.length);
      window.addEventListener("scroll", scheduleDraw, { passive: true });
      window.addEventListener("resize", handleResize);
      scheduleDraw();
    };

    void prepare();

    return () => {
      cancelled = true;

      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }

      window.removeEventListener("scroll", scheduleDraw);
      window.removeEventListener("resize", handleResize);
      delete stage.dataset.motionInput;
      delete stage.dataset.motionPhase;
      delete stage.dataset.motionProgress;
      delete stage.dataset.motionState;
      delete stage.dataset.motionTarget;
      delete stage.dataset.particleCount;
      delete shell.dataset.motionState;
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      aria-label="Las Palmas silver palms transform into the menu as the page scrolls"
    >
      <div
        ref={stageRef}
        className={styles.stage}
        data-las-palmas-palm-motion
        data-motion-source="scroll"
      >
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div className={styles.staticMark}>
          <div className={styles.palms} aria-hidden="true">
            <PalmGlyph className={styles.palmSmall} />
            <PalmGlyph className={styles.palmLarge} />
            <PalmGlyph className={styles.palmSmall} />
          </div>
          <h1>LAS PALMAS</h1>
          <p>Mexican Restaurant &amp; Cantina</p>
        </div>
        <span className="sr-only">Lynnhaven · Virginia Beach · Desde 2010</span>
      </div>
    </div>
  );
}
