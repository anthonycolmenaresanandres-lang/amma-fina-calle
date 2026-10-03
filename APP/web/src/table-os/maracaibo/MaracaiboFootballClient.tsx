"use client";

import { useEffect, useRef, useState } from "react";
import { countryColorTeamFromOption, tableFootballSkinFromMatchSkin } from "../game/types";
import type { TableOsVenue } from "../venue-config";
import { FootballSession, FOOTBALL_SEATS, type FootballSeat, type FootballMember } from "./football-session";
import { connectFootballPeers, type FootballPeerHandle, type FootballPeerStatus } from "./football-peers";
import { mountFootballView } from "./football-view";
import { TeamMark } from "./MaracaiboMarks";
import styles from "./maracaibo.module.css";

type Props = { venue: TableOsVenue; tableId: string; onNavigate?: (view: "menu" | "service") => void };
type ViewHandle = Awaited<ReturnType<typeof mountFootballView>>;
const INITIAL = { home: 0, away: 0, timeRemainingMs: 90_000, phase: "ready" };
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newCode(): string { return [...crypto.getRandomValues(new Uint8Array(6))].map((byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join(""); }

export function MaracaiboFootballClient({ venue, tableId, onNavigate }: Props): React.JSX.Element {
  const mount = useRef<HTMLDivElement>(null);
  const view = useRef<ViewHandle | null>(null);
  const sessionRef = useRef<FootballSession | null>(null);
  const [code, setCode] = useState("");
  const [seat, setSeat] = useState<FootballSeat>("home-forward");
  const [joined, setJoined] = useState<{ code: string; seat: FootballSeat; practice: boolean; created: boolean } | null>(null);
  const [status, setStatus] = useState<FootballPeerStatus>("connecting");
  const [count, setCount] = useState(1);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(INITIAL);
  const home = venue.teams[0];
  const away = venue.teams[1] ?? home;
  const teamFor = (value: FootballSeat) => value.startsWith("home") ? home : away;
  const seatName = (value: FootballSeat) => `${teamFor(value).label} ${value.endsWith("goalkeeper") ? "keeper" : "forward"}`;

  useEffect(() => {
    if (!joined || !mount.current) return;
    let cancelled = false;
    let peers: FootballPeerHandle | null = null;
    let session: FootballSession | null = null;
    let pendingRoster: readonly FootballMember[] = [];
    const options = { roomId: `${venue.id}:${tableId}:${joined.code}`, mode: "2v2" as const, home: countryColorTeamFromOption(home), away: countryColorTeamFromOption(away), durationSeconds: 90 };
    if (!joined.practice) {
      peers = connectFootballPeers(venue.id, tableId, joined.code, joined.seat, {
        onRoster: (roster) => { pendingRoster = roster; session?.roster(roster); },
        onPacket: (sender, value) => session?.receive(sender, value) ?? false,
        isHost: () => session?.isHost ?? false,
        onStatus: (next) => { if (!cancelled) setStatus(next); },
      });
    }
    const id = peers?.id ?? crypto.randomUUID();
    session = new FootballSession(id, options, (packet, to) => peers?.send(packet, to), () => performance.now(), joined.created);
    sessionRef.current = session;
    session.roster(joined.practice ? [{ id, joinedAt: Date.now(), preferredSeat: joined.seat, connected: true, active: true }] : pendingRoster);
    void mountFootballView(mount.current, session, tableFootballSkinFromMatchSkin(venue.skin), options.home, options.away).then((handle) => {
      if (cancelled) { handle.destroy(); return; }
      view.current = handle;
      setLoaded(true);
    }).catch(() => { if (!cancelled) setError("The pitch couldn’t open. Try again or return to the menu."); });
    const update = setInterval(() => {
      if (!session || cancelled) return;
      setReady(session.ready);
      setCount(session.members.length);
      if (session.seat) setSeat(session.seat);
      const state = session.state;
      setScore((previous) => previous.home === state.score.home && previous.away === state.score.away && previous.phase === state.phase && Math.ceil(previous.timeRemainingMs / 1000) === Math.ceil(state.timeRemainingMs / 1000) ? previous : { ...state.score, timeRemainingMs: state.timeRemainingMs, phase: state.phase });
    }, 100);
    return () => { cancelled = true; clearInterval(update); peers?.destroy(); view.current?.destroy(); view.current = null; sessionRef.current = null; };
  }, [joined, venue.id, venue.skin, tableId, home, away]);

  function start(practice: boolean, fresh = false): void {
    const roomCode = fresh ? newCode() : code || newCode();
    setCode(roomCode); setError(null); setLoaded(false); setReady(false); setScore(INITIAL); setStatus("connecting");
    setJoined({ code: roomCode, seat, practice, created: practice || fresh || !code });
  }
  function leave(): void { setJoined(null); setLoaded(false); setReady(false); setError(null); }
  const finished = score.phase === "finished";
  const blocked = status === "full" || status === "unavailable";
  const connection = joined?.practice ? "Practice · computer players" : !ready ? "Waiting for phones…" : status === "table" ? `${count}/4 phones · live match` : `${count}/4 browsers · same device only`;

  if (!joined) return (
    <div>
      <p className={styles.lobbyIntro}>90 seconds. Lago vs Rayo. Your table, your match.</p>
      <div className={styles.teams}>{(["home", "away"] as const).map((side) => <div key={side} className={styles.teamHeading} data-side={side}><TeamMark team={side} /><strong>{side === "home" ? home.label : away.label}</strong></div>)}</div>
      <div className={styles.roles} role="group" aria-label="Choose your team and role">{[FOOTBALL_SEATS[0], FOOTBALL_SEATS[3], FOOTBALL_SEATS[1], FOOTBALL_SEATS[2]].map((role) => <button type="button" key={role} className={styles.roleButton} aria-pressed={seat === role} aria-label={seatName(role)} onClick={() => setSeat(role)}>{role.endsWith("goalkeeper") ? "Keeper" : "Forward"}</button>)}</div>
      <label className={styles.roomLabel} htmlFor="maracaibo-match-code">Joining friends? Enter their match code.</label>
      <input id="maracaibo-match-code" name="matchCode" className={styles.roomCodeInput} value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, "").slice(0, 6))} maxLength={6} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="Example: ABC234…" aria-describedby="maracaibo-room-help" />
      <p id="maracaibo-room-help" className={styles.prototypeNote}>Each guest opens this table’s QR. Share the code to play together. Taken roles are assigned an open seat.</p>
      <div className={styles.joinAction}><button type="button" className={styles.primaryButton} disabled={code.length > 0 && code.length !== 6} onClick={() => start(false)}>{code ? "Join match" : "Create match"}</button></div>
      <button type="button" className={styles.quietButton} onClick={() => start(true)}>Practice with computer players</button>
      {code ? <button type="button" className={styles.quietButton} onClick={() => start(false, true)}>Create a new match</button> : null}
    </div>
  );

  return (
    <div>
      <div className={styles.matchRoom}><span>{joined.practice ? "Practice" : "Match code"}</span>{!joined.practice ? <strong>{joined.code}</strong> : null}<button type="button" className={styles.quietButton} onClick={leave}>Leave</button></div>
      {blocked || error ? <div role="alert" className={styles.roleWarning}><p>{error ?? (status === "full" ? "Four players are already seated. Use a new code for another match." : "The phones couldn’t connect. Try the same Wi-Fi, rejoin, or practice.")}</p><button type="button" className={styles.quietButton} onClick={leave}>Back to lobby</button></div> : null}
      <div className={styles.scoreboard} hidden={finished} aria-label="Match score">
        <div className={styles.scoreTeam}><TeamMark team="home" /><div><span>{home.label}</span><strong>{score.home}</strong></div></div>
        <div className={styles.clock}><span>{score.phase === "ready" ? "Move to start" : score.phase === "goal" ? "Goal!" : "Playing"}</span><strong>{Math.ceil(score.timeRemainingMs / 1000)}s</strong></div>
        <div className={styles.scoreTeam}><TeamMark team="away" /><div><span>{away.label}</span><strong>{score.away}</strong></div></div>
      </div>
      <div className={styles.connection} hidden={finished}><span>{seatName(seat)}</span><span role="status" aria-live="polite">{connection}</span></div>
      <div className={styles.gameStage} ref={mount} hidden={finished} aria-label={`Football field. You control ${seatName(seat)}.`}>{!loaded ? <span className={styles.loading} role="status">Preparing the pitch…</span> : null}</div>
      {finished ? <section className={styles.results} aria-live="polite"><h2>{score.home === score.away ? "Even match." : `${score.home > score.away ? home.label : away.label} wins.`}</h2><div className={styles.resultScore}><div><strong>{score.home}</strong><span>{home.label}</span></div><span aria-hidden="true">–</span><div><strong>{score.away}</strong><span>{away.label}</span></div></div><button type="button" className={styles.primaryButton} disabled={!ready || blocked} onClick={() => sessionRef.current?.again()}>Play again</button></section> : <>
        <div className={styles.touchControls} aria-label="Football controls">
          {([-1, 1] as const).map((direction) => <button type="button" key={direction} className={styles.moveButton} disabled={!ready || blocked} aria-label={direction === -1 ? "Move up" : "Move down"} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); view.current?.move(direction); }} onPointerUp={() => view.current?.move(0)} onPointerCancel={() => view.current?.move(0)} onLostPointerCapture={() => view.current?.move(0)} onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); view.current?.move(direction); } }} onKeyUp={() => view.current?.move(0)} onBlur={() => view.current?.move(0)}>{direction === -1 ? "↑" : "↓"}</button>)}
          <button type="button" className={styles.shootButton} disabled={!ready || blocked} onClick={() => view.current?.kick()}>Shoot</button>
        </div><p className={styles.prototypeNote}>Slide the pitch or hold ↑ / ↓. Tap to shoot. Empty seats play for the computer.</p>
      </>}
      {onNavigate ? <div className={styles.matchLinks}><button type="button" className={styles.quietButton} onClick={() => onNavigate("menu")}>Menu</button><button type="button" className={styles.quietButton} onClick={() => onNavigate("service")}>Service</button></div> : null}
    </div>
  );
}
