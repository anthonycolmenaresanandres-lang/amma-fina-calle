"use server";
import { createServerSupabase } from "@/lib/supabase/server";
export async function signInForEnrollment(email: string, password: string): Promise<{ ok: boolean }> {
  if (process.env.ACCOUNT_STAGING_ENABLED !== "true" || typeof email !== "string" || typeof password !== "string" || email.length > 254 || password.length > 1024 || !email.trim() || !password) return { ok: false };
  try { const client = await createServerSupabase(); if (!client) return { ok: false }; const result = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password }); return { ok: !result.error }; } catch { return { ok: false }; }
}
