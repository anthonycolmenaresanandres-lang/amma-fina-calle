import { NextRequest, NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/bodega-rewards/http";
import { getOwnerContext } from "@/lib/owner/auth";
import { isSafeRestaurantId } from "@/lib/owner/app-manifest";
import { syncSquareCatalog } from "@/lib/square/catalog";

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
  try {
    const result = await syncSquareCatalog(restaurantId, { trigger: "manual" });
    return NextResponse.redirect(new URL(`${returnPath(restaurantId)}?square=${result.skipped ? "sync_busy" : "synced"}`, request.url), 303);
  } catch {
    return NextResponse.redirect(new URL(`${returnPath(restaurantId)}?square=sync_error`, request.url), 303);
  }
}
