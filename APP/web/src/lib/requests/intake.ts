import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured, REQUEST_UPLOAD_BUCKET } from "@/lib/supabase/config";

export type ChangeRequestPayload = {
  businessName: string;
  contactName: string;
  contactInfo: string;
  requestType: string;
  priority: string;
  message: string;
  sourcePage: string;
  referenceId: string;
  filesReceived: number;
  filesExpected?: number;
};

/**
 * Persist a change request via the security-definer submit_change_request RPC.
 * No-ops (persisted: false) when Supabase is not configured. Never throws —
 * a storage failure must not break the public intake response.
 */
export async function persistChangeRequest(
  payload: ChangeRequestPayload,
): Promise<{ persisted: boolean }> {
  if (!isSupabaseConfigured) return { persisted: false };

  try {
    const supabase = await createServerSupabase();
    if (!supabase) return { persisted: false };

    const { error } = await supabase.rpc("submit_change_request", {
      p_business_name: payload.businessName,
      p_contact_name: payload.contactName,
      p_contact_info: payload.contactInfo,
      p_request_type: payload.requestType,
      p_priority: payload.priority,
      p_message: payload.message,
      p_source_page: payload.sourcePage,
      p_reference_id: payload.referenceId,
      p_restaurant_id: null,
    });

    if (error) {
      console.error("[customer-requests] persist failed", error.message);
      return { persisted: false };
    }
    return { persisted: true };
  } catch (error) {
    console.error("[customer-requests] persist threw", error);
    return { persisted: false };
  }
}

// Extension by validated MIME type — mirrors the API route's allowlist so a
// stored key always carries a sensible extension. Unknown types fall back to
// "bin" rather than trusting the client-supplied filename extension.
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "application/pdf": "pdf",
};

/** Sanitize a base filename to [a-z0-9-]; the raw name is never used in a key. */
function sanitizeBase(input: string): string {
  const dot = input.lastIndexOf(".");
  const base = dot > 0 ? input.slice(0, dot) : input;
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-")
      .replace(/[-.]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "file"
  );
}

async function storeAttachmentAtPath(
  supabase: SupabaseClient,
  referenceId: string,
  file: File,
  path: string,
): Promise<boolean> {
  if (!path.startsWith(`${referenceId}/`) || path.includes("..")) return false;

  const { error: uploadError } = await supabase.storage
    .from(REQUEST_UPLOAD_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    console.error("[customer-requests] upload failed", uploadError.message);
    return false;
  }

  // Private bucket: record only bucket + path. The admin inbox mints a
  // short-lived signed URL at read time; no public URL is ever stored.
  const { error: recordError } = await supabase.rpc("add_change_request_attachment", {
    p_reference_id: referenceId,
    p_bucket: REQUEST_UPLOAD_BUCKET,
    p_path: path,
    p_file_name: file.name.slice(0, 200),
    p_content_type: file.type,
    p_byte_size: file.size,
  });
  if (recordError) {
    console.error("[customer-requests] attachment record failed", recordError.message);
    return false;
  }

  return true;
}

/**
 * Store one owner attachment after the Route Handler has authenticated the
 * owner and proved the request belongs to that restaurant. The existing
 * server-only admin client lets this path write metadata directly and clean up
 * an orphaned object without broadening any browser or database permissions.
 */
export async function storeOwnerRequestAttachment(
  requestId: string,
  referenceId: string,
  file: File,
  path: string,
): Promise<{ stored: boolean }> {
  if (!isSupabaseConfigured) return { stored: false };
  if (
    !path.startsWith(`${referenceId}/${requestId}/owner-`) ||
    path.includes("..")
  ) {
    return { stored: false };
  }

  try {
    const supabase = getSupabaseAdmin();
    const findMetadata = () =>
      supabase
        .from("change_request_attachments")
        .select("id")
        .eq("request_id", requestId)
        .eq("path", path)
        .limit(1);

    const { data: existingMetadata, error: existingMetadataError } = await findMetadata();
    if (existingMetadataError) {
      console.error("[owner-request] metadata check failed", existingMetadataError.message);
      return { stored: false };
    }
    if (existingMetadata?.length) return { stored: true };

    const upload = () =>
      supabase.storage
        .from(REQUEST_UPLOAD_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });

    let { error: uploadError } = await upload();
    if (uploadError) {
      // A lost HTTP response can make a successful prior upload look failed.
      const { data: metadataAfterConflict, error: conflictMetadataError } = await findMetadata();
      if (conflictMetadataError) {
        console.error("[owner-request] metadata recheck failed", conflictMetadataError.message);
        return { stored: false };
      }
      if (metadataAfterConflict?.length) return { stored: true };

      // No metadata means the object is an orphan from an interrupted write.
      const { error: cleanupError } = await supabase.storage
        .from(REQUEST_UPLOAD_BUCKET)
        .remove([path]);
      if (cleanupError) {
        console.error("[owner-request] orphan cleanup failed", cleanupError.message);
        return { stored: false };
      }
      ({ error: uploadError } = await upload());
    }
    if (uploadError) {
      console.error("[owner-request] upload failed", uploadError.message);
      return { stored: false };
    }

    const { error: recordError } = await supabase
      .from("change_request_attachments")
      .insert({
        request_id: requestId,
        reference_id: referenceId,
        bucket: REQUEST_UPLOAD_BUCKET,
        path,
        public_url: null,
        file_name: file.name.slice(0, 200),
        content_type: file.type,
        byte_size: file.size,
      });
    if (recordError) {
      console.error("[owner-request] attachment record failed", recordError.message);
      const { error: cleanupError } = await supabase.storage
        .from(REQUEST_UPLOAD_BUCKET)
        .remove([path]);
      if (cleanupError) {
        console.error("[owner-request] orphan cleanup failed", cleanupError.message);
      }
      return { stored: false };
    }

    return { stored: true };
  } catch (error) {
    console.error("[owner-request] attachment storage threw", error);
    return { stored: false };
  }
}

/**
 * Upload already-validated intake files to the request-uploads bucket and
 * record each as an attachment via add_change_request_attachment. Keyed by the
 * request's reference_id. No-ops when Supabase is not configured. Never throws
 * and never fails the whole batch on one bad file — returns the count stored so
 * the API can report storage status honestly.
 */
export async function storeRequestAttachments(
  referenceId: string,
  files: File[],
): Promise<{ stored: number }> {
  if (!isSupabaseConfigured || files.length === 0) return { stored: 0 };

  try {
    const supabase = await createServerSupabase();
    if (!supabase) return { stored: 0 };

    let stored = 0;
    for (const file of files) {
      const ext = EXT_BY_TYPE[file.type] ?? "bin";
      const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const path = `${referenceId}/${sanitizeBase(file.name)}-${stamp}.${ext}`;

      if (await storeAttachmentAtPath(supabase, referenceId, file, path)) stored += 1;
    }

    return { stored };
  } catch (error) {
    console.error("[customer-requests] attachment storage threw", error);
    return { stored: 0 };
  }
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Email a change request to the configured admin recipient via Resend.
 * No-ops (sent: false) when the email env vars are absent. Never throws.
 * Secrets stay server-side; nothing here is sent to the client.
 */
export async function sendChangeRequestEmail(
  payload: ChangeRequestPayload,
): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.REQUESTS_NOTIFICATION_EMAIL;
  const from = process.env.REQUESTS_FROM_EMAIL;

  if (!apiKey || !to || !from) return { sent: false };

  const lines = [
    `Reference: ${payload.referenceId}`,
    `Business: ${payload.businessName}`,
    `Contact: ${payload.contactName} (${payload.contactInfo})`,
    `Type: ${payload.requestType}`,
    `Priority: ${payload.priority}`,
    `Files received: ${payload.filesReceived}`,
    ...(payload.filesExpected === undefined
      ? []
      : [`Supporting files selected: ${payload.filesExpected} (uploads follow this saved request)`]),
    `Source: ${payload.sourcePage}`,
    "",
    "Message:",
    payload.message,
  ];

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New request — ${payload.businessName} [${payload.priority}]`,
        text: lines.join("\n"),
        ...(looksLikeEmail(payload.contactInfo) ? { reply_to: payload.contactInfo } : {}),
      }),
    });

    if (!response.ok) {
      console.error("[customer-requests] email failed", response.status);
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    console.error("[customer-requests] email threw", error);
    return { sent: false };
  }
}
