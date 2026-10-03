import { advanceTableFootball, createTableFootballState, resetTableFootballState, TABLE_FOOTBALL_TICK_MS } from "../game/engine";
import { TABLE_FOOTBALL_PROTOCOL, type TableFootballInputMessage, type TableFootballMatchOptions, type TableFootballState } from "../game/types";

export const FOOTBALL_SEATS = ["home-goalkeeper", "home-forward", "away-forward", "away-goalkeeper"] as const;
export type FootballSeat = typeof FOOTBALL_SEATS[number];
export type FootballMember = { id: string; joinedAt: number; preferredSeat: FootballSeat; connected: boolean; active: boolean };
export type FootballPacket =
  | { kind: "input"; sequence: number; move: -1 | 0 | 1; kick: boolean }
  | { kind: "state"; round: number; state: TableFootballState; joinOrder: readonly string[] }
  | { kind: "again" };

export function reserveSeats(members: readonly FootballMember[]): Map<string, FootballSeat> {
  const available = new Set<FootballSeat>(FOOTBALL_SEATS);
  const seats = new Map<string, FootballSeat>();
  for (const member of [...members].sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id)).slice(0, 4)) {
    const seat = available.has(member.preferredSeat) ? member.preferredSeat : [...available][0];
    if (seat) { available.delete(seat); seats.set(member.id, seat); }
  }
  return seats;
}

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const finite = (value: unknown, min: number, max: number): value is number => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;

/** Validate all numbers and the fixed roster before a packet can reach physics/rendering. */
export function validFootballState(value: unknown, roomId: string): value is TableFootballState {
  if (!record(value) || value.protocol !== TABLE_FOOTBALL_PROTOCOL || value.roomId !== roomId || value.mode !== "2v2") return false;
  if (!["ready", "playing", "goal", "finished"].includes(String(value.phase))) return false;
  if (!finite(value.tick, 0, 1_000_000) || !Number.isInteger(value.tick) || value.durationMs !== 90_000 || !finite(value.timeRemainingMs, 0, 90_000)) return false;
  if (!record(value.score) || !finite(value.score.home, 0, 1000) || !finite(value.score.away, 0, 1000) || !Number.isInteger(value.score.home) || !Number.isInteger(value.score.away)) return false;
  const ball = value.ball;
  if (!record(ball) || !["x", "y", "vx", "vy"].every((key) => finite(ball[key], -1000, 1000))) return false;
  if (!Array.isArray(value.players) || value.players.length !== 4) return false;
  const ids = new Set<string>();
  for (const player of value.players) {
    if (!record(player) || !FOOTBALL_SEATS.includes(player.id as FootballSeat) || ids.has(String(player.id))) return false;
    if (player.id !== `${player.team}-${player.role}` || !finite(player.x, 0, 100) || !finite(player.y, 4, 96) || ![-1, 0, 1].includes(Number(player.move)) || typeof player.move !== "number" || !finite(player.kickCooldownTicks, 0, 12)) return false;
    ids.add(String(player.id));
  }
  if (!["home", "away"].includes(String(value.serveTeam)) || !finite(value.goalPauseTicks, 0, 48) || ![null, "home", "away"].includes(value.lastGoal as null | string)) return false;
  if (!record(value.inputSeqByPlayer) || Object.keys(value.inputSeqByPlayer).some((key) => !FOOTBALL_SEATS.includes(key as FootballSeat))) return false;
  return Object.values(value.inputSeqByPlayer).every((sequence) => finite(sequence, 0, Number.MAX_SAFE_INTEGER) && Number.isInteger(sequence));
}

/** One authority per membership view. Four bounded input slots, never a packet queue. */
export class FootballSession {
  state: TableFootballState;
  round = 0;
  members: readonly FootballMember[] = [];
  seats = new Map<string, FootballSeat>();
  private accumulator = 0;
  private pending = new Map<string, { sequence: number; move: -1 | 0 | 1; kick: boolean }>();
  private received = new Map<string, number>();
  private inputTime = new Map<string, number>();
  private inputWindow = new Map<string, { at: number; count: number }>();
  private hasSnapshot = false;
  private lastSnapshotAt = 0;
  private lastSentAt = 0;
  private snapshotMembers = new Set<string>();
  private leaderId: string | undefined;
  private joinOrder: string[] = [];

  constructor(readonly id: string, options: TableFootballMatchOptions, private send: (packet: FootballPacket, to?: string) => void, private now = () => performance.now(), private mayCreate = true) {
    this.state = createTableFootballState({ ...options, mode: "2v2", durationSeconds: 90 });
  }

  get hostId(): string | undefined {
    if (this.members.some((member) => member.id === this.leaderId && member.active)) return this.leaderId;
    return this.joinOrder.find((id) => this.members.some((member) => member.id === id && member.active) && (id !== this.id || this.mayCreate || this.hasSnapshot));
  }
  get isHost(): boolean { return this.hostId === this.id; }
  get ready(): boolean {
    return this.members.length > 0 && this.members.every((member) => member.connected) && !!this.hostId &&
      (this.isHost || (this.hasSnapshot && this.now() - this.lastSnapshotAt < 2000 && this.members.every((member) => this.snapshotMembers.has(member.id))));
  }
  get seat(): FootballSeat | undefined { return this.seats.get(this.id); }
  get pendingCount(): number { return this.pending.size; }

  roster(members: readonly FootballMember[]): void {
    const previous = this.hostId;
    this.members = members.slice(0, 4);
    const existing = new Set(this.members.map((member) => member.id));
    this.joinOrder = !this.mayCreate && !this.hasSnapshot ? this.members.map((member) => member.id) : this.joinOrder.filter((id) => existing.has(id));
    for (const member of this.members) if (!this.joinOrder.includes(member.id)) this.joinOrder.push(member.id);
    this.seats = reserveSeats(this.members.map((member) => ({ ...member, joinedAt: this.joinOrder.indexOf(member.id) })));
    const ids = new Set(this.members.map((member) => member.id));
    for (const map of [this.pending, this.received, this.inputTime, this.inputWindow]) for (const id of map.keys()) if (!ids.has(id)) map.delete(id);
    if (previous !== this.hostId) {
      this.accumulator = 0;
      this.pending.clear();
      this.state = { ...this.state, players: this.state.players.map((player) => ({ ...player, move: 0 })) };
    }
    if (this.isHost) this.snapshot();
  }

  receive(sender: string, value: unknown): boolean {
    if (!record(value) || !this.seats.has(sender)) return false;
    if (value.kind === "state") {
      const bootstrap = !this.hasSnapshot && !this.mayCreate;
      const joinOrder = value.joinOrder;
      if (!bootstrap && (sender !== this.hostId || this.isHost) || !finite(value.round, 0, 1_000_000) || !Number.isInteger(value.round) || !validFootballState(value.state, this.state.roomId)) return false;
      if (!Array.isArray(joinOrder) || joinOrder.length > 4 || joinOrder.some((id) => typeof id !== "string" || id.length > 80) || new Set(joinOrder).size !== joinOrder.length || !joinOrder.includes(sender)) return false;
      if (this.hasSnapshot && (value.round < this.round || (value.round === this.round && value.state.tick < this.state.tick))) return false;
      this.joinOrder = [...joinOrder.filter((id) => this.members.some((member) => member.id === id)), ...this.joinOrder.filter((id) => !joinOrder.includes(id))];
      this.leaderId = sender;
      this.seats = reserveSeats(this.members.map((member) => ({ ...member, joinedAt: this.joinOrder.indexOf(member.id) })));
      this.round = value.round;
      this.state = value.state;
      this.snapshotMembers = new Set(joinOrder);
      this.hasSnapshot = true;
      this.lastSnapshotAt = this.now();
      return true;
    }
    if (!this.isHost || !this.ready) return false;
    if (value.kind === "again") {
      if (this.state.phase !== "finished") return false;
      this.state = resetTableFootballState(this.state);
      this.round += 1;
      this.pending.clear();
      this.accumulator = 0;
      this.snapshot();
      return true;
    }
    if (value.kind !== "input" || !finite(value.sequence, 1, Number.MAX_SAFE_INTEGER) || !Number.isInteger(value.sequence) || typeof value.move !== "number" || ![-1, 0, 1].includes(value.move) || typeof value.kick !== "boolean") return false;
    if (value.sequence <= (this.received.get(sender) ?? 0)) return false;
    const now = this.now();
    const window = this.inputWindow.get(sender);
    if (window && now - window.at < 1000 && window.count >= 30) return false;
    this.inputWindow.set(sender, !window || now - window.at >= 1000 ? { at: now, count: 1 } : { at: window.at, count: window.count + 1 });
    this.received.set(sender, value.sequence);
    this.inputTime.set(sender, now);
    const previous = this.pending.get(sender);
    this.pending.set(sender, { sequence: value.sequence, move: value.move as -1 | 0 | 1, kick: value.kick || previous?.kick === true });
    return true;
  }

  input(message: Pick<TableFootballInputMessage, "sequence" | "move" | "kick">): void {
    const packet: FootballPacket = { kind: "input", ...message };
    if (this.isHost) this.receive(this.id, packet);
    else if (this.ready) this.send(packet, this.hostId);
  }
  again(): void { if (this.isHost) this.receive(this.id, { kind: "again" }); else this.send({ kind: "again" }, this.hostId); }

  frame(delta: number): void {
    if (!this.isHost || !this.ready) { this.accumulator = 0; return; }
    if (this.state.phase === "finished") { if (this.now() - this.lastSentAt >= 1000) this.snapshot(); return; }
    this.accumulator += Math.min(Math.max(delta, 0), 100);
    while (this.accumulator >= TABLE_FOOTBALL_TICK_MS) {
      this.accumulator -= TABLE_FOOTBALL_TICK_MS;
      const inputs: TableFootballInputMessage[] = [];
      const occupied = new Set(this.seats.values());
      const push = (playerId: string, move: -1 | 0 | 1, kick: boolean) => inputs.push({ protocol: TABLE_FOOTBALL_PROTOCOL, type: "input", roomId: this.state.roomId, playerId, sequence: (this.state.inputSeqByPlayer[playerId] ?? 0) + 1, clientTick: this.state.tick, move, kick });
      for (const [id, input] of this.pending) { const seat = this.seats.get(id); if (seat) push(seat, input.move, input.kick); }
      this.pending.clear();
      for (const [id, seat] of this.seats) {
        if (this.state.players.find((player) => player.id === seat)?.move && (this.now() - (this.inputTime.get(id) ?? 0) > 750 || !this.members.find((member) => member.id === id)?.active)) push(seat, 0, false);
      }
      // Empty rods are computer-controlled; only a human's first input starts the match.
      if (this.state.phase !== "ready") for (const player of this.state.players) {
        if (occupied.has(player.id as FootballSeat)) continue;
        const aim = this.state.ball.y + Math.sin(this.state.tick / 45 + player.x) * 12;
        const move = aim < player.y - 5 ? -1 : aim > player.y + 5 ? 1 : 0;
        push(player.id, move, this.state.tick % 12 === 0);
      }
      const before = this.state;
      this.state = advanceTableFootball(this.state, inputs);
      // Maracaibo's clock includes goal pauses; the whole round lasts 90 seconds.
      if (before.phase === "goal") {
        const remaining = Math.max(0, before.timeRemainingMs - TABLE_FOOTBALL_TICK_MS);
        this.state = { ...this.state, timeRemainingMs: remaining, phase: remaining === 0 ? "finished" : this.state.phase };
      }
      // Keep the rally alive rather than leaving a decelerated ball stranded between rods.
      if (this.state.phase === "playing" && Math.hypot(this.state.ball.vx, this.state.ball.vy) < 14) {
        this.state = { ...this.state, ball: { ...this.state.ball, vx: (this.state.ball.vx >= 0 ? 1 : -1) * 28, vy: Math.sin(this.state.tick / 60) * 14 } };
      }
      if (this.now() - this.lastSentAt >= 100 || before.phase !== this.state.phase) this.snapshot();
    }
  }
  private snapshot(): void { this.leaderId = this.id; this.lastSentAt = this.now(); this.send({ kind: "state", round: this.round, state: this.state, joinOrder: this.joinOrder }); }
}
