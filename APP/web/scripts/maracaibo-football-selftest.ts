import assert from "node:assert/strict";
import { FootballSession, reserveSeats, validFootballState, type FootballMember, type FootballPacket } from "../src/table-os/maracaibo/football-session";
import { COUNTRY_COLOR_TEAMS } from "../src/table-os/game/types";
import { TABLE_FOOTBALL_TICK_MS } from "../src/table-os/game/engine";

let checks = 0;
function check(name: string, fn: () => void): void { fn(); checks++; console.log(`PASS ${name}`); }
function fixture(roomId = "maracaibo:1:ABCDEF", count = 4) {
  let now = 0;
  const clients = new Map<string, FootballSession>();
  const messages: { from: string; to?: string; packet: FootballPacket }[] = [];
  let sent = 0;
  const members: FootballMember[] = Array.from({ length: count }, (_, index) => ({ id: `phone-${index}`, joinedAt: index, preferredSeat: "home-forward", connected: true, active: true }));
  for (const member of members) clients.set(member.id, new FootballSession(member.id, { roomId, mode: "2v2", home: COUNTRY_COLOR_TEAMS[0], away: COUNTRY_COLOR_TEAMS[1], durationSeconds: 90 }, (packet, to) => { sent++; messages.push({ from: member.id, to, packet }); }, () => now, member.id === "phone-0"));
  function flush() {
    let delivered = 0;
    while (messages.length) {
      assert.ok(++delivered < 10_000, "No feedback loop");
      const message = messages.shift()!;
      for (const [id, client] of clients) if (id !== message.from && (!message.to || message.to === id)) client.receive(message.from, structuredClone(message.packet));
    }
  }
  function roster(next: FootballMember[]) { for (const client of clients.values()) client.roster(next); flush(); }
  roster(members);
  function step(ticks = 1) { for (let tick = 0; tick < ticks; tick++) { now += TABLE_FOOTBALL_TICK_MS; for (const client of clients.values()) client.frame(TABLE_FOOTBALL_TICK_MS); flush(); } }
  return { clients, members, step, roster, flush, host: () => [...clients.values()].find((client) => client.isHost)!, sent: () => sent, advanceTime: (delta: number) => { now += delta; } };
}

check("four simultaneous joins reserve four different rods", () => {
  const f = fixture();
  assert.equal(new Set(f.host().seats.values()).size, 4);
  assert.equal([...f.clients.values()].filter((client) => client.isHost).length, 1);
  assert.equal(reserveSeats([...f.members, { ...f.members[0], id: "extra", joinedAt: 20 }]).size, 4);
});
check("joining phones reserve distinct roles while network connections are pending", () => {
  const members: FootballMember[] = Array.from({ length: 4 }, (_, index) => ({ id: `pending-${index}`, joinedAt: index, preferredSeat: "home-forward", connected: false, active: true }));
  const sessions = members.map((member, index) => {
    const session = new FootballSession(member.id, { roomId: "pending", mode: "2v2", home: COUNTRY_COLOR_TEAMS[0], away: COUNTRY_COLOR_TEAMS[1] }, () => {}, () => 0, index === 0);
    session.roster([{ ...member, connected: true }]);
    session.roster(members.map((peer) => ({ ...peer, connected: peer.id === member.id })));
    return session;
  });
  assert.equal(new Set(sessions.map((session) => session.seat)).size, 4);
  assert.ok(sessions.every((session) => !session.ready));
  assert.equal(sessions.filter((session) => session.isHost).length, 1);
});
check("computers wait for human kickoff; one-person practice plays", () => {
  const f = fixture("practice", 1);
  f.step(180);
  assert.equal(f.host().state.phase, "ready");
  f.host().input({ sequence: 1, move: -1, kick: true });
  f.step(600);
  assert.notEqual(f.host().state.phase, "ready");
  assert.ok(f.host().state.players.some((player) => player.id !== f.host().seat && player.y !== 50));
});
check("all phones share score and clock; remote input controls its reserved rod", () => {
  const f = fixture();
  const remote = f.clients.get("phone-3")!;
  remote.input({ sequence: 1, move: -1, kick: true }); f.flush(); f.step(30);
  const controlled = f.host().state.players.find((player) => player.id === remote.seat)!;
  assert.ok(controlled.y < 50);
  f.roster(f.members);
  for (const client of f.clients.values()) assert.deepEqual(client.state, f.host().state);
});
check("host departure preserves match and selects exactly one replacement", () => {
  const f = fixture();
  f.host().input({ sequence: 1, move: 1, kick: true }); f.step(180); f.roster(f.members);
  const state = f.host().state;
  f.clients.delete("phone-0"); f.roster(f.members.slice(1));
  assert.equal(f.host().id, "phone-1");
  assert.equal(f.host().state.tick, state.tick);
  assert.deepEqual(f.host().state.score, state.score);
  f.step(60); f.roster(f.members.slice(1));
  assert.equal([...f.clients.values()].filter((client) => client.isHost).length, 1);
  for (const client of f.clients.values()) assert.equal(client.state.tick, f.host().state.tick);
});
check("late join with a skewed clock bootstraps instead of resetting the host", () => {
  const f = fixture("late-join", 3);
  f.host().input({ sequence: 1, move: 1, kick: true }); f.step(180);
  const guest = { id: "new-phone", joinedAt: -1_000_000, preferredSeat: "home-forward", connected: true, active: true } as const;
  const late = new FootballSession(guest.id, { roomId: "late-join", mode: "2v2", home: COUNTRY_COLOR_TEAMS[0], away: COUNTRY_COLOR_TEAMS[1] }, () => {}, () => 0, false);
  late.roster([guest, ...f.members]);
  assert.equal(late.isHost, false);
  f.clients.set(guest.id, late); f.roster([guest, ...f.members]);
  assert.equal(f.host().id, "phone-0"); assert.equal(late.state.tick, f.host().state.tick);
  assert.equal(new Set(f.host().seats.values()).size, 4);
});
check("hidden host hands off; incomplete mesh pauses instead of splitting the room", () => {
  const f = fixture();
  const hidden = f.members.map((member, index) => ({ ...member, active: index !== 0 }));
  f.roster(hidden); assert.equal(f.host().id, "phone-1");
  f.roster(hidden.map((member, index) => ({ ...member, connected: index !== 3 })));
  const tick = f.host().state.tick; f.step(30); assert.equal(f.host().state.tick, tick);
});
check("stale, forged, cross-room and nonfinite packets cannot corrupt state", () => {
  const f = fixture(); const host = f.host(); const remote = f.clients.get("phone-1")!;
  assert.equal(host.receive("stranger", { kind: "input", sequence: 1, move: 1, kick: true }), false);
  assert.equal(host.receive("phone-1", { kind: "input", sequence: NaN, move: 1, kick: true }), false);
  assert.equal(host.receive("phone-1", { kind: "input", sequence: 1, move: "1", kick: true }), false);
  assert.equal(remote.receive("phone-2", { kind: "state", round: 0, state: host.state }), false);
  assert.equal(validFootballState({ ...host.state, roomId: "other" }, host.state.roomId), false);
  assert.equal(validFootballState({ ...host.state, ball: { ...host.state.ball, x: Infinity } }, host.state.roomId), false);
  assert.equal(validFootballState({ ...host.state, players: [] }, host.state.roomId), false);
  const before = host.state; assert.equal(host.receive("phone-1", null), false); assert.deepEqual(host.state, before);
});
check("input storms are coalesced and rate-limited to four pending slots", () => {
  const f = fixture(); const host = f.host(); let accepted = 0;
  for (let sequence = 1; sequence <= 20_000; sequence++) for (const member of f.members) if (host.receive(member.id, { kind: "input", sequence, move: 1, kick: sequence === 1 })) accepted++;
  assert.equal(accepted, 120); assert.equal(host.pendingCount, 4);
  f.step(); assert.equal(host.pendingCount, 0);
  assert.equal(host.receive("phone-1", { kind: "input", sequence: 1, move: 0, kick: false }), false);
});
check("movement expires if a phone stops sending; a delayed frame has bounded work", () => {
  const f = fixture(); f.host().input({ sequence: 1, move: 1, kick: false }); f.step(60);
  assert.equal(f.host().state.players.find((player) => player.id === f.host().seat)!.move, 0);
  const tick = f.host().state.tick; f.host().frame(60_000); assert.ok(f.host().state.tick - tick <= 6);
});
check("90-second finish, late join, replay and stale round rejection", () => {
  const f = fixture(); f.host().input({ sequence: 1, move: 1, kick: true }); f.step(5401);
  assert.equal(f.host().state.phase, "finished");
  f.step(180); assert.ok(f.clients.get("phone-1")!.ready, "Full-time heartbeat permits rematch");
  const old = { kind: "state", round: 0, state: f.host().state, joinOrder: f.members.map((member) => member.id) } as const;
  f.clients.get("phone-1")!.again(); f.flush();
  assert.equal(f.host().round, 1); assert.equal(f.host().state.phase, "ready");
  assert.equal(f.clients.get("phone-2")!.receive("phone-0", old), false);
  assert.equal(f.host().receive("phone-1", { kind: "again" }), false, "Cannot reset an active round");
});
check("40 rooms / 160 simulated phones stay isolated for a complete round", () => {
  const rooms = Array.from({ length: 40 }, (_, table) => fixture(`maracaibo:${table + 1}:ABCDEF`));
  for (const room of rooms) room.host().input({ sequence: 1, move: 1, kick: true });
  for (let tick = 0; tick < 5401; tick++) for (const room of rooms) room.step();
  for (const [index, room] of rooms.entries()) {
    assert.equal(room.host().state.phase, "finished");
    for (const client of room.clients.values()) { assert.equal(client.state.roomId, `maracaibo:${index + 1}:ABCDEF`); assert.deepEqual(client.state.score, room.host().state.score); }
    assert.ok(room.sent() < 1100, "Snapshots are limited to 10 Hz on peer channels");
  }
  assert.equal(rooms[1].host().receive("phone-1", { kind: "state", round: 0, state: rooms[0].host().state }), false);
});
console.log(`MARACAIBO_RESULT ${JSON.stringify({ ok: true, checks, simulatedRooms: 40, simulatedPhones: 160 })}`);
