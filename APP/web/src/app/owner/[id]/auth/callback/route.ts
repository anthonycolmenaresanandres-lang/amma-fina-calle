import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// Magic-link landing: exchanges the one-time code for a session cookie, then
// returns the owner to their dashboard.
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const supabase = await createServerSupabase();
  if (supabase && code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(`/owner/${id}`, requestUrl.origin));
}
