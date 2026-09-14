"""Build the registered owner handout and standard manual; verify the final QR.

Dependencies: reportlab, qrcode, Pillow, PyMuPDF, zxing-cpp.
No network, credentials, customer-account queries or payment actions.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit

import fitz
import qrcode
from PIL import Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[2]
INK = colors.HexColor("#17221e")
MUTED = colors.HexColor("#536159")
BRASS = colors.HexColor("#896936")
RULE = colors.HexColor("#d5cbb8")
PAPER = colors.HexColor("#fbfaf5")
PAGE_W, PAGE_H = 612, 792
MARGIN = 45
QR_BOX = (70.0, 333.0, 162.0, 162.0)


def register_fonts(font_dir: Path) -> None:
    for face, filename in (
        ("OwnerSans", "arial.ttf"), ("OwnerSansBold", "arialbd.ttf"),
        ("OwnerSerif", "georgia.ttf"), ("OwnerSerifBold", "georgiab.ttf"),
    ):
        path = font_dir / filename
        if not path.is_file():
            raise SystemExit(f"Missing font: {path}. Set --font-dir to the approved font directory.")
        pdfmetrics.registerFont(TTFont(face, str(path)))
    pdfmetrics.registerFontFamily("OwnerSans", normal="OwnerSans", bold="OwnerSansBold", italic="OwnerSans", boldItalic="OwnerSansBold")
    pdfmetrics.registerFontFamily("OwnerSerif", normal="OwnerSerif", bold="OwnerSerifBold", italic="OwnerSerif", boldItalic="OwnerSerifBold")


def inline(text: str) -> str:
    return re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", html.escape(text))


def styles(size: float = 10.6) -> dict[str, ParagraphStyle]:
    return {
        "title": ParagraphStyle("title", fontName="OwnerSerif", fontSize=27, leading=32, textColor=INK, spaceAfter=16),
        "h2": ParagraphStyle("h2", fontName="OwnerSerifBold", fontSize=13.7, leading=18, textColor=INK, spaceBefore=12, spaceAfter=7),
        "body": ParagraphStyle("body", fontName="OwnerSans", fontSize=size, leading=size * 1.43, textColor=INK, spaceAfter=8),
        "bullet": ParagraphStyle("bullet", fontName="OwnerSans", fontSize=size, leading=size * 1.43, textColor=INK, leftIndent=12, firstLineIndent=-10, spaceAfter=6),
        "caption": ParagraphStyle("caption", fontName="OwnerSans", fontSize=8.5, leading=12, textColor=MUTED, spaceAfter=8),
    }


def para(c: canvas.Canvas, text: str, x: float, top: float, width: float, *, size: float = 11, leading: float = 16, font: str = "OwnerSans", color=INK, align=TA_LEFT) -> float:
    p = Paragraph(inline(text).replace("\n", "<br/>"), ParagraphStyle("placed", fontName=font, fontSize=size, leading=leading, textColor=color, alignment=align))
    _, height = p.wrap(width, PAGE_H)
    p.drawOn(c, x, top - height)
    return top - height


def wordmark(c: canvas.Canvas, emblem: ImageReader, x: float, y: float, width: float) -> None:
    # Layout clipping only: keep the original upper wordmark, never its legacy QR.
    full_height = width * 488 / 456
    visible_height = full_height * 0.45
    c.saveState()
    viewport = c.beginPath()
    viewport.rect(x, y, width, visible_height)
    c.clipPath(viewport, stroke=0, fill=0)
    c.drawImage(emblem, x, y + visible_height - full_height, width=width, height=full_height, mask="auto")
    c.restoreState()


def brand(c: canvas.Canvas, emblem: ImageReader, *, dark: bool = False) -> None:
    if dark:
        c.setFillColor(INK)
        c.rect(36, 707, 540, 49, fill=1, stroke=0)
        wordmark(c, emblem, 45, 720, 45)
        c.setFillColor(PAPER)
        c.setFont("OwnerSansBold", 10)
        c.drawString(96, 736, "FINA CALLE")
        c.setFont("OwnerSans", 8)
        c.drawString(96, 720, "For the people behind the hospitality.")
    else:
        c.setFillColor(INK)
        c.roundRect(MARGIN, 727, 32, 33, 4, fill=1, stroke=0)
        wordmark(c, emblem, MARGIN + 2, 736, 28)
        c.setFont("OwnerSansBold", 9)
        c.drawString(MARGIN + 43, 749, "FINA CALLE")
        c.setFont("OwnerSans", 8)
        c.setFillColor(MUTED)
        c.drawString(MARGIN + 43, 734, "THE OWNER HANDBOOK")
        c.setStrokeColor(RULE)
        c.line(MARGIN, 714, PAGE_W - MARGIN, 714)


def footer(c: canvas.Canvas, page: int, total: int, version: str) -> None:
    c.setStrokeColor(RULE)
    c.line(MARGIN, 42, PAGE_W - MARGIN, 42)
    c.setFillColor(MUTED)
    c.setFont("OwnerSans", 8)
    c.drawString(MARGIN, 28, f"Fina Calle  |  Owner handbook v{version}")
    c.drawRightString(PAGE_W - MARGIN, 28, f"{page} / {total}")


def blocks(markdown: str, size: float):
    available = styles(size)
    result = []
    for block in re.split(r"\n\s*\n", markdown.strip()):
        block = block.strip()
        if not block:
            continue
        if block.startswith("# "):
            result.append(Paragraph(inline(block[2:]), available["title"]))
        elif block.startswith("## "):
            result.append(Paragraph(inline(block[3:]), available["h2"]))
        elif block.startswith("- ") or re.match(r"\d+\. ", block):
            for line in block.splitlines():
                text = line[2:] if line.startswith("- ") else line
                prefix = "&#8226; " if line.startswith("- ") else ""
                result.append(Paragraph(prefix + inline(text), available["bullet"]))
        else:
            style = available["caption"] if block.startswith("Version 1 |") else available["body"]
            result.append(Paragraph(inline(" ".join(block.splitlines())), style))
    return result


def build_manual(path: Path, emblem: ImageReader, version: str) -> None:
    sections = (ROOT / "OPERATIONS/OWNER_MANUAL.md").read_text(encoding="utf-8").split("<!-- pagebreak -->")
    if len(sections) != 4:
        raise ValueError("The standard manual must contain exactly four deliberate pages.")
    c = canvas.Canvas(str(path), pagesize=(PAGE_W, PAGE_H), pageCompression=1, invariant=1)
    c.setTitle("Fina Calle owner handbook")
    c.setAuthor("Fina Calle")
    for index, section in enumerate(sections, 1):
        chosen = None
        for size in (10.6, 10.3, 10.0):
            items = blocks(section, size)
            total_height = sum(item.wrap(PAGE_W - 2 * MARGIN, PAGE_H)[1] + item.getSpaceBefore() + item.getSpaceAfter() for item in items)
            if total_height <= 647:
                chosen = items
                break
        if chosen is None:
            raise ValueError(f"Manual page {index} is too dense. Shorten the source; do not reduce text below 10pt.")
        brand(c, emblem)
        y = 696.0
        for item in chosen:
            _, height = item.wrap(PAGE_W - 2 * MARGIN, PAGE_H)
            y -= item.getSpaceBefore() + height
            item.drawOn(c, MARGIN, y)
            y -= item.getSpaceAfter()
        if y < 49:
            raise ValueError(f"Manual page {index} overlaps the footer: {y}")
        footer(c, index, len(sections), version)
        c.showPage()
    c.save()


def validate_url(client_id: str, url: str) -> None:
    parsed = urlsplit(url)
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", client_id) or client_id == "guide":
        raise ValueError("Invalid owner client ID.")
    if parsed.scheme != "https" or parsed.netloc != "finacalleos.com" or parsed.path != f"/owner/{client_id}" or parsed.query or parsed.fragment:
        raise ValueError("The QR must be the exact registered HTTPS finacalleos.com owner path, without a query, fragment or trailing slash.")
    if url != f"https://finacalleos.com/owner/{client_id}":
        raise ValueError("The QR URL contains unexpected characters.")


def vector_qr(c: canvas.Canvas, url: str) -> dict:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, border=4, box_size=1)
    qr.add_data(url)
    qr.make(fit=True)
    matrix = qr.get_matrix()
    x, y, width, height = QR_BOX
    module = width / len(matrix)
    c.setFillColor(colors.white)
    c.rect(x, y, width, height, fill=1, stroke=0)
    c.setFillColor(colors.black)
    for row, cells in enumerate(matrix):
        for column, filled in enumerate(cells):
            if filled:
                c.rect(x + column * module, y + (len(matrix) - row - 1) * module, module, module, fill=1, stroke=0)
    return {"errorCorrection": "Q", "quietZoneModules": 4, "totalModulesPerSide": len(matrix), "sizeIncludingQuietZoneInches": width / 72, "moduleSizeMillimeters": module * 25.4 / 72}


def build_handout(path: Path, client: dict, emblem: ImageReader, registry: dict) -> dict:
    c = canvas.Canvas(str(path), pagesize=(PAGE_W, PAGE_H), pageCompression=1, invariant=1)
    c.setTitle(f"{client['name']} - owner portal sign-in")
    c.setAuthor("Fina Calle")
    brand(c, emblem, dark=True)
    c.setFillColor(BRASS)
    c.setFont("OwnerSansBold", 9)
    c.drawString(48, 680, f"{client['name'].upper()}  /  OWNER ACCESS")
    para(c, "Your business.", 46, 657, 520, size=35, leading=42, font="OwnerSerif")
    para(c, "Your private portal.", 46, 614, 520, size=35, leading=42, font="OwnerSerif")
    para(c, "Payments, menu requests and a direct line to Fina Calle.", 48, 554, 510, size=12.5, leading=18, color=MUTED)
    c.setStrokeColor(RULE)
    c.line(48, 524, 564, 524)
    qr_info = vector_qr(c, client["ownerUrl"])
    para(c, "SCAN TO SIGN IN", 70, 321, 162, size=8.5, leading=12, font="OwnerSansBold", color=BRASS, align=TA_CENTER)
    para(c, "Your account, in one place.", 279, 497, 270, size=20, leading=25, font="OwnerSerif")
    para(c, "**Invoices & payments**\nView available invoices and manage billing when connected. Automatic payments require your separate choice and approved terms.", 280, 455, 270, size=10.5, leading=15)
    menu_text = "**Menu changes**\nFor Colattao's separate guest website, send a menu-update request through Contact." if client["menuMode"] == "request" else "**Menu changes**\nFollow the connection notice in your portal. Review and verify one small change at a time."
    para(c, menu_text, 280, 368, 270, size=10.5, leading=15)
    c.setStrokeColor(RULE)
    c.line(48, 291, 564, 291)
    c.setFont("OwnerSansBold", 10)
    c.setFillColor(INK)
    c.drawCentredString(PAGE_W / 2, 271, client["ownerUrl"].removeprefix("https://"))
    c.linkURL(client["ownerUrl"], (48, 258, 564, 285), relative=0)
    steps = [
        ("Scan the owner QR", "Check finacalleos.com and your business name before signing in."),
        ("Sign in privately", "Use your assigned email and password. Change the password if prompted."),
        ("Choose your task", "Open Payments, request a menu update or Contact Fina Calle for help."),
    ]
    top = 239
    for index, (heading, detail) in enumerate(steps, 1):
        c.setFillColor(BRASS)
        c.setFont("OwnerSerif", 23)
        c.drawString(49, top - 20, str(index))
        para(c, heading, 82, top, 471, size=11.5, leading=16, font="OwnerSansBold")
        para(c, detail, 82, top - 21, 471, size=10, leading=14, color=MUTED)
        top -= 55
    c.setStrokeColor(RULE)
    c.line(48, 85, 564, 85)
    para(c, "STAFF / OWNER USE ONLY - not the guest menu QR. Never print or share passwords.", 48, 77, 516, size=8.1, leading=11, font="OwnerSansBold")
    para(c, f"Help: {registry['supportEmail']}  |  Owner guide: finacalleos.com/owner/guide", 48, 61, 516, size=7.6, leading=10, color=MUTED)
    c.setFont("OwnerSans", 6.5)
    c.drawString(48, 40, client["assetId"] + "  |  Letter portrait. Print at Actual size / 100%. No service price stated.")
    c.showPage()
    c.save()
    return qr_info


def render_and_verify(manual: Path, handout: Path, expected: str, output: Path, qr_info: dict) -> dict:
    # Inspectable previews for every final page; QR is decoded from final PDF renders.
    import zxingcpp

    manual_checks = []
    for source in (manual, handout):
        with fitz.open(source) as doc:
            expected_pages = 4 if source == manual else 1
            if len(doc) != expected_pages:
                raise ValueError(f"Unexpected page count: {source}")
            for page in doc:
                png = output / f"{source.stem}-page-{page.number + 1}.png"
                page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False).save(png)
                if "1234" in page.get_text():
                    raise ValueError("Credential-like legacy text found in print.")
                for block in page.get_text("dict")["blocks"]:
                    for line in block.get("lines", []):
                        for span in line["spans"]:
                            x0, y0, x1, y1 = span["bbox"]
                            if min(x0, y0) < 0 or x1 > PAGE_W + 0.5 or y1 > PAGE_H + 0.5:
                                raise ValueError(f"Off-page text in {source}: {span['text']}")
                if source == manual:
                    for dpi in (150, 300):
                        pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72, dpi / 72), alpha=False)
                        pixels = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
                        values = [result.text for result in zxingcpp.read_barcodes(pixels) if result.valid]
                        if values:
                            raise ValueError(f"Unexpected barcode on manual page {page.number + 1}: {values!r}")
                        manual_checks.append({"page": page.number + 1, "dpi": dpi, "decoder": "zxing-cpp", "decoded": [], "pass": True})
    checks = []
    with fitz.open(handout) as doc:
        page = doc[0]
        x, y, w, h = QR_BOX
        clip = fitz.Rect(x, PAGE_H - y - h, x + w, PAGE_H - y)
        for dpi in (150, 300):
            for kind, region in (("full-page", None), ("qr-crop", clip)):
                pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72, dpi / 72), clip=region, alpha=False)
                pixels = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
                values = [result.text for result in zxingcpp.read_barcodes(pixels) if result.valid]
                if values != [expected]:
                    raise ValueError(f"QR decode mismatch at {dpi} DPI ({kind}): {values!r}")
                checks.append({"dpi": dpi, "region": kind, "decoder": "zxing-cpp", "nativeRaster": True, "decoded": values, "pass": True})
    return {
        "exactPayload": expected,
        "digitalStatus": "PASS",
        "physicalProof": "PENDING - no paper print or real-device scan was performed",
        "privateOwnerAcceptance": "NOT TESTED - public route does not verify account access or billing",
        "verificationNote": "Initial OpenCV full-page300 verification failed. zxing-cpp then identified a second legacy QR embedded in the original logo. Final layout clips that image to its original upper wordmark; final native raster checks must return only the exact owner URL. No OpenCV pass is claimed.",
        "qr": qr_info,
        "checks": checks,
        "manualNoUnexpectedBarcodes": manual_checks,
        "files": [{"filename": file.name, "sha256": hashlib.sha256(file.read_bytes()).hexdigest()} for file in (manual, handout)],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--client", required=True)
    parser.add_argument("--font-dir", type=Path, default=Path("C:/Windows/Fonts"))
    parser.add_argument("--output-dir", type=Path, default=ROOT / "output/pdf")
    parser.add_argument("--decoder-dir", type=Path, help="Optional isolated zxing-cpp installation directory; does not change app dependencies.")
    args = parser.parse_args()
    if args.decoder_dir:
        if not args.decoder_dir.is_dir():
            raise SystemExit("The isolated decoder directory does not exist.")
        sys.path.insert(0, str(args.decoder_dir.resolve()))
    registry = json.loads((ROOT / "PRINT_ASSETS/owner-portal/registry.json").read_text(encoding="utf-8"))
    if args.client not in registry["clients"]:
        raise SystemExit("Client is not in the approved non-secret print registry. Complete readiness checks first.")
    client = registry["clients"][args.client]
    validate_url(args.client, client["ownerUrl"])
    if client["menuMode"] not in ("request", "connected"):
        raise ValueError("Invalid registered menu mode.")
    register_fonts(args.font_dir)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    emblem = ImageReader(Image.open(ROOT / "APP/web/public/assets/fina-calle/emblem-colattao.webp"))
    manual = args.output_dir / "fina-calle-owner-manual.pdf"
    handout = args.output_dir / f"{args.client}-owner-portal-sign-in.pdf"
    build_manual(manual, emblem, registry["standardVersion"])
    qr_info = build_handout(handout, client, emblem, registry)
    proof = render_and_verify(manual, handout, client["ownerUrl"], args.output_dir, qr_info)
    (args.output_dir / "owner-portal-qr-verification.json").write_text(json.dumps(proof, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(proof, indent=2))


if __name__ == "__main__":
    main()
