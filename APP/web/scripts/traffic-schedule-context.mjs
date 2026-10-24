// Public metadata only. No GitHub token, credential files, request mutation,
// recipient or aggregates. A manual rerun keeps its original run creation date.
import { appendFileSync } from "node:fs";
const repository = "anthonycolmenaresanandres-lang/amma-fina-calle";
export async function scheduleContext(env = process.env, fetcher = fetch) {
  if (env.GITHUB_REPOSITORY !== repository || !/^\d{1,16}$/.test(env.GITHUB_RUN_ID ?? "")) throw Error("invalid_run_context");
  const response = await fetcher(`https://api.github.com/repos/${repository}/actions/runs/${env.GITHUB_RUN_ID}`, {
    headers: { Accept: "application/vnd.github+json" }, redirect: "error", signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw Error("run_context_unavailable");
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
