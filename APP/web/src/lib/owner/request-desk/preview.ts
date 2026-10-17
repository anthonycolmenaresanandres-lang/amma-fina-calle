import { createHash } from "node:crypto";
import type { ChangeProposal, MenuSnapshot } from "./triage";

/** Optimistic freshness check, NOT a signature, permission, or atomic DB lock.
 * Bind the confirmation to the owner, tenant, text, target and raw target data.
 * The server must still re-authorize, re-read, and re-derive the proposal.
 */
export function ownerPreviewFingerprint(
  email: string, text: string, snapshot: MenuSnapshot, proposal: ChangeProposal,
): string {
  const target = proposal.table === "menu_items"
    ? snapshot.items.find(row => row.id === proposal.rowId)
    : proposal.table === "menu_categories"
      ? snapshot.categories.find(row => row.id === proposal.rowId)
      : snapshot.hours.find(row => row.id === proposal.rowId);
  if (!target) throw new Error("Preview target is no longer available.");
  return createHash("sha256").update(JSON.stringify([
    1, email.toLowerCase(), snapshot.restaurantId, text.trim(), proposal, target,
  ])).digest("hex");
}

export function isOwnerPreviewCurrent(expected: unknown, current: string): boolean {
  return typeof expected === "string" && /^[a-f0-9]{64}$/.test(expected) && expected === current;
}
