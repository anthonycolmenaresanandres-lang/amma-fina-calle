"use client";

import { Check, Shield, TreePalm, X } from "lucide-react";
import type { MatchState } from "@/penalty/engine/match";
import type { InputMode } from "@/penalty/types";
import { scoreboardModel } from "./scoreboard-model";
import styles from "./CantinaScoreboard.module.css";

export default function CantinaScoreboard({ match, totalShots, input, title = "Cantina Shootout" }: { match: MatchState; totalShots: number; input: InputMode; title?: string }) {
  const view = scoreboardModel(match, totalShots, input);
  return (
    <section className={styles.board} aria-label={`${title} scoreboard`} data-scoreboard="cantina" data-phase={match.phase}>
      <div className={styles.marquee}><TreePalm aria-hidden="true" /><h2>{title}</h2><TreePalm aria-hidden="true" /></div>
      <div className={styles.readout}>
        <div className={styles.score}><span>GOALS</span><strong key={match.goals} className={match.goals > 0 ? styles.scorePop : undefined} data-goals={match.goals}>{match.goals}</strong></div>
        <div className={styles.round}>
          <p data-shot={view.shot}>{view.shotLabel}</p>
          <ol className={styles.attempts} aria-label="Shot history">
            {view.attempts.map(attempt => (
              <li key={attempt.number} data-outcome={attempt.state} aria-label={`Shot ${attempt.number}: ${attempt.state === "save" ? "saved" : attempt.state === "miss" ? "missed" : attempt.state}`}>
                {attempt.state === "goal" ? <Check aria-hidden="true" /> : attempt.state === "save" ? <Shield aria-hidden="true" /> : attempt.state === "miss" ? <X aria-hidden="true" /> : <span aria-hidden="true">{attempt.number}</span>}
              </li>
            ))}
          </ol>
          <div className={styles.legend} aria-hidden="true"><span><Check /> Goal</span><span><Shield /> Save</span><span><X /> Miss</span></div>
        </div>
      </div>
      <p className={styles.message} data-result={view.outcome ?? "none"} key={`${match.phase}-${match.results.length}`} aria-hidden="true">{view.message}</p>
      <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{match.phase === "shooting" ? "Shot in flight." : `${view.message}. ${match.goals} goals. ${view.shotLabel}.`}</p>
    </section>
  );
}
