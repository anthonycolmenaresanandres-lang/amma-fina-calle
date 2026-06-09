"use client";

import { useState } from "react";
import type { ActionType, LeadState } from "../types";
import { FIT_COLOR } from "../types";
import { nextAction } from "../state";

const hex = (n: number) => `#${n.toString(16).padStart(6, "0")}`;

export default function LeadPanel({
  lead, onAction, onClose,
}: {
  lead: LeadState | null;
  onAction: (action: ActionType, amount?: number) => void;
  onClose: () => void;
}): React.JSX.Element | null {
  const [mrrInput, setMrrInput] = useState(99);
  if (!lead) return null;

  const isClient = lead.stage === "client" || lead.stage === "flagship";
  const na = nextAction(lead.stage);
  const closing = lead.stage === "pitched";

  return (
    <aside style={{
      position: "absolute", top: 0, right: 0, bottom: 0, width: "min(360px, 86vw)",
      background: "#1c140c", borderLeft: "2px solid #3a2a18", color: "#f4e6cc",
      padding: 16, overflowY: "auto", boxShadow: "-8px 0 24px rgba(0,0,0,.4)", zIndex: 5,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{lead.meta.name}</div>
          <div style={{ fontSize: 12, color: "#bda98a", textTransform: "capitalize" }}>{lead.meta.businessType}</div>
        </div>
        <button onClick={onClose} aria-label="Close" style={{
          background: "transparent", border: "none", color: "#bda98a", fontSize: 22, cursor: "pointer", lineHeight: 1,
        }}>×</button>
      </div>

      <div style={{ display: "flex", gap: 8, margin: "10px 0" }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: hex(FIT_COLOR[lead.meta.dossier.fit]), color: "#1b120a" }}>
          {lead.meta.dossier.fit}
        </span>
        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#2a1e12", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {lead.stage}
        </span>
        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#2a1e12" }}>★ {lead.meta.dossier.rating}</span>
      </div>

      <div style={{
        borderRadius: 10, overflow: "hidden", border: "1px solid #3a2a18",
        background: "#120c07", aspectRatio: "1360 / 1120", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {lead.meta.mockupPath
          ? <img src={lead.meta.mockupPath} alt={`${lead.meta.name} preview`} style={{ width: "100%", display: "block" }} />
          : <span style={{ color: "#7a6a55", fontSize: 12, padding: 20, textAlign: "center" }}>No demo yet — Pitch to stamp the preview.</span>}
      </div>

      <div style={{ fontSize: 13, margin: "12px 0", color: "#d9c6a6" }}>
        Signature: <b style={{ color: "#f4e6cc" }}>{lead.meta.dossier.signature}</b>
      </div>

      {isClient && (
        <div style={{ fontSize: 13, margin: "8px 0", color: "#d9c6a6" }}>
          MRR <b style={{ color: "#7be29a" }}>${lead.mrr}/mo</b> · Collected <b style={{ color: "#f4e6cc" }}>${lead.collected}</b>
        </div>
      )}

      {closing && (
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, margin: "10px 0", color: "#bda98a" }}>
          Monthly fee $
          <input type="number" min={0} value={mrrInput} onChange={(e) => setMrrInput(Number(e.target.value) || 0)}
            style={{ width: 80, background: "#120c07", color: "#f4e6cc", border: "1px solid #3a2a18", borderRadius: 6, padding: "4px 6px" }} />
        </label>
      )}

      {na && (
        <button onClick={() => onAction(na.action, closing ? mrrInput : isClient ? lead.mrr : undefined)} style={{
          width: "100%", marginTop: 6, padding: "12px", borderRadius: 10, border: "none", cursor: "pointer",
          fontWeight: 800, fontSize: 14, color: "#1b120a", background: "#d8a24c",
        }}>{na.label}</button>
      )}

      {isClient && (
        <button onClick={() => onAction("UPGRADED", 20)} style={{
          width: "100%", marginTop: 8, padding: "10px", borderRadius: 10, cursor: "pointer",
          fontWeight: 700, fontSize: 13, color: "#f4e6cc", background: "transparent", border: "1px solid #3a2a18",
        }}>Upgrade — campaign refresh (+$20/mo)</button>
      )}
    </aside>
  );
}
