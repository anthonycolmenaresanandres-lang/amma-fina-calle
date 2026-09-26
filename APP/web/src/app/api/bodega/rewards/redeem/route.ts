import { getOwnerContext } from "@/lib/owner/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { normalizeClaimCode } from "@/lib/bodega-rewards/contracts";
import { hashToken } from "@/lib/bodega-rewards/server";
import { isSameOrigin, readRewardBody, rewardResponse } from "@/lib/bodega-rewards/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return rewardResponse({ message: "Open the Bodega staff page to continue." }, 403);
  try {
    const ctx = await getOwnerContext("bodega");
    if (ctx.state !== "authorized") return rewardResponse({ message: "Authorized Bodega staff access is required." }, 403);
    let body: Record<string, unknown>;
    try { body = await readRewardBody(request); } catch { return rewardResponse({ message: "Invalid claim request." }, 400); }
    const code = normalizeClaimCode(body.code);
    if (!code || typeof body.confirm !== "boolean" || (body.confirm && body.inStoreAndFirstReward !== true)) {
      return rewardResponse({ message: "Enter a valid claim and confirm in-store, first-reward eligibility." }, 400);
    }
    const supabase = await createServerSupabase();
    if (!supabase) throw new Error("Staff service unavailable");
    const { data, error } = await supabase.rpc("bodega_redeem_muffin", { p_token_hash: hashToken(code), p_consume: body.confirm });
    if (error || !data) throw new Error("Redemption unavailable");
    return rewardResponse(data);
  } catch { return rewardResponse({ message: "Redemption could not be confirmed. Check the claim again before handing over a muffin." }, 503); }
}
