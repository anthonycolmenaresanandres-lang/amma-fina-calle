// Staff notification. When a booking commits as a PENDING request (propose-and-confirm,
// or any system that can't auto-write), the team needs a nudge to confirm it into
// whatever they actually use. Posts a one-line message to a configured incoming webhook
// (Slack / Make / an SMS bridge); with no URL set it just logs — so it's safe keyless
// and in the simulator. Never throws into the call path.

import { config } from "./config";

export async function notifyStaff(message: string): Promise<void> {
  const url = config.notify.staffWebhookUrl;
  if (!url) {
    console.log(`[notify] ${message}`);
    return;
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }), // Slack-style; Make/Zapier read .text too
      signal: ctrl.signal,
    }).finally(() => clearTimeout(t));
  } catch (err) {
    console.warn(`[notify] failed to reach staff webhook: ${String(err)}`);
  }
}
