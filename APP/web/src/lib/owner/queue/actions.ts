"use server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getOwnerContext } from "@/lib/owner/auth";
import { ownerQueueEnabledForTenant, submitStructuredQueueRequest, QUEUE_UUID, type StructuredQueueInput, type QueueResult } from "./client";

/** Prepared endpoint only: no component enables it, no direct writes, gate OFF. */
export async function queueStructuredOwnerRequest(input: StructuredQueueInput): Promise<QueueResult> {
  if (!ownerQueueEnabledForTenant(input?.restaurantId)) return { ok: false, message: "The request queue is disabled." };
  if (!input || typeof input.restaurantId !== "string") return { ok: false, message: "Choose a restaurant." };
  try {
    const owner = await getOwnerContext(input.restaurantId);
    if (owner.state !== "authorized") return { ok: false, message: "Sign in with the authorized owner account." };
    const client = await createServerSupabase();
    if (!client) return { ok: false, message: "Requests are temporarily unavailable." };
    return await submitStructuredQueueRequest(client, input);
  } catch { return { ok: false, message: "Receipt could not be confirmed. Keep your draft and retry." }; }
}

export async function acknowledgeQueuedOwnerRequest(restaurantId: string, requestId: string, action: "confirm" | "rollback"): Promise<{ ok: boolean; message: string }> {
  if (!ownerQueueEnabledForTenant(restaurantId)) return { ok: false, message: "The request queue is disabled." };
  if (!QUEUE_UUID.test(requestId) || !["confirm", "rollback"].includes(action)) return { ok: false, message: "Choose a valid request action." };
  try {
    if ((await getOwnerContext(restaurantId)).state !== "authorized") return { ok: false, message: "Sign in with the authorized owner account." };
    const client = await createServerSupabase();
    if (!client) return { ok: false, message: "Requests are temporarily unavailable." };
    const progress = await client.rpc("get_owner_request_v1", { p_id: requestId });
    if (progress.error || progress.data?.restaurant_id !== restaurantId) return { ok: false, message: "This request is not available for this restaurant." };
    const result = await client.rpc("acknowledge_owner_request_v1", { p_id: requestId, p_action: action });
    if (result.error) return { ok: false, message: "This action could not be confirmed. Refresh the request before retrying." };
    if (result.data === "completion_conflict") return { ok: false, message: "The item changed after verification. Refresh the request for review." };
    if (action === "confirm" ? !["completed", "rolled_back"].includes(String(result.data)) : result.data !== "rollback_requested") {
      return { ok: false, message: "The request did not confirm this transition. Refresh before retrying." };
    }
    return { ok: true, message: action === "rollback" ? "Rollback requested for review and verification." : "Completion acknowledged." };
  } catch { return { ok: false, message: "This action could not be confirmed. Refresh before retrying." }; }
}
