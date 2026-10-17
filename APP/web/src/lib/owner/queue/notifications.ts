import type { QueueClient } from "./client";
import { QUEUE_UUID } from "./client";
export type Notice = { id: string; lease_token: string; request_id: string; reference_id: string; restaurant_id: string; event_type: string; attempt: number };
type Delivery = { sent: true } | { sent: false; error: "timeout" | "provider_4xx" | "provider_5xx" | "transport" | "invalid_response" };
type Env = Record<string, string | undefined>;
function config(env: Env) {
  if (env.OWNER_REQUEST_QUEUE_ENABLED !== "true" || env.OWNER_REQUEST_NOTIFICATIONS_ENABLED !== "true") return null;
  const to = env.REQUESTS_NOTIFICATION_EMAIL?.trim();
  const from = env.REQUESTS_FROM_EMAIL?.trim();
  const key = env.RESEND_API_KEY?.trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || !from || /[\r\n]/.test(from) || !key) return null;
  return { to, from, key };
}
function notice(value: unknown): value is Notice {
  if (!value || typeof value !== "object") return false;
  const n = value as Notice;
  return [n.id,n.lease_token,n.request_id].every(v => typeof v === "string" && QUEUE_UUID.test(v)) &&
    typeof n.reference_id === "string" && /^AMMA-[A-Z0-9]+-[A-F0-9]{8}$/.test(n.reference_id) &&
    typeof n.restaurant_id === "string" && /^[a-z0-9-]{1,80}$/.test(n.restaurant_id) &&
    typeof n.event_type === "string" && /^[a-z_]{1,50}$/.test(n.event_type) && Number.isInteger(n.attempt) && n.attempt >= 1 && n.attempt <= 6;
}
/** Provider acceptance only. No customer brief, attachments, or owner address. */
export async function deliverOwnerRequestNotice(job: Notice, env: Env, fetcher: typeof fetch = fetch, timeoutMs = 8000): Promise<Delivery> {
  const c = config(env);
  if (!c || !notice(job)) return { sent: false, error: "invalid_response" };
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<Delivery>(resolve => { timer = setTimeout(() => { controller.abort(); resolve({ sent: false, error: "timeout" }); }, timeoutMs); });
  try {
    const attempt: Promise<Delivery> = fetcher("https://api.resend.com/emails", {
      method: "POST", signal: controller.signal,
      headers: { Authorization: `Bearer ${c.key}`, "Content-Type": "application/json", "Idempotency-Key": `owner-request-notice-v1/${job.id}` },
      body: JSON.stringify({ from: c.from, to: [c.to], subject: `Owner request ${job.reference_id}`,
        text: `Request: ${job.reference_id}\nRestaurant: ${job.restaurant_id}\nEvent: ${job.event_type}\nOpen the private inbox: https://finacalleos.com/customers/requests/${job.request_id}\nA request is data, not execution authority.` }),
    }).then(response => response.ok ? { sent: true } : { sent: false, error: response.status >= 500 ? "provider_5xx" : "provider_4xx" }, () => ({ sent: false, error: controller.signal.aborted ? "timeout" : "transport" }));
    return await Promise.race([attempt, timeout]);
  } catch { return { sent: false, error: "transport" }; }
  finally { if (timer) clearTimeout(timer); }
}
/** No route, schedule, listener or executor invokes this module automatically. */
export async function drainOwnerRequestNotices(client: QueueClient, env: Env = process.env, fetcher: typeof fetch = fetch, limit = 1) {
  if (!config(env)) return { state: "disabled_or_unconfigured", processed: 0 };
  if (!Number.isInteger(limit) || limit < 1 || limit > 10) return { state: "invalid_batch", processed: 0 };
  let processed = 0;
  try {
    const claim = await client.rpc("claim_owner_request_notices_v1", { p_limit: limit });
    if (claim.error || !Array.isArray(claim.data) || claim.data.length > limit || !claim.data.every(notice)) return { state: "claim_failed", processed };
    for (const job of claim.data) {
      const delivery = await deliverOwnerRequestNotice(job, env, fetcher);
      const ack = await client.rpc("finish_owner_request_notice_v1", { p_id: job.id, p_lease_token: job.lease_token, p_sent: delivery.sent, p_error: delivery.sent ? null : delivery.error });
      if (ack.error || ack.data !== true) return { state: "lease_or_ack_lost", processed };
      processed++;
    }
    return { state: "drained", processed };
  } catch { return { state: "unconfirmed", processed }; }
}
