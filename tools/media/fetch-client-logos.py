#!/usr/bin/env python3
"""
Fetch the client marks for the homepage logo wall.

Every mark is fetched from the brand's own site, from Wikimedia, or from the
agency's own credential deck — never from an aggregator. Each entry in the
manifest below lists its sources in priority order; the first one that
downloads and opens cleanly is kept.

    python3 tools/media/fetch-client-logos.py [--force]
    python3 tools/media/fetch-client-logos.py --pdf "<credential pdf>" --pptx "<credential pptx>"

Sources ending in `.svg` stay vectors — the browser scales them. Raster marks
are trimmed of their blank border and scaled to a common height so the wall
reads as one grid. A mark that is white-on-transparent (a logo cut for a dark
header) is re-inked in the house ink colour, because the wall is printed on
white.

Output: `public/media/clients/<slug>.<ext>`

Requires `pillow`; `pymupdf` only if the credential PDF is used.
"""

import argparse
import io
import os
import ssl
import subprocess
import sys
import urllib.request
import zipfile

from PIL import Image, ImageChops, ImageStat

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT_DIR = os.path.join(ROOT, "public", "media", "clients")

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)

# The house ink colour — used when a mark has to be re-inked for a white page.
INK = (26, 26, 26)

# Raster marks are trimmed and scaled to a common height.
TARGET_HEIGHT = 160
MAX_WIDTH = 520

# slug -> list of sources.
#   "url"      — fetched over http(s)
#   "deck"     — cropped from the credential PDF, the page number and the
#                quarter of the page the mark sits in
#   "pptx"     — a file inside the credential deck
DECK_CROP = "crop"
DECK_PPTX = "pptx"

MANIFEST = {
    "huatai-finance": [
        {"url": "https://commons.wikimedia.org/wiki/Special:FilePath/Huatai%20Securities.png"},
        {DECK_PPTX: "image69.png"},
    ],
    "bank-of-china-hk": [
        {"url": "https://www.bochk.com/etc/designs/bochk_web/images/logo.png"},
    ],
    "hang-seng-bank": [],
    "fubon-bank": [
        {"url": "https://www.fubonbank.com.hk/images/logo.jpg"},
    ],
    "wing-fung": [
        {DECK_CROP: {"page": 22, "where": "top-right"}},
        {"url": "https://wingfunggroup.com/wp-content/uploads/2018/02/WF-logo_burned.png"},
    ],
    "atfx": [
        {"url": "https://www.atfx.com/hubfs/Footer_Design_2022/ATFX_logo.svg"},
    ],
    "icbc-asia": [
        {"url": "https://www.icbcasia.com/userfiles/resources/icbc/asia/img/home_mobile_menu_logo_1.5x.png"},
        {DECK_PPTX: "image53.png"},
    ],
    "ctf-life": [
        {"url": "https://www.ctflife.com.hk/assets/icons/logo_clf.svg"},
    ],
    "new-world-development": [
        {DECK_CROP: {"page": 25, "where": "top-right"}},
        {"url": "https://zh.wikipedia.org/wiki/Special:FilePath/NewWorldDevelopment%20logo.svg"},
    ],
    "chinachem": [
        {"url": "https://zh.wikipedia.org/wiki/Special:FilePath/SinoGroup%20logo.svg"},
    ],
    "lee-gardens": [
        {DECK_CROP: {"page": 23, "where": "top-right"}},
        {DECK_PPTX: "image100.jpeg"},
    ],
    "k11-musea": [
        {DECK_CROP: {"page": 9, "where": "top-right"}},
        {"url": "https://images.k11musea.com/media/1318/logo.svg"},
    ],
    "marks-spencer": [
        {DECK_CROP: {"page": 16, "where": "top-right"}},
        {"url": "https://commons.wikimedia.org/wiki/Special:FilePath/MARKS%20%26%20Spencer%20logo.svg"},
    ],
    # 11skies.com is a parked domain — it serves a registrar's logo, not the
    # mall's. The client has no mark we could fetch honestly, so their cell
    # in the wall carries the name.
    "11-skies": [],
    "v-city": [
        {"url": "https://www.vcity.com.hk/tch/images/logo.png"},
    ],
    "h-queens": [
        {DECK_CROP: {"page": 10, "where": "top-right"}},
        {"url": "https://www.hqueens.com.hk/images/common/hQueenLogo.png"},
    ],
    "hktdc": [
        {DECK_CROP: {"page": 20, "where": "top-right"}},
        {"url": "https://zh.wikipedia.org/wiki/Special:FilePath/Hong%20Kong%20Trade%20Development%20Council%20logo.svg"},
    ],
    "beauty-express": [
        {"url": "https://bexgrp.com/wp-content/themes/bexgrp/assets/logo-black.svg"},
    ],
    "beauty-avenue": [
        {DECK_CROP: {"page": 19, "where": "top-right"}},
    ],
    "invisalign": [
        {"url": "https://commons.wikimedia.org/wiki/Special:FilePath/Invisalign%20Logo.svg"},
    ],
    "iberico": [
        {DECK_CROP: {"page": 18, "where": "top-right"}},
    ],
    "mando": [
        {DECK_CROP: {"page": 22, "where": "top-right"}},
    ],
    "qpet": [],
    "central-market": [
        {"url": "https://www.centralmarket.hk/images-local/logo-2.png"},
    ],
    "christies": [
        {"url": "https://commons.wikimedia.org/wiki/Special:FilePath/Christie%27s%20Logo.svg"},
    ],
    "mtr": [
        {"url": "https://en.wikipedia.org/wiki/Special:FilePath/HK%20MTR%20logo.svg"},
    ],
    "hkjc": [
        {"url": "https://en.wikipedia.org/wiki/Special:FilePath/Hong%20Kong%20Jockey%20Club%20full%20logo.svg"},
    ],
}


def fetch(url):
    """Fetch a URL. urllib first, curl as the fallback — some hosts answer
    urllib with a 403 and curl with a 200, and the other way round."""
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
        with urllib.request.urlopen(req, timeout=45, context=ctx) as res:
            return res.read()
    except Exception:  # noqa: BLE001 - fall through to curl
        pass
    result = subprocess.run(
        ["curl", "-sL", "--max-time", "45", "-A", UA, url], capture_output=True, check=False
    )
    if result.returncode != 0 or not result.stdout:
        raise OSError(f"fetch failed for {url}")
    return result.stdout


def is_svg(data):
    head = data[:400].lstrip()
    return head.startswith(b"<svg") or (head.startswith(b"<?xml") and b"<svg" in data[:2000])


def trim(im):
    """Drop the blank border around a mark."""
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    alpha = im.split()[-1]
    box = alpha.point(lambda p: 255 if p > 12 else 0).getbbox()
    if box:
        im = im.crop(box)
    return im


def background_colour(im):
    """The colour of the blank area around a mark — the border pixels."""
    px = im.load()
    edge = []
    for x in range(0, im.width, max(1, im.width // 24)):
        edge.append(px[x, 0])
        edge.append(px[x, im.height - 1])
    for y in range(0, im.height, max(1, im.height // 24)):
        edge.append(px[0, y])
        edge.append(px[im.width - 1, y])
    edge = [p for p in edge if p[3] > 200]
    if not edge:
        return (255, 255, 255, 255)
    return tuple(sorted(p[i] for p in edge)[len(edge) // 2] for i in range(4))


def normalise_raster(data, out_path):
    """Cut a mark out of whatever it arrived on, and put it on white.

    Three cases, in the order they are met:

      1. The file already carries transparency — the mark is what the alpha
         holds, so the alpha is kept. If what shows through is white, it is
         a mark cut for a dark header, and it is re-inked.
      2. The file is opaque on a light ground — the ground is measured from
         the border and removed, and the mark keeps its own colours.
      3. The file is opaque on a dark ground — a stencil inverted by a
         document converter. The light part is the mark; it is re-inked.
    """
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    alpha = im.split()[-1]
    a_min, a_max = alpha.getextrema()

    if a_min < 250:
        # 1 — real transparency.
        visible = Image.new("RGB", im.size, (255, 255, 255))
        visible.paste(im.convert("RGB"), (0, 0), alpha)
        if ImageStat.Stat(visible).mean[0] > 225:
            im = Image.merge(
                "RGBA",
                (
                    Image.new("L", im.size, INK[0]),
                    Image.new("L", im.size, INK[1]),
                    Image.new("L", im.size, INK[2]),
                    alpha,
                ),
            )
    else:
        bg = background_colour(im)
        if sum(bg[:3]) / 3 > 200:
            # 2 — opaque on white.
            diff = ImageChops.difference(im, Image.new("RGBA", im.size, bg)).convert("L")
            im.putalpha(diff.point(lambda p: 255 if p > 10 else 0))
        else:
            # 3 — inverted stencil.
            lum = im.convert("L")
            im = Image.merge(
                "RGBA",
                (
                    Image.new("L", im.size, INK[0]),
                    Image.new("L", im.size, INK[1]),
                    Image.new("L", im.size, INK[2]),
                    lum,
                ),
            )

    im = trim(im)
    if im.height > TARGET_HEIGHT:
        ratio = TARGET_HEIGHT / im.height
        im = im.resize((max(1, round(im.width * ratio)), TARGET_HEIGHT), Image.LANCZOS)
    if im.width > MAX_WIDTH:
        ratio = MAX_WIDTH / im.width
        im = im.resize((MAX_WIDTH, max(1, round(im.height * ratio))), Image.LANCZOS)
    im.save(out_path, "PNG", optimize=True)
    return im.size


def deck_crop(spec, pdf_path):
    """Crop the client mark from the corner of a credential page."""
    if not pdf_path or not os.path.exists(pdf_path):
        return None
    try:
        import pymupdf
    except ImportError:
        return None
    doc = pymupdf.open(pdf_path)
    page = doc[spec["page"] - 1]
    for info in page.get_image_info():
        x0, y0, x1, y1 = info["bbox"]
        if spec["where"] == "top-right" and x0 > 690 and y0 < 170 and (x1 - x0) > 40:
            pix = page.get_pixmap(clip=pymupdf.Rect(x0, y0, x1, y1), dpi=260)
            return pix.tobytes("png")
    return None


def deck_pptx(member, pptx_path):
    if not pptx_path or not os.path.exists(pptx_path):
        return None
    with zipfile.ZipFile(pptx_path) as zf:
        try:
            return zf.read("ppt/media/" + member)
        except KeyError:
            return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", help="path to the credential .pdf")
    parser.add_argument("--pptx", help="path to the credential .pptx")
    parser.add_argument("--force", action="store_true", help="re-fetch marks already on disk")
    parser.add_argument(
        "--normalise",
        action="store_true",
        help="re-trim and re-scale the marks already on disk, without fetching",
    )
    args = parser.parse_args()

    os.makedirs(OUT_DIR, exist_ok=True)
    report = []

    if args.normalise:
        for name in sorted(os.listdir(OUT_DIR)):
            path = os.path.join(OUT_DIR, name)
            if name.endswith(".svg"):
                report.append((name[:-4], "vector — untouched", ""))
                continue
            with open(path, "rb") as fh:
                data = fh.read()
            size = normalise_raster(data, path)
            report.append((name[:-4], f"normalised png {size[0]}x{size[1]}", ""))
        width = max(len(r[0]) for r in report) + 2
        for slug, source, note in report:
            print(f"{slug:<{width}} {note:<22} {source}")
        return 0

    for slug, sources in MANIFEST.items():
        existing = [f for f in os.listdir(OUT_DIR) if f.startswith(slug + ".")]
        if existing and not args.force:
            report.append((slug, "already on disk", existing[0]))
            continue

        saved = None
        for source in sources:
            try:
                if DECK_CROP in source:
                    data = deck_crop(source[DECK_CROP], args.pdf)
                    label = f"credential pdf p{source[DECK_CROP]['page']}"
                elif DECK_PPTX in source:
                    data = deck_pptx(source[DECK_PPTX], args.pptx)
                    label = f"credential deck {source[DECK_PPTX]}"
                else:
                    data = fetch(source["url"])
                    label = source["url"]
            except Exception as exc:  # noqa: BLE001 - try the next source
                report.append((slug, f"FAILED {type(exc).__name__}", ""))
                continue
            if not data:
                report.append((slug, "NO DATA", label))
                continue
            if is_svg(data):
                with open(os.path.join(OUT_DIR, f"{slug}.svg"), "wb") as fh:
                    fh.write(data)
                saved = (label, "svg")
                break
            try:
                size = normalise_raster(data, os.path.join(OUT_DIR, f"{slug}.png"))
            except Exception as exc:  # noqa: BLE001
                report.append((slug, f"NOT AN IMAGE {type(exc).__name__}", label))
                continue
            saved = (label, f"png {size[0]}x{size[1]}")
            break

        report.append((slug, saved[0], saved[1]) if saved else (slug, "NO SOURCE WORKED", ""))

    width = max(len(r[0]) for r in report) + 2
    for slug, source, note in report:
        print(f"{slug:<{width}} {note:<22} {source}")
    missing = [r[0] for r in report if r[1] == "NO SOURCE WORKED"]
    if missing:
        print("\nNo mark for: " + ", ".join(missing))
    return 0


if __name__ == "__main__":
    sys.exit(main())
