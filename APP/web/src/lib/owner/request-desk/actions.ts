"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { getOwnerContext } from "@/lib/owner/auth";
import { applyOwnerChange } from "@/lib/owner/rail";
import { sendChangeRequestEmail } from "@/lib/requests/intake";
import { readOwnerMenu } from "./menu";
import { triageRequest } from "./triage";

const MAX_LEN = 400;

/** What the client renders for an apply preview — display strings only, never authority. */
export type DeskProposalView = {
  entityLabel: string;
  fieldLabel: string;
  currentDisplay: string;
  newDisplay: string;
};

export type DeskTriageState =
  | { phase: "idle" }
  | { phase: "apply"; text: string; proposal: DeskProposalView }
  | { phase: "review"; text: string; reason: string }
  | { phase: "error"; message: string };

export type DeskResultState =
  | { phase: "idle" }
  | { phase: "applied"; message: string }
  | { phase: "sent"; message: string; referenceId: string }
  | { phase: "error"; message: string };

function readText(formData: FormData): string {
  return String(formData.get("text") ?? "").trim().slice(0, MAX_LEN);
}

async function requireOwner(restaurantId: string): Promise<{ email: string }> {
  const ctx = await getOwnerContext(restaurantId);
  if (ctx.state !== "authorized") {
    throw new Error("Not authorized for this restaurant.");
  }
  return { email: ctx.email };
}

function revalidateOwner(restaurantId: string) {
  revalidatePath(`/owner/${restaurantId}`);
  revalidatePath(`/m/${restaurantId}`);
}

/**
 * Step 1 — classify the request. NEVER writes. Returns an apply-preview or a
 * review prompt. Runs in the owner's authenticated session.
 */
export async function triageOwnerRequest(
  restaurantId: string,
  _prev: DeskTriageState,
  formData: FormData,
): Promise<DeskTriageState> {
  const text = readText(formData);
  if (!text) return { phase: "error", message: "Type what you’d like to change." };

  try {
    await requireOwner(restaurantId);
    const supabase = await createServerSupabase();
    if (!supabase) return { phase: "error", message: "Editing isn’t configured yet." };

    const snapshot = await readOwnerMenu(supabase, restaurantId);
    const result = triageRequest(text, snapshot);

    if (result.decision === "apply") {
      const p = result.proposal;
      return {
        phase: "apply",
        text,
        proposal: {
          entityLabel: p.entityLabel,
          fieldLabel: p.fieldLabel,
          currentDisplay: p.currentDisplay,
          newDisplay: p.newDisplay,
        },
      };
    }
    return { phase: "review", text, reason: result.review.reason };
  } catch (error) {
    return { phase: "error", message: error instanceof Error ? error.message : "Something went wrong." };
  }
}

/**
 * Step 2a — apply a confirmed change. Re-derives the proposal from the original
 * text against fresh data (never trusts a client-supplied target), then routes
 * the write through the EXISTING audited rail (apply_owner_change).
 */
export async function confirmOwnerRequest(
  restaurantId: string,
  _prev: DeskResultState,
  formData: FormData,
): Promise<DeskResultState> {
  const text = readText(formData);
  if (!text) return { phase: "error", message: "Nothing to apply." };

  try {
    await requireOwner(restaurantId);
    const supabase = await createServerSupabase();
    if (!supabase) return { phase: "error", message: "Editing isn’t configured yet." };

    const snapshot = await readOwnerMenu(supabase, restaurantId);
    const result = triageRequest(text, snapshot);
    if (result.decision !== "apply") {
      return {
        phase: "error",
        message: "This can’t be applied automatically anymore — send it to the AMMA team instead.",
      };
    }

    const p = result.proposal;
    await applyOwnerChange({
      restaurantId,
      table: p.table,
      rowId: p.rowId,
      field: p.field,
      newValue: p.newValue,
    });
    revalidateOwner(restaurantId);
    return { phase: "applied", message: `Updated ${p.entityLabel} ${p.fieldLabel} to ${p.newDisplay}.` };
  } catch (error) {
    return { phase: "error", message: error instanceof Error ? error.message : "Couldn’t apply the change." };
  }
}

/**
 * Step 2b — escalate to the AMMA team. Records the request through the EXISTING
 * submit_change_request RPC (linked to this restaurant so the owner can see it)
 * and best-effort emails the team. Never throws into the response.
 */
export async function sendOwnerReview(
  restaurantId: string,
  _prev: DeskResultState,
  formData: FormData,
): Promise<DeskResultState> {
  const text = readText(formData);
  if (!text) return { phase: "error", message: "Nothing to send." };

  try {
    const { email } = await requireOwner(restaurantId);
    const supabase = await createServerSupabase();
    if (!supabase) return { phase: "error", message: "Requests aren’t configured yet." };

    const snapshot = await readOwnerMenu(supabase, restaurantId);
    const result = triageRequest(text, snapshot);
    const review =
      result.decision === "review"
        ? result.review
        : { reason: "Owner change request.", requestType: "Question for AMMA" as const, priority: "Normal" as const };

    const referenceId = `AMMA-${Date.now().toString(36).toUpperCase()}`;
    const message = `[AI Request Desk] ${review.reason}\n\nOwner typed: "${text}"`;
    const sourcePage = `/owner/${restaurantId}`;

    const { error } = await supabase.rpc("submit_change_request", {
      p_business_name: snapshot.businessName,
      p_contact_name: email,
      p_contact_info: email,
      p_request_type: review.requestType,
      p_priority: review.priority,
      p_message: message,
      p_source_page: sourcePage,
      p_reference_id: referenceId,
      p_restaurant_id: restaurantId,
    });
    if (error) return { phase: "error", message: "Couldn’t save the request. Please try again." };

    // Best-effort notification — a missing email config never fails the request.
    await sendChangeRequestEmail({
      businessName: snapshot.businessName,
      contactName: email,
      contactInfo: email,
      requestType: review.requestType,
      priority: review.priority,
      message,
      sourcePage,
      referenceId,
      filesReceived: 0,
    });

    return { phase: "sent", message: "Sent to the AMMA team. They’ll follow up.", referenceId };
  } catch (error) {
    return { phase: "error", message: error instanceof Error ? error.message : "Couldn’t send the request." };
  }
}
