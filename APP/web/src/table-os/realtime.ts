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
): TableRoomBridge<T> {
  const roomName = `table-os:${safeRoomPart(venueId)}:${safeRoomPart(tableId)}`;
  const clientId = createClientId();
  const seen = new Set<string>();
  const localChannel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(roomName) : null;
  const supabase = getBrowserSupabaseClient();
  let remoteChannel: RealtimeChannel | null = null;
  let destroyed = false;

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
      })
      .subscribe(async (status) => {
        if (destroyed || !remoteChannel) {
          return;
        }

        if (status === "SUBSCRIBED") {
          callbacks.onMode("shared");
          await remoteChannel.track({ joinedAt: Date.now() });
          return;
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
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

      if (remoteChannel) {
        await remoteChannel.send({
          type: "broadcast",
          event: REMOTE_EVENT,
          payload: envelope,
        });
      }
    },
    destroy: async () => {
      destroyed = true;
      localChannel?.close();

      if (remoteChannel) {
        await remoteChannel.untrack();
        await supabase?.removeChannel(remoteChannel);
      }
    },
  };
}
