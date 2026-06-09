#!/usr/bin/env python3
"""
Lead mockup "stamp" — the factory die for the lean acquisition demo.

Takes the ONLY per-lead variables (logo, brand color, business name, signature
item) and stamps a consistent menu + game preview image. Logo-ONLY, no AI
characters: the logo is PLACED by code (never AI-drawn), so it is pixel-perfect
every time and the per-lead marginal cost is ~zero.

Usage:
  python tools/lead_mockup_stamp.py \
      --logo path/to/logo.png --name "COLATTAO" --item "Churro Latte" \
      --color "#261810" --accent "#d8a24c" --out out.png \
      [--items "Churro Latte:4.75,Cappuccino:3.95,Matcha Lemonade:5.25"]

Neutral game scene defaults to the brand-neutral Stadium Shell so any lead's
logo drops into the same frame. Requires: pillow.
"""
import argparse
from PIL import Image, ImageDraw, ImageFont

DEJ = "/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf"
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"

def hexrgb(h):
    h = h.lstrip("#"); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def font(sz, bold=True): return ImageFont.truetype(DEJ % ("-Bold" if bold else ""), sz)
def serif(sz): return ImageFont.truetype(SERIF, sz)

def stamp(logo_path, name, item, primary, accent, bg_path, out_path,
          items=None, cream=(245, 232, 208), ink=(40, 28, 18), paper=(247, 243, 236)):
    logo = Image.open(logo_path).convert("RGBA")
    def fit(maxw, maxh):
        s = min(maxw / logo.size[0], maxh / logo.size[1])
        return logo.resize((max(1, int(logo.size[0]*s)), max(1, int(logo.size[1]*s))), Image.LANCZOS)

    def phone(w, h):
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
        d.rounded_rectangle([0, 0, w-1, h-1], radius=46, fill=(18, 18, 20, 255))
        pad = 12; box = (pad, pad, w-pad, h-pad)
        d.rounded_rectangle(box, radius=36, fill=(255, 255, 255, 255))
        return img, box

    PW, PH = 440, 900
    items = items or [("Churro Latte", "4.75"), ("Cappuccino", "3.95"),
                      ("Matcha Lemonade", "5.25"), ("Almond Croissant", "3.50"), ("Cold Brew", "4.25")]

    # PHONE 1 — menu
    p1, (x0, y0, x1, y1) = phone(PW, PH); d = ImageDraw.Draw(p1); sw = x1 - x0; hh = 210
    d.rounded_rectangle([x0, y0, x1, y0+hh], radius=36, fill=primary)
    d.rectangle([x0, y0+hh-40, x1, y0+hh], fill=primary)
    lg = fit(sw*0.74, hh*0.5); p1.alpha_composite(lg, (x0+(sw-lg.size[0])//2, y0+28))
    d.text((x0+sw/2, y0+hh-34), "DIGITAL MENU", font=font(20), fill=cream, anchor="mm")
    ry = y0+hh+26
    for nm, pr in items:
        d.text((x0+26, ry), nm, font=font(24, False), fill=ink, anchor="lm")
        d.text((x1-26, ry), "$"+pr, font=font(24), fill=primary, anchor="rm")
        ry += 46; d.line([x0+24, ry-18, x1-24, ry-18], fill=(225, 218, 205), width=2)
    by0 = y1-150; d.rounded_rectangle([x0+24, by0, x1-24, by0+92], radius=22, fill=accent)
    d.text((x0+sw/2, by0+30), "PLAY & WIN", font=font(30), fill=ink, anchor="mm")
    d.text((x0+sw/2, by0+64), "a free %s" % item, font=font(20, False), fill=ink, anchor="mm")

    # PHONE 2 — game (neutral shell + stamped logo)
    p2, (gx0, gy0, gx1, gy1) = phone(PW, PH); gw, gh = gx1-gx0, gy1-gy0
    shell = Image.open(bg_path).convert("RGB")
    s = max(gw/shell.size[0], gh/shell.size[1]); shell = shell.resize((int(shell.size[0]*s), int(shell.size[1]*s)), Image.LANCZOS).crop((0, 0, gw, gh))
    mask = Image.new("L", (gw, gh), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, gw-1, gh-1], radius=30, fill=255)
    p2.paste(shell, (gx0, gy0), mask); d = ImageDraw.Draw(p2)
    bw, bh = int(gw*0.62), int(gh*0.12); bx = gx0+(gw-bw)//2; byy = gy0+int(gh*0.30)
    board = Image.new("RGBA", (bw, bh), (0, 0, 0, 0)); ImageDraw.Draw(board).rounded_rectangle([0, 0, bw-1, bh-1], radius=10, fill=(28, 18, 10, 235))
    lg2 = fit(bw*0.82, bh*0.7); board.alpha_composite(lg2, ((bw-lg2.size[0])//2, (bh-lg2.size[1])//2)); p2.alpha_composite(board, (bx, byy))
    gpx0, gpx1 = gx0+int(gw*0.16), gx0+int(gw*0.84); gpy = gy0+int(gh*0.46); gpyt = gy0+int(gh*0.30)
    d.rectangle([gpx0, gpyt, gpx0+8, gpy], fill=(255, 255, 255)); d.rectangle([gpx1-8, gpyt, gpx1, gpy], fill=(255, 255, 255)); d.rectangle([gpx0, gpyt, gpx1, gpyt+8], fill=(255, 255, 255))
    bcx, bcy = gx0+gw//2, gy0+int(gh*0.72); r = 20
    d.ellipse([bcx-r, bcy-r, bcx+r, bcy+r], fill=accent, outline=ink, width=3)
    d.rounded_rectangle([gx0+16, gy0+16, gx1-16, gy0+64], radius=14, fill=(20, 14, 8, 235))
    lg3 = fit(120, 34); p2.alpha_composite(lg3, (gx0+28, gy0+24))
    d.text((gx1-30, gy0+40), "0 / 5", font=font(26), fill=cream, anchor="rm")
    d.text((gx0+gw/2, gy1-46), "TAP TO SHOOT", font=font(26), fill=(255, 255, 255), anchor="mm")

    # compose
    W, H = 1360, 1120; canvas = Image.new("RGB", (W, H), paper); d = ImageDraw.Draw(canvas)
    d.text((W/2, 54), "%s  —  Fina Calle preview" % name.title(), font=serif(46), fill=ink, anchor="mm")
    d.text((W/2, 104), "logo-only mockup · no characters · stamped from the neutral template", font=font(22, False), fill=(110, 95, 80), anchor="mm")
    canvas.paste(p1, (180, 150), p1); canvas.paste(p2, (740, 150), p2)
    d.text((180+PW/2, 150+PH+30), "1) Digital menu", font=font(26), fill=ink, anchor="mm")
    d.text((740+PW/2, 150+PH+30), "2) Branded game (neutral Shell + your logo)", font=font(24), fill=ink, anchor="mm")
    canvas.save(out_path); return out_path

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--logo", required=True); ap.add_argument("--name", required=True)
    ap.add_argument("--item", default="Signature Item"); ap.add_argument("--color", default="#261810")
    ap.add_argument("--accent", default="#d8a24c")
    ap.add_argument("--bg", default="APP/web/public/assets/stadium/penalty/background.webp")
    ap.add_argument("--items", default=""); ap.add_argument("--out", required=True)
    a = ap.parse_args()
    items = [tuple(x.split(":")) for x in a.items.split(",")] if a.items else None
    out = stamp(a.logo, a.name, a.item, hexrgb(a.color), hexrgb(a.accent), a.bg, a.out, items)
    print("wrote", out)
