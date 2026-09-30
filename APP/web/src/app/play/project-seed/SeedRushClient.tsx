"use client";

import { useEffect, useRef, useState } from "react";
import type { Game } from "phaser";
import type { CafeRushStatus } from "@/caferush/types";
import { gameFeatures, seedMenuItemHref } from "@/app/(internal)/demo/project-seed/menu-data";
import { seedRounds, seedSkinForRound } from "./config";
import styles from "./page.module.css";

type View = "intro" | "playing" | "won" | "lost" | "complete";
const BEST_KEY = "project-seed-rush-best-v1";

export default function SeedRushClient() {
  const [view, setView] = useState<View>("intro");
  const [selected, setSelected] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundKey, setRoundKey] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState<CafeRushStatus>({ score: 0, seconds: seedRounds[0].rules.durationSec, target: seedRounds[0].rules.targetScore, over: false });
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const mount = useRef<HTMLDivElement>(null);
  const game = useRef<Game | null>(null);
  const aswangCaught = useRef(false);
  const round = seedRounds[roundIndex];
  const feature = gameFeatures[roundIndex];

  useEffect(() => {
    try { setBest(Number(window.localStorage.getItem(BEST_KEY) || "0") || 0); } catch { /* Private storage can be disabled. */ }
  }, []);

  useEffect(() => {
    if (view !== "playing" || !mount.current) return;
    let cancelled = false;
    const start = async () => {
      const [{ default: Phaser }, { CafeRushScene }] = await Promise.all([import("phaser"), import("@/caferush/CafeRushScene")]);
      if (cancelled || !mount.current) return;
      class SeedScene extends CafeRushScene {
        create() {
          this.events.on("cafe-catch", (id: string) => { if (id === "aswang") aswangCaught.current = true; });
          this.events.on("cafe-status", (next: CafeRushStatus) => { if (!cancelled) setStatus(next); });
          super.create();
          if (!cancelled) setLoading(false);
        }
      }
      game.current = new Phaser.Game({
        type: Phaser.CANVAS,
        parent: mount.current,
        width: mount.current.clientWidth || 390,
        height: mount.current.clientHeight || 550,
        backgroundColor: "#f4e8d6",
        scene: [new SeedScene(round, seedSkinForRound(roundIndex), { externalHud: true, catchLight: true, separateSpawns: true, itemScale: 1.25, reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches })],
        audio: { noAudio: true },
        scale: { mode: Phaser.Scale.RESIZE },
      });
      game.current.canvas.setAttribute("aria-label", `Seed Rush round ${roundIndex + 1}: ${round.levelName}. Tap the drinks; avoid the aswang. Arrow keys choose an item, Space or Enter collects it.`);
      mount.current.focus({ preventScroll: true });
    };
    void start().catch(() => { if (!cancelled) { setLoadError(true); setLoading(false); } });
    const pauseOnHide = () => {
      if (!document.hidden) return;
      game.current?.scene.getScenes(false).forEach((scene) => scene.scene.pause());
      setPaused(true);
    };
    document.addEventListener("visibilitychange", pauseOnHide);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", pauseOnHide);
      game.current?.destroy(true); game.current = null;
    };
  }, [view, round, roundIndex, roundKey]);

  useEffect(() => {
    if (view !== "playing" || !status.over) return;
    if (aswangCaught.current || status.score < round.rules.targetScore) {
      setView("lost");
      return;
    }
    const nextTotal = totalScore + status.score;
    setTotalScore(nextTotal);
    setCompleted(roundIndex + 1);
    if (roundIndex === seedRounds.length - 1) {
      if (nextTotal > best) {
        setBest(nextTotal);
        try { window.localStorage.setItem(BEST_KEY, String(nextTotal)); } catch { /* Run remains playable. */ }
      }
      setView("complete");
    } else setView("won");
  }, [view, status, round, roundIndex, totalScore, best]);

  function begin(index = roundIndex, reset = false) {
    if (reset) { setTotalScore(0); setCompleted(0); }
    setRoundIndex(index);
    setStatus({ score: 0, seconds: seedRounds[index].rules.durationSec, target: seedRounds[index].rules.targetScore, over: false });
    aswangCaught.current = false;
    setPaused(false); setLoadError(false); setLoading(true);
    setRoundKey((value) => value + 1);
    setView("playing");
  }

  function togglePause() {
    const next = !paused;
    game.current?.scene.getScenes(false).forEach((scene) => next ? scene.scene.pause() : scene.scene.resume());
    setPaused(next);
    if (!next) mount.current?.focus({ preventScroll: true });
  }

  const progress = <div className={styles.progress} aria-label={`${completed} of 3 rounds complete`}>{seedRounds.map((entry, index) => <span key={entry.id} className={index < completed ? styles.grown : ""} aria-hidden="true">{index < completed ? "✳" : "●"}</span>)}</div>;

  return <main className={styles.page}>
    <a className={styles.skip} href="#game-content">Skip to game content</a>
    <header className={styles.header}><a href="/project-seed/menu" className={styles.brand}>PROJECT <span>SEED</span><small>Concept preview</small></a><a href="/project-seed/menu">Browse menu ↗</a></header>
    <div className={styles.shell} id="game-content">
      {view === "intro" ? <section className={styles.intro} aria-labelledby="game-title">
        <p className={styles.eyebrow}>Three drinks · Three quick rounds</p>
        <h1 id="game-title">SEED<br /><span>RUSH</span></h1>
        <p className={styles.introLead}>Tap the drinks. Let the aswang pass. Grow a little flavor collection while you wait.</p>
        <div className={styles.featurePicker} aria-label="Featured drinks">{gameFeatures.map((entry, index) => <button type="button" key={entry.id} onClick={() => setSelected(index)} aria-pressed={selected === index}><span className={styles.featureNumber}>0{index + 1}</span><strong>{entry.name}</strong><small>{entry.group}</small></button>)}</div>
        <p className={styles.selectedNote}>{gameFeatures[selected].note} <a href={seedMenuItemHref(gameFeatures[selected].id)}>See it on the menu ↗</a></p>
        <div className={styles.instructions}><span aria-hidden="true" className={`${styles.demoCup} ${selected === 1 ? styles.demoPandan : ""}`}>▣</span><span>Drinks · +10</span><span aria-hidden="true" className={styles.demoAswang} /><span>Aswang · avoid</span></div>
        <p className={styles.folklore}><span>Tabi-tabi po.</span> A respectful request for passage in Filipino folk tradition.</p>
        <button type="button" className={styles.primary} onClick={() => begin(0, true)}>Start Seed Rush <span aria-hidden="true">→</span></button>
        <p className={styles.fine}>No sign-up, reward, or purchase required. Arrow keys select a cup; Space or Enter collects it. Personal best: {best}.</p>
      </section> : null}

      {view === "playing" ? <section className={styles.playing} aria-labelledby="round-title">
        <div className={styles.roundHead}><div><p className={styles.eyebrow}>Round {roundIndex + 1} / 3 · {feature.name}</p><h1 id="round-title">{round.levelName}</h1></div>{progress}</div>
        <p className={styles.roundHelp}>Catch the drinks. Avoid the aswang. Reach {round.rules.targetScore} points in {round.rules.durationSec} seconds.</p>
        <div className={styles.hud}><span>Score <strong>{status.score}</strong></span><span>Target <strong>{status.target}</strong></span><span>Time <strong>{status.seconds}s</strong></span></div>
        <div className={styles.playfieldWrap}>
          <div ref={mount} className={styles.playfield} tabIndex={0} role="application" aria-label="Seed Rush playfield" onKeyDown={(event) => { if (["ArrowLeft", "ArrowRight", " ", "Enter"].includes(event.key)) { event.preventDefault(); game.current?.scene.getScenes(true).forEach((scene) => (scene as import("@/caferush/CafeRushScene").CafeRushScene).handleKey(event.key)); } }} />
          {loading ? <div className={styles.overlay}>Preparing cups…</div> : null}
          {paused ? <div className={styles.overlay}>Paused</div> : null}
          {loadError ? <div className={styles.overlay}><p>Game could not load.</p><button onClick={() => begin(roundIndex)} type="button">Try again</button><a href="/project-seed/menu">Browse menu</a></div> : null}
        </div>
        <div className={styles.controls}><button type="button" onClick={togglePause} disabled={loading || loadError}>{paused ? "Resume" : "Pause"}</button><button type="button" onClick={() => setView("intro")}>Exit game</button></div>
      </section> : null}

      {view === "won" || view === "lost" || view === "complete" ? <section className={styles.result} aria-live="polite">
        {progress}<p className={styles.eyebrow}>{view === "complete" ? "Collection complete" : `Round ${roundIndex + 1} / 3`}</p>
        <h1>{view === "complete" ? "GROWN." : view === "won" ? "NICE CATCH." : "TRY AGAIN."}</h1>
        <p>{view === "lost" ? aswangCaught.current ? "An aswang ended this round. Let it pass next time." : `You scored ${status.score} of ${status.target}. Try this round again.` : view === "complete" ? `You finished all three rounds with ${totalScore} points. Personal best: ${best}.` : `You scored ${status.score} points. Next up: ${gameFeatures[roundIndex + 1].name}.`}</p>
        <div className={styles.resultActions}>
          {view === "lost" ? <button type="button" className={styles.primary} onClick={() => begin(roundIndex)}>Retry this round →</button> : null}
          {view === "won" ? <button type="button" className={styles.primary} onClick={() => begin(roundIndex + 1)}>Next round →</button> : null}
          {view === "complete" ? <button type="button" className={styles.primary} onClick={() => begin(0, true)}>Play again →</button> : null}
          <a href={seedMenuItemHref(feature.id)}>See {feature.name} on the menu ↗</a>
          <a href="/project-seed/menu">Browse all drinks ↗</a>
        </div>
      </section> : null}
      <footer className={styles.footer}>Fina Calle concept preview · Pending Project Seed approval · No discount or reward is offered.</footer>
    </div>
  </main>;
}
