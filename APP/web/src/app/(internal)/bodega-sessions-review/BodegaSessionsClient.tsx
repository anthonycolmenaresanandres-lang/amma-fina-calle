"use client";

import { useEffect, useRef, useState } from "react";
import type { Game } from "phaser";
import { CAFERUSH_LEVELS } from "@/caferush/config";
import { BODEGA_CATCH_SKIN } from "@/bodega-fall/skin";
import type { ItemId } from "@/bodega-fall/rules";
import styles from "./page.module.css";

function Product({ id, small = false }: { id: ItemId; small?: boolean }) {
  return <span aria-hidden="true" className={`${styles.product} ${styles[id]} ${small ? styles.smallProduct : ""}`}>
    <span className={styles.steam} />
    <span className={styles.vessel}><span className={styles.productMark}>{id === "muffin" ? "✦" : id === "spanish" ? "S" : "C"}</span></span>
    <span className={styles.saucer} />
  </span>;
}

export default function BodegaSessionsClient() {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
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
      const scene = new CafeRushScene(CAFERUSH_LEVELS[0], BODEGA_CATCH_SKIN);
      scene.events.once("create", () => {
        if (cancelled) return;
        setLoading(false);
        if (pausedRef.current) scene.scene.pause();
      });
      game.current = new Phaser.Game({
        type: Phaser.CANVAS, parent: mount.current,
        width: mount.current.clientWidth, height: mount.current.clientHeight,
        backgroundColor: "#5b202c", scene: [scene], audio: { noAudio: true },
        scale: { mode: Phaser.Scale.RESIZE }, fps: { target: 60 },
      });
      game.current.canvas.setAttribute("aria-label", "Catch falling drinks and muffins. Drag the tray or use left and right arrow keys. Avoid spills.");
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
    setPaused(false); setError(false); setLoading(true);
    setStarted(true); setRound((n) => n + 1);
    requestAnimationFrame(() => mount.current?.scrollIntoView({ block: "center" }));
  }
  function togglePause() {
    const next = !pausedRef.current;
    pausedRef.current = next; setPaused(next);
    game.current?.scene.getScenes(false).forEach((scene) => next ? scene.scene.pause() : scene.scene.resume());
    if (!next) mount.current?.focus({ preventScroll: true });
  }

  return <section id="fall-game" className={styles.game} aria-label="Bodega falling-item game">
    <div className={styles.marquee}><span>CAFECITO WEATHER</span><span>FALL RUSH / BODEGA</span><span>CATCH YOUR FAVORITES</span></div>
    <div className={styles.stage}>
      {!started ? <div className={styles.intro}>
        <div className={styles.introCopy}>
          <span className={styles.eyebrow}>Good things are falling.</span>
          <h2>Catch your<br /><em>cafecito.</em></h2>
          <p>Slide your tray left and right. Catch falling Spanish Lattes, Canela Love and muffins. Let the coffee spills fall past you.</p>
          <div className={styles.startActions}><button className={styles.primary} onClick={start}>Start catching <span aria-hidden="true">↓</span></button></div>
          <span className={styles.hint}>45 seconds · Drag, move your mouse or use ← → · Target 100</span>
        </div>
        <div className={styles.heroProducts} aria-label="Featured game items">
          {BODEGA_CATCH_SKIN.items.filter((item) => item.kind === "good").map((item) => <div key={item.id} className={styles.heroProduct}>
            <Product id={item.id as ItemId} /><span className={styles.productNumber}>+{item.points}</span><strong>{item.label}</strong>
          </div>)}
          <span className={styles.seasonStamp} aria-hidden="true">CATCH<br />THE<br />GOOD.</span>
        </div>
      </div> : <div className={styles.catchLayout}>
        <div className={styles.catchControls}>
          <button className={styles.pause} onClick={() => setStarted(false)}>Back</button>
          <button className={styles.pause} onClick={togglePause} disabled={loading || error}>{paused ? "Resume" : "Pause"}</button>
          <button className={styles.pause} onClick={start}>Replay</button>
        </div>
        <div className={styles.catchBoard}>
          <div ref={mount} className={styles.catchCanvas} tabIndex={0} role="region" aria-label="Falling-item play area. Use left and right arrows to move the tray." onKeyDown={(event) => {
            if (paused || loading || error || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
            event.preventDefault();
            keyboardX.current = Math.max(0.05, Math.min(0.95, keyboardX.current + (event.key === "ArrowLeft" ? -0.07 : 0.07)));
            game.current?.scene.getScenes(true).forEach((scene) => scene.input.emit("pointermove", { x: keyboardX.current * scene.scale.width }));
          }} />
          {(loading || paused || error) && <div className={styles.catchOverlay} role="status">
            <h2>{error ? "The game couldn’t load." : loading ? "Warming up…" : "Coffee break."}</h2>
            {error ? <button className={styles.primary} onClick={() => window.location.reload()}>Reload game</button> : paused && !loading ? <button className={styles.primary} onClick={togglePause}>Resume catching</button> : null}
          </div>}
        </div>
        <p className={styles.catchLegend}>Latte +10 · Canela +10 · Muffin +15 · Spill −15</p>
        <p className={styles.catchHint}>Move your mouse or drag the tray. Keyboard: ← →</p>
      </div>}
    </div>
    <div className={styles.gameFooter}><span>CATCH THE DRINKS. DODGE THE SPILLS.</span><span>MADE FOR CAFECITO WEATHER.</span></div>
  </section>;
}
