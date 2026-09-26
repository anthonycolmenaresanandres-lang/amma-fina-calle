import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/bodega-rewards/http";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { persistChangeRequest, sendChangeRequestEmail, type ChangeRequestPayload } from "@/lib/requests/intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOTE_TYPES = new Set(["Loved something", "Menu idea", "Order issue", "Event or catering", "Other"]);
const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT_KEY = "bodega-guest-notes-global";
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_SECONDS = 10 * 60;

type RateLimitResult = {
  allowed?: boolean;
  retry_after?: number;
};

function text(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("JSON required");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) throw new Error("Body too large");
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Object required");
  return parsed as Record<string, unknown>;
}

function response(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

async function consumeGuestNoteRateLimit(): Promise<{ allowed: boolean; retryAfter: number; unavailable: boolean }> {
  try {
    const { data, error } = await getSupabaseAdmin().rpc("consume_public_intake_rate_limit", {
      p_limiter_key: RATE_LIMIT_KEY,
      p_limit: RATE_LIMIT_MAX,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    });
    if (error || !data || typeof data !== "object") {
      console.error("[bodega-guest-notes] rate limiter unavailable", error?.message);
      return { allowed: false, retryAfter: 60, unavailable: true };
    }
    const result = data as RateLimitResult;
    return {
      allowed: result.allowed === true,
      retryAfter: Math.max(1, Number(result.retry_after) || 60),
      unavailable: false,
    };
  } catch (error) {
    console.error("[bodega-guest-notes] rate limiter threw", error);
    return { allowed: false, retryAfter: 60, unavailable: true };
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return response({ ok: false, message: "Open the Bodega menu to leave a note." }, 403);

  let body: Record<string, unknown>;
  try {
    body = await readBody(request);
  } catch {
    return response({ ok: false, message: "That note could not be read. Please try again." }, 400);
  }

  // Quietly accept bot submissions without storing or emailing them.
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

  // Durable global gate runs before either database persistence or Resend delivery.
  // Fail closed if the limiter cannot be reached so a provider outage cannot remove the abuse control.
  const rateLimit = await consumeGuestNoteRateLimit();
  if (!rateLimit.allowed) {
    return response(
      {
        ok: false,
        message: rateLimit.unavailable
          ? "Guest notes are temporarily unavailable. Please try again shortly."
          : "Too many notes were submitted recently. Please try again in a few minutes.",
      },
      rateLimit.unavailable ? 503 : 429,
      { "Retry-After": String(rateLimit.retryAfter) },
    );
  }

  const referenceId = `BODEGA-${Date.now().toString(36).toUpperCase()}`;
  const payload: ChangeRequestPayload = {
    restaurantId: "bodega",
    businessName: "Bodega Cafe",
    contactName: name,
    contactInfo: contact,
    requestType: "Question for AMMA",
    priority: "Normal",
    message: [
      "Bodega Guest Note",
      `Type: ${noteType}`,
      `Name: ${name}`,
      `Contact: ${contact}`,
      `May contact: ${mayContact}`,
      "",
      "Message:",
      message,
    ].join("\n"),
    sourcePage: sourceUrl ? `Bodega menu - ${sourceUrl}` : "Bodega menu",
    referenceId,
    filesReceived: 0,
  };

  const [persisted, emailed] = await Promise.all([
    persistChangeRequest(payload),
    sendChangeRequestEmail(payload, { additionalRecipients: [process.env.BODEGA_GUEST_NOTES_EMAIL] }),
  ]);

  if (!persisted.persisted && !emailed.sent) {
    return response({ ok: false, message: "Your note is still on this screen. Please try again in a moment." }, 503);
  }

  return response({ ok: true, referenceId });
}
