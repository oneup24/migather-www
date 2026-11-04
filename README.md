# Migather Limited — corporate website, v3.0

The Migather website. A boutique performance digital creative and media
agency in Hong Kong, working across Mainland China and Southeast Asia.

**v3.0 rebuilds the site's style and structure on the Capsule48 + GAIA
Communications reference frame** — Capsule48's editorial body, GAIA's
cinematic hero and numbered index — while keeping every fact, every figure
and every source exactly as they were.

> **Not publishable as-is.** Every photograph on the site is generated
> placeholder artwork, not client photography. See
> [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md) §0.

---

## Run it

```bash
npm install
npm run serve        # build + preview → http://localhost:4176
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload. |
| `npm run build` | Production build into `dist/`. |
| `npm run serve` | Build, then preview on port 4176. |
| `npm run check:routes` | Renders all 37 routes in all 3 locales, asserts each produces its own heading, and screens the **rendered text** of every route for banned terms. |
| `npm run check:copy` | Screens every translatable string in `src/data/` against the 中国广告法 restricted terms and Migather's own banned claim words. |
| `npm run build:sitemap` | Regenerates `public/sitemap.xml` — 75 URLs. |
| `npm run verify` | All of the above, in order. |
| `npm run audit:dom` | Drives the real page in headless Chrome: no horizontal overflow, no broken images, the header turns solid on scroll, the mobile drawer opens and closes, the sector filter works, every route renders its own heading. |
| `npm run audit:dom:mobile` | The same audit at 390 × 844. |
| `npm run capture` | Full-page mock-up screens → `docs/mockups/`. Fails loudly if any image did not load. |

```bash
node tools/capture-pages.mjs     # full-page mock-up screens → docs/mockups/
python3 tools/contact-sheet.py   # one contact sheet per locale
python3 tools/build-review-set.py  # the handover-sized review set
```

---

## Stack

React 19 · Vite 8 · Tailwind CSS v4 · React Router 7. No backend — the build
output is a static site.

Three locales, URL-prefixed: `/en/*`, `/zh-Hant/*`, `/zh-Hans/*`.

---

## Layout

| Path | What it is |
| --- | --- |
| `src/data/` | Everything factual. `content.js` (copy), `cases.js` (16 sourced cases), `capabilities.js` (25 published capability lines, derived from the CRM's 23 agreed scope rows — one row is presented as three add-on lines), `clients.js` (roster + testimonials), `site.js` (constants, offices, platforms), `media.js` (mock-up imagery), `content.v3.js` (v3.0 structural copy), `i18n.js` (locale registry). |
| `src/components/v3/` | The v3.0 component library. |
| `src/components/layout/` | `SiteHeader`, `SiteFooter`, `CaptureMode`. |
| `src/components/ui/` | `Button`, `Icon`, `Logo`. |
| `src/pages/` | 9 route templates. |
| `src/styles/` | `index.css` (tokens) and `v3.css` (the editorial grammar). |
| `public/media/` | The 26 generated mock-up images. |
| `docs/` | `DESIGN_V3.md`, `LAUNCH_CHECKLIST.md`, `COPY_COMPLIANCE.md`, `REVIEW_GUIDE.md`, `VERSION.md`, `mockups/`. |
| `tools/` | Screenshot and image tooling. |

---

## The rules this build follows

1. **Never invent.** No KPI, result, client name, award, headcount, office
   address, founding year, registration number or contact email appears that
   is not in a source file. Every case carries the deck and slide it came
   from.
2. **Every claim carries its source.**
3. **Unknown is not zero.** A missing value stays missing and is shown as
   unknown.
4. **Mainland China compliance is part of the job.** The copy screen fails
   the build on 国家级 / 世界级 / 最高级 / 顶级 / 第一 / 唯一 / 一流 / 首选 /
   首家 / 首要 / 高级, and the KOL Disclosure page states the 报备 / 非报备
   position.
5. **State the as-of date** on every report, with the record count next to
   the total.
6. **The mock-up imagery is labelled everywhere it appears**, because it sits
   beside real client results.

---

## Where the design comes from

| | |
| --- | --- |
| **Capsule48** | The body — the editorial row, small caps service lists, the category filter, the image-led grid, the serif-against-geometric-sans type contrast. |
| **GAIA Communications** | The hero — one claim over a cinematic photograph, the numbered index anchored to the bottom of the image, section numbering. |
| **Migather's own house system** | The ground is white, the type is Century Gothic's class, the colours are `#016DA9` blue and `#950534` crimson. Neither reference's brand colour was taken. |

Full reasoning, measurements and what was refused in
[`docs/DESIGN_V3.md`](docs/DESIGN_V3.md).
