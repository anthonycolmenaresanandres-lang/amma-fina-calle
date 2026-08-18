"""Build personalized Fina Calle owner-review QR leave-behinds.

The letter layout uses a literal 61.8 / 38.2 golden-ratio split. Every QR is
generated locally from a manifest URL with high error correction and a
four-module quiet zone. Client logos are intentionally excluded because none
are approved for promotional print use.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from reportlab.graphics import renderPDF, renderSVG
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from pypdf import PdfWriter


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = Path(__file__).with_name("prospect_leave_behind_manifest_2026-07-25.json")
OUTPUT_ROOT = ROOT / "output" / "pdf" / "prospect-leave-behinds" / "2026-07-25"
COMBINED_PATH = OUTPUT_ROOT / "PRINT-ALL-prospect-leave-behinds-2026-07-25.pdf"

PAGE_W, PAGE_H = letter
GOLDEN_RATIO = 0.618
OFFER_H = PAGE_H * (1 - GOLDEN_RATIO)

INK = HexColor("#050706")
PAPER = HexColor("#F6F0E4")
MUTED_LIGHT = HexColor("#B7C0BA")
MUTED_DARK = HexColor("#59615D")
BLACK = HexColor("#000000")


def register_fonts() -> dict[str, str]:
    fonts = {
        "display": ("Bahnschrift", Path(r"C:\Windows\Fonts\bahnschrift.ttf")),
        "body": ("SegoeUI", Path(r"C:\Windows\Fonts\segoeui.ttf")),
        "body_bold": ("SegoeUI-Bold", Path(r"C:\Windows\Fonts\segoeuib.ttf")),
        "serif": ("Georgia-Bold", Path(r"C:\Windows\Fonts\georgiab.ttf")),
    }
    fallbacks = {
        "display": "Helvetica-Bold",
        "body": "Helvetica",
        "body_bold": "Helvetica-Bold",
        "serif": "Times-Bold",
    }
    registered: dict[str, str] = {}
    for role, (name, path) in fonts.items():
        if path.exists():
            try:
                pdfmetrics.registerFont(TTFont(name, str(path)))
                registered[role] = name
                continue
            except Exception:
                pass
        registered[role] = fallbacks[role]
    return registered


def centered(
    page: canvas.Canvas,
    text: str,
    y: float,
    font_name: str,
    font_size: float,
    color,
    tracking: float = 0,
) -> None:
    width = pdfmetrics.stringWidth(text, font_name, font_size)
    width += max(0, len(text) - 1) * tracking
    text_object = page.beginText((PAGE_W - width) / 2, y)
    text_object.setFont(font_name, font_size)
    text_object.setFillColor(color)
    text_object.setCharSpace(tracking)
    text_object.textLine(text)
    page.drawText(text_object)


def fit_centered(
    page: canvas.Canvas,
    text: str,
    y: float,
    font_name: str,
    preferred_size: float,
    max_width: float,
    color,
    tracking: float = 0,
) -> None:
    size = preferred_size
    while size > 18:
        width = pdfmetrics.stringWidth(text, font_name, size)
        width += max(0, len(text) - 1) * tracking
        if width <= max_width:
            break
        size -= 1
    centered(page, text, y, font_name, size, color, tracking)


def qr_drawing(url: str, size: float) -> Drawing:
    widget = QrCodeWidget(url, barLevel="H", barBorder=4)
    x0, y0, x1, y1 = widget.getBounds()
    width = x1 - x0
    height = y1 - y0
    drawing = Drawing(
        size,
        size,
        transform=[size / width, 0, 0, size / height, -x0, -y0],
    )
    drawing.add(widget)
    return drawing


def draw_qr(page: canvas.Canvas, url: str, y: float, size: float, svg_path: Path) -> None:
    drawing = qr_drawing(url, size)
    x = (PAGE_W - size) / 2
    pad = 9
    page.setFillColor(white)
    page.roundRect(x - pad, y - pad, size + pad * 2, size + pad * 2, 5, stroke=0, fill=1)
    renderPDF.draw(drawing, page, x, y)
    page.linkURL(url, (x, y, x + size, y + size), relative=0)
    renderSVG.drawToFile(drawing, str(svg_path), encoding="utf-8")


def draw_sheet(record: dict[str, Any], fonts: dict[str, str]) -> Path:
    slug = record["slug"]
    out_dir = OUTPUT_ROOT / slug
    qr_dir = out_dir / "qr"
    out_dir.mkdir(parents=True, exist_ok=True)
    qr_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = out_dir / f"{slug}-leave-behind-letter.pdf"
    svg_path = qr_dir / f"{slug}-owner-review.svg"

    page = canvas.Canvas(str(pdf_path), pagesize=letter, pageCompression=1)
    page.setTitle(f"{record['restaurant']} owner-review QR leave-behind")
    page.setAuthor("AMMA Ventures LLC DBA Fina Calle")
    page.setSubject("Private owner-review demo and transparent proposed pricing")
    page.setKeywords("Fina Calle, QR menu, branded game, owner review")

    accent = HexColor(record["accent"])
    secondary = HexColor(record["secondary"])

    # Literal golden-ratio structure: 61.8% demo field, 38.2% offer field.
    page.setFillColor(INK)
    page.rect(0, OFFER_H, PAGE_W, PAGE_H - OFFER_H, stroke=0, fill=1)
    page.setFillColor(PAPER)
    page.rect(0, 0, PAGE_W, OFFER_H, stroke=0, fill=1)
    page.setFillColor(accent)
    page.rect(0, OFFER_H - 1.5, PAGE_W, 3, stroke=0, fill=1)
    page.setFillColor(secondary)
    page.rect(0, PAGE_H - 8, PAGE_W, 8, stroke=0, fill=1)

    centered(page, "FINA CALLE OS", 754, fonts["body_bold"], 9, accent, 2.1)
    centered(
        page,
        "PRIVATE OWNER REVIEW  /  PENDING CLIENT APPROVAL",
        733,
        fonts["body_bold"],
        6.8,
        MUTED_LIGHT,
        0.75,
    )
    fit_centered(
        page,
        record["restaurant"],
        684,
        fonts["display"],
        37,
        PAGE_W - 70,
        PAPER,
        0.5,
    )
    centered(page, record["descriptor"].upper(), 661, fonts["body"], 7.2, MUTED_LIGHT, 0.55)
    centered(page, "YOUR MENU. YOUR GAME. ONE SCAN.", 627, fonts["body_bold"], 11.5, accent, 0.2)
    centered(page, "SU MENU. SU JUEGO. UN ESCANEO.", 610, fonts["body"], 7.4, MUTED_LIGHT, 0.25)

    draw_qr(page, record["demo_url"], y=381, size=202, svg_path=svg_path)
    centered(page, record["proof_label"], 350, fonts["body_bold"], 8.3, PAPER, 0.55)
    centered(page, "SCAN NOW  /  ESCANEE AHORA", 333, fonts["body_bold"], 7.2, accent, 0.5)
    centered(page, record["demo_url"].replace("https://", ""), 317, fonts["body"], 6.5, MUTED_LIGHT)

    centered(page, "MENU + PLAYABLE MODULE", 269, fonts["body_bold"], 8.2, MUTED_DARK, 1.0)
    centered(page, "$199", 213, fonts["display"], 49, INK)
    centered(page, "STARTING MONTHLY  /  PER LOCATION", 190, fonts["body_bold"], 8.6, MUTED_DARK, 0.8)
    centered(
        page,
        "MOBILE MENU  /  EXISTING GAME  /  HOSTING  /  LINK SUPPORT",
        167,
        fonts["body_bold"],
        7.3,
        INK,
        0.25,
    )

    page.setFillColor(accent)
    page.rect(PAGE_W / 2 - 54, 151, 108, 2, stroke=0, fill=1)
    centered(page, record["offer_note"], 130, fonts["body_bold"], 7.2, MUTED_DARK, 0.65)

    if record["table_offer"]:
        centered(page, "TABLE SERVICE: WRITTEN QUOTE", 105, fonts["display"], 16, INK, 0.05)
        centered(
            page,
            "TABLE-SPECIFIC QR  /  LAUNCH TESTING  /  PRINTING SEPARATE",
            87,
            fonts["body_bold"],
            6.5,
            MUTED_DARK,
            0.2,
        )
    else:
        centered(page, "CORE MENU + GAME  /  NO TABLE SERVICE", 105, fonts["display"], 14.5, INK, 0.05)
        centered(
            page,
            "ONE LOCATION QR  /  NOTHING TO DOWNLOAD",
            87,
            fonts["body_bold"],
            6.7,
            MUTED_DARK,
            0.35,
        )

    centered(
        page,
        "ORDER / PAY / STAFF REQUESTS / POS ARE NOT INCLUDED IN THE BASE PLAN.",
        62,
        fonts["body_bold"],
        6.2,
        MUTED_DARK,
        0.12,
    )
    centered(
        page,
        "15-MINUTE OWNER REVIEW  /  WRITTEN SCOPE  /  NO OBLIGATION",
        39,
        fonts["body_bold"],
        7.0,
        INK,
        0.34,
    )
    centered(page, "FINACALLEOS.COM  /  @FINA_CALLE", 22, fonts["body_bold"], 6.6, MUTED_DARK, 0.45)

    page.showPage()
    page.save()
    return pdf_path


def build() -> list[Path]:
    records = json.loads(MANIFEST.read_text(encoding="utf-8"))
    fonts = register_fonts()
    paths = [draw_sheet(record, fonts) for record in records]
    writer = PdfWriter()
    for path in paths:
        writer.append(str(path))
    with COMBINED_PATH.open("wb") as combined:
        writer.write(combined)
    for path in paths:
        print(path)
    print(COMBINED_PATH)
    return paths


if __name__ == "__main__":
    build()
