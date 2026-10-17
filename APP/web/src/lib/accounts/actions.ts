"use server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/admin/auth";
import { QUEUE_UUID } from "@/lib/owner/queue/client";
import { parseSnapshot, TENANT_ID } from "./import";

type Result = { ok: true; id?: string; digest?: string; message: string } | { ok: false; message: string };
const enabled = () => process.env.ACCOUNT_STAGING_ENABLED === "true";
async function call(name: string, args: Record<string, unknown>, manager: boolean): Promise<Result> {
  if (!enabled()) return { ok: false, message: "Account staging is not released yet." };
  try {
    if (manager) { const admin = await getAdminContext(); if (admin.state !== "authorized" || !admin.canManageTeam) return { ok: false, message: "An account manager must sign in." }; }
    const client = await createServerSupabase();
    if (!client || !(await client.auth.getUser()).data.user) return { ok: false, message: "Sign in with your verified account." };
    const result = await client.rpc(name, args);
    if (result.error) return { ok: false, message: "The action was not confirmed. Refresh this preview and check the owner association before retrying." };
    if (typeof result.data === "string") {
      const messages: Record<string, string> = { staged_pending_release: "Menu staged privately. Publication is still pending.", approved_for_private_staging: "This exact menu is approved for private staging.", owner_accepted_private_staging_only: "Owner association accepted for private staging." };
      return messages[result.data] ? { ok: true, message: messages[result.data] } : { ok: false, message: "The expected result was not confirmed. Refresh before retrying." };
    }
    if (!result.data || !QUEUE_UUID.test(result.data.id)) return { ok: false, message: "Receipt could not be confirmed. Keep the draft and retry with the same key." };
    return { ok: true, id: result.data.id, digest: result.data.digest, message: name === "create_account_candidate_v1" ? "Account draft saved privately. Owner acceptance is pending." : "Menu preview saved. The associated owner must review this exact version." };
  } catch { return { ok: false, message: "Receipt could not be confirmed. Keep the draft and retry with the same key." }; }
}
export async function createAccountCandidate(input: { key: string; tenant: string; businessName: string; location: string; ownerEmail: string; source: string }): Promise<Result> {
  if (!enabled()) return { ok: false, message: "Account staging is not released yet." };
  if (!input || typeof input !== "object" || ![input.key,input.tenant,input.businessName,input.location,input.ownerEmail,input.source].every(v => typeof v === "string") || !QUEUE_UUID.test(input.key) || !TENANT_ID.test(input.tenant) || input.tenant.length > 80 || !input.businessName.trim() || input.businessName.length > 120 || !input.location.trim() || input.location.length > 240 || input.ownerEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.ownerEmail) || !["manual-json-v1", "bodega-static-v1"].includes(input.source)) return { ok: false, message: "Check the business, location, verified owner email and supported source." };
  return call("create_account_candidate_v1", { p_key: input.key, p_tenant: input.tenant, p_business: input.businessName, p_location: input.location, p_owner_email: input.ownerEmail, p_source: input.source }, true);
}
export async function prepareAccountMenu(id: string, key: string, revision: number, json: string): Promise<Result> {
  if (!QUEUE_UUID.test(id) || !QUEUE_UUID.test(key) || !Number.isSafeInteger(revision) || revision < 0 || typeof json !== "string" || json.length > 256000) return { ok: false, message: "Refresh the account and choose a bounded menu snapshot." };
  if (!enabled()) return { ok: false, message: "Account staging is not released yet." };
  try {
    const admin = await getAdminContext();
    if (admin.state !== "authorized" || !admin.canManageTeam) return { ok: false, message: "An account manager must sign in." };
    const client = await createServerSupabase();
    if (!client) return { ok: false, message: "Account staging is unavailable." };
    const current = await client.rpc("get_account_candidate_v1", { p_id: id });
    if (current.error || !current.data?.tenant) return { ok: false, message: "This account draft is unavailable." };
    const snapshot = parseSnapshot(json, current.data.tenant);
    return call("prepare_account_menu_v1", { p_id: id, p_key: key, p_expected_revision: revision, p_snapshot: snapshot }, true);
  } catch { return { ok: false, message: "Check the menu template, source IDs and account revision. Preview again." }; }
}
export async function acceptAccountCandidate(id: string, confirmed: boolean): Promise<Result> {
  if (!QUEUE_UUID.test(id) || confirmed !== true) return { ok: false, message: "Review the business and confirm your owner association." };
  return call("accept_account_candidate_v1", { p_id: id, p_confirmed: true }, false);
}
export async function approveAccountMenu(id: string, digest: string, confirmed: boolean): Promise<Result> {
  if (!QUEUE_UUID.test(id) || !/^[a-f0-9]{64}$/.test(digest) || confirmed !== true) return { ok: false, message: "Review and confirm this exact menu preview." };
  return call("approve_account_menu_v1", { p_plan: id, p_digest: digest, p_confirmed: true }, false);
}
export async function stageAccountMenu(id: string, digest: string): Promise<Result> {
  if (!QUEUE_UUID.test(id) || !/^[a-f0-9]{64}$/.test(digest)) return { ok: false, message: "Refresh the approved preview." };
  return call("stage_account_menu_v1", { p_plan: id, p_digest: digest }, true);
}
