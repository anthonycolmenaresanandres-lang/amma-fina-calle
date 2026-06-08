"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import { MENU_IMAGE_BUCKET } from "@/lib/supabase/config";
import { uploadImage } from "@/lib/storage/uploadImage";
import { getOwnerContext } from "./auth";
import { applyOwnerChange, applyOwnerSizePrice } from "./rail";

export type ActionState = { ok: boolean; message: string };

// --- Magic-link request (no enumeration) ------------------------------------

export async function requestMagicLink(
  restaurantId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  // Same neutral message is returned in every non-validation branch below so a
  // visitor can never tell whether an email is on the allowlist.
  const neutral: ActionState = {
    ok: true,
    message: "If that email is authorized, a sign-in link is on its way. Check your inbox.",
  };

  if (!email || !email.includes("@") || email.length > 300) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, message: "Owner sign-in is not configured yet." };
  }

  const { data: allowed } = await supabase.rpc("is_email_allowed", {
    p_restaurant_id: restaurantId,
    p_email: email,
  });

  if (!allowed) return neutral;

  const headerList = await headers();
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  const host = headerList.get("host");
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`;

  await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      // Destination after the link is verified. The Magic Link email template
      // wraps this as `next` on /auth/confirm (token-hash flow), which completes
      // on any browser/device — see src/app/auth/confirm/route.ts.
      emailRedirectTo: `${origin}/owner/${restaurantId}`,
    },
  });

  return neutral;
}

// --- Structured content edits (all flow through the audited rail) -----------

async function assertOwner(restaurantId: string) {
  const ctx = await getOwnerContext(restaurantId);
  if (ctx.state !== "authorized") {
    throw new Error("Not authorized for this restaurant.");
  }
}

function revalidateOwner(restaurantId: string) {
  revalidatePath(`/owner/${restaurantId}`);
  revalidatePath(`/m/${restaurantId}`);
}

export async function updateItemText(
  restaurantId: string,
  itemId: string,
  field: "name" | "description" | "price",
  formData: FormData,
): Promise<void> {
  await assertOwner(restaurantId);
  const raw = String(formData.get("value") ?? "").trim();

  if (field === "price") {
    const num = Number(raw);
    if (!Number.isFinite(num) || num < 0) throw new Error("Price must be a positive number.");
  }

  await applyOwnerChange({
    restaurantId,
    table: "menu_items",
    rowId: itemId,
    field,
    newValue: raw,
  });
  revalidateOwner(restaurantId);
}

/** Edit the price of ONE size (S/M/L) inside menu_items.sizes via the audited size rail. */
export async function updateItemSizePrice(
  restaurantId: string,
  itemId: string,
  sizeLabel: string,
  formData: FormData,
): Promise<void> {
  await assertOwner(restaurantId);
  const raw = String(formData.get("value") ?? "").trim();
  const num = Number(raw);
  if (!Number.isFinite(num) || num < 0) throw new Error("Price must be a positive number.");

  await applyOwnerSizePrice({
    restaurantId,
    rowId: itemId,
    sizeLabel,
    newValue: raw,
  });
  revalidateOwner(restaurantId);
}

export async function setItemAvailability(
  restaurantId: string,
  itemId: string,
  formData: FormData,
): Promise<void> {
  await assertOwner(restaurantId);
  const next = String(formData.get("value") ?? "false") === "true" ? "true" : "false";
  await applyOwnerChange({
    restaurantId,
    table: "menu_items",
    rowId: itemId,
    field: "is_available",
    newValue: next,
  });
  revalidateOwner(restaurantId);
}

export async function updatePromoText(
  restaurantId: string,
  promoId: string,
  formData: FormData,
): Promise<void> {
  await assertOwner(restaurantId);
  const raw = String(formData.get("value") ?? "").trim();
  await applyOwnerChange({
    restaurantId,
    table: "promos",
    rowId: promoId,
    field: "text",
    newValue: raw,
  });
  revalidateOwner(restaurantId);
}

// --- Validated image upload through Supabase Storage ------------------------

export async function uploadItemImage(
  restaurantId: string,
  itemId: string,
  formData: FormData,
): Promise<void> {
  await assertOwner(restaurantId);

  const { publicUrl } = await uploadImage({
    bucket: MENU_IMAGE_BUCKET,
    keyPrefix: restaurantId,
    name: itemId,
    file: formData.get("image") as File,
  });

  await applyOwnerChange({
    restaurantId,
    table: "menu_items",
    rowId: itemId,
    field: "photo_url",
    newValue: publicUrl,
  });
  revalidateOwner(restaurantId);
}
