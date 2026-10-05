"use client";
import { useEffect, useRef, useState } from "react";
import type { Game } from "phaser";
import { DEFAULT_PENALTY_LEVEL, baseColors, PENALTY_ZONES } from "@/penalty/config";
import { computeLayout, zoneCenter } from "@/penalty/geometry";
import type { PenaltyScene } from "@/penalty/PenaltyScene";
import { createMatch, type MatchState } from "@/penalty/engine/match";
import type { PenaltySkin } from "@/penalty/types";
import styles from "./maracaibo.module.css";

const skin: PenaltySkin = {
  id: "maracaibo", displayName: "Maracaibo", brandName: "Maracaibo Bistro", skinName: "Penalty Rush",
  colors: { ...baseColors, bg: 0x0b0b0c, sky: 0x22121a, keeper: 0x751932, keeperAccent: 0xd8b36d,
    accent: 0xe7a551, text: "#f5f5f1" },
  assets: {
    background: "/assets/maracaibo/penalty/maracaibo-stadium-preview.png",
    pitch: "/assets/maracaibo/penalty/hyperrealistic-pitch-preview.png",
    logo: "/assets/maracaibo/maracaibo-kitchen-cocktails-logo.png",
    kicker: "/assets/maracaibo/penalty/tequeno-player.webp",
    keeper: "/assets/maracaibo/penalty/keeper-ready.webp",
    keeperSad: "/assets/maracaibo/penalty/keeper-sad.webp",
  },
  // Both portrait layers align their turf horizon at the goal ground on resize.
  // The existing loader retains the primitive field if this optional art fails.
  backgroundFit: { scrim: 0.12, pitchLinePct: 0.38 },
  kickerFit: { scale: 1.7, offsetXPct: -0.16, offsetYPct: -0.025 },
  keeperFit: { scale: 1.15 },
  chrome: { externalHud: true },
};
export function MaracaiboPenaltyClient({ onActiveChange, onBack }: { onActiveChange: (active: boolean) => void; onBack: () => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const scene = useRef<PenaltyScene | null>(null);
  const [match, setMatch] = useState<MatchState>(createMatch);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const finished = match.phase === "gameover";
  const active = !finished && (match.shotsTaken > 0 || match.phase !== "aim");
  useEffect(() => { onActiveChange(active); return () => onActiveChange(false); }, [active, onActiveChange]);
  useEffect(() => {
    let cancelled = false;
    let game: Game | null = null;
    const timeout = setTimeout(() => { if (!cancelled) { setError(true); cancelled = true; game?.destroy(true); } }, 20_000);
    void Promise.all([import("phaser"), import("@/penalty/PenaltyScene")]).then(([{ default: Phaser }, { PenaltyScene }]) => {
      if (cancelled || !mount.current) return;
      class TablePenaltyScene extends PenaltyScene {
        create() { super.create(); if (!cancelled) { clearTimeout(timeout); setLoaded(true); } }
      }
      scene.current = new TablePenaltyScene(DEFAULT_PENALTY_LEVEL, skin, "tap", {
        id: "maracaibo", client: "Maracaibo", kit: { keeper: { primary: 0x751932, secondary: 0xd8b36d } },
      }, (next) => { if (!cancelled) setMatch(next); });
      game = new Phaser.Game({ type: Phaser.AUTO, parent: mount.current, width: mount.current.clientWidth,
        height: mount.current.clientHeight, backgroundColor: "#0b0b0c",
        scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: [scene.current],
      });
    }).catch(() => { if (!cancelled) { clearTimeout(timeout); setError(true); } });
    return () => { cancelled = true; clearTimeout(timeout); scene.current = null; game?.destroy(true); };
  }, [attempt]);
  function replay() { setMatch(createMatch()); setLoaded(false); setError(false); setAttempt((v) => v + 1); }
  const instruction = finished ? `${match.goals} of 5 goals` : match.phase === "aim" ? "Tap a target in the goal" : match.phase === "shooting" ? "Shot on its way…" : match.results.at(-1) === "goal" ? "Goal!" : match.results.at(-1) === "save" ? "Saved" : "Wide";
  return <div className={styles.penaltyGame}>
    <div className={styles.penaltyHud}>
      <button type="button" className={styles.penaltyBack} onClick={onBack}>Back to menu</button>
      <div className={styles.penaltyScore}><span>Solo · {match.goals} goals · {Math.min(match.shotsTaken + 1, 5)}/5</span></div>
    </div>
    <div className={styles.penaltyPlayfield}>
      <p className={styles.penaltyHint} role="status" aria-live="polite">{instruction}</p>
      <div className={styles.penaltyStage} hidden={finished || error} aria-label="Penalty goal. Tap a target to shoot.">
        <div ref={mount} className={styles.penaltyCanvas} />
        {!loaded ? <span className={styles.loading} role="status">Preparing the goal…</span> : PENALTY_ZONES.map((zone) => {
          const position = zoneCenter(zone, computeLayout(100, 100));
          return <button key={zone.id} type="button" className={styles.penaltyTarget}
            style={{ left: `${position.x}%`, top: `${position.y}%` }} aria-label={`Aim ${zone.label.toLowerCase()}`}
            disabled={match.phase !== "aim"} onClick={() => {
              const current = scene.current;
              if (current && match.phase === "aim") current.input.emit("pointerdown", zoneCenter(zone, computeLayout(current.scale.width, current.scale.height)));
            }} />;
        })}
      </div>
      {finished || error ? <div className={styles.results}><h2>{error ? "The goal couldn’t open." : `${match.goals} out of 5.`}</h2><button type="button" className={styles.primaryButton} onClick={replay}>{error ? "Try again" : "Play again"}</button></div> : null}
    </div>
  </div>;
}
