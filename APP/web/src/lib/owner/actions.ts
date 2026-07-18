"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { MENU_IMAGE_BUCKET } from "@/lib/supabase/config";
import { uploadImage } from "@/lib/storage/uploadImage";
import {
  getOwnerContext,
  OWNER_PASSWORD_RESET_REQUIRED,
} from "./auth";
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

export async function signInOwnerWithPassword(
  restaurantId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !email.includes("@") || email.length > 300) {
    return { ok: false, message: "Enter a valid email address." };
  }
  if (password.length < 4 || password.length > 200) {
    return { ok: false, message: "Enter your password (at least 4 characters)." };
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, message: "Owner sign-in is not configured yet." };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    return { ok: false, message: "Email or password is incorrect." };
  }

  const { data: allowed, error: authorizationError } = await supabase.rpc(
    "is_owner_email",
    { p_restaurant_id: restaurantId },
  );
  if (authorizationError || !allowed) {
    await supabase.auth.signOut();
    return { ok: false, message: "Email or password is incorrect." };
  }

  redirect(`/owner/${encodeURIComponent(restaurantId)}`);
}

const COMMON_OWNER_PASSWORDS = new Set([
  "1234",
  "12345678",
  "123456789",
  "password",
  "password1",
  "qwerty123",
  "letmein123",
]);

export async function completeRequiredPasswordReset(
  restaurantId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getOwnerContext(restaurantId);
  if (context.state !== "password_reset_required") {
    return { ok: false, message: "This password setup session is no longer active." };
  }

  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  const normalized = password.toLowerCase();
  const emailName = context.email.split("@", 1)[0]?.toLowerCase() ?? "";

  if (password.length < 4 || password.length > 128) {
    return { ok: false, message: "Choose a password between 4 and 128 characters." };
  }
  if (password !== confirmation) {
    return { ok: false, message: "The two passwords do not match." };
  }
  if (
    COMMON_OWNER_PASSWORDS.has(normalized) ||
    (/^(.)\1+$/.test(password) && password.length >= 4) ||
    (emailName.length >= 4 && normalized.includes(emailName))
  ) {
    return { ok: false, message: "Choose a password that is harder to guess." };
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, message: "Owner password setup is not configured yet." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (
    !user?.email ||
    user.email.toLowerCase() !== context.email.toLowerCase() ||
    user.app_metadata?.[OWNER_PASSWORD_RESET_REQUIRED] !== true
  ) {
    return { ok: false, message: "This password setup session is no longer active." };
  }

  let admin: ReturnType<typeof getSupabaseAdmin>;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return { ok: false, message: "Password setup is temporarily unavailable. Contact AMMA." };
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password });
  if (passwordError) {
    return { ok: false, message: "That password could not be saved. Choose another and retry." };
  }

  const { error: metadataError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...user.app_metadata,
      [OWNER_PASSWORD_RESET_REQUIRED]: false,
      owner_password_reset_completed_at: new Date().toISOString(),
    },
  });
  if (metadataError) {
    return {
      ok: false,
      message: "Your password changed, but setup could not finish. Sign in again and retry.",
    };
  }

  await supabase.auth.refreshSession();
  redirect(`/owner/${encodeURIComponent(restaurantId)}`);
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
