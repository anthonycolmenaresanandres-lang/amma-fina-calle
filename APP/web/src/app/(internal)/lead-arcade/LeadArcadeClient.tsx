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
  deriveLeads, eventsInTerritory, exportEvents, importEvents, readiness,
  selectActivity, selectGoals, selectTotals,
} from "@/lead-arcade/state";
import { getTerritory, loadActiveTerritory, saveActiveTerritory, TERRITORIES } from "@/lead-arcade/territories";
import { loadEventsAsync, resetEventsAsync, saveEventsAsync } from "@/lead-arcade/persist";
import { HAMPTON_ROADS_STARTER } from "@/lead-arcade/starter-packs";
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
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkSurvey, setBulkSurvey] = useState<{ running: boolean; done: number; total: number }>({ running: false, done: 0, total: 0 });
  const [soundOn, setSoundOn] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [live, setLive] = useState("");
  const [surveyingId, setSurveyingId] = useState<string | null>(null);

  selectRef.current = (id: string) => setSelectedId(id);
  const [territory, setTerritory] = useState<string>(TERRITORIES[0].id);
  useEffect(() => { setTerritory(loadActiveTerritory()); }, []);

  moveRef.current = (id: string, x: number, y: number) =>
    setEvents((prev) => [...prev, { leadId: id, action: "UPDATED", at: Date.now(), patch: { position: { x, y } }, territoryId: territory }]);

  const filtered = useMemo(() => eventsInTerritory(events, territory), [events, territory]);
  const leads = useMemo(() => deriveLeads(filtered), [filtered]);
  const totals = useMemo(() => selectTotals(leads), [leads]);
  const goals = useMemo(() => selectGoals(filtered), [filtered]);
  const activity = useMemo(() => selectActivity(filtered), [filtered]);
  const leadsArr = useMemo(() => [...leads.values()], [leads]);
  const packReady = useMemo(() => leadsArr.filter((l) => readiness(l.meta).ready).length, [leadsArr]);
  const prospectCount = useMemo(() => leadsArr.filter((l) => l.stage === "prospect").length, [leadsArr]);
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
    setEvents((prev) => [...prev, { leadId: id, action, at: Date.now(), amount, territoryId: territory }]);
    if (action === "SURVEYED") void surveyLead(id);
  };

  const updateLead = (id: string, patch: LeadPatch) =>
    setEvents((prev) => [...prev, { leadId: id, action: "UPDATED", at: Date.now(), patch, territoryId: territory }]);

  const update = (patch: LeadPatch) => { if (selectedId) updateLead(selectedId, patch); };

  // Live "Survey": fetch public info (OpenStreetMap) and auto-fill the record.
  const surveyLead = async (id: string) => {
    const name = leads.get(id)?.meta.name;
    if (!name) return;
    setSurveyingId(id);
    try {
      const t = getTerritory(territory);
      const qp = new URLSearchParams({
        q: name, near: t.near,
        lonMin: String(t.bbox.lonMin), lonMax: String(t.bbox.lonMax),
        latMin: String(t.bbox.latMin), latMax: String(t.bbox.latMax),
      });
      const r = await fetch(`/api/lead-arcade/dossier?${qp}`);
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
        setLive(`${name} surveyed — gathered from ${(d.sources ?? ["public data"]).join(" + ")}`);
      } else {
        setLive(`${name} surveyed — no public match, fill manually`);
      }
    } catch {
      setLive(`${name} surveyed — lookup unavailable, fill manually`);
    } finally {
      setSurveyingId(null);
    }
  };

  // Survey every prospect in one pass — front-loads the intel gather so you don't lose
  // momentum clicking each lead. Sequential + paced (polite to the public APIs, which
  // also improves match success vs. hammering them). Skips already-advanced leads.
  const surveyAllProspects = async () => {
    if (bulkSurvey.running) return;
    const ids = leadsArr.filter((l) => l.stage === "prospect").map((l) => l.meta.id);
    if (!ids.length) return;
    setBulkSurvey({ running: true, done: 0, total: ids.length });
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      setEvents((prev) => [...prev, { leadId: id, action: "SURVEYED", at: Date.now(), territoryId: territory }]);
      try { await surveyLead(id); } catch { /* one miss shouldn't stop the batch */ }
      setBulkSurvey((s) => ({ ...s, done: i + 1 }));
      await new Promise((r) => setTimeout(r, 500));
    }
    setBulkSurvey({ running: false, done: 0, total: 0 });
    setLive(`Survey complete — gathered intel for ${ids.length} leads`);
  };

  // Load a code-shipped starter pack onto the current board in one tap. De-duped by
  // name (so re-clicking won't double-add) and non-destructive (appends).
  const loadStarter = (pack: { name: string; businessType: string; fit: Fit }[]) => {
    const existing = new Set(leadsArr.map((l) => l.meta.name.toLowerCase()));
    const fresh = pack.filter((b) => !existing.has(b.name.toLowerCase()));
    if (!fresh.length) { setLive("Starter pack already loaded"); setBulkOpen(false); return; }
    const now = Date.now();
    const cols = Math.max(1, Math.ceil(Math.sqrt(fresh.length)));
    const rows = Math.max(1, Math.ceil(fresh.length / cols));
    const evs: LeadEvent[] = fresh.map((b, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const x = 0.14 + (cols > 1 ? c / (cols - 1) : 0.5) * 0.72;
      const y = 0.14 + (rows > 1 ? r / (rows - 1) : 0.5) * 0.72;
      const id = `${b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${(now + i).toString(36)}`;
      const meta: LeadMeta = {
        id, name: b.name, businessType: b.businessType,
        position: { x: Math.min(0.9, x), y: Math.min(0.9, y) },
        dossier: { rating: 4.0, signature: "Signature Item", fit: b.fit },
      };
      return { leadId: id, action: "SCOUTED", at: now + i, meta, territoryId: territory };
    });
    if (soundOn) playGoal();
    setEvents((prev) => [...prev, ...evs]);
    setLive(`Loaded ${evs.length} Hampton Roads leads — now Survey all`);
    setBulkOpen(false);
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
    setEvents((prev) => [...prev, { leadId: id, action: "SCOUTED", at: Date.now(), meta, territoryId: territory }]);
    setNewName(""); setSelectedId(id);
  };

  // Bulk scout: paste a gathered list (one business per line). Each line is
  // "Name" or "Name, type, rating, FIT" (extra fields optional, any order for
  // rating/FIT). Appends one SCOUTED event per line into the current territory and
  // spreads them across the board; Survey each afterward to auto-fill from public data.
  const scoutList = () => {
    const lines = bulkText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const fitOf = (parts: string[]): Fit | undefined =>
      parts.map((p) => p.toUpperCase()).find((p) => p === "HOT" || p === "WARM" || p === "COLD") as Fit | undefined;
    const now = Date.now();
    const cols = Math.max(1, Math.ceil(Math.sqrt(lines.length)));
    const rows = Math.max(1, Math.ceil(lines.length / cols));
    const newEvents: LeadEvent[] = [];
    lines.forEach((line, i) => {
      const parts = line.split(/\s*[,|\t]\s*/).filter(Boolean);
      const name = parts[0]?.trim();
      if (!name) return;
      const ratingRaw = parts.slice(1).find((p) => /^[0-5](\.\d)?$/.test(p));
      const fit = fitOf(parts) ?? "WARM";
      const businessType = parts.slice(1).find((p) => p !== ratingRaw && !["HOT", "WARM", "COLD"].includes(p.toUpperCase()))?.trim() || "business";
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = 0.14 + (cols > 1 ? c / (cols - 1) : 0.5) * 0.72;
      const y = 0.14 + (rows > 1 ? r / (rows - 1) : 0.5) * 0.72;
      const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${(now + i).toString(36)}`;
      const meta: LeadMeta = {
        id, name, businessType,
        position: { x: Math.min(0.9, x), y: Math.min(0.9, y) },
        dossier: { rating: ratingRaw ? Number(ratingRaw) : 4.0, signature: "Signature Item", fit },
      };
      newEvents.push({ leadId: id, action: "SCOUTED", at: now + i, meta, territoryId: territory });
    });
    if (!newEvents.length) { setBulkOpen(false); return; }
    if (soundOn) playGoal();
    setEvents((prev) => [...prev, ...newEvents]);
    setLive(`Scouted ${newEvents.length} leads into ${getTerritory(territory).name}`);
    setBulkText(""); setBulkOpen(false);
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
        territory={territory} territories={TERRITORIES}
        onTerritory={(id) => { setTerritory(id); saveActiveTerritory(id); setSelectedId(null); }}
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
          <button onClick={() => setBulkOpen((v) => !v)} title="Paste a whole list of businesses" style={{ background: "rgba(20,12,7,.92)", color: "#f4e6cc", border: "1px solid #3a2a18", borderRadius: 8, padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}>📋 Paste list</button>
          {prospectCount > 0 ? (
            <button onClick={surveyAllProspects} disabled={bulkSurvey.running} title="Run the dossier lookup on every prospect at once" style={{ background: bulkSurvey.running ? "rgba(20,12,7,.92)" : "#2f9e54", color: bulkSurvey.running ? "#f4e6cc" : "#06180d", border: "1px solid #3a2a18", borderRadius: 8, padding: "8px 12px", fontWeight: 800, cursor: bulkSurvey.running ? "default" : "pointer", opacity: bulkSurvey.running ? 0.85 : 1 }}>
              {bulkSurvey.running ? `🔭 Surveying ${bulkSurvey.done}/${bulkSurvey.total}…` : `🔭 Survey all (${prospectCount})`}
            </button>
          ) : null}
        </div>
        {bulkOpen ? (
          <div style={{ position: "absolute", left: 12, bottom: 58, width: "min(92vw, 380px)", zIndex: 6, background: "rgba(20,12,7,.97)", border: "1px solid #3a2a18", borderRadius: 12, padding: 12, boxShadow: "0 20px 50px -20px rgba(0,0,0,.8)" }}>
            <div style={{ color: "#f4e6cc", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              Scout a list into {getTerritory(territory).name}
            </div>
            <div style={{ color: "rgba(244,230,204,.6)", fontSize: 11, marginBottom: 8, lineHeight: 1.5 }}>
              One business per line. Just names work — or <code>Name, type, rating, FIT</code> (rating 0–5, FIT = HOT/WARM/COLD). Survey each afterward to auto-fill hours/phone/rating.
            </div>
            <textarea
              value={bulkText} onChange={(e) => setBulkText(e.target.value)} autoFocus rows={8}
              placeholder={"Cafe Aurora\nTacos El Sol, restaurant, 4.3, WARM\nBay Bagels, bakery, HOT"}
              style={{ width: "100%", boxSizing: "border-box", background: "rgba(10,6,3,.9)", color: "#f4e6cc", border: "1px solid #3a2a18", borderRadius: 8, padding: 9, fontSize: 13, fontFamily: "ui-monospace, monospace", resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
              <button onClick={scoutList} style={{ background: "#d8a24c", color: "#1b120a", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 800, cursor: "pointer" }}>
                + Scout {bulkText.split(/\r?\n/).filter((l) => l.trim()).length || ""} leads
              </button>
              <button onClick={() => { setBulkText(""); setBulkOpen(false); }} style={{ background: "transparent", color: "rgba(244,230,204,.7)", border: "1px solid #3a2a18", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>Cancel</button>
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #3a2a18" }}>
              <div style={{ color: "rgba(244,230,204,.55)", fontSize: 11, marginBottom: 6 }}>…or load a ready-made pack:</div>
              <button onClick={() => loadStarter(HAMPTON_ROADS_STARTER)} style={{ background: "#2f9e54", color: "#06180d", border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: 800, cursor: "pointer" }}>
                ★ Load Hampton Roads starter ({HAMPTON_ROADS_STARTER.length})
              </button>
            </div>
          </div>
        ) : null}
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
