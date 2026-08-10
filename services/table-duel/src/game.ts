// Table Duel — pure game rules. No I/O, no timers, no randomness at call sites
// that matter: every function here is deterministic given its inputs, so the
// whole rule set is unit-testable without a socket or a browser.
//
// The board is small on purpose. Six by six with three short boats keeps a
// round at roughly three to five minutes — one course of food, not an evening.

export const GRID = 6;
export const FLEET: readonly number[] = [3, 2, 2];
export const MAX_PLAYERS = 6;
export const MIN_PLAYERS = 2;

export type Cell = { r: number; c: number };
export type Boat = { cells: Cell[] };

export type Player = {
  id: string;
  name: string;
  boats: Boat[];
  /** Cells this player has been hit on, keyed "r,c". */
  hits: Set<string>;
  /** Cells fired at this player that missed, keyed "r,c". */
  misses: Set<string>;
  ready: boolean;
  connected: boolean;
};

export type Phase = "lobby" | "placing" | "firing" | "over";

export type Room = {
  code: string;
  players: Player[];
  phase: Phase;
  /** Index into players of whoever fires next. */
  turn: number;
  /** Human-readable log of the last few shots, newest last. */
  log: string[];
  updatedAt: number;
};

export const key = (r: number, c: number): string => `${r},${c}`;

export function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < GRID && c >= 0 && c < GRID;
}

/** Every cell occupied by a player's fleet. */
export function fleetCells(player: Player): Set<string> {
  const cells = new Set<string>();
  for (const boat of player.boats) {
    for (const cell of boat.cells) cells.add(key(cell.r, cell.c));
  }
  return cells;
}

/** A boat is sunk when every one of its cells has been hit. */
export function isBoatSunk(boat: Boat, hits: Set<string>): boolean {
  return boat.cells.every((cell) => hits.has(key(cell.r, cell.c)));
}

/** A player is out when their whole fleet is sunk. */
export function isPlayerOut(player: Player): boolean {
  if (player.boats.length === 0) return false;
  return player.boats.every((boat) => isBoatSunk(boat, player.hits));
}

/** Players who can still be fired at: afloat and still in the room. */
export function activePlayers(room: Room): Player[] {
  return room.players.filter((p) => p.connected && !isPlayerOut(p));
}

/**
 * Validate a proposed fleet: right number of boats, right lengths, each boat a
 * straight unbroken line, all in bounds, and no two boats overlapping.
 * Returns null when the fleet is legal, or a player-facing reason when not.
 */
export function validateFleet(boats: Boat[]): string | null {
  if (boats.length !== FLEET.length) return "Place all three boats.";

  const lengths = [...boats.map((b) => b.cells.length)].sort((a, b) => b - a);
  const wanted = [...FLEET].sort((a, b) => b - a);
  if (lengths.some((len, i) => len !== wanted[i])) return "Boat sizes are wrong.";

  const taken = new Set<string>();
  for (const boat of boats) {
    const rows = new Set(boat.cells.map((cell) => cell.r));
    const cols = new Set(boat.cells.map((cell) => cell.c));
    if (rows.size !== 1 && cols.size !== 1) return "Boats must be straight.";

    const line = rows.size === 1
      ? [...boat.cells].sort((a, b) => a.c - b.c)
      : [...boat.cells].sort((a, b) => a.r - b.r);
    for (let i = 0; i < line.length; i += 1) {
      const cell = line[i];
      if (!inBounds(cell.r, cell.c)) return "Boats must stay on the grid.";
      if (i > 0) {
        const prev = line[i - 1];
        const step = Math.abs(cell.r - prev.r) + Math.abs(cell.c - prev.c);
        if (step !== 1) return "Boats cannot have gaps.";
      }
      const id = key(cell.r, cell.c);
      if (taken.has(id)) return "Boats cannot overlap.";
      taken.add(id);
    }
  }
  return null;
}

/**
 * Lay out a legal fleet using the supplied random source, so tests can pass a
 * seeded generator and get a repeatable board.
 */
export function randomFleet(random: () => number = Math.random): Boat[] {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const taken = new Set<string>();
    const boats: Boat[] = [];
    let ok = true;

    for (const size of FLEET) {
      let placed = false;
      for (let tries = 0; tries < 60 && !placed; tries += 1) {
        const horizontal = random() < 0.5;
        const span = size - 1;
        const r = Math.floor(random() * (horizontal ? GRID : GRID - span));
        const c = Math.floor(random() * (horizontal ? GRID - span : GRID));
        const cells: Cell[] = [];
        for (let i = 0; i < size; i += 1) {
          cells.push(horizontal ? { r, c: c + i } : { r: r + i, c });
        }
        if (cells.some((cell) => taken.has(key(cell.r, cell.c)))) continue;
        cells.forEach((cell) => taken.add(key(cell.r, cell.c)));
        boats.push({ cells });
        placed = true;
      }
      if (!placed) {
        ok = false;
        break;
      }
    }
    if (ok && validateFleet(boats) === null) return boats;
  }
  // Unreachable with this board size, but a fleet must always come back.
  return FLEET.map((size, index) => ({
    cells: Array.from({ length: size }, (_, i) => ({ r: index * 2, c: i })),
  }));
}

export type ShotResult = {
  outcome: "hit" | "miss" | "sunk" | "eliminated";
  message: string;
};

/**
 * Apply a shot. Assumes the caller has already checked whose turn it is; the
 * only rules enforced here are board rules (bounds, no repeats, no self-fire).
 */
export function applyShot(shooter: Player, target: Player, r: number, c: number): ShotResult | string {
  if (!inBounds(r, c)) return "That square is off the grid.";
  if (shooter.id === target.id) return "Fire at someone else.";
  const id = key(r, c);
  if (target.hits.has(id) || target.misses.has(id)) return "Already fired there.";

  const occupied = fleetCells(target).has(id);
  if (!occupied) {
    target.misses.add(id);
    return { outcome: "miss", message: `${shooter.name} missed ${target.name}.` };
  }

  target.hits.add(id);
  const boat = target.boats.find((b) => b.cells.some((cell) => key(cell.r, cell.c) === id));

  if (isPlayerOut(target)) {
    return { outcome: "eliminated", message: `${shooter.name} sank ${target.name}'s last boat!` };
  }
  if (boat && isBoatSunk(boat, target.hits)) {
    return { outcome: "sunk", message: `${shooter.name} sank a boat of ${target.name}'s!` };
  }
  return { outcome: "hit", message: `${shooter.name} hit ${target.name}!` };
}

/**
 * Advance to the next player who is connected and still afloat. Returns the new
 * turn index; if nobody else can play it returns the current one unchanged.
 */
export function nextTurn(room: Room): number {
  const count = room.players.length;
  for (let step = 1; step <= count; step += 1) {
    const index = (room.turn + step) % count;
    const player = room.players[index];
    if (player.connected && !isPlayerOut(player)) return index;
  }
  return room.turn;
}

/** The winner once one player is left standing, else null. */
export function winner(room: Room): Player | null {
  const alive = activePlayers(room);
  return alive.length === 1 && room.players.length >= MIN_PLAYERS ? alive[0] : null;
}

/**
 * What one player is allowed to see: their own fleet in full, and for everyone
 * else only the squares that have already been fired at. Hidden boats never
 * leave the server, so a player cannot read the answer out of the network tab.
 */
export function viewFor(room: Room, viewerId: string) {
  const me = room.players.find((p) => p.id === viewerId) ?? null;
  return {
    code: room.code,
    phase: room.phase,
    turnId: room.players[room.turn]?.id ?? null,
    log: room.log.slice(-4),
    you: me
      ? {
          id: me.id,
          name: me.name,
          ready: me.ready,
          out: isPlayerOut(me),
          boats: me.boats.map((boat) => boat.cells),
          hits: [...me.hits],
          misses: [...me.misses],
        }
      : null,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      ready: p.ready,
      connected: p.connected,
      out: isPlayerOut(p),
      hits: [...p.hits],
      misses: [...p.misses],
      boatsLeft: p.boats.filter((boat) => !isBoatSunk(boat, p.hits)).length,
    })),
    winnerId: winner(room)?.id ?? null,
  };
}

export type RoomView = ReturnType<typeof viewFor>;
