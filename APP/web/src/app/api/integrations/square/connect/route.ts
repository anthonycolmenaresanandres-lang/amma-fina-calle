import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getOwnerContext } from "@/lib/owner/auth";
import { isSafeRestaurantId } from "@/lib/owner/app-manifest";
import { getSquareAppConfig } from "@/lib/square/config";
import { buildSquareAuthorizationUrl } from "@/lib/square/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function returnPath(restaurantId: string) {
  return restaurantId === "bodega" ? "/owner/bodega/insights" : `/owner/${restaurantId}`;
}

export async function GET(request: NextRequest) {
  const restaurantId = request.nextUrl.searchParams.get("restaurant_id")?.trim() ?? "";
  if (!isSafeRestaurantId(restaurantId)) return NextResponse.json({ ok: false }, { status: 400 });

  const owner = await getOwnerContext(restaurantId);
  if (owner.state !== "authorized") {
    return NextResponse.redirect(new URL(`${returnPath(restaurantId)}?square=auth_required`, request.url), 303);
  }

  const config = getSquareAppConfig();
  if (!config) return NextResponse.redirect(new URL(`${returnPath(restaurantId)}?square=config_missing`, request.url), 303);

  const state = randomBytes(32).toString("base64url");
  const cookiePayload = Buffer.from(JSON.stringify({
    state,
    restaurantId,
    returnTo: returnPath(restaurantId),
    expiresAt: Date.now() + 10 * 60 * 1000,
  })).toString("base64url");

  const response = NextResponse.redirect(buildSquareAuthorizationUrl(config, state), 303);
  response.cookies.set("fc_square_oauth_state", cookiePayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/api/integrations/square/callback",
  });
  return response;
}
