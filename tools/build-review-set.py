#!/usr/bin/env python3
"""
Build the review set that ships with the v3.0 handover.

The full-resolution captures in `docs/mockups/` are 187 MB of 2× PNG — right
for zooming into, far too heavy to hand over or to attach to an email. This
produces the version that does travel:

  sheet-<locale>.png           the desktop contact sheet per locale
  full/<locale>/*.jpg          every page as a 1440-wide JPEG
  full/mobile-<locale>/*.jpg   every page as a 390-wide JPEG

The full-resolution PNGs stay in `docs/mockups/` in the project.

There is deliberately no mobile contact sheet: a 390-wide full-page capture
is roughly 10,000 px tall, and tiling ten of those produces a 21,000 px sheet
that cannot be opened. The mobile pages ship as individual JPEGs instead.

Run:  python3 tools/build-review-set.py
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MOCKUPS = ROOT / "docs" / "mockups"
REVIEW = ROOT / "docs" / "review-set"

LOCALES = ["en", "zh-Hant", "zh-Hans"]
QUALITY = 82


def convert(src_dir: Path, dest_dir: Path, max_width: int) -> int:
    dest_dir.mkdir(parents=True, exist_ok=True)
    count = 0
    for png in sorted(src_dir.glob("*.png")):
        with Image.open(png) as img:
            img = img.convert("RGB")
            if img.width > max_width:
                height = round(img.height * max_width / img.width)
                img = img.resize((max_width, height), Image.LANCZOS)
            img.save(dest_dir / f"{png.stem}.jpg", "JPEG", quality=QUALITY, optimize=True, progressive=True)
            count += 1
    return count


def main() -> int:
    if REVIEW.exists():
        shutil.rmtree(REVIEW)
    REVIEW.mkdir(parents=True, exist_ok=True)

    count = 0

    for locale in LOCALES:
        # The desktop contact sheet, copied from the one already built.
        sheet = MOCKUPS / f"sheet-{locale}.png"
        if sheet.exists():
            shutil.copy2(sheet, REVIEW / sheet.name)

        # Full pages at desktop width.
        src = MOCKUPS / locale
        if src.exists():
            count += convert(src, REVIEW / "full" / locale, 1440)

        # Full pages at phone width.
        mobile = MOCKUPS / "mobile" / locale
        if mobile.exists():
            count += convert(mobile, REVIEW / "full" / f"mobile-{locale}", 390)

    total = sum(f.stat().st_size for f in REVIEW.rglob("*") if f.is_file())
    print(f"{count} full-page JPEGs written to {REVIEW}")
    print(f"review set total: {total / 1024 / 1024:.1f} MB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
