"use server";

import { revalidatePath } from "next/cache";
import { getOwnerContext } from "@/lib/owner/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { getZelleInstructions } from "@/lib/zelle/data";

export type ZelleActionState = { ok: boolean; message: string };

function parseAmountToCents(raw: string): number | null {
  const normalized = raw.trim();
  if (!/^(?:\d{1,6})(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [dollars, cents = ""] = normalized.split(".");
  const amount = Number(dollars) * 100 + Number(cents.padEnd(2, "0"));
  return Number.isSafeInteger(amount) && amount > 0 && amount <= 10000000
    ? amount
    : null;
}

export async function submitZellePaymentNotice(
  restaurantId: string,
  _previous: ZelleActionState,
  formData: FormData,
): Promise<ZelleActionState> {
  const owner = await getOwnerContext(restaurantId);
  if (owner.state !== "authorized") {
    return { ok: false, message: "Your owner session is not authorized for this account." };
  }
  if (!getZelleInstructions().configured) {
    return { ok: false, message: "AMMA has not activated the verified Zelle recipient yet." };
  }

  const amountCents = parseAmountToCents(String(formData.get("amount") ?? ""));
  const note = String(formData.get("note") ?? "").trim();
  if (amountCents === null) {
    return { ok: false, message: "Enter a valid USD amount up to $100,000." };
  }
  if (note.length > 500) {
    return { ok: false, message: "Keep the optional note under 500 characters." };
  }

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, message: "Payment reporting is not configured yet." };
  const { data, error } = await supabase.rpc("submit_owner_payment_notice", {
    p_restaurant_id: restaurantId,
    p_amount_cents: amountCents,
    p_owner_note: note || null,
  });
  if (error || !data) {
    return { ok: false, message: "The payment report could not be saved. No status changed." };
  }

  revalidatePath(`/owner/${restaurantId}`);
  return {
    ok: true,
    message: `Report ${String(data)} was received. AMMA must verify the bank deposit before it is marked paid.`,
  };
}
