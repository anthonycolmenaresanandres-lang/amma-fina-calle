"use client";

import type { Activity } from "../state";
import type { ActionType } from "../types";

const DOT: Partial<Record<ActionType, string>> = {
  SCOUTED: "#6b5a48", SURVEYED: "#8a6d3f", PITCHED: "#c08a3c",
  CLOSED: "#2f9e54", COLLECTED: "#d8a24c", UPGRADED: "#d8a24c", UPDATED: "#5a7fb0",
};

export default function ActivityFeed({
  items, open, onClose,
}: {
  items: Activity[];
  open: boolean;
  onClose: () => void;
}): React.JSX.Element | null {
  if (!open) return null;
  return (
    <aside style={{
      position: "absolute", top: 0, left: 0, bottom: 0, width: "min(300px, 82vw)",
      background: "#1c140c", borderRight: "2px solid #3a2a18", color: "#f4e6cc",
      padding: 14, overflowY: "auto", boxShadow: "8px 0 24px rgba(0,0,0,.4)", zIndex: 6,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: 0.5 }}>CHRONICLE</div>
        <button onClick={onClose} aria-label="Close log" style={{ background: "transparent", border: "none", color: "#bda98a", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
      </div>
      {items.length === 0 && <div style={{ color: "#7a6a55", fontSize: 12 }}>No activity yet.</div>}
      {items.map((a, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline", padding: "6px 0", borderBottom: "1px solid #2a1e12" }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: DOT[a.action] ?? "#6b5a48", flexShrink: 0, marginTop: 4 }} />
          <div>
            <div style={{ fontSize: 12 }}>{a.text}</div>
            <div style={{ fontSize: 10, color: "#9c8868" }}>{new Date(a.at).toLocaleDateString()}</div>
          </div>
        </div>
      ))}
    </aside>
  );
}
