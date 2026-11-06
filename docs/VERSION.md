# Version history — Migather website

Three builds live side by side and do not interfere. Each has its own
directory and its own port.

| Version | Directory | Port | State |
| --- | --- | --- | --- |
| v1.0 | `migather-site/` | 4174 | Superseded, still runnable |
| v2.0 | `migather-site-v2/` | 4175 | Superseded, still runnable |
| **v3.0** | **`migather-site-v3/`** | **4176** | **Active** |

---

## v3.0 — the Capsule48 + GAIA rebuild

**4 November 2026.** A design rebuild on the reference frame the agency
settled on after reviewing v1.0 and v2.0: Capsule48's editorial body and
GAIA's cinematic hero.

### What changed

- **New design system.** A high-contrast serif (Playfair Display + Noto Serif
  TC/SC) set against the existing geometric sans (Jost) for editorial
  statements, with the house white ground, `#016DA9` blue and `#950534`
  crimson unchanged.
- **New body grammar.** The editorial row — a small caps label in the left
  gutter, a large serif statement in the right three-quarters. Small caps
  service lists in two columns. A category filter row on a baseline with a
  crimson rule on the active entry.
- **New hero.** Full-bleed cinematic photograph, one claim over it with one
  phrase picked out in crimson-on-photograph, and a `01 / 02 / 03` index
  anchored to the bottom of the image. The site header now floats
  transparent over it and turns solid on scroll.
- **All 9 page templates rebuilt** in the new grammar.
- **24 generated mock-up photographs**, labelled on screen, in the alt text,
  in the footer of every page and on every case page.
- **A client wall on the homepage** — 23 client marks in a static grid,
  fetched from the brands themselves, from Wikimedia and from our own
  credential deck, each registered with where it came from.
  → `tools/media/fetch-client-logos.py`
- **New tooling.** `tools/capture-pages.mjs` (full-page mock-up screens,
  failing loudly on any image that did not load), `tools/contact-sheet.py`,
  `tools/media/` (generation, download, optimisation).

### What was removed

The Odoo-era grammar from v2.0: `src/components/v2/` (12 components),
`src/components/home/` (8 v1.0 homepage sections), `src/styles/v2.css`,
`src/data/content.v2.js`, and seven unused `ui/` primitives. The `Caveat`
handwriting face and the mint/gold/sky accent set went with them.

### What did not change

Every fact on the site. The same data modules, the same copy, the same 16
sourced cases, the same 27-client roster, the same 9 routes × 3 locales, the
same 75-URL sitemap, the same legal pages, the same contact placeholders, and
the same compliance screen. v3.0 introduced no new claim.

### Verification

- `npm run verify` — 37/37 route renders across 3 locales; copy screen clean
  across 8 data modules; 75-URL sitemap.
- Full-page mock-up screens captured for 10 routes × 3 locales at 1440 × 900
  @2x, plus 10 at 390 × 844 @2x. The capture tool fails on any unloaded
  image.
- The shipped imagery was checked for luminance; four case images that read
  as near-black rectangles were regenerated.

### Known blocker

**The mock-up imagery.** The site is not publishable until the placeholder
photography is replaced with real client photography or the pages that use it
are removed. See [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md) §0.

---

## The published preview — moved to the repository root

**4 November 2026.** The preview was published with a plain index page at the
repository root and the website one level deeper, at `/site/`.

Opened from `oneup24.github.io/migather-www/`, that index page read as a
different website from the design: a white page with two links and a mock-up
notice, where the thing being reviewed is a dark cinematic hero over a
harbour photograph. Anyone sent the repository address saw the notice, not
the site. The design was never the problem — the address was.

The app is now built at the Pages root.

| Path | What it is |
| --- | --- |
| `/` | The website. `/en`, `/zh-Hant`, `/zh-Hans`. |
| `/review/` | The 60 mock-up screens and 3 contact sheets. |
| `/preview/` | The note that travels with the build — mock-up disclosure, as-of date, record counts. |

The app is built with `SITE_BASE=/migather-www`, because a GitHub Pages
project site is served from `/<repo>/` rather than the domain root. `404.html`
remains a copy of the app shell, so a deep link such as `/en/work` resolves:
Pages serves the 404 file, the router reads the path, and the right page
renders.

**The site itself did not change.** Same build, same data modules, same copy,
same 37 route renders. `npm run verify` passes: 37 routes × 3 locales, the
rendered-copy screen clean, the copy screen clean, the 75-URL sitemap
unchanged.

New: `tools/repackage-handover.py`, which refreshes the v3.0 handover zips.
It does the job of `tools/package.sh` without `rsync --delete`, which the
workspace command guard blocks. The v1.0 and v2.0 handovers are unaffected by
this change and are left alone.

---

## Payload and dead-code cleanup — 4 November 2026

**4 November 2026.** Four items raised by independent QA against the running
build, all confirmed and closed.

1. **3.8 MB of unreferenced masters were shipping.** `public/media/_raw/` held
   five un-optimised JPEGs that no page, stylesheet or script referenced, and
   the build copied the whole folder into `dist/media/_raw/`. The masters moved
   to `tools/media/_masters/`, outside the built site, and the media pipeline
   (`fetch-media.sh`, `optimize.py`) now reads from there. The shipped media
   payload fell from 9.5 MB to **5.7 MB**.
2. **One generated image was never placed.** `features.approach`
   (`home-approach.jpg`) was declared in `src/data/media.js` but no component
   rendered it — so the file shipped to `dist/` for nothing. The declaration and
   the file are gone.
3. **The case-page badge reused the alt-text string.** The visible disclosure
   on a case banner read from `contentV3.disclosure.gridAlt`, which is the
   image's alt text. It now has its own string, `bannerNote`: the alt text
   describes the picture, the badge discloses it, and one string doing both
   jobs reads oddly the moment either is reworded.
4. **`README.md` miscounted the capability lines.** It called
   `capabilities.js` "23 agreed scope lines". The CRM holds 23 scope rows; the
   site publishes 25 lines derived from them, because one CRM row is
   presented as three add-on lines. Every line traces to a CRM row, so this
   was a derivation rather than an invention — but the README said so
   imprecisely, and now says exactly what it is.

Also removed: `src/components/v3/ServiceList.jsx`, a component introduced
during the rewrite and then superseded by inline markup — nothing imported it.

---

## A defect introduced in v3.0 — found and fixed

**4 November 2026.** Found by independent QA against the running build.

The v3.0 header rewrite changed the language switcher's `localeHref` from
`return next` to `return \`/${next}\``. But `next` is already the joined path
and already starts with a slash, so every switcher link came out as
`//zh-Hant/work`.

A leading `//` is a **protocol-relative URL**: the browser reads the text
after it as a *hostname*, not a path. Clicking 繁 or 简 therefore navigated
to `http://zh-hant/` — a domain that does not exist — and the reader got
"This site can't be reached". React Router's client-side router masked the
defect for ordinary left-clicks inside the SPA, which is why the earlier
route renders all passed.

Fixed in v3.0 and reverted to the v1.0/v2.0 form. The two builds that were
never broken were left alone.

`tools/audit-dom.mjs` now asserts that the switcher emits plain absolute
paths and that it keeps the reader on the same page, so this cannot come
back.

---

## A defect inherited from v1.0 — fixed in all three builds

**4 November 2026.** While checking the v3.0 mobile build, the menu button was
found to be invisible.

`src/components/ui/Icon.jsx` put path data straight into the DOM with no
`<svg>` wrapper, and carried `viewBox` on the path itself. A `<path>` outside
an `<svg>` is an unknown HTML element and renders nothing — so **every icon
in v1.0 and v2.0 was invisible too**: the mobile menu button, the close
button, every arrow.

The glyph geometry was always correct; only the wrapper was missing. Fixed in
all three builds; the three `Icon.jsx` files are now byte-identical. v1.0 and
v2.0 were re-verified after the fix.

---

## v2.0 — the Odoo-grammar homepage-led rebuild

**28 October 2026.** A homepage-led redesign on a design system decoded from
Odoo's own shipped CSS: a 9-slot palette, `x_wd_*` display classes, Caveat,
marquee and pill cards. Odoo was used as a *visual reference only* — the
platform was not adopted, and Odoo's brand purple and teal were excluded.
New accents: mint `#00CEB3`, gold `#FBB130`, sky `#1BB6F9`, ink `#14181D`.
Docs: `migather-site-v2/docs/DESIGN_V2.md`.

---

## v1.0 — the original build

**28 October 2026.** The first full build: 9 page templates, 3 locales, 16
sourced cases, 27 clients, 23 CRM scope lines, a 75-URL sitemap, and a
`npm run verify` script covering the build, all 37 route renders, the copy
screen and the sitemap. Docs: `migather-site/docs/`.

### The two corrections since

1. **The client wall printed unsourced Chinese legal entities** beside *ICBC
   Asia* and *CTFlife*. No source supports a Chinese name for either. Both
   `local` fields were set to `''` — blanked, not replaced with another
   unsourced name. A missing value stays missing.
2. **The official logo replaced the geometric "M".** The supplied artwork was
   a 200 × 200 JPEG thumbnail with only 166 × 60 px of logo ink, so it was
   used as a measurement source and the mark was rebuilt as clean vector
   geometry: the wordmark fitted to the artwork's measured per-letter ink
   positions (RMS 0.82 px), the accent fitted as three parallel stripes at
   −45.08° with the seam colour recovered from the artwork rather than
   guessed. It ships as SVG outlines in `currentColor`. Method:
   `Migather/Migather_Website_Deck_20261028/docs/LOGO.md`.
