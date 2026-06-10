"use client";

// Lead Arcade — "Fina Calle Conquest" v2. React owns the event-sourced state
// (one click = one business event) and the HUD/panel/feed; Phaser owns only the
// board, tiles, and capture/upgrade animation. Standalone internal tool —
// touches no Client OS routes, Supabase, Stripe, or customer data. Seed is fictional.

import { useEffect, useMemo, useRef, useState } from "react";
import type { Game } from "phaser";
import type { WorldScene } from "@/lead-arcade/phaser/WorldScene";
import type { ActionType, Fit, LeadEvent, LeadMeta, LeadPatch } from "@/lead-arcade/types";
import { ACTION_VERB } from "@/lead-arcade/types";
import {
  deriveLeads, exportEvents, importEvents, readiness,
  selectActivity, selectGoals, selectTotals,
} from "@/lead-arcade/state";
import { loadEventsAsync, resetEventsAsync, saveEventsAsync } from "@/lead-arcade/persist";
import { playCoin, playGoal, playStep, primeAudio } from "@/lead-arcade/audio";
import HudBar from "@/lead-arcade/ui/HudBar";
import LeadPanel from "@/lead-arcade/ui/LeadPanel";
import ActivityFeed from "@/lead-arcade/ui/ActivityFeed";

export default function LeadArcadeClient(): React.JSX.Element {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const sceneRef = useRef<WorldScene | null>(null);
  const selectRef = useRef<(id: string) => void>(() => {});
  const moveRef = useRef<(id: string, x: number, y: number) => void>(() => {});
  const pendingCapture = useRef<string | null>(null);
  const pendingUpgrade = useRef<string | null>(null);

  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [soundOn, setSoundOn] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [live, setLive] = useState("");
  const [surveyingId, setSurveyingId] = useState<string | null>(null);

  selectRef.current = (id: string) => setSelectedId(id);
  moveRef.current = (id: string, x: number, y: number) =>
    setEvents((prev) => [...prev, { leadId: id, action: "UPDATED", at: Date.now(), patch: { position: { x, y } } }]);

  const leads = useMemo(() => deriveLeads(events), [events]);
  const totals = useMemo(() => selectTotals(leads), [leads]);
  const goals = useMemo(() => selectGoals(events), [events]);
  const activity = useMemo(() => selectActivity(events), [events]);
  const leadsArr = useMemo(() => [...leads.values()], [leads]);
  const packReady = useMemo(() => leadsArr.filter((l) => readiness(l.meta).ready).length, [leadsArr]);
  const selected = selectedId ? leads.get(selectedId) ?? null : null;

  useEffect(() => { void loadEventsAsync().then(setEvents); }, []);
  useEffect(() => { if (events.length) void saveEventsAsync(events); }, [events]);

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
      const scene = new mod.WorldScene({
        onSelect: (id) => selectRef.current(id),
        onMove: (id, x, y) => moveRef.current(id, x, y),
      });
      sceneRef.current = scene;
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO, parent: mountRef.current,
        width: mountRef.current.clientWidth || 800, height: mountRef.current.clientHeight || 600,
        backgroundColor: "#16344a", scene: [scene],
        scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
      });
    };
    void init();
    return () => { cancelled = true; gameRef.current?.destroy(true); gameRef.current = null; sceneRef.current = null; };
  }, []);

  // push state into the scene; fire any pending animation after the tile exists
  useEffect(() => {
    sceneRef.current?.applyLeads(leadsArr, selectedId);
    if (pendingCapture.current) {
      const id = pendingCapture.current; pendingCapture.current = null;
      requestAnimationFrame(() => sceneRef.current?.playCapture(id));
    }
    if (pendingUpgrade.current) {
      const id = pendingUpgrade.current; pendingUpgrade.current = null;
      requestAnimationFrame(() => sceneRef.current?.playUpgrade(id));
    }
  }, [leadsArr, selectedId]);

  const announce = (id: string, action: ActionType, amount?: number) => {
    const name = leads.get(id)?.meta.name ?? "Lead";
    setLive(`${name} ${ACTION_VERB[action]}${amount ? ` $${amount}` : ""}`);
  };

  const dispatch = (action: ActionType, amount?: number) => {
    if (!selectedId) return;
    const id = selectedId;
    if (action === "CLOSED") { pendingCapture.current = id; if (soundOn) playGoal(); }
    else if (action === "UPGRADED") { pendingUpgrade.current = id; if (soundOn) playStep(); }
    else if (action === "COLLECTED") { if (soundOn) playCoin(); }
    else if (soundOn) playStep();
    announce(id, action, amount);
    setEvents((prev) => [...prev, { leadId: id, action, at: Date.now(), amount }]);
    if (action === "SURVEYED") void surveyLead(id);
  };

  const updateLead = (id: string, patch: LeadPatch) =>
    setEvents((prev) => [...prev, { leadId: id, action: "UPDATED", at: Date.now(), patch }]);

  const update = (patch: LeadPatch) => { if (selectedId) updateLead(selectedId, patch); };

  // Live "Survey": fetch public info (OpenStreetMap) and auto-fill the record.
  const surveyLead = async (id: string) => {
    const name = leads.get(id)?.meta.name;
    if (!name) return;
    setSurveyingId(id);
    try {
      const r = await fetch(`/api/lead-arcade/dossier?q=${encodeURIComponent(name)}`);
      const d = (await r.json()) as {
        ok: boolean; displayName?: string; businessType?: string; board?: { x: number; y: number };
        hours?: string | null; phone?: string | null; website?: string | null;
        themeColor?: string | null; logoCandidate?: string | null; operational?: boolean;
        rating?: number | null; reviewCount?: number | null; price?: string | null;
        yelpUrl?: string | null; sources?: string[];
      };
      if (d.ok && d.displayName) {
        const existing = leads.get(id)?.meta.notes ?? "";
        const lines = [existing, `📍 ${d.displayName}`];
        if (d.hours) lines.push(`🕑 ${d.hours}`);
        if (d.phone) lines.push(`☎ ${d.phone}`);
        if (d.rating) lines.push(`⭐ ${d.rating} (${d.reviewCount ?? 0} reviews)${d.price ? ` · ${d.price}` : ""} — Yelp`);
        if (d.yelpUrl) lines.push(`↗ ${d.yelpUrl}`);
        updateLead(id, {
          businessType: d.businessType,
          notes: lines.filter(Boolean).join("\n"),
          ...(d.board ? { position: d.board } : {}),
          ...(d.rating ? { rating: d.rating } : {}),
          hours: d.hours ?? undefined,
          phone: d.phone ?? undefined,
          website: d.website ?? undefined,
          themeColor: d.themeColor ?? undefined,
          logoCandidate: d.logoCandidate ?? undefined,
          operational: d.operational ?? undefined,
        });
        setLive(`${name} surveyed — ${d.sources?.includes("yelp") ? "Yelp + OSM" : "public info"} gathered`);
      } else {
        setLive(`${name} surveyed — no public match, fill manually`);
      }
    } catch {
      setLive(`${name} surveyed — lookup unavailable, fill manually`);
    } finally {
      setSurveyingId(null);
    }
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
    if (soundOn) playStep();
    setEvents((prev) => [...prev, { leadId: id, action: "SCOUTED", at: Date.now(), meta }]);
    setNewName(""); setSelectedId(id);
  };

  const onExport = () => {
    if (typeof window === "undefined") return;
    const blob = new Blob([exportEvents(events)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "fina-calle-conquest.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const next = importEvents(String(reader.result));
        setEvents(next); setSelectedId(null); setLive("Log imported");
      } catch (err) {
        window.alert(`Import failed: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  const toggleSound = () => { primeAudio(); setSoundOn((v) => !v); };

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#16344a", fontFamily: "system-ui, sans-serif" }}>
      <HudBar
        totals={totals} goals={goals} soundOn={soundOn} packReady={packReady}
        onToggleSound={toggleSound} onToggleLog={() => setLogOpen((v) => !v)}
        onExport={onExport} onImport={onImport}
        onReset={() => { void resetEventsAsync().then((e) => { setEvents(e); setSelectedId(null); setLive("Board reset"); }); }}
      />
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
        <div style={{ position: "absolute", left: 10, top: 10, zIndex: 3, display: "flex", gap: 10, flexWrap: "wrap", pointerEvents: "none", fontSize: 10, color: "rgba(244,230,204,.7)", background: "rgba(20,12,7,.6)", padding: "5px 8px", borderRadius: 8 }}>
          <span>● Prospect</span><span>● Surveyed</span><span>● Pitched</span>
          <span style={{ color: "#7be29a" }}>⌂ Client</span><span style={{ color: "#d8a24c" }}>★ Flagship</span>
          <span style={{ color: "#e8553a" }}>○ HOT</span><span style={{ color: "#e0a13a" }}>○ WARM</span><span style={{ color: "#5a7fb0" }}>○ COLD</span>
        </div>
        <div style={{ position: "absolute", right: 10, bottom: 10, zIndex: 3, fontSize: 10, color: "rgba(244,230,204,.55)", textAlign: "right", pointerEvents: "none", lineHeight: 1.5 }}>
          drag a tile to arrange · drag the map to pan<br />scroll / pinch to zoom
        </div>
        <ActivityFeed items={activity} open={logOpen} onClose={() => setLogOpen(false)} />
        <LeadPanel lead={selected} surveying={selected ? surveyingId === selected.meta.id : false} onAction={dispatch} onUpdate={update} onClose={() => setSelectedId(null)} />
      </div>
      <div role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{live}</div>
    </div>
  );
}
