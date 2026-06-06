import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";

export type AdminContext =
  | { state: "unconfigured" }
  | { state: "anonymous" }
  | { state: "unauthorized"; email: string }
  | { state: "authorized"; email: string };

/**
 * Resolves whether the current visitor is a Fina Calle admin (global, not
 * per-restaurant). Authorization lives here in the server helper, not only in
 * the proxy. Fails closed: any missing config / RPC returns a non-authorized
 * state, so the registry is never rendered to a non-admin.
 */
export async function getAdminContext(): Promise<AdminContext> {
  const supabase = await createServerSupabase();
  if (!supabase) return { state: "unconfigured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { state: "anonymous" };

  const { data: isAdmin } = await supabase.rpc("is_admin_email", {
    p_email: user.email,
  });

  return isAdmin
    ? { state: "authorized", email: user.email }
    : { state: "unauthorized", email: user.email };
}
