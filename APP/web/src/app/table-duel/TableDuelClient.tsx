"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./duel.module.css";

// Table Duel client. Talks to the room server (services/table-duel) over a
// WebSocket; the server keeps every fleet, so nothing secret reaches the phone.
// Without NEXT_PUBLIC_TABLE_DUEL_WS configured the page says so plainly instead
// of failing at a blank screen.

const GRID = 6;
const FLEET = [3, 2, 2] as const;

type Cell = { r: number; c: number };

type PlayerView = {
  id: string;
  name: string;
  ready: boolean;
  connected: boolean;
  out: boolean;
  hits: string[];
  misses: string[];
  boatsLeft: number;
};

type RoomView = {
  code: string;
  phase: "lobby" | "placing" | "firing" | "over";
  turnId: string | null;
  log: string[];
  you: { id: string; name: string; ready: boolean; out: boolean; boats: Cell[][]; hits: string[]; misses: string[] } | null;
  players: PlayerView[];
  winnerId: string | null;
};

const key = (r: number, c: number) => `${r},${c}`;
const cells = Array.from({ length: GRID * GRID }, (_, i) => ({ r: Math.floor(i / GRID), c: i % GRID }));

/** Cells a boat of `size` would cover from this head, or null if it won't fit. */
function span(head: Cell, size: number, horizontal: boolean): Cell[] | null {
  const out: Cell[] = [];
  for (let i = 0; i < size; i += 1) {
    const cell = horizontal ? { r: head.r, c: head.c + i } : { r: head.r + i, c: head.c };
    if (cell.r >= GRID || cell.c >= GRID) return null;
    out.push(cell);
  }
  return out;
}

export default function TableDuelClient({
  skinId,
  initialCode,
}: {
  skinId?: string;
  initialCode?: string;
}): React.JSX.Element {
  const wsUrl = process.env.NEXT_PUBLIC_TABLE_DUEL_WS;

  const [name, setName] = useState("");
  const [code, setCode] = useState((initialCode ?? "").toUpperCase());
  const [view, setView] = useState<RoomView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [placed, setPlaced] = useState<Cell[][]>([]);
  const [horizontal, setHorizontal] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);

  const send = useCallback((payload: unknown) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
  }, []);

  /** Open the socket lazily — only when the guest actually starts or joins. */
  const open = useCallback(
    (onReady: () => void) => {
      if (!wsUrl) return;
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        onReady();
        return;
      }
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      socket.onopen = () => {
        setConnected(true);
        setError(null);
        onReady();
      };
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data as string);
        if (msg.t === "state") {
          setView(msg as RoomView);
          setError(null);
        } else if (msg.t === "joined") {
          setCode(msg.code);
        } else if (msg.t === "error") {
          setError(msg.message);
        }
      };
      socket.onclose = () => {
        setConnected(false);
        socketRef.current = null;
      };
      socket.onerror = () => setError("Could not reach the game server.");
    },
    [wsUrl],
  );

  useEffect(() => () => socketRef.current?.close(), []);

  const you = view?.you ?? null;
  const myTurn = Boolean(view && you && view.turnId === you.id);
  const opponents = useMemo(
    () => (view?.players ?? []).filter((p) => p.id !== you?.id),
    [view, you],
  );

  // ---- placing -------------------------------------------------------------

  const takenCells = useMemo(() => {
    const taken = new Set<string>();
    for (const boat of placed) for (const cell of boat) taken.add(key(cell.r, cell.c));
    return taken;
  }, [placed]);

  const nextBoatSize = FLEET[placed.length];

  function placeAt(head: Cell): void {
    if (nextBoatSize === undefined) return;
    const covered = span(head, nextBoatSize, horizontal);
    if (!covered) {
      setError(`A ${nextBoatSize}-square boat does not fit there.`);
      return;
    }
    if (covered.some((cell) => takenCells.has(key(cell.r, cell.c)))) {
      setError("Boats cannot overlap.");
      return;
    }
    setError(null);
    setPlaced((current) => [...current, covered]);
  }

  function confirmFleet(): void {
    send({ t: "place", boats: placed.map((boat) => boat.map(({ r, c }) => ({ r, c }))) });
  }

  function shuffleFleet(): void {
    setPlaced([]);
    send({ t: "place" });
  }

  // ---- render --------------------------------------------------------------

  const shellClass = `${styles.shell} ${skinId === "ajgators" ? styles.shellGator : ""}`;

  if (!wsUrl) {
    return (
      <main className={shellClass}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Table Duel</p>
          <h1 className={styles.title}>Not switched on yet</h1>
          <p className={styles.copy}>
            The live game server address is not configured for this site, so rooms cannot open.
            Set <code>NEXT_PUBLIC_TABLE_DUEL_WS</code> to the room server URL and reload.
          </p>
        </div>
      </main>
    );
  }

  // Lobby — before a room exists.
  if (!view) {
    return (
      <main className={shellClass}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Everyone at the table · own phones</p>
          <h1 className={styles.title}>Table Duel</h1>
          <p className={styles.copy}>
            Hide three boats on your grid. Take turns firing at everyone else. Last fleet
            floating wins the table.
          </p>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="duel-name">Your name</label>
            <input
              id="duel-name"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={14}
              placeholder="Ana"
              autoComplete="off"
            />
          </div>

          <button
            className={styles.button}
            type="button"
            onClick={() => open(() => send({ t: "create", name }))}
          >
            Start a table game
          </button>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="duel-code">Or join with the table code</label>
            <input
              id="duel-code"
              className={`${styles.input} ${styles.codeInput}`}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
              maxLength={4}
              placeholder="ABCD"
              autoComplete="off"
              inputMode="text"
            />
          </div>
          <button
            className={`${styles.button} ${styles.buttonQuiet}`}
            type="button"
            disabled={code.length !== 4}
            onClick={() => open(() => send({ t: "join", code, name }))}
          >
            Join this table
          </button>

          {error ? <p className={`${styles.status} ${styles.statusAlert}`} role="status">{error}</p> : null}

          <p className={styles.note}>
            Free play only: no money, no wagers, no prizes, no account. Names stay on the game
            server while the round is live and are gone when the table leaves.
          </p>
        </div>
      </main>
    );
  }

  const winnerName = view.players.find((p) => p.id === view.winnerId)?.name ?? null;

  return (
    <main className={shellClass}>
      <div className={styles.inner}>
        <div className={styles.codeStrip}>
          <div>
            <p className={styles.eyebrow}>Table code</p>
            <p className={styles.codeValue}>{view.code}</p>
          </div>
          <p className={styles.codeHint}>
            Read it out.<br />Everyone joins on their own phone.
          </p>
        </div>

        <div className={styles.seats}>
          {view.players.map((p) => (
            <span
              key={p.id}
              className={[
                styles.seat,
                p.ready && view.phase === "placing" ? styles.seatReady : "",
                view.turnId === p.id && view.phase === "firing" ? styles.seatTurn : "",
                p.out || !p.connected ? styles.seatOut : "",
              ].filter(Boolean).join(" ")}
            >
              {p.name}
              {view.phase === "firing" ? ` · ${p.boatsLeft}` : ""}
            </span>
          ))}
        </div>

        {view.phase === "placing" ? (
          <>
            <div className={styles.boardWrap}>
              <div className={styles.boardLabel}>
                <span>Your waters</span>
                <span className={styles.boardMeta}>
                  {you?.ready
                    ? "Ready — waiting for the table"
                    : nextBoatSize
                      ? `Tap to drop a ${nextBoatSize}-square boat`
                      : "All three placed"}
                </span>
              </div>
              <div className={styles.grid}>
                {cells.map(({ r, c }) => {
                  const mine = takenCells.has(key(r, c)) || (you?.ready && you.boats.some((boat) => boat.some((cell) => cell.r === r && cell.c === c)));
                  return (
                    <button
                      key={key(r, c)}
                      type="button"
                      className={`${styles.cell} ${mine ? styles.cellBoat : ""}`}
                      disabled={you?.ready || nextBoatSize === undefined}
                      aria-label={`Row ${r + 1}, column ${c + 1}${mine ? ", your boat" : ""}`}
                      onClick={() => placeAt({ r, c })}
                    />
                  );
                })}
              </div>
            </div>

            {!you?.ready ? (
              <>
                <div className={styles.row}>
                  <button
                    className={`${styles.button} ${styles.buttonQuiet}`}
                    type="button"
                    onClick={() => setHorizontal((value) => !value)}
                  >
                    {horizontal ? "Across ↔" : "Down ↕"}
                  </button>
                  <button
                    className={`${styles.button} ${styles.buttonQuiet}`}
                    type="button"
                    onClick={() => { setPlaced([]); setError(null); }}
                  >
                    Clear
                  </button>
                </div>
                <button
                  className={styles.button}
                  type="button"
                  disabled={placed.length !== FLEET.length}
                  onClick={confirmFleet}
                >
                  {placed.length === FLEET.length ? "Lock in my fleet" : `Place ${FLEET.length - placed.length} more`}
                </button>
                <button className={`${styles.button} ${styles.buttonQuiet}`} type="button" onClick={shuffleFleet}>
                  Surprise me — place them for me
                </button>
              </>
            ) : null}
          </>
        ) : null}

        {view.phase === "firing" || view.phase === "over" ? (
          <>
            <div className={styles.boardWrap}>
              <div className={styles.boardLabel}>
                <span>Your waters</span>
                <span className={styles.boardMeta}>{you?.out ? "Fleet sunk" : `${view.players.find((p) => p.id === you?.id)?.boatsLeft ?? 0} boats left`}</span>
              </div>
              <div className={styles.grid}>
                {cells.map(({ r, c }) => {
                  const id = key(r, c);
                  const mine = Boolean(you?.boats.some((boat) => boat.some((cell) => cell.r === r && cell.c === c)));
                  const hit = Boolean(you?.hits.includes(id));
                  const miss = Boolean(you?.misses.includes(id));
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled
                      className={[styles.cell, mine ? styles.cellBoat : "", hit ? styles.cellHit : "", miss ? styles.cellMiss : ""].filter(Boolean).join(" ")}
                      aria-label={`Your row ${r + 1}, column ${c + 1}: ${hit ? "hit" : miss ? "missed shot" : mine ? "boat" : "clear"}`}
                    >
                      {hit ? "✳" : miss ? "·" : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.targets}>
              {opponents.map((opponent) => (
                <div key={opponent.id} className={styles.boardWrap}>
                  <div className={styles.boardLabel}>
                    <span>{opponent.name}</span>
                    <span className={styles.boardMeta}>
                      {opponent.out ? "Sunk" : !opponent.connected ? "Left" : `${opponent.boatsLeft} boats left`}
                    </span>
                  </div>
                  <div className={styles.grid}>
                    {cells.map(({ r, c }) => {
                      const id = key(r, c);
                      const hit = opponent.hits.includes(id);
                      const miss = opponent.misses.includes(id);
                      const canFire = myTurn && view.phase === "firing" && !opponent.out && opponent.connected && !hit && !miss;
                      return (
                        <button
                          key={id}
                          type="button"
                          disabled={!canFire}
                          className={[styles.cell, hit ? styles.cellHit : "", miss ? styles.cellMiss : "", canFire ? styles.cellAim : ""].filter(Boolean).join(" ")}
                          aria-label={`Fire at ${opponent.name}, row ${r + 1}, column ${c + 1}${hit ? " — already hit" : miss ? " — already missed" : ""}`}
                          onClick={() => send({ t: "fire", target: opponent.id, r, c })}
                        >
                          {hit ? "✳" : miss ? "·" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        <p className={`${styles.status} ${error ? styles.statusAlert : ""}`} role="status" aria-live="polite">
          {error
            ? error
            : view.phase === "placing"
              ? "Hide your boats. The round starts when everyone is ready."
              : view.phase === "over"
                ? "Round over."
                : myTurn
                  ? "Your turn — tap a square on someone else's grid."
                  : `Waiting for ${view.players.find((p) => p.id === view.turnId)?.name ?? "the next player"}.`}
        </p>

        {view.log.length ? (
          <div className={styles.log}>
            {view.log.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
          </div>
        ) : null}

        {view.phase === "over" ? (
          <>
            <div className={styles.winner}>
              <p className={styles.eyebrow}>Last fleet floating</p>
              <p className={styles.winnerName}>{winnerName ?? "Nobody"}</p>
            </div>
            <button className={styles.button} type="button" onClick={() => { setPlaced([]); send({ t: "again" }); }}>
              Play again
            </button>
          </>
        ) : null}

        {!connected ? <p className={styles.note}>Reconnecting to the game server…</p> : null}

        <p className={styles.note}>
          Free play only: no money, no wagers, no prizes, no purchase, no account. Bragging
          rights stay at the table.
        </p>
      </div>
    </main>
  );
}
