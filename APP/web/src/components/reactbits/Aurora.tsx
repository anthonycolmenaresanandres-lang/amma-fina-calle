"use client";

import { useEffect, useRef } from "react";

// Vendored React Bits-style "Aurora" background, tuned to the Fina Calle
// palette (steel + gold on near-black). Decorative only: it layers behind
// the page's static gradients, so no-JS and reduced-motion visitors still
// get the full composition. Canvas 2D (no WebGL dep), DPR-capped, ~30fps,
// paused while the tab is hidden.

type AuroraBlob = {
  hue: string;
  baseX: number; // 0..1 of width
  baseY: number; // 0..1 of height
  radius: number; // fraction of min(w,h)
  driftX: number; // fraction of width
  driftY: number; // fraction of height
  speed: number; // radians per second
  phase: number;
};

const BLOBS: AuroraBlob[] = [
  { hue: "216,179,109", baseX: 0.5, baseY: 0.72, radius: 0.52, driftX: 0.1, driftY: 0.05, speed: 0.11, phase: 0.0 },
  { hue: "201,208,213", baseX: 0.26, baseY: 0.3, radius: 0.46, driftX: 0.08, driftY: 0.07, speed: 0.08, phase: 2.1 },
  { hue: "201,208,213", baseX: 0.76, baseY: 0.34, radius: 0.42, driftX: 0.09, driftY: 0.06, speed: 0.06, phase: 4.2 },
  { hue: "216,179,109", baseX: 0.18, baseY: 0.82, radius: 0.36, driftX: 0.06, driftY: 0.04, speed: 0.09, phase: 5.3 },
];

const ALPHA = 0.075;
const FRAME_MS = 1000 / 30;

function drawFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
) {
  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  const base = Math.min(w, h);
  for (const b of BLOBS) {
    const x = (b.baseX + Math.sin(t * b.speed + b.phase) * b.driftX) * w;
    const y = (b.baseY + Math.cos(t * b.speed * 0.8 + b.phase) * b.driftY) * h;
    const r = b.radius * base * (1 + 0.08 * Math.sin(t * b.speed * 1.3 + b.phase));
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${b.hue},${ALPHA})`);
    g.addColorStop(1, `rgba(${b.hue},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = "source-over";
}

export default function Aurora({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const { clientWidth, clientHeight } = canvas;
      canvas.width = Math.max(1, Math.round(clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(clientHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Keep a valid frame on screen even between animation ticks.
      drawFrame(ctx, clientWidth, clientHeight, last / 1000);
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      last = now;
      drawFrame(ctx, canvas.clientWidth, canvas.clientHeight, now / 1000);
    };

    const start = () => {
      stop();
      if (reduced.matches) {
        // Static aurora: one frame, no animation loop.
        drawFrame(ctx, canvas.clientWidth, canvas.clientHeight, 0);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", start);
    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", start);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none h-full w-full ${className ?? ""}`}
    />
  );
}
