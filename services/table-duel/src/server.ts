// Table Duel room server — a small WebSocket relay that holds live rooms in
// memory. No database, no secrets, no customer data: a room is a four-letter
// code, a few nicknames and a grid, and it disappears when the table leaves.
//
// Rules live in game.ts; this file only handles sockets, turns and cleanup.

import { createServer } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  activePlayers,
  applyShot,
  isPlayerOut,
  nextTurn,
  randomFleet,
  validateFleet,
  viewFor,
  winner,
  type Boat,
  type Player,
  type Room,
} from "./game.js";

const PORT = Number(process.env.PORT ?? 8080);
/** A room with nobody connected is dropped after this long. */
const ROOM_TTL_MS = 2 * 60 * 60 * 1000;
const SWEEP_MS = 5 * 60 * 1000;
/** Ambiguous letters (I/O/0/1) are left out so a code reads cleanly across a table. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const rooms = new Map<string, Room>();
const sockets = new WeakMap<WebSocket, { code: string; playerId: string }>();

function makeCode(): string {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    let code = "";
    for (let i = 0; i < 4; i += 1) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    if (!rooms.has(code)) return code;
  }
  return `R${Date.now().toString(36).slice(-3).toUpperCase()}`;
}

function makePlayerId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function cleanName(raw: unknown, fallback: string): string {
  const name = typeof raw === "string" ? raw.trim().slice(0, 14) : "";
  return name.length > 0 ? name : fallback;
}

function broadcast(room: Room): void {
  room.updatedAt = Date.now();
  for (const [socket, tag] of liveSockets()) {
    if (tag.code !== room.code) continue;
    send(socket, { t: "state", ...viewFor(room, tag.playerId) });
  }
}

/** Sockets are tracked in a plain list so the room broadcast can walk them. */
const openSockets = new Set<WebSocket>();
function* liveSockets(): Generator<[WebSocket, { code: string; playerId: string }]> {
  for (const socket of openSockets) {
    const tag = sockets.get(socket);
    if (tag) yield [socket, tag];
  }
}

function send(socket: WebSocket, payload: unknown): void {
  if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(payload));
}

function fail(socket: WebSocket, message: string): void {
  send(socket, { t: "error", message });
}

function newPlayer(name: string): Player {
  return {
    id: makePlayerId(),
    name,
    boats: [],
    hits: new Set<string>(),
    misses: new Set<string>(),
    ready: false,
    connected: true,
  };
}

/** Once everyone in the room is ready, the round starts. */
function maybeStartFiring(room: Room): void {
  if (room.phase !== "placing") return;
  const seated = room.players.filter((p) => p.connected);
  if (seated.length < MIN_PLAYERS) return;
  if (!seated.every((p) => p.ready)) return;
  room.phase = "firing";
  room.turn = room.players.findIndex((p) => p.connected);
  room.log.push("All fleets placed. Fire!");
}

function finishIfWon(room: Room): void {
  const champion = winner(room);
  if (champion) {
    room.phase = "over";
    room.log.push(`${champion.name} is the last fleet floating.`);
  }
}

function handle(socket: WebSocket, raw: string): void {
  let msg: Record<string, unknown>;
  try {
    msg = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    fail(socket, "Bad message.");
    return;
  }

  const type = msg.t;

  if (type === "create") {
    const code = makeCode();
    const player = newPlayer(cleanName(msg.name, "Player 1"));
    const room: Room = {
      code,
      players: [player],
      phase: "placing",
      turn: 0,
      log: ["Room opened. Share the code with your table."],
      updatedAt: Date.now(),
    };
    rooms.set(code, room);
    sockets.set(socket, { code, playerId: player.id });
    send(socket, { t: "joined", code, playerId: player.id });
    broadcast(room);
    return;
  }

  if (type === "join") {
    const code = typeof msg.code === "string" ? msg.code.trim().toUpperCase() : "";
    const room = rooms.get(code);
    if (!room) {
      fail(socket, "No room with that code.");
      return;
    }
    if (room.phase === "firing" || room.phase === "over") {
      fail(socket, "That round already started.");
      return;
    }
    if (room.players.filter((p) => p.connected).length >= MAX_PLAYERS) {
      fail(socket, `Table is full (${MAX_PLAYERS} players).`);
      return;
    }
    const player = newPlayer(cleanName(msg.name, `Player ${room.players.length + 1}`));
    room.players.push(player);
    room.log.push(`${player.name} joined.`);
    sockets.set(socket, { code, playerId: player.id });
    send(socket, { t: "joined", code, playerId: player.id });
    broadcast(room);
    return;
  }

  const tag = sockets.get(socket);
  const room = tag ? rooms.get(tag.code) : undefined;
  const player = room?.players.find((p) => p.id === tag?.playerId);
  if (!room || !player) {
    fail(socket, "You are not in a room.");
    return;
  }

  if (type === "place") {
    if (room.phase !== "placing") {
      fail(socket, "The round already started.");
      return;
    }
    const boats: Boat[] = Array.isArray(msg.boats)
      ? (msg.boats as unknown[]).map((cells) => ({
          cells: Array.isArray(cells)
            ? (cells as unknown[]).map((cell) => {
                const point = cell as { r?: unknown; c?: unknown };
                return { r: Number(point?.r), c: Number(point?.c) };
              })
            : [],
        }))
      : randomFleet();
    const problem = validateFleet(boats);
    if (problem) {
      fail(socket, problem);
      return;
    }
    player.boats = boats;
    player.ready = true;
    room.log.push(`${player.name} is ready.`);
    maybeStartFiring(room);
    broadcast(room);
    return;
  }

  if (type === "fire") {
    if (room.phase !== "firing") {
      fail(socket, "Not firing yet.");
      return;
    }
    if (room.players[room.turn]?.id !== player.id) {
      fail(socket, "Wait for your turn.");
      return;
    }
    const target = room.players.find((p) => p.id === msg.target);
    if (!target || !target.connected || isPlayerOut(target)) {
      fail(socket, "Pick a player who is still in.");
      return;
    }
    const result = applyShot(player, target, Number(msg.r), Number(msg.c));
    if (typeof result === "string") {
      fail(socket, result);
      return;
    }
    room.log.push(result.message);
    finishIfWon(room);
    if (room.phase === "firing") room.turn = nextTurn(room);
    broadcast(room);
    return;
  }

  if (type === "again") {
    if (room.phase !== "over") {
      fail(socket, "Finish this round first.");
      return;
    }
    for (const seat of room.players) {
      seat.boats = [];
      seat.hits.clear();
      seat.misses.clear();
      seat.ready = false;
    }
    room.players = room.players.filter((p) => p.connected);
    room.phase = "placing";
    room.turn = 0;
    room.log = ["New round. Place your boats."];
    broadcast(room);
    return;
  }

  fail(socket, "Unknown action.");
}

function drop(socket: WebSocket): void {
  openSockets.delete(socket);
  const tag = sockets.get(socket);
  if (!tag) return;
  const room = rooms.get(tag.code);
  if (!room) return;
  const player = room.players.find((p) => p.id === tag.playerId);
  if (!player) return;

  player.connected = false;
  room.log.push(`${player.name} left.`);

  // A round cannot continue with one fleet left; call it there rather than
  // leaving the table staring at a dead turn.
  if (room.phase === "firing") {
    if (room.players[room.turn]?.id === player.id) room.turn = nextTurn(room);
    if (activePlayers(room).length < MIN_PLAYERS) finishIfWon(room);
  }
  if (room.players.every((p) => !p.connected)) {
    rooms.delete(room.code);
    return;
  }
  broadcast(room);
}

const http = createServer((req, res) => {
  if (req.url === "/healthz") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server: http });

wss.on("connection", (socket) => {
  openSockets.add(socket);
  socket.on("message", (data) => handle(socket, data.toString()));
  socket.on("close", () => drop(socket));
  socket.on("error", () => drop(socket));
});

setInterval(() => {
  const cutoff = Date.now() - ROOM_TTL_MS;
  for (const [code, room] of rooms) {
    if (room.updatedAt < cutoff) rooms.delete(code);
  }
}, SWEEP_MS).unref();

http.listen(PORT, () => {
  console.log(`table-duel room server listening on :${PORT}`);
});
