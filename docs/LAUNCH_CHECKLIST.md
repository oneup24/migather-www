# Launch checklist — Migather website v3.0

> **v3.0 inherits every blocker on the v2.0 checklist unchanged.** The v3.0
> build is a design change: the same data modules, the same copy, the same
> routes, the same contact placeholders, the same legal pages. Nothing below
> is cleared by the redesign, and nothing new was opened by it.
>
> **One item is new, and it is the first one: §0, the mock-up imagery.**

The site builds and every route renders in all three languages. It is **not yet
ready to publish**. This is the list of what has to be true before it goes
live, in priority order.

---

## 0. Blocker — every photograph on the site is placeholder artwork

**No image in v3.0 is client photography.** The photographs in
`public/media/` are generated mock-ups: a Hong Kong harbour at night, a forum
hall, a gallery, a mall atrium, a residential tower at dusk. They are there
so the layout can be judged at full size.

The other images on the site are the client marks in `public/media/clients/` —
the brands' own logos, used only to identify the clients they belong to.
They are not photography and they are not mock-ups; the wall that carries
them prints that line underneath.

They are labelled — a `MOCK-UP` tag on every image, "mock-up" in the alt
text, a disclosure in the footer of every page, and a second disclosure on
each case page — but labelling is a mitigation, not a fix.

This matters more here than it would elsewhere, because the mock-up images sit
directly beside **real, sourced client results**. An unmarked photograph of
Hong Kong next to a `+38%` figure reads as a photograph of the work that
produced it.

### The per-case exit

Since the works page became CMS-driven, the mock-up label is a **per-case
switch**, not a site-wide constant. Every case record carries
`image.mockup`, and:

| | |
| --- | --- |
| `mockup: true` | The `MOCK-UP` tag appears on the card and on the case page, and the alt text starts with `Mock-up: ` / `樣機：` / `样机：`. |
| `mockup: false` | No tag, no alt prefix, no banner note. The picture is treated as real client photography. |

The footer's standing disclosure and the work-grid note render only while
**at least one** published case still carries a mock-up. When the last one is
replaced, both disappear on their own — that is the exit from this blocker,
and it does not need a code change.

The check is enforced, not left to memory: `npm run check:content` fails the
build if a mock-up's alt text does not say so (or if a real photograph's alt
text does), and `npm run audit:dom` fails if a card or a case page carries a
tag its record does not justify.

The case images and their flag are edited in the CMS form — see
[`CMS.md`](CMS.md). To replace one by hand: put the file in
`public/media/cases/<slug>/`, set `image.mockup` to `false` in
`content/cases/<slug>.json`, and remove the `Mock-up: ` prefix from the alt
text.

**Action — pick one:**

| Option | What it involves |
| --- | --- |
| **A. Replace with real photography** *(recommended)* | Commission or source real client photography, upload it through the CMS form, and flip the case's mock-up flag. The tag and the alt prefix disappear for that case; the footer disclosure shrinks as the last one goes. |
| **B. Remove the imagery** | Drop the images and let the type carry the pages. The site still works; the hero becomes a typographic field and the work grid becomes a list. |
| **C. Ship as-is with a visible banner** | Acceptable only if the site is clearly marked as a design preview in every channel it appears. **Not acceptable for a live client-facing site.** |

**Do not publish option C.**

---

## 1. Blocker — the domain expires in days

**`migather.com` registry expiry: 31 October 2026.**

| Fact | Value |
| --- | --- |
| Registrar | GoDaddy.com, LLC |
| Created | 31 October 2016 |
| Registry expiry | **31 October 2026** |
| Domain status | clientDeleteProhibited · clientRenewProhibited · clientTransferProhibited · clientUpdateProhibited |
| Nameservers | dns1–dns4.hostingspeed.net |
| A record | 103.13.50.211 |
| `www.migather.com` | CNAME → migather.com → 103.13.50.211 |
| Current root | The host's "Account Activated" placeholder page (HTTP 200) |

`clientRenewProhibited` normally means the registrar is renewing
automatically, but **confirm this in the GoDaddy panel today rather than
assuming it.** A lapsed registration on a ten-year-old domain that already
points at Migather's own host is an expensive, easy mistake.

`COMPANY PROFILE.md` §9 currently records the official domain as `⬜ TODO`.
That is wrong — the domain is owned. **Update the profile.**

**Also decide:** `migather.hk` and `migather.com.hk` have no DNS record, so
they are likely still registrable. For a Hong Kong agency the `.hk` reads more
locally than `.com`. Register it as a redirect to the canonical domain.

---

## 2. Blocker — inbound email does not work yet

The MX record and the SPF record contradict each other.

| Record | Value | Reading |
| --- | --- | --- |
| MX | `0 migather.com.` | Null MX (RFC 7505) — by standard behaviour this **rejects all inbound mail** to `@migather.com` |
| SPF | `v=spf1 +a +mx +ip4:103.13.50.209 +ip4:103.13.50.214 include:spf.hostingspeed.net ~all` | Authorises the host to *send* |
| `_dmarc` | `v=DMARC1; p=none;` | Monitoring only, no enforcement |
| `mail.migather.com` | CNAME → migather.com → 103.13.50.211 | Mail host appears to exist |
| `webmail.migather.com` | → 103.13.50.211 | Webmail appears to exist |

**Action:** create a mailbox on the domain and test it end to end — send to it
from an outside address, and confirm it arrives. Fix the MX record if the
mail drops.

**Then fill in `src/data/site.js`:**

```js
export const CONTACT = {
  formEndpoint: '[placeholder — needs figure]',
  email: '[placeholder — needs figure]',
  phone: '[placeholder — needs figure]',
  linkedin: null,
};
```

The site currently shows a visible pre-launch notice on `/contact` instead of
a broken placeholder address. Once a real address exists, put it in `email`,
and remove the notice from `src/pages/ContactPage.jsx` (the `preLaunch`
block).

---

## 3. Blocker — the contact form has no destination

`CONTACT.formEndpoint` is a placeholder. The form renders and submits, but
shows a notice instead of delivering the enquiry — see
`src/components/contact/ContactForm.jsx`.

**Action:** point `formEndpoint` at a real handler (a form service, or the
agency's own endpoint) and confirm the fields that arrive match what you need:
name, company, email, phone, market, message.

---

## 4. Legal review — required before publishing

`/legal/privacy`, `/legal/terms` and `/legal/disclosure` carry a visible
"draft for review" banner. **Have someone qualified read them.** They were
written to describe what a static site with an enquiry form actually does,
and to satisfy the Hong Kong PDPO's data-subject-rights wording, but they are
not legal advice and they have not been reviewed.

The KOL Disclosure page additionally states the 报备 / 非报备 position. Confirm
the wording matches your operating practice — see
[`COPY_COMPLIANCE.md`](COPY_COMPLIANCE.md).

---

## 5. Gaps that are visible as omissions

These are `⬜ TODO` in `COMPANY_PROFILE.md` §9 and are currently handled by
saying nothing, which is the correct treatment for a site — but each one is
a hole in the About and Contact pages.

| Gap | Where it would go | Owner |
| --- | --- | --- |
| Office street addresses | `src/data/site.js` → `offices[].address` | user |
| Founding year | `src/data/site.js` → `site.foundedYear` (currently `null`) | user |
| Company registration number | Footer legal line | user |
| Leadership team | About page — the "senior people" promise needs a face | user |
| Verified contact email | `src/data/site.js` → `CONTACT.email` | user |
| Phone | `src/data/site.js` → `CONTACT.phone` | user |
| LinkedIn / social profile URLs | `src/data/site.js` → `CONTACT.linkedin` | user |

---

## 6. Content additions worth making

**Photography.** This is now item 0 as well — v3.0 is *built* around
photography, so the gap is larger than it was in v1.0, not smaller. The
mock-up set is deliberately generic; real work photography would change the
site more than any further design work.

**More case detail.** 16 cases are on the site. Several of them have scope
but no numbers on file (Fubon, Hang Seng, Lee Gardens, Chinachem, Marks &
Spencer, H Queen's, V City, K11 Musea). When the client approves a figure for
each, the proof section gets considerably stronger.

**Team.** The credential decks name the 11 SKIES project team — Carson Tang,
Lily Leung, Serene Lam, and so on. Those names are **not** published: that
roster is from 2022–2024 and people move. Publish the current team only once
it is confirmed and current.

---

## 7. Deployment

The build output is a static site in `dist/`. It needs:

- **SPA fallback.** Every route is client-side, so an unknown path must serve
  `index.html`. `public/_redirects` already carries `/* /index.html 200` for
  Netlify. For other hosts use their equivalent (`vercel.json`,
  `nginx try_files $uri /index.html;`, Cloudflare Pages' default behaviour).
- **A catch-all for `/`.** `/` redirects to `/en` — this happens client-side,
  which is fine, but a server-side 301 from `/` to `/en/` is better for
  canonicalisation.
- **The root domain.** The site's canonical URL is set to `https://migather.com`
  in `src/data/site.js` (`site.url`) and in `public/sitemap.xml` and
  `public/robots.txt`. If the canonical domain ends up being `migather.hk`,
  update all three.
- **Font loading.** v3.0 adds Playfair Display and Noto Serif TC / SC to the
  Google Fonts request in `index.html`. The Chinese serif families are large;
  check the first paint on a slow connection and consider `font-display:
  swap` behaviour before launch.

`sitemap.xml` is generated with 150 URLs (9 routes + 16 case pages + 25
service pages, in 3 locales). Regenerate it if cases are added:

```bash
node scripts/build-sitemap.mjs
```

---

## 8. Final pre-publish run

```bash
npm run verify
```

Must pass clean:

- `npm run build` — compiles
- `npm run check:routes` — 49 route renders pass across 3 locales, and the
  rendered text of every route clears the banned-term screen
- `npm run check:copy` — no banned words in any translatable string, in the
  data modules or in the compiled case files
- `npm run check:content` — every published case has an image, a source, and
  alt text in all three languages
- `npm run build:sitemap` — the sitemap is written from the published cases

The publish workflow runs `npm run verify` before it deploys, so a commit
carrying a banned word or a broken route cannot reach the published site.

Then, in the browser:

- [ ] `/en`, `/zh-Hant`, `/zh-Hans` — homepage renders, language switcher keeps your place
- [ ] The hero at 1440px and at 390px — the headline claim and the picked-out phrase read correctly in all three languages
- [ ] `/en/work` — sector filter works, case count updates, every image loads
- [ ] `/en/work/huatai-finance-hk` — a case page, results and scope
- [ ] `/en/contact` — form submits and the enquiry actually arrives
- [ ] `/legal/disclosure` — the 报备 / 非报备 wording
- [ ] A wrong URL — the 404 page, in the right language
- [ ] Mobile viewport — drawer menu opens, language switcher works, no horizontal scroll
- [ ] **Every `MOCK-UP` tag still carries a real image behind it** — no empty frames
- [ ] `/en/work` — the footer's mock-up disclosure appears only while a
      published case still carries generated artwork
