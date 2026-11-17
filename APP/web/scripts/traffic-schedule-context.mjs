// Public run-metadata read only. The sole credential used is the workflow's
// ephemeral, read-scoped built-in Actions token (actions:read), passed via
// GITHUB_TOKEN purely to authenticate this metadata read so it is not subject to
// the 60-req/hr unauthenticated limit shared across runner IPs. No credential
// files, no request mutation, no recipient, no aggregates, nothing is sent. The
// read still fails closed. A manual rerun keeps its original run creation date.
import { appendFileSync } from "node:fs";
const repository = "anthonycolmenaresanandres-lang/amma-fina-calle";
export async function scheduleContext(env = process.env, fetcher = fetch) {
  if (env.GITHUB_REPOSITORY !== repository || !/^\d{1,16}$/.test(env.GITHUB_RUN_ID ?? "")) throw Error("invalid_run_context");
  const url = `https://api.github.com/repos/${repository}/actions/runs/${env.GITHUB_RUN_ID}`;
  // Authenticated public-metadata read when a token is present (lifts the shared-IP
  // unauthenticated rate limit — the persistent cause of red scheduled runs); still
  // absorb transient GitHub API unavailability (secondary rate limits, 5xx, network
  // blips) with bounded backoff, and still fail closed.
  const headers = { Accept: "application/vnd.github+json" };
  const token = env.GITHUB_TOKEN ?? env.GH_TOKEN;
  if (typeof token === "string" && token.length > 0) headers.Authorization = `Bearer ${token}`;
  const transient = new Set([403, 408, 429, 500, 502, 503, 504]);
  let response;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await fetcher(url, {
        headers, redirect: "error", signal: AbortSignal.timeout(15000),
      });
    } catch (error) {
      if (attempt === 3) throw error instanceof Error ? error : Error("run_context_unavailable");
      await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
      continue;
    }
    if (response.ok) break;
    if (attempt === 3 || !transient.has(response.status)) throw Error("run_context_unavailable");
    await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
  }
  if (!response?.ok) throw Error("run_context_unavailable");
  const reader = response.body?.getReader();
  if (!reader) throw Error("invalid_run_context");
  const chunks = []; let bytes = 0;
  for (;;) {
    const { value, done } = await reader.read(); if (done) break;
    bytes += value.byteLength;
    if (bytes > 131072) { await reader.cancel(); throw Error("invalid_run_context"); }
    chunks.push(value);
  }
  const run = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (run.repository?.full_name !== repository || String(run.id) !== env.GITHUB_RUN_ID ||
    run.head_branch !== "main" || !["schedule", "workflow_dispatch"].includes(run.event) ||
    typeof run.created_at !== "string" || !Number.isFinite(Date.parse(run.created_at))) throw Error("invalid_run_context");
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(run.created_at));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw Error("invalid_run_context");
  return date;
}
if (process.argv[1]?.replaceAll("\\", "/").endsWith("/traffic-schedule-context.mjs")) {
  scheduleContext().then(date => appendFileSync(process.env.GITHUB_OUTPUT, `delivery_date=${date}\n`)).catch(() => {
    console.error("Traffic mail run context unavailable; no delivery attempted."); process.exitCode = 1;
  });
}
