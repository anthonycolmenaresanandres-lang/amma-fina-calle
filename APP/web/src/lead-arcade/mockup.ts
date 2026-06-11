// Client-side mockup generator — the in-app "stamp": composites the approved
// logo + brand color into a neutral menu+game preview, logo placed (never AI
// drawn). Returns a PNG data URL. The logo is fetched via our same-origin image
// proxy so the canvas stays untainted and exportable.

export interface MockupOpts { logoUrl?: string; color: string; name: string; item: string }

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error("img load failed"));
    im.src = src;
  });
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cx: number, cy: number, maxW: number, maxH: number): void {
  const s = Math.min(maxW / img.width, maxH / img.height);
  const w = img.width * s, h = img.height * s;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}

function phoneFrame(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): { sx: number; sy: number; sw: number; sh: number } {
  ctx.fillStyle = "#121214"; rr(ctx, x, y, w, h, 46); ctx.fill();
  const pad = 12;
  ctx.fillStyle = "#ffffff"; rr(ctx, x + pad, y + pad, w - 2 * pad, h - 2 * pad, 36); ctx.fill();
  return { sx: x + pad, sy: y + pad, sw: w - 2 * pad, sh: h - 2 * pad };
}

export async function generateMockup(opts: MockupOpts): Promise<string> {
  const { logoUrl, color, name, item } = opts;
  const W = 1360, H = 1120, PW = 440, PH = 900;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");

  const [logo, shell] = await Promise.all([
    logoUrl
      ? loadImg(`/api/lead-arcade/img?url=${encodeURIComponent(logoUrl)}`).catch(() => null)
      : Promise.resolve(null),
    loadImg("/assets/stadium/penalty/background.webp"),
  ]);

  // When there's no approved logo yet, the brand name stands in for it.
  const logoOrName = (cx: number, cy: number, maxW: number, maxH: number, textColor: string) => {
    if (logo) {
      drawContain(ctx, logo, cx, cy, maxW, maxH);
      return;
    }
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = textColor;
    ctx.font = `bold ${Math.round(maxH * 0.42)}px Georgia, serif`;
    ctx.fillText(name, cx, cy, maxW);
    ctx.restore();
  };

  ctx.fillStyle = "#f7f3ec"; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#1c1812"; ctx.font = "bold 44px Georgia, serif";
  ctx.fillText(`${name} — Fina Calle preview`, W / 2, 58);
  ctx.fillStyle = "#6e5f50"; ctx.font = "22px system-ui, sans-serif";
  ctx.fillText("logo-only mockup · stamped from the neutral template", W / 2, 98);

  // PHONE 1 — menu
  {
    const x = 180, y = 150;
    const s = phoneFrame(ctx, x, y, PW, PH);
    const hh = 210;
    ctx.fillStyle = color; rr(ctx, s.sx, s.sy, s.sw, hh, 36); ctx.fill();
    ctx.fillRect(s.sx, s.sy + hh - 40, s.sw, 40);
    logoOrName(s.sx + s.sw / 2, s.sy + 70, s.sw * 0.74, hh * 0.5, "#f4e6cc");
    ctx.fillStyle = "#f4e6cc"; ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillText("DIGITAL MENU", s.sx + s.sw / 2, s.sy + hh - 24);
    const items: [string, string][] = [[item, "4.75"], ["Cappuccino", "3.95"], ["House Special", "5.25"], ["Pastry", "3.50"], ["Cold Brew", "4.25"]];
    let ry = s.sy + hh + 36;
    ctx.font = "24px system-ui, sans-serif";
    for (const [nm, pr] of items) {
      ctx.textAlign = "left"; ctx.fillStyle = "#281c12"; ctx.fillText(nm, s.sx + 26, ry);
      ctx.textAlign = "right"; ctx.fillStyle = color; ctx.font = "bold 24px system-ui, sans-serif"; ctx.fillText("$" + pr, s.sx + s.sw - 26, ry);
      ctx.font = "24px system-ui, sans-serif";
      ry += 46; ctx.strokeStyle = "#e1dacd"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.sx + 24, ry - 18); ctx.lineTo(s.sx + s.sw - 24, ry - 18); ctx.stroke();
    }
    const by = s.sy + s.sh - 150;
    ctx.fillStyle = "#d8a24c"; rr(ctx, s.sx + 24, by, s.sw - 48, 92, 22); ctx.fill();
    ctx.textAlign = "center"; ctx.fillStyle = "#1b120a";
    ctx.font = "bold 30px system-ui, sans-serif"; ctx.fillText("PLAY & WIN", s.sx + s.sw / 2, by + 40);
    ctx.font = "20px system-ui, sans-serif"; ctx.fillText(`a free ${item}`, s.sx + s.sw / 2, by + 70);
  }

  // PHONE 2 — game
  {
    const x = 740, y = 150;
    const s = phoneFrame(ctx, x, y, PW, PH);
    ctx.save();
    rr(ctx, s.sx, s.sy, s.sw, s.sh, 30); ctx.clip();
    const sc = Math.max(s.sw / shell.width, s.sh / shell.height);
    ctx.drawImage(shell, s.sx, s.sy, shell.width * sc, shell.height * sc);
    ctx.restore();
    // ad board + logo
    const bw = s.sw * 0.62, bh = s.sh * 0.12, bx = s.sx + (s.sw - bw) / 2, byy = s.sy + s.sh * 0.30;
    ctx.fillStyle = "rgba(28,18,10,.92)"; rr(ctx, bx, byy, bw, bh, 10); ctx.fill();
    logoOrName(bx + bw / 2, byy + bh / 2, bw * 0.82, bh * 0.7, "#f4e6cc");
    // goal
    const gx0 = s.sx + s.sw * 0.16, gx1 = s.sx + s.sw * 0.84, gpy = s.sy + s.sh * 0.46, gpyt = s.sy + s.sh * 0.30;
    ctx.fillStyle = "#fff"; ctx.fillRect(gx0, gpyt, 8, gpy - gpyt); ctx.fillRect(gx1 - 8, gpyt, 8, gpy - gpyt); ctx.fillRect(gx0, gpyt, gx1 - gx0, 8);
    // ball
    ctx.fillStyle = "#d8a24c"; ctx.strokeStyle = "#281c12"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(s.sx + s.sw / 2, s.sy + s.sh * 0.72, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // scoreboard
    ctx.fillStyle = "rgba(20,14,8,.92)"; rr(ctx, s.sx + 16, s.sy + 16, s.sw - 32, 48, 14); ctx.fill();
    logoOrName(s.sx + 78, s.sy + 40, 110, 34, "#f4e6cc");
    ctx.fillStyle = "#f4e6cc"; ctx.textAlign = "right"; ctx.font = "bold 26px system-ui, sans-serif"; ctx.fillText("0 / 5", s.sx + s.sw - 30, s.sy + 48);
    ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.font = "bold 26px system-ui, sans-serif"; ctx.fillText("TAP TO SHOOT", s.sx + s.sw / 2, s.sy + s.sh - 40);
  }

  ctx.textAlign = "center"; ctx.fillStyle = "#1c1812"; ctx.font = "bold 26px system-ui, sans-serif";
  ctx.fillText("1) Digital menu", 180 + PW / 2, 150 + PH + 30);
  ctx.fillText("2) Branded game", 740 + PW / 2, 150 + PH + 30);

  return canvas.toDataURL("image/png");
}
