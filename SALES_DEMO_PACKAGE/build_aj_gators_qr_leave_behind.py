from pathlib import Path

import qrcode
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "aj-gators"
DEMO_URL = "https://finacalleos.com/demo/aj-gators"
PROOF_URL = "https://finacalleos.com/case-studies/colattao"


def make_qr(url: str, path: Path) -> None:
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=12, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    qr.make_image(fill_color="#07100d", back_color="white").save(path)


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
    draw_centered(c, "MORE REASONS TO STAY.", height - 195, 25, "#E1B52D")
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

    draw_centered(c, "$150 / MONTH / LOCATION", 236, 24, "#E1B52D")
    draw_centered(c, "MENU + GAME PACKAGE", 214, 10, "#F6F1E8")
    draw_centered(c, "No guest app. We handle setup and support.", 194, 9, "#B9C8BF", "Helvetica")
    draw_centered(c, "Table service, setup and printing are scoped separately.", 180, 8, "#829089", "Helvetica")

    c.setStrokeColor(HexColor("#E1B52D"))
    c.line(84, 163, width - 84, 163)
    draw_centered(c, "2,874 VISITORS   |   4,599 PAGE VIEWS", 133, 18, "#F6F1E8")
    draw_centered(c, "VERIFIED FIRST 30 DAYS - ONE LOCAL CAFE", 112, 9, "#E1B52D")
    draw_centered(c, "Traffic proof only - no QR-scan, revenue or sales claim.", 94, 8, "#AEB8B1", "Helvetica")
    draw_centered(c, "Built locally. Written scope before approval. Scan now or review later.", 68, 9, "#F6F1E8")
    draw_centered(c, "PENDING CLIENT APPROVAL  |  NO ORDERS  |  NO PAYMENTS  |  NO POS", 42, 7, "#829089")
    c.save()
    return target


if __name__ == "__main__":
    print(build())
