import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import type { PaymentNoticeStatus } from "@/lib/zelle/types";

export type AdminPaymentNotice = {
  id: string;
  restaurantId: string;
  businessName: string;
  amountCents: number;
  currency: string;
  ownerEmail: string;
  ownerNote: string | null;
  referenceId: string;
  status: PaymentNoticeStatus;
  reportedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

type PaymentRow = {
  id: string;
  restaurant_id: string;
  business_name: string;
  amount_cents: number;
  currency: string;
  owner_email: string;
  owner_note: string | null;
  reference_id: string;
  status: PaymentNoticeStatus;
  reported_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export async function getAdminPaymentNotices(): Promise<AdminPaymentNotice[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_admin_payment_notices");
  if (error || !data) return [];
  return (data as PaymentRow[]).map((row) => ({
    id: row.id,
    restaurantId: row.restaurant_id,
    businessName: row.business_name,
    amountCents: Number(row.amount_cents),
    currency: row.currency,
    ownerEmail: row.owner_email,
    ownerNote: row.owner_note,
    referenceId: row.reference_id,
    status: row.status,
    reportedAt: row.reported_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
  }));
}
