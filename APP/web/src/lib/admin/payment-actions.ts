"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/admin/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export async function reviewPaymentNotice(
  noticeId: string,
  status: "verified" | "rejected",
): Promise<void> {
  const admin = await getAdminContext();
  if (admin.state !== "authorized" || !admin.canManageBilling) return;
  const supabase = await createServerSupabase();
  if (!supabase) return;
  await supabase.rpc("review_payment_notice", {
    p_notice_id: noticeId,
    p_status: status,
  });
  revalidatePath("/customers/payments");
}
