import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";

export type TeamMember = {
  id: string;
  email: string;
  displayName: string;
  jobTitle: string;
  isActive: boolean;
  canManageTeam: boolean;
  createdAt: string;
  updatedAt: string;
};

type TeamMemberRow = {
  id: string;
  email: string;
  display_name: string | null;
  job_title: string | null;
  is_active: boolean;
  can_manage_team: boolean;
  created_at: string;
  updated_at: string;
};

export async function getTeamRoster(): Promise<TeamMember[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_team_roster");
  if (error || !data) return [];
  return (data as TeamMemberRow[]).map((member) => ({
    id: member.id,
    email: member.email,
    displayName: member.display_name ?? "",
    jobTitle: member.job_title ?? "Team Member",
    isActive: member.is_active,
    canManageTeam: member.can_manage_team,
    createdAt: member.created_at,
    updatedAt: member.updated_at,
  }));
}
