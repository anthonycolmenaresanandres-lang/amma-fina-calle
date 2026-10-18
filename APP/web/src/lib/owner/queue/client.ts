/** No authority is inferred from a brief. The database owns identity and policy. */
export type QueueClient = {
  rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: unknown }>;
};
export type QueueReceipt = { id: string; referenceId: string; status: string };
export type QueueResult = { ok: true; receipt: QueueReceipt } | { ok: false; message: string };
export const QUEUE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function ownerQueueEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.OWNER_REQUEST_QUEUE_ENABLED === "true" && queueTenants(env).length > 0;
}
function queueTenants(env: Record<string,string|undefined>): string[] {
  const tenants = (env.OWNER_REQUEST_QUEUE_TENANTS ?? "").split(",").map(value => value.trim());
  return tenants.length <= 20 && tenants.every(value => value.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) ? tenants : [];
}
export function ownerQueueEnabledForTenant(restaurantId: string, env: Record<string,string|undefined> = process.env): boolean {
  return ownerQueueEnabled(env) && queueTenants(env).includes(restaurantId);
}
export type StructuredQueueInput = {
  restaurantId: string; clientKey: string; changeType: "availability" | "display_order" | "name_typo";
  itemId: string; expectedVersion: number; afterValue: boolean | number | string; brief: string; confirmed: true;
};
export function validateStructuredQueueInput(input: StructuredQueueInput): StructuredQueueInput {
  if (!input || typeof input !== "object" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.restaurantId) || input.restaurantId.length > 80 ||
      !QUEUE_UUID.test(input.itemId) || !QUEUE_UUID.test(input.clientKey) || input.confirmed !== true ||
      !Number.isSafeInteger(input.expectedVersion) || input.expectedVersion < 0 || typeof input.brief !== "string" || !input.brief.trim() || input.brief.length > 4000) {
    throw new Error("Review and confirm one valid item request.");
  }
  if (input.changeType === "availability" ? typeof input.afterValue !== "boolean"
    : input.changeType === "display_order" ? typeof input.afterValue !== "number" || !Number.isInteger(input.afterValue) || input.afterValue < 0 || input.afterValue > 10000
      : input.changeType === "name_typo" ? typeof input.afterValue !== "string" || !input.afterValue.trim() || input.afterValue.length > 120
        : true) throw new Error("This change needs a separate reviewed request.");
  return { ...input, brief: input.brief.trim() };
}
async function submit(client: QueueClient, args: Record<string, unknown>): Promise<QueueResult> {
  try {
    const result = await client.rpc("submit_owner_request_v1", args);
    const row = result.data as { id?: unknown; reference_id?: unknown; status?: unknown } | null;
    if (result.error || !row || typeof row.id !== "string" || !QUEUE_UUID.test(row.id) ||
        typeof row.reference_id !== "string" || !/^AMMA-[A-Z0-9]+-[A-F0-9]{8}$/.test(row.reference_id) ||
        typeof row.status !== "string") return { ok: false, message: "The queue could not confirm receipt. Keep your draft and retry with the same request." };
    return { ok: true, receipt: { id: row.id, referenceId: row.reference_id, status: row.status } };
  } catch {
    return { ok: false, message: "The queue could not confirm receipt. Keep your draft and retry with the same request." };
  }
}
export async function submitOwnerReviewToQueue(client: QueueClient, input: { restaurantId: string; clientKey: string; brief: string }, env: Record<string, string | undefined> = process.env): Promise<QueueResult> {
  if (!ownerQueueEnabledForTenant(input?.restaurantId,env)) return { ok: false, message: "The request queue is disabled." };
  if (!QUEUE_UUID.test(input.clientKey) || !input.brief.trim() || input.brief.length > 4000) return { ok: false, message: "Review the request again before sending." };
  return submit(client, { p_restaurant_id: input.restaurantId, p_client_key: input.clientKey, p_change_type: "review", p_item_id: null, p_expected_version: null, p_after_value: null, p_brief: input.brief.trim(), p_confirmed: true });
}
export async function submitStructuredQueueRequest(client: QueueClient, input: StructuredQueueInput, env: Record<string, string | undefined> = process.env): Promise<QueueResult> {
  if (!ownerQueueEnabledForTenant(input?.restaurantId,env)) return { ok: false, message: "The request queue is disabled." };
  let value: StructuredQueueInput;
  try { value = validateStructuredQueueInput(input); } catch { return { ok: false, message: "Review and confirm one valid item request." }; }
  return submit(client, { p_restaurant_id: value.restaurantId, p_client_key: value.clientKey, p_change_type: value.changeType, p_item_id: value.itemId, p_expected_version: value.expectedVersion, p_after_value: value.afterValue, p_brief: value.brief, p_confirmed: true });
}
