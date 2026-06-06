import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";

export type OwnerContext =
  | { state: "unconfigured" }
  | { state: "anonymous" }
  | { state: "unauthorized"; email: string }
  | { state: "authorized"; email: string };

/**
 * Resolves whether the current visitor may manage a given restaurant.
 *
 * Authorization rule: the authenticated email must be allowlisted for THIS
 * restaurant id (enforces "session restaurant must match the URL"). The check
 * runs through a security-definer RPC that returns only a boolean.
 */
export async function getOwnerContext(restaurantId: string): Promise<OwnerContext> {
  const supabase = await createServerSupabase();
  if (!supabase) return { state: "unconfigured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { state: "anonymous" };

  const { data: allowed } = await supabase.rpc("is_email_allowed", {
    p_restaurant_id: restaurantId,
    p_email: user.email,
  });

  return allowed
    ? { state: "authorized", email: user.email }
    : { state: "unauthorized", email: user.email };
}
