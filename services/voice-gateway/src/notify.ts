// Staff notification. When a booking commits as a PENDING request (propose-and-confirm,
// or any system that can't auto-write), or a call is missed, the team needs a nudge.
// Posts a one-line message to the tenant's configured incoming webhook (Slack / Make /
// an SMS bridge); with no URL it just logs — so it's safe keyless and in the simulator.
// Never throws into the call path.

export async function notifyStaff(message: string, staffWebhookUrl?: string): Promise<void> {
  if (!staffWebhookUrl) {
    console.log(`[notify] ${message}`);
    return;
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    await fetch(staffWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }), // Slack-style; Make/Zapier read .text too
      signal: ctrl.signal,
    }).finally(() => clearTimeout(t));
  } catch (err) {
    console.warn(`[notify] failed to reach staff webhook: ${String(err)}`);
  }
}
