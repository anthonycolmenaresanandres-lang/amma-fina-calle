import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";

// Shared image-upload foundation for the Fina Calle Client OS. Used today by the
// owner menu-photo upload; designed to be reused for brand/logo/banner uploads,
// onboarding assets, and future restaurant setup — by passing a different bucket
// and key prefix. This helper owns ONLY storage mechanics (validate, sanitize,
// upload, public URL). Authorization stays in the calling server action.

export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB

export type UploadImageInput = {
  /** Supabase Storage bucket, e.g. MENU_IMAGE_BUCKET or BRAND_ASSET_BUCKET. */
  bucket: string;
  /** Logical folder prefix, e.g. `${restaurantId}` or `${restaurantId}/brand`. */
  keyPrefix: string;
  /** The uploaded file (already pulled from FormData by the caller). */
  file: File;
  /** Optional base name; sanitized. Defaults to a timestamp. Never trusted raw. */
  name?: string;
};

export type UploadImageResult = { path: string; publicUrl: string };

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/webp": "webp",
  "image/jpeg": "jpg",
};

/**
 * Sanitize a user-supplied base name: lowercase, keep only [a-z0-9._-], collapse
 * separators, trim. The uploaded filename is NEVER used to build the storage key
 * verbatim — only this sanitized form (if a name is provided at all).
 */
export function sanitizeName(input: string): string {
  const dot = input.lastIndexOf(".");
  const base = dot > 0 ? input.slice(0, dot) : input;
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-")
      .replace(/[-.]+/g, "-")
      .replace(/^-+|-+$/g, "") || "upload"
  );
}

/**
 * Validate an image (PNG/WebP/JPEG, ≤4MB), upload it to the given bucket under a
 * sanitized, collision-resistant key, and return its storage path + public URL.
 * Throws on invalid input or when Supabase is not configured.
 */
export async function uploadImage({
  bucket,
  keyPrefix,
  file,
  name,
}: UploadImageInput): Promise<UploadImageResult> {
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

  const stamp = Date.now().toString(36);
  const base = name ? `${sanitizeName(name)}-${stamp}` : stamp;
  const path = `${keyPrefix}/${base}.${EXT_BY_TYPE[file.type]}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return { path, publicUrl };
}
