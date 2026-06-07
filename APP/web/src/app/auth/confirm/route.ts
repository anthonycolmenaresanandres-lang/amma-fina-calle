import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Passwordless sign-in landing for owner + admin magic links.
 *
 * Verifies the one-time `token_hash` via verifyOtp and sets the session cookie,
 * then forwards to `next`. Unlike the PKCE `?code=` flow, token-hash links do
 * NOT require the verifier cookie from the browser that requested the link, so
 * they complete on ANY browser or device (e.g. a cafe owner clicking from their
 * phone's mail app). Falls back to exchangeCodeForSession for any in-flight
 * PKCE links so the transition is seamless.
 *
 * Email template (Supabase → Authentication → Email Templates → Magic Link):
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next={{ .RedirectTo }}
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const next = sanitizeNext(url.searchParams.get("next"), url.origin);

  const supabase = await createServerSupabase();
  if (supabase) {
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (!error) return NextResponse.redirect(new URL(next, url.origin));
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  // Verification failed or wasn't possible — send them to the destination,
  // which renders the sign-in form again. The `auth=retry` hint is ignored by
  // the page but is useful when diagnosing.
  const dest = new URL(next, url.origin);
  dest.searchParams.set("auth", "retry");
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
