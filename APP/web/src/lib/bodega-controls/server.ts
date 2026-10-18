import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "../supabase/config";

/** Anonymous, nonpersistent, uncached reader. Never attach owner cookies/service keys. */
export async function createBodegaPublicReader() {
  if (!isSupabaseConfigured) return null;
  return createClient(SUPABASE_URL!,SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input,init) => fetch(input,{ ...init,cache: "no-store" }) },
  });
}
