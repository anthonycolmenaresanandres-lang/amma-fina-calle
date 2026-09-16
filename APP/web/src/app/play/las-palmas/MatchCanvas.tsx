"use client";

import { useEffect, useRef, useState } from "react";
import type { InputMode, PenaltyLevel } from "@/penalty/types";
import { createMatch } from "@/penalty/engine/match";
import CantinaScoreboard from "./CantinaScoreboard";
import { characterSkin } from "./characters";
import type { ShootoutCharacter, ShootoutPresentation } from "@/penalty/shootout-presentation";
import styles from "./LasPalmasGame.module.css";

export default function MatchCanvas({ character, level, input, presentation }: { character: ShootoutCharacter; level: PenaltyLevel; input: InputMode; presentation?: ShootoutPresentation }) {
  const mount = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [requiresReload, setRequiresReload] = useState(false);
  const [match, setMatch] = useState(createMatch);

  useEffect(() => {
    let cancelled = false;
    let game: import("phaser").Game | undefined;
    const timeout = setTimeout(() => fail(), 30_000);
    function fail() {
      if (cancelled) return;
      cancelled = true;
      clearTimeout(timeout);
      game?.destroy(true);
      setStatus("error");
    }
    async function boot() {
      try {
        // Phaser never enters the initial lobby bundle; reuse the frozen scene.
        const [{ default: Phaser }, { PenaltyScene }] = await Promise.all([import("phaser"), import("@/penalty/PenaltyScene")]);
        if (cancelled || !mount.current) return;
        // Scene event plugins are not available until Phaser initializes it.
        // Observe create through a tiny host subclass; engine behavior is intact.
        class LobbyScene extends PenaltyScene {
          create() {
            super.create();
            if (cancelled) return;
            clearTimeout(timeout);
            setStatus("ready");
          }
        }
        const scene = new LobbyScene(level, presentation ? presentation.skinForPlayer(character) : characterSkin(character), input, undefined, next => {
          if (!cancelled) setMatch(next);
        });
        game = new Phaser.Game({
          type: Phaser.AUTO, parent: mount.current,
          width: mount.current.clientWidth || 390, height: mount.current.clientHeight || 680,
          backgroundColor: "#071d13", scene: [scene],
          scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
        });
      } catch {
        // A failed dynamic import can remain cached as a rejected promise.
        // Reload the document for a fresh download instead of retrying that promise.
        if (!cancelled) setRequiresReload(true);
        fail();
      }
    }
    void boot();
    return () => { cancelled = true; clearTimeout(timeout); game?.destroy(true); };
  }, [character, level, input, attempt, presentation]);

  return (
    <div className={styles.arena}>
      <div ref={mount} className={styles.canvas} aria-label={`${character.name}, ${level.levelName}. ${input === "tap" ? "Tap a target in the goal to shoot." : "Swipe from the ball toward the goal."}`} />
      {status === "ready" ? <CantinaScoreboard match={match} totalShots={level.rules.totalShots} input={input} title={presentation?.title} /> : null}
      {status === "loading" ? <div className={styles.loadState} role="status">Getting the pitch ready…</div> : null}
      {status === "error" ? <div className={styles.loadState}><p role="alert">The game couldn’t load. Check your connection and try again.</p><button type="button" onClick={() => { if (requiresReload) { window.location.reload(); return; } setStatus("loading"); setAttempt(value => value + 1); }}>{requiresReload ? "Reload game" : "Try again"}</button></div> : null}
    </div>
  );
}
