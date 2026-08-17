import argparse
from pathlib import Path

import qrcode
from PIL import Image, ImageOps
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "aj-gators"
DEMO_URL = "https://finacalleos.com/demo/aj-gators"
PROOF_URL = "https://finacalleos.com/case-studies/colattao"
FINA_CALLE_URL = "https://finacalleos.com"


def make_qr(url: str, path: Path, fill_color: str = "#07100d") -> None:
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=12, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    qr.make_image(fill_color=fill_color, back_color="white").save(path)


def draw_centered(c: canvas.Canvas, text: str, y: float, size: float, color: str, font: str = "Helvetica-Bold") -> None:
    c.setFillColor(HexColor(color))
    c.setFont(font, size)
    c.drawCentredString(letter[0] / 2, y, text)


def build() -> Path:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    demo_qr = OUTPUT / "aj-gators-demo-qr.png"
    proof_qr = OUTPUT / "local-proof-qr.png"
    make_qr(DEMO_URL, demo_qr)
    make_qr(PROOF_URL, proof_qr)

    target = OUTPUT / "aj-gators-two-qr-leave-behind.pdf"
    c = canvas.Canvas(str(target), pagesize=letter)
    width, height = letter
    c.setFillColor(HexColor("#07100d"))
    c.rect(0, 0, width, height, fill=1, stroke=0)

    logo = ROOT / "APP" / "web" / "public" / "assets" / "aj-gators" / "aj-gators-logo-official.png"
    c.drawImage(ImageReader(str(logo)), width / 2 - 52, height - 132, 104, 104, preserveAspectRatio=True, mask="auto")
    draw_centered(c, "YOUR MENU. THEIR PHONE.", height - 164, 25, "#F6F1E8")
    draw_centered(c, "MENU. GAMES. ONE SCAN.", height - 195, 25, "#E1B52D")
    draw_centered(c, "MENU  +  3 GAMES  +  PROMOTIONS", height - 224, 11, "#B9C8BF")

    qr_size = 146
    left_x, right_x = 72, width - 72 - qr_size
    qr_y = 330
    for x, image_path in ((left_x, demo_qr), (right_x, proof_qr)):
        c.setFillColor(HexColor("#FFFFFF"))
        c.roundRect(x - 8, qr_y - 8, qr_size + 16, qr_size + 16, 8, fill=1, stroke=0)
        c.drawImage(ImageReader(str(image_path)), x, qr_y, qr_size, qr_size, preserveAspectRatio=True, mask="auto")

    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(HexColor("#F6F1E8"))
    c.drawCentredString(left_x + qr_size / 2, qr_y - 28, "SEE YOUR LIVE DEMO")
    c.drawCentredString(right_x + qr_size / 2, qr_y - 28, "SEE VERIFIED LOCAL PROOF")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(HexColor("#AEB8B1"))
    c.drawCentredString(left_x + qr_size / 2, qr_y - 42, "finacalleos.com/demo/aj-gators")
    c.drawCentredString(right_x + qr_size / 2, qr_y - 42, "finacalleos.com/case-studies/colattao")

    draw_centered(c, "STARTING AT $199 / MONTH / LOCATION", 236, 20, "#E1B52D")
    draw_centered(c, "MENU + GAME PACKAGE", 214, 10, "#F6F1E8")
    draw_centered(c, "No guest app. We handle hosting and link support.", 194, 9, "#B9C8BF", "Helvetica")
    draw_centered(c, "Setup, table service, printing and custom work are separate.", 180, 8, "#829089", "Helvetica")

    c.setStrokeColor(HexColor("#E1B52D"))
    c.line(84, 163, width - 84, 163)
    draw_centered(c, "2,874 VISITORS   |   4,599 PAGE VIEWS", 133, 18, "#F6F1E8")
    draw_centered(c, "VERIFIED FIRST 30 DAYS - ONE LOCAL CAFE", 112, 9, "#E1B52D")
    draw_centered(c, "Traffic proof only - no QR-scan, revenue or sales claim.", 94, 8, "#AEB8B1", "Helvetica")
    draw_centered(c, "Built locally. Written scope before approval. Scan now or review later.", 68, 9, "#F6F1E8")
    draw_centered(c, "PENDING CLIENT APPROVAL  |  NO ORDERS  |  NO PAYMENTS  |  NO POS", 42, 7, "#829089")
    c.save()
    return target


def build_black_white() -> Path:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    demo_qr = OUTPUT / "aj-gators-demo-qr-bw.png"
    proof_qr = OUTPUT / "local-proof-qr-bw.png"
    company_qr = OUTPUT / "fina-calle-landing-qr-bw.png"
    make_qr(DEMO_URL, demo_qr, "#000000")
    make_qr(PROOF_URL, proof_qr, "#000000")
    make_qr(FINA_CALLE_URL, company_qr, "#000000")

    source_logo = ROOT / "APP" / "web" / "public" / "assets" / "aj-gators" / "aj-gators-logo-official.png"
    bw_logo = OUTPUT / "aj-gators-logo-black-white.png"
    with Image.open(source_logo).convert("RGBA") as source:
        white = Image.new("RGBA", source.size, "white")
        white.alpha_composite(source)
        grayscale = ImageOps.autocontrast(ImageOps.grayscale(white.convert("RGB")))
        grayscale.save(bw_logo)

    target = OUTPUT / "aj-gators-three-qr-leave-behind-black-white.pdf"
    c = canvas.Canvas(str(target), pagesize=letter)
    width, height = letter
    c.setFillColor(HexColor("#FFFFFF"))
    c.rect(0, 0, width, height, fill=1, stroke=0)

    c.drawImage(ImageReader(str(bw_logo)), width / 2 - 43, height - 108, 86, 86, preserveAspectRatio=True, mask="auto")
    draw_centered(c, "YOUR MENU. THEIR PHONE.", height - 139, 23, "#000000")
    draw_centered(c, "MENU. GAMES. ONE SCAN.", height - 168, 23, "#000000")
    draw_centered(c, "MENU  +  GAMES  +  PROMOTIONS", height - 193, 10, "#333333")

    qr_size = 112
    centers = (104, width / 2, width - 104)
    qr_y = 414
    qr_items = (
        (centers[0], demo_qr, "SEE YOUR DEMO", "finacalleos.com/demo/aj-gators"),
        (centers[1], proof_qr, "SEE LOCAL PROOF", "finacalleos.com/case-studies/colattao"),
        (centers[2], company_qr, "MEET FINA CALLE", "finacalleos.com"),
    )
    for center, image_path, label, url in qr_items:
        x = center - qr_size / 2
        c.setStrokeColor(HexColor("#000000"))
        c.setLineWidth(1.5)
        c.rect(x - 6, qr_y - 6, qr_size + 12, qr_size + 12, fill=0, stroke=1)
        c.drawImage(ImageReader(str(image_path)), x, qr_y, qr_size, qr_size, preserveAspectRatio=True, mask="auto")
        c.setFillColor(HexColor("#000000"))
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(center, qr_y - 23, label)
        c.setFillColor(HexColor("#555555"))
        c.setFont("Helvetica", 5.8)
        c.drawCentredString(center, qr_y - 36, url)

    draw_centered(c, "THREE QR CODES WALK INTO A BAR.", 350, 11, "#000000")
    draw_centered(c, "THE OWNER SAYS: 'FINALLY - A TEAM THAT WORKS EVERY TABLE.'", 333, 10, "#333333")

    c.setStrokeColor(HexColor("#000000"))
    c.line(70, 306, width - 70, 306)
    draw_centered(c, "STARTING AT $199 / MONTH / LOCATION", 273, 19, "#000000")
    draw_centered(c, "MENU + GAME PACKAGE", 252, 10, "#000000")
    draw_centered(c, "No guest app. We handle hosting and link support.", 232, 9, "#333333", "Helvetica")
    draw_centered(c, "Setup, table service, printing and custom work are separate.", 217, 8, "#555555", "Helvetica")

    c.line(70, 192, width - 70, 192)
    draw_centered(c, "2,874 VISITORS   |   4,599 PAGE VIEWS", 160, 17, "#000000")
    draw_centered(c, "VERIFIED FIRST 30 DAYS - ONE LOCAL CAFE", 139, 9, "#000000")
    draw_centered(c, "Traffic proof only - no QR-scan, revenue or sales claim.", 120, 8, "#555555", "Helvetica")
    draw_centered(c, "Built locally. Written scope before approval. Scan now or review later.", 88, 9, "#000000")
    draw_centered(c, "PENDING CLIENT APPROVAL  |  NO ORDERS  |  NO PAYMENTS  |  NO POS", 48, 7, "#555555")
    c.save()
    return target


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build the Gators QR leave-behind.")
    parser.add_argument("--variant", choices=("black-white", "color", "all"), default="black-white")
    args = parser.parse_args()
    if args.variant in {"color", "all"}:
        print(build())
    if args.variant in {"black-white", "all"}:
        print(build_black_white())
