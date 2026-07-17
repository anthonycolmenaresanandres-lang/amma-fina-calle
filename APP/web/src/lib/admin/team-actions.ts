"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/admin/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export type TeamActionState = { ok: boolean; message: string };

export async function addTeamMember(
  _previous: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const admin = await getAdminContext();
  if (admin.state !== "authorized" || !admin.canManageTeam) {
    return { ok: false, message: "Only the AMMA owner can authorize employees." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  if (!email || !email.includes("@") || !displayName || !jobTitle) {
    return { ok: false, message: "Name, job title, and a valid email are required." };
  }

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, message: "Team access is not configured yet." };
  const { error } = await supabase.rpc("upsert_team_member", {
    p_email: email,
    p_display_name: displayName,
    p_job_title: jobTitle,
  });
  if (error) return { ok: false, message: "Employee access could not be saved." };

  revalidatePath("/customers/team");
  return {
    ok: true,
    message: `${displayName} is authorized. Have them sign in at /customers with ${email}.`,
  };
}

export async function setTeamMemberStatus(
  email: string,
  active: boolean,
): Promise<void> {
  const admin = await getAdminContext();
  if (admin.state !== "authorized" || !admin.canManageTeam) return;
  const supabase = await createServerSupabase();
  if (!supabase) return;
  await supabase.rpc("set_team_member_active", {
    p_email: email,
    p_active: active,
  });
  revalidatePath("/customers/team");
}
