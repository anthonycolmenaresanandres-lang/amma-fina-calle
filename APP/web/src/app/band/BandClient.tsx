"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BANDSTAND_SKINS } from "@/bandstand/config";
import { Bandstand } from "@/bandstand/synth";
import type { BandstandSkin, MascotConfig } from "@/bandstand/types";

type PodRect = { id: string; x: number; y: number; r: number };

export default function BandClient(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Bandstand | null>(null);
  const podsRef = useRef<PodRect[]>([]);
  const rafRef = useRef<number | null>(null);
  const revealRef = useRef<Map<string, number>>(new Map());
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const [skin, setSkin] = useState<BandstandSkin | null>(null);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [clipUrl, setClipUrl] = useState<string | null>(null);

  // ---- engine lifecycle -------------------------------------------------
  const pickSkin = useCallback(async (chosen: BandstandSkin) => {
    if (engineRef.current) return;
    const engine = new Bandstand(chosen);
    await engine.start();
    engineRef.current = engine;
    const kick = chosen.mascots.find((m) => m.role === "kick") ?? chosen.mascots[0];
    engine.toggle(kick.id);
    setActiveIds([kick.id]);
    setSkin(chosen);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  // ---- preload mascot sprites ------------------------------------------
  useEffect(() => {
    if (!skin) return;
    for (const m of skin.mascots) {
      if (m.image && !imagesRef.current.has(m.id)) {
        const img = new window.Image();
        img.src = m.image;
        imagesRef.current.set(m.id, img);
      }
    }
  }, [skin]);

  // ---- canvas render loop ----------------------------------------------
  useEffect(() => {
    if (!skin) return;
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

    const TOP = () => h * 0.1; // reserved band for the fans meter

    const layout = (): PodRect[] => {
      const cols = 2;
      const rows = Math.ceil(skin.mascots.length / cols);
      const padX = w * 0.08;
      const padTop = TOP() + h * 0.02;
      const padBottom = h * 0.05;
      const cellW = (w - padX * 2) / cols;
      const cellH = (h - padTop - padBottom) / rows;
      const r = Math.min(cellW, cellH) * 0.3;
      return skin.mascots.map((m, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return { id: m.id, x: padX + cellW * (col + 0.5), y: padTop + cellH * (row + 0.5), r };
      });
    };

    const drawMeter = () => {
      const engine = engineRef.current;
      if (!engine) return;
      const nu = engine.nextUnlock();
      const x = w * 0.08;
      const bw = w * 0.84;
      const y = h * 0.05;
      ctx.fillStyle = skin.colors.dim;
      ctx.font = `600 ${Math.round(h * 0.018)}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      ctx.fillText(`★ ${engine.getFans()} fans`, x, y - h * 0.012);
      if (nu) {
        ctx.textAlign = "right";
        ctx.fillText(`Next: ${nu.name}`, x + bw, y - h * 0.012);
      } else {
        ctx.textAlign = "right";
        ctx.fillText("Full band! ★", x + bw, y - h * 0.012);
      }
      // track
      const th = Math.max(4, h * 0.008);
      ctx.fillStyle = `${skin.colors.dim}40`;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, th, th / 2);
      ctx.fill();
      // fill
      const ratio = nu ? Math.min(1, Math.max(0, (nu.have - nu.from) / Math.max(1, nu.need - nu.from))) : 1;
      ctx.fillStyle = skin.colors.text;
      ctx.beginPath();
      ctx.roundRect(x, y, Math.max(th, bw * ratio), th, th / 2);
      ctx.fill();
    };

    const drawMascot = (m: MascotConfig, pod: PodRect, bob: number, active: boolean, locked: boolean) => {
      const { x, r } = pod;
      const y = pod.y - bob * r * 0.18;
      const now = engineRef.current?.now() ?? 0;
      const revealAt = revealRef.current.get(m.id);
      const reveal = revealAt !== undefined ? now - revealAt : -1;

      // floor shadow
      ctx.save();
      ctx.globalAlpha = active ? 0.35 : 0.16;
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.ellipse(pod.x, pod.y + r * 0.95, r * (0.7 - bob * 0.1), r * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // unlock celebration ring
      if (reveal >= 0 && reveal < 1.3) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - reveal / 1.3);
        ctx.strokeStyle = m.accent;
        ctx.lineWidth = r * 0.12;
        ctx.beginPath();
        ctx.arc(x, y, r * (1 + reveal * 1.4), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (locked) {
        // silhouette + padlock
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = skin.colors.stage;
        ctx.strokeStyle = `${skin.colors.dim}99`;
        ctx.lineWidth = Math.max(2, r * 0.05);
        ctx.beginPath();
        ctx.arc(x, pod.y, r * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // padlock glyph
        ctx.fillStyle = `${skin.colors.dim}cc`;
        const lw = r * 0.5;
        const lh = r * 0.42;
        ctx.beginPath();
        ctx.roundRect(x - lw / 2, pod.y - lh * 0.1, lw, lh, r * 0.08);
        ctx.fill();
        ctx.lineWidth = Math.max(2, r * 0.07);
        ctx.strokeStyle = `${skin.colors.dim}cc`;
        ctx.beginPath();
        ctx.arc(x, pod.y - lh * 0.1, lw * 0.32, Math.PI, 0);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = skin.colors.dim;
        ctx.font = `600 ${Math.round(r * 0.32)}px ui-sans-serif, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Locked", pod.x, pod.y + r * 1.5);
        return;
      }

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

      // sprite art (if loaded) draws instead of the procedural blob
      const img = imagesRef.current.get(m.id);
      if (img && img.complete && img.naturalWidth > 0) {
        const scaleI = active ? 1 + bob * 0.07 : 0.9;
        const iw = r * 2.4 * scaleI;
        const ih = iw * (img.naturalHeight / img.naturalWidth);
        ctx.save();
        ctx.globalAlpha = active ? 1 : 0.5;
        // feet sit near the pod's lower edge; the bob lifts the whole sprite
        ctx.drawImage(img, x - iw / 2, pod.y + r * 1.05 - ih - bob * r * 0.18, iw, ih);
        ctx.restore();

        const freshI = reveal >= 0 && reveal < 1.6;
        ctx.fillStyle = freshI ? m.accent : active ? skin.colors.text : skin.colors.dim;
        ctx.font = `600 ${Math.round(r * 0.3)}px ui-sans-serif, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(freshI ? `${m.name} ✦` : m.name, pod.x, pod.y + r * 1.55);
        return;
      }

      // body
      const scale = active ? 1 + bob * 0.06 : 0.92;
      ctx.save();
      ctx.globalAlpha = active ? 1 : 0.55;
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

      // mouth
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

      // name (or NEW! on a fresh unlock)
      const fresh = reveal >= 0 && reveal < 1.6;
      ctx.fillStyle = fresh ? m.accent : active ? skin.colors.text : skin.colors.dim;
      ctx.font = `600 ${Math.round(r * 0.34)}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(fresh ? `${m.name} ✦` : m.name, pod.x, pod.y + r * 1.5);
    };

    const frame = () => {
      const engine = engineRef.current;
      if (!engine) return;
      const ev = engine.update();
      if (ev) revealRef.current.set(ev.id, engine.now());

      const pods = layout();
      podsRef.current = pods;
      ctx.clearRect(0, 0, w, h);

      drawMeter();

      // on-beat pulse line
      const phase = engine.barPhase();
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = skin.colors.dim;
      ctx.fillRect(0, h - 3, w * phase, 3);
      ctx.restore();

      skin.mascots.forEach((m, i) => {
        drawMascot(m, pods[i], engine.getBob(m.id), engine.isActive(m.id), !engine.isUnlocked(m.id));
      });

      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [skin]);

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
        if (!engine.isUnlocked(pod.id)) return; // locked — earn it first
        engine.toggle(pod.id);
        setActiveIds(engine.skin.mascots.filter((m) => engine.isActive(m.id)).map((m) => m.id));
        return;
      }
    }
  }, []);

  // ---- recording & sharing ---------------------------------------------
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

  const shareClip = useCallback(async () => {
    const engine = engineRef.current;
    if (!clipUrl || !engine) return;
    try {
      const blob = await (await fetch(clipUrl)).blob();
      const file = new File([blob], `${engine.skin.id}.webm`, { type: blob.type });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: engine.skin.skinName });
        return;
      }
    } catch {
      // fall through to download
    }
    const a = document.createElement("a");
    a.href = clipUrl;
    a.download = `${engine.skin.id}.webm`;
    a.click();
  }, [clipUrl]);

  // ---- render -----------------------------------------------------------
  if (!skin) {
    const intro = BANDSTAND_SKINS[0];
    return (
      <main
        className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col items-center justify-center px-6 text-center"
        style={{ background: intro.colors.bg, color: intro.colors.text }}
      >
        <p className="text-xs uppercase tracking-[0.24em]" style={{ color: intro.colors.dim }}>
          {intro.brandName}
        </p>
        <h1 className="mt-3 font-serif text-4xl">Pick your band</h1>
        <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: intro.colors.dim }}>
          Tap characters to layer parts into a looping jam. Keep it going to earn new bandmates.
        </p>
        <div className="mt-8 grid w-full gap-3">
          {BANDSTAND_SKINS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => void pickSkin(s)}
              className="rounded-2xl border px-5 py-4 text-left transition"
              style={{ borderColor: `${s.colors.dim}66`, background: s.colors.stage }}
            >
              <span className="block text-[0.65rem] uppercase tracking-[0.2em]" style={{ color: s.colors.dim }}>
                {s.brandName}
              </span>
              <span className="mt-1 block font-serif text-xl" style={{ color: s.colors.text }}>
                {s.skinName}
              </span>
              <span className="mt-1 flex gap-1.5">
                {s.mascots.map((m) => (
                  <span key={m.id} className="inline-block h-3 w-3 rounded-full" style={{ background: m.color }} />
                ))}
              </span>
            </button>
          ))}
        </div>
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
        <canvas ref={canvasRef} onPointerDown={onCanvasPointerDown} className="h-full w-full touch-none" />
      </div>

      <footer className="flex flex-col items-center gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
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
            <button
              type="button"
              onClick={() => void shareClip()}
              className="rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ background: skin.colors.text, color: skin.colors.bg }}
            >
              Share
            </button>
          ) : null}
        </div>
        {clipUrl ? <audio controls src={clipUrl} className="w-full max-w-xs" /> : null}
      </footer>
    </div>
  );
}
