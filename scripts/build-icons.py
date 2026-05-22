"""Crop launcher art and write favicon / PWA icon sizes."""
from pathlib import Path

from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "source-icon.png"
OUT = ROOT / "icons"

# Cream background in source (~#FCFAF5)
BG_RGB = (252, 250, 245)
PADDING_RATIO = 0.12


def content_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    """Bounding box of non-background ink."""
    rgb = img.convert("RGB")
    bg = Image.new("RGB", rgb.size, BG_RGB)
    diff = ImageChops.difference(rgb, bg)
    gray = diff.convert("L")
    # Ignore very light noise; keep line art + shadow
    mask = gray.point(lambda p: 255 if p > 18 else 0)
    box = mask.getbbox()
    if not box:
        return (0, 0, rgb.width, rgb.height)
    return box


def crop_square(img: Image.Image) -> Image.Image:
    x0, y0, x1, y1 = content_bbox(img)
    w, h = x1 - x0, y1 - y0
    pad = int(max(w, h) * PADDING_RATIO)
    cx = (x0 + x1) // 2
    cy = (y0 + y1) // 2
    side = max(w, h) + pad * 2
    left = max(0, cx - side // 2)
    top = max(0, cy - side // 2)
    right = min(img.width, left + side)
    bottom = min(img.height, top + side)
    # Re-center if clamped at edges
    if right - left < side:
        left = max(0, right - side)
    if bottom - top < side:
        top = max(0, bottom - side)
    cropped = img.crop((left, top, right, bottom))
    return ImageOps.fit(cropped, (min(cropped.size), min(cropped.size)), method=Image.Resampling.LANCZOS)


def save_sizes(square: Image.Image) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    rgb = square.convert("RGB")

    sizes = [
        ("icon-512.png", 512),
        ("icon-192.png", 192),
        ("apple-touch-icon.png", 180),
        ("favicon-32.png", 32),
        ("favicon-16.png", 16),
    ]
    for name, size in sizes:
        out = rgb.resize((size, size), Image.Resampling.LANCZOS)
        out.save(OUT / name, optimize=True)

    rgb.resize((32, 32), Image.Resampling.LANCZOS).save(
        OUT / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32)],
    )


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source: {SRC}")
    OUT.mkdir(parents=True, exist_ok=True)
    img = Image.open(SRC)
    square = crop_square(img)
    square.save(OUT / "icon-source-cropped.png", optimize=True)
    save_sizes(square)
    print(f"Wrote icons to {OUT}")


if __name__ == "__main__":
    main()
