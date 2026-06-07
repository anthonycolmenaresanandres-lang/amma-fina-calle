import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Passwordless sign-in landing for owner + admin magic links.
 *
 * Verifies the one-time `token_hash` via verifyOtp and sets the session cookie,
 * then forwards to `next`. Unlike the PKCE `?code=` flow, token-hash links do
 * NOT require the verifier cookie from the browser that requested the link, so
 * they complete on ANY browser or device.
 *
 * The email's `type` label can differ from what verifyOtp expects for a magic
 * link ("magiclink" vs "email" depending on Supabase version/template). To
 * avoid bouncing the owner back to the sign-in page over a label mismatch, we
 * try the link's own type first and then safe fallbacks. A FAILED verifyOtp
 * does not consume the one-time token, so the retries are safe.
 *
 * Email template (Supabase → Authentication → Email Templates → Magic Link):
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next={{ .RedirectTo }}
 */

const FALLBACK_TYPES: EmailOtpType[] = ["email", "magiclink"];

type SafeError = { name?: string; message?: string; code?: string; status?: number };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const requestedType = url.searchParams.get("type");
  const code = url.searchParams.get("code");
  const next = sanitizeNext(url.searchParams.get("next"), url.origin);

  const supabase = await createServerSupabase();
  if (!supabase) {
    console.error("[auth/confirm] supabase not configured");
    return bounce(url.origin, next, "unavailable");
  }

  // Primary path: token-hash verification (works on any device/browser).
  if (tokenHash) {
    const types = orderedTypes(requestedType);
    let lastError: SafeError = {};
    for (const type of types) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (!error) {
        // Safe to log: the type label only, never the token.
        console.log("[auth/confirm] verified", { type });
        return NextResponse.redirect(new URL(next, url.origin));
      }
      lastError = safeError(error);
    }
    // Token/secret values are never logged — only error metadata + tried types.
    console.error("[auth/confirm] verifyOtp failed", { triedTypes: types, ...lastError });
    return bounce(url.origin, next, "expired");
  }

  // Fallback: any in-flight PKCE `?code=` links.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log("[auth/confirm] verified via code");
      return NextResponse.redirect(new URL(next, url.origin));
    }
    console.error("[auth/confirm] exchangeCodeForSession failed", safeError(error));
    return bounce(url.origin, next, "expired");
  }

  console.error("[auth/confirm] missing token_hash and code");
  return bounce(url.origin, next, "invalid");
}

/** The link's own type first, then safe fallbacks; de-duplicated. */
function orderedTypes(requestedType: string | null): EmailOtpType[] {
  const ordered = [requestedType, ...FALLBACK_TYPES].filter(
    (t): t is string => Boolean(t),
  ) as EmailOtpType[];
  return ordered.filter((t, i, arr) => arr.indexOf(t) === i);
}

/** Strip token/secret fields; keep only safe, non-sensitive diagnostics. */
function safeError(error: unknown): SafeError {
  if (!error || typeof error !== "object") return {};
  const e = error as Record<string, unknown>;
  return {
    name: typeof e.name === "string" ? e.name : undefined,
    message: typeof e.message === "string" ? e.message : undefined,
    code: typeof e.code === "string" ? e.code : undefined,
    status: typeof e.status === "number" ? e.status : undefined,
  };
}

/** Redirect to the destination with a non-sensitive auth hint for the UI. */
function bounce(origin: string, next: string, reason: string) {
  const dest = new URL(next, origin);
  dest.searchParams.set("auth", reason);
  return NextResponse.redirect(dest);
}

/** Only allow same-origin relative paths — prevents open-redirect abuse. */
function sanitizeNext(next: string | null, origin: string): string {
  if (!next) return "/";
  try {
    const u = new URL(next, origin);
    if (u.origin !== origin) return "/";
    return `${u.pathname}${u.search}`;
  } catch {
    return "/";
  }
}
