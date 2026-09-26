import { NextRequest, NextResponse } from "next/server";
import { getOwnerContext } from "@/lib/owner/auth";
import { isSafeRestaurantId } from "@/lib/owner/app-manifest";
import { syncSquareCatalog } from "@/lib/square/catalog";

export const runtime = "nodejs";

function returnPath(restaurantId: string) {
  return restaurantId === "bodega" ? "/owner/bodega/insights" : `/owner/${restaurantId}`;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const restaurantId = String(form.get("restaurant_id") ?? "").trim();
  if (!isSafeRestaurantId(restaurantId)) return NextResponse.json({ ok: false }, { status: 400 });
  const owner = await getOwnerContext(restaurantId);
  if (owner.state !== "authorized") return NextResponse.json({ ok: false }, { status: 403 });

  try {
    const result = await syncSquareCatalog(restaurantId, { trigger: "manual" });
    const status = result.skipped ? "sync_busy" : "synced";
    return NextResponse.redirect(new URL(`${returnPath(restaurantId)}?square=${status}`, request.url), 303);
  } catch {
    return NextResponse.redirect(new URL(`${returnPath(restaurantId)}?square=sync_error`, request.url), 303);
  }
}
