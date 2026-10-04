import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isValidTableId } from "@/table-os/venue-config";
import { sameOrigin, UUID } from "@/table-os/maracaibo/visit-contract";

const reply = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
export async function GET() {
  if ((await getAdminContext()).state !== "authorized") return reply({ status: "forbidden" }, 403);
  try {
    const { data, error } = await getSupabaseAdmin().from("maracaibo_table_visits")
      .select("table_id,visit_id,started_at,expires_at,closed_at").order("table_id").limit(200);
    if (error) throw error;
    return reply({ tables: data });
  } catch { return reply({ status: "unavailable" }, 503); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request) || (await getAdminContext()).state !== "authorized") return reply({ status: "forbidden" }, 403);
  try {
    if (Number(request.headers.get("content-length") ?? 0) > 512) return reply({ status: "invalid" }, 413);
    const raw = await request.text();
    if (raw.length > 512) return reply({ status: "invalid" }, 413);
    const body = JSON.parse(raw);
    if (!body || typeof body.tableId !== "string" || !isValidTableId(body.tableId)
      || typeof body.visitId !== "string" || !UUID.test(body.visitId)) return reply({ status: "invalid" }, 400);
    const { data, error } = await getSupabaseAdmin().rpc("maracaibo_visit", {
      p_table: body.tableId.toLowerCase(), p_action: "reset", p_expected: body.visitId,
    });
    if (error) throw error;
    return reply(data, data.status === "changed" ? 409 : 200);
  } catch { return reply({ status: "unavailable" }, 503); }
}
