import { QUEUE_UUID } from "./client";
export const REQUEST_STATUS = {
  queued: "Received", needs_review: "Needs review", ready: "Approved for a bounded change", conflict: "Item changed · review needed",
  awaiting_verification: "Checking the guest menu", awaiting_owner_ack: "Ready for your confirmation", completed: "Completed and confirmed", completion_conflict: "Item changed after verification",
  rejected: "Not approved", rollback_requested: "Rollback requested", rollback_conflict: "Rollback needs review", rolled_back_pending_verification: "Checking the restored menu", rolled_back: "Previous value restored",
} as const;
export type RequestSummary = { id: string; restaurant_id: string; status: keyof typeof REQUEST_STATUS; change_type: string; created_at: string; reference_id: string };
export type RequestProgress = RequestSummary & { item_id: string | null; item_name: string | null; before: boolean | string | number | null; after: boolean | string | number | null; owner_acknowledged_at: string | null; events: { type: string; at: string }[]; delivery: { status: "pending" | "leased" | "retry_wait" | "sent" | "dead_letter"; attempt: number; next_attempt_at: string }[] };
const validDate = (v: unknown): v is string => typeof v === "string" && Number.isFinite(Date.parse(v));
export function readRequestSummary(value: unknown, tenant: string): RequestSummary | null {
  if (!value || typeof value !== "object") return null;
  const row = value as RequestSummary;
  return typeof row.id === "string" && QUEUE_UUID.test(row.id) && row.restaurant_id === tenant && Object.hasOwn(REQUEST_STATUS, row.status) && ["availability", "display_order", "name_typo", "review"].includes(row.change_type) && validDate(row.created_at) && /^AMMA-[A-Z0-9]+-[A-F0-9]{8}$/.test(row.reference_id) ? { id: row.id, restaurant_id: tenant, status: row.status, change_type: row.change_type, created_at: row.created_at, reference_id: row.reference_id } : null;
}
export function readRequestProgress(value: unknown, tenant: string): RequestProgress | null {
  const base = readRequestSummary(value, tenant); if (!base) return null;
  const row = value as RequestProgress;
  if (row.item_id !== null && (typeof row.item_id !== "string" || !QUEUE_UUID.test(row.item_id)) || row.item_name !== null && (typeof row.item_name !== "string" || row.item_name.length > 120)) return null;
  if (![row.before, row.after].every(v => v === null || typeof v === "boolean" || typeof v === "number" && Number.isFinite(v) || typeof v === "string" && v.length <= 120) || row.owner_acknowledged_at !== null && !validDate(row.owner_acknowledged_at) || !Array.isArray(row.events) || row.events.length > 200 || !row.events.every(e => e && /^[a-z_]{1,64}$/.test(e.type) && validDate(e.at)) || !Array.isArray(row.delivery) || row.delivery.length > 200 || !row.delivery.every(d => d && ["pending", "leased", "retry_wait", "sent", "dead_letter"].includes(d.status) && Number.isInteger(d.attempt) && d.attempt >= 0 && d.attempt <= 6 && validDate(d.next_attempt_at))) return null;
  return { ...base, item_id: row.item_id, item_name: row.item_name, before: row.before, after: row.after, owner_acknowledged_at: row.owner_acknowledged_at, events: row.events.map(e => ({ type: e.type, at: e.at })), delivery: row.delivery.map(d => ({ status: d.status, attempt: d.attempt, next_attempt_at: d.next_attempt_at })) };
}
export function requestEventLabel(type: string): string {
  if (Object.hasOwn(REQUEST_STATUS, type)) return REQUEST_STATUS[type as keyof typeof REQUEST_STATUS];
  return ({ received: "Request saved", approved: "Change approved", confirm: "Owner confirmed the result", rollback: "Owner requested the previous value" } as Record<string,string>)[type] ?? type.replaceAll("_", " ");
}
export const canConfirmRequest = (r: RequestProgress) => !r.owner_acknowledged_at && ["awaiting_owner_ack", "rolled_back"].includes(r.status);
export const canRequestRollback = (r: RequestProgress) => ["awaiting_verification", "awaiting_owner_ack", "completed", "completion_conflict"].includes(r.status);
export function requestValue(type: string, value: RequestProgress["before"]): string {
  if (value === null) return "Separate review required";
  return type === "availability" && typeof value === "boolean" ? value ? "Available" : "Sold out" : type === "display_order" ? `Position ${value}` : String(value);
}
