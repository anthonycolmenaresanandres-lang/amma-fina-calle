import { NextRequest, NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/bodega-rewards/http";
import { getOwnerContext } from "@/lib/owner/auth";
import { isSafeRestaurantId } from "@/lib/owner/app-manifest";
import { deleteSquareConnection, getSquareConnectionMetadata } from "@/lib/square/connection";
import { getSquareAppConfig } from "@/lib/square/config";
import { revokeSquareMerchantAuthorization } from "@/lib/square/oauth";

export const runtime = "nodejs";
function returnPath(restaurantId: string) {
  return restaurantId === "bodega" ? "/owner/bodega/insights" : `/owner/${restaurantId}`;
}
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  const form = await request.formData();
  const restaurantId = String(form.get("restaurant_id") ?? "").trim();
  if (!isSafeRestaurantId(restaurantId)) return NextResponse.json({ ok: false }, { status: 400 });
  const owner = await getOwnerContext(restaurantId);
  if (owner.state !== "authorized") return NextResponse.json({ ok: false }, { status: 403 });
  const connection = await getSquareConnectionMetadata(restaurantId);
  const config = getSquareAppConfig();
  if (!connection || !config) return NextResponse.redirect(new URL(`${returnPath(restaurantId)}?square=not_connected`, request.url), 303);
  if (connection.environment !== config.environment) return NextResponse.redirect(new URL(`${returnPath(restaurantId)}?square=environment_error`, request.url), 303);
  try {
    await revokeSquareMerchantAuthorization(config, connection.merchantId);
    await deleteSquareConnection(restaurantId, connection.generation);
    return NextResponse.redirect(new URL(`${returnPath(restaurantId)}?square=disconnected`, request.url), 303);
  } catch {
    return NextResponse.redirect(new URL(`${returnPath(restaurantId)}?square=disconnect_error`, request.url), 303);
  }
}
