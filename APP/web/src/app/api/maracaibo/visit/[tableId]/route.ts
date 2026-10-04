import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isValidTableId } from "@/table-os/venue-config";
import { isTableVisit, sameOrigin } from "@/table-os/maracaibo/visit-contract";

export const runtime = "nodejs";
type Context = { params: Promise<{ tableId: string }> };
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

export async function POST(request: NextRequest, context: Context): Promise<NextResponse> {
  if (!sameOrigin(request)) return reply({ status: "forbidden" }, 403);
  const tableId = (await context.params).tableId.toLowerCase();
  if (!isValidTableId(tableId)) return reply({ status: "invalid" }, 400);
  if (Number(request.headers.get("content-length") ?? 0) > 512) return reply({ status: "invalid" }, 413);
  let body: { action?: unknown; active?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 512) return reply({ status: "invalid" }, 413);
    body = JSON.parse(raw);
    if (!body || typeof body !== "object") return reply({ status: "invalid" }, 400);
  } catch { return reply({ status: "invalid" }, 400); }
  if (!["join", "rejoin", "ping", "leave"].includes(String(body.action))) return reply({ status: "invalid" }, 400);
  const name = `maracaibo-visit-${tableId}`;
  const saved = request.cookies.get(name)?.value;
  const previous = saved && /^[a-f0-9]{64}$/.test(saved) ? saved : null;
  const hash = (token: string) => createHash("sha256").update(token).digest("hex");
  try {
    const db = getSupabaseAdmin();
    if (body.action === "rejoin" && previous) {
      const result = await db.rpc("maracaibo_visit", { p_table: tableId, p_action: "leave", p_hash: hash(previous) });
      if (result.error) throw result.error;
    }
    const fresh = body.action === "rejoin" || !previous && body.action === "join";
    const token = fresh ? randomBytes(32).toString("hex") : previous;
    if (!token) return reply({ status: "ended" }, 409);
    const action = fresh ? "join" : body.action === "join" ? "resume" : body.action;
    const { data, error } = await db.rpc("maracaibo_visit", {
      p_table: tableId, p_action: action, p_hash: hash(token), p_active: body.active === true && action === "ping",
    });
    if (error) throw error;
    const response = reply(data, data?.status === "active" || body.action === "leave" ? 200 : 409);
    if (fresh && isTableVisit(data)) response.cookies.set(name, token, {
      httpOnly: true, secure: request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https", sameSite: "strict",
      path: `/api/maracaibo/visit/${tableId}`, maxAge: 86_400,
    });
    return response;
  } catch {
    return reply({ status: "unavailable", message: "Table connection is unavailable. Please try again." }, 503);
  }
}
