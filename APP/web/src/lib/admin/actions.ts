"use server";

import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";

export type AdminActionState = { ok: boolean; message: string };

/**
 * Sends an admin magic-link, only for emails on the admin allowlist. Uses a
 * boolean-only RPC and always returns the same neutral message, so admin
 * emails cannot be enumerated.
 */
export async function requestAdminMagicLink(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const neutral: AdminActionState = {
    ok: true,
    message: "If that email is an admin, a sign-in link is on its way. Check your inbox.",
  };

  if (!email || !email.includes("@") || email.length > 300) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, message: "Admin sign-in is not configured yet." };
  }

  const { data: allowed } = await supabase.rpc("is_admin_email", { p_email: email });
  if (!allowed) return neutral;

  const headerList = await headers();
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  const host = headerList.get("host");
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`;

  await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      // Destination after the link is verified; the Magic Link email template
      // wraps this as `next` on /auth/confirm (token-hash flow). See
      // src/app/auth/confirm/route.ts.
      emailRedirectTo: `${origin}/customers`,
    },
  });

  return neutral;
}
