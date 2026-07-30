import {
  TABLE_FOOTBALL_PROTOCOL,
  type TableFootballInputMessage,
  type TableFootballMatchOptions,
  type TableFootballPlayer,
  type TableFootballRole,
  type TableFootballState,
  type TableFootballStateMessage,
  type TeamId,
} from "./types";

/** Frozen mechanical constants. A venue skin cannot alter any of these. */
export const TABLE_FOOTBALL_TICK_MS = 1000 / 60;
const FIELD_MIN = 4;
const FIELD_MAX = 96;
const GOAL_TOP = 39;
const GOAL_BOTTOM = 61;
const BALL_RADIUS = 1.6;
const PLAYER_REACH_X = 4.4;
const PLAYER_REACH_Y = 10;
const PLAYER_SPEED = 48;
const KICK_SPEED = 72;
const GOAL_PAUSE_TICKS = 48;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
const opponent = (team: TeamId): TeamId => (team === "home" ? "away" : "home");

function playerId(team: TeamId, role: TableFootballRole): string {
  return `${team}-${role}`;
}

function startingPlayers(mode: TableFootballMatchOptions["mode"]): TableFootballPlayer[] {
  const players: TableFootballPlayer[] = [
    { id: playerId("home", "forward"), team: "home", role: "forward", x: 30, y: 50, move: 0, kickCooldownTicks: 0 },
    { id: playerId("away", "forward"), team: "away", role: "forward", x: 70, y: 50, move: 0, kickCooldownTicks: 0 },
  ];
  if (mode === "2v2") {
    players.unshift({ id: playerId("home", "goalkeeper"), team: "home", role: "goalkeeper", x: 10, y: 50, move: 0, kickCooldownTicks: 0 });
    players.push({ id: playerId("away", "goalkeeper"), team: "away", role: "goalkeeper", x: 90, y: 50, move: 0, kickCooldownTicks: 0 });
  }
  return players;
}

function serveBall(team: TeamId): TableFootballState["ball"] {
  return { x: 50, y: 50, vx: team === "home" ? 20 : -20, vy: 0 };
}

export function createTableFootballState(options: TableFootballMatchOptions): TableFootballState {
  const durationSeconds = clamp(Math.floor(options.durationSeconds ?? 90), 30, 600);
  return {
    protocol: TABLE_FOOTBALL_PROTOCOL,
    roomId: options.roomId,
    mode: options.mode,
    phase: "ready",
    tick: 0,
    durationMs: durationSeconds * 1000,
    timeRemainingMs: durationSeconds * 1000,
    score: { home: 0, away: 0 },
    ball: serveBall("home"),
    players: startingPlayers(options.mode),
    serveTeam: "home",
    goalPauseTicks: 0,
    lastGoal: null,
    inputSeqByPlayer: {},
  };
}

export function resetTableFootballState(state: TableFootballState): TableFootballState {
  return {
    ...state,
    phase: "ready",
    tick: 0,
    timeRemainingMs: state.durationMs,
    score: { home: 0, away: 0 },
    ball: serveBall("home"),
    players: startingPlayers(state.mode),
    serveTeam: "home",
    goalPauseTicks: 0,
    lastGoal: null,
    inputSeqByPlayer: {},
  };
}

function acceptInputs(state: TableFootballState, messages: readonly TableFootballInputMessage[]): { players: TableFootballPlayer[]; sequences: Record<string, number>; kickedBy: Set<string>; received: boolean } {
  const players = state.players.map((player) => ({ ...player, kickCooldownTicks: Math.max(0, player.kickCooldownTicks - 1) }));
  const sequences = { ...state.inputSeqByPlayer };
  const kickedBy = new Set<string>();
  let received = false;

  for (const message of messages) {
    if (message.protocol !== TABLE_FOOTBALL_PROTOCOL || message.type !== "input" || message.roomId !== state.roomId) continue;
    const index = players.findIndex((player) => player.id === message.playerId);
    if (index < 0 || message.sequence <= (sequences[message.playerId] ?? -1)) continue;
    received = true;
    sequences[message.playerId] = message.sequence;
    players[index] = { ...players[index], move: message.move };
    if (message.kick) kickedBy.add(message.playerId);
  }
  return { players, sequences, kickedBy, received };
}

function kickBall(player: TableFootballPlayer, ball: TableFootballState["ball"]): TableFootballState["ball"] | null {
  if (player.kickCooldownTicks > 0) return null;
  if (Math.abs(ball.x - player.x) > PLAYER_REACH_X + BALL_RADIUS || Math.abs(ball.y - player.y) > PLAYER_REACH_Y) return null;
  const direction = player.team === "home" ? 1 : -1;
  return { x: ball.x, y: ball.y, vx: direction * KICK_SPEED, vy: player.move * 22 + (ball.y - player.y) * 1.25 };
}

function goalFor(ball: TableFootballState["ball"]): TeamId | null {
  if (ball.y < GOAL_TOP || ball.y > GOAL_BOTTOM) return null;
  if (ball.x <= 0) return "away";
  if (ball.x >= 100) return "home";
  return null;
}

/** One fixed 60 Hz host step. It contains no wall-clock, network, or random input. */
export function advanceTableFootball(
  state: TableFootballState,
  messages: readonly TableFootballInputMessage[] = [],
): TableFootballState {
  if (state.phase === "finished") return state;
  const accepted = acceptInputs(state, messages);
  let phase: TableFootballState["phase"] = state.phase === "ready" && accepted.received ? "playing" : state.phase;
  let ball = { ...state.ball };
  let serveTeam = state.serveTeam;
  let lastGoal = state.lastGoal;
  let goalPauseTicks = state.goalPauseTicks;
  const score = { ...state.score };
  let timeRemainingMs = state.timeRemainingMs;
  const players = accepted.players.map((player) => ({
    ...player,
    y: clamp(player.y + player.move * PLAYER_SPEED * (TABLE_FOOTBALL_TICK_MS / 1000), FIELD_MIN, FIELD_MAX),
  }));

  if (phase === "goal") {
    goalPauseTicks -= 1;
    if (goalPauseTicks <= 0) {
      serveTeam = opponent(lastGoal ?? serveTeam);
      ball = serveBall(serveTeam);
      phase = "playing";
      lastGoal = null;
      goalPauseTicks = 0;
    }
  } else if (phase === "playing") {
    for (let index = 0; index < players.length; index += 1) {
      const player = players[index];
      if (!accepted.kickedBy.has(player.id)) continue;
      const kicked = kickBall(player, ball);
      if (kicked) {
        ball = kicked;
        players[index] = { ...player, kickCooldownTicks: 12 };
      }
    }

    ball.x += ball.vx * (TABLE_FOOTBALL_TICK_MS / 1000);
    ball.y += ball.vy * (TABLE_FOOTBALL_TICK_MS / 1000);
    ball.vx *= 0.992;
    ball.vy *= 0.988;
    if (ball.y <= FIELD_MIN || ball.y >= FIELD_MAX) {
      ball.y = clamp(ball.y, FIELD_MIN, FIELD_MAX);
      ball.vy *= -0.82;
    }
    for (const player of players) {
      if (Math.abs(ball.x - player.x) > PLAYER_REACH_X || Math.abs(ball.y - player.y) > PLAYER_REACH_Y) continue;
      const direction = player.team === "home" ? 1 : -1;
      if (ball.vx * direction < 0) ball.vx = Math.abs(ball.vx) * direction * 0.9;
    }
    const scorer = goalFor(ball);
    if (scorer) {
      score[scorer] += 1;
      phase = "goal";
      lastGoal = scorer;
      goalPauseTicks = GOAL_PAUSE_TICKS;
      ball = { x: ball.x, y: ball.y, vx: 0, vy: 0 };
    } else if (ball.x < 0 || ball.x > 100) {
      ball.x = clamp(ball.x, 0, 100);
      ball.vx *= -0.82;
    }
    timeRemainingMs = Math.max(0, timeRemainingMs - TABLE_FOOTBALL_TICK_MS);
    if (timeRemainingMs <= 0) phase = "finished";
  }

  return {
    ...state,
    phase,
    tick: state.tick + 1,
    timeRemainingMs,
    score,
    ball,
    players,
    serveTeam,
    goalPauseTicks,
    lastGoal,
    inputSeqByPlayer: accepted.sequences,
  };
}

export function toStateMessage(state: TableFootballState): TableFootballStateMessage {
  return { protocol: TABLE_FOOTBALL_PROTOCOL, type: "state", roomId: state.roomId, state };
}

/** Small host authority suitable for a Broadcast channel; transport stays outside this module. */
export class TableFootballHost {
  private pending: TableFootballInputMessage[] = [];
  private current: TableFootballState;

  constructor(options: TableFootballMatchOptions) {
    this.current = createTableFootballState(options);
  }

  get state(): TableFootballState {
    return this.current;
  }

  receive(message: TableFootballInputMessage): boolean {
    if (message.protocol !== TABLE_FOOTBALL_PROTOCOL || message.type !== "input" || message.roomId !== this.current.roomId) return false;
    if (!this.current.players.some((player) => player.id === message.playerId)) return false;
    this.pending.push(message);
    return true;
  }

  step(): TableFootballStateMessage {
    this.current = advanceTableFootball(this.current, this.pending);
    this.pending = [];
    return toStateMessage(this.current);
  }

  reset(): TableFootballStateMessage {
    this.current = resetTableFootballState(this.current);
    this.pending = [];
    return toStateMessage(this.current);
  }
}
