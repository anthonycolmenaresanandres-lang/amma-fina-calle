"use client";

import { useEffect, useRef } from "react";

export default function ConquestClient(): React.JSX.Element {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<any>(null);

  useEffect(() => {
    if (!mountRef.current || gameRef.current || typeof window === "undefined") {
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
        scene: [ConquestScene],
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
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col bg-[#120905] text-[#f4e6cc]">
      <div className="border-b border-[#d4a24c]/35 px-4 py-2 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[#d4a24c]">District Claimed Prototype</p>
      </div>
      <div ref={mountRef} className="h-[calc(100dvh-46px)] w-full" />
    </div>
  );
}
