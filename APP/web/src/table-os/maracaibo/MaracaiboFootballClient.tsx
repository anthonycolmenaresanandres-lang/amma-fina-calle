"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { countryColorTeamFromOption, tableFootballSkinFromMatchSkin } from "../game/types";
import { tableLabel, type TableOsVenue } from "../venue-config";
import { FootballSession, type FootballSeat, type FootballMember } from "./football-session";
import { connectFootballPeers, type FootballPeerHandle, type FootballPeerStatus } from "./football-peers";
import { mountFootballView } from "./football-view";
import { TeamMark } from "./MaracaiboMarks";
import styles from "./maracaibo.module.css";

type Props = { venue: TableOsVenue; tableId: string; onNavigate?: (view: "menu" | "service") => void; onActiveChange?: (active: boolean) => void };
type ViewHandle = Awaited<ReturnType<typeof mountFootballView>>;
type Device = "checking" | "phone" | "desktop";
const INITIAL = { home: 0, away: 0, timeRemainingMs: 90_000, phase: "ready" };
const WAIT_LIMIT_MS = 15_000;
const getServerDevice = (): Device => "checking";
const getDevice = (): Device => typeof window === "undefined" ? "checking" : window.matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 0 ? "phone" : "desktop";
function subscribeToDevice(change: () => void): () => void {
  const query = window.matchMedia("(pointer: coarse)");
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
}

function TableInvitation({ url, title, desktop = false }: { url: string; title: string; desktop?: boolean }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState("");
  const [message, setMessage] = useState("");
  const showQR = desktop || open;
  useEffect(() => {
    if (!showQR || !url) return;
    let cancelled = false;
    void import("qrcode").then((module) => module.default.toDataURL(url, { width: 256, margin: 2, errorCorrectionLevel: "M", color: { dark: "#101112", light: "#ffffff" } })).then((data) => { if (!cancelled) setQr(data); }).catch(() => { if (!cancelled) setMessage("Use the table link below."); });
    return () => { cancelled = true; };
  }, [showQR, url]);
  async function copy(): Promise<void> {
    try { await navigator.clipboard.writeText(url); setMessage("Table link copied."); }
    catch { setOpen(true); setMessage("Select the table link below to copy it."); }
  }
  async function invite(): Promise<void> {
    if (navigator.share) {
      try { await navigator.share({ title, text: "Join our table match.", url }); return; }
      catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
    }
    setOpen(true);
  }
  return (
    <div className={desktop ? styles.phoneHandoff : styles.tableInvite}>
      {desktop ? <><h2>Play on your phone</h2><p>Scan this table’s QR, then tap Play. Your friends join the same match.</p></> : <div className={styles.inviteActions}><button type="button" className={styles.quietButton} onClick={() => void invite()}>Invite friends</button><button type="button" className={styles.quietButton} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Hide table QR" : "Show table QR"}</button></div>}
      {showQR ? <div className={styles.tableLinkPanel}>{qr ? <figure className={styles.tableQr}>
        {/* Generated locally from the permanent table route. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} width={256} height={256} alt={`QR code for ${title}`} />
      </figure> : <p role="status">Preparing the table QR…</p>}<a className={styles.tableUrl} href={url} target="_blank" rel="noopener noreferrer">{url}</a><button type="button" className={styles.quietButton} onClick={() => void copy()}>Copy table link</button></div> : null}
      <p className={styles.inviteStatus} role="status" aria-live="polite">{message}</p>
    </div>
  );
}

export function MaracaiboFootballClient({ venue, tableId, onNavigate, onActiveChange }: Props): React.JSX.Element {
  const device = useSyncExternalStore(subscribeToDevice, getDevice, getServerDevice);
  const mount = useRef<HTMLDivElement>(null);
  const view = useRef<ViewHandle | null>(null);
  const sessionRef = useRef<FootballSession | null>(null);
  const pointerOwner = useRef<number | null>(null);
  const keyboardOwner = useRef<-1 | 1 | null>(null);
  const [seat, setSeat] = useState<FootballSeat | null>(null);
  const [joined, setJoined] = useState<{ practice: boolean; attempt: number } | null>({ practice: false, attempt: 0 });
  const [status, setStatus] = useState<FootballPeerStatus>("connecting");
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [hasConnected, setHasConnected] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(INITIAL);
  const home = venue.teams[0];
  const away = venue.teams[1] ?? home;
  const currentTable = tableLabel(tableId);
  const tableUrl = device === "checking" ? "" : `${window.location.origin}/table/${encodeURIComponent(venue.id)}/${encodeURIComponent(tableId)}`;
  const seatName = (value: FootballSeat) => `${value.startsWith("home") ? home.label : away.label} ${value.endsWith("goalkeeper") ? "keeper" : "forward"}`;
  const active = device === "phone" && !!joined && (score.phase === "playing" || score.phase === "goal");

  useEffect(() => {
    onActiveChange?.(active);
    return () => onActiveChange?.(false);
  }, [active, onActiveChange]);

  useEffect(() => {
    // A desktop visit never creates a peer, session, timer or Phaser canvas.
    if (device !== "phone" || !joined || !mount.current) return;
    let cancelled = false;
    let peers: FootballPeerHandle | null = null;
    let session: FootballSession | null = null;
    let mountedView: ViewHandle | null = null;
    let pendingRoster: readonly FootballMember[] = [];
    let discoveryReady = false;
    let waitingSince = performance.now();
    const options = { roomId: `${venue.id}:${tableId}:${joined.practice ? "practice" : "table"}`, mode: "2v2" as const, home: countryColorTeamFromOption(home), away: countryColorTeamFromOption(away), durationSeconds: 90 };
    if (!joined.practice) {
      peers = connectFootballPeers(venue.id, tableId, "table", "auto", {
        onRoster: (roster) => { pendingRoster = roster; session?.roster(roster); },
        onPacket: (sender, value) => session?.receive(sender, value) ?? false,
        isHost: () => session?.isHost ?? false,
        getAuthority: () => session?.authority,
        onAuthority: (sender, manifest) => session?.observeAuthority(sender, manifest) ?? false,
        onDiscoveryReady: () => { discoveryReady = true; session?.completeDiscovery(); },
        onStatus: (next) => { if (!cancelled) setStatus(next); },
      });
    }
    const id = peers?.id ?? crypto.randomUUID();
    session = new FootballSession(id, options, (packet, to) => peers?.send(packet, to), () => performance.now(), joined.practice ? true : "automatic", "steer");
    sessionRef.current = session;
    session.roster(joined.practice ? [{ id, joinedAt: Date.now(), preferredSeat: "auto", connected: true, active: true }] : pendingRoster);
    if (discoveryReady) session.completeDiscovery();
    void mountFootballView(mount.current, session, tableFootballSkinFromMatchSkin(venue.skin), options.home, options.away).then((handle) => {
      if (cancelled) { handle.destroy(); return; }
      mountedView = handle;
      view.current = handle;
      setLoaded(true);
    }).catch(() => { if (!cancelled) setError("The pitch couldn’t open. Try again or return to the menu."); });
    const update = setInterval(() => {
      if (!session || cancelled) return;
      const nextReady = session.ready && mountedView !== null;
      setReady(nextReady);
      if (nextReady) { waitingSince = performance.now(); setHasConnected(true); setTimedOut(false); }
      else if (performance.now() - waitingSince >= WAIT_LIMIT_MS) setTimedOut(true);
      setCount(session.members.length);
      setSeat(session.seat ?? null);
      setRecovered(session.conflictRecovered);
      const state = session.state;
      setScore((previous) => previous.home === state.score.home && previous.away === state.score.away && previous.phase === state.phase && Math.ceil(previous.timeRemainingMs / 1000) === Math.ceil(state.timeRemainingMs / 1000) ? previous : { ...state.score, timeRemainingMs: state.timeRemainingMs, phase: state.phase });
    }, 100);
    return () => {
      cancelled = true;
      clearInterval(update);
      peers?.destroy();
      mountedView?.destroy();
      if (view.current === mountedView) view.current = null;
      if (sessionRef.current === session) sessionRef.current = null;
      pointerOwner.current = keyboardOwner.current = null;
    };
  }, [device, joined, venue.id, venue.skin, tableId, home, away]);

  function start(practice: boolean): void {
    setError(null); setLoaded(false); setReady(false); setHasConnected(false); setTimedOut(false); setRecovered(false); setSeat(null); setCount(0); setScore(INITIAL); setStatus("connecting");
    setJoined((previous) => ({ practice, attempt: (previous?.attempt ?? 0) + 1 }));
  }
  function leave(): void {
    const phase = sessionRef.current?.state.phase;
    if ((phase === "playing" || phase === "goal") && !window.confirm("Leave this match? Your place will be available to someone else.")) return;
    setJoined(null); setLoaded(false); setReady(false); setError(null); setTimedOut(false);
  }
  const finished = score.phase === "finished";
  const blocked = status === "full" || status === "unavailable" || timedOut || !!error;
  const waiting = hasConnected ? `Reconnecting to ${currentTable}…` : `Joining ${currentTable}…`;
  const connection = joined?.practice ? "Practice · computer players" : !ready ? waiting : status === "table" ? `${count}/4 players · connected` : `${count}/4 players · this device only`;
  const navigation = onNavigate ? <div className={styles.matchLinks}><button type="button" className={styles.quietButton} onClick={() => onNavigate("menu")}>Menu</button><button type="button" className={styles.quietButton} onClick={() => onNavigate("service")}>Service</button></div> : null;

  if (device === "checking") return <p className={styles.lobbyIntro} role="status">Opening table match…</p>;
  if (device === "desktop") return <><TableInvitation url={tableUrl} title={`${venue.name} ${currentTable}`} desktop />{navigation}</>;
  if (!joined) return <div><p className={styles.lobbyIntro}>90 seconds. {home.label} vs {away.label}. Join the people at {currentTable}.</p><div className={styles.joinAction}><button type="button" className={styles.primaryButton} onClick={() => start(false)}>Join table match</button></div><button type="button" className={styles.quietButton} onClick={() => start(true)}>Play with computers</button>{navigation}</div>;

  return (
    <div>
      <div className={styles.matchRoom}><span>{joined.practice ? "Practice" : `${currentTable} match`}</span><button type="button" className={styles.quietButton} onClick={leave}>Leave</button></div>
      {blocked ? <div role="alert" className={styles.roleWarning}><p>{error ?? (status === "full" ? "This table’s four places are taken. Try again when someone leaves, or play with computers." : "The table match couldn’t connect. Try again or play with computers.")}</p><div className={styles.recoveryActions}><button type="button" className={styles.quietButton} onClick={() => start(false)}>Retry connection</button><button type="button" className={styles.quietButton} onClick={() => start(true)}>Play with computers</button></div></div> : null}
      <div className={styles.scoreboard} hidden={finished} aria-label="Match score">
        <div className={styles.scoreTeam}><TeamMark team="home" /><div><span>{home.label}</span><strong>{score.home}</strong></div></div>
        <div className={styles.clock}><span>{!ready ? "Connecting…" : score.phase === "ready" ? "Drag to start" : score.phase === "goal" ? "Goal!" : "Playing"}</span><strong>{Math.ceil(score.timeRemainingMs / 1000)}s</strong></div>
        <div className={styles.scoreTeam}><TeamMark team="away" /><div><span>{away.label}</span><strong>{score.away}</strong></div></div>
      </div>
      <div className={styles.connection} hidden={finished}><span>{ready && seat ? `You’re ${seatName(seat)}` : "Finding your place…"}</span><span role="status" aria-live="polite">{connection}</span></div>
      {recovered ? <p className={styles.recoveryNote} role="status">Reconnected to this table’s match.</p> : null}
      <div className={styles.gameStage} ref={mount} hidden={finished} aria-label={seat ? `Football field. You control ${seatName(seat)}. Drag to move; shooting is automatic.` : "Football field. Joining your table match."}>{!loaded || !ready || blocked ? <span className={styles.loading} role="status">{blocked ? "The match is unavailable." : !loaded ? "Preparing the pitch…" : waiting}</span> : null}</div>
      {finished ? <section className={styles.results} aria-live="polite"><h2>{score.home === score.away ? "Even match." : `${score.home > score.away ? home.label : away.label} wins.`}</h2><div className={styles.resultScore}><div><strong>{score.home}</strong><span>{home.label}</span></div><span aria-hidden="true">–</span><div><strong>{score.away}</strong><span>{away.label}</span></div></div><button type="button" className={styles.primaryButton} disabled={!ready || blocked} onClick={() => sessionRef.current?.again()}>Play again</button></section> : <>
        <div className={styles.touchControls} aria-label="Alternative movement controls">
          {([-1, 1] as const).map((direction) => <button type="button" key={direction} className={styles.moveButton} disabled={!ready || blocked} aria-label={direction === -1 ? "Move up" : "Move down"}
            onPointerDown={(event) => { if (pointerOwner.current !== null) return; pointerOwner.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); view.current?.move(direction, "pointer"); }}
            onPointerUp={(event) => { if (pointerOwner.current === event.pointerId) { pointerOwner.current = null; view.current?.move(0, "pointer"); } }}
            onPointerCancel={(event) => { if (pointerOwner.current === event.pointerId) { pointerOwner.current = null; view.current?.move(0, "pointer"); } }}
            onLostPointerCapture={(event) => { if (pointerOwner.current === event.pointerId) { pointerOwner.current = null; view.current?.move(0, "pointer"); } }}
            onKeyDown={(event) => { if ((event.key === " " || event.key === "Enter") && !event.repeat && keyboardOwner.current === null) { event.preventDefault(); keyboardOwner.current = direction; view.current?.move(direction, "keyboard"); } }}
            onKeyUp={(event) => { if ((event.key === " " || event.key === "Enter") && keyboardOwner.current === direction) { event.preventDefault(); keyboardOwner.current = null; view.current?.move(0, "keyboard"); } }}
            onBlur={() => { if (keyboardOwner.current === direction) { keyboardOwner.current = null; view.current?.move(0, "keyboard"); } }}>{direction === -1 ? "↑" : "↓"}</button>)}
        </div><p className={styles.prototypeNote}>Drag to move. Your player shoots automatically.<br />Empty places play for the computer.</p>
      </>}
      {ready && !blocked && !joined.practice ? <TableInvitation url={tableUrl} title={`${venue.name} ${currentTable}`} /> : null}
      {navigation}
    </div>
  );
}
