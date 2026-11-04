# Review guide — Migather website v3.0

Everything needed to review this build, and where to look.

---

## 1. Run it

```bash
cd migather-site-v3
npm install          # first time only
npm run serve        # build + preview on http://localhost:4176
```

`npm run serve` runs `vite preview --port 4176 --strictPort`. For development
with hot reload use `npm run dev` instead.

The three builds run side by side and do not interfere:

| Build | Directory | Port |
| --- | --- | --- |
| v1.0 | `migather-site/` | 4174 |
| v2.0 | `migather-site-v2/` | 4175 |
| **v3.0** | **`migather-site-v3/`** | **4176** |

---

## 2. The mock-up screens

Full-page captures of every page live in **`docs/mockups/`**:

```
docs/mockups/
├── en/           10 full-page PNGs, 1440 × 900 @ 2x
├── zh-Hant/      10 full-page PNGs
├── zh-Hans/      10 full-page PNGs
├── mobile/en/    10 full-page PNGs, 390 × 844 @ 2x
└── sheet-en.png  one contact sheet of the whole English set
```

Regenerate them with:

```bash
node tools/capture-pages.mjs                     # all three locales
node tools/capture-pages.mjs --locale en         # one locale
node tools/capture-pages.mjs --locale en --out mobile --width 390 --height 844
python3 tools/contact-sheet.py --locale en       # rebuild the contact sheet
```

The capture script **fails loudly** if any image on a page did not load, so a
blank mock-up can never be shipped by accident. It also scrolls the page
before shooting, so lazy-loaded photography is actually requested.

---

## 3. What to look at, in order

### 3.1 The hero — GAIA's contribution

Open `docs/mockups/en/home.png` and scroll to the top.

- One claim, one photograph, two buttons, nothing else.
- The picked-out phrase (*answer the phone*) is in crimson-on-photograph.
  In Chinese it is 會接電話的人 / 会接电话的人, in the same serif.
- The header floats transparent over the photograph and turns solid on
  scroll.
- The `01 / 02 / 03` row at the foot of the hero is a **table of contents**
  for the page — `Selected work`, `How we work`, `Start a conversation`. It
  jumps to `#work`, `#approach`, `#contact`.
- The `V3.0 DESIGN PREVIEW` badge is a marker so a screen-capture is never
  mistaken for the live site. Remove it before launch —
  `src/data/content.v3.js` → `hero.versionBadge`.

### 3.2 The body — Capsule48's contribution

Scroll down the same file.

- Every section opens with the **editorial row**: a small caps label in the
  left gutter, a large serif statement in the right three-quarters.
- Nothing is centred and nothing is boxed, except the one pre-launch notice
  on `/contact`, which is deliberate.
- The market list and the capability lists are set as small caps in two
  columns with a hairline above each entry.

### 3.3 The work grid

Open `docs/mockups/en/work.png`.

- The filter row is Capsule48's: `All sectors / Finance & investment / …` on
  a baseline, with the active one marked by a crimson rule.
- The filter is held in the URL (`/en/work?filter=finance`), so a filtered
  view can be linked.
- Every card carries the client, the sector, and the first sourced figure.
- **Every image carries a `MOCK-UP` tag.** See §5.

### 3.4 The inner pages

`docs/mockups/en/` also holds `about`, `capabilities`, `careers`, `contact`,
`legal-privacy`, `not-found` and two case pages.

All nine templates were rebuilt in the same grammar. Each opens on the same
cinematic banner and closes on the same editorial row pattern.

---

## 4. Reading the site in Chinese

`docs/mockups/zh-Hant/` and `docs/mockups/zh-Hans/` are the same pages in the
other two languages.

- The hero headline is set in **Noto Serif TC / SC**, so the serif voice
  survives translation.
- zh-Hant and zh-Hans are **separately authored** strings. They are never
  machine-converted between them — Hong Kong and Mainland are different
  markets with different vocabulary.
- Every Chinese string clears the 中国广告法 restricted-term screen
  automatically (`npm run check:copy`).

---

## 5. The mock-up imagery — read this before showing the site to anyone

**Every photograph in v3.0 is generated placeholder artwork. None of it is
client photography.**

The images are atmosphere: a Hong Kong harbour at night, a forum hall, a
gallery, a mall atrium, a residential tower at dusk. They show a plausible
setting for each sector so the layout can be judged at full size. **They do
not depict work Migather has done.**

They are labelled, in five places:

1. A `MOCK-UP` tag on every image — inline images carry it in the corner, and
   every full-bleed banner (the homepage hero and all five inner-page banners)
   carries it below the header.
2. "Mock-up" in the alt text, so a screen-reader user is told too.
3. A disclosure in the footer of every page.
4. A second disclosure on each case page's banner.
5. A per-page note in the body copy where the artwork appears.

That labelling is what keeps the page honest — because the mock-up images sit
directly beside **real, sourced client results**, and an unmarked photograph
of Hong Kong next to a `+38%` figure reads as a photograph of the work that
produced it.

> **The site is not publishable until the mock-up imagery is replaced with
> real client photography, or the pages that use it are removed.** See
> [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md) §0 for the three options.

---

## 6. Verifying a change

```bash
npm run verify
```

This runs, in order:

| Step | What it checks |
| --- | --- |
| `npm run build` | The site compiles. |
| `npm run check:routes` | All 37 routes render in all three locales, each producing its own heading — so no route silently falls through to the 404 — and the **rendered text** of every route is screened for banned terms. |
| `npm run check:copy` | No 中国广告法 restricted term and no Migather banned claim word in any translatable string in `src/data/`. |
| `npm run build:sitemap` | Regenerates `public/sitemap.xml` — 75 URLs. |

After a change that touches the data modules, also re-run the capture:

```bash
node tools/capture-pages.mjs
python3 tools/contact-sheet.py --locale en
```

### The behavioural audit

A screenshot proves a page *renders*. It does not prove the header turns
solid on scroll, that the mobile drawer opens, that no page scrolls sideways
on a phone, or that the sector filter works. `tools/audit-dom.mjs` drives
the real page in headless Chrome and asserts those:

```bash
npm run audit:dom          # 1440 × 900
npm run audit:dom:mobile   # 390 × 844
```

| Check | What it proves |
| --- | --- |
| No horizontal overflow | The page does not scroll sideways at that width. |
| Every image loaded | No empty frame anywhere on the page. |
| The hero index | Three numbers, three on-page anchors, and each anchor resolves to a real section. |
| The header | Transparent over the hero, solid after scrolling. |
| The mobile drawer | Starts off-screen, opens on screen, is exposed to assistive technology, and closes again — checked by geometry, not by the transform property. |
| Every route | Renders its own heading rather than falling through to the 404, and has no broken images. |
| The mock-up disclosure | Present in the footer of every page; every work-grid image carries its `MOCK-UP` tag. |
| The sector filter | Sets its state, is held in the URL, and narrows the grid. |

Current state: **30/30 at 390 px, 26/26 at 768 px and 1920 px.**

---

## 7. Where things live

| Path | What it is |
| --- | --- |
| `src/styles/index.css` | The theme tokens — type, colour, the crimson-on-dark derivation. |
| `src/styles/v3.css` | The editorial grammar — the layout primitives. |
| `src/components/v3/` | The v3.0 component library. |
| `src/components/layout/` | Header, footer, capture mode. |
| `src/data/content.v3.js` | The new structural copy for v3.0. |
| `src/data/media.js` | The mock-up image manifest and the disclosure copy. |
| `public/media/` | The 26 generated images. |
| `docs/mockups/` | The full-page screens. |
| `tools/media/` | Image generation and optimisation. |
| `tools/capture-pages.mjs` | The screenshot tool. |

Full rationale in [`DESIGN_V3.md`](DESIGN_V3.md).

---

## 8. Things a reviewer should know

- **The house ground is white.** The hero is dark because it is a photograph,
  not because the page ground is dark. Capsule48's black ground was
  deliberately not taken — Migather's own ground is `#FFFFFF`.
- **Crimson is the only loud colour on a dark ground**, and it is a tint
  (`#e04570`) rather than the house crimson (`#950534`), because the house
  crimson measures only 2.0 : 1 against the night photograph.
- **The logo is the official lockup**, rebuilt as vector outlines. It is the
  only mark on the site; the earlier geometric "M" was retired.
- **v1.0 and v2.0 are still live and unchanged** apart from one shared
  defect fix — see [`DESIGN_V3.md`](DESIGN_V3.md) §7.
