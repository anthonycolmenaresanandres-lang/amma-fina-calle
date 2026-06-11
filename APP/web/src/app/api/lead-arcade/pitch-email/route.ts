import { NextResponse } from "next/server";
import { sendPitchEmail } from "@/lib/lead-arcade/email";

export const dynamic = "force-dynamic";

const PNG_DATA_URL_PREFIX = "data:image/png;base64,";
const MAX_PAYLOAD_BYTES = 8_000_000;

interface PitchEmailBody {
  businessName?: unknown;
  sheet?: unknown;
  mockup?: unknown;
}

function stripPngDataUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith(PNG_DATA_URL_PREFIX)) return null;
  const base64 = value.slice(PNG_DATA_URL_PREFIX.length);
  return base64.length > 0 ? base64 : null;
}

export async function POST(request: Request): Promise<NextResponse> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ sent: false }, { status: 413 });
  }

  try {
    const bodyText = await request.text();
    if (bodyText.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json({ sent: false }, { status: 413 });
    }

    const body = JSON.parse(bodyText) as PitchEmailBody;
    const businessName = typeof body.businessName === "string" ? body.businessName.trim() : "";
    const sheetBase64 = stripPngDataUrl(body.sheet);
    const mockupBase64 = stripPngDataUrl(body.mockup);

    if (!businessName || !sheetBase64 || !mockupBase64) {
      return NextResponse.json({ sent: false }, { status: 400 });
    }

    const { sent } = await sendPitchEmail({ businessName, sheetBase64, mockupBase64 });
    return NextResponse.json({ sent });
  } catch (error) {
    console.error("[lead-arcade] pitch email route failed", error);
    return NextResponse.json({ sent: false }, { status: 400 });
  }
}
