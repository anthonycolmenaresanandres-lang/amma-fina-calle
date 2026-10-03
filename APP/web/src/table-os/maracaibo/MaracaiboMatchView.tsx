"use client";

import type { RefObject } from "react";
import { Check } from "lucide-react";
import type { TeamOption } from "../game";
import type { RoomMode } from "../realtime";
import { TeamMark } from "./MaracaiboMarks";
import styles from "./maracaibo.module.css";

type Role = Readonly<{ playerId: string; team: "home" | "away"; role: "goalkeeper" | "forward"; label: string }>;
type Props = {
  tableId: string;
  home: TeamOption;
  away: TeamOption;
  roles: readonly Role[];
  selectedRole: Role;
  joined: boolean;
  mode: RoomMode;
  participants: number;
  isHost: boolean;
  score: { home: number; away: number; timeRemainingMs: number; phase: string };
  gameReady: boolean;
  gameError: string | null;
  mountRef: RefObject<HTMLDivElement | null>;
  duplicateRole: boolean;
  onRole: (role: Role) => void;
  onJoin: () => void;
  onReset: () => void;
  onNavigate?: (view: "menu" | "service") => void;
};

export function MaracaiboMatchView(props: Props): React.JSX.Element {
  const { home, away, roles, selectedRole, joined, mode, participants, isHost, score, gameReady, gameError, mountRef, duplicateRole, onRole, onJoin, onReset, onNavigate } = props;
  const teams = { home, away };
  const roleName = (role: Role) => teams[role.team].label + " " + (role.role === "goalkeeper" ? "keeper" : "forward");
  const finished = score.phase === "finished";
  const phaseLabel = score.phase === "ready" ? "Ready" : score.phase === "goal" ? "Goal" : score.phase === "finished" ? "Full time" : "Playing";
  const connectionLabel = mode === "shared" ? "Room connection open" : mode === "local" ? "Practice on this browser" : "Connecting…";
  function leaveFor(view: "menu" | "service"): void {
    if (!joined || finished || window.confirm("Leave this match? Your place and score may not be restored when you return.")) onNavigate?.(view);
  }

  if (!joined) {
    return (
      <div>
        <p className={styles.lobbyIntro}>90-second football prototype.</p>
        <div className={styles.teams}>{(["home", "away"] as const).map((side) => <div key={side} className={styles.teamHeading} data-side={side}><TeamMark team={side} /><strong>{teams[side].label}</strong></div>)}</div>
        <div className={styles.roles} role="group" aria-label="Choose your team and role">{[roles[0], roles[3], roles[1], roles[2]].map((role) => <button key={role.playerId} type="button" className={styles.roleButton} aria-label={roleName(role)} aria-pressed={selectedRole.playerId === role.playerId} onClick={() => onRole(role)}><span>{role.role === "goalkeeper" ? "Keeper" : "Forward"}</span>{selectedRole.playerId === role.playerId ? <Check aria-hidden="true" size={16} /> : null}</button>)}</div>
        <div className={styles.joinAction}><button type="button" className={styles.primaryButton} onClick={onJoin}>Start match</button></div>
        <p className={styles.prototypeNote}>Local practice available. Shared play, reconnection &amp; privacy unverified.</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.scoreboard} hidden={finished} aria-label="Match score">
        <div className={styles.scoreTeam}><TeamMark team="home" /><div><span>{home.label}</span><strong>{score.home}</strong></div></div>
        <div className={styles.clock}><span>{phaseLabel}</span><strong>{Math.ceil(score.timeRemainingMs / 1000)}s</strong></div>
        <div className={styles.scoreTeam}><TeamMark team="away" /><div><span>{away.label}</span><strong>{score.away}</strong></div></div>
      </div>
      <div className={styles.connection} hidden={finished}><span>{roleName(selectedRole)}</span><span role="status" aria-live="polite">{connectionLabel}</span></div>
      {/* Keep the same mount through results/rematch so replay never creates a second game. */}
      <div className={styles.gameStage} ref={mountRef} hidden={finished} aria-label={"Football field. You control " + roleName(selectedRole) + "."}>
        {!gameReady && !gameError ? <span className={styles.loading} role="status">Preparing your pitch…</span> : null}
        {gameError ? <span className={styles.gameError} role="alert">The match couldn’t open. Return to the menu and try again.</span> : null}
      </div>
      {finished ? (
        <section className={styles.results} aria-labelledby="match-result-title" aria-live="polite">
          <h2 id="match-result-title">{score.home === score.away ? "Even match." : "Full time."}</h2>
          <div className={styles.resultScore}><div><strong>{score.home}</strong><span>{home.label}</span></div><span aria-hidden="true">–</span><div><strong>{score.away}</strong><span>{away.label}</span></div></div>
          <p>Session result · No saved leaderboard or rewards.</p>
          <button type="button" className={styles.primaryButton} onClick={onReset}>Play again</button>
          {onNavigate ? <div className={styles.matchLinks}><button type="button" className={styles.quietButton} onClick={() => leaveFor("menu")}>Menu</button><button type="button" className={styles.quietButton} onClick={() => leaveFor("service")}>Service</button></div> : null}
        </section>
      ) : (
        <>
          <div className={styles.gameControls}><span>Slide to move · Tap to shoot<br />Keys: ↑ / ↓ · Space / Enter</span><button type="button" className={styles.quietButton} onClick={() => { if (window.confirm("Reset this match? The current score will be cleared if the host receives the request.")) onReset(); }}>Reset</button></div>
          <p className={styles.prototypeNote}>{mode === "shared" ? participants + " connections · " + (isHost ? "Hosting here." : "Hosted on another phone.") + " Cross-phone play, recovery & privacy unverified." : "Cross-phone play, recovery & privacy unverified."}</p>
          {onNavigate ? <div className={styles.matchLinks}><button type="button" className={styles.quietButton} onClick={() => leaveFor("menu")}>Leave match</button><button type="button" className={styles.quietButton} onClick={() => leaveFor("service")}>Service</button></div> : null}
        </>
      )}
      {duplicateRole ? <p className={styles.roleWarning} role="status">This role is shared by two phones. Return home and choose another. Seats are not reserved.</p> : null}
    </div>
  );
}
