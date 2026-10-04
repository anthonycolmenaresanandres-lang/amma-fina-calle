"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

export type RoomMode = "connecting" | "shared" | "local";

export type TableRoomEnvelope<T> = Readonly<{
  id: string;
  senderId: string;
  sentAt: number;
  payload: T;
}>;

type BridgeCallbacks<T> = Readonly<{
  onMessage: (message: TableRoomEnvelope<T>) => void;
  onMode: (mode: RoomMode) => void;
  onParticipants: (count: number) => void;
  onMembers?: (members: readonly { id: string; joinedAt: number; seat?: string }[]) => void;
}>;

export type TableRoomBridge<T> = Readonly<{
  clientId: string;
  send: (payload: T) => Promise<void>;
  destroy: () => Promise<void>;
}>;

const REMOTE_EVENT = "room-message";

function safeRoomPart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 32);
}

function createClientId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `guest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isEnvelope<T>(value: unknown): value is TableRoomEnvelope<T> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TableRoomEnvelope<T>>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.senderId === "string" &&
    typeof candidate.sentAt === "number" &&
    "payload" in candidate
  );
}

export function connectTableRoom<T>(
  venueId: string,
  tableId: string,
  callbacks: BridgeCallbacks<T>,
  presence: Readonly<{ joinedAt?: number; seat?: string; scope?: string }> = {},
): TableRoomBridge<T> {
  const scope = presence.scope?.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
  const roomName = `table-os:${safeRoomPart(venueId)}:${safeRoomPart(tableId)}${scope ? `:${scope}` : ""}`;
  const clientId = createClientId();
  const seen = new Set<string>();
  const localChannel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(roomName) : null;
  const supabase = getBrowserSupabaseClient();
  let remoteChannel: RealtimeChannel | null = null;
  let destroyed = false;
  let remoteReady = false;

  const receive = (candidate: unknown) => {
    if (destroyed || !isEnvelope<T>(candidate) || candidate.senderId === clientId || seen.has(candidate.id)) {
      return;
    }

    seen.add(candidate.id);
    if (seen.size > 300) {
      const oldest = seen.values().next().value;
      if (oldest) {
        seen.delete(oldest);
      }
    }
    callbacks.onMessage(candidate);
  };

  if (localChannel) {
    localChannel.addEventListener("message", (event: MessageEvent<unknown>) => receive(event.data));
  }

  callbacks.onMode(supabase ? "connecting" : "local");
  callbacks.onParticipants(1);

  if (supabase) {
    remoteChannel = supabase
      .channel(roomName, {
        config: {
          broadcast: { self: false, ack: false },
          presence: { key: clientId },
          private: false,
        },
      })
      .on("broadcast", { event: REMOTE_EVENT }, ({ payload }) => receive(payload))
      .on("presence", { event: "sync" }, () => {
        if (!remoteChannel) {
          return;
        }
        const states = remoteChannel.presenceState();
        callbacks.onParticipants(Math.max(1, Object.keys(states).length));
        callbacks.onMembers?.(Object.entries(states).flatMap(([id, entries]) => {
          const entry = entries[0] as { joinedAt?: unknown; seat?: unknown } | undefined;
          return entry && typeof entry.joinedAt === "number" && Number.isFinite(entry.joinedAt)
            ? [{ id, joinedAt: entry.joinedAt, seat: typeof entry.seat === "string" ? entry.seat : undefined }]
            : [];
        }).sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id)).slice(0, 8));
      })
      .subscribe(async (status) => {
        if (destroyed || !remoteChannel) {
          return;
        }

        if (status === "SUBSCRIBED") {
          remoteReady = true;
          callbacks.onMode("shared");
          try { await remoteChannel.track({ joinedAt: presence.joinedAt ?? Date.now(), seat: presence.seat }); } catch { remoteReady = false; callbacks.onMode("local"); }
          return;
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          remoteReady = false;
          callbacks.onMode("local");
        }
      });
  }

  return {
    clientId,
    send: async (payload: T) => {
      if (destroyed) {
        return;
      }

      const envelope: TableRoomEnvelope<T> = {
        id: `${clientId}:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`,
        senderId: clientId,
        sentAt: Date.now(),
        payload,
      };

      seen.add(envelope.id);
      localChannel?.postMessage(envelope);

      if (remoteChannel && (remoteReady || !callbacks.onMembers)) {
        try { await remoteChannel.send({
          type: "broadcast",
          event: REMOTE_EVENT,
          payload: envelope,
        }); } catch { /* A transient send must not become an unhandled rejection. */ }
      }
    },
    destroy: async () => {
      destroyed = true;
      localChannel?.close();

      if (remoteChannel) {
        try { await remoteChannel.untrack(); } catch { /* Cleanup continues after a disconnect. */ }
        try { await supabase?.removeChannel(remoteChannel); } catch { /* Already closed. */ }
      }
    },
  };
}
