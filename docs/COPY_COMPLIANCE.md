# Copy compliance — China advertising rules

Migather publishes for Hong Kong, Mainland China and Southeast Asia. The
Chinese copy on this site is screened against the rules below before it ships.

---

## 1. The screen is automated

There are **two** screens, and they share one word list.

```bash
npm run check:copy     # the source: every translatable string in src/data/
                       #         and in the compiled case files
npm run check:routes   # the rendered text: every route, in every locale
```

`check:copy` scans the data modules, which is where the translatable copy
lives, **and the compiled case files** in `content/cases/*.json` — the case
copy is published from there, so it is screened there. A banned term typed
into the CMS form fails the build before the case is published, not after.

`check:routes` renders all 49 routes (9 pages + 16 cases + the 404, across
EN / 繁 / 简) and scans the **text the reader actually sees**. The second
screen is what catches a banned term written straight into a component
instead of a data module — the case the first screen structurally cannot see.

Both are part of `npm run verify`, so a banned word cannot reach production
without failing the check first. The publish workflow runs `npm run verify`
before it deploys.

The current state of the site: **clean** — 9 data modules, 16 compiled case
files and 49 rendered routes, no hits.

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

## 1b. The source field is enforced by the build

Every case carries the deck and slide it came from. That was always the rule
— see `docs/CMS.md` and the `source` field on every case — and it is now
**enforced by the build** rather than held by convention:

- `npm run check:content` fails if a published case has no source.
- The CMS sync refuses to compile a published case with no source, and names
  the case and the column.
- The Apps Script form will not publish a case whose source is empty.

The same three checks cover the image and the alt text: a published case must
have an image, the file must be in the repository, and the alt text must be
filled in for all three languages. A mock-up says so in its alt text; a real
photograph's alt text must not carry the prefix.

So the rule "every figure carries its source" is no longer something a
reviewer has to remember to check. It is a build failure.

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
new structural copy: section labels, the hero index, the closing
call-to-action, and the mock-up disclosures. It is scanned like every other
module.

Nothing in it is a claim. The new strings are:

- Section labels — `Our philosophy`, `Selected work`, `How we work`,
  `Who we work with`, `In their words`, `Next step`, `Where we work`.
- The hero index — `How we work`, `Selected work`, `Start a conversation`.
- The closing call to action — `What we need from you`, and the three
  lines beneath it: `The objective`, `The market`, `The deadline`.
- The line under the client wall, which says the marks belong to their
  owners.
- The disclosures — the mock-up notices and the section labels for the
  work-grid note.
- One phrase pointer, `hero.titleMark`, which names the words of the
  hero headline that carry the accent colour. The headline wording itself
  lives in `content.home.hero.title`.

**The v3.0 rebuild introduced no new result, client, figure, award,
headcount or standing.** The hero headline did change, in November 2026 —
see below.

### The one claim the headline makes

The hero headline now reads:

> Global brands trust us to enter and scale in China.
> 跨國品牌信任我們，進入中國內地並擴張。

This is the agency's own positioning line, taken from the company video.
It is a claim about third parties' trust, so it has to be sourced like any
other:

| | |
|---|---|
| **Claim** | Global brands trust Migather to enter and scale in China |
| **Source** | The agency video — the line "Global brands trust us to enter and scale in China" (file name to be filled in by the agency) |
| **Supporting evidence on the site** | `cases.js` — Christie's (China social creative), Lee Gardens and Chinachem (mainland China social maintenance), New World Development (multi-market programmes across China, Singapore, Australia, Thailand, Malaysia and Indonesia), ATFX (Hong Kong and Southeast Asia acquisition) |
| **Screened words** | "Global brands" is not "global agency" — the banned term is the one that would describe *us* |

Until the file name is filled in, this is the only claim on the site whose
source is a file rather than a deck, a PDF or a spreadsheet. Fill it in
before launch.

The second half of the positioning line — expanding into overseas markets —
is carried by the hero lede, which names it, and by the case list behind it.

### The four figures above the client wall

> 500+ named clients · 1,000+ campaigns delivered · 20 countries served ·
> 15+ years of expertise

Agency figures, supplied in November 2026. They are lifetime numbers, and
they are the only figures the homepage carries: the band that used to count
what the site can evidence was removed in the same pass, so nothing on the
page now sits beside them claiming otherwise.

| Claim | Source | Status |
|---|---|---|
| 500+ named clients | the agency | **file name needed** |
| 1,000+ campaigns delivered | the agency | **file name needed** |
| 20 countries served | the agency | **file name needed** |
| 15+ years of expertise | the agency | **file name needed** |

Two things have to be settled before launch:

- **"15+ years" implies a founding year.** `site.js` deliberately carries
  `foundedYear: null` — the domain was registered in 2016, which is not a
  founding date. Either the founding year is evidenced and stated, or the
  figure comes down.
- **"20 countries" sits against "3 markets covered."** Both can be true —
  markets are where the agency operates, countries are where campaigns ran —
  but the reader cannot see the difference now that the band is gone. The
  market count still lives in `site.js`; if it is wanted on the page, it has
  to be worded so the two do not read as a contradiction.
- **The office list changed in the same pass** — Shanghai became Hangzhou,
  and Kuala Lumpur joined — so the delivery-office count is four, not three.

The band that carried the site's own counted figures — 27 confirmed clients,
3 markets, 4 delivery offices, 4 attributed testimonials — was removed from
the homepage in the same pass. Nothing was lost: every figure it showed is
computed from the data modules and still verifiable, and the ones a reader
is most likely to want are on the Services and Contact pages.

### The belief is a citation, not a claim

The belief under the hero claim quotes Jef I. Richards: *Creativity without
strategy is called art. Creativity with strategy is called advertising.*

It is printed with his name, so it is a citation of someone else's line
rather than a claim about Migather. Nothing on the site asserts that Migather
is creative, strategic, or any better than another agency — the site
differentiates on evidence, and this is the house view, not a boast.

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

The Chinese copy in `services.js`, the compiled case files and `clients.js` is
unchanged from v1.0 and v2.0. `content.js` has been touched — the hero
eyebrow, headline and lede were rewritten in November 2026, the third
principle now counts three markets rather than two, and the service pages
and the mega menu brought their own labels — but each change was made
deliberately, in both scripts, and the zh-Hant and zh-Hans strings remain
separately authored, never machine-converted between them.

**The cases moved, they did not change.** `src/data/cases.js` used to hold
the sixteen cases; they now live in `content/cases/*.json`, one file per
case, written by the CMS sync. The migration was lossless — the same cases,
the same copy, the same figures, the same sources, byte for byte — and the
round trip through the sheet was proved to be lossless too. The Chinese copy
in the case files is the Chinese copy that was there before.

The new service copy makes no claim either: it is the name of each service
line, the goal it sits under, and the labels around it — "Work in this
category", "Where this sits", "Next service". The wording of each service
is the wording of the agreed scope of work in the CRM, unchanged.

The KOL Disclosure page still states the 报备 / 非报备 position: that 非报备
cooperation risks 限流 and client-account sanction, and that it must be
disclosed to the client before the engagement, not after. Confirm that wording
still matches operating practice before launch.
