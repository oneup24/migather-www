#!/usr/bin/env python3
"""
Assemble the GitHub Pages site for the public preview.

The repository root IS the website, so that the URL a client opens is the
site itself and not an index page in front of it:

    /              the built React app (index.html + assets/ + media/)
    404.html       the app shell, so a deep link like /en/work still renders
    review/        the mock-up screen gallery (60 screens + 3 contact sheets)
    preview/       the preview note — mock-up disclosure, as-of date, links

GitHub Pages serves `404.html` from the site root for any path it cannot
find. Because that file is the app shell, the router reads the path and the
right page renders.

An earlier layout put the app under `/site/` behind a landing page at the
root. It was changed because the landing page read as a different website
from the design: the URL people were sent to did not look like the thing
being reviewed.

Run:
    python3 tools/build-pages-site.py

The output is staged in `docs/pages-site/` — a directory that is served by
the `gh-pages` branch, not by the app itself.
"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
REVIEW = ROOT / "docs" / "review-set"
OUT = ROOT / "docs" / "pages-site"

# The Pages project site path. GitHub serves a project site at
# https<user>.github.io/<repo>/ — so everything lives under this prefix.
# The app is served from that prefix root, so the URL opens on the site.
REPO = "migather-www"
SITE_PATH = f"/{REPO}"

AS_OF = "4 November 2026"

LANDING = f"""<!doctype html>
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
  body {{
    margin: 0; background: var(--paper); color: var(--ink);
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    font-size: 16px; line-height: 1.6;
  }}
  .wrap {{ max-width: 940px; margin: 0 auto; padding: 0 32px 88px; }}
  header.top {{ padding: 88px 0 44px; border-bottom: 1px solid var(--rule); }}
  .eyebrow {{
    font-family: "Jost", "Inter", sans-serif; font-size: 11.5px; font-weight: 500;
    letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted);
  }}
  h1 {{
    font-family: "Playfair Display", Georgia, "Times New Roman", serif; font-weight: 400;
    font-size: clamp(2.1rem, 5vw, 3.4rem); line-height: 1.08; margin: 20px 0 0; letter-spacing: -0.018em;
  }}
  h1 em {{ font-style: normal; color: var(--crimson); }}
  .lede {{ max-width: 60ch; margin: 24px 0 0; color: #3d3d3d; font-size: 17px; }}
  .notice {{
    margin: 40px 0 0; border-left: 3px solid var(--crimson); background: var(--surface); padding: 18px 22px;
  }}
  .notice strong {{
    display: block; font-family: "Jost", "Inter", sans-serif; font-size: 11.5px;
    letter-spacing: 0.16em; text-transform: uppercase; color: var(--crimson); margin-bottom: 6px;
  }}
  .notice p {{ margin: 0; font-size: 14.5px; color: #3d3d3d; }}
  .cards {{ display: grid; gap: 22px; margin-top: 48px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }}
  .card {{
    display: block; text-decoration: none; color: inherit; border: 1px solid var(--rule);
    padding: 26px 24px 24px; background: var(--paper); transition: border-color .18s, background .18s;
  }}
  .card:hover {{ border-color: var(--blue); background: #fbfcfd; }}
  .card .kicker {{
    font-family: "Jost", "Inter", sans-serif; font-size: 11px; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--blue);
  }}
  .card h2 {{
    font-family: "Playfair Display", Georgia, serif; font-weight: 400; font-size: 1.45rem;
    margin: 12px 0 8px; letter-spacing: -0.01em;
  }}
  .card p {{ margin: 0; font-size: 14.5px; color: var(--muted); }}
  .card .go {{ margin-top: 18px; font-family: "Jost", "Inter", sans-serif; font-size: 13px; color: var(--ink); }}
  footer.top {{
    margin-top: 60px; padding-top: 26px; border-top: 1px solid var(--rule);
    color: var(--muted); font-size: 13.5px;
  }}
  footer.top p {{ margin: 0 0 8px; }}
  @media (max-width: 640px) {{ .wrap {{ padding: 0 20px 64px; }} header.top {{ padding: 52px 0 32px; }} }}
</style>
</head>
<body>
  <div class="wrap">
    <header class="top">
      <div class="eyebrow">Migather Limited · Website v3.0 · Design preview</div>
      <h1>Big-agency standards,<br /><em>from people who answer the phone.</em></h1>
      <p class="lede">
        The rebuilt Migather website, published for review. The site itself is
        served from the root of this address — this page is the note that
        travels with it. The full-page mock-up screens of every page in three
        languages are under <b>/review/</b>.
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

    <div class="cards">
      <a class="card" href="../">
        <div class="kicker">Live build</div>
        <h2>Open the website</h2>
        <p>The working site — click through every page in English, 繁體中文 and 简体中文.</p>
        <div class="go">→ /</div>
      </a>
      <a class="card" href="../review/">
        <div class="kicker">Mock-up screens</div>
        <h2>Browse the 60 screens</h2>
        <p>Every page, full page, at desktop and phone width, plus the three contact sheets.</p>
        <div class="go">→ /review/</div>
      </a>
    </div>

    <footer class="top">
      <p><b>Migather Limited</b> — Performance Digital Creative and Media Agency · Hong Kong &amp; China · Media Solutions Expert</p>
      <p>Screens captured {AS_OF} from the build in <code>main</code>. Source and review notes: <a href="https://github.com/oneup24/migather-www">github.com/oneup24/migather-www</a></p>
      <p>16 sourced cases · 27-client roster · 9 routes × 3 locales · 75-URL sitemap. No figure on the site is unsourced.</p>
    </footer>
  </div>
</body>
</html>
"""


def build_app() -> None:
    """Build the app with the Pages base path baked in."""
    print("building the app with SITE_BASE=/{repo} ...".format(repo=REPO))
    env = {"SITE_BASE": f"/{REPO}"}

    import os

    merged = {**os.environ, **env}
    result = subprocess.run(
        ["npm", "run", "build"], cwd=ROOT, env=merged, capture_output=True, text=True
    )
    if result.returncode != 0:
        print(result.stdout[-2000:], file=sys.stderr)
        print(result.stderr[-2000:], file=sys.stderr)
        raise SystemExit("build failed")


def main() -> int:
    if not REVIEW.exists():
        print(f"no review set at {REVIEW}", file=sys.stderr)
        return 1

    build_app()

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    # The built app, served from the Pages root. index.html, assets/ and
    # media/ all sit at the top level, so the repository URL opens the site.
    shutil.copytree(DIST, OUT, dirs_exist_ok=True)
    # `_redirects` is a Netlify convention; Pages ignores it.
    (OUT / "_redirects").unlink(missing_ok=True)

    # The SPA fallback. Pages serves the root 404.html for any path it does
    # not have, which is what lets a deep link into the app work.
    shutil.copy2(OUT / "index.html", OUT / "404.html")

    # The mock-up screen gallery. Its links are relative, so it can live at
    # any depth without a rebuild.
    shutil.copytree(REVIEW, OUT / "review", dirs_exist_ok=True)

    # The preview note, kept at /preview/ so the root can be the site.
    (OUT / "preview").mkdir(parents=True, exist_ok=True)
    (OUT / "preview" / "index.html").write_text(LANDING, encoding="utf-8")

    total = sum(f.stat().st_size for f in OUT.rglob("*") if f.is_file())
    print(f"\nPages site staged at {OUT.relative_to(ROOT)}")
    print(f"  {sum(1 for f in OUT.rglob('*') if f.is_file())} files · {total / 1024 / 1024:.1f} MB")
    print(f"  site     /            (base {SITE_PATH})")
    print(f"  fallback 404.html")
    print(f"  gallery  review/")
    print(f"  note     preview/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
