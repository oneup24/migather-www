#!/usr/bin/env python3
"""
Build the review gallery from the captured mock-up screens.

The team needs one URL to open, not 60 file paths. This generates a single
static page that shows the contact sheets first and then every screen,
grouped by language and device, with each one linking to its full-size JPEG.

Run:  python3 tools/build-review-set.py && python3 tools/build-review-gallery.py

Output:  docs/review-set/index.html

The gallery is published on a `gh-pages` branch so the whole review set can be
shared with a link. It shows the same mock-up disclosure the site itself
carries, because these screens show artwork that is not client photography and
they sit next to real, sourced client results.
"""
from __future__ import annotations

import html
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REVIEW = ROOT / "docs" / "review-set"

# The order the pages are reviewed in — the same order as REVIEW_GUIDE.md.
PAGES = [
    ("home", "Homepage"),
    ("work", "Work index"),
    ("work-huatai", "Case — Huatai Finance HK"),
    ("work-christies", "Case — Christie's Auction"),
    ("services", "Services"),
    ("about", "About"),
    ("careers", "Careers"),
    ("contact", "Contact"),
    ("legal-privacy", "Privacy Policy"),
    ("not-found", "404 page"),
]

LOCALES = [
    ("en", "English", "English"),
    ("zh-Hant", "繁體中文", "Traditional Chinese"),
    ("zh-Hans", "简体中文", "Simplified Chinese"),
]

SHEETS = [
    ("sheet-en.png", "English — all 10 pages"),
    ("sheet-zh-Hant.png", "繁體中文 — all 10 pages"),
    ("sheet-zh-Hans.png", "简体中文 — all 10 pages"),
]

AS_OF = "4 November 2026"


def esc(text: str) -> str:
    return html.escape(text, quote=True)


def screen_grid(folder: str) -> str:
    """A grid of cards for one locale/device folder."""
    items = []
    for slug, label in PAGES:
        path = f"full/{folder}/{slug}.jpg"
        if not (REVIEW / path).exists():
            continue
        items.append(
            f"""      <figure class="card">
        <a href="{esc(path)}" target="_blank" rel="noreferrer">
          <img src="{esc(path)}" alt="Mock-up screen — {esc(label)}" loading="lazy" />
        </a>
        <figcaption>{esc(label)}</figcaption>
      </figure>"""
        )
    return "\n".join(items)


def section(title: str, note: str, folder: str) -> str:
    return f"""
  <section class="block">
    <h2>{esc(title)}</h2>
    <p class="note">{esc(note)}</p>
    <div class="grid">
{screen_grid(folder)}
    </div>
  </section>"""


def build() -> str:
    sheets = "\n".join(
        f"""      <figure class="card card--sheet">
        <a href="{esc(src)}" target="_blank" rel="noreferrer">
          <img loading="eager" src="{esc(src)}" alt="{esc(label)}" />
        </a>
        <figcaption>{esc(label)}</figcaption>
      </figure>"""
        for src, label in SHEETS
        if (REVIEW / src).exists()
    )

    locale_blocks = []
    for code, native, english in LOCALES:
        locale_blocks.append(section(f"{native} · {english}", "Desktop, 1440 × 900.", code))
        locale_blocks.append(
            section(f"{native} · {english} — phone", "Phone, 390 × 844.", f"mobile-{code}")
        )

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Migather website v3.0 — design preview</title>
<style>
  :root {{
    --ink: #1c1c1c;
    --muted: #6b6b6b;
    --surface: #f6f4f1;
    --rule: #dedbd6;
    --blue: #016da9;
    --crimson: #950534;
    --paper: #ffffff;
  }}
  * {{ box-sizing: border-box; }}
  html {{ -webkit-text-size-adjust: 100%; }}
  body {{
    margin: 0;
    background: var(--paper);
    color: var(--ink);
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    font-size: 16px;
    line-height: 1.6;
  }}
  .wrap {{ max-width: 1240px; margin: 0 auto; padding: 0 32px 96px; }}
  header.top {{ padding: 72px 0 40px; border-bottom: 1px solid var(--rule); }}
  .eyebrow {{
    font-family: "Jost", "Inter", sans-serif;
    font-size: 11.5px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--muted);
  }}
  h1 {{
    font-family: "Playfair Display", Georgia, "Times New Roman", serif;
    font-weight: 400; font-size: clamp(2rem, 4.4vw, 3.2rem); line-height: 1.1;
    margin: 18px 0 0; letter-spacing: -0.015em;
  }}
  h1 em {{ font-style: normal; color: var(--crimson); }}
  .lede {{ max-width: 62ch; margin: 22px 0 0; color: #3d3d3d; font-size: 17px; }}
  .notice {{
    margin: 36px 0 0; border-left: 3px solid var(--crimson);
    background: var(--surface); padding: 18px 22px;
  }}
  .notice strong {{
    display: block; font-family: "Jost", "Inter", sans-serif;
    font-size: 11.5px; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--crimson); margin-bottom: 6px;
  }}
  .notice p {{ margin: 0; font-size: 14.5px; color: #3d3d3d; }}
  .block {{ padding-top: 56px; }}
  h2 {{
    font-family: "Jost", "Inter", sans-serif;
    font-size: 13px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
    margin: 0;
  }}
  .note {{ margin: 6px 0 24px; color: var(--muted); font-size: 14px; }}
  .grid {{
    display: grid; gap: 26px;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }}
  .card {{ margin: 0; }}
  .card img {{
    display: block; width: 100%; height: auto;
    border: 1px solid var(--rule); background: var(--surface);
  }}
  .card figcaption {{
    margin-top: 9px; font-size: 13px; color: var(--muted);
    font-family: "Jost", "Inter", sans-serif; letter-spacing: 0.04em;
  }}
  .card--sheet img {{ border-color: var(--rule); }}
  footer.top {{
    margin-top: 72px; padding-top: 28px; border-top: 1px solid var(--rule);
    color: var(--muted); font-size: 13.5px;
  }}
  footer.top p {{ margin: 0 0 8px; }}
  @media (max-width: 640px) {{
    .wrap {{ padding: 0 18px 64px; }}
    header.top {{ padding: 44px 0 30px; }}
  }}
</style>
</head>
<body>
  <div class="wrap">
    <header class="top">
      <div class="eyebrow">Migather Limited · Website v3.0 · Design preview</div>
      <h1>Big-agency standards,<br /><em>from people who answer the phone.</em></h1>
      <p class="lede">
        Every screen of the rebuilt website — 10 pages in English, 繁體中文 and
        简体中文, at desktop and phone width. Click any screen to open it full size.
      </p>

      <div class="notice">
        <strong>Mock-up imagery — not client photography</strong>
        <p>
          Every photograph in this build is generated placeholder artwork, not
          client photography. It is labelled on screen, in the alt text, in the
          footer of every page and on each case page. It sits directly beside
          real, sourced client results, which is exactly why it is labelled.
          The site is <b>not publishable</b> until that artwork is replaced with
          real client photography, or the pages that use it are removed.
        </p>
      </div>
    </header>

    <section class="block">
      <h2>Contact sheets</h2>
      <p class="note">All ten pages on one sheet, per language.</p>
      <div class="grid">
{sheets}
      </div>
    </section>
{''.join(locale_blocks)}

    <footer class="top">
      <p><b>Migather Limited</b> — Performance Digital Creative and Media Agency · Hong Kong &amp; China · Media Solutions Expert</p>
      <p>Screens captured {esc(AS_OF)} from the build in <code>main</code>. Review order and what to look for: <code>docs/REVIEW_GUIDE.md</code>.</p>
      <p>16 sourced cases · 27-client roster · 9 routes × 3 locales · 75-URL sitemap. No figure on the site is unsourced.</p>
    </footer>
  </div>
</body>
</html>
"""


def main() -> int:
    if not REVIEW.exists():
        print(f"no review set at {REVIEW} — run tools/build-review-set.py first", flush=True)
        return 1

    out = REVIEW / "index.html"
    out.write_text(build(), encoding="utf-8")
    print(f"gallery written to {out.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
