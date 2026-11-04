# Copy compliance — China advertising rules

Migather publishes for Hong Kong, Mainland China and Southeast Asia. The
Chinese copy on this site is screened against the rules below before it ships.

---

## 1. The screen is automated

There are **two** screens, and they share one word list.

```bash
npm run check:copy     # the source: every translatable string in src/data/
npm run check:routes   # the rendered text: every route, in every locale
```

`check:copy` scans the data modules, which is where the translatable copy
lives. `check:routes` renders all 37 routes (9 pages + 16 cases + the 404,
across EN / 繁 / 简) and scans the **text the reader actually sees**. The
second screen is what catches a banned term written straight into a component
instead of a data module — the case the first screen structurally cannot see.

Both are part of `npm run verify`, so a banned word cannot reach production
without failing the check first.

The current state of the site: **clean** — 8 data modules and 37 rendered
routes, no hits.

### How the screens decide

- Comments are stripped before scanning, so documentation that merely *lists*
  the banned words is not mistaken for copy that uses them.
- A segment is skipped if it contains a marker in the `ALLOW` list in
  `scripts/compliance-lists.mjs`. The current entries are:
  - `广告法` / `廣告法` — the KOL Disclosure page names the restricted terms
    by design; that is the point of the page.
  - `第一天` — idiomatic "from day one", not a superiority claim.
  - `first tier` / `top tier` — product and KOL tiering, not a claim about
    ourselves.
- The rendered screen splits text at **sentence** boundaries only, and applies
  the allow-list per segment. So the disclosure page's list of restricted
  terms is excused by the sentence that names the law, while a banned term
  anywhere else on that same page is still caught.
- Every allow-list entry carries a reason. **If you add a case, write the
  reason.**

### The screen is tested

A screen that always passes is worth nothing, so it is checked against a
deliberate violation: injecting `We are the leading agency in Asia.` into a
rendered component makes all three homepages fail. It was confirmed to do so,
and the probe was removed.

---

## 2. 中国广告法 restricted terms

Screened in Chinese copy:

`国家级` · `世界级` · `最高级` · `顶级` · `第一` · `唯一` · `一流` · `首选` ·
`首家` · `首要` · `高级`

The Traditional forms are screened too, because the site ships in both:
`國家級` · `世界級` · `最高級` · `頂級` · `首選` · `高級` (the rest are
identical in both scripts).

Note `首选` → use `优选` instead. `第一` is only a problem as a superiority
claim (第一品牌); idioms like `第一天` are fine, and the screen treats them
that way.

---

## 3. Migather's own banned claim words

From `COMPANY_PROFILE.md` §1 — "Words we do not use":

`leading` · `global agency` · `award-winning` · `top` · `No.1` · `full-service` ·
`end-to-end solutions` · `industry leader` · anything implying headcount,
offices or network scale we cannot evidence.

These are screened in English copy.

**Why this matters beyond compliance.** Every Hong Kong boutique peer on the
research list leads with scale or superlatives — "3,000+ KOLs", "The Leading
Influencer Marketing Agency", "award-winning boutique team". Migather cannot
use that language, because it is not true of a small team, and because
`COMPANY_PROFILE.md` bans it. So the site differentiates on **evidence instead**:
named clients, real partnership years, attributed testimonials, and figures
that carry their source.

---

## 4. What the v3.0 rebuild added to the screen

v3.0 introduces one new data module, `src/data/content.v3.js`, holding the
new structural copy: section labels, the hero index, and the mock-up
disclosures. It is scanned like every other module.

Nothing in it is a claim. The new strings are:

- Section labels — `Our philosophy`, `Selected work`, `How we work`,
  `Who we work with`, `In their words`, `Next step`, `Where we work`.
- The hero index — `Selected work`, `How we work`, `Start a conversation`.
- The disclosures — the mock-up notices and the section labels for the
  work-grid note.
- One phrase pointer, `hero.titleMark`, which names the words of the
  existing hero headline that carry the accent colour. The headline wording
  itself is unchanged and still lives in `content.home.hero.title`.

**The v3.0 rebuild introduced no new factual claim.** No new result, client,
figure, award, headcount or standing.

---

## 5. The one place the rule was tested against the rebuild

GAIA picks out one word in red over its hero. Migather's crimson is
`#950534`, which measures only **2.0 : 1** against the hero's night ground —
not legible as display type. Rather than change the brand colour, a tint of
the same hue was derived for photographic grounds only (`#e04570`, **4.4 : 1**).
That is a design decision, not a copy decision, and it is documented in
[`DESIGN_V3.md`](DESIGN_V3.md) §3.

---

## 6. Nothing was inherited by accident

The Chinese copy in `content.js`, `capabilities.js`, `cases.js` and
`clients.js` is unchanged from v1.0 and v2.0 — v3.0 is a design rebuild, and
the wording was not touched. zh-Hant and zh-Hans remain separately authored
strings, never machine-converted between them.

The KOL Disclosure page still states the 报备 / 非报备 position: that 非报备
cooperation risks 限流 and client-account sanction, and that it must be
disclosed to the client before the engagement, not after. Confirm that wording
still matches operating practice before launch.
