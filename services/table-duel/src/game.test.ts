// Rule tests for Table Duel. Plain node:test so `npm test` needs nothing but
// the dev dependencies already installed for the server.

import assert from "node:assert/strict";
import test from "node:test";
import {
  FLEET,
  GRID,
  applyShot,
  isPlayerOut,
  key,
  nextTurn,
  randomFleet,
  validateFleet,
  viewFor,
  winner,
  type Boat,
  type Player,
  type Room,
} from "./game.js";

function player(id: string, name: string, boats: Boat[]): Player {
  return {
    id,
    name,
    boats,
    hits: new Set<string>(),
    misses: new Set<string>(),
    ready: true,
    connected: true,
  };
}

const straightFleet: Boat[] = [
  { cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }] },
  { cells: [{ r: 2, c: 0 }, { r: 3, c: 0 }] },
  { cells: [{ r: 5, c: 4 }, { r: 5, c: 5 }] },
];

test("a straight, non-overlapping fleet is legal", () => {
  assert.equal(validateFleet(straightFleet), null);
});

test("overlapping boats are rejected", () => {
  const overlapping: Boat[] = [
    { cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }] },
    { cells: [{ r: 0, c: 2 }, { r: 1, c: 2 }] },
    { cells: [{ r: 5, c: 4 }, { r: 5, c: 5 }] },
  ];
  assert.equal(validateFleet(overlapping), "Boats cannot overlap.");
});

test("boats with a gap or a bend are rejected", () => {
  const gapped: Boat[] = [
    { cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 3 }] },
    { cells: [{ r: 2, c: 0 }, { r: 3, c: 0 }] },
    { cells: [{ r: 5, c: 4 }, { r: 5, c: 5 }] },
  ];
  assert.equal(validateFleet(gapped), "Boats cannot have gaps.");

  const bent: Boat[] = [
    { cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }] },
    { cells: [{ r: 2, c: 0 }, { r: 3, c: 0 }] },
    { cells: [{ r: 5, c: 4 }, { r: 5, c: 5 }] },
  ];
  assert.equal(validateFleet(bent), "Boats must be straight.");
});

test("boats running off the grid are rejected", () => {
  const offBoard: Boat[] = [
    { cells: [{ r: 0, c: GRID - 1 }, { r: 0, c: GRID }, { r: 0, c: GRID + 1 }] },
    { cells: [{ r: 2, c: 0 }, { r: 3, c: 0 }] },
    { cells: [{ r: 5, c: 4 }, { r: 5, c: 5 }] },
  ];
  assert.equal(validateFleet(offBoard), "Boats must stay on the grid.");
});

test("random fleets are always legal", () => {
  for (let i = 0; i < 300; i += 1) {
    assert.equal(validateFleet(randomFleet()), null, `attempt ${i} produced an illegal fleet`);
  }
});

test("a shot reports miss, hit, sunk, then eliminated", () => {
  const shooter = player("a", "Ana", straightFleet);
  const target = player("b", "Ben", straightFleet);

  assert.deepEqual(applyShot(shooter, target, 1, 1), {
    outcome: "miss",
    message: "Ana missed Ben.",
  });

  const firstHit = applyShot(shooter, target, 0, 0);
  assert.equal(typeof firstHit === "object" && firstHit.outcome, "hit");

  applyShot(shooter, target, 0, 1);
  const sunk = applyShot(shooter, target, 0, 2);
  assert.equal(typeof sunk === "object" && sunk.outcome, "sunk");

  applyShot(shooter, target, 2, 0);
  applyShot(shooter, target, 3, 0);
  applyShot(shooter, target, 5, 4);
  const last = applyShot(shooter, target, 5, 5);
  assert.equal(typeof last === "object" && last.outcome, "eliminated");
  assert.equal(isPlayerOut(target), true);
});

test("repeat shots, self-fire and off-grid shots are refused", () => {
  const shooter = player("a", "Ana", straightFleet);
  const target = player("b", "Ben", straightFleet);
  applyShot(shooter, target, 4, 4);
  assert.equal(applyShot(shooter, target, 4, 4), "Already fired there.");
  assert.equal(applyShot(shooter, shooter, 1, 1), "Fire at someone else.");
  assert.equal(applyShot(shooter, target, -1, 0), "That square is off the grid.");
});

test("turn order skips players who are out or gone", () => {
  const a = player("a", "Ana", straightFleet);
  const b = player("b", "Ben", straightFleet);
  const c = player("c", "Cy", straightFleet);
  b.connected = false;
  const room: Room = { code: "TEST", players: [a, b, c], phase: "firing", turn: 0, log: [], updatedAt: 0 };
  assert.equal(nextTurn(room), 2, "should skip the disconnected player");

  // Sink Cy's whole fleet; the turn should come back round to Ana.
  for (const boat of c.boats) {
    for (const cell of boat.cells) c.hits.add(key(cell.r, cell.c));
  }
  assert.equal(nextTurn(room), 0);
  assert.equal(winner(room)?.id, "a");
});

test("a player never receives another player's boat positions", () => {
  const a = player("a", "Ana", straightFleet);
  const b = player("b", "Ben", randomFleet());
  const room: Room = { code: "TEST", players: [a, b], phase: "firing", turn: 0, log: [], updatedAt: 0 };

  const seen = viewFor(room, "a");
  assert.equal(seen.you?.boats.length, FLEET.length, "you see your own fleet");

  // Opponent entries carry a count of boats left and the squares already fired
  // at — never any coordinates. `boatsLeft` is the only "boat" word allowed.
  for (const entry of seen.players) {
    assert.deepEqual(
      Object.keys(entry).filter((k) => k.toLowerCase().includes("boat")),
      ["boatsLeft"],
      "the only boat field on a player entry is the remaining count",
    );
    assert.equal(typeof entry.boatsLeft, "number");
  }

  // And Ben's actual positions must not appear anywhere in what Ana receives.
  const benCells = new Set(b.boats.flatMap((boat) => boat.cells.map((cell) => key(cell.r, cell.c))));
  const anaSees = new Set([
    ...(seen.you?.boats.flat().map((cell) => key(cell.r, cell.c)) ?? []),
    ...seen.players.flatMap((p) => [...p.hits, ...p.misses]),
  ]);
  for (const cell of benCells) {
    const isAnaOwnCell = a.boats.some((boat) =>
      boat.cells.some((point) => key(point.r, point.c) === cell),
    );
    if (isAnaOwnCell) continue;
    assert.equal(anaSees.has(cell), false, `Ben's boat square ${cell} leaked to Ana`);
  }
});
