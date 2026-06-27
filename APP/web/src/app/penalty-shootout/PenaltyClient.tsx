"use client";

import { useEffect, useRef, useState } from "react";
import type { Game } from "phaser";
import { PENALTY_LEVELS } from "@/penalty/config";
import { DEFAULT_PENALTY_SKIN, PENALTY_SKINS } from "@/penalty/skin/skins";
import type { InputMode, PenaltyLevel, PenaltySkin } from "@/penalty/types";

const toHex = (n: number): string => `#${n.toString(16).padStart(6, "0")}`;

const INPUT_MODES: { id: InputMode; label: string }[] = [
  { id: "tap", label: "Tap" },
  { id: "swipe", label: "Swipe" },
];

export default function PenaltyClient(): React.JSX.Element {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<PenaltySkin>(DEFAULT_PENALTY_SKIN);
  const [selectedInput, setSelectedInput] = useState<InputMode>("tap");
  const [selectedLevel, setSelectedLevel] = useState<PenaltyLevel | null>(null);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    if (!selectedLevel || !mountRef.current || gameRef.current || typeof window === "undefined") {
      return;
    }

    let cancelled = false;

    const init = async () => {
      const [{ default: Phaser }, { PenaltyScene }] = await Promise.all([
        import("phaser"),
        import("@/penalty/PenaltyScene"),
      ]);

      if (cancelled || !mountRef.current) {
        return;
      }

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: mountRef.current,
        width: mountRef.current.clientWidth || 390,
        height: mountRef.current.clientHeight || 780,
        backgroundColor: toHex(selectedSkin.colors.bg),
        scene: [new PenaltyScene(selectedLevel, selectedSkin, selectedInput)],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      });

      gameRef.current = game;
    };

    void init();

    return () => {
      cancelled = true;
      const game = gameRef.current;
      if (!game) {
        return;
      }
      game.destroy(true);
      gameRef.current = null;
    };
  }, [selectedLevel, selectedSkin, selectedInput, replayKey]);

  const selectLevel = (level: PenaltyLevel) => {
    setSelectedLevel(level);
    setReplayKey((current) => current + 1);
  };

  if (!selectedLevel) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col bg-[#04130a] px-5 py-6 text-[#f4f6f7]">
        <section className="flex flex-1 flex-col justify-center">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-[#d8b36d]">
            {selectedSkin.brandName}
          </p>
          <h1 className="mt-3 text-center font-serif text-3xl text-[#f4f6f7]">{selectedSkin.skinName}</h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-[#aeb7bd]">
            Five from the spot. Pick your keeper.
          </p>

          <div className="mt-6">
            <p className="text-center text-[0.66rem] uppercase tracking-[0.2em] text-[#aeb7bd]">Skin</p>
            <div className="mt-2 flex justify-center gap-2">
              {PENALTY_SKINS.map((skin) => {
                const active = skin.id === selectedSkin.id;
                return (
                  <button
                    key={skin.id}
                    type="button"
                    onClick={() => setSelectedSkin(skin)}
                    aria-pressed={active}
                    className={
                      active
                        ? "rounded-full border border-[#d8b36d] bg-[#d8b36d] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#04130a]"
                        : "rounded-full border border-[#d8b36d]/45 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f6f7] transition hover:border-[#d8b36d]"
                    }
                  >
                    {skin.displayName}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-center text-[0.66rem] uppercase tracking-[0.2em] text-[#aeb7bd]">Controls</p>
            <div className="mt-2 flex justify-center gap-2">
              {INPUT_MODES.map((mode) => {
                const active = mode.id === selectedInput;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedInput(mode.id)}
                    aria-pressed={active}
                    className={
                      active
                        ? "rounded-full border border-[#d8b36d] bg-[#d8b36d] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#04130a]"
                        : "rounded-full border border-[#d8b36d]/45 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f6f7] transition hover:border-[#d8b36d]"
                    }
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {PENALTY_LEVELS.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => selectLevel(level)}
                className="border border-[#d8b36d]/45 bg-[#07210f] px-4 py-4 text-left transition hover:border-[#d8b36d] hover:bg-[#0a2d15] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b36d]"
              >
                <span className="block text-xs uppercase tracking-[0.16em] text-[#d8b36d]">
                  Keeper {level.levelNumber}
                </span>
                <span className="mt-1 block font-serif text-xl text-[#f4f6f7]">{level.levelName}</span>
                <span className="mt-2 block text-sm leading-relaxed text-[#c8d0d4]">{level.selectText}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col bg-[#04130a] text-[#f4f6f7]">
      <div className="border-b border-[#d8b36d]/35 px-4 py-2">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-[#d8b36d]">
          {selectedSkin.displayName} · Keeper {selectedLevel.levelNumber} - {selectedLevel.levelName}
        </p>
        <div className="mt-2 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedLevel(null)}
            className="border border-[#d8b36d]/50 px-3 py-1 text-xs uppercase tracking-[0.14em] text-[#f4f6f7]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setReplayKey((current) => current + 1)}
            className="border border-[#d8b36d]/50 bg-[#d8b36d] px-3 py-1 text-xs uppercase tracking-[0.14em] text-[#04130a]"
          >
            Replay
          </button>
        </div>
      </div>
      <div
        key={`${selectedSkin.id}-${selectedInput}-${selectedLevel.id}-${replayKey}`}
        ref={mountRef}
        className="h-[calc(100dvh-75px)] w-full"
      />
    </div>
  );
}
