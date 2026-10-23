"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw } from "lucide-react";
import { ElMariachiNav } from "./ElMariachiNav";
import { CourtyardRound, GROWTH, WORLD_HEIGHT, WORLD_WIDTH, createHoleState, type HoleInput } from "./hole-engine";
import { drawCourtyard } from "./hole-drawing";
import styles from "./game.module.css";

const DIRECTIONS = {
  up: { x: 0, y: -1, Icon: ArrowUp },
  left: { x: -1, y: 0, Icon: ArrowLeft },
  down: { x: 0, y: 1, Icon: ArrowDown },
  right: { x: 1, y: 0, Icon: ArrowRight },
};
type Direction = keyof typeof DIRECTIONS;
const MOVEMENT: Record<string, HoleInput> = {
  ArrowUp: DIRECTIONS.up, ArrowDown: DIRECTIONS.down, ArrowLeft: DIRECTIONS.left, ArrowRight: DIRECTIONS.right,
  w: DIRECTIONS.up, s: DIRECTIONS.down, a: DIRECTIONS.left, d: DIRECTIONS.right,
};

export default function CourtyardSweep({ locationSlug, locationName, orderUrl }: { locationSlug: string; locationName: string; orderUrl: string }) {
  const [view, setView] = useState(createHoleState);
  const [enhanced, setEnhanced] = useState(false);
  const round = useRef(new CourtyardRound());
  const board = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<HTMLDivElement>(null);
  const overlayTitle = useRef<HTMLHeadingElement>(null);
  const stick = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);
  const enhancedReady = useRef(false);
  const keys = useRef(new Set<string>());
  const pointer = useRef<{ id: number; originX: number; originY: number; x: number; y: number } | null>(null);
  const held = useRef<Direction | null>(null);
  const nudge = useRef<{ direction: Direction; until: number } | null>(null);

  const clearInput = useCallback(() => {
    keys.current.clear();
    pointer.current = null;
    held.current = null;
    nudge.current = null;
    if (stick.current) stick.current.style.opacity = "0";
  }, []);
  const publish = useCallback(() => { setView({ ...round.current.state }); }, []);
  const start = useCallback(() => {
    clearInput();
    round.current.start(performance.now());
    publish();
    board.current?.focus({ preventScroll: true });
  }, [clearInput, publish]);
  const pause = useCallback(() => {
    clearInput();
    round.current.pause(performance.now());
    publish();
  }, [clearInput, publish]);
  const resume = useCallback(() => {
    if (document.hidden) return;
    clearInput();
    round.current.resume(performance.now());
    publish();
    board.current?.focus({ preventScroll: true });
  }, [clearInput, publish]);

  useEffect(() => {
    let frame = 0;
    let lastHud = 0;
    let lastDraw = -1000;
    let previousDrawMode = "";
    const context = canvas.current?.getContext("2d");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => { reducedMotion.current = media.matches; lastDraw = -1000; };
    updateMotion();
    media.addEventListener("change", updateMotion);
    const tick = (now: number) => {
      const input = { x: 0, y: 0 };
      if (held.current) Object.assign(input, DIRECTIONS[held.current]);
      else if (keys.current.size) keys.current.forEach(key => { const direction = MOVEMENT[key]; if (direction) { input.x += direction.x; input.y += direction.y; } });
      else if (pointer.current) { input.x = pointer.current.x; input.y = pointer.current.y; }
      else if (nudge.current && now < nudge.current.until) Object.assign(input, DIRECTIONS[nudge.current.direction]);
      const before = round.current.state.mode;
      round.current.step(now, input);
      const state = round.current.state;
      if (before !== state.mode) { clearInput(); publish(); }
      else if (state.mode === "running" && now - lastHud >= 100) { publish(); lastHud = now; }
      if (context && !enhancedReady.current && (state.mode === "running" ? now - lastDraw >= 32 : previousDrawMode !== state.mode || lastDraw === -1000)) {
        context.setTransform(2, 0, 0, 2, 0, 0);
        drawCourtyard(context, state, reducedMotion.current);
        lastDraw = now;
        previousDrawMode = state.mode;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && round.current.state.mode === "running") { event.preventDefault(); pause(); return; }
      if (round.current.state.mode !== "running" || document.activeElement !== board.current) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (MOVEMENT[key]) { event.preventDefault(); keys.current.add(key); }
    };
    const keyUp = (event: KeyboardEvent) => { keys.current.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key); };
    const background = () => { if (document.hidden && round.current.state.mode === "running") pause(); };
    const blur = () => { if (round.current.state.mode === "running") pause(); else clearInput(); };
    const releasePointer = () => { pointer.current = null; held.current = null; if (stick.current) stick.current.style.opacity = "0"; };
    document.addEventListener("visibilitychange", background);
    window.addEventListener("blur", blur);
    window.addEventListener("pagehide", blur);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("pointerup", releasePointer);
    window.addEventListener("pointercancel", releasePointer);
    return () => {
      cancelAnimationFrame(frame);
      clearInput();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", background);
      window.removeEventListener("blur", blur);
      window.removeEventListener("pagehide", blur);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", releasePointer);
    };
  }, [clearInput, pause, publish]);

  useEffect(() => {
    const host = renderer.current;
    if (!host) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const fallback = () => {
      if (cancelled) return;
      enhancedReady.current = false;
      setEnhanced(false);
      const context = canvas.current?.getContext("2d");
      if (context) { context.setTransform(2, 0, 0, 2, 0, 0); drawCourtyard(context, round.current.state, reducedMotion.current); }
    };
    // Graphics loading never gates input or the original Canvas2D game.
    void import("./hole-renderer").then(({ mountCourtyard }) => {
      if (cancelled) return;
      dispose = mountCourtyard(host, () => ({ state: round.current.state, reducedMotion: reducedMotion.current }), () => {
        if (!cancelled) { enhancedReady.current = true; setEnhanced(true); }
      }, fallback);
    }).catch(fallback);
    return () => { cancelled = true; enhancedReady.current = false; dispose?.(); };
  }, []);

  useEffect(() => {
    if (view.mode === "paused" || view.mode === "result") overlayTitle.current?.focus({ preventScroll: true });
    else if (view.mode === "running") board.current?.focus({ preventScroll: true });
  }, [view.mode]);

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (round.current.state.mode !== "running" || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    clearInput();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    pointer.current = { id: event.pointerId, originX: event.clientX, originY: event.clientY, x: 0, y: 0 };
    if (stick.current) {
      const bounds = event.currentTarget.getBoundingClientRect();
      stick.current.style.left = `${event.clientX - bounds.left}px`;
      stick.current.style.top = `${event.clientY - bounds.top}px`;
      stick.current.style.opacity = "1";
    }
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const active = pointer.current;
    if (!active || active.id !== event.pointerId) return;
    active.x = (event.clientX - active.originX) / 48;
    active.y = (event.clientY - active.originY) / 48;
  };
  const playing = view.mode === "running";
  const growth = GROWTH[view.tier - 1];
  const nextGrowth = GROWTH[view.tier];
  const progress = nextGrowth ? Math.min(100, (view.mass - growth.mass) / (nextGrowth.mass - growth.mass) * 100) : 100;
  const menuHref = `/el-mariachi?location=${encodeURIComponent(locationSlug)}#menu`;
  const resultHeading = view.cleared ? "Courtyard cleared!" : view.tier === 5 ? "A huge appetite." : view.tier >= 3 ? "Room for more?" : "A tasty start.";
  const liveStatus = view.mode === "result" ? `${resultHeading} ${view.score} points. ${view.collected} of ${view.total} objects swallowed. Final size ${view.tier} of 5.` : view.mode === "paused" ? "Game paused. The clock is stopped. Choose Resume to continue." : view.mode === "running" ? `Size ${view.tier} of 5. You can now swallow ${growth.eats.toLowerCase()}.` : "Courtyard Sweep is ready. Start a 55-second round.";

  return <main className={styles.game} id="main-content">
    <a className={styles.skipLink} href="#courtyard-game">Skip to game</a>
    <header className={styles.header}>
      <Link href={menuHref} className={styles.brand} aria-label="El Mariachi menu"><Image src="/assets/el-mariachi/official-logo.png" alt="El Mariachi" width={82} height={82} sizes="82px" priority /></Link>
      <span className={styles.concept}>Independent concept</span>
      <ElMariachiNav active="play" menuHref={menuHref} playHref={`/el-mariachi/play?location=${encodeURIComponent(locationSlug)}`} orderUrl={orderUrl} locationName={locationName} />
    </header>
    <div className={styles.layout}>
      <section className={styles.intro} aria-labelledby="courtyard-title">
        <p className={styles.eyebrow}>El Mariachi / a little play before your plate</p>
        <h1 id="courtyard-title">Courtyard<br /><span>Sweep.</span></h1>
        <p className={styles.lead}>Small hole.<br />Big appetite.</p>
        <p className={styles.instructions} id="courtyard-help">Drag anywhere on the courtyard to steer. Swallow the small things, grow your opening, and come back for the big ones.</p>
        <div className={styles.howTo}><span><b>Start small</b>Limes and chiles</span><span><b>Grow bigger</b>Cups, tacos, planters</span><span><b>Go all in</b>Chairs and tables</span></div>
        <p className={styles.keyboard}>Arrows or WASD move. Esc pauses. Direction buttons work too.</p>
        <p className={styles.justForFun}>55 seconds. Just for fun. No prizes or discounts.</p>
      </section>

      <section className={styles.playArea} id="courtyard-game" tabIndex={-1} aria-label="Courtyard Sweep game">
        <div className={styles.scoreboard}>
          <div><span>Score</span><strong>{view.score.toLocaleString("en-US")}</strong></div>
          <div><span>Time</span><strong>{Math.ceil(view.remaining)}<small>s</small></strong></div>
          <div><span>Swallowed</span><strong>{view.collected}<small>/{view.total}</small></strong></div>
        </div>
        <div className={styles.growth}>
          <div><strong>Size {view.tier} <span>/ 5</span></strong><span>{nextGrowth ? `Next: ${nextGrowth.eats.toLowerCase()}` : "Everything fits"}</span></div>
          <progress max={100} value={progress} aria-label={nextGrowth ? `Growth toward size ${view.tier + 1}` : "Maximum size reached"} />
        </div>
        <div
          ref={board} className={styles.board} data-playing={playing} tabIndex={playing ? 0 : -1}
          role="group" aria-label="Courtyard play area. Drag to steer, or use arrow keys and WASD." aria-describedby="courtyard-help"
          onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={clearInput} onPointerCancel={clearInput} onLostPointerCapture={clearInput}
          onBlur={() => { keys.current.clear(); }}
        >
          <canvas ref={canvas} className={styles.fallback} width={WORLD_WIDTH * 2} height={WORLD_HEIGHT * 2} aria-hidden="true" style={{ visibility: enhanced ? "hidden" : "visible" }} />
          <div ref={renderer} className={styles.renderer} aria-hidden="true" style={{ visibility: enhanced ? "visible" : "hidden" }} />
          <div ref={stick} className={styles.stick} aria-hidden="true"><span /></div>
          {view.mode !== "running" && <section className={styles.overlay} aria-labelledby="round-title">
            {view.mode === "ready" && <>
              <p className={styles.overlayKicker}>Your courtyard. Your appetite.</p>
              <h2 id="round-title">Swallow.<br />Grow. Repeat.</h2>
              <p>Guide the dark opening beneath the gold-ringed objects. Bigger things fit as you grow.</p>
              <button className={styles.primary} type="button" onClick={start}><Play size={18} aria-hidden="true" /> Start 55-second round</button>
              <small>Drag to steer or use the direction buttons.</small>
            </>}
            {view.mode === "paused" && <>
              <p className={styles.overlayKicker}>Take your time</p>
              <h2 id="round-title" ref={overlayTitle} tabIndex={-1}>Appetite on pause.</h2>
              <p>Your opening, score and clock are right where you left them.</p>
              <button className={styles.primary} type="button" onClick={resume}><Play size={18} aria-hidden="true" /> Resume</button>
              <button className={styles.secondary} type="button" onClick={start}><RotateCcw size={16} aria-hidden="true" /> Restart round</button>
              <Link href={menuHref}>Back to menu</Link>
            </>}
            {view.mode === "result" && <>
              <p className={styles.overlayKicker}>{view.cleared ? "Every last bite" : "Round complete"}</p>
              <h2 id="round-title" ref={overlayTitle} tabIndex={-1}>{resultHeading}</h2>
              <strong className={styles.finalScore}>{view.score.toLocaleString("en-US")}<small>points</small></strong>
              <p>{view.collected} of {view.total} objects swallowed<br />Size {view.tier} of 5 &middot; {growth.name}</p>
              <button className={styles.primary} type="button" onClick={start}><RotateCcw size={17} aria-hidden="true" /> Play again</button>
              <Link href={menuHref}>Back to menu</Link>
            </>}
          </section>}
        </div>
        <p className={styles.feedback} aria-hidden="true">{view.feedback}</p>
        <div className={styles.controlRow}>
          <div className={styles.directions} aria-label="Direction controls">
            {(Object.keys(DIRECTIONS) as Direction[]).map(direction => {
              const { Icon } = DIRECTIONS[direction];
              return <button key={direction} type="button" disabled={!playing} aria-label={`Move ${direction}`} onPointerDown={event => {
                if (!event.isPrimary || event.button !== 0) return;
                event.preventDefault(); clearInput(); held.current = direction; event.currentTarget.setPointerCapture(event.pointerId);
              }} onPointerUp={clearInput} onPointerCancel={clearInput} onLostPointerCapture={clearInput} onKeyDown={event => {
                if (event.key !== " " && event.key !== "Enter") return;
                event.preventDefault(); if (!event.repeat) held.current = direction;
              }} onKeyUp={event => { if (event.key === " " || event.key === "Enter") held.current = null; }} onBlur={clearInput} onClick={event => {
                if (event.detail === 0 && round.current.state.mode === "running") nudge.current = { direction, until: performance.now() + 180 };
              }}><Icon size={21} aria-hidden="true" /></button>;
            })}
          </div>
          {playing ? <button className={styles.pause} type="button" onClick={pause}><Pause size={17} aria-hidden="true" /> Pause</button> : <span className={styles.controlHint}>Hold a direction<br />or drag to move</span>}
        </div>
        <details className={styles.rules}>
          <summary>How to grow</summary>
          <p>Your opening swallows objects that fit completely inside it. Gold rings mark what fits now. Larger objects stay put until you grow. Every swallowed object adds points and growth; there are five sizes and 54 objects.</p>
          <p>Drag farther from your first touch to move faster. Release to stop. Arrow keys, WASD and the direction buttons also work. The game pauses when you leave the tab. Reduced motion removes decorative spin and effects.</p>
          <p>Original game artwork. No sound, sign-up, prizes or discounts.</p>
        </details>
      </section>
    </div>
    <p className={styles.srOnly} role="status" aria-live="polite">{liveStatus}</p>
  </main>;
}
