import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/bodega-rewards/http";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { guestNoteClientKey } from "@/lib/requests/guest-note-policy";
import { persistChangeRequest, sendChangeRequestEmail, type ChangeRequestPayload } from "@/lib/requests/intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOTE_TYPES = new Set(["Loved something", "Menu idea", "Order issue", "Event or catering", "Other"]);
const MAX_BODY_BYTES = 16 * 1024;

type RateLimitResult = { allowed?: boolean; retry_after?: number };

function text(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("JSON required");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Body required");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error("Body too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Object required");
  return parsed as Record<string, unknown>;
}

function response(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", ...extraHeaders },
  });
}

async function consumeGuestNoteRateLimit(request: Request): Promise<{ allowed: boolean; retryAfter: number; unavailable: boolean }> {
  const clientKey = guestNoteClientKey(request.headers, {
    vercel: process.env.VERCEL === "1",
    production: process.env.NODE_ENV === "production",
  });
  if (!clientKey) return { allowed: false, retryAfter: 60, unavailable: true };
  try {
    // One transaction checks both buckets; denied clients never spend the shared budget.
    const { data, error } = await getSupabaseAdmin().rpc("consume_bodega_guest_note_limits", {
      p_client_key: clientKey,
    });
    if (error || !data || typeof data !== "object" || Array.isArray(data)) {
      return { allowed: false, retryAfter: 60, unavailable: true };
    }
    const result = data as RateLimitResult;
    if (typeof result.allowed !== "boolean") return { allowed: false, retryAfter: 60, unavailable: true };
    const retry = Number(result.retry_after);
    return {
      allowed: result.allowed,
      retryAfter: Number.isFinite(retry) ? Math.max(1, Math.min(600, Math.ceil(retry))) : 60,
      unavailable: false,
    };
  } catch {
    return { allowed: false, retryAfter: 60, unavailable: true };
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return response({ ok: false, message: "Open the Bodega menu to leave a note." }, 403);

  let body: Record<string, unknown>;
  try { body = await readBody(request); } catch {
    return response({ ok: false, message: "That note could not be read. Please try again." }, 400);
  }
  // Quietly accept honeypot submissions without storing or emailing them.
  if (text(body.company, 200)) return response({ ok: true });

  const name = text(body.name, 120) || "Bodega guest";
  const contact = text(body.contact, 240) || "Not provided";
  const noteType = text(body.noteType, 80);
  const message = text(body.message, 3000);
  const mayContact = body.mayContact === true ? "Yes" : body.mayContact === false ? "No" : "";
  const sourceUrl = text(body.sourceUrl, 600);
  if (!NOTE_TYPES.has(noteType) || !message || !mayContact) {
    return response({ ok: false, message: "Add a message and choose whether Fina Calle may contact you." }, 400);
  }

  const rateLimit = await consumeGuestNoteRateLimit(request);
  if (!rateLimit.allowed) return response({
    ok: false,
    message: rateLimit.unavailable
      ? "Guest notes are temporarily unavailable. Your note remains on this screen."
      : "Too many notes were submitted recently. Your note remains here; please try again later.",
  }, rateLimit.unavailable ? 503 : 429, { "Retry-After": String(rateLimit.retryAfter) });

  const referenceId = `BODEGA-${randomUUID()}`;
  const payload: ChangeRequestPayload = {
    // Fina Calle intake only. A tenant id would expose contact details through owner RLS.
    // A confirmed email recipient does not implicitly grant owner-portal visibility.
    restaurantId: null,
    businessName: "Bodega Cafe",
    contactName: name,
    contactInfo: contact,
    requestType: "Question for AMMA",
    priority: "Normal",
    message: ["Bodega Guest Note", `Type: ${noteType}`, `Name: ${name}`, `Contact: ${contact}`, `May contact: ${mayContact}`, "", "Message:", message].join("\n"),
    sourcePage: sourceUrl ? `Bodega menu - ${sourceUrl}` : "Bodega menu",
    referenceId,
    filesReceived: 0,
  };
  const [persisted, emailed] = await Promise.all([
    persistChangeRequest(payload),
    sendChangeRequestEmail(payload, { additionalRecipients: [process.env.BODEGA_GUEST_NOTES_EMAIL] }),
  ]);
  if (!persisted.persisted && !emailed.sent) return response({ ok: false, message: "Your note is still on this screen. Please try again in a moment." }, 503);
  return response({ ok: true, referenceId });
}
