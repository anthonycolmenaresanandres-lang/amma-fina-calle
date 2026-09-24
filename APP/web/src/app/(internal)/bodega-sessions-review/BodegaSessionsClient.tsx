"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Game } from "phaser";
import { ratingFor } from "@/caferush/config";
import type { CafeRushStatus } from "@/caferush/types";
import { BODEGA_CATCH_SKIN } from "@/bodega-fall/skin";
import { BODEGA_LEVEL } from "@/bodega-fall/level";
import { BodegaCatchAudio } from "@/bodega-fall/audio";
import styles from "./page.module.css";

const initialStatus: CafeRushStatus = { score: 0, seconds: BODEGA_LEVEL.rules.durationSec, target: BODEGA_LEVEL.rules.targetScore, over: false };

function Illustration({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  return <span className={styles.productArt} aria-hidden="true">
    {!failed && <Image src={src} alt="" width={320} height={320} unoptimized onError={() => setFailed(true)} />}
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
  const audio = useRef<BodegaCatchAudio | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => () => { audio.current?.dispose(); audio.current = null; }, []);

  function unlockAudio() {
    if (!audio.current) audio.current = new BodegaCatchAudio();
    audio.current.setMuted(muted);
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    if (!audio.current) audio.current = new BodegaCatchAudio();
    audio.current.setMuted(next);
  }

  // Use the full phone screen without Safari's page bounce fighting the game.
  useEffect(() => {
    if (!started) return;
    const mobile = window.matchMedia("(max-width: 700px), (max-height: 500px) and (pointer: coarse)");
    const previous = document.body.style.overflow;
    const sync = () => { document.body.style.overflow = mobile.matches ? "hidden" : previous; };
    sync();
    mobile.addEventListener("change", sync);
    return () => { mobile.removeEventListener("change", sync); document.body.style.overflow = previous; };
  }, [started]);

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
          this.events.on("cafe-catch", (id: string) => { if (!cancelled) audio.current?.play(id); });
          super.create();
          if (cancelled) return;
          setLoading(false);
          if (pausedRef.current) this.scene.pause();
        }
      }
      const scene = new BodegaCatchScene(BODEGA_LEVEL, BODEGA_CATCH_SKIN, {
        externalHud: true, catchLight: true, itemScale: 1.35,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
      game.current = new Phaser.Game({
        type: Phaser.CANVAS, parent: mount.current,
        width: mount.current.clientWidth, height: mount.current.clientHeight,
        backgroundColor: "#f4e7d1", scene: [scene], audio: { noAudio: true },
        scale: { mode: Phaser.Scale.RESIZE }, fps: { target: 60 },
      });
      game.current.canvas.setAttribute("aria-label", "Tap falling drinks and cereal bites to catch them. Avoid spills. Arrow keys select an item; Space or Enter catches it.");
      mount.current.focus({ preventScroll: true });
    };
    void init().catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    const pauseForBackground = () => {
        audio.current?.pause();
        pausedRef.current = true;
        game.current?.scene.getScenes(false).forEach((scene) => scene.scene.pause());
        setPaused(true);
    };
    const hide = () => { if (document.hidden) pauseForBackground(); };
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", pauseForBackground);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", pauseForBackground);
      game.current?.destroy(true); game.current = null;
    };
  }, [started, round]);

  function start() {
    audio.current?.pause();
    unlockAudio();
    pausedRef.current = false;
    setPaused(false); setError(false); setLoading(true); setStatus(initialStatus);
    setStarted(true); setRound((n) => n + 1);
    requestAnimationFrame(() => mount.current?.scrollIntoView({ block: "center", behavior: "instant" }));
  }

  function togglePause() {
    const next = !pausedRef.current;
    pausedRef.current = next; setPaused(next);
    if (next) audio.current?.pause();
    else unlockAudio();
    game.current?.scene.getScenes(false).forEach((scene) => next ? scene.scene.pause() : scene.scene.resume());
    if (!next) mount.current?.focus({ preventScroll: true });
  }

  return <section id="fall-game" className={styles.game} data-playing={started} aria-label="Bodega falling-item game">
    <div className={styles.stage}>
      {!started ? <div className={styles.landing}>
        <h1>FALL RUSH</h1>
        <div className={styles.productComposition} aria-hidden="true">
          <Illustration src="/assets/bodega/fall/spanish-latte.webp" />
          <Illustration src="/assets/bodega/fall/iced-green-latte.webp" />
          <Illustration src="/assets/bodega/fall/cereal-bites.webp" />
        </div>
        <p className={styles.landingInstruction}>Tap treats. Skip spills.</p>
        <button className={styles.playButton} onClick={start}>PLAY</button>
        <span className={styles.landingNote}>20 seconds · 100 points</span>
      </div> : <div className={styles.catchLayout}>
        <div className={styles.catchControls}>
          <button className={styles.pause} onClick={() => { audio.current?.pause(); setStarted(false); }}>Back</button>
          <button className={styles.pause} onClick={toggleMute} aria-pressed={muted} aria-label={muted ? "Unmute catch sounds" : "Mute catch sounds"}>{muted ? "Sound off" : "Sound on"}</button>
          <button className={styles.pause} onClick={togglePause} disabled={loading || error || status.over}>{paused ? "Resume" : "Pause"}</button>
          <button className={styles.pause} onClick={start}>Replay</button>
        </div>
        <div className={styles.hud} aria-label="Game score and time">
          <div><span>Score</span><strong>{status.score}</strong></div>
          <div><span>Target</span><strong>{status.target}</strong></div>
          <div><span>Seconds</span><strong data-urgent={status.seconds <= 10}>{status.seconds}</strong></div>
        </div>
        <div className={styles.catchBoard}>
          <div ref={mount} className={styles.catchCanvas} tabIndex={0} onPointerDownCapture={() => { if (!paused && !loading && !status.over) unlockAudio(); }} role="region" aria-label="Tap falling items to catch. Arrow keys select an item; Space or Enter catches it." onKeyDown={(event) => {
            if (paused || loading || error || status.over || !["ArrowLeft", "ArrowRight", " ", "Enter"].includes(event.key) || event.repeat) return;
            event.preventDefault();
            unlockAudio();
            game.current?.scene.getScenes(true).forEach((scene) => (scene as import("@/caferush/CafeRushScene").CafeRushScene).handleKey(event.key));
          }} />
          {(loading || paused || error || status.over) && <div className={styles.catchOverlay} role="status">
            <h2>{error ? "The game couldn’t load." : loading ? "Opening the bodega…" : status.over ? status.score >= status.target ? "Nice shift, neighbor." : "See you next shift." : "Coffee break."}</h2>
            {status.over && !error && !loading && <p>{status.score} / {status.target} points<br />{ratingFor(status.score, status.target)}</p>}
            {error ? <button className={styles.primary} onClick={() => window.location.reload()}>Reload game</button> : status.over && !loading ? <button className={styles.primary} onClick={start}>Catch again</button> : paused && !loading ? <button className={styles.primary} onClick={togglePause}>Resume catching</button> : null}
          </div>}
        </div>
        <p className={styles.catchLegend}>Latte +10 · Green drink +10 · Cereal bites +15 · Spill −15</p>
        <p className={styles.catchHint}>Tap to catch · Avoid spills · ← → selects, Space catches</p>
      </div>}
    </div>
  </section>;
}
