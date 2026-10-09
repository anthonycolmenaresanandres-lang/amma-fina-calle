"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Game } from "phaser";
import type { CafeRushScene } from "@/caferush/CafeRushScene";
import type { CafeRushStatus } from "@/caferush/types";
import { olympiaRounds, olympiaSkin } from "./config";
import styles from "./play.module.css";

export default function OlympiaGame() {
  const [roundIndex, setRoundIndex] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<CafeRushStatus>({ score: 0, seconds: 45, target: 100, over: false });
  const mount = useRef<HTMLDivElement>(null);
  const game = useRef<Game | null>(null);
  const scene = useRef<CafeRushScene | null>(null);
  const result = useRef<HTMLHeadingElement>(null);
  const activeRound = roundIndex === null ? null : olympiaRounds[roundIndex];

  useEffect(() => {
    if (!activeRound || !mount.current) return;
    let cancelled = false;
    async function start() {
      const [{ default: Phaser }, { CafeRushScene }] = await Promise.all([import("phaser"), import("@/caferush/CafeRushScene")]);
      if (cancelled || !mount.current || !activeRound) return;
      class OlympiaScene extends CafeRushScene {
        create() {
          this.events.on("cafe-status", (next: CafeRushStatus) => { if (!cancelled) setStatus(next); });
          super.create();
          if (!cancelled) setLoading(false);
        }
      }
      const nextScene = new OlympiaScene(activeRound, olympiaSkin, {
        externalHud: true, reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
      scene.current = nextScene;
      game.current = new Phaser.Game({
        type: Phaser.CANVAS, parent: mount.current, width: mount.current.clientWidth || 390,
        height: mount.current.clientHeight || 440, backgroundColor: "#e3efd9", scene: [nextScene],
        audio: { noAudio: true }, scale: { mode: Phaser.Scale.RESIZE },
      });
      game.current.canvas.setAttribute("aria-hidden", "true");
      mount.current.focus({ preventScroll: true });
    }
    void start().catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    const pauseOnHide = () => {
      if (document.hidden && scene.current?.scene.isActive()) {
        scene.current.scene.pause(); setPaused(true);
      }
    };
    document.addEventListener("visibilitychange", pauseOnHide);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", pauseOnHide);
      const previous = game.current;
      if (previous) {
        // Phaser defers destruction to its next frame. Detach the old canvas now
        // so restart never stacks canvases, including while the window is blurred.
        previous.destroy(true);
        previous.canvas?.remove();
        previous.loop.wake();
      }
      game.current = null; scene.current = null;
    };
  }, [activeRound, run]);

  useEffect(() => { if (status.over) result.current?.focus({ preventScroll: true }); }, [status.over]);

  function begin(index: number) {
    setRoundIndex(index); setRun(n => n + 1); setPaused(false); setError(false); setLoading(true);
    setStatus({ score: 0, seconds: olympiaRounds[index].rules.durationSec, target: olympiaRounds[index].rules.targetScore, over: false });
  }
  function togglePause() {
    if (!scene.current) return;
    if (paused) { scene.current.scene.resume(); mount.current?.focus({ preventScroll: true }); }
    else scene.current.scene.pause();
    setPaused(!paused);
  }
  return <main className={styles.page}>
    <a className={styles.skip} href="#game-content">Skip to game</a>
    <div className={styles.shell}>
      <header className={styles.header}><Link href="/olympia" aria-label="Olympia menu"><Image src="/assets/olympia/logo.png" alt="Olympia Deli & Juice Bar" width={62} height={62} priority /></Link><span>Unpublished concept</span><Link href="/olympia#deli">Menu <span aria-hidden="true">↗</span></Link></header>
      <section id="game-content" className={styles.content} aria-labelledby="game-title">
        <p className={styles.eyebrow}>Olympia Deli &amp; Juice Bar</p><h1 id="game-title">Juice <em>Rush.</em></h1>
        {activeRound ? <>
          <div className={styles.tools}><strong>Round {activeRound.levelNumber}</strong><button type="button" onClick={() => setRoundIndex(null)}>Choose round</button><button type="button" disabled={loading || error || status.over} onClick={togglePause}>{paused ? "Resume" : "Pause"}</button><button type="button" onClick={() => begin(roundIndex!)}>Restart</button></div>
          <div className={styles.hud} aria-label="Round score and time"><span>Score <strong>{status.score}</strong></span><span>Target <strong>{status.target}</strong></span><span>Time <strong>{status.seconds}s</strong></span></div>
          <p id="instructions" className={styles.instructions}>Tap juice &amp; citrus. Skip brown spills. Keyboard: arrows to choose, Space or Enter to catch.</p>
          <div className={styles.stage}>
            <div className={styles.canvas} ref={mount} tabIndex={0} role="application" aria-label="Juice Rush play area" aria-describedby="instructions" onKeyDown={event => {
              if (["ArrowLeft", "ArrowRight", " ", "Enter"].includes(event.key)) { event.preventDefault(); if (!paused) scene.current?.handleKey(event.key); }
            }} />
            {loading && <div className={styles.overlay} role="status">Loading game…</div>}
            {error && <div className={styles.overlay} role="alert"><h2>Game could not load.</h2><button type="button" onClick={() => begin(roundIndex!)}>Try again</button><Link href="/olympia">Back to menu</Link></div>}
            {paused && !status.over && <div className={styles.overlay}><h2>Paused</h2><button type="button" onClick={togglePause}>Resume game</button></div>}
            {status.over && <div className={styles.overlay}><h2 ref={result} tabIndex={-1}>{status.score >= status.target ? "Fresh finish!" : "Keep it fresh."}</h2><p>{status.score} points · Target {status.target}</p><button type="button" onClick={() => begin(roundIndex!)}>Play again</button>{roundIndex! < olympiaRounds.length - 1 && <button type="button" onClick={() => begin(roundIndex! + 1)}>Next round</button>}<Link href="/olympia#deli">Back to menu</Link></div>}
          </div>
          <p className={styles.announcement} aria-live="polite">{error ? "Game loading failed. Try again." : status.over ? `Round complete. ${status.score} points.` : paused ? "Game paused." : loading ? "Loading game." : `Playing round ${activeRound.levelNumber}.`}</p>
        </> : <>
          <p className={styles.lead}>Catch juice. Skip spills.</p>
          <p className={styles.instructions}>Tap to catch. Arrow keys to choose, Space or Enter to catch. Three rounds, each a little faster.</p>
          <div className={styles.rounds}>{olympiaRounds.map((round, index) => <button type="button" key={round.id} onClick={() => begin(index)}><span className={styles.eyebrow}>Round {round.levelNumber} · {round.rules.durationSec}s</span><strong>{round.levelName}</strong><span>Target {round.rules.targetScore} points <span aria-hidden="true">↗</span></span></button>)}</div>
        </>}
        <footer className={styles.footer}>Just for fun · No rewards or ordering<br />Illustrative game items · Pending owner approval</footer>
      </section>
    </div>
  </main>;
}
