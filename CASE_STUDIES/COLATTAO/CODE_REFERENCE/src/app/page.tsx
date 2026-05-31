"use client";

import { useEffect, useState } from "react";
import GameCanvas from "@/components/GameCanvas";
import VisualFlashPass from "@/components/VisualFlashPass";
import CustomerHeader from "@/components/CustomerHeader";
import { EventBus } from "@/game/events/EventBus";
import type { GameWonPayload } from "@/types/game";

export default function Home() {
  const [lastWin, setLastWin] = useState<GameWonPayload | null>(null);
  const [showReward, setShowReward] = useState(false);

  const handlePlayAgain = () => {
    setShowReward(false);
    setLastWin(null);
    EventBus.emit("RESTART_GAME", undefined);
  };

  useEffect(() => {
    const unsubscribe = EventBus.on("GAME_WON", (payload) => {
      setLastWin(payload);
      setShowReward(true);
    });

    return unsubscribe;
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col bg-colattao-page text-parchment">
      <CustomerHeader />

      <section className="flex flex-1 flex-col items-center justify-start px-2 pb-2 pt-2 sm:px-3">
        <GameCanvas />
      </section>

      {showReward && lastWin ? (
        <VisualFlashPass payload={lastWin} onPlayAgain={handlePlayAgain} />
      ) : null}
    </main>
  );
}
