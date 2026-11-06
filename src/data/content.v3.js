/**
 * v3.0 copy — the words that are new in this design.
 *
 * Everything factual is reused from `content.js`, `capabilities.js`,
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
     */
    titleMark: {
      en: 'answer the phone',
      'zh-Hant': '會接電話的人',
      'zh-Hans': '会接电话的人',
    },

    /**
     * A quiet marker so a screen-capture is never mistaken for the live
     * site. Remove this one component when v3.0 replaces v1.0.
     */
    versionBadge: {
      en: 'v3.0 design preview',
      'zh-Hant': 'v3.0 設計預覽',
      'zh-Hans': 'v3.0 设计预览',
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
     Section labels — the small caps in the left gutter.
     ─────────────────────────────────────────────────────────────────────── */
  labels: {
    philosophy: { en: 'Our philosophy', 'zh-Hant': '我們的理念', 'zh-Hans': '我们的理念' },
    services: { en: 'Our services', 'zh-Hant': '我們的服務', 'zh-Hans': '我们的服务' },
    work: { en: 'Selected work', 'zh-Hant': '精選案例', 'zh-Hans': '精选案例' },
    approach: { en: 'How we work', 'zh-Hant': '工作方式', 'zh-Hans': '工作方式' },
    clients: { en: 'Who we work with', 'zh-Hant': '合作客戶', 'zh-Hans': '合作客户' },
    numbers: { en: 'By the numbers', 'zh-Hant': '以數字說明', 'zh-Hans': '以数字说明' },
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
  },
};
