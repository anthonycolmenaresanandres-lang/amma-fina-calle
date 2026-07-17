import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import type { PaymentNotice, PaymentNoticeStatus, ZelleInstructions } from "./types";

type NoticeRow = {
  id: string;
  amount_cents: number;
  currency: string;
  owner_note: string | null;
  reference_id: string;
  status: PaymentNoticeStatus;
  reported_at: string;
  reviewed_at: string | null;
};

function safeHttpsUrl(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function getZelleInstructions(): ZelleInstructions {
  const recipientName = process.env.ZELLE_RECIPIENT_NAME?.trim() || null;
  const recipientHandle = process.env.ZELLE_RECIPIENT_HANDLE?.trim() || null;
  return {
    configured: Boolean(recipientName && recipientHandle),
    recipientName,
    recipientHandle,
    qrImageUrl: safeHttpsUrl(process.env.ZELLE_QR_IMAGE_URL),
  };
}

export async function getOwnerPaymentNotices(
  restaurantId: string,
): Promise<PaymentNotice[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_owner_payment_notices", {
    p_restaurant_id: restaurantId,
  });
  if (error || !data) return [];
  return (data as NoticeRow[]).map((row) => ({
    id: row.id,
    amountCents: Number(row.amount_cents),
    currency: row.currency,
    ownerNote: row.owner_note,
    referenceId: row.reference_id,
    status: row.status,
    reportedAt: row.reported_at,
    reviewedAt: row.reviewed_at,
  }));
}
