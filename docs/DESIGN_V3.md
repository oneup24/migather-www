# Migather website v3.0 — design rationale

**The direction.** After the v1.0 / v2.0 review, the agency settled on a new
reference frame: **Capsule48 + GAIA Communications** — two Hong Kong boutique
peers — for overall style and structure.

v3.0 is that rebuild. It is a new design system on the same foundation: the
same data modules, the same copy, the same routes, the same 16 sourced cases,
the same 27-client roster, the same three locales, the same legal pages. What
changed is the grammar the content is set in.

v1.0 and v2.0 are untouched and still run, so the three can be compared side
by side.

---

## 1. How the two references split the brief

Each reference owns one part of the page. That split is the whole idea —
neither site was copied whole.

| | **Capsule48** | **GAIA Communications** |
| --- | --- | --- |
| What it gave us | The **body**: the editorial row (small caps label in the left gutter, statement in the right three-quarters), small caps service lists, the category filter row, the image-led project grid | The **hero**: one claim over a cinematic photograph, with the page index carried as large numerals anchored to the bottom of the image, and section numbering throughout |
| Why it is ours to use | It is the only reference on the list that reads as a *design studio* rather than an ad agency — which is the perception Migather needs | It is the only HK boutique that passes as network-grade at a glance — which is the "4A standard" impression Migather wants |

### What was taken from Capsule48

- **The editorial row.** A small caps label (`WHO WE WORK WITH`) sits in the
  left gutter; the statement is set large in a high-contrast serif in the
  right three-quarters of the measure. Nothing is centred, nothing is boxed.
  → `src/components/v3/Editorial.jsx`, `.editorial` in `src/styles/v3.css`
- **The service list.** Small caps, two columns, a hairline above each
  entry. Used for the market list and inside each capability goal.
  → `src/components/v3/ServiceList.jsx`, `.service-list`
- **The category filter row.** `ALL / FINANCE & INVESTMENT / …` set on a
  baseline with the active entry marked by a rule.
  → `src/components/v3/FilterRow.jsx`, `.filter-row`
- **The image-led grid.** The work is the interface. No card chrome.
  → `src/components/v3/V3WorkGrid.jsx`
- **The type contrast.** A geometric sans for everything structural, set
  against a high-contrast serif for the statements.

### What was taken from GAIA

- **The cinematic hero.** Full-bleed photograph, one claim over it, a short
  paragraph, two buttons, nothing else. → `src/components/v3/V3Hero.jsx`
- **The numbered index.** `01 / 02 / 03` under small caps labels, anchored to
  the bottom edge of the hero. On the homepage it indexes the three sections
  below (`#work`, `#approach`, `#contact`); it is a table of contents, not a
  duplicate of the header nav.
- **Section numbering.** The four principles carry `01`–`04` in light
  crimson, and the three capability goals carry `01`–`03`.
- **The floating header.** Both references float the nav over the opening
  photograph, so the header starts transparent with white type and turns
  solid on scroll. → `src/components/layout/SiteHeader.jsx`

### What was refused from both, and why

| Refused | Reason |
| --- | --- |
| Capsule48's black ground | Migather's house ground is **white**. §3 of `WEBSITE_REFERENCES.md`: the credential decks' most-used colour is `#FFFFFF`, and "this rules out Capsule48's black ground and Hatch's slate-blue field as a background for the site". v3.0 keeps a white body. The hero is dark because it is a *photograph*, not because the page ground is dark. |
| Capsule48's amber logotype | Not a house colour. Migather's blue and crimson stay the only two loud colours. |
| GAIA's red accent | Mapped to Migather's own crimson, not copied — see §4. |
| GAIA's philosophy line | "Together, Nourishes the World with Creativity" is theirs. Not used. |
| Either site's copy, imagery, or assets | Nothing was lifted. Every photograph in v3.0 is generated placeholder artwork (see §6). |

---

## 2. Type system

| Role | Face | Why |
| --- | --- | --- |
| Editorial display | **Playfair Display** + Noto Serif TC / Noto Serif SC | A high-contrast Didone — the same class of face Capsule48 sets its headlines in. It carries the statement, not the UI. |
| Structural / UI | **Jost** + Noto Sans TC / Noto Serif SC | The deck's Latin face is Century Gothic, a geometric sans. Jost is the same class of face, and real Century Gothic is not licensed for web use. Jost was already the site's display face and is unchanged. |
| Running copy | **Inter** + Noto Sans TC / Noto Serif SC | Unchanged from v1/v2. More legible at 16px than a geometric sans, and the Chinese pages need the extra line height. |

The Chinese headline is set in **Noto Serif TC**, so the serif voice survives
translation — the picked-out phrase is in the same face in all three
languages.

Two faces were dropped from v2.0: `Caveat` (the handwritten Odoo-era
"marginal note") and the Odoo accent set (`--color-v2mint`, `--color-v2gold`,
`--color-v2sky`). The v2 components and `src/styles/v2.css` were deleted; the
v3.0 tree has no Odoo grammar left in it.

---

## 3. Colour system

Unchanged house values, one addition.

| Token | Value | Role |
| --- | --- | --- |
| `--color-paper` | `#ffffff` | The body ground. |
| `--color-surface` | `#f6f4f1` | Alternating band — warm off-white, never the ground itself. |
| `--color-rule` | `#dedbd6` | Hairlines. |
| `--color-ink` | `#1c1c1c` | Text. |
| `--color-brandBlue` | `#016da9` | Primary. Figures, links, the active filter rule. |
| `--color-brandCrimson` | `#950534` | Accent. Section numerals, the call-to-action rule. |
| `--color-crimsonOnDark` | `#e04570` | **New.** Display only, on photographic grounds. |

### Why `--color-crimsonOnDark` exists

GAIA picks out one word in red over a dark photograph. Migather's crimson is
`#950534` — a deep, low-luminance colour.

- `#950534` against the hero's night ground `#14181d` measures **2.0 : 1**
  contrast. Not legible as display type at 86px.
- `#e04570` is the **same hue** (328°), with lightness raised, and measures
  **4.4 : 1** against the same ground.

It is a tint of the house colour, not a new brand colour, and it is used in
exactly one place: where the ground is a photograph. On white, `#950534` is
used unchanged. Recorded in the token comment in `src/styles/index.css`.

---

## 4. Layout primitives

The two grammars are expressed as layout primitives in `src/styles/v3.css`,
not as one-off class strings in each component.

| Class | What it is |
| --- | --- |
| `.editorial` | The Capsule48 row: `3fr / 9fr` grid, label in the left gutter. |
| `.editorial-statement` | The serif statement, `clamp(1.75rem, 3.3vw, 3rem)`, `1.14` leading. |
| `.service-list` | Small caps in two columns, hairline above each entry. |
| `.filter-row` | The category row; the active entry carries `aria-pressed`, and the crimson rule is driven from that attribute rather than from a class the stylesheet has to guess about. |
| `.hero-scrim` | Two gradients over the photograph — one from the bottom, one from the left. |
| `.grain` | A single faint noise layer over the hero. The only texture in the system. |
| `.index-nav` | GAIA's `01 / 02 / 03` row. |
| `.section-number` | The large light crimson numeral. |
| `.frame` | An image with no card chrome, with a slow scale on hover. |

---

## 5. Page structure

### Homepage

1. **Hero** — photograph, one claim, the picked-out phrase, the numbered index.
2. **Who we work with** — editorial row + the vertical image + the market list.
3. **Selected work** — editorial row + three cases spanning three sectors.
4. **How we work** — the four principles, numbered `01`–`04`.
5. **The mix** — the four countable facts.
6. **Client wall** — the 27 confirmed names, scrolling.
7. **In their words** — the four attributed testimonials.
8. **Next step** — the closing statement and one button.

### Inner pages

All nine templates were rebuilt in the same grammar. Each opens on the same
cinematic banner (a shorter expression of the hero) and closes on the same
editorial row pattern.

The work index keeps Capsule48's structure exactly: filter row above the grid,
with the filter held in the URL so a filtered view can be linked.

---

## 6. The mock-up imagery — and why it blocks publication

**Every photograph in v3.0 is generated placeholder artwork. None of it is
client photography.** No screenshot of a real client campaign exists in our
records, so none is used.

The images are atmosphere: a Hong Kong harbour at night, a forum hall, a
gallery, a mall atrium, a residential tower at dusk. They show a plausible
setting for each sector so the layout can be judged at full size. They do not
depict work Migather has done.

**They are labelled.** Every generated image carries a `MOCK-UP` tag
(`src/components/v3/MockUpTag.jsx`) — inline on the image for grid and
editorial pictures, and below the header on every full-bleed banner, including
the homepage hero. The alt text repeats the word "mock-up" for screen-reader
users, the footer carries a standing disclosure on every page, and each case
page repeats the disclosure in its banner.

This matters more than usual in v3.0, because the mock-up images sit directly
beside **real, sourced client results**. An unmarked photograph of Hong Kong
next to a figure of `+38%` reads as a photograph of the work that produced it.
The labelling is what keeps the page honest.

> ### ⚠ Launch blocker
>
> **The site is not publishable until the mock-up imagery is replaced with
> real client photography, or the pages that use it are removed.** This is
> item 0 in [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md).
>
> The images live in `public/media/` and are registered in
> `src/data/media.js`. Replacing one is a matter of dropping the file in and
> pointing the manifest entry at it — the alt text and the disclosure stay.

### How the imagery was made

26 images were generated, then resized and re-encoded for the web. **25 ship** —
one candidate was never placed on a page and was removed rather than carried as
dead weight:

- 2K sources for the page banners (2400px wide shipped).
- 1K sources for the case grid and editorial images (1200–1400px shipped).
- 37.7 MB of originals → **5.7 MB shipped**, an 85% reduction.
  → `tools/media/optimize.py`

Four images were regenerated after a brightness check found them reading as
near-black rectangles on the page (mean luminance below 55/255). A fifth pass
now flags any shipped image below that threshold.

**The unoptimised masters live outside `public/`**, in `tools/media/_masters/`.
They are working files, not site assets — leaving them in `public/media/` put
3.8 MB of unreferenced masters into every build.

---

## 7. A defect inherited from v1.0

While reviewing the mobile build, the menu button was found to be invisible.

`src/components/ui/Icon.jsx` put the path data straight into the DOM with no
`<svg>` element around it, and carried `viewBox` on the path itself. A
`<path>` outside an `<svg>` is an unknown HTML element and renders nothing at
all — so **every icon on the site** (the mobile menu button, the close button,
every arrow) was invisible in v1.0 and v2.0 as well as v3.0.

The glyph geometry was always correct; only the wrapper was missing.

**Fixed in all three builds.** The three `Icon.jsx` files are byte-identical
after the fix.

---

## 8. What was deleted from v2.0

v3.0 is a fork of v2.0, and the Odoo-era grammar was removed rather than
carried:

- `src/components/v2/` — 12 components (the numbered-colour set, the marquee,
  the bursts, the hand-drawn marks).
- `src/components/home/` — the 8 v1.0 homepage sections.
- `src/styles/v2.css`.
- `src/data/content.v2.js`.
- Seven `src/components/ui/` primitives that v3.0 no longer uses.

`src/components/ui/` now holds three files: `Button`, `Icon` and `Logo`. The
scroll-reveal component was removed with the rest of the v1/v2 page furniture
— v3.0 is a static document, and a scroll animation on every block was the
opposite of the restraint the references use.

---

## 9. What did not change

- **Every fact on the site.** Same data modules, same sources, same
  attribution. v3.0 introduced no new claim, no new client, no new figure.
- **The copy.** `content.js`, `capabilities.js`, `cases.js` and `clients.js`
  are unchanged from v1.0. The only new copy is structural — section labels,
  the hero index, the disclosures — in `src/data/content.v3.js`.
- **The routes.** 9 templates × 3 locales, 75 URLs in the sitemap.
- **The compliance screen.** `npm run check:copy` screens every translatable
  string against the 中国广告法 restricted terms and Migather's own banned
  claim words, and `npm run check:routes` screens the *rendered text* of every
  route in every locale against the same list — so a term hard-coded into a
  component is caught too. v3.0 adds one data module to the screen.
- **The logo.** The official lockup, rebuilt as vector outlines in a previous
  session, is unchanged and still the only mark on the site.
