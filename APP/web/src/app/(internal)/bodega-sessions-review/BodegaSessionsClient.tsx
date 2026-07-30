"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Game } from "phaser";
import type { BodegaSessionsResult, BodegaSessionsScene } from "@/bodega-sessions/BodegaSessionsScene";
import styles from "./page.module.css";

const PAD_LABELS = ["Cup", "Steam", "Bell", "Bass"] as const;
const TONE_FREQUENCIES = [220, 330, 440, 165] as const;

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export default function BodegaSessionsClient(): React.JSX.Element {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const sceneRef = useRef<BodegaSessionsScene | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(false);
  const [started, setStarted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [result, setResult] = useState<BodegaSessionsResult | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const playTone = useCallback((padIndex: number) => {
    if (!soundEnabledRef.current || typeof window === "undefined") return;

    const AudioContextConstructor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
    if (!AudioContextConstructor) return;

    const context = audioContextRef.current ?? new AudioContextConstructor();
    audioContextRef.current = context;
    if (context.state === "suspended") void context.resume();

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = padIndex === 3 ? "triangle" : "sine";
    oscillator.frequency.value = TONE_FREQUENCIES[padIndex] ?? 220;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.2);
  }, []);

  useEffect(() => {
    if (!started || !mountRef.current || gameRef.current || typeof window === "undefined") return;

    let cancelled = false;

    const init = async () => {
      const [{ default: Phaser }, { BodegaSessionsScene: Scene }] = await Promise.all([
        import("phaser"),
        import("@/bodega-sessions/BodegaSessionsScene"),
      ]);

      if (cancelled || !mountRef.current) return;

      const scene = new Scene({
        onComplete: setResult,
        playTone,
        reducedMotion,
      });
      sceneRef.current = scene;

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: mountRef.current,
        width: mountRef.current.clientWidth || 390,
        height: mountRef.current.clientHeight || 590,
        backgroundColor: "#090909",
        scene: [scene],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      });
      game.canvas.setAttribute("aria-label", "Bodega Sessions rhythm memory game");
      game.canvas.setAttribute("tabindex", "0");
      gameRef.current = game;
    };

    void init();

    return () => {
      cancelled = true;
      sceneRef.current = null;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [playTone, reducedMotion, replayKey, started]);

  useEffect(
    () => () => {
      void audioContextRef.current?.close();
      audioContextRef.current = null;
    },
    [],
  );

  const replay = () => {
    setResult(null);
    setReplayKey((current) => current + 1);
  };

  if (!started) {
    return (
      <section className={styles.startPanel}>
        <div>
          <span className={styles.startLabel}>15-20 seconds / typical play</span>
          <h2>Ready for Side A?</h2>
          <p>Watch four signals. Repeat each pattern with the numbered pads. Sound starts off.</p>
        </div>
        <div className={styles.startActions}>
          <button type="button" onClick={() => setStarted(true)}>
            Start session
          </button>
          <button
            aria-pressed={soundEnabled}
            className={styles.soundButton}
            type="button"
            onClick={() => setSoundEnabled((current) => !current)}
          >
            Sound {soundEnabled ? "on" : "off"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.gameSection} aria-label="Bodega Sessions prototype">
      <div className={styles.gameToolbar}>
        <button
          aria-pressed={soundEnabled}
          className={styles.inlineControl}
          type="button"
          onClick={() => setSoundEnabled((current) => !current)}
        >
          Sound {soundEnabled ? "on" : "off"}
        </button>
        <span>Keys 1-4 also play</span>
      </div>

      <div ref={mountRef} className={styles.gameMount} />

      <div className={styles.accessiblePads} aria-label="Rhythm pads">
        {PAD_LABELS.map((label, index) => (
          <button key={label} type="button" onClick={() => sceneRef.current?.pressPad(index)}>
            <span>{index + 1}</span>
            {label}
          </button>
        ))}
      </div>

      {result ? (
        <div className={styles.resultPanel} aria-live="polite">
          <div>
            <span className={styles.resultLabel}>Your side</span>
            <h2>{result.rating}</h2>
            <p>
              {result.correct} of {result.total} beats · {(result.durationMs / 1000).toFixed(1)} seconds
            </p>
          </div>
          <div className={styles.resultActions}>
            <button type="button" onClick={replay}>
              Replay Side A
            </button>
            <span className={styles.pendingCta} aria-disabled="true">
              Music / event link pending owner confirmation
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
