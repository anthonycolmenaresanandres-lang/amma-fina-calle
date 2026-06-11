"use client";

// Pipeline board — the "official" view: leads laid out in columns by stage of
// the process (Prospect → Surveyed → Pitched → Client → Flagship) instead of
// scattered on a map. Click a card to open its dossier panel. Stage actions
// still live in the panel (the source of truth is the event log).

import type { LeadState, Stage } from "../types";
import { FIT_COLOR, STAGE_ORDER } from "../types";
import { readiness } from "../state";

const hex = (n: number) => `#${n.toString(16).padStart(6, "0")}`;

const STAGE_LABEL: Record<Stage, string> = {
  prospect: "Prospect",
  surveyed: "Surveyed",
  pitched: "Pitched",
  client: "Client",
  flagship: "Flagship",
};

const STAGE_ACCENT: Record<Stage, string> = {
  prospect: "#6b5a48",
  surveyed: "#8a6d3f",
  pitched: "#c08a3c",
  client: "#2f9e54",
  flagship: "#d8a24c",
};

function Card({
  lead,
  selected,
  surveying,
  onSelect,
}: {
  lead: LeadState;
  selected: boolean;
  surveying: boolean;
  onSelect: (id: string) => void;
}): React.JSX.Element {
  const m = lead.meta;
  const rd = readiness(m);
  const isClient = lead.stage === "client" || lead.stage === "flagship";
  return (
    <button
      onClick={() => onSelect(m.id)}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        background: selected ? "#2a1e12" : "#160f08",
        border: `1px solid ${selected ? "#d8a24c" : "#3a2a18"}`,
        borderLeft: `4px solid ${hex(FIT_COLOR[m.dossier.fit])}`,
        borderRadius: 10,
        padding: "10px 12px",
        marginBottom: 8,
        color: "#f4e6cc",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>{m.name}</span>
        <span style={{ fontSize: 10, color: "#9c8868", whiteSpace: "nowrap" }}>★ {m.dossier.rating}</span>
      </div>
      <div style={{ fontSize: 11, color: "#9c8868", marginTop: 2 }}>{m.businessType}</div>
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: hex(FIT_COLOR[m.dossier.fit]), color: "#1b120a" }}>
          {m.dossier.fit}
        </span>
        {surveying ? (
          <span style={{ fontSize: 10, color: "#d8a24c" }}>🔎 surveying…</span>
        ) : isClient ? (
          <span style={{ fontSize: 11, fontWeight: 800, color: "#7be29a" }}>${lead.mrr}/mo</span>
        ) : (
          <span style={{ fontSize: 10, color: rd.ready ? "#7be29a" : "#9c8868" }}>
            pack {rd.done}/{rd.total}{rd.ready ? " ✓" : ""}
          </span>
        )}
      </div>
    </button>
  );
}

export default function PipelineBoard({
  leads,
  selectedId,
  surveyingId,
  onSelect,
}: {
  leads: LeadState[];
  selectedId: string | null;
  surveyingId: string | null;
  onSelect: (id: string) => void;
}): React.JSX.Element {
  const byStage = (stage: Stage) => leads.filter((l) => l.stage === stage);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflowX: "auto",
        overflowY: "hidden",
        display: "flex",
        gap: 12,
        padding: 14,
        boxSizing: "border-box",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {STAGE_ORDER.map((stage) => {
        const items = byStage(stage);
        return (
          <section
            key={stage}
            style={{
              flex: "0 0 clamp(220px, 78vw, 280px)",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              background: "rgba(20,12,7,0.55)",
              border: "1px solid #2a1e12",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <header
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderBottom: "1px solid #2a1e12",
                borderTop: `3px solid ${STAGE_ACCENT[stage]}`,
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 13, color: "#f4e6cc", letterSpacing: 0.4 }}>
                {STAGE_LABEL[stage]}
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: STAGE_ACCENT[stage] }}>{items.length}</span>
            </header>
            <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
              {items.length === 0 ? (
                <p style={{ fontSize: 11, color: "#6b5a48", textAlign: "center", margin: "16px 0" }}>—</p>
              ) : (
                items.map((l) => (
                  <Card
                    key={l.meta.id}
                    lead={l}
                    selected={l.meta.id === selectedId}
                    surveying={surveyingId === l.meta.id}
                    onSelect={onSelect}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
