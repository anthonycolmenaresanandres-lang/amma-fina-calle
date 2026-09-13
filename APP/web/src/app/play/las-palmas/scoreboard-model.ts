import { currentShotNumber, ratingFor, type MatchState } from "@/penalty/engine/match";
import type { InputMode } from "@/penalty/types";

export function scoreboardModel(match: MatchState, totalShots: number, input: InputMode) {
  const shot = currentShotNumber(match, totalShots);
  const outcome = match.phase === "result" ? match.results.at(-1) : undefined;
  const message = match.phase === "gameover"
    ? `${match.goals}/${totalShots} · ${ratingFor(match.goals, totalShots)}`
    : outcome === "goal" ? "¡GOL!" : outcome === "save" ? "SAVED!" : outcome === "miss" ? "MISSED!"
    : match.phase === "shooting" ? "Here it comes…"
    : input === "tap" ? "Tap inside the goal to shoot" : "Swipe from the ball toward the goal";
  return {
    shot, outcome, message,
    shotLabel: match.phase === "gameover" ? "FULL TIME" : `SHOT ${shot} OF ${totalShots}`,
    attempts: Array.from({ length: totalShots }, (_, i) => ({
      number: i + 1,
      state: match.results[i] ?? (i === match.shotsTaken && match.phase !== "gameover" ? "current" : "pending"),
    })),
  };
}
