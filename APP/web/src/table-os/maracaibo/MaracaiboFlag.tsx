"use client";

import { useId, useSyncExternalStore, type CSSProperties } from "react";
import styles from "./maracaibo.module.css";

const WIDTH = 480;
const HEIGHT = 320;
const SECTIONS = 12;
const FRAMES = 24;
const SECTION_WIDTH = WIDTH / SECTIONS;

function subscribeMotion(change: () => void): () => void {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", change);
  return () => media.removeEventListener("change", change);
}
const canMove = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const staticOnServer = () => false;

function displacement(x: number, progress: number): number {
  const tension = Math.max(0, (x - .06) / .94);
  const envelope = Math.sin(Math.PI * progress);
  return 18 * tension * envelope * Math.sin(4 * Math.PI * progress - 1.7 * Math.PI * x);
}

// Every shared edge has the same displacement. The hoist stays fixed.
const panels = Array.from({ length: SECTIONS }, (_, index) => {
  const x = index * SECTION_WIDTH;
  const style: Record<string, string> = {};
  for (let frame = 0; frame <= FRAMES; frame++) {
    const progress = frame / FRAMES;
    const left = displacement(index / SECTIONS, progress);
    const right = displacement((index + 1) / SECTIONS, progress);
    const slope = (right - left) / SECTION_WIDTH;
    style[`--ripple-${frame}`] = `matrix(1,${slope.toFixed(6)},0,1,0,${(left - slope * x).toFixed(6)})`;
  }
  return { x, style: style as CSSProperties };
});

const starPoints = Array.from({ length: 10 }, (_, index) => {
  const angle = (-90 + index * 36) * Math.PI / 180;
  const radius = index % 2 ? 3.1 : 7.8;
  return `${(Math.cos(angle) * radius).toFixed(3)},${(Math.sin(angle) * radius).toFixed(3)}`;
}).join(" ");
const stars = Array.from({ length: 8 }, (_, index) => {
  const angle = (160 - index * 20) * Math.PI / 180;
  return { x: 240 + 75 * Math.cos(angle), y: 190 - 50 * Math.sin(angle) };
});

/** Code-native Venezuelan flag. Cloth sections bend; the whole flag never rotates. */
export function MaracaiboFlag({ prominent = false, decorative = false }: {
  prominent?: boolean;
  decorative?: boolean;
}): React.JSX.Element {
  const moving = useSyncExternalStore(subscribeMotion, canMove, staticOnServer);
  const prefix = "maracaibo-cloth-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const surface = prefix + "-surface";
  const sheen = prefix + "-sheen";
  return (
    <svg className={styles.flagFabric} data-ripple={moving}
      width={prominent ? 960 : WIDTH} height={prominent ? 640 : HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role={decorative ? undefined : "img"}
      aria-hidden={decorative ? "true" : undefined} focusable="false">
      {decorative ? null : <title>Venezuelan flag with eight white stars</title>}
      <defs>
        <linearGradient id={sheen} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={WIDTH} y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".08" />
          <stop offset=".23" stopColor="#fff" stopOpacity=".14" />
          <stop offset=".47" stopColor="#000" stopOpacity=".11" />
          <stop offset=".7" stopColor="#fff" stopOpacity=".1" />
          <stop offset="1" stopColor="#000" stopOpacity=".06" />
          {moving ? <animateTransform attributeName="gradientTransform" type="translate"
            values="0 0;48 0;-32 0;0 0" dur="4.8s" repeatCount="1" /> : null}
        </linearGradient>
        <g id={surface}>
          <rect width={WIDTH} height={HEIGHT / 3} fill="#FCE300" />
          <rect y={HEIGHT / 3} width={WIDTH} height={HEIGHT / 3} fill="#003DA5" />
          <rect y={2 * HEIGHT / 3} width={WIDTH} height={HEIGHT / 3} fill="#EF3340" />
          {stars.map((star, index) => <polygon key={index} data-flag-star points={starPoints}
            transform={`translate(${star.x} ${star.y})`} fill="#fff" />)}
          <rect width={WIDTH} height={HEIGHT} fill={`url(#${sheen})`} />
        </g>
        {panels.map((panel, index) => <clipPath key={index} id={prefix + "-clip-" + index}>
          <rect x={panel.x} y="-1" width={SECTION_WIDTH + .3} height={HEIGHT + 2} />
        </clipPath>)}
      </defs>
      <use className={styles.flagStill} href={"#" + surface} />
      {moving ? <g className={styles.flagMesh}>
        {panels.map((panel, index) => <g key={index} className={styles.flagPanel}
          style={panel.style} clipPath={`url(#${prefix}-clip-${index})`}>
          <use href={"#" + surface} />
        </g>)}
      </g> : null}
    </svg>
  );
}
