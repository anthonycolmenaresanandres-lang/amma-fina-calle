"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  countryColorTeamFromOption,
  mountTableFootballGame,
  tableFootballSkinFromMatchSkin,
  type TableFootballGameHandle,
  type TableFootballInputMessage,
  type TableFootballState,
  type TableFootballStateMessage,
} from "./game";
import { connectTableRoom, type RoomMode, type TableRoomBridge } from "./realtime";
import type { TableOsVenue } from "./venue-config";
import styles from "./table-match.module.css";

type RoomPayload =
  | Readonly<{ kind: "hello"; clientId: string }>
  | Readonly<{ kind: "claim"; clientId: string; playerId: string }>
  | Readonly<{ kind: "input"; message: TableFootballInputMessage }>
  | Readonly<{ kind: "state"; hostId: string; message: TableFootballStateMessage }>
  | Readonly<{ kind: "reset" }>;

type Props = Readonly<{
  venue: TableOsVenue;
  tableId: string;
}>;

type RoleChoice = Readonly<{
  playerId: string;
  team: "home" | "away";
  role: "goalkeeper" | "forward";
  label: string;
}>;

const ROLE_CHOICES: readonly RoleChoice[] = [
  { playerId: "home-goalkeeper", team: "home", role: "goalkeeper", label: "Home keeper" },
  { playerId: "home-forward", team: "home", role: "forward", label: "Home forward" },
  { playerId: "away-forward", team: "away", role: "forward", label: "Away forward" },
  { playerId: "away-goalkeeper", team: "away", role: "goalkeeper", label: "Away keeper" },
];

const INITIAL_SCORE = { home: 0, away: 0, timeRemainingMs: 90_000, phase: "ready" };

export function TableMatchClient({ venue, tableId }: Props): React.JSX.Element {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const bridgeRef = useRef<TableRoomBridge<RoomPayload> | null>(null);
  const gameRef = useRef<TableFootballGameHandle | null>(null);
  const hostIdRef = useRef<string | null>(null);
  const candidatesRef = useRef(new Set<string>());
  const pendingInputsRef = useRef<TableFootballInputMessage[]>([]);
  const mountStartedRef = useRef(false);
  const latestStateRef = useRef<TableFootballState | null>(null);

  const [selectedRole, setSelectedRole] = useState<RoleChoice>(ROLE_CHOICES[1]);
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [initialState, setInitialState] = useState<TableFootballState | null>(null);
  const [mode, setMode] = useState<RoomMode>("connecting");
  const [participants, setParticipants] = useState(1);
  const [claims, setClaims] = useState<Readonly<Record<string, string>>>({});
  const [gameReady, setGameReady] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [score, setScore] = useState(INITIAL_SCORE);

  const homeTeam = venue.teams[0];
  const awayTeam = venue.teams[1] ?? venue.teams[0];
  const roomId = `${venue.id}:${tableId}`;
  const matchOptions = useMemo(
    () => ({
      roomId,
      mode: "2v2" as const,
      home: countryColorTeamFromOption(homeTeam),
      away: countryColorTeamFromOption(awayTeam),
      durationSeconds: 90,
    }),
    [awayTeam, homeTeam, roomId],
  );

  useEffect(() => {
    if (!joined) {
      return;
    }

    let cancelled = false;
    let electionTimer: ReturnType<typeof setTimeout> | null = null;

    const bridge = connectTableRoom<RoomPayload>(venue.id, tableId, {
      onMode: setMode,
      onParticipants: setParticipants,
      onMessage: ({ payload, senderId }) => {
        if (payload.kind === "hello") {
          candidatesRef.current.add(payload.clientId);
          setParticipants((current) => Math.max(current, candidatesRef.current.size));
          if (hostIdRef.current === bridge.clientId && latestStateRef.current) {
            void bridge.send({
              kind: "state",
              hostId: bridge.clientId,
              message: { protocol: "table-football/v1", type: "state", roomId, state: latestStateRef.current },
            });
          }
          return;
        }

        if (payload.kind === "claim") {
          setClaims((current) => ({ ...current, [payload.clientId]: payload.playerId }));
          return;
        }

        if (payload.kind === "state") {
          hostIdRef.current = payload.hostId;
          candidatesRef.current.add(payload.hostId);
          setParticipants((current) => Math.max(current, candidatesRef.current.size));
          latestStateRef.current = payload.message.state;
          setIsHost(payload.hostId === bridge.clientId);
          setScore({
            ...payload.message.state.score,
            timeRemainingMs: payload.message.state.timeRemainingMs,
            phase: payload.message.state.phase,
          });

          if (gameRef.current) {
            gameRef.current.applyState(payload.message);
          } else {
            setInitialState(payload.message.state);
          }
          return;
        }

        if (payload.kind === "input") {
          if (hostIdRef.current === bridge.clientId && gameRef.current) {
            gameRef.current.receiveInput(payload.message);
          } else if (hostIdRef.current === bridge.clientId) {
            pendingInputsRef.current.push(payload.message);
          }
          return;
        }

        if (payload.kind === "reset" && hostIdRef.current === bridge.clientId) {
          gameRef.current?.reset();
        }

        candidatesRef.current.add(senderId);
      },
    });

    bridgeRef.current = bridge;
    candidatesRef.current = new Set([bridge.clientId]);
    setClaims({ [bridge.clientId]: selectedRole.playerId });
    void bridge.send({ kind: "hello", clientId: bridge.clientId });
    void bridge.send({ kind: "claim", clientId: bridge.clientId, playerId: selectedRole.playerId });

    electionTimer = setTimeout(() => {
      if (cancelled || hostIdRef.current) {
        return;
      }

      const elected = [...candidatesRef.current].sort()[0] ?? bridge.clientId;
      hostIdRef.current = elected;
      setIsHost(elected === bridge.clientId);
    }, 900);

    return () => {
      cancelled = true;
      if (electionTimer) {
        clearTimeout(electionTimer);
      }
      bridgeRef.current = null;
      void bridge.destroy();
    };
  }, [joined, roomId, selectedRole.playerId, tableId, venue.id]);

  useEffect(() => {
    if (
      !joined ||
      !mountRef.current ||
      mountStartedRef.current ||
      (!isHost && !initialState)
    ) {
      return;
    }

    mountStartedRef.current = true;
    let cancelled = false;

    void mountTableFootballGame({
      parent: mountRef.current,
      match: matchOptions,
      skin: tableFootballSkinFromMatchSkin(venue.skin),
      authority: isHost ? "host" : "replica",
      localPlayerId: selectedRole.playerId,
      initialState: isHost ? undefined : initialState ?? undefined,
      onInput: (message) => {
        if (!isHost) {
          void bridgeRef.current?.send({ kind: "input", message });
        }
      },
      onState: (message) => {
        latestStateRef.current = message.state;
        setScore({
          ...message.state.score,
          timeRemainingMs: message.state.timeRemainingMs,
          phase: message.state.phase,
        });
        if (message.state.tick % 6 === 0) {
          const hostId = bridgeRef.current?.clientId;
          if (hostId) {
            void bridgeRef.current?.send({ kind: "state", hostId, message });
          }
        }
      },
    })
      .then((game) => {
        if (cancelled) {
          game.destroy();
          return;
        }

        gameRef.current = game;
        latestStateRef.current = game.getState();
        for (const message of pendingInputsRef.current.splice(0)) {
          game.receiveInput(message);
        }
        setGameReady(true);

        if (isHost && bridgeRef.current) {
          const hostId = bridgeRef.current.clientId;
          void bridgeRef.current.send({
            kind: "state",
            hostId,
            message: { protocol: "table-football/v1", type: "state", roomId, state: game.getState() },
          });
        }
      })
      .catch((error: unknown) => {
        mountStartedRef.current = false;
        setGameError(error instanceof Error ? error.message : "The table match could not start.");
      });

    return () => {
      cancelled = true;
      if (!gameRef.current) {
        mountStartedRef.current = false;
      }
    };
  }, [initialState, isHost, joined, matchOptions, roomId, selectedRole.playerId, venue.skin]);

  useEffect(
    () => () => {
      gameRef.current?.destroy();
      gameRef.current = null;
    },
    [],
  );

  if (!joined) {
    return (
      <div className={styles.lobby}>
        <div className={styles.matchup}>
          <div style={{ "--team": homeTeam.primary, "--team-alt": homeTeam.secondary } as React.CSSProperties}>
            <span>{homeTeam.flagEmoji ?? homeTeam.shortLabel}</span>
            <strong>{homeTeam.label}</strong>
          </div>
          <em>VS</em>
          <div style={{ "--team": awayTeam.primary, "--team-alt": awayTeam.secondary } as React.CSSProperties}>
            <span>{awayTeam.flagEmoji ?? awayTeam.shortLabel}</span>
            <strong>{awayTeam.label}</strong>
          </div>
        </div>

        <div className={styles.lobbyCopy}>
          <span>90 seconds · touch or keyboard</span>
          <h1>Pick your side<br />and own a rod.</h1>
          <p>
            Move your finger above or below center to slide. Tap to spin and shoot. Four phones can share the same
            table room; one phone automatically keeps the match state.
          </p>
        </div>

        <div className={styles.roles}>
          {ROLE_CHOICES.map((choice) => {
            const team = choice.team === "home" ? homeTeam : awayTeam;
            return (
              <button
                type="button"
                className={selectedRole.playerId === choice.playerId ? styles.roleSelected : undefined}
                key={choice.playerId}
                onClick={() => setSelectedRole(choice)}
                style={{ "--role-color": team.primary } as React.CSSProperties}
              >
                <span>{team.flagEmoji ?? team.shortLabel}</span>
                <strong>{choice.label}</strong>
                <small>{choice.role === "goalkeeper" ? "Defend" : "Attack"}</small>
              </button>
            );
          })}
        </div>

        <button type="button" className={styles.join} onClick={() => setJoined(true)}>
          Join as {selectedRole.label}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.gameShell}>
      <div className={styles.scoreboard}>
        <div><span>{homeTeam.shortLabel}</span><strong>{score.home}</strong></div>
        <div className={styles.clock}>
          <span>{score.phase}</span>
          <strong>{Math.ceil(score.timeRemainingMs / 1000)}s</strong>
        </div>
        <div><span>{awayTeam.shortLabel}</span><strong>{score.away}</strong></div>
      </div>

      <div className={styles.syncLine}>
        <span>{mode === "shared" ? "Table sync ready" : mode === "connecting" ? "Connecting table…" : "Local practice fallback"}</span>
        <span>{participants} connected · {isHost ? "host phone" : "player phone"}</span>
      </div>

      <div className={styles.gameStage} ref={mountRef}>
        {!gameReady && !gameError ? <span className={styles.loading}>Preparing the pitch…</span> : null}
        {gameError ? <span className={styles.error}>{gameError}</span> : null}
      </div>

      <div className={styles.controls}>
        <span>Slide: touch above / below center</span>
        <span>Shoot: tap · Space · Enter</span>
        <button
          type="button"
          onClick={() => {
            if (isHost) {
              gameRef.current?.reset();
            } else {
              void bridgeRef.current?.send({ kind: "reset" });
            }
          }}
        >
          Reset match
        </button>
      </div>

      {Object.values(claims).filter((claim) => claim === selectedRole.playerId).length > 1 ? (
        <p className={styles.roleWarning}>Two phones selected this rod. One player should reload and choose another role.</p>
      ) : null}
    </div>
  );
}
