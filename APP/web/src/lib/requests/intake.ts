import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type ChangeRequestPayload = {
  businessName: string;
  contactName: string;
  contactInfo: string;
  requestType: string;
  priority: string;
  message: string;
  sourcePage: string;
  referenceId: string;
  filesReceived: number;
};

/**
 * Persist a change request via the security-definer submit_change_request RPC.
 * No-ops (persisted: false) when Supabase is not configured. Never throws —
 * a storage failure must not break the public intake response.
 */
export async function persistChangeRequest(
  payload: ChangeRequestPayload,
): Promise<{ persisted: boolean }> {
  if (!isSupabaseConfigured) return { persisted: false };

  try {
    const supabase = await createServerSupabase();
    if (!supabase) return { persisted: false };

    const { error } = await supabase.rpc("submit_change_request", {
      p_business_name: payload.businessName,
      p_contact_name: payload.contactName,
      p_contact_info: payload.contactInfo,
      p_request_type: payload.requestType,
      p_priority: payload.priority,
      p_message: payload.message,
      p_source_page: payload.sourcePage,
      p_reference_id: payload.referenceId,
      p_restaurant_id: null,
    });

    if (error) {
      console.error("[customer-requests] persist failed", error.message);
      return { persisted: false };
    }
    return { persisted: true };
  } catch (error) {
    console.error("[customer-requests] persist threw", error);
    return { persisted: false };
  }
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Email a change request to the configured admin recipient via Resend.
 * No-ops (sent: false) when the email env vars are absent. Never throws.
 * Secrets stay server-side; nothing here is sent to the client.
 */
export async function sendChangeRequestEmail(
  payload: ChangeRequestPayload,
): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.REQUESTS_NOTIFICATION_EMAIL;
  const from = process.env.REQUESTS_FROM_EMAIL;

  if (!apiKey || !to || !from) return { sent: false };

  const lines = [
    `Reference: ${payload.referenceId}`,
    `Business: ${payload.businessName}`,
    `Contact: ${payload.contactName} (${payload.contactInfo})`,
    `Type: ${payload.requestType}`,
    `Priority: ${payload.priority}`,
    `Files attached: ${payload.filesReceived}`,
    `Source: ${payload.sourcePage}`,
    "",
    "Message:",
    payload.message,
  ];

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New request — ${payload.businessName} [${payload.priority}]`,
        text: lines.join("\n"),
        ...(looksLikeEmail(payload.contactInfo) ? { reply_to: payload.contactInfo } : {}),
      }),
    });

    if (!response.ok) {
      console.error("[customer-requests] email failed", response.status);
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    console.error("[customer-requests] email threw", error);
    return { sent: false };
  }
}
