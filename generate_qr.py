"""Generate the single QR code for the Parla Italiano audiobook website.

Usage:
    python generate_qr.py

Output:
    qr_codes/parla_italiano_a1_qr.png
"""

from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_H


WEBSITE_URL = "https://bavlywilliam.github.io/Audio-Books-website/"
OUTPUT_DIR = Path(__file__).resolve().parent / "qr_codes"
OUTPUT_FILE = OUTPUT_DIR / "parla_italiano_a1_qr.png"


def generate_qr_code(url: str, output_file: Path) -> None:
    """Generate a high-resolution, print-safe QR code."""
    output_file.parent.mkdir(parents=True, exist_ok=True)

    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=20,
        border=5,
    )

    qr.add_data(url)
    qr.make(fit=True)

    image = qr.make_image(
        fill_color="black",
        back_color="white",
    ).convert("RGB")

    # 300 DPI is suitable for high-quality print workflows.
    image.save(output_file, format="PNG", dpi=(300, 300))


def main() -> None:
    generate_qr_code(WEBSITE_URL, OUTPUT_FILE)

    print("QR code generated successfully.")
    print(f"Destination: {WEBSITE_URL}")
    print(f"Output:     {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
