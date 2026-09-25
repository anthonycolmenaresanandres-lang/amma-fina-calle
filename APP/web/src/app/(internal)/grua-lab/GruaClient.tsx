"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Game } from "phaser";
import type { GruaAnnouncement, GruaScene, GruaStatus } from "@/grua/GruaScene";
import { STRINGMAN } from "@/grua/profile";
import styles from "./page.module.css";

type Direction = "up" | "down" | "left" | "right";
const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
};

function newSeed() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0];
}

export default function GruaClient() {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [record, setRecord] = useState(false);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState<GruaStatus | null>(null);
  const [message, setMessage] = useState<GruaAnnouncement | null>(null);
  const mount = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const game = useRef<Game | null>(null);
  const scene = useRef<GruaScene | null>(null);
  const pausedRef = useRef(false);
  // Consent is fixed when a round starts; a new round remounts the game with the new choice.
  const recordingRef = useRef(false);

  useEffect(() => {
    if (!started || !mount.current) return;
    let cancelled = false;
    const init = async () => {
      const [{ default: Phaser }, { GruaScene: Scene }] = await Promise.all([import("phaser"), import("@/grua/GruaScene")]);
      if (cancelled || !mount.current) return;
      const s = new Scene({
        seed: newSeed(), record: recordingRef.current,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        onStatus: (next: GruaStatus) => { if (!cancelled) setStatus(next); },
        onAnnounce: (next: GruaAnnouncement) => { if (!cancelled) setMessage(next); },
      });
      scene.current = s;
      game.current = new Phaser.Game({
        type: Phaser.CANVAS, parent: mount.current,
        width: mount.current.clientWidth, height: mount.current.clientHeight,
        backgroundColor: "#07090b", scene: [s], audio: { noAudio: true },
        scale: { mode: Phaser.Scale.RESIZE }, fps: { target: 60 },
      });
      game.current.canvas.setAttribute("aria-hidden", "true");
      setLoading(false);
      mount.current.focus({ preventScroll: true });
    };
    void init().catch((err) => { console.error("Grúa failed to load", err); if (!cancelled) { setError(true); setLoading(false); } });
    const pauseForBackground = () => {
      if (pausedRef.current) return;
      pausedRef.current = true; setPaused(true);
      scene.current?.releaseControls();
      game.current?.scene.getScenes(false).forEach((sc) => sc.scene.pause());
    };
    const hide = () => { if (document.hidden) pauseForBackground(); };
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", pauseForBackground);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", pauseForBackground);
      game.current?.destroy(true); game.current = null; scene.current = null;
    };
  }, [started, round]);

  function restart() {
    // Restarting drops this round's recording; ask only when there is something to lose.
    if (recordingRef.current && !status?.over && (status?.frames ?? 0) > 0 && !window.confirm("Restart and discard this round’s recording?")) return;
    start();
  }

  function start() {
    pausedRef.current = false;
    setPaused(false); setError(false); setLoading(true); setStatus(null); setMessage(null);
    recordingRef.current = record;
    setRecording(record);
    setStarted(true); setRound((n) => n + 1);
    requestAnimationFrame(() => section.current?.scrollIntoView({ block: "start", behavior: "instant" }));
  }

  function togglePause() {
    const next = !pausedRef.current;
    pausedRef.current = next; setPaused(next);
    scene.current?.releaseControls();
    game.current?.scene.getScenes(false).forEach((sc) => (next ? sc.scene.pause() : sc.scene.resume()));
    if (!next) mount.current?.focus({ preventScroll: true });
  }

  function act() {
    if (pausedRef.current) return;
    scene.current?.pressAction();
    mount.current?.focus({ preventScroll: true });
  }

  function download() {
    const recorder = scene.current?.recorder;
    if (!recorder) return;
    const data = recorder.export(new Date().toISOString());
    const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `grua-run-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function onKey(event: KeyboardEvent, down: boolean) {
    const direction = KEY_DIRECTIONS[event.code];
    if (direction) {
      event.preventDefault();
      if (!pausedRef.current) scene.current?.setKey(direction, down);
      return;
    }
    if (!down || event.repeat) return;
    if (event.code === "Space" || event.code === "Enter") { event.preventDefault(); act(); }
    else if (event.code === "KeyP" || event.code === "Escape") { event.preventDefault(); if (!status?.over) togglePause(); }
  }

  const over = Boolean(status?.over);
  const peak = status?.peakTension ?? 0;
  const actionLabel = status?.holding ? "Drop" : "Grab";

  return (
    <section ref={section} id="grua-game" className={styles.game} data-playing={started} aria-label="Grúa cable crane game">
      <div className={styles.readout} aria-label="Round status" data-hidden={!started}>
        <div><span>Time</span><strong data-urgent={(status?.secondsLeft ?? 60) <= 10}>{status?.secondsLeft ?? 60}</strong></div>
        <div><span>Score</span><strong>{status?.score ?? 0}</strong></div>
        <div><span>Cleared</span><strong>{status?.cleared ?? 0}<small>/{status?.total ?? 8}</small></strong></div>
      </div>

      <div className={styles.board}>
        <div
          ref={mount}
          className={styles.canvas}
          tabIndex={started ? 0 : -1}
          role="application"
          aria-label="Crane controls. Drag on the floor, or hold the arrow keys, to fly the crane. Space grabs or drops. P pauses."
          onKeyDown={(e) => onKey(e, true)}
          onKeyUp={(e) => onKey(e, false)}
          onBlur={() => scene.current?.releaseControls()}
        />
        {!started && (
          <div className={styles.overlay}>
            <RigDiagram />
            <p className={styles.lede}>Drag to fly the crane. Stop right over an item, then grab. Dishes go in the tub, paper goes in the trash.</p>
            <label className={styles.consent}>
              <input type="checkbox" name="record-training-data" checked={record} onChange={(e) => setRecord(e.target.checked)} />
              <span>
                <strong>Save my crane moves as robot-training data</strong>
                The file stays on this device until you download it. It holds the crane&rsquo;s position, speed, grabs
                and cable tension — no name, photo, location or device ID.
              </span>
            </label>
            <button className={styles.primary} onClick={start}>Play</button>
          </div>
        )}
        {started && (loading || error || paused || over) && (
          <div className={styles.overlay} role="status">
            <h2>{error ? "The crane didn’t load." : loading ? "Rigging the lines…" : over ? (status && status.cleared === status.total ? "Floor clear." : "Time’s up.") : "Paused."}</h2>
            {over && status && (
              <dl className={styles.results}>
                <div><dt>Score</dt><dd>{status.score}</dd></div>
                <div><dt>Cleared</dt><dd>{status.cleared}/{status.total}</dd></div>
                <div><dt>Steady grabs</dt><dd>{status.steadyGrabs}</dd></div>
                <div><dt>Missed grabs</dt><dd>{status.missedGrabs}</dd></div>
                <div><dt>Line-limit stops</dt><dd>{status.strainEvents}</dd></div>
              </dl>
            )}
            {error ? <button className={styles.primary} onClick={() => window.location.reload()}>Reload</button>
              : over ? <div className={styles.actions}>
                  <button className={styles.primary} onClick={start}>Play again</button>
                  {recording && status && status.episodes > 0 && (
                    <button className={styles.secondary} onClick={download}>Download training file ({status.episodes} {status.episodes === 1 ? "run" : "runs"})</button>
                  )}
                </div>
              : paused && !loading ? <button className={styles.primary} onClick={togglePause}>Resume</button> : null}
          </div>
        )}
      </div>

      {started && (
        <>
          <div className={styles.telemetry} aria-label="Crane telemetry">
            <p><span>Load</span>{status?.load ? `${status.load} · ${status.loadKg.toFixed(2)} kg` : "empty"}</p>
            <p><span>Swing</span>{(status?.swingMm ?? 0).toFixed(0)} mm</p>
            <p><span>Height</span>{(status?.altitude ?? 0.8).toFixed(2)} m</p>
            <div className={styles.lines} data-warn={peak > STRINGMAN.maxSafeTension * 0.85}>
              <span>Lines</span>
              <meter min={0} max={STRINGMAN.maxSafeTension} low={STRINGMAN.maxSafeTension * 0.6} high={STRINGMAN.maxSafeTension * 0.85} optimum={0} value={Math.min(peak, STRINGMAN.maxSafeTension)} aria-label="Peak line tension" />
              <b>{peak.toFixed(1)} N</b><small>of {STRINGMAN.maxSafeTension}</small>
            </div>
          </div>
          <div className={styles.controls}>
            <button className={styles.quiet} onClick={togglePause} disabled={loading || error || over}>{paused ? "Resume" : "Pause"}</button>
            <button className={styles.quiet} onClick={restart}>Restart</button>
            <button className={styles.action} onClick={act} disabled={!status?.canAct || paused} data-holding={status?.holding}>{actionLabel}</button>
          </div>
          <p className={styles.message} aria-live="polite" data-tone={message?.tone}>{message?.text ?? (recording ? "Recording on this device." : " ")}</p>
        </>
      )}
      <p className={styles.legend}>
        <span><i data-kind="dish" />Mug, plate, pitcher → dish tub</span>
        <span><i data-kind="paper" />Paper cup, napkin → trash</span>
        <span>The pitcher is heavy — keep it to the middle.</span>
      </p>
    </section>
  );
}

/** The four-line rig at a glance: corner eyelets, lines, the gantry and its gripper. */
function RigDiagram() {
  const corners = [[12, 12], [228, 12], [228, 148], [12, 148]];
  const gantry = [150, 92];
  return (
    <svg className={styles.rig} viewBox="0 0 240 160" role="img" aria-label="A gripper hangs from four lines, one to each corner of the room.">
      <rect x="12" y="12" width="216" height="136" fill="none" stroke="#3a434d" strokeWidth="1.5" />
      {corners.map(([x, y]) => <line key={`l${x}${y}`} x1={x} y1={y} x2={gantry[0]} y2={gantry[1]} stroke="#c8aa72" strokeWidth="1.5" />)}
      {corners.map(([x, y]) => <rect key={`c${x}${y}`} x={x - 3.5} y={y - 3.5} width="7" height="7" fill="#b9c0c6" />)}
      <circle cx="62" cy="54" r="4" fill="#f0ece4" /><circle cx="96" cy="118" r="3.5" fill="#a88a5a" /><circle cx="190" cy="40" r="6" fill="#f0ece4" />
      <path d={`M${gantry[0]} ${gantry[1] - 7} l7 7 l-7 7 l-7 -7 z`} fill="#0d1115" stroke="#c8aa72" strokeWidth="1.5" />
      <circle cx={gantry[0]} cy={gantry[1]} r="11" fill="none" stroke="#f0ece4" strokeWidth="1.5" />
    </svg>
  );
}
