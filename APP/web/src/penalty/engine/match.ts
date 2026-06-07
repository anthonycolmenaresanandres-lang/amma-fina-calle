// Pure match state + transitions for Penalty Shootout. No Phaser, no DOM.
// The scene drives timing/animation; this module owns the score/phase model so
// it can be reasoned about and unit-tested in isolation. Transitions mirror the
// V1 scene exactly (begin shot → record result → finish shot → game over/reset).

import type { ShotOutcome } from "../types";

export type MatchPhase = "aim" | "shooting" | "result" | "gameover";

export type MatchState = {
  phase: MatchPhase;
  shotsTaken: number;
  goals: number;
  results: ShotOutcome[];
};

export function createMatch(): MatchState {
  return { phase: "aim", shotsTaken: 0, goals: 0, results: [] };
}

/** Player committed a shot: begin the flight. */
export function beginShot(state: MatchState): MatchState {
  return { ...state, phase: "shooting" };
}

/** Ball reached the goal: lock the outcome and tally goals. */
export function recordResult(state: MatchState, outcome: ShotOutcome): MatchState {
  return {
    ...state,
    phase: "result",
    results: [...state.results, outcome],
    goals: state.goals + (outcome === "goal" ? 1 : 0),
  };
}

/** Result hold elapsed: advance to the next shot or end the match. */
export function finishShot(state: MatchState, totalShots: number): MatchState {
  const shotsTaken = state.shotsTaken + 1;
  return {
    ...state,
    shotsTaken,
    phase: shotsTaken >= totalShots ? "gameover" : "aim",
  };
}

/**
 * Shot number to display: the in-progress shot (shotsTaken + 1) until the match
 * ends, then the total. Matches the V1 score-counter behavior.
 */
export function currentShotNumber(state: MatchState, totalShots: number): number {
  return state.phase === "gameover"
    ? totalShots
    : Math.min(state.shotsTaken + 1, totalShots);
}

export function ratingFor(goals: number, totalShots: number): string {
  const total = totalShots;
  if (goals === total) return "PERFECT — Top Scorer";
  if (goals >= Math.ceil(total * 0.8)) return "Clinical finishing";
  if (goals >= Math.ceil(total * 0.6)) return "Solid from the spot";
  if (goals >= Math.ceil(total * 0.4)) return "Keep practicing";
  return "The keeper had your number";
}
