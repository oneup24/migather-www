#!/usr/bin/env python3
"""
Resize and re-encode the generated mock-up imagery for the web.

The generator returns 2K or 1K originals that are far too heavy to ship
(a single hero came back at 3.7 MB). This turns every raw file into a
progressive JPEG at a size the browser can actually load, and reports
before/after so the saving is visible rather than assumed.

Widths are chosen per role, not globally:

    hero-* / work-hero / about-hero / capabilities-hero / careers-hero
        full-bleed banners — 2400px wide
    home-manifesto / about-studio / contact-city
        editorial in-body images — 1400px wide
    case-*
        work-grid cards — 1200px wide

Run:  python3 tools/media/optimize.py
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "tools" / "media" / "_masters"
OUT = ROOT / "public" / "media"

HERO_WIDTH = 2400
FEATURE_WIDTH = 1400
CASE_WIDTH = 1200

HERO_NAMES = {
    "hero-cinema",
    "work-hero",
    "about-hero",
    "capabilities-hero",
    "careers-hero",
}
FEATURE_NAMES = {"home-manifesto", "about-studio", "contact-city"}


def target_width(stem: str) -> int:
    if stem in HERO_NAMES:
        return HERO_WIDTH
    if stem in FEATURE_NAMES:
        return FEATURE_WIDTH
    return CASE_WIDTH


def human(size: int) -> str:
    return f"{size / 1024:.0f} KB" if size < 1024 * 1024 else f"{size / 1024 / 1024:.1f} MB"


def main() -> int:
    if not RAW.exists():
        print(f"no masters folder at {RAW}", file=sys.stderr)
        return 1

    raw_files = sorted(p for p in RAW.iterdir() if p.is_file())
    if not raw_files:
        print("no master files to optimise", file=sys.stderr)
        return 1

    before = 0
    after = 0
    for raw in raw_files:
        stem = raw.stem
        width = target_width(stem)

        with Image.open(raw) as img:
            img = img.convert("RGB")
            if img.width > width:
                height = round(img.height * width / img.width)
                img = img.resize((width, height), Image.LANCZOS)
            dest = OUT / f"{stem}.jpg"
            img.save(dest, "JPEG", quality=84, optimize=True, progressive=True)

        before += raw.stat().st_size
        after += dest.stat().st_size
        print(f"{stem:<20} {img.width:>5}x{img.height:<5} {human(dest.stat().st_size):>9}")

    print(f"\n{len(raw_files)} files · {human(before)} → {human(after)} "
          f"({100 - round(after / before * 100)}% smaller)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
