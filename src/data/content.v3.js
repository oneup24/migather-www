/**
 * v3.0 copy — the words that are new in this design.
 *
 * Everything factual is reused from `content.js`, `services.js`,
 * `cases.js` and `clients.js`, so the two builds cannot drift apart: the
 * same facts, the same claims, the same sources, laid out differently.
 *
 * What is new here is *structure* — section labels, the hero index, the
 * closing call-to-action and the disclosure copy. None of it states a
 * result, a client, an award, a headcount or a standing. It is navigation
 * and housekeeping.
 *
 * Rules that apply here too:
 *   · Chinese copy is authored separately for zh-Hant (Hong Kong) and
 *     zh-Hans (Mainland). Never machine-convert between them.
 *   · Every Chinese string must clear the 中国广告法 restricted-term list.
 *     (Checked by `npm run check:copy`.)
 *   · No new factual claim is introduced in this file.
 *
 * See `src/components/v3/` for the components that consume this module and
 * `docs/DESIGN_V3.md` for why the structure changed.
 */

export const contentV3 = {
  /* ───────────────────────────────────────────────────────────────────────
     The hero index — GAIA's numbered row, anchored to the bottom of the
     hero photograph. On the homepage it indexes the three sections below;
     it is a table of contents, not a duplicate of the header nav.
     ─────────────────────────────────────────────────────────────────────── */
  index: {
    items: [
      {
        number: '01',
        label: { en: 'How we work', 'zh-Hant': '工作方式', 'zh-Hans': '工作方式' },
        href: '#approach',
      },
      {
        number: '02',
        label: { en: 'Selected work', 'zh-Hant': '精選案例', 'zh-Hans': '精选案例' },
        // The selected work left the homepage in November 2026, so this
        // entry points at the work page rather than a section of this one.
        to: '/work',
      },
      {
        number: '03',
        label: { en: 'Start a conversation', 'zh-Hant': '開始對話', 'zh-Hans': '开始对话' },
        href: '#contact',
      },
    ],
  },

  /* ───────────────────────────────────────────────────────────────────────
     The hero claim.
     ─────────────────────────────────────────────────────────────────────── */
  hero: {
    /**
     * The phrase that carries the on-photograph accent colour.
     *
     * The wording itself stays in `content.home.hero.title` — this only
     * says which words are picked out. A phrase that is not found in the
     * title is simply not marked; nothing breaks.
     *
     * The phrase is kept short on purpose. It is set on one line without
     * wrapping, so a long mark would push past the measure of the headline
     * on a phone. Fifteen Latin characters, or six Chinese ones, is what
     * fits at the hero's largest size.
     */
    titleMark: {
      en: 'enter and scale',
      'zh-Hant': '進入中國內地',
      'zh-Hans': '进入中国内地',
    },
  },

  /* ───────────────────────────────────────────────────────────────────────
     The three cases shown on the homepage.

     Chosen to span sectors — finance, property and auction — rather than
     to be the three largest, so the homepage grid reads as a range and
     not as one speciality. The full set of 16 lives on the work page.
     ─────────────────────────────────────────────────────────────────────── */
  featuredCases: ['huatai-finance-hk', 'new-world-development', 'christies-auction'],

  /* ───────────────────────────────────────────────────────────────────────
     The about-story rewrite — the reference paragraph re-authored for
     Migather.

     The original told a growth story: "started off as a boutique ... has
     grown into a global ... agency". Migather does not make that claim —
     "global agency" is banned, and a small team is the business model, not a
     starting point. This version says what the agency is, where it works and
     why the boutique structure is the offer — without the scale story.
     Every fact is already in `content.about` / `COMPANY PROFILE.md`.
     ─────────────────────────────────────────────────────────────────────── */
  aboutStory: {
    paragraphs: [
      {
        en: 'Migather Limited is a boutique performance digital creative and media agency, based in Hong Kong and working across Mainland China and Southeast Asia. We are deliberately small — the structure is the offer, not a stage before something bigger.',
        'zh-Hant': 'Migather Limited 是一間設於香港的精品效能型數位創意及媒體代理公司，服務中國內地及東南亞。我們刻意保持精小——這個結構本身就是我們的賣點，而不是邁向更大規模前的階段。',
        'zh-Hans': 'Migather Limited 是一家设于香港的精品效能型数字创意及媒体代理机构，服务中国内地及东南亚。我们刻意保持精简——这个结构本身就是我们的卖点，而不是迈向更大规模前的阶段。',
      },
      {
        en: 'Working digitally is not, for us, a service bolted on to the rest. It is how the work is planned — brand, media and measurement considered together from the first brief, in the language and idiom of each market, not one campaign translated twice.',
        'zh-Hant': '對我們來說，「數位」不是在其他服務之上加賣的一項服務，而是工作的規劃方式——由首份簡報開始，便把品牌、媒體及成效衡量一併考慮，並以每個市場的語言與語境去做，而不是把同一個活動翻譯兩次。',
        'zh-Hans': '对我们来说，「数字化」不是在其他服务之上加卖的一项服务，而是工作的规划方式——从首份简报开始，便把品牌、媒体及成效衡量一并考虑，并以每个市场的语言与语境去做，而不是把同一个活动翻译两次。',
      },
      {
        en: 'What that buys you is senior attention, speed and no layers: the people in the pitch are the people on the account, and the standard is the one a large network would deliver — without the hand-offs.',
        'zh-Hant': '這樣換來的是資深關注、速度和沒有層級：與你提案的人，就是在你項目上做事的人；標準是大型網絡會交付的標準——只是沒有那些交接。',
        'zh-Hans': '这样换来的是资深关注、速度和没有层级：与你提案的人，就是在你项目上做事的人；标准是大型网络会交付的标准——只是没有那些交接。',
      },
    ],
  },

  /* ───────────────────────────────────────────────────────────────────────
     Section labels — the small caps in the left gutter.
     ─────────────────────────────────────────────────────────────────────── */
  labels: {
    philosophy: { en: 'Our philosophy', 'zh-Hant': '我們的理念', 'zh-Hans': '我们的理念' },
    services: { en: 'Our services', 'zh-Hant': '我們的服務', 'zh-Hans': '我们的服务' },
    work: { en: 'Selected work', 'zh-Hant': '精選案例', 'zh-Hans': '精选案例' },
    approach: { en: 'How we work', 'zh-Hant': '工作方式', 'zh-Hans': '工作方式' },
    clients: { en: 'Who we work with', 'zh-Hant': '合作客戶', 'zh-Hans': '合作客户' },
    voices: { en: 'In their words', 'zh-Hant': '他們怎麼說', 'zh-Hans': '他们怎么说' },
    markOwner: {
      en: 'Client marks are the property of their owners and appear here to identify the clients they belong to.',
      'zh-Hant': '客戶標誌為其擁有者之財產，僅用作識別所屬客戶。',
      'zh-Hans': '客户标志为其拥有者之财产，仅用作识别所属客户。',
    },
    nextStep: { en: 'Next step', 'zh-Hant': '下一步', 'zh-Hans': '下一步' },
    markets: { en: 'Where we work', 'zh-Hant': '工作範圍', 'zh-Hans': '工作范围' },
    allWork: { en: 'All client work', 'zh-Hant': '全部客戶案例', 'zh-Hans': '全部客户案例' },
    client: { en: 'Client', 'zh-Hant': '客戶', 'zh-Hans': '客户' },
  },

  /* ───────────────────────────────────────────────────────────────────────
     The case gallery — the run of frames under the case information.

     The gallery is structure, not claim: a label, a line, a count and a
     disclosure. The frames themselves carry their own mock-up flags and
     alt text in `src/data/media.js`.
     ─────────────────────────────────────────────────────────────────────── */
  gallery: {
    label: { en: 'Gallery', 'zh-Hant': '圖片', 'zh-Hans': '图片' },
    statement: {
      en: 'The campaign, frame by frame.',
      'zh-Hant': '逐格看見這個項目。',
      'zh-Hans': '逐格看见这个项目。',
    },
    frames: { en: 'frames', 'zh-Hant': '張', 'zh-Hans': '张' },
  },

  /* ───────────────────────────────────────────────────────────────────────
     The closing call to action — the brief, in three lines.

     The old "Next step" section was a claim and a button. This one is a
     claim, a button and the three things an enquiry has to carry, which
     are the same three the contact form asks for.
     ─────────────────────────────────────────────────────────────────────── */
  cta: {
    bringLabel: {
      en: 'What we need from you',
      'zh-Hant': '我們需要的資料',
      'zh-Hans': '我们需要的资料',
    },
    bring: [
      {
        number: '01',
        title: { en: 'The objective', 'zh-Hant': '目標', 'zh-Hans': '目标' },
        body: {
          en: 'What the work has to achieve.',
          'zh-Hant': '這份工作要達成甚麼。',
          'zh-Hans': '这份工作要达成什么。',
        },
      },
      {
        number: '02',
        title: { en: 'The market', 'zh-Hant': '市場', 'zh-Hans': '市场' },
        body: {
          en: 'Where it has to land.',
          'zh-Hant': '它要在哪裡落地。',
          'zh-Hans': '它要在哪里落地。',
        },
      },
      {
        number: '03',
        title: { en: 'The deadline', 'zh-Hant': '期限', 'zh-Hans': '期限' },
        body: {
          en: 'When it has to be live.',
          'zh-Hant': '甚麼時候要上線。',
          'zh-Hans': '什么时候要上线。',
        },
      },
    ],
  },

  /* ───────────────────────────────────────────────────────────────────────
     The image disclosure.
     ───────────────────────────────────────────────────────────────────────
     The photographs in this build are generated placeholders, not client
     work. They sit next to real, sourced results, so they are labelled on
     screen. The wording lives in `media.js` (mockUpTag / mockUpNotice);
     this is the section-level copy that explains the grid.
     ─────────────────────────────────────────────────────────────────────── */
  disclosure: {
    workNote: {
      en: 'The imagery on this page is placeholder artwork for layout purposes — every case card is captioned to say so. Every figure quoted is real and traceable.',
      'zh-Hant': '本頁圖片為版面用的佔位視覺，每張案例圖均已標示。引用的每個數字均為真實數字，可追溯來源。',
      'zh-Hans': '本页图片为版面用的占位视觉，每张案例图均已标示。引用的每个数字均为真实数字，可追溯来源。',
    },
    gridAlt: {
      en: 'Placeholder artwork, not a photograph of this campaign.',
      'zh-Hant': '佔位視覺，並非該項目的真實照片。',
      'zh-Hans': '占位视觉，并非该项目的真实照片。',
    },
    /**
     * The visible badge on a case-page banner.
     *
     * Deliberately its own string, not `gridAlt` reused: the alt text
     * describes the picture, the badge discloses it. One string doing both
     * jobs reads oddly the moment either one is reworded.
     */
    bannerNote: {
      en: 'Placeholder artwork — not a photograph of this campaign.',
      'zh-Hant': '佔位視覺——並非該項目的真實照片。',
      'zh-Hans': '占位视觉——并非该项目的真实照片。',
    },
    /**
     * The note under a case gallery.
     *
     * Its own string rather than `gridAlt` reused: the gallery carries
     * several frames, so it is photographs in the plural, and the section
     * says so once for the whole grid rather than under every tile.
     */
    galleryNote: {
      en: 'Placeholder artwork — not photographs of this campaign.',
      'zh-Hant': '佔位視覺——並非該項目的真實照片。',
      'zh-Hans': '占位视觉——并非该项目的真实照片。',
    },
  },
};
