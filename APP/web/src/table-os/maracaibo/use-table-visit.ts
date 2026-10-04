"use client";

import { useEffect, useRef, useState } from "react";
import { isTableVisit, type TableVisit } from "./visit-contract";

type VisitState = { status: "connecting" | "active" | "ended" | "unavailable"; visit: TableVisit | null };
// React strict-effect replay shares the initial request (and resulting cookie).
const initialRequests = new Map<string, Promise<unknown>>();
async function request(tableId: string, action: string, active = false): Promise<unknown> {
  const response = await fetch(`/api/maracaibo/visit/${encodeURIComponent(tableId)}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
    body: JSON.stringify({ action, active }), signal: AbortSignal.timeout(10_000),
  });
  if (response.status >= 500) throw new Error("unavailable");
  return response.json();
}
export function useTableVisit(tableId: string, enabled: boolean) {
  const [state, setState] = useState<VisitState>({ status: "connecting", visit: null });
  const stateRef = useRef(state);
  const actionRef = useRef<(action: string) => Promise<void>>(async () => {});
  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let sequence = 0;
    let busy = false;
    let lastActivity = Date.now();
    let sentActivity = lastActivity;
    const set = (next: VisitState) => { if (!disposed) { stateRef.current = next; setState(next); } };
    const apply = (value: unknown) => {
      if (isTableVisit(value) && value.tableId === tableId) set({ status: "active", visit: value });
      else set({ status: "ended", visit: null });
    };
    async function update(action: string): Promise<void> {
      if (busy && action === "ping") return;
      const turn = ++sequence;
      const activity = lastActivity;
      busy = true;
      if (action !== "ping") set({ status: "connecting", visit: null });
      try {
        let pending: Promise<unknown>;
        if (action === "join") {
          pending = initialRequests.get(tableId) ?? request(tableId, action);
          initialRequests.set(tableId, pending);
          void pending.finally(() => { if (initialRequests.get(tableId) === pending) initialRequests.delete(tableId); }).catch(() => {});
        } else pending = request(tableId, action, !document.hidden && activity > sentActivity);
        const value = await pending;
        if (!disposed && turn === sequence) { sentActivity = activity; apply(value); }
      } catch {
        if (!disposed && turn === sequence) set({ status: "unavailable", visit: null });
      } finally { if (turn === sequence) busy = false; }
    }
    actionRef.current = update;
    const touch = () => { lastActivity = Date.now(); };
    const visibility = () => {
      if (!document.hidden && stateRef.current.status !== "ended") {
        // Immediately revalidate on return; a short lock keeps the mounted game.
        void update("ping");
      }
    };
    window.addEventListener("pointerdown", touch, { passive: true });
    window.addEventListener("pointermove", touch, { passive: true });
    window.addEventListener("keydown", touch);
    document.addEventListener("visibilitychange", visibility);
    const timer = setInterval(() => {
      const current = stateRef.current;
      if (current.status === "active" && current.visit && Date.parse(current.visit.expiresAt) <= Date.now()) {
        sequence++; busy = false; set({ status: "ended", visit: null });
      }
      if (!document.hidden && stateRef.current.status !== "ended") void update("ping");
    }, 15_000);
    void update("join");
    return () => {
      disposed = true; sequence++; clearInterval(timer);
      window.removeEventListener("pointerdown", touch); window.removeEventListener("pointermove", touch);
      window.removeEventListener("keydown", touch); document.removeEventListener("visibilitychange", visibility);
    };
  }, [tableId, enabled]);
  return { ...state, retry: () => actionRef.current("join"), rejoin: () => actionRef.current("rejoin"), leave: () => actionRef.current("leave") };
}
