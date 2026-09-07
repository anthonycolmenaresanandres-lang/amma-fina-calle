// End-to-end smoke: boots nothing itself — point it at a running room server
// and it plays a full three-player round over real WebSockets, then prints one
// SMOKE_RESULT line. Run `npm start` in another shell first.
//
//   npx tsx src/smoke.ts ws://127.0.0.1:8080

import WebSocket from "ws";
import { GRID, type RoomView } from "./game.js";

const URL = process.argv[2] ?? "ws://127.0.0.1:8080";
const NAMES = ["Ana", "Ben", "Cy"];

type Client = {
  name: string;
  socket: WebSocket;
  playerId: string;
  view: RoomView | null;
  errors: string[];
};

function connect(name: string): Promise<Client> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(URL);
    const client: Client = { name, socket, playerId: "", view: null, errors: [] };
    socket.on("open", () => resolve(client));
    socket.on("error", reject);
    socket.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.t === "joined") client.playerId = msg.playerId;
      else if (msg.t === "state") client.view = msg as RoomView;
      else if (msg.t === "error") client.errors.push(msg.message);
    });
  });
}

const send = (client: Client, payload: unknown) => client.socket.send(JSON.stringify(payload));

/** Wait until a predicate holds, or throw with a label so failures are readable. */
async function until(label: string, check: () => boolean, ms = 4000): Promise<void> {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (check()) return;
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error(`timeout waiting for ${label}`);
}

function fail(detail: string): never {
  console.log(`SMOKE_RESULT ${JSON.stringify({ ok: false, detail })}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const clients: Client[] = [];
  for (const name of NAMES) clients.push(await connect(name));
  const [ana, ben, cy] = clients;

  send(ana, { t: "create", name: ana.name });
  await until("room code", () => Boolean(ana.playerId && ana.view));
  const code = ana.view!.code;
  if (!/^[A-Z0-9]{4}$/.test(code)) fail(`bad room code: ${code}`);

  send(ben, { t: "join", code, name: ben.name });
  send(cy, { t: "join", code, name: cy.name });
  await until("three seats", () => (ana.view?.players.length ?? 0) === 3);

  // Everyone takes a random fleet (the "surprise me" button in the UI).
  for (const client of clients) send(client, { t: "place" });
  await until("round start", () => ana.view?.phase === "firing");

  // Nobody may fire out of turn.
  const outOfTurn = clients.find((c) => c.playerId !== ana.view!.turnId)!;
  send(outOfTurn, { t: "fire", target: ana.playerId, r: 0, c: 0 });
  await until("turn guard", () => outOfTurn.errors.includes("Wait for your turn."));

  // A player must not see another player's fleet.
  const leaked = JSON.stringify(ben.view!.players).match(/"r":\d+,"c":\d+/);
  if (leaked) fail("opponent boat coordinates were sent to a player");

  // Play it out: whoever is up fires at the first opponent still in, sweeping
  // the grid until one fleet is left.
  for (let shot = 0; shot < GRID * GRID * 3 && ana.view!.phase === "firing"; shot += 1) {
    const view = ana.view!;
    const shooter = clients.find((c) => c.playerId === view.turnId);
    if (!shooter) fail("no client holds the current turn");
    const target = view.players.find((p) => p.id !== shooter.playerId && !p.out && p.connected);
    if (!target) break;
    const fired = new Set([...target.hits, ...target.misses]);
    const next = Array.from({ length: GRID * GRID }, (_, i) => ({ r: Math.floor(i / GRID), c: i % GRID }))
      .find((cell) => !fired.has(`${cell.r},${cell.c}`));
    if (!next) break;
    send(shooter, { t: "fire", target: target.id, r: next.r, c: next.c });
    await until("shot registered", () => {
      const fresh = ana.view!.players.find((p) => p.id === target.id)!;
      return fresh.hits.length + fresh.misses.length > fired.size;
    });
  }

  await until("round over", () => ana.view?.phase === "over");
  const champion = ana.view!.players.find((p) => p.id === ana.view!.winnerId);
  if (!champion) fail("round ended with no winner");
  if (ana.view!.players.filter((p) => !p.out).length !== 1) fail("more than one fleet left afloat");

  // Rematch resets the table.
  send(ana, { t: "again" });
  await until("rematch", () => ana.view?.phase === "placing");
  if (ana.view!.players.some((p) => p.hits.length || p.misses.length)) fail("rematch kept old damage");

  const unexpected = clients.flatMap((c) => c.errors).filter((e) => e !== "Wait for your turn.");
  if (unexpected.length) fail(`unexpected errors: ${unexpected.join("; ")}`);

  console.log(
    `SMOKE_RESULT ${JSON.stringify({ ok: true, detail: `room ${code}, winner ${champion.name}, rematch ok` })}`,
  );
  for (const client of clients) client.socket.close();
  process.exit(0);
}

main().catch((error) => fail(String(error?.message ?? error)));
