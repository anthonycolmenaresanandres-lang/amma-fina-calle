"use client";

import type { FootballSession } from "./football-session";
import type { TableFootballVenueSkin, CountryColorTeam } from "../game/types";

/** One silent canvas per mount; all simulation and authority live outside React/Phaser. */
export async function mountFootballView(parent: HTMLElement, session: FootballSession, skin: TableFootballVenueSkin, home: CountryColorTeam, away: CountryColorTeam): Promise<{ destroy: () => void; move: (value: -1 | 0 | 1) => void; kick: () => void }> {
  const [{ default: Phaser }, { TableFootballScene }] = await Promise.all([import("phaser"), import("../game/TableFootballScene")]);
  let sequence = 0;
  let buttonMove: -1 | 0 | 1 = 0;
  let held = false;
  let lastHeldAt = 0;
  const input = (move: -1 | 0 | 1, kick: boolean) => session.input({ sequence: ++sequence, move, kick });
  const scene = new TableFootballScene({
    skin, teams: { home, away }, hideHud: true,
    getState: () => session.state, localPlayerId: () => session.seat ?? "",
    onInput: (message) => { if (!held) input(message.move, message.kick); },
    onFrame: (delta) => {
      if (held && performance.now() - lastHeldAt >= 250) { lastHeldAt = performance.now(); input(buttonMove, false); }
      session.frame(delta);
    },
  });
  const game = new Phaser.Game({ type: Phaser.AUTO, parent, width: parent.clientWidth || 390, height: parent.clientHeight || 420, backgroundColor: "#101112", scene: [scene], audio: { noAudio: true }, scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH } });
  const release = () => { held = false; buttonMove = 0; input(0, false); };
  window.addEventListener("blur", release);
  return {
    move: (value) => { buttonMove = value; held = value !== 0; lastHeldAt = performance.now(); input(value, false); },
    kick: () => input(buttonMove, true),
    destroy: () => { window.removeEventListener("blur", release); game.destroy(true); },
  };
}
