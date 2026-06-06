"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import { MENU_IMAGE_BUCKET } from "@/lib/supabase/config";
import { getOwnerContext } from "./auth";
import { applyOwnerChange } from "./rail";

export type ActionState = { ok: boolean; message: string };

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

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
      emailRedirectTo: `${origin}/owner/${restaurantId}/auth/callback`,
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

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image to upload.");
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Image must be JPEG, PNG, or WebP.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 4MB or smaller.");
  }

  const supabase = await createServerSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${restaurantId}/${itemId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(MENU_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });
  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from(MENU_IMAGE_BUCKET).getPublicUrl(path);

  await applyOwnerChange({
    restaurantId,
    table: "menu_items",
    rowId: itemId,
    field: "photo_url",
    newValue: publicUrl,
  });
  revalidateOwner(restaurantId);
}
