import QRCode from "qrcode";
import { guestMenuAbsoluteUrl } from "@/lib/guest-menu";
export const runtime = "nodejs";
export async function GET() {
  const svg = await QRCode.toString(guestMenuAbsoluteUrl("bodega"), { type: "svg", margin: 4, errorCorrectionLevel: "M", width: 400 });
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Content-Disposition": 'attachment; filename="bodega-menu-qr.svg"', "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" } });
}
