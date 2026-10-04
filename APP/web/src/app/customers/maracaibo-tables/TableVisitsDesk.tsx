"use client";
import { useCallback, useEffect, useState } from "react";
type Table = { table_id: string; visit_id: string; expires_at: string; closed_at: string | null };
export function TableVisitsDesk() {
  const [tables, setTables] = useState<Table[]>([]);
  const [message, setMessage] = useState("Loading tables…");
  const [observedAt, setObservedAt] = useState(0);
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/maracaibo/tables", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json(); setTables(data.tables); setObservedAt(Date.now()); setMessage(data.tables.length ? "" : "No table visits yet.");
    } catch { setMessage("Tables couldn’t load. Refresh to try again."); }
  }, []);
  useEffect(() => { queueMicrotask(() => void refresh()); }, [refresh]);
  async function reset(table: Table) {
    if (!window.confirm(`Reset Table ${table.table_id}? This ends the visit for every guest at this table.`)) return;
    setBusy(true);
    try {
      const response = await fetch("/api/maracaibo/tables", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tableId: table.table_id, visitId: table.visit_id }) });
      if (response.status === 409) { await refresh(); setMessage("This table has a newer visit. Review it before resetting."); }
      else if (!response.ok) throw new Error();
      else { await refresh(); setMessage(`Table ${table.table_id} reset. Connected phones will update within 15 seconds.`); }
    } catch { setMessage("The table couldn’t reset. Try again."); }
    finally { setBusy(false); }
  }
  return <section className="mt-8">
    <button type="button" disabled={busy} onClick={() => void refresh()} className="min-h-11 border border-white/40 px-4 focus-visible:outline-2 focus-visible:outline-offset-4">Refresh tables</button>
    <p className="my-4 text-sm" role="status">{message}</p>
    <ul className="divide-y divide-white/20">{tables.map((table) => {
      const ended = !!table.closed_at || Date.parse(table.expires_at) <= observedAt;
      return <li key={table.table_id} className="flex items-center justify-between gap-4 py-5"><div><strong>Table {table.table_id}</strong><p className="mt-1 text-sm text-[#b6b6b0]">{ended ? "Visit ended" : "Visit active"}</p></div><button type="button" disabled={busy || ended} onClick={() => void reset(table)} className="min-h-11 border border-white/40 px-4 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-4">Reset table</button></li>;
    })}</ul>
  </section>;
}
