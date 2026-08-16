"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./LasPalmasWindPalms.module.css";

// Las Palmas hero: the approved original sign stands still while a grove of
// palms behind it bends in a live wind. No scroll choreography — the motion is
// ambient and continuous, the way the real trees outside the restaurant move.
// The sign itself is native image content and is never redrawn on the canvas.

const LOGO_PATH =
  "/assets/laspalmas/brand/las-palmas-original-sign-v1.png?v=20260726b";
const OFFICIAL_MENU_URL =
  "https://irp.cdn-website.com/1508c02f/files/uploaded/Las_Palmas_2-_3_-_4_Menu_2025.pdf";

type Palm = {
  /** Horizontal anchor across the stage, 0 = left edge, 1 = right edge. */
  anchor: number;
  /** Trunk length as a share of stage height. */
  height: number;
  /** Resting lean; positive leans downwind (right). */
  lean: number;
  /** How far this trunk gives to the wind. Tall thin palms give more. */
  flex: number;
  /** Depth band: 0 = far haze, 1 = mid, 2 = foreground. */
  layer: 0 | 1 | 2;
  /** Frond count. */
  fronds: number;
  /** Per-tree offset so no two palms move in lockstep. */
  phase: number;
};

// Palms hug the left and right edges so the sign in the middle stays clear;
// the short inner pair sits low and far back to fill the corners of the grove.
const GROVE: Palm[] = [
  { anchor: 0.02, height: 0.6, lean: -0.26, flex: 1.15, layer: 2, fronds: 8, phase: 0.0 },
  { anchor: 0.19, height: 0.45, lean: -0.12, flex: 0.9, layer: 1, fronds: 7, phase: 1.7 },
  { anchor: 0.33, height: 0.3, lean: 0.1, flex: 0.62, layer: 0, fronds: 6, phase: 3.1 },
  { anchor: 0.67, height: 0.29, lean: 0.14, flex: 0.6, layer: 0, fronds: 6, phase: 2.2 },
  { anchor: 0.81, height: 0.46, lean: 0.16, flex: 0.9, layer: 1, fronds: 7, phase: 5.4 },
  { anchor: 0.98, height: 0.62, lean: 0.28, flex: 1.15, layer: 2, fronds: 8, phase: 3.8 },
];

// Far palms sit back in the haze; foreground palms carry the silver brand edge.
const LAYER_INK = [
  { rachis: "rgba(112, 143, 124, 0.3)", trunk: "rgba(92, 122, 105, 0.28)", leaflets: false },
  { rachis: "rgba(146, 168, 156, 0.4)", trunk: "rgba(120, 145, 130, 0.38)", leaflets: false },
  { rachis: "rgba(196, 208, 213, 0.5)", trunk: "rgba(158, 172, 178, 0.46)", leaflets: true },
] as const;

/**
 * Wind speed at time `t` for a tree with the given phase: a slow gust envelope
 * modulating three sine components, so the grove breathes instead of ticking.
 */
function windAt(t: number, phase: number): number {
  const gust = 0.5 + 0.5 * Math.sin(t * 0.21 + phase * 0.6);
  const sway =
    Math.sin(t * 0.85 + phase) * 0.62 +
    Math.sin(t * 1.63 + phase * 2.1) * 0.26 +
    Math.sin(t * 3.19 + phase * 3.7) * 0.09;
  return sway * (0.42 + 0.78 * gust);
}

function drawPalm(
  context: CanvasRenderingContext2D,
  palm: Palm,
  width: number,
  height: number,
  time: number,
): void {
  const ink = LAYER_INK[palm.layer];
  const wind = windAt(time, palm.phase);
  const baseX = palm.anchor * width;
  const baseY = height + 6;
  // Trunk length is a share of stage height, so every viewport lands its crowns
  // in the same band of the frame instead of drifting with the aspect ratio.
  const trunkLength = height * palm.height;
  const bend = wind * palm.flex * trunkLength * 0.15;
  const leanReach = palm.lean * trunkLength * 0.38;

  // Trunk: bend grows with the square of the distance from the ground, so the
  // base stays planted and the crown takes the whole gust.
  const trunkPoint = (s: number) => ({
    x: baseX + leanReach * s + bend * s * s,
    y: baseY - trunkLength * s,
  });

  const segments = 14;
  const baseWidth = Math.max(2, Math.min(9, trunkLength * 0.026));
  context.lineCap = "round";
  context.strokeStyle = ink.trunk;

  for (let i = 0; i < segments; i += 1) {
    const from = trunkPoint(i / segments);
    const to = trunkPoint((i + 1) / segments);
    context.lineWidth = baseWidth * (1 - (i / segments) * 0.62);
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  }

  const crown = trunkPoint(1);
  // Cap against stage width so a narrow phone never gets fronds sprawling
  // clean across the frame.
  const frondLength = Math.min(trunkLength * 0.44, width * 0.6);
  context.strokeStyle = ink.rachis;

  for (let f = 0; f < palm.fronds; f += 1) {
    const spread = palm.fronds > 1 ? f / (palm.fronds - 1) : 0.5;
    // Fronds fan from up-left to up-right; the whole crown is pushed downwind
    // and each frond flutters slightly out of step with its neighbours.
    const restAngle = -Math.PI * (0.94 - spread * 0.88);
    const flutter = Math.sin(time * 3.4 + palm.phase * 4 + f * 1.9) * 0.05;
    const angle = restAngle + wind * 0.24 + flutter + palm.lean * 0.16;
    const length = frondLength * (0.8 + ((f * 37) % 11) / 26);
    // Each frond arches up out of the crown, then its tip falls under its own
    // weight — flatter fronds hang the most, and the wind lifts the whole set.
    const droop = length * (0.42 + Math.abs(Math.cos(angle)) * 0.3 - wind * 0.09);
    const controlX = crown.x + Math.cos(angle) * length * 0.58 + wind * length * 0.1;
    const controlY = crown.y + Math.sin(angle) * length * 0.58;
    const tipX = crown.x + Math.cos(angle) * length + wind * length * 0.16;
    const tipY = crown.y + Math.sin(angle) * length + droop;

    context.lineWidth = Math.max(1, baseWidth * 0.42);
    context.beginPath();
    context.moveTo(crown.x, crown.y);
    context.quadraticCurveTo(controlX, controlY, tipX, tipY);
    context.stroke();

    if (!ink.leaflets) {
      continue;
    }

    // Foreground palms get leaflets combed off the rachis for texture.
    context.lineWidth = Math.max(0.6, baseWidth * 0.16);
    for (let l = 1; l <= 5; l += 1) {
      const s = l / 6;
      const inverse = 1 - s;
      const spineX =
        inverse * inverse * crown.x + 2 * inverse * s * controlX + s * s * tipX;
      const spineY =
        inverse * inverse * crown.y + 2 * inverse * s * controlY + s * s * tipY;
      const leafletLength = length * 0.16 * (1 - s * 0.45);
      const comb = angle + Math.PI / 2 + wind * 0.12;
      context.beginPath();
      context.moveTo(spineX, spineY);
      context.lineTo(
        spineX + Math.cos(comb) * leafletLength,
        spineY + Math.sin(comb) * leafletLength,
      );
      context.moveTo(spineX, spineY);
      context.lineTo(
        spineX - Math.cos(comb) * leafletLength,
        spineY - Math.sin(comb) * leafletLength,
      );
      context.stroke();
    }
  }

  // Coconut cluster at the crown, front palms only.
  if (ink.leaflets) {
    context.fillStyle = ink.trunk;
    context.beginPath();
    context.arc(crown.x, crown.y + baseWidth * 0.4, baseWidth * 0.42, 0, Math.PI * 2);
    context.fill();
  }
}

export default function LasPalmasWindPalms(): React.JSX.Element {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;

    if (!stage || !canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      return;
    }

    const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
    const lowPower =
      window.innerWidth <= 600 ||
      navigator.hardwareConcurrency <= 4 ||
      (navigatorWithMemory.deviceMemory ?? 8) <= 4;
    // The grove itself is cheap (six trees, a few dozen strokes a frame), so
    // small screens keep the whole silhouette and only drop the leaflet detail.
    const grove = lowPower
      ? GROVE.map((palm) => (palm.layer === 2 ? { ...palm, layer: 1 as const } : palm))
      : GROVE;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let visible = true;

    const paint = (time: number) => {
      context.clearRect(0, 0, width, height);
      grove.forEach((palm) => drawPalm(context, palm, width, height, time));
    };

    const resize = () => {
      const bounds = stage.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    // Reduced motion still gets the grove — just held at a single calm frame.
    if (reducedMotion.matches) {
      resize();
      paint(0);
      stage.dataset.motionState = "static";
      stage.dataset.palmCount = String(grove.length);
      const handleStaticResize = () => {
        resize();
        paint(0);
      };
      window.addEventListener("resize", handleStaticResize);
      return () => {
        window.removeEventListener("resize", handleStaticResize);
        delete stage.dataset.motionState;
        delete stage.dataset.palmCount;
      };
    }

    const start = performance.now();

    const frame = (now: number) => {
      paint((now - start) / 1000);
      animationFrame = window.requestAnimationFrame(frame);
    };

    const play = () => {
      if (animationFrame === 0 && visible) {
        animationFrame = window.requestAnimationFrame(frame);
      }
    };

    const pause = () => {
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const handleResize = () => {
      resize();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        pause();
      } else {
        play();
      }
    };

    // Stop burning frames once the grove has scrolled out of view.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;

        if (visible) {
          play();
        } else {
          pause();
        }
      },
      { threshold: 0 },
    );

    resize();
    stage.dataset.motionState = "wind";
    stage.dataset.palmCount = String(grove.length);
    observer.observe(stage);
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);
    play();

    return () => {
      pause();
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      delete stage.dataset.motionState;
      delete stage.dataset.palmCount;
    };
  }, []);

  return (
    <div className={styles.shell}>
      <div
        ref={stageRef}
        className={styles.stage}
        data-las-palmas-wind-palms
        data-motion-state="loading"
      >
        <h1 className="sr-only">Las Palmas Mexican Restaurant &amp; Cantina</h1>
        <div className={styles.statusLine} aria-hidden="true">
          <span>Lynnhaven</span>
          <span>Pending client approval</span>
        </div>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label="Palm trees bending in the wind behind the Las Palmas sign"
          role="img"
        />
        {/* The exact supplied logo is kept as native image content; the canvas never redraws it. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_PATH}
          alt=""
          className={styles.logo}
          draggable={false}
        />
        <div className={styles.menuDock}>
          <span className={styles.dockRule} aria-hidden="true" />
          <h2 id="las-palmas-menu-heading" className={styles.menuTitle}>
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
