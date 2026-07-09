"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import type { CoachDemoData, ImportRosterRow, PaymentStatus } from "./types";

const PAYMENT_STATUSES = new Set<PaymentStatus>(["paid", "partial", "overdue", "comped"]);

function pathFor(demoSlug: string) {
  return `/coaches/${demoSlug}`;
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function money(formData: FormData, key: string): number {
  const raw = text(formData, key);
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function paymentStatus(raw: string): PaymentStatus {
  return PAYMENT_STATUSES.has(raw as PaymentStatus) ? (raw as PaymentStatus) : "overdue";
}

export async function getCoachDemoData(demoSlug: string): Promise<CoachDemoData | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const timeout = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), 6000);
  });

  const result = await Promise.race([
    supabase.rpc("get_coach_ops_demo", {
      p_demo_slug: demoSlug,
    }),
    timeout,
  ]);

  if (result === null) return null;

  const { data, error } = result;

  if (error) {
    console.error("get_coach_ops_demo failed", error.message);
    return null;
  }

  return data as CoachDemoData | null;
}

export async function upsertCoachPlayerPayment(
  demoSlug: string,
  formData: FormData,
): Promise<void> {
  const supabase = await createServerSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const playerId = text(formData, "playerId") || null;
  const fullName = text(formData, "fullName");
  const monthlyDue = money(formData, "monthlyDue");
  const amountPaid = money(formData, "amountPaid");

  const { error } = await supabase.rpc("upsert_coach_player_payment", {
    p_demo_slug: demoSlug,
    p_player_id: playerId,
    p_full_name: fullName,
    p_position: text(formData, "position") || null,
    p_jersey_number: text(formData, "jerseyNumber") || null,
    p_player_notes: text(formData, "playerNotes") || null,
    p_period_label: text(formData, "periodLabel") || "Current month",
    p_monthly_due: monthlyDue,
    p_amount_paid: amountPaid,
    p_payment_status: paymentStatus(text(formData, "paymentStatus")),
    p_payment_notes: text(formData, "paymentNotes") || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(pathFor(demoSlug));
}

export async function importRosterPayments(
  demoSlug: string,
  formData: FormData,
): Promise<void> {
  const supabase = await createServerSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const raw = text(formData, "rowsJson");
  const rows = JSON.parse(raw || "[]") as ImportRosterRow[];
  const cleaned = rows
    .filter((row) => String(row.playerName ?? "").trim())
    .slice(0, 250)
    .map((row) => ({
      playerName: String(row.playerName ?? "").trim(),
      periodLabel: String(row.periodLabel ?? "Current month").trim(),
      monthlyDue: Number(row.monthlyDue ?? 0),
      amountPaid: Number(row.amountPaid ?? 0),
      balance: Number(row.balance ?? 0),
      status: String(row.status ?? "").trim().toLowerCase(),
      position: String(row.position ?? "").trim(),
      jerseyNumber: String(row.jerseyNumber ?? "").trim(),
      notes: String(row.notes ?? "").trim(),
      paymentNotes: String(row.paymentNotes ?? "").trim(),
    }));

  const { error } = await supabase.rpc("import_coach_roster_payments", {
    p_demo_slug: demoSlug,
    p_rows: cleaned,
  });

  if (error) throw new Error(error.message);
  revalidatePath(pathFor(demoSlug));
}

export async function setCoachAttendanceStatus(
  demoSlug: string,
  sessionId: string,
  playerId: string,
  status: string,
): Promise<void> {
  const supabase = await createServerSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.rpc("set_coach_attendance_status", {
    p_demo_slug: demoSlug,
    p_session_id: sessionId,
    p_player_id: playerId,
    p_status: status,
  });

  if (error) throw new Error(error.message);
  revalidatePath(pathFor(demoSlug));
}

export async function addCoachPlayerNote(
  demoSlug: string,
  playerId: string,
  formData: FormData,
): Promise<void> {
  const supabase = await createServerSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.rpc("add_coach_player_note", {
    p_demo_slug: demoSlug,
    p_player_id: playerId,
    p_category: text(formData, "category") || "coach note",
    p_note: text(formData, "note"),
  });

  if (error) throw new Error(error.message);
  revalidatePath(pathFor(demoSlug));
}
