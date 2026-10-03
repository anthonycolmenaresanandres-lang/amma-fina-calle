// Webhook acceptance is transport evidence, never proof that a manager read an alert.
// No destination, retries, recipient lookup or new delivery channel is created here.
import type { NotificationResult } from "./types";

export async function notifyStaff(message: string, staffWebhookUrl?: string): Promise<NotificationResult> {
  if (!staffWebhookUrl?.trim()) return { status: "not_configured" };
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 4000);
  try {
    const response = await fetch(staffWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
      signal: ctrl.signal,
      redirect: "manual", // redirects are not acceptance by the configured endpoint
    });
    void response.body?.cancel().catch(() => {});
    return response.ok
      ? { status: "accepted", httpStatus: response.status }
      : { status: "failed", failure: "http_error", httpStatus: response.status };
  } catch {
    // Do not log destination URLs, request payloads, or exception strings containing credentials.
    return { status: "failed", failure: ctrl.signal.aborted ? "timeout" : "network_error" };
  } finally {
    clearTimeout(timeout);
  }
}

export function notificationWording(result?: NotificationResult | { status: "pending" }): string {
  if (result?.status === "accepted") {
    return "The alert was submitted, but I cannot confirm anyone has read it or promise a callback.";
  }
  if (result?.status === "not_configured") {
    return "I cannot notify staff from this line. Please contact the business directly using its published contact details.";
  }
  if (result?.status === "failed") {
    return "I could not notify staff. Please contact the business directly using its published contact details.";
  }
  return "Staff notification is unconfirmed. Please contact the business directly using its published contact details.";
}

export function handoffInstructions(configured: boolean): string {
  return [
    "HANDOFF ACCURACY: Recording a message or booking request is separate from notifying staff.",
    configured
      ? "A staff notification route is configured; use the actual tool result to describe whether the alert was accepted or failed."
      : "No staff notification route is configured for this tenant. You may record a message, but must explain that you cannot notify staff from this line.",
    "A webhook accepting an alert does not prove human receipt, review, or follow-up.",
    "Never promise a callback, response time, manager receipt, or guaranteed follow-up.",
    "Only claim a booking is confirmed when the booking tool explicitly confirms it, not when a request is pending.",
    "If notification fails or is unconfirmed, offer only this tenant's published human contact details from its knowledge.",
    "Do not claim that a conversational call summary or per-call report is sent; that capability is not implemented.",
  ].join(" ");
}
