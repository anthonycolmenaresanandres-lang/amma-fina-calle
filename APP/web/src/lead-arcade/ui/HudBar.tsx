"use client";

import type { Totals } from "../state";

const cell: React.CSSProperties = { display: "flex", flexDirection: "column", lineHeight: 1.1 };
const big: React.CSSProperties = { fontSize: 20, fontWeight: 800, color: "#f4e6cc" };
const small: React.CSSProperties = { fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase", color: "#bda98a" };

export default function HudBar({ totals, onReset }: { totals: Totals; onReset: () => void }): React.JSX.Element {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 18, padding: "10px 16px",
      background: "linear-gradient(180deg,#241a10,#1a120a)", borderBottom: "2px solid #3a2a18",
      color: "#f4e6cc", flexWrap: "wrap",
    }}>
      <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 0.5 }}>
        FINA CALLE <span style={{ color: "#d8a24c" }}>CONQUEST</span>
      </div>
      <div style={cell}><span style={big}>${totals.mrr.toLocaleString()}</span><span style={small}>MRR / mo</span></div>
      <div style={cell}><span style={big}>{totals.clients}</span><span style={small}>Clients</span></div>
      <div style={cell}><span style={big}>${totals.collected.toLocaleString()}</span><span style={small}>Collected</span></div>
      <div style={cell}><span style={big}>{Math.round(totals.territoryPct * 100)}%</span><span style={small}>Territory</span></div>
      <div style={{ ...cell, color: "#bda98a", fontSize: 11 }}>
        <span>{totals.funnel.prospect}P · {totals.funnel.surveyed}S · {totals.funnel.pitched}Pi · {totals.clients}C</span>
        <span style={small}>Funnel</span>
      </div>
      <button onClick={onReset} style={{
        marginLeft: "auto", background: "transparent", color: "#bda98a",
        border: "1px solid #3a2a18", borderRadius: 8, padding: "6px 10px", fontSize: 11, cursor: "pointer",
      }}>Reset board</button>
    </div>
  );
}
