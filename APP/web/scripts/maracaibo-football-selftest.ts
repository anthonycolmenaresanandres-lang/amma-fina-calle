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
  assert.equal(host.receive("stranger", { kind: "input", round: 0, sequence: 1, move: 1, kick: true }), false);
  assert.equal(host.receive("phone-1", { kind: "input", round: 0, sequence: NaN, move: 1, kick: true }), false);
  assert.equal(host.receive("phone-1", { kind: "input", round: 0, sequence: 1, move: "1", kick: true }), false);
  assert.equal(remote.receive("phone-2", { kind: "state", round: 0, state: host.state }), false);
  assert.equal(validFootballState({ ...host.state, roomId: "other" }, host.state.roomId), false);
  assert.equal(validFootballState({ ...host.state, ball: { ...host.state.ball, x: Infinity } }, host.state.roomId), false);
  assert.equal(validFootballState({ ...host.state, players: [] }, host.state.roomId), false);
  const before = host.state; assert.equal(host.receive("phone-1", null), false); assert.deepEqual(host.state, before);
});
check("input storms are coalesced and rate-limited to four pending slots", () => {
  const f = fixture(); const host = f.host(); let accepted = 0;
  for (let sequence = 1; sequence <= 20_000; sequence++) for (const member of f.members) if (host.receive(member.id, { kind: "input", round: 0, sequence, move: 1, kick: sequence === 1 })) accepted++;
  assert.equal(accepted, 120); assert.equal(host.pendingCount, 4);
  f.step(); assert.equal(host.pendingCount, 0);
  assert.equal(host.receive("phone-1", { kind: "input", round: 0, sequence: 1, move: 0, kick: false }), false);
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
  assert.equal(f.host().receive("phone-1", { kind: "again", round: 0 }), false, "Cannot reset an active round");
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
function automaticFixture(count = 4, partialCreators = false, roomId = "maracaibo:1:table", beforeMerge?: (clients: Map<string, FootballSession>) => void) {
  let now = 0;
  const clients = new Map<string, FootballSession>();
  const messages: { from: string; to?: string; packet: FootballPacket }[] = [];
  let members: FootballMember[] = Array.from({ length: count }, (_, index) => ({ id: `auto-${index}`, joinedAt: 100 - index * 1000, preferredSeat: "auto", connected: true, active: true }));
  const create = (member: FootballMember) => {
    const client = new FootballSession(member.id, { roomId, mode: "2v2", home: COUNTRY_COLOR_TEAMS[0], away: COUNTRY_COLOR_TEAMS[1] }, (packet, to) => messages.push({ from: member.id, to, packet }), () => now, "automatic");
    clients.set(member.id, client);
    return client;
  };
  for (const member of members) { const client = create(member); if (partialCreators) { client.roster([member]); client.completeDiscovery(); } }
  beforeMerge?.(clients);
  const flush = () => {
    let deliveries = 0;
    while (messages.length) {
      assert.ok(++deliveries < 20_000, "Authority recovery cannot create an unbounded snapshot loop");
      const message = messages.shift()!;
      for (const [id, client] of clients) if (id !== message.from && (!message.to || message.to === id)) client.receive(message.from, structuredClone(message.packet));
    }
  };
  const settle = () => {
    for (let round = 0; round < 8; round++) {
      const manifests = [...clients].map(([id, client]) => [id, client.authority!] as const);
      for (const [id, client] of clients) for (const [sender, authority] of manifests) if (sender !== id) client.observeAuthority(sender, structuredClone(authority));
      flush();
    }
  };
  const roster = (next = members) => { members = next; for (const client of clients.values()) client.roster(next); settle(); };
  roster();
  for (const client of clients.values()) client.completeDiscovery();
  settle();
  const step = (ticks = 1) => { for (let tick = 0; tick < ticks; tick++) { now += TABLE_FOOTBALL_TICK_MS; for (const client of clients.values()) client.frame(TABLE_FOOTBALL_TICK_MS); flush(); } };
  return { clients, create, members: () => members, roster, settle, flush, step, host: () => [...clients.values()].find((client) => client.isHost)!, setNow: (value: number) => { now = value; } };
}

check("automatic simultaneous discovery agrees on one host and balanced open seats without a code", () => {
  const f = automaticFixture();
  assert.equal([...f.clients.values()].filter((client) => client.isHost).length, 1);
  assert.ok([...f.clients.values()].every((client) => client.ready));
  assert.deepEqual([...f.host().seats.values()], ["home-forward", "away-forward", "home-goalkeeper", "away-goalkeeper"]);
  assert.equal(new Set([...f.clients.values()].map((client) => client.authority?.generation)).size, 1);
});
check("independent provisional creators converge instead of retaining four sticky hosts", () => {
  const f = automaticFixture(4, true);
  assert.equal([...f.clients.values()].filter((client) => client.isHost).length, 1);
  assert.equal(f.host().id, "auto-0");
  assert.equal(new Set([...f.clients.values()].map((client) => client.seat)).size, 4);
  assert.ok([...f.clients.values()].some((client) => client.conflictRecovered));
});
check("late automatic join with an earlier clock and lower UUID adopts existing progress", () => {
  const f = automaticFixture(2);
  f.host().input({ sequence: 1, move: 1, kick: true }); f.step(180);
  const before = structuredClone(f.host().state);
  const generation = f.host().authority!.generation;
  const member: FootballMember = { id: "000-new-phone", joinedAt: -9999999, preferredSeat: "auto", connected: true, active: true };
  const newcomer = f.create(member);
  newcomer.roster([member]);
  f.roster([...f.members(), member]); newcomer.completeDiscovery(); f.settle();
  assert.equal(f.host().id, "auto-0");
  assert.equal(newcomer.authority!.generation, generation);
  assert.deepEqual(newcomer.state.score, before.score);
  assert.equal(newcomer.state.tick, before.tick);
  assert.equal(newcomer.seat, "home-goalkeeper");
  assert.ok(newcomer.ready);
});
check("automatic full room retains the admitted four despite a skewed fifth guest", () => {
  const f = automaticFixture();
  const order = [...f.host().authority!.joinOrder];
  const extra: FootballMember = { id: "000-fifth", joinedAt: -9999999, preferredSeat: "auto", connected: true, active: true };
  const guest = f.create(extra); guest.roster([extra]);
  f.roster([...f.members(), extra]); guest.completeDiscovery(); f.settle();
  assert.deepEqual(f.host().authority!.joinOrder, order);
  assert.equal(guest.seat, undefined);
  assert.equal(guest.ready, false);
});
check("automatic hidden host returns as a corrected replica and departure keeps the generation", () => {
  const f = automaticFixture();
  f.host().input({ sequence: 1, move: 1, kick: true }); f.step(120);
  const generation = f.host().authority!.generation;
  const hidden = f.members().map((member) => ({ ...member, active: member.id !== "auto-0" }));
  f.roster(hidden); assert.equal(f.host().id, "auto-1"); f.step(60);
  const tick = f.host().state.tick;
  f.roster(hidden.map((member) => ({ ...member, active: true })));
  assert.equal(f.host().id, "auto-1");
  assert.equal(f.clients.get("auto-0")!.state.tick, tick);
  f.clients.delete("auto-1"); f.roster(f.members().filter((member) => member.id !== "auto-1"));
  assert.equal(f.host().authority!.generation, generation);
  assert.ok([...f.clients.values()].every((client) => client.state.tick === tick));
});
check("automatic disconnected mesh pauses and reconnect resumes its existing match", () => {
  const f = automaticFixture();
  f.host().input({ sequence: 1, move: 1, kick: true }); f.step(60);
  const before = f.host().state.tick;
  f.roster(f.members().map((member) => ({ ...member, connected: member.id !== "auto-3" })));
  f.step(60); assert.equal(f.host().state.tick, before);
  f.roster(f.members().map((member) => ({ ...member, connected: true }))); f.step(60);
  assert.ok(f.host().state.tick > before);
});
check("previous-round input and replay packets cannot start or reset a rematch", () => {
  const f = fixture();
  f.host().input({ sequence: 1, move: 1, kick: true }); f.step(5401);
  const oldInput = { kind: "input", round: 0, sequence: 999, move: -1, kick: true } as const;
  const oldAgain = { kind: "again", round: 0 } as const;
  f.host().again(); f.flush();
  assert.equal(f.host().round, 1);
  assert.equal(f.host().receive("phone-1", oldInput), false);
  assert.equal(f.host().receive("phone-1", oldAgain), false);
  f.step(1); assert.equal(f.host().state.phase, "ready");
});

check("competing started generations converge by immutable origin and retain the winning match", () => {
  const f = automaticFixture(2, true, "maracaibo:1:table", (clients) => {
    for (const [id, client] of clients) {
      client.input({ sequence: 1, move: 1, kick: false }); client.frame(TABLE_FOOTBALL_TICK_MS);
      client.state = { ...client.state, tick: id === "auto-0" ? 50 : 1000, score: { home: id === "auto-0" ? 2 : 7, away: 0 }, timeRemainingMs: id === "auto-0" ? 89000 : 70000 };
    }
  });
  assert.equal(f.host().id, "auto-0");
  assert.ok([...f.clients.values()].every((client) => client.state.tick === 50 && client.state.score.home === 2));
  assert.ok([...f.clients.values()].some((client) => client.conflictRecovered));
});
check("a delayed fresh singleton cannot replace an already started match with a lower UUID", () => {
  const f = automaticFixture(2); f.host().input({ sequence: 1, move: 1, kick: false }); f.step(120);
  const before = structuredClone(f.host().state);
  const member: FootballMember = { id: "000-delayed", joinedAt: -1e9, preferredSeat: "auto", connected: true, active: true };
  const late = f.create(member); late.roster([member]); late.completeDiscovery();
  assert.ok(late.authority!.established);
  f.roster([...f.members(), member]); f.settle();
  assert.equal(f.host().id, "auto-0"); assert.equal(late.state.tick, before.tick); assert.deepEqual(late.state.score, before.score);
});
check("foreign authority alone cannot create an orphaned tick-zero replacement match", () => {
  const packets: FootballPacket[] = [];
  const client = new FootballSession("new", { roomId: "orphan", mode: "2v2", home: COUNTRY_COLOR_TEAMS[0], away: COUNTRY_COLOR_TEAMS[1] }, (packet) => packets.push(packet), () => 0, "automatic");
  const members: FootballMember[] = [{ id: "old", joinedAt: 0, preferredSeat: "auto", connected: true, active: true }, { id: "new", joinedAt: 1, preferredSeat: "auto", connected: true, active: true }];
  client.roster(members);
  client.observeAuthority("old", { protocol: "maracaibo-room/v1", generation: "auto:old", originId: "old", established: true, started: true, term: 0, revision: 0, hostId: "old", joinOrder: ["old", "new"] });
  client.completeDiscovery(); client.roster([members[1]]); client.frame(100);
  assert.equal(client.ready, false); assert.equal(client.state.tick, 0); assert.equal(packets.length, 0);
});
check("a relayed manifest before the host hello cannot invent a handoff or block bootstrap", () => {
  const packets: FootballPacket[] = [];
  const options = { roomId: "delayed-hello", mode: "2v2" as const, home: COUNTRY_COLOR_TEAMS[0], away: COUNTRY_COLOR_TEAMS[1] };
  const member = (id: string): FootballMember => ({ id, joinedAt: 0, preferredSeat: "auto", connected: true, active: true });
  const host = new FootballSession("origin", options, (packet) => packets.push(packet), () => 0, "automatic");
  const roster = [member("origin"), member("relay"), member("late")];
  host.roster([roster[0]]); host.completeDiscovery(); host.roster(roster);
  host.input({ sequence: 1, move: 1, kick: false }); host.frame(TABLE_FOOTBALL_TICK_MS);
  const latest = packets.filter((packet) => packet.kind === "state").at(-1)!;
  const latePackets: FootballPacket[] = [];
  const late = new FootballSession("late", options, (packet) => latePackets.push(packet), () => 0, "automatic");
  late.roster([roster[1], roster[2]]);
  assert.equal(late.observeAuthority("relay", host.authority), true);
  late.completeDiscovery(); late.frame(100);
  assert.equal(late.authority!.hostId, "origin");
  assert.equal(late.authority!.term, host.authority!.term);
  assert.deepEqual(late.authority!.joinOrder, host.authority!.joinOrder);
  assert.equal(late.ready, false); assert.equal(latePackets.length, 0);
  // Neither a partial roster nor even a missing relay proves a seedless
  // newcomer should replace the established host.
  late.roster([roster[2]]);
  assert.equal(late.authority!.hostId, "origin"); assert.equal(late.authority!.term, 0);
  late.roster(roster);
  assert.equal(late.receive("origin", latest), true);
  assert.equal(late.ready, true); assert.equal(late.isHost, false);
  assert.equal(late.state.tick, host.state.tick);
  assert.equal(late.state.timeRemainingMs, host.state.timeRemainingMs);
  assert.deepEqual(late.authority!.joinOrder, host.authority!.joinOrder);
  // A host departure after observation and a real snapshot still hands off.
  late.roster(roster.filter((member) => member.id !== "origin"));
  assert.equal(late.authority!.hostId, host.authority!.joinOrder.find((id) => id !== "origin")); assert.equal(late.authority!.term, 1);
});
check("malformed and stale snapshots cannot mutate authority before being rejected", () => {
  const f = automaticFixture(2); f.host().input({ sequence: 1, move: 1, kick: false }); f.step(60);
  const beforeState = structuredClone(f.host().state); const beforeAuthority = structuredClone(f.host().authority);
  const authority = { ...f.host().authority!, hostId: "auto-1", term: f.host().authority!.term + 1 };
  const packet = { kind: "state", round: 0, authority, joinOrder: authority.joinOrder, state: { ...beforeState, ball: { ...beforeState.ball, x: Infinity } } };
  assert.equal(f.host().receive("auto-1", packet), false);
  assert.deepEqual(f.host().authority, beforeAuthority); assert.deepEqual(f.host().state, beforeState);
  assert.equal(f.host().receive("auto-1", { ...packet, state: { ...beforeState, tick: beforeState.tick - 1 } }), false);
  assert.deepEqual(f.host().authority, beforeAuthority); assert.deepEqual(f.host().state, beforeState);
});
check("a stale follower manifest cannot restore the former host after a handoff", () => {
  const f = automaticFixture(2); const old = structuredClone(f.clients.get("auto-1")!.authority!);
  f.roster(f.members().map((member) => ({ ...member, active: member.id !== "auto-0" })));
  f.roster(f.members().map((member) => ({ ...member, active: true })));
  const returned = f.clients.get("auto-0")!;
  assert.equal(returned.observeAuthority("auto-1", old), false);
  assert.equal(returned.isHost, false); assert.equal(f.host().id, "auto-1");
});
check("follower metadata cannot advance an incumbent generation's kickoff or handoff", () => {
  const f = automaticFixture(2); const host = f.host();
  const before = structuredClone(host.authority!);
  assert.equal(host.observeAuthority("auto-1", { ...before, started: true }), false);
  assert.deepEqual(host.authority, before);
  assert.equal(host.observeAuthority("auto-1", { ...before, term: before.term + 1 }), false);
  assert.deepEqual(host.authority, before);
  assert.equal(host.state.phase, "ready");
});
check("a returning former host with dropped snapshots cannot resume its stale clock", () => {
  const f = automaticFixture(2); f.host().input({ sequence: 1, move: 1, kick: false }); f.step(120);
  const former = f.clients.get("auto-0")!;
  const hidden = f.members().map((member) => ({ ...member, active: member.id !== "auto-0" }));
  former.roster(hidden); f.clients.delete(former.id); f.roster(hidden); f.step(180);
  const current = structuredClone(f.host().state);
  former.roster(hidden.map((member) => ({ ...member, active: true })));
  const staleTick = former.state.tick; former.frame(100);
  assert.equal(former.isHost, false); assert.equal(former.state.tick, staleTick);
  f.clients.set(former.id, former); f.roster(hidden.map((member) => ({ ...member, active: true })));
  assert.equal(f.host().id, "auto-1");
  assert.ok([...f.clients.values()].every((client) => client.state.tick === current.tick && client.state.timeRemainingMs <= current.timeRemainingMs));
});
check("mobile target steering completes a far tap without a shoot action or keepalive", () => {
  const f = automaticFixture(1); f.step(120); assert.equal(f.host().state.phase, "ready");
  f.host().input({ sequence: 1, move: 0, kick: false, targetY: 96 });
  f.step(130);
  const player = f.host().state.players.find((player) => player.id === f.host().seat)!;
  assert.ok(player.y >= 95.5 && player.y <= 96);
  f.host().state = { ...f.host().state, ball: { x: player.x, y: player.y, vx: 0, vy: 0 }, players: f.host().state.players.map((value) => ({ ...value, kickCooldownTicks: 0 })) };
  f.step(); assert.ok(f.host().state.ball.vx > 60, "An active player automatically kicks a reachable ball");
});
check("mobile neutral clears cannot kick off ready or rematch rounds, while fresh intent can", () => {
  for (const intent of [{ move: 1 as const }, { move: 0 as const, targetY: 75 }]) {
    const f = automaticFixture(1); const host = f.host();
    host.input({ sequence: 1, move: 0, kick: false }); f.step(2);
    assert.equal(host.state.phase, "ready");
    assert.equal(host.state.timeRemainingMs, 90_000);
    host.input({ sequence: 2, kick: false, ...intent }); f.step();
    assert.equal(host.state.phase, "playing");
    host.state = { ...host.state, phase: "finished", timeRemainingMs: 0 }; host.again();
    assert.equal(host.round, 1);
    host.input({ sequence: 3, move: 0, kick: false }); f.step(2);
    assert.equal(host.state.phase, "ready");
    assert.equal(host.state.timeRemainingMs, 90_000);
    host.input({ sequence: 4, kick: false, ...intent }); f.step();
    assert.equal(host.state.phase, "playing");
  }
});
check("mobile targets reject nonfinite/out-of-range values and inactive seats become computer players", () => {
  const f = automaticFixture(2); const host = f.host(); const generation = host.authority!.generation;
  for (const targetY of [NaN, Infinity, 3, 97]) assert.equal(host.receive("auto-1", { kind: "input", round: 0, generation, sequence: 1, move: 0, kick: false, targetY }), false);
  host.input({ sequence: 1, move: 0, kick: false, targetY: 4 }); f.step(10);
  f.roster(f.members().map((member) => ({ ...member, active: member.id !== "auto-0" })));
  const successor = f.host(); const before = successor.state.players.find((player) => player.id === "home-forward")!.y;
  successor.state = { ...successor.state, ball: { ...successor.state.ball, y: 90 } }; f.step(10);
  assert.ok(successor.state.players.find((player) => player.id === "home-forward")!.y > before);
});

console.log(`MARACAIBO_RESULT ${JSON.stringify({ ok: true, checks, simulatedRooms: 40, simulatedPhones: 160 })}`);
