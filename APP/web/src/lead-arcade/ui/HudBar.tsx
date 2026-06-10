"use client";

import { useRef, useState } from "react";
import type { Goals, Totals } from "../state";
import type { Territory } from "../territories";

const cell: React.CSSProperties = { display: "flex", flexDirection: "column", lineHeight: 1.1 };
const big: React.CSSProperties = { fontSize: 20, fontWeight: 800, color: "#f4e6cc" };
const small: React.CSSProperties = { fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase", color: "#bda98a" };
const chip: React.CSSProperties = { fontSize: 11, padding: "4px 8px", borderRadius: 8, background: "#2a1e12", color: "#e9d8b8", whiteSpace: "nowrap" };
const menuBtn: React.CSSProperties = { display: "block", width: "100%", textAlign: "left", background: "transparent", color: "#f4e6cc", border: "none", padding: "8px 12px", fontSize: 13, cursor: "pointer" };

export default function HudBar({
  totals, goals, soundOn, packReady, territory, territories, onTerritory, onToggleSound, onToggleLog, onExport, onImport, onReset,
}: {
  totals: Totals;
  goals: Goals;
  soundOn: boolean;
  packReady: number;
  territory: string;
  territories: Territory[];
  onTerritory: (id: string) => void;
  onToggleSound: () => void;
  onToggleLog: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const weekDone = goals.weekConversions >= goals.weekTarget;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14, padding: "10px 14px",
      background: "linear-gradient(180deg,#241a10,#1a120a)", borderBottom: "2px solid #3a2a18",
      color: "#f4e6cc", flexWrap: "wrap", position: "relative",
    }}>
      <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 0.5 }}>
        FINA CALLE <span style={{ color: "#d8a24c" }}>CONQUEST</span>
      </div>
      <select value={territory} onChange={(e) => onTerritory(e.target.value)} aria-label="Territory"
        style={{ background: "#120c07", color: "#f4e6cc", border: "1px solid #3a2a18", borderRadius: 8, padding: "5px 8px", fontSize: 12 }}>
        {territories.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <div style={cell}><span style={big}>${totals.mrr.toLocaleString()}</span><span style={small}>MRR / mo</span></div>
      <div style={cell}><span style={big}>{totals.clients}</span><span style={small}>Clients</span></div>
      <div style={cell}><span style={big}>${totals.collected.toLocaleString()}</span><span style={small}>Collected</span></div>
      <div style={cell}><span style={big}>{Math.round(totals.territoryPct * 100)}%</span><span style={small}>Territory</span></div>

      <span style={{ ...chip, background: weekDone ? "#2f5e3a" : "#2a1e12" }}>
        🎯 Week {goals.weekConversions}/{goals.weekTarget}{weekDone ? " ✓" : ""}
      </span>
      <span style={chip}>🔥 {goals.streakDays}d streak</span>
      <span style={{ ...chip, background: packReady > 0 ? "#2f5e3a" : "#2a1e12" }}>📦 {packReady} ready</span>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <button onClick={onToggleLog} style={{ ...chip, cursor: "pointer", border: "1px solid #3a2a18" }}>Log</button>
        <button onClick={() => setOpen((v) => !v)} aria-label="Settings" style={{ ...chip, cursor: "pointer", border: "1px solid #3a2a18" }}>⚙</button>
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "100%", right: 8, marginTop: 4, zIndex: 20,
          background: "#1c140c", border: "1px solid #3a2a18", borderRadius: 10, minWidth: 180, boxShadow: "0 8px 24px rgba(0,0,0,.5)",
        }}>
          <button style={menuBtn} onClick={() => { onToggleSound(); }}>{soundOn ? "🔊 Sound: on" : "🔈 Sound: off"}</button>
          <button style={menuBtn} onClick={() => { setOpen(false); onExport(); }}>⬇ Export log (JSON)</button>
          <button style={menuBtn} onClick={() => { fileRef.current?.click(); }}>⬆ Import log…</button>
          <button style={{ ...menuBtn, color: "#e8896b" }} onClick={() => { setOpen(false); onReset(); }}>↺ Reset board</button>
          <input ref={fileRef} type="file" accept="application/json" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; setOpen(false); if (f) onImport(f); }} />
        </div>
      )}
    </div>
  );
}
