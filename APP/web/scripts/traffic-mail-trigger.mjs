// Native scheduler client. No provider/DB credentials, dependencies, raw records,
// configurable target/recipient, retries, or response-body logging.
const endpoint = "https://finacalleos.com/api/internal/traffic/morning";
export async function triggerMail(env = process.env, fetcher = fetch) {
  const secret = env.TRAFFIC_MAIL_TRIGGER_SECRET;
  const mode = env.TRAFFIC_MAIL_MODE;
  if (!secret || secret.length < 32 || secret.length > 512 || !["test", "scheduled"].includes(mode)) throw new Error("Mail trigger configuration missing");
  const body = mode === "test" ? { mode } : { mode, schedule: env.TRAFFIC_MAIL_SCHEDULE };
  if (mode === "scheduled" && !["0 12 * * *", "0 13 * * *"].includes(body.schedule)) throw new Error("Unsupported schedule");
  const response = await fetcher(endpoint, {
    method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify(body), signal: AbortSignal.timeout(45000), redirect: "error",
  });
  if (!response.ok) throw new Error(`Mail trigger HTTP ${response.status}; do not retry before checking the owner inbox`);
  const result = await response.json();
  if (result.ok === true && result.skipped === true && result.reason === "outside_delivery_window") {
    console.log("Skipped: outside the approved Eastern reporting window.");
  } else if (result.ok === true && result.accepted === true) {
    console.log("Provider accepted the aggregate email; inbox delivery requires Gmail readback. No automatic retry.");
  } else throw new Error("Unconfirmed mail trigger result");
}
if (process.argv[1]?.replaceAll("\\", "/").endsWith("/traffic-mail-trigger.mjs")) {
  triggerMail().catch(() => { console.error("Mail trigger unsuccessful; no automatic retry. Inspect the owner inbox and protected readiness metadata."); process.exitCode = 1; });
}
