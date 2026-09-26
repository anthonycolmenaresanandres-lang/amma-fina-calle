"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BodegaRun } from "@/bodega-fall/challenge";
import type { MuffinReceipt, RewardCampaignSession, RewardSnapshot } from "@/lib/bodega-rewards/contracts";

async function requestReward(body?: unknown) {
  const response = await fetch("/api/bodega/rewards", {
    method: body ? "POST" : "GET", cache: "no-store",
    ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => { throw new Error("Connection interrupted. Please retry before starting another prize round."); });
  if (!response.ok) throw new Error(data.message || "Muffin verification is unavailable. Please retry.");
  return data;
}

export function useMuffinRewards() {
  const [snapshot, setSnapshot] = useState<RewardSnapshot>({ enabled: false });
  const [checking, setChecking] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const pending = useRef<{ id: string; runs: BodegaRun[] } | null>(null);
  const busy = useRef(false);
  const mounted = useRef(false);
  const refresh = useCallback(async () => {
    try {
      const data: RewardSnapshot = await requestReward();
      if (mounted.current) setSnapshot((old) => ({ ...data, receipt: data.receipt ?? old.receipt }));
    } catch {
      if (mounted.current) setSnapshot((old) => ({ ...old, enabled: false, message: "Prize status is unavailable. Play for fun or check again later." }));
    } finally { if (mounted.current) setChecking(false); }
  }, []);
  useEffect(() => {
    mounted.current = true;
    const initial = window.setTimeout(() => { void refresh(); }, 0);
    const focus = () => { void refresh(); };
    window.addEventListener("focus", focus);
    return () => { mounted.current = false; clearTimeout(initial); window.removeEventListener("focus", focus); };
  }, [refresh]);
  useEffect(() => {
    if (snapshot.receipt?.status !== "valid") return;
    const interval = window.setInterval(() => { void refresh(); }, 30000);
    return () => clearInterval(interval);
  }, [snapshot.receipt?.status, refresh]);
  const startPrize = useCallback(async (): Promise<RewardCampaignSession> => {
    return requestReward({ action: "start" });
  }, []);
  const finish = useCallback(async (id: string, runs: BodegaRun[]) => {
    if (busy.current) return;
    pending.current = { id, runs };
    busy.current = true;
    setVerifying(true); setMessage("");
    try {
      const result: { receipt?: MuffinReceipt; won?: boolean } = await requestReward({ action: "finish", id, runs });
      if (!mounted.current) return;
      if (result.receipt) setSnapshot((old) => ({ ...old, receipt: result.receipt, campaign: undefined }));
      pending.current = null;
    } catch (error) {
      if (mounted.current) setMessage(error instanceof Error ? error.message : "Your result could not be checked. Retry before starting another prize round.");
    } finally {
      busy.current = false;
      if (mounted.current) setVerifying(false);
    }
  }, []);
  const retry = () => { if (pending.current) void finish(pending.current.id, pending.current.runs); };
  return { ...snapshot, checking, verifying, message, startPrize, finish, retry, refresh };
}
