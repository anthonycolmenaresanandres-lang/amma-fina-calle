"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Game } from "phaser";
import { CAFERUSH_LEVELS, ratingFor } from "@/caferush/config";
import type { CafeRushStatus } from "@/caferush/types";
import { BODEGA_CATCH_SKIN } from "@/bodega-fall/skin";
import styles from "./page.module.css";

const initialStatus: CafeRushStatus = { score: 0, seconds: 45, target: 100, over: false };

function Illustration({ src, cat = false }: { src: string; cat?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <span className={cat ? styles.catPortrait : styles.productArt} aria-hidden="true">
    {!failed && <Image src={src} alt="" width={cat ? 512 : 320} height={cat ? 768 : 320} unoptimized onError={() => setFailed(true)} />}
  </span>;
}

export default function BodegaSessionsClient() {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const mount = useRef<HTMLDivElement>(null);
  const game = useRef<Game | null>(null);
  const pausedRef = useRef(false);
  const keyboardX = useRef(0.5);

  useEffect(() => {
    if (!started || !mount.current) return;
    let cancelled = false;
    const init = async () => {
      const [{ default: Phaser }, { CafeRushScene }] = await Promise.all([
        import("phaser"), import("@/caferush/CafeRushScene"),
      ]);
      if (cancelled || !mount.current) return;
      class BodegaCatchScene extends CafeRushScene {
        create() {
          this.events.on("cafe-status", (next: CafeRushStatus) => { if (!cancelled) setStatus(next); });
          super.create();
          const syncPointer = (pointer: { x: number }) => {
            keyboardX.current = Math.max(0, Math.min(1, pointer.x / this.scale.width));
          };
          this.input.on("pointermove", syncPointer);
          this.input.on("pointerdown", syncPointer);
          if (cancelled) return;
          setLoading(false);
          if (pausedRef.current) this.scene.pause();
        }
      }
      const scene = new BodegaCatchScene(CAFERUSH_LEVELS[0], BODEGA_CATCH_SKIN, {
        externalHud: true, catchLight: true,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
      game.current = new Phaser.Game({
        type: Phaser.CANVAS, parent: mount.current,
        width: mount.current.clientWidth, height: mount.current.clientHeight,
        backgroundColor: "#f4e7d1", scene: [scene], audio: { noAudio: true },
        scale: { mode: Phaser.Scale.RESIZE }, fps: { target: 60 },
      });
      game.current.canvas.setAttribute("aria-label", "Catch falling drinks and muffins with the bodega cat. Drag or use left and right arrow keys. Avoid spills. Sound-free.");
      mount.current.focus({ preventScroll: true });
    };
    void init().catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    const hide = () => {
      if (document.hidden) {
        pausedRef.current = true;
        game.current?.scene.getScenes(false).forEach((scene) => scene.scene.pause());
        setPaused(true);
      }
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", hide);
      game.current?.destroy(true); game.current = null;
    };
  }, [started, round]);

  function start() {
    pausedRef.current = false; keyboardX.current = 0.5;
    setPaused(false); setError(false); setLoading(true); setStatus(initialStatus);
    setStarted(true); setRound((n) => n + 1);
    requestAnimationFrame(() => mount.current?.scrollIntoView({ block: "center", behavior: "instant" }));
  }
  function togglePause() {
    const next = !pausedRef.current;
    pausedRef.current = next; setPaused(next);
    game.current?.scene.getScenes(false).forEach((scene) => next ? scene.scene.pause() : scene.scene.resume());
    if (!next) mount.current?.focus({ preventScroll: true });
  }

  return <section id="fall-game" className={styles.game} aria-label="Bodega falling-item game">
    <div className={styles.marquee}><span>CAFECITO WEATHER</span><span>FALL RUSH / BODEGA</span><span>YOUR NEIGHBORHOOD. YOUR SHIFT.</span></div>
    <div className={styles.stage}>
      {!started ? <>
        <div className={styles.intro}>
          <div className={styles.introCopy}>
            <span className={styles.eyebrow}>The cat’s got the counter.</span>
            <h2>Catch your<br /><em>cafecito.</em></h2>
            <p>Slide with our New York bodega cat. Catch your café favorites. Let the coffee spills fall past you.</p>
            <button className={styles.primary} onClick={start}>Start catching <span aria-hidden="true">↓</span></button>
            <span className={styles.hint}>45 seconds · Target 100 · Sound-free</span>
          </div>
          <div className={styles.cafePortrait}>
            <Illustration src="/assets/bodega/fall/bodega-cat.webp" cat />
            <span className={styles.portraitCaption}>YOUR LOCAL COUNTER CREW</span>
          </div>
        </div>
        <div className={styles.heroProducts} aria-label="Featured game items">
          {BODEGA_CATCH_SKIN.items.filter((item) => item.kind === "good").map((item) => <div key={item.id} className={styles.heroProduct}>
            <Illustration src={item.asset!} /><div><span className={styles.productNumber}>+{item.points}</span><strong>{item.label}</strong></div>
          </div>)}
        </div>
      </> : <div className={styles.catchLayout}>
        <div className={styles.catchControls}>
          <button className={styles.pause} onClick={() => setStarted(false)}>Back</button>
          <span className={styles.silentNote}>SOUND-FREE</span>
          <button className={styles.pause} onClick={togglePause} disabled={loading || error || status.over}>{paused ? "Resume" : "Pause"}</button>
          <button className={styles.pause} onClick={start}>Replay</button>
        </div>
        <div className={styles.hud} aria-label="Game score and time">
          <div><span>Score</span><strong>{status.score}</strong></div>
          <div><span>Target</span><strong>{status.target}</strong></div>
          <div><span>Seconds</span><strong data-urgent={status.seconds <= 10}>{status.seconds}</strong></div>
        </div>
        <div className={styles.catchBoard}>
          <div ref={mount} className={styles.catchCanvas} tabIndex={0} role="region" aria-label="Falling-item play area. Use left and right arrows to move the cat." onKeyDown={(event) => {
            if (paused || loading || error || status.over || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
            event.preventDefault();
            keyboardX.current = Math.max(0.05, Math.min(0.95, keyboardX.current + (event.key === "ArrowLeft" ? -0.07 : 0.07)));
            game.current?.scene.getScenes(true).forEach((scene) => scene.input.emit("pointermove", { x: keyboardX.current * scene.scale.width }));
          }} />
          {(loading || paused || error || status.over) && <div className={styles.catchOverlay} role="status">
            <h2>{error ? "The game couldn’t load." : loading ? "Opening the bodega…" : status.over ? status.score >= status.target ? "Nice shift, neighbor." : "See you next shift." : "Coffee break."}</h2>
            {status.over && !error && !loading && <p>{status.score} / {status.target} points<br />{ratingFor(status.score, status.target)}</p>}
            {error ? <button className={styles.primary} onClick={() => window.location.reload()}>Reload game</button> : status.over && !loading ? <button className={styles.primary} onClick={start}>Catch again</button> : paused && !loading ? <button className={styles.primary} onClick={togglePause}>Resume catching</button> : null}
          </div>}
        </div>
        <p className={styles.catchLegend}>Latte +10 · Canela +10 · Muffin +15 · Spill −15</p>
        <p className={styles.catchHint}>Drag, move your mouse or use ← →. Catch a little glow.</p>
      </div>}
    </div>
    <div className={styles.gameFooter}><span>CATCH THE DRINKS. DODGE THE SPILLS.</span><span>A LITTLE NEW YORK. A LOT OF CAFECITO.</span></div>
  </section>;
}
