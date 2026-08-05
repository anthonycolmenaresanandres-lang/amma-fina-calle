import { NextResponse } from "next/server";
import { isSafeRestaurantId } from "@/lib/owner/app-manifest";
import { getOwnerContext } from "@/lib/owner/auth";
import {
  OWNER_REQUEST_MAX_FILE_BYTES,
  hasOwnerRequestFileSignature,
  isOwnerRequestFileSlot,
  isOwnerRequestReference,
  ownerRequestAttachmentPath,
  validateOwnerRequestFile,
} from "@/lib/owner/request-desk/files";
import { storeOwnerRequestAttachment } from "@/lib/requests/intake";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string; referenceId: string }>;
};

const MAX_MULTIPART_OVERHEAD_BYTES = 128 * 1024;

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  if (!isSameOrigin(request)) return json({ ok: false }, 403);

  const { id, referenceId } = await params;
  if (!isSafeRestaurantId(id) || !isOwnerRequestReference(referenceId)) {
    return json({ ok: false }, 404);
  }

  const owner = await getOwnerContext(id);
  if (owner.state !== "authorized") return json({ ok: false }, 403);

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (
    Number.isFinite(contentLength) &&
    contentLength > OWNER_REQUEST_MAX_FILE_BYTES + MAX_MULTIPART_OVERHEAD_BYTES
  ) {
    return json({ ok: false, message: "Each file must be 4 MB or smaller." }, 413);
  }

  const supabase = await createServerSupabase();
  if (!supabase) return json({ ok: false, message: "Uploads are not configured yet." }, 503);

  // RLS and the explicit restaurant filter prove this reference belongs to
  // the currently authorized owner before any bytes are accepted.
  const { data: requestRow, error: requestError } = await supabase
    .from("change_requests")
    .select("id")
    .eq("reference_id", referenceId)
    .eq("restaurant_id", id)
    .maybeSingle();
  if (requestError || !requestRow) return json({ ok: false }, 404);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ ok: false, message: "The upload was not valid form data." }, 400);
  }

  const slot = Number(formData.get("slot"));
  const entry = formData.get("file");
  if (!isOwnerRequestFileSlot(slot)) {
    return json({ ok: false, message: "Choose one of the five file slots." }, 400);
  }
  if (typeof entry === "string" || !entry || !("size" in entry) || !("name" in entry)) {
    return json({ ok: false, message: "Choose a file to upload." }, 400);
  }

  const file = entry as File;
  const fileError = validateOwnerRequestFile(file);
  if (fileError) return json({ ok: false, message: fileError }, 400);

  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!hasOwnerRequestFileSignature(file.type, signature)) {
    return json({ ok: false, message: "The file contents do not match its file type." }, 400);
  }

  const path = ownerRequestAttachmentPath(referenceId, requestRow.id, slot);
  const result = await storeOwnerRequestAttachment(requestRow.id, referenceId, file, path);
  if (!result.stored) {
    return json({ ok: false, message: "The file did not upload. Try that file again." }, 503);
  }

  return json({ ok: true, slot }, 201);
}
