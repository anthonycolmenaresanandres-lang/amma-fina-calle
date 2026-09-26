import "server-only";
import { createHash, createHmac } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { MuffinReceipt } from "./contracts";

export const CAMPAIGN = "bodega-muffin-v1";
export const GUEST_COOKIE = "bodega_guest_v1";
export const ROUND_COOKIE = "bodega_round_v1";
export const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/api/bodega/rewards", maxAge: 60 * 60 * 24 * 365 };
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const validSecret = (value?: string) => value && /^[a-f0-9]{64}$/.test(value) ? value : null;
// Distinct recovery capability: exposing a claim does not reveal the session cookie.
export const claimCode = (secret: string) => createHmac("sha256", secret).update("bodega-muffin-claim-v1").digest("hex").slice(0, 32);

export type CampaignDetails = { enabled: boolean; dailyLimit: number; startsAt?: string; endsAt?: string };

export async function campaignDetails(): Promise<CampaignDetails> {
  if (process.env.BODEGA_REWARDS_ENABLED !== "true") return { enabled: false, dailyLimit: 5 };
  try {
    const { data, error } = await getSupabaseAdmin().from("bodega_reward_campaigns")
      .select("active,daily_limit,starts_at,ends_at").eq("id", CAMPAIGN).maybeSingle();
    const now = Date.now();
    const enabled = !error && data?.active === true && data.daily_limit > 0
      && typeof data.starts_at === "string" && Date.parse(data.starts_at) <= now
      && typeof data.ends_at === "string" && Date.parse(data.ends_at) > now;
    return {
      enabled,
      dailyLimit: typeof data?.daily_limit === "number" ? data.daily_limit : 5,
      ...(typeof data?.starts_at === "string" ? { startsAt: data.starts_at } : {}),
      ...(typeof data?.ends_at === "string" ? { endsAt: data.ends_at } : {}),
    };
  } catch { return { enabled: false, dailyLimit: 5 }; }
}

export async function campaignEnabled(): Promise<boolean> {
  return (await campaignDetails()).enabled;
}

export async function receiptFor(secret: string): Promise<MuffinReceipt | undefined> {
  const code = claimCode(secret);
  const { data, error } = await getSupabaseAdmin().from("bodega_reward_claims")
    .select("expires_at,redeemed_at").eq("token_hash", hashToken(code)).maybeSingle();
  if (error) throw new Error("Receipt unavailable");
  if (!data) return undefined;
  return { code, expiresAt: data.expires_at, status: data.redeemed_at ? "redeemed" : Date.parse(data.expires_at) <= Date.now() ? "expired" : "valid" };
}
