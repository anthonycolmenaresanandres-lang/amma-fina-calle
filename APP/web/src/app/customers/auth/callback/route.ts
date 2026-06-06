import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// Admin magic-link landing: exchanges the one-time code for a session cookie,
// then returns to the customer registry.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const supabase = await createServerSupabase();
  if (supabase && code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/customers", requestUrl.origin));
}
