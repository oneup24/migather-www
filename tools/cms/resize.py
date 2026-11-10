#!/usr/bin/env python3
"""
Resize a case image to the width the site serves it at.

The CMS accepts whatever an editor uploads from their phone. A 4000-pixel
photograph is wasted weight on a page whose images are shown at most at
1600 pixels wide, so the sync scales it down before it is committed.

An image that is already within the limit is copied byte for byte — it is
not re-encoded, because re-encoding a JPEG that is already the right size
loses quality for no gain.

Usage:
    python3 tools/cms/resize.py <source> <destination> [max-width]

Pillow is the only dependency:
    pip install pillow
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

MAX_WIDTH = 1600


def fail(message: str) -> "NoReturn":  # noqa: F821
    print(f"resize-image: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> int:
    if len(sys.argv) < 3:
        fail("usage: resize.py <source> <destination> [max-width]")
        return 1

    source = Path(sys.argv[1])
    destination = Path(sys.argv[2])
    max_width = int(sys.argv[3]) if len(sys.argv) > 3 else MAX_WIDTH

    if not source.exists():
        fail(f"{source} does not exist")
        return 1

    try:
        from PIL import Image
    except ImportError:
        fail(
            "Pillow is not installed. Run `pip install pillow` — the sync needs it "
            "to size the images it downloads."
        )
        return 1

    destination.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as image:
        if image.width <= max_width:
            # Already small enough — copy it rather than re-encoding it.
            shutil.copyfile(source, destination)
            print(f"  {destination.name}: {image.width}px wide, copied as it is")
            return 0

        height = round(image.height * (max_width / image.width))
        resized = image.resize((max_width, height), Image.LANCZOS)

        if image.format == "PNG":
            resized.save(destination, format="PNG", optimize=True)
        else:
            resized.convert("RGB").save(destination, format="JPEG", quality=85, optimize=True)

    print(f"  {destination.name}: scaled to {max_width}px wide")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
