import { NextResponse } from "next/server";

export function rewardResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
export function isSameOrigin(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const source = new URL(origin);
    const target = new URL(request.url);
    // Next may reconstruct request.url with its internal listening hostname.
    // Compare the browser Origin with the actual Host, never X-Forwarded-Host.
    const host = request.headers.get("host") ?? target.host;
    const protocol = request.headers.get("x-forwarded-proto") ?? target.protocol.slice(0, -1);
    return source.origin === origin && source.host === host
      && ["http", "https"].includes(protocol) && source.protocol === `${protocol}:`;
  } catch { return false; }
}
/** Bound actual bytes, not a caller-controlled Content-Length header. */
export async function readRewardBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("JSON required");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Body required");
  let length = 0;
  let text = "";
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 65536) { await reader.cancel(); throw new Error("Body too large"); }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    const body: unknown = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Object required");
    return body as Record<string, unknown>;
  } finally { reader.releaseLock(); }
}
