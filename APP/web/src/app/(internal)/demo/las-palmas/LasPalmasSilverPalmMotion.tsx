"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./LasPalmasSilverPalmMotion.module.css";

type SamplePoint = {
  seed: number;
  u: number;
  v: number;
};

type ArtworkSample = {
  aspectRatio: number;
  points: SamplePoint[];
};

const LOGO_PATH =
  "/assets/laspalmas/brand/las-palmas-original-sign-v1.png?v=20260726b";
const OFFICIAL_MENU_URL =
  "https://irp.cdn-website.com/1508c02f/files/uploaded/Las_Palmas_2-_3_-_4_Menu_2025.pdf";

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

function sampleCanvas(
  canvas: HTMLCanvasElement,
  seedOffset: number,
  lowPower: boolean,
): SamplePoint[] {
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return [];
  }

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const sampleStep = lowPower ? 10 : 8;
  const points: SamplePoint[] = [];

  for (let y = 0; y < canvas.height; y += sampleStep) {
    for (let x = 0; x < canvas.width; x += sampleStep) {
      const pixelIndex = (y * canvas.width + x) * 4;

      if (pixels[pixelIndex + 3] < 72) {
        continue;
      }

      const seedIndex = y * canvas.width + x + seedOffset;
      points.push({
        seed: seededRandom(seedIndex),
        u: (x + sampleStep / 2) / canvas.width,
        v: (y + sampleStep / 2) / canvas.height,
      });
    }
  }

  const maximumPoints = lowPower ? 500 : 720;

  if (points.length <= maximumPoints) {
    return points;
  }

  return Array.from({ length: maximumPoints }, (_, index) => {
    const sourceIndex = Math.floor((index * points.length) / maximumPoints);
    return points[sourceIndex];
  });
}

function createLogoSample(
  image: HTMLImageElement,
  lowPower: boolean,
): ArtworkSample | null {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context || canvas.width === 0 || canvas.height === 0) {
    return null;
  }

  context.drawImage(image, 0, 0);
  const points = sampleCanvas(canvas, 17, lowPower);

  if (points.length === 0) {
    return null;
  }

  return {
    aspectRatio: canvas.width / canvas.height,
    points,
  };
}

function createMenuSample(
  fontFamily: string,
  lowPower: boolean,
): ArtworkSample | null {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 220;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return null;
  }

  context.fillStyle = "#ffffff";
  context.font = `800 168px ${fontFamily}, Georgia, serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("MENU", canvas.width / 2, canvas.height / 2 + 8);
  const points = sampleCanvas(canvas, 71, lowPower);

  if (points.length === 0) {
    return null;
  }

  return {
    aspectRatio: canvas.width / canvas.height,
    points,
  };
}

export default function LasPalmasSilverPalmMotion(): React.JSX.Element {
  const shellRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const menuTitleRef = useRef<HTMLHeadingElement>(null);
  const menuDockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const logo = logoRef.current;
    const menuTitle = menuTitleRef.current;
    const menuDock = menuDockRef.current;

    if (!shell || !stage || !canvas || !logo || !menuTitle || !menuDock) {
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
    let logoSample: ArtworkSample | null = null;
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

    const draw = () => {
      animationFrame = 0;

      if (cancelled || !logoSample || !menuSample) {
        return;
      }

      const activeLogoSample = logoSample;
      const activeMenuSample = menuSample;
      const shellRect = shell.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const logoBounds = logo.getBoundingClientRect();
      const stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 0;
      const morphDistance = Math.max(300, shellRect.height - stageRect.height);
      const progress = clamp((stickyTop - shellRect.top) / morphDistance);
      const travel = smoothstep(0.045, 0.955, progress);
      const airborne = Math.sin(travel * Math.PI);
      const sourceOpacity = 1 - smoothstep(0.035, 0.24, progress);
      const targetOpacity = smoothstep(0.72, 0.96, progress);
      const particleOpacity =
        smoothstep(0.025, 0.16, progress) *
        (1 - smoothstep(0.86, 0.985, progress));
      const sourceRect = {
        height: logoBounds.height,
        left: logoBounds.left - stageRect.left,
        top: logoBounds.top - stageRect.top,
        width: logoBounds.width,
      };
      const targetRect = {
        height: menuTitle.offsetHeight,
        left: menuDock.offsetLeft + menuTitle.offsetLeft,
        top: menuDock.offsetTop + menuTitle.offsetTop,
        width: menuTitle.offsetWidth,
      };

      context.clearRect(0, 0, width, height);
      stage.dataset.motionProgress = progress.toFixed(3);
      stage.dataset.motionPhase =
        progress <= 0.015
          ? "logo"
          : progress >= 0.985
            ? "menu-dock"
            : "transform";
      logo.style.opacity = sourceOpacity.toFixed(3);
      logo.style.transform = `translate(-50%, -50%) translate3d(0, ${(
        -10 * travel
      ).toFixed(2)}px, 0) scale(${(1 - 0.035 * travel).toFixed(4)})`;
      menuTitle.style.opacity = targetOpacity.toFixed(3);
      menuTitle.style.transform = `translate3d(0, ${(
        16 *
        (1 - targetOpacity)
      ).toFixed(2)}px, 0)`;
      menuDock.style.setProperty("--resolve-progress", targetOpacity.toFixed(3));

      activeLogoSample.points.forEach((point, index) => {
        const targetPoint =
          activeMenuSample.points[
            (index * 137) % activeMenuSample.points.length
          ];

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
        const lift = airborne * (12 + point.seed * 38);
        const x = lerp(sourceX, destinationX, travel) + curl;
        const y =
          lerp(sourceY, destinationY, travel) -
          lift +
          Math.cos(point.seed * 27 + travel * Math.PI * 4) *
            airborne *
            (9 + point.seed * 25);
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
      if (!logo.complete || logo.naturalWidth === 0) {
        await new Promise<void>((resolve) => {
          logo.addEventListener("load", () => resolve(), { once: true });
          logo.addEventListener("error", () => resolve(), { once: true });
        });
      }

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
      const titleStyles = getComputedStyle(menuTitle);
      logoSample = createLogoSample(logo, lowPower);
      menuSample = createMenuSample(titleStyles.fontFamily, lowPower);

      if (!logoSample || !menuSample) {
        stage.dataset.motionState = "static";
        shell.dataset.motionState = "static";
        return;
      }

      resize();
      stage.dataset.motionState = "ready";
      shell.dataset.motionState = "ready";
      stage.dataset.motionInput = "scroll";
      stage.dataset.motionTarget = "semantic-menu-dock";
      stage.dataset.particleCount = String(logoSample.points.length);
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
      logo.style.removeProperty("opacity");
      logo.style.removeProperty("transform");
      menuTitle.style.removeProperty("opacity");
      menuTitle.style.removeProperty("transform");
      menuDock.style.removeProperty("--resolve-progress");
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
      aria-label="The original Las Palmas sign resolves into the permanent menu heading as the page scrolls"
    >
      <div
        ref={stageRef}
        className={styles.stage}
        data-las-palmas-palm-motion
        data-motion-source="scroll"
        data-motion-state="loading"
      >
        <h1 className="sr-only">
          Las Palmas Mexican Restaurant &amp; Cantina
        </h1>
        <div className={styles.statusLine} aria-hidden="true">
          <span>Lynnhaven</span>
          <span>Pending client approval</span>
        </div>
        {/* The exact supplied logo is kept as native image content; the canvas never redraws it. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={logoRef}
          src={LOGO_PATH}
          alt=""
          className={styles.logo}
          draggable={false}
        />
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div ref={menuDockRef} className={styles.menuDock}>
          <span className={styles.dockRule} aria-hidden="true" />
          <h2
            ref={menuTitleRef}
            id="las-palmas-menu-heading"
            className={styles.menuTitle}
          >
            MENU
          </h2>
        </div>
        <nav className={styles.primaryActions} aria-label="Las Palmas guest portal">
          <a
            href={OFFICIAL_MENU_URL}
            target="_blank"
            rel="noreferrer"
            className={styles.primaryAction}
          >
            Menu
          </a>
          <Link
            href="/penalty-shootout?skin=laspalmas"
            className={styles.primaryAction}
          >
            Game
          </Link>
          <Link
            href="/table/las-palmas-lynnhaven/1"
            className={styles.primaryAction}
          >
            Table
          </Link>
        </nav>
        <span className="sr-only">Desde 2010</span>
      </div>
    </div>
  );
}
