"use client";

import { connectTableRoom, type RoomMode } from "../realtime";
import { FOOTBALL_SEATS, type FootballMember, type FootballPacket, type FootballSeat } from "./football-session";

type Signal = { kind: "hello"; joinedAt: number; seat: FootballSeat } | { kind: "leave" } | { kind: "full"; to: string } |
  { kind: "rtc"; to: string; generation: string; description: RTCSessionDescriptionInit };
export type FootballPeerStatus = "connecting" | "table" | "browser" | "unavailable" | "full";
type Callbacks = { onRoster: (members: readonly FootballMember[]) => void; onPacket: (sender: string, value: unknown) => boolean; onStatus: (status: FootballPeerStatus) => void; isHost: () => boolean };
type Peer = { pc: RTCPeerConnection; channel?: RTCDataChannel; generation: string; signalCount: number; chain: Promise<void>; createdAt: number };
export type FootballPeerHandle = { id: string; send: (packet: FootballPacket, to?: string) => void; destroy: () => void };

const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const MAX_PACKET_BYTES = 8192;
const MAX_BUFFER_BYTES = 32_768;

/** Signaling is the only Supabase traffic. Physics, inputs and recovery use bounded DTLS data channels. */
export function connectFootballPeers(venueId: string, tableId: string, code: string, seat: FootballSeat, callbacks: Callbacks): FootballPeerHandle {
  const joinedAt = Date.now();
  const members = new Map<string, FootballMember>();
  const seenAt = new Map<string, number>();
  const peers = new Map<string, Peer>();
  const localMembers = new Set<string>();
  const localGame = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(`maracaibo-local-game:${venueId}:${tableId}:${code}`) : null;
  const retries = new Map<string, number>();
  let mode: RoomMode = "connecting";
  let everShared = false;
  const browserLocal = () => mode === "local" && !everShared;
  let destroyed = false;
  let rosterFingerprint = "";
  let lastHelloAt = 0;
  let admissionOrder: string[] = [];
  let authorityOrder = false;
  const rejected = new Map<string, { at: number; count: number }>();

  const ordered = () => [...members.values()].sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id));
  const closePeer = (id: string) => {
    const peer = peers.get(id);
    peers.delete(id);
    if (peer) { peer.channel?.close(); peer.pc.close(); }
  };
  const publishRoster = () => {
    if (destroyed || !bridge) return;
    if (typeof RTCPeerConnection === "undefined" && everShared) { callbacks.onStatus("unavailable"); return; }
    admissionOrder = admissionOrder.filter((id) => members.has(id));
    for (const member of ordered()) if (!admissionOrder.includes(member.id)) admissionOrder.push(member.id);
    const seated = admissionOrder.slice(0, 4).flatMap((id) => members.get(id) ?? []);
    if (callbacks.isHost()) for (const id of admissionOrder.slice(4)) {
      const last = rejected.get(id);
      if ((!last || Date.now() - last.at >= 2000) && (last?.count ?? 0) < 3) {
        rejected.set(id, { at: Date.now(), count: (last?.count ?? 0) + 1 });
        void bridge.send({ kind: "full", to: id });
      }
    }
    for (const id of rejected.keys()) if (!members.has(id)) rejected.delete(id);
    if (!seated.some((member) => member.id === bridge.clientId)) {
      callbacks.onStatus("full");
      destroy();
      return;
    }
    const ids = new Set(seated.map((member) => member.id));
    for (const id of peers.keys()) if (!ids.has(id)) closePeer(id);
    const roster = seated.map((member) => ({ ...member, connected: member.id === bridge.clientId || browserLocal() && localMembers.has(member.id) || peers.get(member.id)?.channel?.readyState === "open" }));
    const fingerprint = JSON.stringify(roster);
    if (fingerprint !== rosterFingerprint) { rosterFingerprint = fingerprint; callbacks.onRoster(roster); }
    callbacks.onStatus(everShared ? "table" : browserLocal() ? "browser" : "connecting");
    if (mode === "shared") for (const member of seated) if (member.id !== bridge.clientId && !peers.has(member.id) && bridge.clientId < member.id) void offer(member.id);
  };
  const packet = (id: string, value: unknown) => {
    if (callbacks.onPacket(id, value) && isObject(value) && value.kind === "state" && Array.isArray(value.joinOrder)) {
      authorityOrder = true;
      const joinOrder = value.joinOrder;
      admissionOrder = [...joinOrder.filter((memberId) => typeof memberId === "string" && members.has(memberId)), ...admissionOrder.filter((memberId) => !joinOrder.includes(memberId))];
      publishRoster();
    }
  };
  const safeSend = (channel: RTCDataChannel | undefined, value: unknown) => {
    if (!channel || channel.readyState !== "open" || channel.bufferedAmount > MAX_BUFFER_BYTES) return;
    try { const text = JSON.stringify(value); if (text.length <= MAX_PACKET_BYTES) channel.send(text); } catch { /* A closing/slow peer never blocks the room. */ }
  };
  const attach = (id: string, peer: Peer, channel: RTCDataChannel) => {
    if (channel.label !== "maracaibo-football" || peer.channel) { channel.close(); return; }
    peer.channel = channel;
    channel.onopen = () => { safeSend(channel, { kind: "active", active: !document.hidden }); publishRoster(); };
    channel.onclose = () => publishRoster();
    channel.onerror = () => publishRoster();
    let windowAt = performance.now();
    let packetCount = 0;
    channel.onmessage = ({ data }: MessageEvent<unknown>) => {
      if (destroyed || typeof data !== "string" || data.length > MAX_PACKET_BYTES) return;
      const now = performance.now();
      if (now - windowAt >= 1000) { windowAt = now; packetCount = 0; }
      if (++packetCount > 50) return;
      try {
        const value: unknown = JSON.parse(data);
        if (!isObject(value)) return;
        if (value.kind === "active" && typeof value.active === "boolean") {
          const member = members.get(id);
          if (member && member.active !== value.active) { members.set(id, { ...member, active: value.active }); publishRoster(); }
        } else packet(id, value);
      } catch { /* Malformed packets are discarded before reaching the engine. */ }
    };
  };
  const createPeer = (id: string, generation: string): Peer => {
    closePeer(id);
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    const peer: Peer = { pc, generation, signalCount: 0, chain: Promise.resolve(), createdAt: Date.now() };
    peers.set(id, peer);
    pc.ondatachannel = ({ channel }) => attach(id, peer, channel);
    pc.onconnectionstatechange = () => publishRoster();
    return peer;
  };
  // Bundle ICE candidates into one SDP. Each peer link needs two signaling messages,
  // not a burst of one broadcast per candidate, even when many tables join together.
  const gather = (pc: RTCPeerConnection): Promise<void> => new Promise((resolve) => {
    if (pc.iceGatheringState === "complete") { resolve(); return; }
    const done = () => { clearTimeout(timeout); pc.removeEventListener("icegatheringstatechange", changed); resolve(); };
    const changed = () => { if (pc.iceGatheringState === "complete") done(); };
    const timeout = setTimeout(done, 2500);
    pc.addEventListener("icegatheringstatechange", changed);
  });
  async function offer(id: string): Promise<void> {
    if (destroyed || peers.has(id) || (retries.get(id) ?? 0) >= 3 || typeof RTCPeerConnection === "undefined") return;
    retries.set(id, (retries.get(id) ?? 0) + 1);
    const peer = createPeer(id, crypto.randomUUID());
    try {
      attach(id, peer, peer.pc.createDataChannel("maracaibo-football", { ordered: true }));
      await peer.pc.setLocalDescription(await peer.pc.createOffer());
      await gather(peer.pc);
      if (!destroyed && peers.get(id) === peer) await bridge.send({ kind: "rtc", to: id, generation: peer.generation, description: { type: "offer", sdp: peer.pc.localDescription?.sdp } });
    } catch { closePeer(id); }
  }
  const receiveSignal = (id: string, value: unknown) => {
    if (destroyed || !isObject(value) || !bridge || id.length > 80) return;
    if (value.kind === "hello" && browserLocal()) {
      if (typeof value.joinedAt !== "number" || !Number.isFinite(value.joinedAt) || !FOOTBALL_SEATS.includes(value.seat as FootballSeat) || members.size >= 8 && !members.has(id)) return;
      const fresh = !members.has(id);
      members.set(id, members.get(id) ?? { id, joinedAt: value.joinedAt, preferredSeat: value.seat as FootballSeat, connected: false, active: true });
      seenAt.set(id, Date.now());
      localMembers.add(id);
      if (fresh) void bridge.send({ kind: "hello", joinedAt, seat });
      publishRoster();
      return;
    }
    if (!members.has(id)) return;
    if (value.kind === "full" && value.to === bridge.clientId) { callbacks.onStatus("full"); destroy(); return; }
    if (value.kind === "leave") { members.delete(id); seenAt.delete(id); localMembers.delete(id); closePeer(id); publishRoster(); return; }
    if (value.kind !== "rtc" || value.to !== bridge.clientId || typeof value.generation !== "string" || value.generation.length > 80) return;
    const description = value.description;
    if (!isObject(description) || !["offer", "answer"].includes(String(description.type)) || typeof description.sdp !== "string" || description.sdp.length > 16_384 || typeof RTCPeerConnection === "undefined") return;
    let peer = peers.get(id);
    if (isObject(description) && description.type === "offer") {
      if (id >= bridge.clientId || peer?.generation === value.generation) return;
      if ((retries.get(id) ?? 0) >= 3) return;
      retries.set(id, (retries.get(id) ?? 0) + 1);
      peer = createPeer(id, value.generation);
    }
    if (!peer || peer.generation !== value.generation || peer.signalCount++ > 40) return;
    const current = peer;
    current.chain = current.chain.then(async () => {
      if (destroyed || peers.get(id) !== current) return;
      const remoteDescription: RTCSessionDescriptionInit = { type: description.type === "offer" ? "offer" : "answer", sdp: String(description.sdp) };
      await current.pc.setRemoteDescription(remoteDescription);
      if (remoteDescription.type === "offer") {
        await current.pc.setLocalDescription(await current.pc.createAnswer());
        await gather(current.pc);
        if (!destroyed && peers.get(id) === current) await bridge.send({ kind: "rtc", to: id, generation: current.generation, description: { type: "answer", sdp: current.pc.localDescription?.sdp } });
      }
    }).catch(() => { if (!destroyed && peers.get(id) === current) closePeer(id); });
  };

  const bridge = connectTableRoom<Signal>(`${venueId}-football-v2`, `${tableId}-${code}`, {
    onMessage: ({ senderId, payload }) => receiveSignal(senderId, payload),
    onMode: (next) => { mode = next; if (next === "shared") everShared = true; queueMicrotask(() => { if (!destroyed) publishRoster(); }); },
    onParticipants: () => {},
    onMembers: (roster) => {
      if (destroyed || mode !== "shared") return;
      const previous = new Map(members);
      members.clear();
      for (const member of roster) if (FOOTBALL_SEATS.includes(member.seat as FootballSeat)) members.set(member.id, previous.get(member.id) ?? { id: member.id, joinedAt: member.joinedAt, preferredSeat: member.seat as FootballSeat, connected: false, active: true });
      // A Presence sync can arrive before our track acknowledgment.
      if (!members.has(bridge.clientId)) members.set(bridge.clientId, { id: bridge.clientId, joinedAt, preferredSeat: seat, connected: true, active: !document.hidden });
      if (!authorityOrder && !callbacks.isHost()) admissionOrder = [];
      publishRoster();
    },
  }, { joinedAt, seat });
  members.set(bridge.clientId, { id: bridge.clientId, joinedAt, preferredSeat: seat, connected: true, active: !document.hidden });
  void bridge.send({ kind: "hello", joinedAt, seat });
  queueMicrotask(publishRoster);

  // Browser-local play has no server and needs no ICE/network access. This channel
  // is never forwarded into Supabase and is never labeled cross-phone play.
  let localWindowAt = performance.now();
  let localPacketCount = 0;
  localGame?.addEventListener("message", ({ data }: MessageEvent<unknown>) => {
    if (destroyed || !browserLocal() || !isObject(data) || typeof data.sender !== "string" || !localMembers.has(data.sender) || data.to && data.to !== bridge.clientId) return;
    const now = performance.now();
    if (now - localWindowAt >= 1000) { localWindowAt = now; localPacketCount = 0; }
    if (++localPacketCount > 160) return;
    try { if (JSON.stringify(data).length > MAX_PACKET_BYTES) return; } catch { return; }
    if (isObject(data.packet) && data.packet.kind === "active" && typeof data.packet.active === "boolean") {
      const member = members.get(data.sender);
      if (member) { members.set(member.id, { ...member, active: data.packet.active }); publishRoster(); }
    } else packet(data.sender, data.packet);
  });

  const visible = () => {
    const member = members.get(bridge.clientId);
    if (member) members.set(member.id, { ...member, active: !document.hidden });
    for (const peer of peers.values()) safeSend(peer.channel, { kind: "active", active: !document.hidden });
    if (browserLocal()) localGame?.postMessage({ sender: bridge.clientId, packet: { kind: "active", active: !document.hidden } });
    publishRoster();
  };
  document.addEventListener("visibilitychange", visible);
  const timer = setInterval(() => {
    if (destroyed) return;
    const now = Date.now();
    if (browserLocal() && now - lastHelloAt > 4000) { lastHelloAt = now; void bridge.send({ kind: "hello", joinedAt, seat }); }
    if (browserLocal()) for (const [id, seen] of seenAt) if (now - seen > 10_000) { members.delete(id); seenAt.delete(id); localMembers.delete(id); closePeer(id); }
    for (const [id, peer] of peers) if (peer.channel?.readyState !== "open" && now - peer.createdAt > 12_000) closePeer(id);
    publishRoster();
    if (ordered().slice(0, 4).some((member) => member.id !== bridge.clientId && peers.get(member.id)?.channel?.readyState !== "open") && [...retries.values()].some((count) => count >= 3)) callbacks.onStatus("unavailable");
  }, 1000);

  function destroy(): void {
    if (destroyed) return;
    void bridge.send({ kind: "leave" });
    destroyed = true;
    clearInterval(timer);
    document.removeEventListener("visibilitychange", visible);
    localGame?.close();
    for (const id of peers.keys()) closePeer(id);
    void bridge.destroy();
  }
  return { id: bridge.clientId, send: (packet, to) => {
    if (destroyed) return;
    if (browserLocal()) { localGame?.postMessage({ sender: bridge.clientId, to, packet }); return; }
    for (const [id, peer] of peers) if (!to || id === to) safeSend(peer.channel, packet);
  }, destroy };
}
