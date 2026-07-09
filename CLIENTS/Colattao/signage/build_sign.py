#!/usr/bin/env python3
# Quiet Ember — Colattao QR menu sign, Draft 1. 5x7in @300dpi + 0.125in bleed.
import qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = r"C:\Users\antho\OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle"
FONTS = r"C:\Users\antho\AppData\Roaming\Claude\local-agent-mode-sessions\skills-plugin\24cce8aa-cc4c-484b-8f99-a3994cdc24d2\31256114-c4fa-4d90-82d2-9e799eca2564\skills\canvas-design\canvas-fonts"
LOGO = BASE + r"\APP\web\public\assets\colattao\colattao-logo-cream-1600.png"
OUT = BASE + r"\CLIENTS\Colattao\signage"
URL = "https://colattao-cafe-rush.vercel.app/menu"

# Palette
EMBER   = (12, 7, 5)
GOLD    = (216, 179, 109)
GOLD_HI = (244, 217, 156)
CREAM   = (255, 247, 234)
MUTED   = (158, 140, 116)
QRDARK  = (20, 13, 9)

# Canvas: trim 1500x2100 (5x7@300) + 38px bleed all around
BLEED = 38
TW, TH = 1500, 2100
W, H = TW + 2 * BLEED, TH + 2 * BLEED
CX = W // 2
T_TOP, T_LEFT, T_RIGHT, T_BOT = BLEED, BLEED, BLEED + TW, BLEED + TH

def font(name, size):
    return ImageFont.truetype(FONTS + "\\" + name, size)

def tracked_width(draw, text, fnt, track):
    w = 0
    for ch in text:
        bb = draw.textbbox((0, 0), ch, font=fnt)
        w += (bb[2] - bb[0]) + track
    return w - track if text else 0

def draw_tracked(draw, text, fnt, fill, cx, y, track):
    total = tracked_width(draw, text, fnt, track)
    x = cx - total / 2
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        bb = draw.textbbox((0, 0), ch, font=fnt)
        x += (bb[2] - bb[0]) + track

def fit_font(draw, text, name, size, max_w, track):
    f = font(name, size)
    while tracked_width(draw, text, f, track) > max_w and size > 10:
        size -= 2
        f = font(name, size)
    return f

# ---- base + warm ember glow ----
img = Image.new("RGBA", (W, H), EMBER + (255,))
glow = Image.new("L", (W, H), 0)
gd = ImageDraw.Draw(glow)
gcx, gcy, R = CX, T_TOP + 470, 640
gd.ellipse([gcx - R, gcy - R, gcx + R, gcy + R], fill=130)
glow = glow.filter(ImageFilter.GaussianBlur(330))
amber = Image.new("RGBA", (W, H), (74, 41, 17, 255))
img = Image.composite(amber, img, glow)
# faint vignette toward edges
vig = Image.new("L", (W, H), 0)
vd = ImageDraw.Draw(vig)
vd.rectangle([0, 0, W, H], fill=90)
vd.rounded_rectangle([90, 90, W - 90, H - 90], radius=60, fill=0)
vig = vig.filter(ImageFilter.GaussianBlur(120))
dark = Image.new("RGBA", (W, H), (0, 0, 0, 255))
img = Image.composite(dark, img, vig)

draw = ImageDraw.Draw(img)

# ---- top reference marker ----
f_mark = font("DMMono-Regular.ttf", 24)
draw_tracked(draw, "COLATTAO  CAFÉ", f_mark, MUTED, CX, T_TOP + 132, 10)
# tiny gold rule under marker
draw.line([CX - 60, T_TOP + 178, CX + 60, T_TOP + 178], fill=GOLD, width=2)

# ---- logo wordmark ----
logo = Image.open(LOGO).convert("RGBA")
lw_target = 880
lh = int(logo.height * lw_target / logo.width)
logo = logo.resize((lw_target, lh), Image.LANCZOS)
logo_top = T_TOP + 250
img.paste(logo, (CX - lw_target // 2, logo_top), logo)
y = logo_top + lh + 70

# ---- gold divider ----
draw.line([CX - 90, y, CX + 90, y], fill=GOLD, width=2)
draw.ellipse([CX - 4, y - 4, CX + 4, y + 4], fill=GOLD_HI)
y += 64

# ---- headline ----
f_head = fit_font(draw, "SCAN FOR OUR MENU", "ArsenalSC-Regular.ttf", 78, TW - 380, 22)
draw_tracked(draw, "SCAN FOR OUR MENU", f_head, CREAM, CX, y, 22)
y += f_head.size + 88

# ---- QR panel (the lit hearth) ----
PANEL = 760
QRSIZE = 600
panel_x = CX - PANEL // 2
panel_y = y
# warm halo — the lit hearth glowing into the dark
halo = Image.new("L", (W, H), 0)
hd = ImageDraw.Draw(halo)
hr = int(PANEL * 0.80)
hd.ellipse([CX - hr, panel_y + PANEL // 2 - hr, CX + hr, panel_y + PANEL // 2 + hr], fill=78)
halo = halo.filter(ImageFilter.GaussianBlur(130))
img = Image.composite(Image.new("RGBA", (W, H), (102, 57, 24, 255)), img, halo)
draw = ImageDraw.Draw(img)
# soft warm shadow
sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sd = ImageDraw.Draw(sh)
sd.rounded_rectangle([panel_x, panel_y + 16, panel_x + PANEL, panel_y + PANEL + 16],
                     radius=46, fill=(0, 0, 0, 150))
sh = sh.filter(ImageFilter.GaussianBlur(34))
img.alpha_composite(sh)
draw = ImageDraw.Draw(img)
# cream panel + gold hairline
draw.rounded_rectangle([panel_x, panel_y, panel_x + PANEL, panel_y + PANEL],
                       radius=46, fill=CREAM)
draw.rounded_rectangle([panel_x + 14, panel_y + 14, panel_x + PANEL - 14, panel_y + PANEL - 14],
                       radius=34, outline=GOLD, width=3)
# QR
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, box_size=10, border=0)
qr.add_data(URL)
qr.make(fit=True)
qim = qr.make_image(fill_color=QRDARK, back_color=CREAM).convert("RGB")
qim = qim.resize((QRSIZE, QRSIZE), Image.NEAREST)
img.paste(qim, (CX - QRSIZE // 2, panel_y + (PANEL - QRSIZE) // 2))
y = panel_y + PANEL + 86

# ---- supporting line ----
f_sub = font("ArsenalSC-Regular.ttf", 40)
draw_tracked(draw, "COFFEE · ESPRESSO · PASTRIES", f_sub, GOLD_HI, CX, y, 8)

# ---- footer ----
f_foot = font("DMMono-Regular.ttf", 22)
draw_tracked(draw, "POWERED BY FINA CALLE OS", f_foot, MUTED, CX, T_BOT - 96, 8)

# ---- inner gold frame + corner ticks ----
ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
od = ImageDraw.Draw(ov)
fi = 96
fr = [T_LEFT + fi, T_TOP + fi, T_RIGHT - fi, T_BOT - fi]
od.rounded_rectangle(fr, radius=18, outline=GOLD + (90,), width=2)
tick = 26
for (px, py, dx, dy) in [(fr[0], fr[1], 1, 1), (fr[2], fr[1], -1, 1), (fr[0], fr[3], 1, -1), (fr[2], fr[3], -1, -1)]:
    od.line([px, py, px + dx * tick, py], fill=GOLD_HI + (200,), width=3)
    od.line([px, py, px, py + dy * tick], fill=GOLD_HI + (200,), width=3)
img = Image.alpha_composite(img, ov)

# ---- export ----
rgb = img.convert("RGB")
png_path = OUT + r"\colattao_qr_sign_draft1.png"
pdf_path = OUT + r"\colattao_qr_sign_draft1_print.pdf"
rgb.save(png_path, "PNG")
rgb.save(pdf_path, "PDF", resolution=300.0)
print("PNG:", png_path)
print("PDF:", pdf_path)
print("size_px:", rgb.size, "qr_modules:", qr.modules_count, "url:", URL)
