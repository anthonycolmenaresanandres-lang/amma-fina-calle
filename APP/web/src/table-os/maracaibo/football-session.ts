import { advanceTableFootball, createTableFootballState, resetTableFootballState, TABLE_FOOTBALL_TICK_MS } from "../game/engine";
import { TABLE_FOOTBALL_PROTOCOL, type TableFootballInputMessage, type TableFootballMatchOptions, type TableFootballState } from "../game/types";

export const FOOTBALL_SEATS = ["home-goalkeeper", "home-forward", "away-forward", "away-goalkeeper"] as const;
export type FootballSeat = typeof FOOTBALL_SEATS[number];
export type FootballSeatPreference = FootballSeat | "auto";
export type FootballMember = { id: string; joinedAt: number; preferredSeat: FootballSeatPreference; connected: boolean; active: boolean };
export type FootballAuthority = Readonly<{ protocol: "maracaibo-room/v1"; generation: string; originId: string; established: boolean; started: boolean; term: number; revision: number; hostId: string | null; joinOrder: readonly string[] }>;
export type FootballPacket =
  | { kind: "input"; round: number; sequence: number; move: -1 | 0 | 1; kick: boolean; targetY?: number; generation?: string }
  | { kind: "state"; round: number; state: TableFootballState; joinOrder: readonly string[]; authority?: FootballAuthority }
  | { kind: "again"; round: number; generation?: string };

const AUTO_SEATS: readonly FootballSeat[] = ["home-forward", "away-forward", "home-goalkeeper", "away-goalkeeper"];

export function reserveSeats(members: readonly FootballMember[]): Map<string, FootballSeat> {
  const available = new Set<FootballSeat>(AUTO_SEATS);
  const seats = new Map<string, FootballSeat>();
  for (const member of [...members].sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id)).slice(0, 4)) {
    const seat = member.preferredSeat !== "auto" && available.has(member.preferredSeat) ? member.preferredSeat : [...available][0];
    if (seat) { available.delete(seat); seats.set(member.id, seat); }
  }
  return seats;
}

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const finite = (value: unknown, min: number, max: number): value is number => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;

export function validFootballAuthority(value: unknown): value is FootballAuthority {
  return record(value) && value.protocol === "maracaibo-room/v1" && typeof value.originId === "string" && value.originId.length > 0 && value.originId.length <= 80 && value.generation === `auto:${value.originId}` && typeof value.established === "boolean" && typeof value.started === "boolean" && finite(value.term, 0, 1_000_000) && Number.isInteger(value.term) && finite(value.revision, 0, 1_000_000) && Number.isInteger(value.revision) && Array.isArray(value.joinOrder) && value.joinOrder.length <= 4 && value.joinOrder.every((id) => typeof id === "string" && id.length > 0 && id.length <= 80) && new Set(value.joinOrder).size === value.joinOrder.length && (value.hostId === null || typeof value.hostId === "string" && value.joinOrder.includes(value.hostId));
}

/** Immutable origin priority terminates conflicts even while both games advance. */
function preferredAuthority(a: FootballAuthority, b: FootballAuthority): FootballAuthority {
  if (a.started !== b.started) return a.started ? a : b;
  if (a.established !== b.established) return a.established ? a : b;
  return a.originId.localeCompare(b.originId) <= 0 ? a : b;
}

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
  private pending = new Map<string, { sequence: number; move: -1 | 0 | 1; kick: boolean; targetY?: number }>();
  private desiredTargets = new Map<string, number>();
  private received = new Map<string, number>();
  private inputTime = new Map<string, number>();
  private inputWindow = new Map<string, { at: number; count: number }>();
  private hasSnapshot = false;
  private lastSnapshotAt = 0;
  private lastSentAt = 0;
  private snapshotMembers = new Set<string>();
  private leaderId: string | undefined;
  private joinOrder: string[] = [];
  private readonly automatic: boolean;
  private discoveryComplete = false;
  private knownMembers: readonly FootballMember[] = [];
  private roomAuthority: FootballAuthority | undefined;
  private authorityClaims = new Map<string, string>();
  private observedOrderMembers = new Set<string>();
  private recoveredConflict = false;

  constructor(readonly id: string, options: TableFootballMatchOptions, private send: (packet: FootballPacket, to?: string) => void, private now = () => performance.now(), private mayCreate: boolean | "automatic" = true, private controls: "manual" | "steer" = mayCreate === "automatic" ? "steer" : "manual") {
    this.automatic = mayCreate === "automatic";
    this.state = createTableFootballState({ ...options, mode: "2v2", durationSeconds: 90 });
    if (this.automatic) this.roomAuthority = { protocol: "maracaibo-room/v1", generation: `auto:${id}`, originId: id, established: false, started: false, term: 0, revision: 0, hostId: null, joinOrder: [] };
  }

  get authority(): FootballAuthority | undefined { return this.roomAuthority && { ...this.roomAuthority, hostId: this.hostId ?? null, joinOrder: [...this.joinOrder] }; }
  get conflictRecovered(): boolean { return this.recoveredConflict; }
  completeDiscovery(): void { if (!this.automatic || this.discoveryComplete) return; this.discoveryComplete = true; this.reconcileAutomatic(); }

  observeAuthority(sender: string, value: unknown): boolean {
    if (!this.automatic || !validFootballAuthority(value) || !this.knownMembers.some((member) => member.id === sender)) return false;
    const current = this.roomAuthority!;
    this.authorityClaims.set(sender, value.generation);
    const winner = current.generation === value.generation ? (current.established ? current : value) : preferredAuthority(current, value);
    if (winner.generation !== current.generation) {
      this.recoveredConflict ||= current.established && value.established;
      this.roomAuthority = { ...winner };
      this.joinOrder = [...winner.joinOrder];
      this.leaderId = winner.hostId ?? undefined;
      this.observedOrderMembers = new Set(this.joinOrder.filter((id) => this.knownMembers.some((member) => member.id === id)));
      this.hasSnapshot = false;
      this.snapshotMembers.clear();
      this.accumulator = 0;
      this.pending.clear();
      this.desiredTargets.clear();
      this.received.clear();
      this.inputTime.clear();
      this.inputWindow.clear();
    } else if (value.generation === current.generation) {
      if (value.term < current.term || value.term === current.term && value.revision < current.revision) return false;
      // Relays can repeat discovery information, but only the claiming host
      // can advance an established generation's handoff or kickoff metadata.
      if (current.established && (value.term > current.term || value.started && !current.started) && sender !== value.hostId) return false;
      const newerTerm = value.term > current.term;
      const hostSelfClaim = sender === value.hostId && sender === this.hostId;
      const noActiveLeader = !this.leaderId || !this.knownMembers.some((member) => member.id === this.leaderId && member.active);
      if (value.established && (!current.established || newerTerm || hostSelfClaim || noActiveLeader)) {
        this.roomAuthority = { ...value, started: current.started || value.started };
        this.joinOrder = [...value.joinOrder];
        if (value.hostId && this.knownMembers.some((member) => member.id === value.hostId && member.active)) this.leaderId = value.hostId;
      }
    }
    this.reconcileAutomatic();
    return true;
  }

  private reconcileAutomatic(): void {
    if (!this.automatic || !this.roomAuthority) return;
    const oldLeader = this.leaderId;
    const oldOrder = JSON.stringify(this.joinOrder);
    const present = new Set(this.knownMembers.map((member) => member.id));
    const awaitingSeed = this.roomAuthority.established && !this.hasSnapshot && this.roomAuthority.originId !== this.id;
    // A relayed manifest can beat the host's hello/Presence event. Absence
    // before first observation is discovery, not evidence of departure.
    this.joinOrder = this.roomAuthority.established ? this.joinOrder.filter((id) => awaitingSeed || present.has(id) || !this.observedOrderMembers.has(id)) : [];
    for (const member of [...this.knownMembers].sort((a, b) => a.id.localeCompare(b.id))) if (!this.joinOrder.includes(member.id)) this.joinOrder.push(member.id);
    this.joinOrder = this.joinOrder.slice(0, 4);
    for (const id of this.joinOrder) if (present.has(id)) this.observedOrderMembers.add(id);
    for (const id of this.observedOrderMembers) if (!this.joinOrder.includes(id)) this.observedOrderMembers.delete(id);
    this.members = this.joinOrder.flatMap((id) => this.knownMembers.find((member) => member.id === id) ?? []);
    this.seats = reserveSeats(this.members.map((member) => ({ ...member, joinedAt: this.joinOrder.indexOf(member.id) })));
    if (!awaitingSeed && !this.members.some((member) => member.id === this.leaderId && member.active)) this.leaderId = this.members.find((member) => member.active)?.id;
    if (this.roomAuthority.established && oldLeader && this.leaderId && oldLeader !== this.leaderId) this.roomAuthority = { ...this.roomAuthority, term: this.roomAuthority.term + 1, revision: 0 };
    if (this.roomAuthority.established && oldOrder !== JSON.stringify(this.joinOrder) && this.leaderId === this.id) this.roomAuthority = { ...this.roomAuthority, revision: this.roomAuthority.revision + 1 };
    const agreed = this.members.every((member) => member.id === this.id || this.authorityClaims.get(member.id) === this.roomAuthority?.generation);
    if (!this.roomAuthority.established && this.discoveryComplete && agreed && this.members.every((member) => member.connected) && this.hostId === this.id) this.roomAuthority = { ...this.roomAuthority, established: true };
    this.roomAuthority = { ...this.roomAuthority, hostId: this.leaderId ?? null, joinOrder: [...this.joinOrder] };
    if (this.isHost && this.discoveryComplete && this.roomAuthority.established && (this.hasSnapshot || this.roomAuthority.originId === this.id)) this.snapshot();
  }

  get hostId(): string | undefined {
    if (this.automatic && !this.roomAuthority?.established) return this.joinOrder.find((id) => this.members.some((member) => member.id === id && member.active));
    if (this.automatic && this.roomAuthority?.established && !this.hasSnapshot && this.roomAuthority.originId !== this.id) return this.leaderId;
    if (this.members.some((member) => member.id === this.leaderId && member.active)) return this.leaderId;
    return this.joinOrder.find((id) => this.members.some((member) => member.id === id && member.active) && (id !== this.id || this.mayCreate || this.hasSnapshot));
  }
  get isHost(): boolean { return this.hostId === this.id; }
  get ready(): boolean {
    if (this.automatic && (!this.discoveryComplete || !this.roomAuthority?.established || !this.seats.has(this.id))) return false;
    if (this.automatic && this.joinOrder.some((id) => !this.knownMembers.some((member) => member.id === id))) return false;
    if (this.automatic && this.roomAuthority?.originId !== this.id && !this.hasSnapshot) return false;
    return this.members.length > 0 && this.members.every((member) => member.connected) && !!this.hostId &&
      (this.isHost || (this.hasSnapshot && this.now() - this.lastSnapshotAt < 2000 && this.members.every((member) => this.snapshotMembers.has(member.id))));
  }
  get seat(): FootballSeat | undefined { return this.seats.get(this.id); }
  get pendingCount(): number { return this.pending.size; }

  roster(members: readonly FootballMember[]): void {
    const previous = this.hostId;
    const previouslyInactive = new Set(this.members.filter((member) => !member.active).map((member) => member.id));
    const nextIds = new Set(members.map((member) => member.id));
    for (const id of this.desiredTargets.keys()) if (!nextIds.has(id) || !members.find((member) => member.id === id)?.active || previouslyInactive.has(id)) this.desiredTargets.delete(id);
    for (const member of members) if (!member.active || previouslyInactive.has(member.id)) { this.pending.delete(member.id); this.inputTime.delete(member.id); }
    if (this.automatic) {
      this.knownMembers = members.slice(0, 8);
      const ids = new Set(this.knownMembers.map((member) => member.id));
      for (const map of [this.pending, this.received, this.inputTime, this.inputWindow, this.authorityClaims]) for (const id of map.keys()) if (!ids.has(id)) map.delete(id);
      this.reconcileAutomatic();
      if (previous !== this.hostId) { this.accumulator = 0; this.pending.clear(); this.desiredTargets.clear(); this.state = { ...this.state, players: this.state.players.map((player) => ({ ...player, move: 0 })) }; }
      return;
    }
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
      this.desiredTargets.clear();
      this.state = { ...this.state, players: this.state.players.map((player) => ({ ...player, move: 0 })) };
    }
    if (this.isHost) this.snapshot();
  }

  receive(sender: string, value: unknown): boolean {
    if (!record(value) || !(this.automatic ? this.knownMembers.some((member) => member.id === sender) : this.seats.has(sender))) return false;
    if (value.kind === "state") {
      const joinOrder = value.joinOrder;
      if (!finite(value.round, 0, 1_000_000) || !Number.isInteger(value.round) || !validFootballState(value.state, this.state.roomId) || !Array.isArray(joinOrder) || joinOrder.length > 4 || joinOrder.some((id) => typeof id !== "string" || id.length > 80) || new Set(joinOrder).size !== joinOrder.length || !joinOrder.includes(sender)) return false;
      if (this.automatic) {
        if (!validFootballAuthority(value.authority) || !value.authority.established || value.authority.hostId !== sender || JSON.stringify(value.authority.joinOrder) !== JSON.stringify(joinOrder)) return false;
        if (this.hasSnapshot && value.authority.generation === this.roomAuthority?.generation && (value.round < this.round || value.round === this.round && value.state.tick < this.state.tick)) return false;
        if (!this.observeAuthority(sender, value.authority) || this.roomAuthority?.generation !== value.authority.generation) return false;
      }
      const bootstrap = !this.hasSnapshot && !this.mayCreate;
      const autoBootstrap = this.automatic && !this.hasSnapshot;
      if (!bootstrap && !autoBootstrap && (sender !== this.hostId || this.isHost) || !finite(value.round, 0, 1_000_000) || !Number.isInteger(value.round) || !validFootballState(value.state, this.state.roomId)) return false;
      if (this.hasSnapshot && (value.round < this.round || (value.round === this.round && value.state.tick < this.state.tick))) return false;
      this.joinOrder = this.automatic ? [...joinOrder] : [...joinOrder.filter((id) => this.members.some((member) => member.id === id)), ...this.joinOrder.filter((id) => !joinOrder.includes(id))];
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
    if (value.round !== this.round || this.automatic && value.generation !== this.roomAuthority?.generation) return false;
    if (value.kind === "again") {
      if (this.state.phase !== "finished") return false;
      this.state = resetTableFootballState(this.state);
      this.round += 1;
      this.pending.clear();
      this.desiredTargets.clear();
      this.accumulator = 0;
      this.snapshot();
      return true;
    }
    if (value.kind !== "input" || !finite(value.sequence, 1, Number.MAX_SAFE_INTEGER) || !Number.isInteger(value.sequence) || typeof value.move !== "number" || ![-1, 0, 1].includes(value.move) || typeof value.kick !== "boolean" || value.targetY !== undefined && !finite(value.targetY, 4, 96) || !this.members.find((member) => member.id === sender)?.active) return false;
    if (value.sequence <= (this.received.get(sender) ?? 0)) return false;
    const now = this.now();
    const window = this.inputWindow.get(sender);
    if (window && now - window.at < 1000 && window.count >= 30) return false;
    this.inputWindow.set(sender, !window || now - window.at >= 1000 ? { at: now, count: 1 } : { at: window.at, count: window.count + 1 });
    this.received.set(sender, value.sequence);
    this.inputTime.set(sender, now);
    const previous = this.pending.get(sender);
    if (typeof value.targetY === "number") this.desiredTargets.set(sender, value.targetY); else this.desiredTargets.delete(sender);
    this.pending.set(sender, { sequence: value.sequence, move: value.move as -1 | 0 | 1, kick: value.kick || previous?.kick === true, ...(typeof value.targetY === "number" ? { targetY: value.targetY } : {}) });
    return true;
  }

  input(message: Pick<TableFootballInputMessage, "sequence" | "move" | "kick"> & { targetY?: number }): void {
    const packet: FootballPacket = { kind: "input", ...message, round: this.round, ...(this.automatic ? { generation: this.roomAuthority?.generation } : {}) };
    if (this.isHost) this.receive(this.id, packet);
    else if (this.ready) this.send(packet, this.hostId);
  }
  again(): void { const packet: FootballPacket = { kind: "again", round: this.round, ...(this.automatic ? { generation: this.roomAuthority?.generation } : {}) }; if (this.isHost) this.receive(this.id, packet); else this.send(packet, this.hostId); }

  frame(delta: number): void {
    if (!this.isHost || !this.ready) { this.accumulator = 0; return; }
    if (this.state.phase === "finished") { if (this.now() - this.lastSentAt >= 1000) this.snapshot(); return; }
    this.accumulator += Math.min(Math.max(delta, 0), 100);
    while (this.accumulator >= TABLE_FOOTBALL_TICK_MS) {
      this.accumulator -= TABLE_FOOTBALL_TICK_MS;
      const inputs: TableFootballInputMessage[] = [];
      const occupied = new Set([...this.seats].filter(([id]) => this.members.find((member) => member.id === id)?.active).map(([, seat]) => seat));
      const push = (playerId: string, move: -1 | 0 | 1, kick: boolean) => inputs.push({ protocol: TABLE_FOOTBALL_PROTOCOL, type: "input", roomId: this.state.roomId, playerId, sequence: (this.state.inputSeqByPlayer[playerId] ?? 0) + 1, clientTick: this.state.tick, move, kick });
      const humanInputReceived = this.controls !== "steer" ? this.pending.size > 0 : [...this.pending.values()].some((input) => input.targetY !== undefined || input.move !== 0);
      for (const [id, input] of this.pending) {
        const seat = this.seats.get(id);
        // Blur/cancel clears may cross the rematch boundary. Only a new
        // movement or position request can start a ready mobile round.
        if (this.controls === "steer" && this.state.phase === "ready" && input.targetY === undefined && input.move === 0) continue;
        if (seat && (this.controls !== "steer" || input.targetY === undefined)) push(seat, input.move, this.controls === "steer" || input.kick);
      }
      this.pending.clear();
      for (const [id, seat] of this.seats) {
        const active = this.members.find((member) => member.id === id)?.active;
        if (!active) { this.desiredTargets.delete(id); continue; }
        if (this.controls === "steer") {
          if (this.state.phase === "ready" && !humanInputReceived) continue;
          const target = this.desiredTargets.get(id);
          const player = this.state.players.find((value) => value.id === seat);
          const move = target !== undefined && player ? target < player.y - 0.5 ? -1 : target > player.y + 0.5 ? 1 : 0 : player?.move ?? 0;
          if (target !== undefined && player && Math.abs(target - player.y) <= 0.5) this.desiredTargets.delete(id);
          push(seat, target === undefined && this.now() - (this.inputTime.get(id) ?? 0) > 750 ? 0 : move, this.state.phase !== "ready");
          continue;
        }
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
      if (this.automatic && this.roomAuthority && this.state.phase !== "ready") this.roomAuthority = { ...this.roomAuthority, started: true };
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
  private snapshot(): void { this.leaderId = this.id; this.lastSentAt = this.now(); if (this.automatic) { this.hasSnapshot = true; this.snapshotMembers = new Set(this.joinOrder); this.lastSnapshotAt = this.now(); } this.send({ kind: "state", round: this.round, state: this.state, joinOrder: this.joinOrder, ...(this.automatic ? { authority: this.authority } : {}) }); }
}
