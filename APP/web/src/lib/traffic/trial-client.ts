"use client";

/** Memory-only lifecycle guard. No visitor ID, cookie, score or persistent run ID. */
export function createTrialRun() {
  let started = false;
  let finished = false;
  function emit(eventType: "game_start" | "game_complete") {
    try {
      if (document.querySelector('meta[name="fc-trial-tracking"]')?.getAttribute("content") !== "enabled" ||
        navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl ||
        /(?:^|;\s*)traffic_internal=1(?:;|$)/.test(document.cookie) || sessionStorage.getItem("traffic-internal") === "1") return;
      const query = new URLSearchParams(location.search);
      if (["traffic_test", "internal_test", "qa", "e2e"].some(key => query.has(key))) return;
      const body = JSON.stringify({ id: crypto.randomUUID(), ts: Date.now(), hostname: location.hostname,
        path: location.pathname, referrer: null, eventType });
      void fetch("/api/traffic/pageview", { method: "POST", body, credentials: "omit", keepalive: true,
        headers: { "Content-Type": "text/plain" }, signal: AbortSignal.timeout(3000) }).catch(() => {});
    } catch { /* Optional telemetry must never affect play. No blind retries. */ }
  }
  return {
    get finished() { return finished; },
    start() { if (started) return; started = true; emit("game_start"); },
    complete() { if (!started || finished) return; finished = true; emit("game_complete"); },
  };
}
