import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getAllowedAdminEmails() {
  return new Set(
    (process.env.INTERNAL_ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function requireInternalAdmin() {
  const supabase = await createSupabaseServerClient();
  const allowedEmails = getAllowedAdminEmails();

  if (!supabase || allowedEmails.size === 0) {
    redirect("/");
  }

  const { data, error } = await supabase.auth.getUser();
  const email = data.user?.email?.trim().toLowerCase();

  if (error || !email || !allowedEmails.has(email)) {
    redirect("/");
  }
}
