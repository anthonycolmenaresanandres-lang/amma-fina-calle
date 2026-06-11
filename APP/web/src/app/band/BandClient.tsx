"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_BANDSTAND_SKIN } from "@/bandstand/config";
import { Bandstand } from "@/bandstand/synth";
import type { MascotConfig } from "@/bandstand/types";

type PodRect = { id: string; x: number; y: number; r: number };

export default function BandClient(): React.JSX.Element {
  const skin = DEFAULT_BANDSTAND_SKIN;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Bandstand | null>(null);
  const podsRef = useRef<PodRect[]>([]);
  const rafRef = useRef<number | null>(null);

  const [started, setStarted] = useState(false);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [clipUrl, setClipUrl] = useState<string | null>(null);

  // ---- engine lifecycle -------------------------------------------------
  const handleStart = useCallback(async () => {
    if (engineRef.current) return;
    const engine = new Bandstand(skin);
    await engine.start();
    engineRef.current = engine;
    // Open with the heartbeat so the stage is never silent.
    engine.toggle("boomer");
    setActiveIds(["boomer"]);
    setStarted(true);
  }, [skin]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  // ---- canvas render loop ----------------------------------------------
  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const layout = (): PodRect[] => {
      const cols = 2;
      const rows = Math.ceil(skin.mascots.length / cols);
      const padX = w * 0.08;
      const padTop = h * 0.06;
      const padBottom = h * 0.06;
      const cellW = (w - padX * 2) / cols;
      const cellH = (h - padTop - padBottom) / rows;
      const r = Math.min(cellW, cellH) * 0.3;
      return skin.mascots.map((m, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return {
          id: m.id,
          x: padX + cellW * (col + 0.5),
          y: padTop + cellH * (row + 0.5),
          r,
        };
      });
    };

    const drawMascot = (m: MascotConfig, pod: PodRect, bob: number, active: boolean) => {
      const { x, r } = pod;
      const y = pod.y - bob * r * 0.18;

      // floor shadow
      ctx.save();
      ctx.globalAlpha = active ? 0.35 : 0.18;
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.ellipse(pod.x, pod.y + r * 0.95, r * (0.7 - bob * 0.1), r * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // active glow
      if (active) {
        ctx.save();
        ctx.globalAlpha = 0.25 + bob * 0.4;
        ctx.fillStyle = m.accent;
        ctx.beginPath();
        ctx.arc(x, y, r * (1.2 + bob * 0.15), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // body
      const scale = active ? 1 + bob * 0.06 : 0.92;
      ctx.save();
      ctx.globalAlpha = active ? 1 : 0.4;
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(x, y, r * scale, 0, Math.PI * 2);
      ctx.fill();

      // eyes
      const eyeDx = r * 0.34;
      const eyeY = y - r * 0.12;
      const eyeR = r * 0.18;
      for (const dx of [-eyeDx, eyeDx]) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + dx, eyeY, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#181024";
        ctx.beginPath();
        ctx.arc(x + dx, eyeY + (active ? 0 : eyeR * 0.4), eyeR * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // mouth — opens when singing (bob), a sleepy line when inactive
      ctx.fillStyle = "#2a1730";
      if (active && bob > 0.05) {
        ctx.beginPath();
        ctx.ellipse(x, y + r * 0.34, r * 0.22, r * (0.1 + bob * 0.26), 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = "#2a1730";
        ctx.lineWidth = Math.max(2, r * 0.06);
        ctx.beginPath();
        ctx.moveTo(x - r * 0.18, y + r * 0.38);
        ctx.lineTo(x + r * 0.18, y + r * 0.38);
        ctx.stroke();
      }
      ctx.restore();

      // name
      ctx.fillStyle = active ? skin.colors.text : skin.colors.dim;
      ctx.font = `600 ${Math.round(r * 0.34)}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(m.name, pod.x, pod.y + r * 1.5);
    };

    const frame = () => {
      const engine = engineRef.current;
      if (!engine) return;
      const pods = layout();
      podsRef.current = pods;

      ctx.clearRect(0, 0, w, h);

      // on-beat pulse line across the stage
      const phase = engine.barPhase();
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = skin.colors.dim;
      ctx.fillRect(0, h - 3, w * phase, 3);
      ctx.restore();

      skin.mascots.forEach((m, i) => {
        const pod = pods[i];
        drawMascot(m, pod, engine.getBob(m.id), engine.isActive(m.id));
      });

      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [started, skin]);

  // ---- input ------------------------------------------------------------
  const onCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    const canvas = canvasRef.current;
    if (!engine || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    for (const pod of podsRef.current) {
      const dx = px - pod.x;
      const dy = py - pod.y;
      if (dx * dx + dy * dy <= pod.r * pod.r * 1.6) {
        engine.toggle(pod.id);
        setActiveIds(skin.mascots.filter((m) => engine.isActive(m.id)).map((m) => m.id));
        return;
      }
    }
  }, [skin]);

  // ---- recording --------------------------------------------------------
  const toggleRecord = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;
    if (recording) {
      const blob = await engine.stopRecording();
      setRecording(false);
      if (blob) {
        if (clipUrl) URL.revokeObjectURL(clipUrl);
        setClipUrl(URL.createObjectURL(blob));
      }
      return;
    }
    if (engine.startRecording()) setRecording(true);
  }, [recording, clipUrl]);

  // ---- render -----------------------------------------------------------
  if (!started) {
    return (
      <main
        className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col items-center justify-center px-6 text-center"
        style={{ background: skin.colors.bg, color: skin.colors.text }}
      >
        <p className="text-xs uppercase tracking-[0.24em]" style={{ color: skin.colors.dim }}>
          {skin.brandName}
        </p>
        <h1 className="mt-3 font-serif text-4xl">{skin.skinName}</h1>
        <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: skin.colors.dim }}>
          {skin.tagline}
        </p>
        <button
          type="button"
          onClick={() => void handleStart()}
          className="mt-8 rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
          style={{ background: skin.colors.text, color: skin.colors.bg }}
        >
          Start the band
        </button>
      </main>
    );
  }

  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col"
      style={{ background: skin.colors.bg, color: skin.colors.text }}
    >
      <header className="px-4 pt-4 text-center">
        <p className="text-[0.65rem] uppercase tracking-[0.22em]" style={{ color: skin.colors.dim }}>
          {skin.brandName}
        </p>
        <h1 className="font-serif text-2xl">{skin.skinName}</h1>
        <p className="mt-1 text-xs" style={{ color: skin.colors.dim }}>
          {activeIds.length === 0 ? "Tap a character to start a part" : `${activeIds.length} playing`}
        </p>
      </header>

      <div className="relative flex-1" style={{ background: skin.colors.stage }}>
        <canvas
          ref={canvasRef}
          onPointerDown={onCanvasPointerDown}
          className="h-full w-full touch-none"
        />
      </div>

      <footer className="flex flex-col items-center gap-3 px-4 py-4">
        <button
          type="button"
          onClick={() => void toggleRecord()}
          className="rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em]"
          style={
            recording
              ? { background: "#e8584d", color: "#ffffff" }
              : { border: `1px solid ${skin.colors.dim}`, color: skin.colors.text }
          }
        >
          {recording ? "● Stop & save clip" : "Record a clip"}
        </button>
        {clipUrl ? (
          <div className="flex w-full flex-col items-center gap-2">
            <audio controls src={clipUrl} className="w-full max-w-xs" />
            <a
              href={clipUrl}
              download="fina-calle-band.webm"
              className="text-xs underline"
              style={{ color: skin.colors.dim }}
            >
              Download clip
            </a>
          </div>
        ) : null}
      </footer>
    </div>
  );
}
