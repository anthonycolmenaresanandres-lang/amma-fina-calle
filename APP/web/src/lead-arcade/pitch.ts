// Pitch material generator. At the Pitch step we stamp a one-page sales sheet
// (portrait, brandable) that embeds the two-phone mockup preview, plus we hand
// back the raw mockup PNG separately. Pure client-side canvas — no AI art, no
// network beyond the same-origin image proxy used by the mockup.

import { generateMockup } from "./mockup";
import type { LeadState } from "./types";

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadDataImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error("img load failed"));
    im.src = src;
  });
}

export interface PitchResult {
  sheet: string; // one-page pitch sheet (PNG data URL)
  mockup: string; // the raw two-phone mockup (PNG data URL)
}

const INCLUDED: [string, string][] = [
  ["Digital menu", "Live, QR-linked menu with your items & prices"],
  ["Branded mini-game", "A penalty game in your colors — fans play & share"],
  ["Behind-goal ad zone", "Your offer on the stadium board"],
  ["Monthly refresh", "We keep the campaign fresh every month"],
];

export async function generatePitch(lead: LeadState): Promise<PitchResult> {
  const m = lead.meta;
  const color = m.themeColor ?? "#d8a24c";
  const item = m.dossier.signature || "signature item";

  // The embedded preview (logo optional — falls back to the name).
  const mockup = await generateMockup({
    logoUrl: m.logoApproved ? m.logoCandidate : undefined,
    color,
    name: m.name,
    item,
  });

  const W = 1080;
  const H = 1528;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");

  // paper
  ctx.fillStyle = "#f7f3ec";
  ctx.fillRect(0, 0, W, H);

  // header band
  const HB = 250;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, HB);
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(0, HB - 12, W, 12);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";
  ctx.font = "700 26px system-ui, sans-serif";
  ctx.fillText("FINA CALLE · CAMPAIGN PACK", 60, 92);
  ctx.fillStyle = "#fff";
  ctx.font = "800 64px Georgia, serif";
  ctx.fillText(m.name, 60, 170, W - 120);
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = "400 26px system-ui, sans-serif";
  const intel = [m.businessType, m.dossier.rating ? `★ ${m.dossier.rating}` : "", m.hours ?? "", m.phone ?? ""]
    .filter(Boolean)
    .join("   ·   ");
  ctx.fillText(intel, 60, 214, W - 120);

  // "what's included"
  let y = HB + 64;
  ctx.fillStyle = "#1c1812";
  ctx.font = "800 34px system-ui, sans-serif";
  ctx.fillText("What you get", 60, y);
  y += 26;
  for (const [title, desc] of INCLUDED) {
    y += 56;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(78, y - 10, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1c1812";
    ctx.font = "700 28px system-ui, sans-serif";
    ctx.fillText(title, 104, y);
    ctx.fillStyle = "#6e5f50";
    ctx.font = "400 24px system-ui, sans-serif";
    ctx.fillText(desc, 104, y + 32);
    y += 30;
  }

  // embedded mockup preview
  y += 40;
  const preview = await loadDataImg(mockup);
  const pw = W - 120;
  const ph = pw * (preview.height / preview.width);
  ctx.save();
  rr(ctx, 60, y, pw, ph, 18);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.clip();
  ctx.drawImage(preview, 60, y, pw, ph);
  ctx.restore();
  ctx.strokeStyle = "#e1dacd";
  ctx.lineWidth = 2;
  rr(ctx, 60, y, pw, ph, 18);
  ctx.stroke();

  // CTA footer
  const fy = H - 150;
  ctx.fillStyle = color;
  rr(ctx, 60, fy, W - 120, 96, 20);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.fillStyle = "#1b120a";
  ctx.font = "800 36px system-ui, sans-serif";
  ctx.fillText(`Let's launch ${m.name}`, W / 2, fy + 44);
  ctx.font = "600 24px system-ui, sans-serif";
  ctx.fillText("Fina Calle · finacalle.com", W / 2, fy + 78);

  return { sheet: canvas.toDataURL("image/png"), mockup };
}
