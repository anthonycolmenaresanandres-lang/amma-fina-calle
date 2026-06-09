"use client";

// Lead Arcade — "Fina Calle Conquest" v1. React owns the event-sourced state
// (one click = one business event) and the HUD/panel; Phaser owns only the
// board, tiles, and capture animation. Standalone internal tool — touches no
// Client OS routes, Supabase, Stripe, or customer data. Seed is fictional.

import { useEffect, useMemo, useRef, useState } from "react";
import type { Game } from "phaser";
import type { WorldScene } from "@/lead-arcade/phaser/WorldScene";
import type { ActionType, Fit, LeadEvent, LeadMeta } from "@/lead-arcade/types";
import { deriveLeads, loadEvents, resetEvents, saveEvents, selectTotals } from "@/lead-arcade/state";
import HudBar from "@/lead-arcade/ui/HudBar";
import LeadPanel from "@/lead-arcade/ui/LeadPanel";

export default function LeadArcadeClient(): React.JSX.Element {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const sceneRef = useRef<WorldScene | null>(null);
  const selectRef = useRef<(id: string) => void>(() => {});
  const pendingCapture = useRef<string | null>(null);

  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  selectRef.current = (id: string) => setSelectedId(id);

  const leads = useMemo(() => deriveLeads(events), [events]);
  const totals = useMemo(() => selectTotals(leads), [leads]);
  const leadsArr = useMemo(() => [...leads.values()], [leads]);
  const selected = selectedId ? leads.get(selectedId) ?? null : null;

  // load persisted log on mount
  useEffect(() => { setEvents(loadEvents()); }, []);
  // persist on change
  useEffect(() => { if (events.length) saveEvents(events); }, [events]);

  // boot Phaser once
  useEffect(() => {
    if (!mountRef.current || gameRef.current || typeof window === "undefined") return;
    let cancelled = false;
    const init = async () => {
      const [{ default: Phaser }, mod] = await Promise.all([
        import("phaser"),
        import("@/lead-arcade/phaser/WorldScene"),
      ]);
      if (cancelled || !mountRef.current) return;
      const scene = new mod.WorldScene({ onSelect: (id) => selectRef.current(id) });
      sceneRef.current = scene;
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: mountRef.current,
        width: mountRef.current.clientWidth || 800,
        height: mountRef.current.clientHeight || 600,
        backgroundColor: "#16344a",
        scene: [scene],
        scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
      });
    };
    void init();
    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  // push state into the scene; fire any pending capture after the tile exists
  useEffect(() => {
    sceneRef.current?.applyLeads(leadsArr, selectedId);
    if (pendingCapture.current) {
      const id = pendingCapture.current;
      pendingCapture.current = null;
      requestAnimationFrame(() => sceneRef.current?.playCapture(id));
    }
  }, [leadsArr, selectedId]);

  const dispatch = (action: ActionType, amount?: number) => {
    if (!selectedId) return;
    if (action === "CLOSED") pendingCapture.current = selectedId;
    setEvents((prev) => [...prev, { leadId: selectedId, action, at: Date.now(), amount }]);
  };

  const addLead = () => {
    const name = newName.trim();
    if (!name) return;
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
    const fits: Fit[] = ["HOT", "WARM", "COLD"];
    const meta: LeadMeta = {
      id, name, businessType: "business",
      position: { x: 0.2 + Math.random() * 0.6, y: 0.2 + Math.random() * 0.6 },
      dossier: { rating: 4.0, signature: "Signature Item", fit: fits[Math.floor(Math.random() * 3)] },
    };
    setEvents((prev) => [...prev, { leadId: id, action: "SCOUTED", at: Date.now(), meta }]);
    setNewName("");
    setSelectedId(id);
  };

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#16344a", fontFamily: "system-ui, sans-serif" }}>
      <HudBar totals={totals} onReset={() => { setEvents(resetEvents()); setSelectedId(null); }} />
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        <div ref={mountRef} style={{ position: "absolute", inset: 0, touchAction: "none" }} />
        <div style={{ position: "absolute", left: 12, bottom: 12, display: "flex", gap: 6, zIndex: 4 }}>
          <input
            value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addLead(); }}
            placeholder="Scout a business…"
            style={{ background: "rgba(20,12,7,.92)", color: "#f4e6cc", border: "1px solid #3a2a18", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
          />
          <button onClick={addLead} style={{ background: "#d8a24c", color: "#1b120a", border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: 800, cursor: "pointer" }}>+ Scout</button>
        </div>
        <LeadPanel lead={selected} onAction={dispatch} onClose={() => setSelectedId(null)} />
      </div>
    </div>
  );
}
