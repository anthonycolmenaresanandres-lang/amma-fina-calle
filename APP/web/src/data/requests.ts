import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Admin-facing reads for the customer change-request inbox. Sourced from
// Supabase via the admin-gated get_change_requests / get_change_request RPCs
// (migration 0005). Like data/customers.ts, these fail soft: a missing config
// or a non-admin session yields an empty inbox rather than an error.

export type ChangeRequestSummary = {
  id: string;
  referenceId: string;
  businessName: string;
  contactName: string;
  contactInfo: string;
  requestType: string;
  priority: string;
  status: string;
  sourcePage: string;
  createdAt: string;
  attachmentCount: number;
};

export type ChangeRequestAttachment = {
  id: string;
  fileName: string;
  /** Short-lived signed URL minted at read time; empty if signing failed. */
  url: string;
  contentType: string;
  byteSize: number;
  createdAt: string;
};

export type ChangeRequestDetail = ChangeRequestSummary & {
  message: string;
  attachments: ChangeRequestAttachment[];
};

type SummaryRow = {
  id: string;
  reference_id: string | null;
  business_name: string | null;
  contact_name: string | null;
  contact_info: string | null;
  request_type: string | null;
  priority: string | null;
  status: string | null;
  source_page: string | null;
  created_at: string;
  attachment_count: number | null;
};

type DetailJson = SummaryRow & {
  message: string | null;
  attachments: Array<{
    id: string;
    file_name: string | null;
    bucket: string | null;
    path: string | null;
    content_type: string | null;
    byte_size: number | null;
    created_at: string;
  }> | null;
};

const SIGNED_URL_TTL_SECONDS = 300;

function mapSummary(row: SummaryRow): ChangeRequestSummary {
  return {
    id: row.id,
    referenceId: row.reference_id ?? "",
    businessName: row.business_name ?? "",
    contactName: row.contact_name ?? "",
    contactInfo: row.contact_info ?? "",
    requestType: row.request_type ?? "",
    priority: row.priority ?? "",
    status: row.status ?? "",
    sourcePage: row.source_page ?? "",
    createdAt: row.created_at,
    attachmentCount: Number(row.attachment_count ?? 0),
  };
}

export async function getChangeRequests(): Promise<ChangeRequestSummary[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("get_change_requests");
  if (error || !data) return [];
  return (data as SummaryRow[]).map(mapSummary);
}

export async function getChangeRequestById(
  id: string,
): Promise<ChangeRequestDetail | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("get_change_request", { p_id: id });
  if (error || !data) return null;

  const row = (Array.isArray(data) ? data[0] : data) as DetailJson | null;
  if (!row) return null;

  // Mint a short-lived signed URL per attachment from the private bucket.
  // Falls back to an empty url if signing fails, so the page still renders.
  const attachments = await Promise.all(
    (row.attachments ?? []).map(async (a) => {
      let url = "";
      if (a.bucket && a.path) {
        const { data: signed } = await supabase.storage
          .from(a.bucket)
          .createSignedUrl(a.path, SIGNED_URL_TTL_SECONDS);
        url = signed?.signedUrl ?? "";
      }
      return {
        id: a.id,
        fileName: a.file_name ?? "Attachment",
        url,
        contentType: a.content_type ?? "",
        byteSize: Number(a.byte_size ?? 0),
        createdAt: a.created_at,
      };
    }),
  );

  return {
    ...mapSummary(row),
    message: row.message ?? "",
    attachments,
  };
}
