"use client";

import { useEffect, useState } from "react";
import type { ActionType, Fit, LeadPatch, LeadState } from "../types";
import { FIT_COLOR } from "../types";
import { nextAction } from "../state";

const hex = (n: number) => `#${n.toString(16).padStart(6, "0")}`;
const lbl: React.CSSProperties = { fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: "#9c8868", marginBottom: 2 };
const field: React.CSSProperties = { width: "100%", background: "#120c07", color: "#f4e6cc", border: "1px solid #3a2a18", borderRadius: 6, padding: "6px 8px", fontSize: 13, boxSizing: "border-box" };

interface Form { name: string; businessType: string; fit: Fit; signature: string; rating: number; notes: string; followUp: string }

export default function LeadPanel({
  lead, surveying = false, onAction, onUpdate, onClose,
}: {
  lead: LeadState | null;
  surveying?: boolean;
  onAction: (action: ActionType, amount?: number) => void;
  onUpdate: (patch: LeadPatch) => void;
  onClose: () => void;
}): React.JSX.Element | null {
  const [mrrInput, setMrrInput] = useState(99);
  const [form, setForm] = useState<Form>({ name: "", businessType: "", fit: "WARM", signature: "", rating: 4, notes: "", followUp: "" });

  useEffect(() => {
    if (!lead) return;
    const d = lead.meta.dossier;
    setForm({
      name: lead.meta.name, businessType: lead.meta.businessType, fit: d.fit,
      signature: d.signature, rating: d.rating, notes: lead.meta.notes ?? "", followUp: lead.meta.followUp ?? "",
    });
  }, [lead]);

  if (!lead) return null;
  const isClient = lead.stage === "client" || lead.stage === "flagship";
  const na = nextAction(lead.stage);
  const closing = lead.stage === "pitched";

  const commit = (patch: LeadPatch) => onUpdate(patch);

  return (
    <aside style={{
      position: "absolute", top: 0, right: 0, bottom: 0, width: "min(360px, 88vw)",
      background: "#1c140c", borderLeft: "2px solid #3a2a18", color: "#f4e6cc",
      padding: 16, overflowY: "auto", boxShadow: "-8px 0 24px rgba(0,0,0,.4)", zIndex: 5,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          onBlur={() => { if (form.name.trim() && form.name !== lead.meta.name) commit({ name: form.name.trim() }); }}
          style={{ ...field, fontSize: 18, fontWeight: 800, border: "1px solid transparent", background: "transparent", padding: "2px 4px" }}
        />
        <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", color: "#bda98a", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
      </div>

      <div style={{ display: "flex", gap: 8, margin: "8px 0 12px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: hex(FIT_COLOR[lead.meta.dossier.fit]), color: "#1b120a" }}>
          {lead.meta.dossier.fit}
        </span>
        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#2a1e12", textTransform: "uppercase", letterSpacing: 0.5 }}>{lead.stage}</span>
        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#2a1e12" }}>★ {lead.meta.dossier.rating}</span>
      </div>

      <div style={{
        borderRadius: 10, overflow: "hidden", border: "1px solid #3a2a18", background: "#120c07",
        aspectRatio: "1360 / 1120", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
      }}>
        {lead.meta.mockupPath
          ? <img src={lead.meta.mockupPath} alt={`${lead.meta.name} preview`} style={{ width: "100%", display: "block" }} />
          : <span style={{ color: "#7a6a55", fontSize: 12, padding: 20, textAlign: "center" }}>No demo yet — Pitch to stamp the preview.</span>}
      </div>

      {/* editable dossier record */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div>
          <div style={lbl}>Type</div>
          <input value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })}
            onBlur={() => { if (form.businessType !== lead.meta.businessType) commit({ businessType: form.businessType }); }} style={field} />
        </div>
        <div>
          <div style={lbl}>Fit</div>
          <select value={form.fit} onChange={(e) => { const fit = e.target.value as Fit; setForm({ ...form, fit }); commit({ fit }); }} style={field}>
            <option value="HOT">HOT</option><option value="WARM">WARM</option><option value="COLD">COLD</option>
          </select>
        </div>
        <div>
          <div style={lbl}>Signature item</div>
          <input value={form.signature} onChange={(e) => setForm({ ...form, signature: e.target.value })}
            onBlur={() => { if (form.signature !== lead.meta.dossier.signature) commit({ signature: form.signature }); }} style={field} />
        </div>
        <div>
          <div style={lbl}>Rating</div>
          <input type="number" min={0} max={5} step={0.1} value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            onBlur={() => { if (form.rating !== lead.meta.dossier.rating) commit({ rating: form.rating }); }} style={field} />
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={lbl}>Notes</div>
        <textarea value={form.notes} rows={2} onChange={(e) => setForm({ ...form, notes: e.target.value })}
          onBlur={() => { if (form.notes !== (lead.meta.notes ?? "")) commit({ notes: form.notes }); }}
          style={{ ...field, resize: "vertical" }} placeholder="Owner name, objection, next step…" />
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={lbl}>Follow-up date</div>
        <input type="date" value={form.followUp} onChange={(e) => { setForm({ ...form, followUp: e.target.value }); commit({ followUp: e.target.value }); }} style={field} />
      </div>

      {isClient && (
        <div style={{ fontSize: 13, margin: "8px 0", color: "#d9c6a6" }}>
          MRR <b style={{ color: "#7be29a" }}>${lead.mrr}/mo</b> · Collected <b style={{ color: "#f4e6cc" }}>${lead.collected}</b>
        </div>
      )}

      {closing && (
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, margin: "10px 0", color: "#bda98a" }}>
          Monthly fee $
          <input type="number" min={0} value={mrrInput} onChange={(e) => setMrrInput(Number(e.target.value) || 0)} style={{ ...field, width: 90 }} />
        </label>
      )}

      {surveying && (
        <div style={{ fontSize: 12, color: "#d8a24c", margin: "6px 0" }}>🔎 Fetching public info…</div>
      )}

      {na && (
        <button disabled={surveying} onClick={() => onAction(na.action, closing ? mrrInput : isClient ? lead.mrr : undefined)} style={{
          width: "100%", marginTop: 6, padding: "12px", borderRadius: 10, border: "none", cursor: surveying ? "default" : "pointer",
          fontWeight: 800, fontSize: 14, color: "#1b120a", background: "#d8a24c", opacity: surveying ? 0.55 : 1,
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
