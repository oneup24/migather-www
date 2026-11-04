#!/usr/bin/env python3
"""
Contact sheet of the captured mock-up screens.

One thumbnail per page, scaled to a common width and tiled, so a whole
locale can be reviewed in a single look before any individual page is
opened. Page numbers are printed on each tile in reading order.

Run:  python3 tools/contact-sheet.py [--locale en] [--columns 5]
"""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
MOCKUPS = ROOT / "docs" / "mockups"

TILE_W = 460
LABEL_H = 26
PAD = 14
BG = (24, 26, 30)
INK = (238, 238, 238)
DIM = (150, 152, 158)


def load_font(size: int):
    for candidate in (
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ):
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--locale", default="en")
    parser.add_argument("--columns", type=int, default=5)
    parser.add_argument("--source", default=None, help="folder of screens (default docs/mockups/<locale>)")
    parser.add_argument("--out", default=None, help="output folder (default docs/mockups)")
    args = parser.parse_args()

    src = Path(args.source) if args.source else MOCKUPS / args.locale
    out_dir = Path(args.out) if args.out else MOCKUPS
    files = sorted(src.glob("*.png"))
    if not files:
        print(f"no screens in {src}")
        return 1

    title_font = load_font(20)
    label_font = load_font(15)

    tiles = []
    for path in files:
        with Image.open(path) as img:
            img = img.convert("RGB")
            ratio = TILE_W / img.width
            thumb = img.resize((TILE_W, max(1, round(img.height * ratio))), Image.LANCZOS)
        tiles.append((path.stem, thumb))

    cols = args.columns
    rows = (len(tiles) + cols - 1) // cols

    row_heights = []
    for r in range(rows):
        row = tiles[r * cols : (r + 1) * cols]
        row_heights.append(max(t.height for _, t in row) + LABEL_H)

    header = 58
    width = PAD + cols * (TILE_W + PAD)
    height = header + PAD + sum(h + PAD for h in row_heights)

    sheet = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(sheet)
    draw.text(
        (PAD, 18),
        f"Migather website v3.0 — mock-up screens · {args.locale} · {len(tiles)} pages",
        font=title_font,
        fill=INK,
    )

    y = header
    for r in range(rows):
        x = PAD
        for name, thumb in tiles[r * cols : (r + 1) * cols]:
            draw.text((x, y + 4), name, font=label_font, fill=DIM)
            sheet.paste(thumb, (x, y + LABEL_H))
            draw.rectangle(
                [x, y + LABEL_H, x + thumb.width - 1, y + LABEL_H + thumb.height - 1],
                outline=(58, 62, 68),
            )
            x += TILE_W + PAD
        y += row_heights[r] + PAD

    dest = out_dir / f"sheet-{args.locale}.png"
    sheet.save(dest)
    print(f"{dest}  ({width}x{height})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
