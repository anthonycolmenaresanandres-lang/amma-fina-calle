"use client";

import type { RefObject } from "react";
import { Check } from "lucide-react";
import type { TeamOption } from "../game";
import type { RoomMode } from "../realtime";
import { tableLabel } from "../venue-config";
import { FlagArtwork, TeamMark } from "./MaracaiboMarks";
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
  const { tableId, home, away, roles, selectedRole, joined, mode, participants, isHost, score, gameReady, gameError, mountRef, duplicateRole, onRole, onJoin, onReset, onNavigate } = props;
  const teams = { home, away };
  const roleName = (role: Role) => `${teams[role.team].label} ${role.role === "goalkeeper" ? "keeper" : "forward"}`;
  const finished = score.phase === "finished";
  const phaseLabel = score.phase === "ready" ? "Ready" : score.phase === "goal" ? "Goal" : score.phase === "finished" ? "Full time" : "Playing";
  const connectionLabel = mode === "shared" ? "Room connection open" : mode === "local" ? "Practice on this browser" : "Connecting…";
  function leaveFor(view: "menu" | "service"): void {
    if (!joined || finished || window.confirm("Leave this match? Your place and score may not be restored when you return.")) onNavigate?.(view);
  }

  if (!joined) {
    return (
      <div>
        <div className={styles.lobbyHeading}><FlagArtwork className={styles.lobbyFlag} decorative /><h2>Same table.<br />Friendly rivalry.</h2><p>Try a role in the 90-second football prototype.</p></div>
        <div className={styles.matchMeta}><span>{tableLabel(tableId)} · Your table’s match</span><span>Four roles · Touch or keyboard</span></div>
        <div className={styles.teams}>{(["home", "away"] as const).map((side) => <div key={side} className={styles.teamHeading} data-side={side}><TeamMark team={side} /><div><strong>{teams[side].label}</strong><small>{side === "home" ? "The wave" : "The lightning"}</small></div></div>)}</div>
        <div className={styles.roles} role="group" aria-label="Choose your team and role">{[roles[0], roles[3], roles[1], roles[2]].map((role) => <button key={role.playerId} type="button" className={styles.roleButton} aria-pressed={selectedRole.playerId === role.playerId} onClick={() => onRole(role)}><strong>{roleName(role)}</strong><span>{selectedRole.playerId === role.playerId ? "Your selection" : role.role === "goalkeeper" ? "Defend the goal" : "Lead the attack"}</span>{selectedRole.playerId === role.playerId ? <Check aria-hidden="true" /> : null}</button>)}</div>
        <div className={styles.joinAction}><button type="button" className={styles.goldButton} onClick={onJoin}>Try {roleName(selectedRole)}</button></div>
        <p className={styles.controlHint}>Slide above or below center to move. Tap to shoot.<br />Keyboard: ↑ / ↓ to move · Space or Enter to shoot.</p>
        <p className={styles.prototypeNote}><strong>Game preview.</strong> Shared play, reconnection and party privacy still need verification. If a shared connection is unavailable, the game uses browser-local practice. No account, prizes or wagers.</p>
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
      <div className={styles.connection} hidden={finished}><strong>You · {roleName(selectedRole)}</strong><span role="status" aria-live="polite">{connectionLabel}</span></div>
      {/* Keep the same mount node through results/rematch; only its presentation changes. */}
      <div className={styles.gameStage} ref={mountRef} hidden={finished} aria-label={`Football field. You control ${roleName(selectedRole)}.`}>
        {!gameReady && !gameError ? <span className={styles.loading} role="status">Preparing your pitch…</span> : null}
        {gameError ? <span className={styles.gameError} role="alert">The match couldn’t open. Return to the menu and try again.</span> : null}
      </div>
      {finished ? (
        <section className={styles.results} aria-labelledby="match-result-title" aria-live="polite">
          <FlagArtwork className={styles.resultFlag} decorative />
          <p className={styles.eyebrow}>{tableLabel(tableId)} · Full time</p>
          <h2 id="match-result-title">{score.home === score.away ? "Even match. Run it back?" : "Good game. Great company."}</h2>
          <div className={styles.resultScore}><div><strong>{score.home}</strong><span>{home.label}</span></div><span aria-hidden="true">–</span><div><strong>{score.away}</strong><span>{away.label}</span></div></div>
          <p>Result shown by this game session. No persistent leaderboard or rewards.</p>
          <button type="button" className={styles.goldButton} onClick={onReset}>Play again</button>
          {onNavigate ? <div className={styles.matchLinks}><button type="button" className={styles.quietButton} onClick={() => leaveFor("menu")}>Back to the menu</button><button type="button" className={styles.quietButton} onClick={() => leaveFor("service")}>Need a hand?</button></div> : null}
        </section>
      ) : (
        <>
          <div className={styles.gameControls}><span>Slide to move · Tap to shoot<br />↑ / ↓ · Space / Enter</span><button type="button" className={styles.quietButton} onClick={() => { if (window.confirm("Reset this match? The current score will be cleared if the host receives the request.")) onReset(); }}>Reset match</button></div>
          <p className={styles.prototypeNote}>{mode === "shared" ? `${participants} connection${participants === 1 ? "" : "s"} reported · ${isHost ? "This phone hosts the match." : "Another phone hosts the match."} Cross-phone play and recovery remain unverified.` : "Local practice does not confirm play across separate phones. Shared play and recovery remain unverified."}</p>
          {onNavigate ? <div className={styles.matchLinks}><button type="button" className={styles.quietButton} onClick={() => leaveFor("menu")}>Leave match · Menu</button><button type="button" className={styles.quietButton} onClick={() => leaveFor("service")}>Leave match · Service preview</button></div> : null}
        </>
      )}
      {duplicateRole ? <p className={styles.roleWarning} role="status">Two phones selected this role. One player should return to the table home and choose another role. Seats are not reserved in this prototype.</p> : null}
    </div>
  );
}
