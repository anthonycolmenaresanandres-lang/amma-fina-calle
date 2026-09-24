"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import type { Game } from "phaser";
import type { FallScene } from "@/bodega-fall/FallScene";
import { BEST_KEY, ITEMS, SHIFT_MS, isGolden, newShift, orderLimit, rushReducer, type ItemId } from "@/bodega-fall/rules";
import styles from "./page.module.css";

function Product({ id, small = false }: { id: ItemId; small?: boolean }) {
  return <span aria-hidden="true" className={`${styles.product} ${styles[id]} ${small ? styles.smallProduct : ""}`}>
    <span className={styles.steam} />
    <span className={styles.vessel}><span className={styles.productMark}>{id === "muffin" ? "✦" : id === "spanish" ? "S" : "C"}</span></span>
    <span className={styles.saucer} />
  </span>;
}

export default function BodegaSessionsClient() {
  const [state, dispatch] = useReducer(rushReducer, undefined, () => newShift());
  const [practice, setPractice] = useState(false);
  const [best, setBest] = useState(0);
  const mount = useRef<HTMLDivElement>(null);
  const game = useRef<Game | null>(null);
  const scene = useRef<FallScene | null>(null);
  const clock = useRef(0);
  const stage = useRef<HTMLElement>(null);
  const phase = useRef(state.phase);
  const started = state.phase !== "ready";
  const golden = isGolden(state);

  const tick = useCallback(() => {
    const now = performance.now();
    const delta = now - clock.current;
    clock.current = now;
    dispatch({ type: "tick", delta, random: Math.random() });
  }, []);
  const pick = useCallback((item: ItemId) => {
    tick(); // Resolve the deadline before awarding points, even between clock frames.
    dispatch({ type: "pick", item, random: Math.random() });
  }, [tick]);

  useEffect(() => {
    phase.current = state.phase;
    if (game.current) {
      if (state.phase === "playing") game.current.loop.wake();
      else game.current.loop.sleep();
    }
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "playing") return;
    clock.current = performance.now();
    const timer = window.setInterval(tick, 100);
    const hide = () => {
      if (document.hidden) { tick(); dispatch({ type: "pause" }); }
    };
    document.addEventListener("visibilitychange", hide);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", hide); };
  }, [state.phase, tick]);

  useEffect(() => {
    if (state.phase !== "playing") return;
    const keydown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.target instanceof HTMLElement && (event.target.isContentEditable || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName))) return;
      const item = ITEMS.find((entry) => entry.key === event.key);
      if (item) { event.preventDefault(); pick(item.id); }
      if (event.key === "Escape") { tick(); dispatch({ type: "pause" }); }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [state.phase, pick, tick]);

  useEffect(() => {
    if (state.phase !== "done" || state.practice) return;
    try {
      const saved = Number(localStorage.getItem(BEST_KEY)) || 0;
      localStorage.setItem(BEST_KEY, String(Math.max(saved, state.score)));
    } catch { /* Blocked storage must never prevent replay. */ }
  }, [state.phase, state.practice, state.score]);

  useEffect(() => {
    if (!started || !mount.current) return;
    let cancelled = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => { if (scene.current) scene.current.moving = !motion.matches; };
    const init = async () => {
      const [phaser, scenery] = await Promise.all([import("phaser"), import("@/bodega-fall/FallScene")]);
      if (cancelled || !mount.current) return;
      const view = new scenery.FallScene();
      view.moving = !motion.matches;
      scene.current = view;
      game.current = new phaser.default.Game({
        type: phaser.default.CANVAS, parent: mount.current,
        width: mount.current.clientWidth, height: mount.current.clientHeight,
        transparent: true, scene: [view], audio: { noAudio: true },
        input: { keyboard: false, mouse: false, touch: false },
        fps: { target: 30, forceSetTimeOut: true },
        scale: { mode: phaser.default.Scale.RESIZE },
        callbacks: { postBoot: (instance) => { if (phase.current !== "playing") instance.loop.sleep(); } },
      });
      game.current.canvas.setAttribute("aria-hidden", "true");
    };
    void init().catch(() => { game.current?.destroy(true); game.current = null; scene.current = null; });
    motion.addEventListener("change", syncMotion);
    return () => {
      cancelled = true;
      motion.removeEventListener("change", syncMotion);
      game.current?.destroy(true); game.current = null; scene.current = null;
    };
  }, [started]);

  function start() {
    try { const saved = Number(localStorage.getItem(BEST_KEY)); setBest(Number.isFinite(saved) && saved > 0 ? saved : 0); } catch { setBest(0); }
    clock.current = performance.now();
    dispatch({ type: "start", practice });
    requestAnimationFrame(() => stage.current?.focus({ preventScroll: true }));
  }
  const remaining = Math.ceil((SHIFT_MS - state.elapsed) / 1000);
  const nextItem = ITEMS.find((item) => item.id === state.ticket[state.filled])!;

  return <section id="fall-game" ref={stage} tabIndex={-1} className={styles.game} aria-label="Bodega Fall Rush" data-phase={state.phase}>
    <div className={styles.marquee}><span>CAFECITO WEATHER</span><span>FALL RUSH / BODEGA</span><span>GOOD THINGS, ON REPEAT</span></div>
    <div className={styles.stage} data-golden={golden && state.phase === "playing"}>
      <div className={styles.scenery} ref={mount} aria-hidden="true" />
      {state.phase === "ready" ? <div className={styles.intro}>
        <div className={styles.introCopy}><span className={styles.eyebrow}>Your neighborhood. Your shift.</span>
          <h2>Keep the<br /><em>cafecito</em> coming.</h2>
          <p>Read the ticket. Tap each item in order. Serve four perfect orders in a row to unlock <strong>Golden Hour</strong>.</p>
          <div className={styles.startActions}><button className={styles.primary} onClick={start}>Start the fall rush <span aria-hidden="true">↗</span></button>
            <label className={styles.practice}><input type="checkbox" checked={practice} onChange={(event) => setPractice(event.target.checked)} /> Untimed practice</label></div>
          <span className={styles.hint}>{practice ? "No clock. Find your flow." : "45 seconds · Tap or use keys 1, 2, 3 · Sound-free"}</span>
        </div>
        <div className={styles.heroProducts} aria-label="Featured game items">{ITEMS.map((item, index) => <div key={item.id} className={styles.heroProduct}>
          <Product id={item.id} /><span className={styles.productNumber}>0{index + 1}</span><strong>{item.name}</strong>
        </div>)}<span className={styles.seasonStamp} aria-hidden="true">FALL<br />FEELS<br />GOOD.</span></div>
      </div> : <>
        <div className={styles.hud}>
          <div><span>Score</span><strong>{state.score.toLocaleString("en-US")}</strong></div>
          <div><span>{state.practice ? "Practice" : "Time left"}</span><strong data-urgent={!state.practice && remaining <= 10}>{state.practice ? "∞" : `${remaining}s`}</strong></div>
          <div><span>Orders</span><strong>{state.served.toString().padStart(2, "0")}</strong></div>
          {state.phase === "playing" && <button className={styles.pause} onClick={() => { tick(); dispatch({ type: "pause" }); }}>Pause</button>}
        </div>
        {state.phase === "done" ? <div className={styles.result} aria-live="polite">
          <span className={styles.eyebrow}>{state.practice ? "Practice complete" : "That’s a wrap, vecino."}</span>
          <h2>{state.served >= 10 ? "Barrio legend." : state.served >= 5 ? "Cafecito captain." : "A warm start."}</h2>
          <p><strong>{state.served} orders served</strong> · Best streak: {state.longest} · {state.missed} cooled off</p>
          {!state.practice && <p className={styles.best}>Your best on this device: {Math.max(best, state.score).toLocaleString("en-US")}</p>}
          <button className={styles.primary} onClick={start}>Play another shift <span aria-hidden="true">↻</span></button>
          <Link href="/demo/bodega">Back to Bodega’s menu</Link>
        </div> : <>
          <div className={styles.shiftLine}><span>{golden ? "✦ GOLDEN HOUR — DOUBLE POINTS" : "FILL THE TICKET, LEFT TO RIGHT"}</span><span>Perfect streak {state.streak}</span></div>
          <div className={styles.ticket} aria-label="Current order" aria-hidden={state.phase === "paused"}>
            <div className={styles.ticketTop}><span>BODEGA / ORDER {String(state.served + state.missed + 1).padStart(3, "0")}</span><span>TO STAY & ENJOY</span></div>
            <ol className={styles.order}>{state.ticket.map((id, index) => <li key={`${state.served}-${state.missed}-${index}`} data-filled={index < state.filled} data-current={index === state.filled} aria-current={index === state.filled ? "step" : undefined}>
              <Product id={id} small /><span>{ITEMS.find((item) => item.id === id)!.name}</span>
              <b aria-label={index < state.filled ? "Complete" : `Item ${index + 1}`}>{index < state.filled ? "✓" : index + 1}</b>
            </li>)}</ol>
            <div className={styles.ticketBottom}><span>{state.practice ? "Take your time" : "Serve before it cools"}</span><span>{state.filled}/{state.ticket.length} ready</span></div>
            {!state.practice && <div className={styles.heat} role="progressbar" aria-label="Order warmth" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(100 * (1 - state.orderElapsed / orderLimit(state.served)))}><span style={{ transform: `scaleX(${Math.max(0, 1 - state.orderElapsed / orderLimit(state.served))})` }} /></div>}
          </div>
          <p className={styles.feedback} role="status">{state.message}</p>
          <p className={styles.nextItem}>Next: <strong>{nextItem.name}</strong></p>
          <div className={styles.counter} aria-label="Serve an item">{ITEMS.map((item) => <button key={item.id} type="button" aria-label={`Serve ${item.name}`} disabled={state.phase !== "playing"} onClick={() => pick(item.id)}>
            <span className={styles.keyHint}>{item.key}</span><Product id={item.id} /><strong>{item.name}</strong>
          </button>)}</div>
          {state.practice && state.phase === "playing" && <button className={styles.finishPractice} onClick={() => dispatch({ type: "finish" })}>Finish practice</button>}
          {state.phase === "paused" && <div className={styles.pauseOverlay}>
            <span className={styles.eyebrow}>A little coffee break.</span><h2>Still warm.</h2><p>Your clock and order are paused.</p>
            <button className={styles.primary} onClick={() => { clock.current = performance.now(); dispatch({ type: "resume" }); }}>Resume the rush</button>
          </div>}
        </>}
      </>}
    </div>
    <div className={styles.gameFooter}><span>4 PERFECT ORDERS = 7s OF DOUBLE POINTS</span><span>MADE FOR CAFECITO WEATHER.</span></div>
    <noscript><p>Enable JavaScript to play Fall Rush. You can still browse <a href="/demo/bodega">Bodega’s menu review</a>.</p></noscript>
  </section>;
}
