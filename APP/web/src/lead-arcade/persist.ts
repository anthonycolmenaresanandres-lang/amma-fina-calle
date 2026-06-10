// Persistence for the event log. IndexedDB is the primary store (handles large
// logs without the synchronous/quota limits of localStorage); localStorage is a
// migration source + fallback when IndexedDB is unavailable. Client-only.

import type { LeadEvent } from "./types";
// Default opening world = the real Hampton Roads starter pack (was the fictional seed).
import { STARTER_EVENTS } from "./starter-packs";

const DB_NAME = "fina-calle-conquest";
const STORE = "events";
const KEY = "log";
const LS_KEY = "fina-calle-conquest-events-v1";

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    let req: IDBOpenDBRequest;
    try { req = indexedDB.open(DB_NAME, 1); } catch { return resolve(null); }
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

function idbGet(): Promise<LeadEvent[] | null> {
  return openDb().then((db) => {
    if (!db) return null;
    return new Promise<LeadEvent[] | null>((resolve) => {
      try {
        const r = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY);
        r.onsuccess = () => resolve((r.result as LeadEvent[] | undefined) ?? null);
        r.onerror = () => resolve(null);
      } catch { resolve(null); }
    });
  });
}

function idbSet(events: LeadEvent[]): Promise<boolean> {
  return openDb().then((db) => {
    if (!db) return false;
    return new Promise<boolean>((resolve) => {
      try {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(events, KEY);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch { resolve(false); }
    });
  });
}

function idbClear(): Promise<void> {
  return openDb().then((db) => {
    if (!db) return;
    return new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch { resolve(); }
    });
  });
}

function lsGet(): LeadEvent[] | null {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LeadEvent[];
    return Array.isArray(parsed) && parsed.length ? parsed : null;
  } catch { return null; }
}

export async function loadEventsAsync(): Promise<LeadEvent[]> {
  if (typeof window === "undefined") return STARTER_EVENTS;
  const fromIdb = await idbGet();
  if (fromIdb && fromIdb.length) return fromIdb;
  const fromLs = lsGet();
  if (fromLs) { await idbSet(fromLs); return fromLs; } // one-time migration
  return STARTER_EVENTS;
}

export async function saveEventsAsync(events: LeadEvent[]): Promise<void> {
  if (typeof window === "undefined") return;
  const ok = await idbSet(events);
  if (!ok) { try { window.localStorage.setItem(LS_KEY, JSON.stringify(events)); } catch { /* quota */ } }
}

export async function resetEventsAsync(): Promise<LeadEvent[]> {
  if (typeof window !== "undefined") {
    await idbClear();
    try { window.localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  }
  return STARTER_EVENTS;
}
