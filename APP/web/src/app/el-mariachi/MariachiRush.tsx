"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Pause, Volume2, VolumeX } from "lucide-react";
import { ElMariachiNav } from "./ElMariachiNav";
import { MariachiAudio } from "./rhythm-audio";
import { BEATS, BEAT_COUNT, FIRST_BEAT_MS, ROUND_MS, MariachiRound, beatCue, initialView, type RoundView } from "./rhythm-engine";
import styles from "./game.module.css";

function Rosette() {
  return <svg className={styles.rosette} viewBox="0 0 400 400" fill="none" aria-hidden="true">
    <circle cx="200" cy="200" r="112" stroke="currentColor" strokeWidth="1" />
    <circle cx="200" cy="200" r="104" stroke="currentColor" strokeWidth="2" />
    {Array.from({ length: 24 }, (_, index) => <path key={index} d="M200 88l4 9-4 7-4-7z" fill="currentColor" transform={`rotate(${index * 15} 200 200)`} />)}
    {[184, 190, 196, 204, 210, 216].map(x => <path key={x} d={`M${x} 24v60M${x} 316v60`} stroke="currentColor" strokeWidth="1" opacity=".5" />)}
    <path d="M175 38h50M175 61h50M175 339h50M175 362h50" stroke="currentColor" strokeWidth="2" opacity=".45" />
  </svg>;
}

export default function MariachiRush({ locationSlug, locationName, orderUrl }: { locationSlug: string; locationName: string; orderUrl: string }) {
  const [view, setView] = useState<RoundView>(initialView);
  const [sound, setSound] = useState(false);
  const round = useRef(new MariachiRound());
  const audio = useRef<MariachiAudio | null>(null);
  const soundEnabled = useRef(false);
  const nextAudioBeat = useRef(0);
  const visual = useRef({ view: initialView(), reducedMotion: false });
  const cueRing = useRef<SVGCircleElement>(null);
  const cueFill = useRef<SVGCircleElement>(null);
  const targetRing = useRef<SVGCircleElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const renderer = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLButtonElement>(null);
  const resultTitle = useRef<HTMLHeadingElement>(null);

  const publish = useCallback((now: number) => {
    const current = round.current.view(now);
    visual.current.view = current;
    setView(current);
  }, []);

  const alignAudio = useCallback((elapsed: number) => {
    const next = BEATS.findIndex(at => at >= elapsed);
    nextAudioBeat.current = next === -1 ? BEATS.length : next;
  }, []);

  const playAudio = useCallback(() => {
    if (!soundEnabled.current) return;
    if (!audio.current) audio.current = new MariachiAudio();
    audio.current.unlock();
  }, []);

  const start = useCallback(() => {
    const now = performance.now();
    round.current.start(now);
    nextAudioBeat.current = 0;
    audio.current?.pause();
    playAudio();
    publish(now);
    target.current?.focus({ preventScroll: true });
  }, [playAudio, publish]);

  const pause = useCallback(() => {
    if (round.current.mode !== "running") return;
    const now = performance.now();
    round.current.pause(now);
    audio.current?.pause();
    publish(now);
  }, [publish]);

  const resume = useCallback(() => {
    if (document.hidden || round.current.mode !== "paused") return;
    const now = performance.now();
    round.current.resume(now);
    alignAudio(round.current.elapsed(now));
    playAudio();
    publish(now);
    target.current?.focus({ preventScroll: true });
  }, [alignAudio, playAudio, publish]);

  const activate = useCallback(() => {
    if (round.current.mode === "ready" || round.current.mode === "result") { start(); return; }
    if (round.current.mode === "paused") { resume(); return; }
    const now = performance.now();
    round.current.tap(now);
    publish(now);
  }, [publish, resume, start]);

  const toggleSound = () => {
    const enabled = !soundEnabled.current;
    soundEnabled.current = enabled;
    setSound(enabled);
    if (!enabled) audio.current?.pause();
    else if (round.current.mode === "running") {
      alignAudio(round.current.elapsed(performance.now()));
      playAudio();
    }
    if (round.current.mode === "running") target.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    let frame = 0;
    let lastPublish = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setMotion = () => { visual.current.reducedMotion = reduced.matches; };
    setMotion();
    reduced.addEventListener("change", setMotion);

    const tick = (now: number) => {
      const previousMode = round.current.mode;
      round.current.step(now);
      const current = round.current.view(now);
      visual.current.view = current;
      if (previousMode === "running" && current.mode === "result") audio.current?.pause();

      if (current.mode === "running" && soundEnabled.current) {
        while (nextAudioBeat.current < BEATS.length) {
          const index = nextAudioBeat.current;
          const delay = BEATS[index] - current.elapsed;
          if (delay > 110) break;
          if (delay >= -45 && !audio.current?.scheduleBeat(index, delay)) break;
          nextAudioBeat.current += 1;
        }
      }

      const cue = beatCue(current.elapsed);
      const playing = current.mode === "running";
      const hasCue = playing && cue.visible;
      if (cueRing.current) {
        cueRing.current.setAttribute("r", String(visual.current.reducedMotion ? 90 : cue.radius));
        cueRing.current.setAttribute("opacity", hasCue && !visual.current.reducedMotion ? "1" : "0");
      }
      if (cueFill.current) {
        // A stationary filling ring offers the same timing without radial movement.
        cueFill.current.setAttribute("stroke-dasharray", `${cue.progress * 565.49} 565.49`);
        cueFill.current.setAttribute("opacity", hasCue && visual.current.reducedMotion ? "1" : "0");
      }
      targetRing.current?.setAttribute("stroke-width", hasCue && cue.onBeat ? "5" : "2");
      stage.current?.setAttribute("data-beat", hasCue && cue.onBeat ? "true" : "false");
      if ((current.mode === "running" && now - lastPublish >= 90) || previousMode !== current.mode) {
        setView(current);
        lastPublish = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const hidden = () => { if (document.hidden) pause(); };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && round.current.mode === "running") { event.preventDefault(); pause(); }
    };
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("blur", pause);
    window.addEventListener("pagehide", pause);
    window.addEventListener("keydown", escape);
    return () => {
      cancelAnimationFrame(frame);
      reduced.removeEventListener("change", setMotion);
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("blur", pause);
      window.removeEventListener("pagehide", pause);
      window.removeEventListener("keydown", escape);
      audio.current?.dispose();
      audio.current = null;
    };
  }, [pause]);

  useEffect(() => {
    const host = renderer.current;
    if (!host) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    // Import only in the browser; gameplay starts immediately with SVG primitives.
    void import("./rhythm-renderer").then(({ mountRhythmScene }) => {
      if (!cancelled) dispose = mountRhythmScene(host, () => visual.current);
    }).catch(() => { /* The complete primitive game remains available. */ });
    return () => { cancelled = true; dispose?.(); };
  }, []);

  useEffect(() => {
    if (view.mode === "result") {
      audio.current?.pause();
      resultTitle.current?.focus({ preventScroll: true });
    } else if (view.mode === "paused" || view.mode === "running") target.current?.focus({ preventScroll: true });
  }, [view.mode]);

  const pointer = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    activate();
  };
  const key = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    if (!event.repeat) activate();
  };
  const playing = view.mode === "running";
  const seconds = Math.max(0, Math.ceil((ROUND_MS - view.elapsed) / 1000));
  const hits = view.perfect + view.good;
  const accuracy = Math.round(hits / (BEAT_COUNT + view.offbeat) * 100);
  const freshFeedback = view.elapsed - view.feedbackAt < 430;
  const feedback = view.mode === "ready" ? "One thumb. All rhythm." : view.mode === "paused" ? "Your rhythm can wait." : view.elapsed < FIRST_BEAT_MS - 300 ? "Find the gold ring…" : freshFeedback ? view.feedback : "Follow the ring";
  const targetLabel = view.mode === "ready" ? "Let’s play" : view.mode === "paused" ? "Resume" : "Tap";

  const menuHref = `/el-mariachi?location=${encodeURIComponent(locationSlug)}#menu`;

  return <main className={styles.game} id="main-content">
    <a className={styles.skipLink} href="#rhythm-game">Skip to game</a>
    <header className={styles.header}>
      <Link href={menuHref} className={styles.brand} aria-label="El Mariachi menu">
        <Image src="/assets/el-mariachi/official-logo.png" alt="El Mariachi" width={98} height={98} sizes="98px" className={styles.logo} priority />
      </Link>
      <span className={styles.concept}>Independent concept</span>
      <ElMariachiNav active="play" menuHref={menuHref} playHref={`/el-mariachi/play?location=${encodeURIComponent(locationSlug)}`} orderUrl={orderUrl} locationName={locationName} />
    </header>

    <div className={styles.gameLayout}>
      <section className={styles.intro} aria-labelledby="rush-title">
        <p className={styles.eyebrow}>A little rhythm before your next bite</p>
        <h1 id="rush-title" translate="no">Mariachi <span>Rush.</span></h1>
        <p className={styles.lead}>Catch the beat.<br /> Keep the fiesta going.</p>
        <p className={styles.instructions} id="rhythm-help">Tap the center when the gold ring meets the circle. One thumb, 30 seconds. Sound is optional.</p>
        <p className={styles.keyboard}>Keyboard: <kbd>Space</kbd> or <kbd>Enter</kbd> to tap. <kbd>Esc</kbd> to pause.</p>
      </section>

      <section className={styles.playArea} id="rhythm-game" tabIndex={-1} aria-label="Mariachi Rush rhythm game">
        <div className={styles.scoreboard} aria-label="Round status">
          <div><span>Score</span><strong>{view.score.toLocaleString("en-US")}</strong></div>
          <div className={styles.clock}><span>Time</span><strong>{seconds}<small>s</small></strong></div>
          <div><span>Streak</span><strong>{view.streak}<small>×</small></strong></div>
        </div>

        <div className={styles.instrument} data-mode={view.mode}>
          <p className={styles.feedback} aria-hidden="true">{view.mode === "result" ? "¡Bravo!" : feedback}</p>
          <div className={styles.stage} ref={stage}>
            <Rosette />
            <div className={styles.renderer} ref={renderer} aria-hidden="true" />
            <svg className={styles.cues} viewBox="0 0 400 400" fill="none" aria-hidden="true">
              <circle ref={targetRing} cx="200" cy="200" r="90" stroke="#fff5d9" strokeWidth="2" opacity=".7" />
              <circle ref={cueRing} cx="200" cy="200" r="174" stroke="#f2ba45" strokeWidth="5" opacity="0" />
              <circle ref={cueFill} cx="200" cy="200" r="90" stroke="#f2ba45" strokeWidth="7" strokeLinecap="round" transform="rotate(-90 200 200)" opacity="0" />
            </svg>
            {view.mode !== "result" && <button
              ref={target}
              type="button"
              className={styles.target}
              onPointerDown={pointer}
              onKeyDown={key}
              onClick={event => { if (event.detail === 0) activate(); }}
              aria-label={view.mode === "ready" ? "Start a 30-second Mariachi Rush round" : view.mode === "paused" ? "Resume round" : "Tap the beat"}
              aria-describedby="rhythm-help"
            ><span className={styles.targetOrnament} aria-hidden="true">✦</span><span>{targetLabel}</span>{view.mode === "ready" && <small>30 seconds</small>}</button>}
            {view.mode === "result" && <section className={styles.result} aria-labelledby="rush-result-title">
              <h2 ref={resultTitle} tabIndex={-1} id="rush-result-title">{accuracy >= 85 ? "You’ve got rhythm." : accuracy >= 50 ? "Fiesta found." : "Every beat’s a new start."}</h2>
              <strong className={styles.finalScore}>{view.score.toLocaleString("en-US")}<small>points</small></strong>
              <button className={styles.replay} type="button" onClick={start}>Play again <span aria-hidden="true">↗</span></button>
            </section>}
          </div>
          <p className={styles.stageNote}>{view.mode === "ready" ? "Press Let’s play to begin" : view.mode === "paused" ? "Paused · the clock and sound are stopped" : view.mode === "result" ? `${hits} of ${BEAT_COUNT} beats caught` : view.elapsed < FIRST_BEAT_MS ? "A moment to find the beat" : "Gold meets ivory. That’s your beat."}</p>
        </div>

        {view.mode === "result" && <dl className={styles.resultsStats}>
          <div><dt>Beat accuracy</dt><dd>{accuracy}%</dd></div>
          <div><dt>Perfect beats</dt><dd>{view.perfect}</dd></div>
          <div><dt>Best streak</dt><dd>{view.bestStreak}</dd></div>
        </dl>}

        <div className={styles.controls}>
          <button type="button" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? "Turn sound off" : "Turn sound on"}>{sound ? <Volume2 size={19} aria-hidden="true" /> : <VolumeX size={19} aria-hidden="true" />} Sound {sound ? "on" : "off"}</button>
          {playing && <button type="button" onClick={pause}><Pause size={17} aria-hidden="true" /> Pause</button>}
          {view.mode === "paused" && <button type="button" onClick={start}>Restart round</button>}
          {view.mode === "result" && <Link href={menuHref}>Back to menu <span aria-hidden="true">↗</span></Link>}
        </div>
        <p className={styles.audioNote}>Original instrumental beat. No sign-up. Just for fun.</p>
        <details className={styles.rules}>
          <summary>How the rhythm works</summary>
          <p>There are 47 beats. Tap within 160 milliseconds of a beat for 60 points; within 75 milliseconds for a perfect 100. Missed beats and offbeat taps break your streak. Extra taps lower beat accuracy. The first moments are a free count-in.</p>
          <p>With reduced motion enabled, the gold ring fills in place. Tap when it is full. This concept game offers no prizes or discounts.</p>
        </details>
      </section>
    </div>
    <p className={styles.srOnly} role="status" aria-live="polite">{view.mode === "ready" ? "Mariachi Rush is ready. Start a 30-second round." : view.mode === "paused" ? "Round paused. Choose Resume to continue." : view.mode === "result" ? `Round complete. ${view.score} points. ${hits} of ${BEAT_COUNT} beats caught. ${accuracy} percent beat accuracy.` : "Round started. Focus is on the tap button. Press Space or Enter to tap, Escape to pause."}</p>
  </main>;
}
