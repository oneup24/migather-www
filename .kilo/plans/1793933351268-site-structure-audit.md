# Migather v3.0 — site structure audit and repair plan

**Date:** 6 November 2026
**Scope decision (locked):** **repair only, no information-architecture change.**
The homepage keeps the 8 sections specified in `docs/DESIGN_V3.md` §5. No new
section, no new route, no new nav item.

---

## 1. Goal

Make the v3.0 site structurally honest and structurally verified, without changing
a single fact, metric, client name or claim.

Concretely:

1. Every place the site says "unknown" actually says unknown — 10 of 16 case
   pages currently show no results at all.
2. Every place the site says "every route in every locale" is screened, actually
   is (13 of 16 case pages are not; and CI runs none of the screens).
3. Every Chinese page is Chinese, including the footer's column headings.
4. The documentation describes the build that exists.

**Out of scope, explicitly:** any IA change, any new homepage section, any change
to the 8-section homepage order, any new page or route, any widening of the
中国广告法 word list, and every launch blocker in `docs/LAUNCH_CHECKLIST.md`
§0–§3 (mock-up imagery, domain expiry, inbound email, form endpoint) — those
are content and infrastructure work that gate publication, not structure.

**Non-negotiable constraints carried into every task:**

- `README.md` §"The rules this build follows": never invent a fact; every claim
  carries its source; **unknown is not zero**; Chinese copy must clear the
  中国广告法 screen; never machine-convert between zh-Hant and zh-Hans.
- Chinese copy for new strings is **authored separately** for zh-Hant (Hong Kong)
  and zh-Hans (Mainland), never converted (`src/data/i18n.js:9-17`).
- No task may change the site's numbers: 16 cases, 27 clients, 25 capability
  lines, 3 goals, 3 offices, 3 markets, 4 testimonials, 75 URLs.

---

## 2. The structure, as it stands

### Runtime

| Layer | Value | Source |
| --- | --- | --- |
| Framework | React 19 + React Router 7 | `package.json:22-23` |
| Build | Vite 8 | `package.json:25` |
| Styling | Tailwind CSS v4 + `src/styles/v3.css` | `vite.config.js:8` |
| Backend | none — static output in `dist/` | `README.md:73-76` |
| Entry | `index.html` → `src/main.jsx` → `src/App.jsx` | `index.html:33` |
| Base path | `process.env.SITE_BASE \|\| '/'`; router basename from `import.meta.env.BASE_URL` | `vite.config.js:10`, `src/App.jsx:70` |
| Locales | `en` (default), `zh-Hant`, `zh-Hans` — URL-prefixed | `src/data/i18n.js:21-45` |
| i18n model | every translatable value is `{ en, 'zh-Hant', 'zh-Hans' }`; `pick(value, locale)` with English fallback | `src/data/i18n.js:68-82` |
| Fonts | Jost (display) · Inter (body) · Playfair Display + Noto Serif TC/SC (editorial) | `src/styles/index.css:80-86` |
| Brand | `#016da9` blue · `#950534` crimson · `#e04570` crimson-on-dark | `src/styles/index.css:56-77` |

Locale lives in the URL, not in React state (`src/hooks/useLocale.jsx:11-24`), so
each language has its own indexable address and the switcher keeps the reader on
the same page (`src/components/layout/SiteHeader.jsx:56-63`).

### URL map — 75 URLs

9 static paths + 16 case slugs = 25 per locale × 3 locales = **75**, matching
`public/sitemap.xml` (75 `<loc>` entries, verified by count).

| Path (per locale) | Template | Source |
| --- | --- | --- |
| `/{locale}` | `HomePage` | `src/App.jsx:29` |
| `/{locale}/work` | `WorkIndexPage` | `src/App.jsx:30` |
| `/{locale}/work/:slug` | `WorkDetailPage` | `src/App.jsx:31` |
| `/{locale}/capabilities` | `CapabilitiesPage` | `src/App.jsx:32` |
| `/{locale}/about` | `AboutPage` | `src/App.jsx:33` |
| `/{locale}/careers` | `CareersPage` | `src/App.jsx:34` |
| `/{locale}/contact` | `ContactPage` | `src/App.jsx:35` |
| `/{locale}/legal/:doc` | `LegalPage` (privacy · terms · disclosure) | `src/App.jsx:36` |
| `/{locale}/*` | `NotFoundPage` | `src/App.jsx:79` |
| `/` | → client redirect to `/en` | `src/App.jsx:75` |

**Case slugs (16)** — `src/data/cases.js`:

| Sector | Key | Count | Slugs |
| --- | --- | --- | --- |
| Finance & investment | `finance` | 6 | huatai-finance-hk, bank-of-china-hk, atfx-securities-hk, wing-fung-financial-hk, hang-seng-bank, fubon-bank |
| Property & shopping | `properties` | 4 | 11-skies-gba-forum, new-world-development, 11-skies-social-management, chinachem |
| Travel & tourism | `travel` | 3 | v-city-v-walk, k11-musea, lee-gardens |
| Luxury & auction | `luxury` | 1 | christies-auction |
| Lifestyle & retail | `lifestyle` | 2 | marks-and-spencer, h-queens |

### The 9 page templates

**`/` — HomePage** (`src/pages/HomePage.jsx:18-31`), matching
`docs/DESIGN_V3.md:142-149`:

| # | Component | Content |
| --- | --- | --- |
| 1 | `V3Hero` | Full-bleed photo · one claim · one phrase picked out in crimson-on-dark · `01/02/03` index → `#work` `#approach` `#contact` · 2 CTAs · version badge |
| 2 | `V3Clients` | "Banks, brokers, developers…" + manifesto photo + the 3 markets list |
| 3 | `V3WorkSection` | 3 featured cases + disclosure + "All client work" (`id="work"`) |
| 4 | `V3Principles` | The 4 numbered principles (`id="approach"`) |
| 5 | `V3Stats` | 4 countable facts, **all computed from data** (27 / 3 / 3 / 4) |
| 6 | `V3Marquee` | Scrolling wall of all 27 client names |
| 7 | `V3Voices` | 4 attributed testimonials |
| 8 | `V3Cta` | Closing claim + rule + button (`id="contact"`) |

**`/work`** — `PageBanner` → filter row (All + 5 sectors) + live count →
`V3WorkGrid` (3 cols) → disclosure → contact link. Filter held in `?filter=`.

**`/work/:slug`** — `PageBanner` → **Results** (gated on `results.length > 0`) →
**Scope** (numbered list + client meta + source note) → **Next case**.

**`/capabilities`** — `PageBanner` → 3 numbered goals (Build / Grow / Convert),
7 service lines each → 4 add-ons → CTA. 25 published lines from 23 CRM rows.

**`/about`** — `PageBanner` → story + studio photo → the 4 principles → 3 offices →
roster in 5 groups → 14 platforms + 3 certifications.

**`/careers`** — `PageBanner` → "What we look for" → "No fixed vacancy right now.".

**`/contact`** — `PageBanner` → pre-launch notice → `ContactForm` (name, company,
email, phone, market, message) → 3 offices → city photo. **No endpoint**
(`src/data/site.js:43`).

**`/legal/:doc`** — `PageBanner` (reuses the **work** banner, `LegalPage.jsx:39`) →
"draft for review" banner → intro → sections. 3 docs.

**`*`** — `NotFoundPage`, rendered in the default language for an unknown locale
segment (`src/App.jsx:59`).

### Shared chrome

- **Header** — fixed; transparent over the homepage hero, solid elsewhere;
  4-item nav; EN/繁/简 switcher; contact pill; mobile drawer with body-scroll lock.
- **Footer** — logo + tagline, 2 nav columns, offices, mock-up disclosure, legal links.
- **Layout** — skip link, scroll manager, `document.documentElement.lang` sync.
- **CaptureMode** — `?capture=1` promotes lazy images to eager via a MutationObserver.

### Data model (`src/data/`)

| Module | Exports | Contents |
| --- | --- | --- |
| `content.js` (601 l) | `content` | 9 namespaces: common, home, about, capabilities, work, contact, careers, legal, notFound |
| `content.v3.js` (134 l) | `contentV3` | hero index, title mark, 3 featured slugs, section labels, disclosure copy |
| `cases.js` (482 l) | `sectors`, `cases`, `getCase`, `featuredCases` | 16 cases; each carries `summary`, `results[]`, `scope[]`, `source` (deck + slide) |
| `capabilities.js` (282 l) | `goals`, `addOns` | 3 goals × 7 items + 4 add-ons = 25 lines |
| `clients.js` (116 l) | `clients`, `clientGroups`, `testimonials` | 27 roster names in 5 groups; 4 verbatim quotes with attribution |
| `site.js` (175 l) | `site`, `CONTACT`, `primaryNav`, `footerNav`, `legalNav`, `offices`, `markets`, `platforms`, `certifications` | chrome + constants; `CONTACT.*` are placeholders |
| `media.js` (285 l) | `asset`, `mockUpNotice`, `mockUpTag`, `banners`, `features`, `caseImages`, `caseImage` | 25 images: 6 banners + 3 features + 16 case, 1:1, no dead files |
| `i18n.js` (96 l) | `LOCALES`, `isLocale`, `localeMeta`, `pick`, `localePath` | locale registry + resolver |

### Component inventory

**v3 library** (`src/components/v3/`, 14): `V3Hero`, `V3Clients`, `V3WorkSection`,
`V3WorkGrid`, `V3Principles`, `V3Stats`, `V3Marquee`, `V3Voices`, `V3Cta`,
`PageBanner`, `Editorial`, `FilterRow`, `Highlight`, `MockUpTag`.
**Layout**: `Layout`, `SiteHeader`, `SiteFooter`, `CaptureMode`.
**UI**: `Button`, `Icon`, `Logo`. **Contact**: `ContactForm`.

---

## 3. The verification matrix — what each screen actually covers

The most consequential table in the audit. Every screen has a blind spot, and
the blind spots do not overlap.

| Screen | Covers | Blind to |
| --- | --- | --- |
| `check:copy` | every string literal in `src/data/*.js` (8 modules) | the 12 translatable literals written inline in `src/pages/` + `src/components/`; anything that appears only after a user interaction |
| `check:routes` (SSR) | 12 sub-paths × 3 locales + 1 404 = **37 renders** | **13 of 16 case pages**; post-interaction states |
| `audit:dom` | 6 routes, `/en` only: home, work, capabilities, about, careers, contact | every case page; every legal page; `zh-Hant` and `zh-Hans` entirely |
| `build:sitemap` | 25 paths × 3 locales, derived from `cases.js` | `site.url` and `LOCALES` are **hardcoded**, not imported |
| **CI** | `npm run build`, and nothing else | **all four screens above — CI runs none of them** |

---

## 4. Findings

Ordered by consequence. Each is a place a reader, a search engine or a reviewer
gets a wrong answer. F-numbers are stable references for the task list.

### F13 — CI runs none of the verification screens

`.github/workflows/publish-preview.yml:30-35` runs one step:
`python3 tools/build-pages-site.py`. That script runs `npm run build`
(`tools/build-pages-site.py:173-174`) and nothing else. `check:routes`,
`check:copy` and `build:sitemap` are never invoked.

The publish workflow is the only automated path from a commit to a URL. The route
check, the 中国广告法 copy screen and the sitemap check are manual commands
nobody is obliged to run. A banned term or a broken route ships on a push to `main`.

### F1 — 10 of 16 case pages show no results at all

`src/pages/WorkDetailPage.jsx:75` gates the entire proof section on
`item.results.length > 0`. `results: []` on **10** cases: new-world-development,
christies-auction, hang-seng-bank, fubon-bank, marks-and-spencer, h-queens,
v-city-v-walk, k11-musea, lee-gardens, chinachem.

This contradicts two things the site itself states:

- `content.work.lede` (`src/data/content.js:336`): *"Where a metric is not on file
  it is shown as unknown rather than estimated."*
- README rule 3: *"Unknown is not zero. A missing value stays missing and is shown
  as unknown."*

The ATFX case already models the correct treatment — `value: '—'` with the note
"the figure is not legible in the source file" (`src/data/cases.js:172-179`).
The other 10 get silence instead of "unknown".

**Two of the three homepage-featured cases are in this group** (new-world,
christies), so the homepage's own work grid links into two pages with no proof in
them. `docs/LAUNCH_CHECKLIST.md:160` lists only 8 of the 10; it undercounts.

### F2 — The work grid drops the figure on the same 10 cards

`src/components/v3/V3WorkGrid.jsx:21` takes `entry.results?.[0]` as the card's
headline number. For those 10 cases there is no number, so two-thirds of the grid
is image + client + sector with an empty right-hand column (`V3WorkGrid.jsx:51-58`).
The grid's own statement — "Results we can put a number on"
(`content.home.work.title`) — reads unevenly against the evidence.

### F3 — The footer column headings are not translated

`src/components/layout/SiteFooter.jsx:27` renders `{group}`, where `group` is the
raw object key `'Work'` / `'Agency'` from `src/data/site.js:67`. On `/zh-Hant`
and `/zh-Hans` the footer reads "Work" and "Agency" in English while every other
string on the page is Chinese.

### F4 — The footer "Property & travel" link filters to `properties` only, and its label disagrees with the sector

`src/data/site.js:71` → `/work?filter=properties`, labelled "Property & travel"
(地產及旅遊). But `sectors.properties.label` is "Property & shopping" (地產及購物)
(`src/data/cases.js:22`). Three consequences:

1. The label names two sectors; the link delivers one.
2. The 3 `travel` cases are unreachable from the footer, despite being named in it.
3. `travel` and `luxury` have no footer link at all, so 4 of 16 cases are
   reachable only via the on-page filter row or a direct URL.

### F14 — Two user-visible strings escape both compliance screens

`check-copy.mjs:26,47` scans only `src/data/*.js`. Twelve translatable literals
live inline in `src/pages/` and `src/components/`. `ssr-check.jsx` catches those
only where they appear in a rendered route. Two of them — the enquiry-sent and
the send-error confirmations at `src/components/contact/ContactForm.jsx:136-140`
and `151-156` — render only after a form submit, so they appear in no SSR output
and are screened by neither script.

Neither string contains a restricted term today. The point is that the screen
reports "clean" in a way that is not true of the whole site.

### F8 — The route check covers only 3 of 16 case pages

`scripts/ssr-check.jsx:20-33` hardcodes 12 sub-paths; only `huatai-finance-hk`,
`11-skies-gba-forum` and `christies-auction` are among them. 13 case detail pages
are never render-checked, in any locale.

`scripts/build-sitemap.mjs:32-35` already demonstrates the fix — it reads the
slugs straight out of `src/data/cases.js`.

### F17 — `docs/DESIGN_V3.md` claims a coverage the screen does not have

`docs/DESIGN_V3.md:260-264`: *"`npm run check:routes` screens the rendered text
of **every route in every locale** — so a term hard-coded into a component is
caught too."* That is false today: 13 of 16 case pages are not rendered by the
screen. The documentation states the property F8 breaks.

### F5 — The homepage prints the same statement twice

`src/components/v3/V3Clients.jsx:18` and `src/components/v3/V3Stats.jsx:20` both
render `content.home.proof` — same eyebrow, same title ("Banks, brokers,
developers, auction houses, malls and retailers."), same lede. Two homepage
sections with an identical heading.

`docs/DESIGN_V3.md:146` describes section 5 as "**The mix** — the four countable
facts" — a standalone band, not a second editorial row. The implementation
deviates from the design intent.

### F20 — The homepage market list renders without its statement

`src/components/v3/V3Clients.jsx` renders the three markets under a bare label
(`contentV3.labels.markets`). The statement — "Three markets, run as one team."
— and its lede are authored and translated in `content.home.markets`
(`src/data/content.js:178-190`) but **wired to nothing**.
`docs/DESIGN_V3.md:143` describes section 2 as "editorial row + the vertical
image + the market list" — the statement is the missing half of that row.

### F7 — The 4 principles are duplicated verbatim between Home and About

`content.home.principles` is rendered by `src/components/v3/V3Principles.jsx:15`
and again by `src/pages/AboutPage.jsx:72-83` — same label ("How we work"), same
statement ("Four things we do not compromise on."), same 4 items. On the About
page the label and statement come from `content.home.principles.eyebrow` /
`.title` while `content.about.principlesTitle` ("How we work") is the label —
so both pages open the section identically.

`docs/DESIGN_V3.md:145` places the principles on the homepage; it says nothing
about About, so the About page's reuse is an addition beyond the design.

### F6 — `content.home.capabilities` is a dead v1/v2 leftover

`src/data/content.js:149-162` — referenced by no component. The v3.0 homepage
design (`docs/DESIGN_V3.md:142-149`) has no capabilities section, and the scope
decision locks that. Its `cta` string ("All capabilities") was written for a
section that no longer exists. **Delete.**

### F9 — The sitemap duplicates two constants instead of importing them

`scripts/build-sitemap.mjs:16-17` hardcodes `SITE_URL` and `LOCALES`. The real
sources are `site.url` (`src/data/site.js:37`) and `LOCALES`
(`src/data/i18n.js:23`). Adding a locale, or moving the canonical domain to
`migather.hk` — both live items in `docs/LAUNCH_CHECKLIST.md` §1 and §7 — would
leave the sitemap silently wrong.

### F10 — Dead `featured` flag and dead `featuredCases()` helper

`featured: true` is set on 6 cases (`src/data/cases.js:45,87,126,156,235,258`)
but **no component reads it**. The homepage selects its 3 cases from
`contentV3.featuredCases` (`src/data/content.v3.js:84`). The exported helper
`featuredCases()` (`src/data/cases.js:480`) is imported nowhere. Two sources of
truth for "which cases are featured", one of them unread.

### F11 — 12 of the 27 roster clients have no case, but every name links into the work index

`src/components/v3/V3Marquee.jsx` links all 27 client names to `/work`. The 12
without a case — ICBC Asia, CTFlife, HKTDC, Beauty Express, Beauty Avenue,
Invisalign, 伊比利亚火腿CH, mando, QPET, 中環街市, MTR, HKJC — land on a grid
that does not contain them. The roster is wider than the proof.

Note the roster name and the case `client` name differ for 5 entries
("Huatai Finance" vs "Huatai Finance HK", "ATFX Securities" vs "ATFX Securities HK",
"Wing Fung Financial Group" vs "… HK", "Christie's" vs "Christie's Auction",
"Chinachem Group" vs "Chinachem"), so the mapping must be explicit data, not a
string match.

### F15 — The DOM audit never opens a case page, a legal page, or a Chinese page

`tools/audit-dom.mjs:342,390` cover 6 routes, all `/en/*`. No `/work/:slug`, no
`/legal/:doc`, and `zh-Hant` / `zh-Hans` are never audited.

### F12, F16, F18, F19, F21 — documentation drift

| # | Where | What it says | What is true |
| --- | --- | --- | --- |
| F12 | `README.md:92`, `docs/VERSION.md:35` | "The 26 generated mock-up images" | `public/media/` holds **25** (16 case + 6 banner + 3 feature). `docs/DESIGN_V3.md:197-199` states it correctly: 26 generated, 25 shipped |
| F16 | `docs/DESIGN_V3.md:35` | points at `src/components/v3/ServiceList.jsx` | that file was **deleted** in the same release (`docs/VERSION.md:137-138`) |
| F18 | `docs/DESIGN_V3.md:259` | "9 templates × 3 locales, 75 URLs" | 9 × 3 = 27. 75 = 25 paths × 3 |
| F19 | `scripts/compliance-lists.mjs:58-59` | two `ALLOW` entries | both are `'第一天'` with the same reason; the second has no effect and one was presumably meant to be a different marker |
| F21 | `src/components/layout/CaptureMode.jsx:11-13` | promises animated blocks are "already in its final state" | `src/styles/index.css:199-201` only sets `scroll-behavior: auto`. v3.0 has no scroll-driven animation left to pin (`docs/VERSION.md:246-248`) |

---

## 5. Task list

Ordered so each task is independently verifiable. **T1–T4 need no new copy and
no product decisions** — do them first. T5, T6, T10 need new copy and are the
only tasks that touch what a reader sees. T7, T8, T9, T11 are cleanup.

Every task ends with the §6 validation block.

### T1 — Gate the publish path (F13)

`.github/workflows/publish-preview.yml`: add a `npm run verify` step **before**
the publish step, so a failing route, copy or sitemap check stops the publish.

- `npm run verify` needs no browser (`check:routes` renders with
  `react-dom/server`; `check:copy` and `build:sitemap` are plain node), so it
  runs unchanged on `ubuntu-latest`.
- **Precondition:** run `npm run verify` on the current tree first. If it fails,
  fix it in this task — do not ship a gate that is already red.
- `build:sitemap` writes `public/sitemap.xml`, a tracked file. In CI that is
  harmless; locally, confirm it produces no diff before committing.

### T2 — Fix the i18n leak in the footer (F3)

- `src/data/site.js`: `footerNav` becomes a shape that carries a translatable
  label per group. Either add a `label` key to each group and change the
  iteration in `src/components/layout/SiteFooter.jsx:24-37` to read
  `group.label`, or restructure `footerNav` into an array of
  `{ key, label, items }`. Prefer the array — it stops the group key from being
  the display string, which is the actual defect.
- The labels are new copy: **"Work"** and **"Agency"** need zh-Hant and zh-Hans
  forms authored separately (e.g. zh-Hant 「精選案例」/「公司資料」,
  zh-Hans 「精选案例」/「公司资料」 — confirm the wording, do not machine-convert).
- No label may contain a term in `CN_BANNED`/`EN_BANNED`.

### T3 — Close the route-check gap (F8) and the compliance blind spot (F14)

- `scripts/ssr-check.jsx`: replace the 3 hardcoded case paths with slugs read
  from `src/data/cases.js`, mirroring `scripts/build-sitemap.mjs:32-35`. Expect
  **76** renders (25 paths × 3 locales + 1 404) instead of 37.
- The two `ContactForm` confirmation strings move into `src/data/content.js`
  (as new keys under `content.contact.form`), so `check:copy` reaches them;
  `src/components/contact/ContactForm.jsx` then reads them via `t()`.
  Moving them is a no-op for the rendered output — same three languages.
- **Expect this task to surface pre-existing failures** in the 13 case pages
  that were never rendered. Fix them in this task; that is the point of the task.

### T4 — De-duplicate the sitemap constants (F9)

`scripts/build-sitemap.mjs`: import `site.url` from `src/data/site.js` and
`LOCALES` from `src/data/i18n.js` instead of hardcoding. Both modules are plain
JS with no Vite-specific imports, so plain `node` can load them.

Verify: `npm run build:sitemap` produces a byte-identical `public/sitemap.xml`
(75 URLs).

### T5 — Make the missing results visible (F1, F2)

- `src/pages/WorkDetailPage.jsx`: replace the `item.results.length > 0` gate with
  an else-branch that renders the same section frame with an explicit
  "not on file" state, following the ATFX `—` treatment
  (`src/data/cases.js:172-179`). The section keeps its label ("Results"); the
  body states that no metric is on file for this project.
- `src/components/v3/V3WorkGrid.jsx`: the `CaseCard` headline column currently
  renders only when `entry.results?.[0]` exists. Give the empty case a visible
  marker in the same slot so the grid does not show a hole.
- **New copy**, 3 languages each, authored separately for zh-Hant and zh-Hans:
  the results-section "not on file" line, and the grid-card marker.
- The wording must not imply the work produced nothing — it must say the metric
  is not on file. Do not invent a figure.

### T6 — Fix the two homepage duplications (F5, F20)

- `V3Stats`: replace its `Editorial` (which reuses `content.home.proof`) with an
  `Editorial` that carries a **label only** — `docs/DESIGN_V3.md:146` calls
  section 5 "The mix — the four countable facts", i.e. a standalone band. The
  `Editorial` component already supports a label with no statement
  (`src/components/v3/Editorial.jsx:29`).
  - New label copy in 3 languages. Suggested en: "The mix"; zh-Hant 「媒體組合」;
    zh-Hans 「媒体组合」 — confirm with the agency before shipping.
- `V3Clients`: wire `content.home.markets` (statement + lede) into the markets
  block. The copy already exists and is already translated
  (`src/data/content.js:178-190`); this is a wiring change, not new copy.
  The block keeps its existing `contentV3.labels.markets` label as the
  section's small-caps gutter label, with the statement and lede beneath it.

### T7 — Align the footer with the sector taxonomy (F4)

- The footer's sector links must mirror `sectors` in `src/data/cases.js` exactly,
  so the filter row and the footer can never disagree: one link per sector, each
  labelled with that sector's own label.
- That means the "Property & travel" label (which names two sectors but links to
  one) is replaced by the `properties` sector's own label, and separate
  `travel` and `luxury` links are added.
- **Do not rename the sectors.** `cases.js` sector labels are the taxonomy of
  record; the footer follows them, not the reverse.
- Keep `src/data/site.js:70` ("Selected work") as the unfiltered entry, so all 16
  cases remain reachable from the footer.

### T8 — Remove the dead code and fix the documentation (F6, F10, F12, F16, F18, F19, F21)

- Delete `content.home.capabilities` (`src/data/content.js:149-162`).
- Delete the `featured: true/false` keys from all 16 cases and the
  `featuredCases()` export (`src/data/cases.js:480-482`);
  `contentV3.featuredCases` is the single source of truth.
- `scripts/compliance-lists.mjs:58-59`: remove the duplicated `'第一天'` entry
  (behaviourally a no-op — the two entries are identical).
- `README.md:92` and `docs/VERSION.md:35`: 26 → **25** mock-up images.
- `docs/DESIGN_V3.md:35`: replace the `ServiceList.jsx` reference with
  `src/components/v3/Editorial.jsx` / the `.service-list` class in
  `src/styles/v3.css` — the class still exists, the component does not.
- `docs/DESIGN_V3.md:259`: correct the arithmetic to "25 paths × 3 locales,
  75 URLs".
- `docs/DESIGN_V3.md:260-264`: correct the claim about `check:routes` once T3 has
  landed (it then does cover every route — but say so accurately, including the
  404 case).
- `src/components/layout/CaptureMode.jsx:11-13`: correct the comment to say what
  the flag actually does — forces lazy images to load eagerly and makes scrolling
  instant.

### T9 — Extend the DOM audit to the pages it never opens (F15)

`tools/audit-dom.mjs`: add to both route lists (`:342`, `:390`) at least one
case page, one legal page, and one `zh-Hant` route. The existing checks
(heading, broken images, mock-up tags) then run on them.

### T10 — Stop the About page repeating the homepage (F7)

- Add one new string, `content.about.principlesStatement`, in 3 languages, and
  use it as the About page's statement (`src/pages/AboutPage.jsx:72`). About
  keeps `content.about.principlesTitle` as its label.
- The 4 principle **items** stay shared with the homepage. They are positions,
  not copy variants, and `docs/DESIGN_V3.md:145` places them on the homepage by
  design. Only the headline is duplicated today, and that is what this fixes.
- Do not write new principle bodies: a different wording of "senior hands on the
  work" is the same claim, and the site's rule is that claims carry sources.

### T11 — Link roster clients to their case (F11)

- Add a `rosterName` field to each of the 16 cases in `src/data/cases.js` — the
  name the case appears under in `src/data/clients.js`. This is a
  disambiguation of two existing lists, not a new fact: the display name
  (`client`) and the roster name (`rosterName`) differ for 5 entries.
- Export `caseSlugForClient(rosterName)` from `src/data/cases.js`, returning the
  first matching slug or `null`. `11 SKIES` has two cases
  (`11-skies-gba-forum`, `11-skies-social-management`); map it to the first and
  let the work index and the case page's next-case chain carry the other.
- `src/components/v3/V3Marquee.jsx`: link a client name to its case page when
  one exists, and to `/work` otherwise. The 12 caseless clients keep the current
  `/work` target — **no new copy, no new claim**.
- `src/pages/AboutPage.jsx:124-128`: the roster names currently render as plain
  spans with no link. Link them the same way as the marquee.

---

## 6. Validation

After **every** task:

```bash
npm run verify          # build + 76 route renders + copy screen + 75-URL sitemap
npm run audit:dom       # headless-Chrome audit at desktop width
npm run audit:dom:mobile
```

Manual browser pass on `/en`, `/zh-Hant`, `/zh-Hans`:

| Check | Task |
| --- | --- |
| the footer contains no untranslated Latin strings | T2 |
| every one of the 16 case pages renders a results section, in every locale | T5 |
| the work grid shows a marker on every card, not a hole | T5 |
| the homepage has no two consecutive sections with the same heading | T6 |
| the homepage's markets block shows its statement | T6 |
| each footer sector link lands on the sector its label names | T7 |
| the About page's principles heading differs from the homepage's | T10 |
| clicking a client name with a case opens that case | T11 |
| `git status` shows `public/sitemap.xml` unchanged after `npm run build:sitemap` | T4 |

`npm run capture` is optional but worth running once at the end (it fails loudly
on any unloaded image).

---

## 7. Failure modes and rollout

| Risk | Where | Mitigation |
| --- | --- | --- |
| `npm run verify` is red on the current tree | T1 | The plan does **not** assert it currently passes. The implementer's first action is to run it and, if red, fix it inside T1 before wiring the gate. Do not ship a red gate. |
| T3 surfaces render failures in the 13 previously-unchecked case pages | T3 | Expected, not a regression. Fix in T3. If a failure is a genuine data problem (a case that cannot render), fix the renderer, not the data. |
| New Chinese copy trips the banned-term screen | T5, T6, T10 | `npm run check:copy` must pass. `content.js` strings are screened; component-inline strings are not — so **put all new copy in `src/data/`**, which is the module the screen reads. |
| The zh-Hant and zh-Hans forms drift apart | T2, T5, T6, T10 | Author both separately. Do not translate one into the other. |
| T4 changes `public/sitemap.xml` | T4 | It must not. If it does, the hardcoded constants and the data modules disagree — find out why before committing. |
| T8's deletions orphan a translation | T8 | `check:copy` screens `src/data/`, so a deleted string cannot fail the screen; but re-run `npm run verify` and confirm the count of strings checked has not dropped unexpectedly. |
| T9's new audit routes fail on pre-existing markup | T9 | If a route fails, that is a finding — record it and fix it, or narrow the task with the reason stated. |
| CI timing | T1 | `verify` adds an SSR build plus 76 renders. Measure; it should be well under a minute on `ubuntu-latest`. |

**Rollout.** This is a static site with a preview published from `main`. The
changes are copy- and structure-level, with no URL, route or sitemap change —
so there is no migration and no redirect to write. Ship behind the existing
publish workflow: merge to `main` → T1's gate runs → the preview rebuilds.
Keep the dev server (`npm run dev`, port 5173) running during the work; it is
unaffected by any of these tasks.

---

## 8. Explicitly not changing

- The homepage's 8 sections and their order (`docs/DESIGN_V3.md` §5) — the scope
  decision locks this. `content.home.capabilities` is deleted, not wired in.
- The sector taxonomy in `src/data/cases.js` — the footer follows it (T7).
- Any case, client, capability, office, market, testimonial, figure, source or
  claim.
- The 5 principle items (T10 changes only the About page's headline).
- The 中国广告法 and Migather banned-word lists, beyond deleting one duplicated
  allow-list entry (F19). Which terms to screen is a compliance question for
  `docs/COPY_COMPLIANCE.md`.
- Every launch blocker in `docs/LAUNCH_CHECKLIST.md` §0–§3.
- `public/media/` imagery, and the mock-up disclosure regime.
- The canonical domain and the `migather.hk` redirect — but note F9: a domain
  change without T9 done first would leave the sitemap pointing at the old domain.

---

## 9. Evidence notes

All counts were read from the working tree, not from the docs:

- 75 `<loc>` entries in `public/sitemap.xml` — verified by count.
- 25 files in `public/media/` — verified by directory listing; all 25 referenced
  by `src/data/media.js`; the 16 case slugs map 1:1 to the 16 `case-*.jpg` files.
- 16 cases, **10** with `results: []` — verified by grep over `src/data/cases.js`.
- 27 clients — verified by counting `src/data/clients.js`; 15 have a case, 12 do not.
- 25 capability lines — 3 goals × 7 items + 4 add-ons, verified by grep over
  `src/data/capabilities.js`.
- 37 route renders today — 12 sub-paths × 3 locales + 1 404, per
  `scripts/ssr-check.jsx:20-43`; 76 after T3.
- 6 routes in the DOM audit — `tools/audit-dom.mjs:342,390`.
- 12 inline translatable literals outside `src/data/` — verified by grep for
  `en: '…'` across `src/**/*.jsx`; 2 of them never render in SSR.
- Dead-copy and dead-flag claims — verified by grepping `src/` for
  `home.capabilities`, `home.markets`, `home.proof`, `home.work`, `home.cta`,
  `home.principles` and `featuredCases`.
- `404.html` is **not** missing: `tools/build-pages-site.py:201` copies
  `index.html` to `404.html` at publish time, so `README.md:62-65` is accurate.
- `.ssr-check/` and `dist/` are already gitignored (`.gitignore:4,2`).
- Working tree at plan time: `package-lock.json` modified (4 lines, from
  `npm install` resolving the committed lockfile) and `.kilo/` untracked.
  Nothing else is dirty; there is no work in progress to preserve.

**Not verified:** `npm run verify` was not executed — the sandbox blocked
`npm run`. T1's precondition covers this.
