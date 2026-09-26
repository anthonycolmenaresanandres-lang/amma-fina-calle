import { NextRequest, NextResponse } from "next/server";
import { getOwnerContext } from "@/lib/owner/auth";
import { isSafeRestaurantId } from "@/lib/owner/app-manifest";
import { syncSquareCatalog } from "@/lib/square/catalog";
import { saveSquareOAuthConnection } from "@/lib/square/connection";
import { getSquareAppConfig } from "@/lib/square/config";
import { fetchSquareMerchantContext, obtainSquareOAuthToken } from "@/lib/square/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OAuthState = { state: string; restaurantId: string; returnTo: string; expiresAt: number };

function readState(value?: string): OAuthState | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as OAuthState;
    if (!parsed.state || !isSafeRestaurantId(parsed.restaurantId) || !parsed.returnTo.startsWith("/owner/") || parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function redirect(request: NextRequest, state: OAuthState, status: string) {
  const destination = new URL(state.returnTo, request.url);
  destination.searchParams.set("square", status);
  const response = NextResponse.redirect(destination, 303);
  response.cookies.set("fc_square_oauth_state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/api/integrations/square/callback",
  });
  return response;
}

export async function GET(request: NextRequest) {
  const state = readState(request.cookies.get("fc_square_oauth_state")?.value);
  if (!state) return NextResponse.json({ ok: false, message: "Square authorization state expired." }, { status: 400 });
  if (request.nextUrl.searchParams.get("state") !== state.state) return redirect(request, state, "state_error");
  if (request.nextUrl.searchParams.get("error")) return redirect(request, state, "denied");

  const owner = await getOwnerContext(state.restaurantId);
  if (owner.state !== "authorized") return redirect(request, state, "auth_required");
  const code = request.nextUrl.searchParams.get("code")?.trim();
  const config = getSquareAppConfig();
  if (!code || !config) return redirect(request, state, "config_missing");

  try {
    const token = await obtainSquareOAuthToken(config, code);
    const merchant = await fetchSquareMerchantContext(config, token.access_token, token.merchant_id);
    await saveSquareOAuthConnection(state.restaurantId, token, merchant);
    try {
      const sync = await syncSquareCatalog(state.restaurantId, { trigger: "oauth" });
      return redirect(request, state, sync.skipped ? "connected_sync_pending" : "connected");
    } catch {
      return redirect(request, state, "connected_sync_error");
    }
  } catch {
    return redirect(request, state, "connect_error");
  }
}
