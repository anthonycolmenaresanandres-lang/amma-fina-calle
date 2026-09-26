export type MuffinReceipt = { code: string; status: "valid" | "redeemed" | "expired"; expiresAt: string };
import type { CafeRushSpawn } from "@/caferush/types";
export type RewardCampaignSession = { id: string; seed: number; plans: CafeRushSpawn[][]; expiresAt: string };
export type RewardSnapshot = { enabled: boolean; receipt?: MuffinReceipt; campaign?: RewardCampaignSession; message?: string };
export function normalizeClaimCode(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 80) return null;
  const code = value.replace(/[\s-]/g, "").toLowerCase();
  return /^[a-f0-9]{32}$/.test(code) ? code : null;
}
export function displayClaimCode(code: string): string { return code.match(/.{1,8}/g)?.join("-").toUpperCase() ?? code; }
