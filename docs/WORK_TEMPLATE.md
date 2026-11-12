# The Work template — how a case page is put together

> Every case on the site is the same page. The template is that page, held
> still: the order of the sections, the shape of the record behind them, and
> the rules a new work has to pass before it is published.
>
> The reference implementation is the Huatai Finance case —
> [`/en/work/huatai-finance-hk`](https://oneup24.github.io/migather-www/en/work/huatai-finance-hk)
> — which carries the mock-up gallery described in §4.

The machine-readable skeleton is
[`content/templates/work.json`](../content/templates/work.json). It is a
starting point, not a published case: it lives outside `content/cases/`, so
the compiler never picks it up and the content check never sees it.

---

## 1. The page, section by section

A case page is five sections in a fixed order. The backgrounds alternate —
white, warm grey, white, warm grey — so the page reads as a rhythm rather
than a stack.

| # | Section | Ground | What it carries |
| --- | --- | --- | --- |
| 1 | **Banner** | photograph | The sector, the client name (and its local name), the one-paragraph summary, the partnership date, and the mock-up badge when the picture is generated artwork. |
| 2 | **Results** | `bg-paper` | The sourced figures: the number in the house serif, the label in small caps, the note under it. |
| 3 | **Case information** | `bg-surface` | The scope list, numbered 01–05, in the right three-quarters; the client, the local name and the partnership date in the left gutter; the deck citation under the list. |
| 4 | **Gallery** | `bg-paper` | The campaign in frames: six 1:1 squares, three across, each with a caption. Only a case with frames renders this section. |
| 5 | **Next case** | `bg-surface` | The next case in the roster, and the link back to all the work. |

The gallery was added in November 2026, between the case information and the
next case: the page describes the work in words, and the frames sit directly
under that description, so a reader finishes the argument and then sees it.

**The frames are 1:1.** Three across on the desktop, two on the tablet and
the phone. Six frames therefore fill two rows of three exactly, with no
orphan cell — and a case with a different number of frames fills the same
grid, in reading order, with the last row carrying whatever is left.

---

## 2. The record behind the page

One case, one file, all three locales merged:
`content/cases/<slug>.json`.

| Field | What it is | Required |
| --- | --- | --- |
| `slug` | The route id, `^[a-z0-9-]+$`, and the name of the case's folder in Drive. | yes |
| `order` | Position in the roster. The sequence must be clean — `0, 1, 2 …` — or the grid reorders itself between builds. | yes |
| `client` | The client name, the same in every language. | yes |
| `clientLocal` | The client's own name in its language. Filled in in all three languages or in none. | no |
| `projectLocal` | The project's local name. Same rule. | no |
| `sector` | A key from `src/data/sectors.js`. | yes |
| `services` | The service keys from `src/data/services.js`, taken from the case's own scope lines. This is the field the CMS exposes as "category". | yes |
| `partnershipSince` | e.g. `July 2025`. | no |
| `featured` | Whether the case leads the homepage. | yes |
| `published` | Draft or published. A draft is allowed to be unfinished. | yes |
| `summary` | One paragraph, in all three languages. | yes |
| `results` | The figures: `value`, `label`, optional `note`. | no |
| `scope` | One line per deliverable. | no |
| `source` | The credential deck and slide the case came from. **A published case must name one.** | yes |
| `image` | The banner: `src`, `alt` in three languages, and `mockup`. | yes |
| `gallery` | The frames: `src`, `alt` in three languages, `caption` in three languages, `mockup`. | no |

---

## 3. The mock-up discipline

Every photograph in this build is generated placeholder artwork. None of it
is client photography, and the pages say so — because an unmarked picture of
Hong Kong sitting beside a real `+38%` reads as a photograph of the work
that produced it.

The rules that follow from that:

- **The banner** carries the `MOCK-UP` badge when `image.mockup` is true, and
  its alt text opens with `Mock-up: ` (樣機： / 样机：).
- **Each frame** carries the `MOCK-UP` tag on the image and the same prefix
  in its alt text, and the gallery repeats the disclosure once under the grid.
- **The flag is per image, not per case.** When a frame is replaced with the
  real photograph, its own `mockup` flag goes to false and the tag retires by
  itself — one picture at a time, never all at once.
- **The captions name the campaign element**, taken from the case's own scope
  list. They do not describe the picture.

---

## 4. The gallery

```json
"gallery": [
  {
    "src": "/media/cases/<slug>/gallery-01.jpg",
    "alt": {
      "en": "Mock-up: what the picture shows.",
      "zh-Hant": "樣機：圖片內容。",
      "zh-Hans": "样机：图片内容。"
    },
    "caption": {
      "en": "OOH — bus and tram",
      "zh-Hant": "戶外廣告——巴士及電車",
      "zh-Hans": "户外广告——巴士及电车"
    },
    "mockup": true
  }
]
```

- The order of the array is the reading order, left to right, top to bottom.
- `alt` describes the picture; `caption` names the campaign element. They are
  different sentences about different things, and the template keeps them
  apart.
- A case with no `gallery` renders no gallery section. The section is the
  case's own, not the template's.
- A case carries **at most twelve frames**. The page shows three across, so
  twelve is four rows — a campaign, not a contact sheet.

### Where the frames come from

The record is compiled from the sheet: the `gallery_<locale>` tabs hold one
row per frame, and the sync writes the array into the case file. The editor
adds the frames in the works page — a picture, an alt text and a caption
beside it — and the Apps Script names each file after the page title and the
alt text:

```
huatai-finance-hk-branding-video-shoot-01.jpg
```

The full contract is in [`CMS.md`](CMS.md) §4 and §9.

### The six mock-up frames

The Huatai case carries the six frames the template was drawn from. They are
borrowed from the finance cases' banners and the city shot — the closest
thing in the repository to a Hong Kong brokerage campaign:

| | Frame | Stands in for |
| --- | --- | --- |
| 01 | `cases/hang-seng-bank/case-hangseng.jpg` | Branding video — shoot |
| 02 | `cases/atfx-securities-hk/case-atfx.jpg` | OOH — bus and tram |
| 03 | `cases/bank-of-china-hk/case-boc.jpg` | Social — feed creative |
| 04 | `cases/fubon-bank/case-fubon.jpg` | Brand system — graphic forms |
| 05 | `cases/wing-fung-financial-hk/case-wingfung.jpg` | Investment campaign — product visual |
| 06 | `contact-city.jpg` | Citywide — media placements |

These are placeholders for campaign photography that does not exist yet. A
new work inherits the shape, not the pictures.

Until the Huatai frames are uploaded through the editor and carried by the
sheet, they live in `src/data/media.js` (`caseGalleries`), keyed by case
slug. The page reads the case record first and falls back to that manifest,
so the mock-up stays on the page and a case with frames in the sheet uses
its own.

---

## 5. Making a new work

### Through the CMS — the normal path

The editor adds the case in the admin page (`/en/admin`), the sheet becomes
the trigger, and the site rebuilds by itself within a minute. The operating
manual is [`CMS.md`](CMS.md).

### By hand — the repository path

1. Copy `content/templates/work.json` to `content/cases/<slug>.json`.
2. Fill in every field. Replace `<slug>` in the `image.src` path with the
   case's own slug.
3. Put the banner in `public/media/cases/<slug>/`, and the frames in the same
   folder, named after the page and the alt text —
   `<page-title>-<alt-text>-01.jpg`.
4. Give the case the next free `order`.
5. Run the screens:

```bash
npm run verify        # build, route renders, copy screen, content check, sitemap
npm run audit:dom     # drives the real page: pictures load, sources are named
```

6. Capture the screen, if a review set is wanted:

```bash
npm run capture       # full-page mock-up screens → docs/mockups/
```

### What a hand-built case must not do

- It must not sit in `content/cases/` with `published: false`. The content
  check refuses a draft in the compiled content — a case that is not ready
  belongs in the sheet as a draft.
- It must not invent a figure, a client name or a date. Every number is
  traceable to the deck, and the deck and slide are named in `source`.
- It must not leave a `gallery` frame without its alt text in all three
  languages.

---

## 6. What is not built yet

The frames have their home in the sheet, their upload in the editor and their
place in the compiled record. Two things are still open, and both are
deliberate:

- **The upload size.** The original file is posted as it is and the sync
  resizes it to 1600px in CI. A phone photograph is 3–8MB, which is slow on
  a bad connection. If it turns out to be a problem, the fix is a
  client-side downscale before the file is posted.
- **The repository keeps a file that nothing points at.** When a frame is
  removed, its row goes from the sheet and its file is thrown away in Drive,
  but the copy in `public/media/cases/<slug>/` stays until something deletes
  it. The sync could make that folder mirror the sheet.

Both are written up in [`CMS.md`](CMS.md) §9.
