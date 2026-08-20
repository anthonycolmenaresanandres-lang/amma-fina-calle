"use client";

// Café Rush — client wrapper (start screen + Phaser mount). Styled in the
// Colattao editorial chrome (parchment/gold on espresso) — Colattao is the
// design standard; Las Palmas and A.J. Gator's skins reuse this SAME chrome
// tinted to their own approved palette (see CafeRushSkin.chrome in skins.ts).
// Mirrors PenaltyClient.tsx: skin picker, level picker, replay, dynamic Phaser.

import { useEffect, useMemo, useRef, useState } from "react";
import type { Game } from "phaser";
import { CAFERUSH_LEVELS } from "@/caferush/config";
import { CAFERUSH_SKINS, getCafeRushSkin } from "@/caferush/skins";
import type { CafeRushLevel, CafeRushSkin } from "@/caferush/types";

const toHex = (n: number): string => `#${n.toString(16).padStart(6, "0")}`;

export default function CafeRushClient({
  initialSkinId,
}: {
  initialSkinId?: string;
}): React.JSX.Element {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<CafeRushSkin>(() => getCafeRushSkin(initialSkinId));
  const [selectedLevel, setSelectedLevel] = useState<CafeRushLevel | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const chrome = selectedSkin.chrome;

  useEffect(() => {
    if (!selectedLevel || !mountRef.current || gameRef.current || typeof window === "undefined") {
      return;
    }

    let cancelled = false;

    const init = async () => {
      const [{ default: Phaser }, { CafeRushScene }] = await Promise.all([
        import("phaser"),
        import("@/caferush/CafeRushScene"),
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
        scene: [new CafeRushScene(selectedLevel, selectedSkin)],
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
      if (!game) return;
      game.destroy(true);
      gameRef.current = null;
    };
  }, [selectedLevel, selectedSkin, replayKey]);

  const selectLevel = (level: CafeRushLevel) => {
    setSelectedLevel(level);
    setReplayKey((n) => n + 1);
  };

  // Colattao-inherited chrome, applied inline so a skin swap re-tints instantly.
  const pageStyle = useMemo(
    () => ({
      backgroundColor: chrome.pageBg,
      color: chrome.text,
    }),
    [chrome],
  );

  if (!selectedLevel) {
    return (
      <main
        className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col px-5 py-6"
        style={pageStyle}
      >
        <section className="flex flex-1 flex-col justify-center">
          <p
            className="text-center text-[10px] font-semibold uppercase"
            style={{ color: chrome.accent, letterSpacing: "0.32em" }}
          >
            {selectedSkin.brandName}
          </p>

          <div className="mt-2 flex items-center justify-center gap-3">
            <span
              className="h-px w-8"
              style={{ background: `linear-gradient(90deg, transparent, ${chrome.accent})` }}
            />
            <span className="text-[10px] uppercase" style={{ color: chrome.subtext, letterSpacing: "0.28em" }}>
              Catch the Rush
            </span>
            <span
              className="h-px w-8"
              style={{ background: `linear-gradient(-90deg, transparent, ${chrome.accent})` }}
            />
          </div>

          <h1
            className="mt-4 text-center text-[28px] leading-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: chrome.text }}
          >
            {selectedSkin.skinName}
          </h1>

          <p className="mt-3 text-center text-sm leading-relaxed" style={{ color: chrome.subtext }}>
            Slide the {selectedSkin.catcherName} left and right. Catch the good orders. Duck the spills.
          </p>

          {selectedSkin.prospect ? (
            <p
              className="mt-3 text-center text-[10px] font-semibold uppercase"
              style={{ color: chrome.accent, letterSpacing: "0.18em" }}
            >
              Pending client approval · Demo only
            </p>
          ) : null}

          <div className="mt-6">
            <p
              className="text-center text-[10px] uppercase"
              style={{ color: chrome.subtext, letterSpacing: "0.28em" }}
            >
              Restaurant
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {CAFERUSH_SKINS.map((skin) => {
                const active = skin.id === selectedSkin.id;
                return (
                  <button
                    key={skin.id}
                    type="button"
                    onClick={() => setSelectedSkin(skin)}
                    aria-pressed={active}
                    className="rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase"
                    style={{
                      letterSpacing: "0.14em",
                      border: `1px solid ${chrome.border}`,
                      background: active ? chrome.accent : "transparent",
                      color: active ? chrome.onAccent : chrome.text,
                    }}
                  >
                    {skin.displayName}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {CAFERUSH_LEVELS.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => selectLevel(level)}
                className="px-4 py-4 text-left"
                style={{
                  background: chrome.panelBg,
                  border: `1px solid ${chrome.border}`,
                  color: chrome.text,
                }}
              >
                <span
                  className="block text-[11px] font-semibold uppercase"
                  style={{ color: chrome.accent, letterSpacing: "0.16em" }}
                >
                  Round {level.levelNumber}
                </span>
                <span
                  className="mt-1 block text-xl"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: chrome.text }}
                >
                  {level.levelName}
                </span>
                <span className="mt-2 block text-sm leading-relaxed" style={{ color: chrome.subtext }}>
                  {level.selectText}
                </span>
                <span className="mt-3 block text-[11px] uppercase" style={{ color: chrome.subtext, letterSpacing: "0.12em" }}>
                  {level.rules.durationSec}s · Target {level.rules.targetScore}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-[10px] uppercase" style={{ color: chrome.subtext, letterSpacing: "0.2em" }}>
            Primitive art · No client logo generated · Non-human items
          </p>
        </section>
      </main>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col" style={pageStyle}>
      <div className="px-4 py-2" style={{ borderBottom: `1px solid ${chrome.border}` }}>
        <p
          className="text-center text-[11px] font-semibold uppercase"
          style={{ color: chrome.accent, letterSpacing: "0.2em" }}
        >
          {selectedSkin.displayName} · Round {selectedLevel.levelNumber} — {selectedLevel.levelName}
          {selectedSkin.prospect ? (
            <span className="mt-1 block text-[9px]" style={{ letterSpacing: "0.16em" }}>
              Pending client approval · Demo only
            </span>
          ) : null}
        </p>
        <div className="mt-2 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedLevel(null)}
            className="px-3 py-1 text-[11px] uppercase"
            style={{
              letterSpacing: "0.14em",
              border: `1px solid ${chrome.border}`,
              color: chrome.text,
            }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setReplayKey((n) => n + 1)}
            className="px-3 py-1 text-[11px] uppercase"
            style={{
              letterSpacing: "0.14em",
              border: `1px solid ${chrome.border}`,
              background: chrome.accent,
              color: chrome.onAccent,
            }}
          >
            Replay
          </button>
        </div>
      </div>
      <div
        key={`${selectedSkin.id}-${selectedLevel.id}-${replayKey}`}
        ref={mountRef}
        className="h-[calc(100dvh-75px)] w-full"
      />
    </div>
  );
}
