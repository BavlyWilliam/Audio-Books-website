"""Tracked QR codes for the audio pages (24 Oct 2026).

Each code opens https://parla-qr.bavlywilliamwork.workers.dev/q/<code>. The Worker (tracking/worker.js) records the
scan in the D1 database "parla-tracking" and sends the phone on to the book's page. A new code for a new placement
(a flyer, a poster, the back cover) needs no change to the Worker: the part before the first dash picks the book.

    python tracking/make_qr.py a2-book a1-book a2-flyer-nov

Output in qr/: <code>-scan-qr.svg, <code>-scan-qr.png, <code>-scan-qr-labelled.png
"""
import sys
from pathlib import Path

import segno
from PIL import Image, ImageDraw, ImageFont

BASE = "https://parla-qr.bavlywilliamwork.workers.dev/q/"
INK, GREEN = "#282923", "#477356"
OUT = Path(__file__).resolve().parent.parent / "qr"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def label_for(code: str) -> str:
    book = code.split("-")[0].upper()
    return f"Parla Italiano {book} · Audio"


def make(code: str) -> None:
    qr = segno.make(BASE + code, error="h")
    stem = OUT / f"{code}-scan-qr"
    qr.save(f"{stem}.svg", scale=10, border=4, dark=INK)
    qr.save(f"{stem}.png", scale=30, border=4, dark=INK)
    img = Image.open(f"{stem}.png").convert("RGB")
    w, h = img.size
    canvas = Image.new("RGB", (w, h + 220), "white")
    canvas.paste(img, (0, 0))
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype(FONT, 64)
    text = label_for(code)
    tw = draw.textlength(text, font=font)
    draw.text(((w - tw) / 2, h + 40), text, fill=GREEN, font=font)
    canvas.save(f"{stem}-labelled.png", dpi=(300, 300))
    print("wrote", stem.name, BASE + code)


if __name__ == "__main__":
    for c in sys.argv[1:] or ["a2-book", "a1-book"]:
        make(c)
