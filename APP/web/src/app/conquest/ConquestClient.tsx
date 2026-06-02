"use client";

import { useEffect, useRef, useState } from "react";
import { CONQUEST_LEVELS } from "@/conquest/config";
import type { EngineConfig } from "@/conquest/types";

export default function ConquestClient(): React.JSX.Element {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<EngineConfig | null>(null);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    if (!selectedLevel || !mountRef.current || gameRef.current || typeof window === "undefined") {
      return;
    }

    let cancelled = false;

    const init = async () => {
      const [{ default: Phaser }, { ConquestScene }] = await Promise.all([
        import("phaser"),
        import("@/conquest/ConquestScene"),
      ]);

      if (cancelled || !mountRef.current) {
        return;
      }

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: mountRef.current,
        width: mountRef.current.clientWidth || 390,
        height: mountRef.current.clientHeight || 780,
        backgroundColor: "#120905",
        scene: [new ConquestScene(selectedLevel)],
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
  }, [selectedLevel, replayKey]);

  const selectLevel = (level: EngineConfig) => {
    setSelectedLevel(level);
    setReplayKey((current) => current + 1);
  };

  if (!selectedLevel) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col bg-[#120905] px-5 py-6 text-[#f4e6cc]">
        <section className="flex flex-1 flex-col justify-center">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-[#d4a24c]">
            Fina Calle Conquest Engine
          </p>
          <h1 className="mt-3 text-center font-serif text-3xl text-[#f4e6cc]">District Claimed</h1>

          <div className="mt-8 grid gap-3">
            {CONQUEST_LEVELS.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => selectLevel(level)}
                className="border border-[#d4a24c]/45 bg-[#1d0f08] px-4 py-4 text-left transition hover:border-[#d4a24c] hover:bg-[#25140b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a24c]"
              >
                <span className="block text-xs uppercase tracking-[0.16em] text-[#d4a24c]">
                  Level {level.levelNumber}
                </span>
                <span className="mt-1 block font-serif text-xl text-[#f4e6cc]">{level.levelName}</span>
                <span className="mt-2 block text-sm leading-relaxed text-[#d8c3a3]">{level.selectText}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col bg-[#120905] text-[#f4e6cc]">
      <div className="border-b border-[#d4a24c]/35 px-4 py-2">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-[#d4a24c]">
          Level {selectedLevel.levelNumber} - {selectedLevel.levelName}
        </p>
        <div className="mt-2 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedLevel(null)}
            className="border border-[#d4a24c]/50 px-3 py-1 text-xs uppercase tracking-[0.14em] text-[#f4e6cc]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setReplayKey((current) => current + 1)}
            className="border border-[#d4a24c]/50 bg-[#d4a24c] px-3 py-1 text-xs uppercase tracking-[0.14em] text-[#120905]"
          >
            Replay
          </button>
        </div>
      </div>
      <div key={`${selectedLevel.id}-${replayKey}`} ref={mountRef} className="h-[calc(100dvh-75px)] w-full" />
    </div>
  );
}
