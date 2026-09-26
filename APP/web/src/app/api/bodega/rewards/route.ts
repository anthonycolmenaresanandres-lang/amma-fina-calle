import { randomBytes, randomInt } from "node:crypto";
import { cookies } from "next/headers";
import { BODEGA_CHAPTERS, BODEGA_ROUND_VERSION, makeBodegaRound, verifyBodegaCampaign } from "@/bodega-fall/challenge";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { campaignEnabled, claimCode, cookieOptions, GUEST_COOKIE, hashToken, receiptFor, ROUND_COOKIE, validSecret } from "@/lib/bodega-rewards/server";
import { isSameOrigin, readRewardBody, rewardResponse } from "@/lib/bodega-rewards/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const secret = validSecret(jar.get(ROUND_COOKIE)?.value);
  const enabled = await campaignEnabled();
  try {
    const receipt = secret ? await receiptFor(secret) : undefined;
    const guest = validSecret(jar.get(GUEST_COOKIE)?.value);
    const active = secret && guest && !receipt ? await getSupabaseAdmin().from("bodega_reward_sessions")
      .select("id,seed,version,expires_at,finished")
      .eq("secret_hash", hashToken(secret)).eq("guest_hash", hashToken(guest)).maybeSingle() : null;
    const session = active?.data;
    const campaign = session && session.version === BODEGA_ROUND_VERSION && !session.finished && Date.parse(session.expires_at) > Date.now()
      ? { id: session.id, seed: Number(session.seed), plans: BODEGA_CHAPTERS.map((_, index) => makeBodegaRound(Number(session.seed), index)), expiresAt: session.expires_at }
      : undefined;
    return rewardResponse({ enabled, receipt, campaign });
  } catch { return rewardResponse({ enabled: false, message: "Your saved claim cannot be checked right now. Keep this browser and try again." }, 503); }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return rewardResponse({ message: "Open the game on this site to continue." }, 403);
  let body: Record<string, unknown>;
  try { body = await readRewardBody(request); } catch { return rewardResponse({ message: "Invalid game request." }, 400); }
  if (body.action !== "start" && body.action !== "finish") return rewardResponse({ message: "Unknown game action." }, 400);
  try {
    const jar = await cookies();
    if (body.action === "start") {
      if (!await campaignEnabled()) return rewardResponse({ message: "Muffin claims are not active. You can still play for fun." }, 503);
      const guest = validSecret(jar.get(GUEST_COOKIE)?.value) ?? randomBytes(32).toString("hex");
      const secret = randomBytes(32).toString("hex");
      const seed = randomInt(0, 4294967296);
      const { data, error } = await getSupabaseAdmin().rpc("bodega_start_round", {
        p_guest_hash: hashToken(guest), p_secret_hash: hashToken(secret), p_seed: seed,
      });
      if (error || !data) throw new Error("Start unavailable");
      if (data.status !== "started") {
        const messages: Record<string, string> = {
          already_earned: "You have already earned your muffin for this promotion. Check your saved claim.",
          wait: "Please wait 30 seconds between prize rounds. Practice is always available.",
          full: "No new prize rounds are available right now. Existing claims will still be honored.",
          closed: "Prize rounds are closed right now. Play for fun instead.",
        };
        return rewardResponse({ message: messages[data.status] ?? "Prize rounds are unavailable." }, data.status === "wait" ? 429 : 409);
      }
      jar.set(GUEST_COOKIE, guest, cookieOptions);
      jar.set(ROUND_COOKIE, secret, cookieOptions);
      return rewardResponse({ id: data.id, seed, plans: BODEGA_CHAPTERS.map((_, index) => makeBodegaRound(seed, index)), expiresAt: data.expiresAt });
    }
    const secret = validSecret(jar.get(ROUND_COOKIE)?.value);
    const guest = validSecret(jar.get(GUEST_COOKIE)?.value);
    if (!secret || !guest) return rewardResponse({ message: "This prize round cannot be verified. Start from the game page." }, 403);
    const admin = getSupabaseAdmin();
    const { data: session, error } = await admin.from("bodega_reward_sessions")
      .select("id,seed,version,created_at,expires_at").eq("secret_hash", hashToken(secret)).eq("guest_hash", hashToken(guest)).maybeSingle();
    if (error) throw new Error("Session unavailable");
    if (!session || session.id !== body.id || session.version !== BODEGA_ROUND_VERSION) return rewardResponse({ message: "This result belongs to a different or unavailable round." }, 409);
    // Recover a successful previous submission even after expiry or a lost response.
    const existing = await receiptFor(secret);
    if (existing) return rewardResponse({ receipt: existing });
    const verified = verifyBodegaCampaign(Number(session.seed), body.runs, Date.now() - Date.parse(session.created_at));
    if (!verified || Date.parse(session.expires_at) <= Date.now()) return rewardResponse({ message: "This campaign could not be verified or has expired. No muffin claim was issued." }, 422);
    const { data: finishResult, error: finishError } = await admin.rpc("bodega_finish_round", {
      p_secret_hash: hashToken(secret), p_token_hash: hashToken(claimCode(secret)), p_score: verified.total,
    });
    if (finishError || !finishResult) throw new Error("Claim unavailable");
    if (finishResult.status === "lost") return rewardResponse({ score: verified.total, won: false });
    const receipt = await receiptFor(secret);
    if (receipt) return rewardResponse({ score: verified.total, won: true, receipt });
    return rewardResponse({ message: "A new claim was not issued. You may already have earned your one muffin." }, 409);
  } catch {
    return rewardResponse({ message: "Muffin verification is unavailable. Do not start another prize round; retry or ask staff for help." }, 503);
  }
}
