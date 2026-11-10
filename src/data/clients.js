/**
 * Client roster and testimonials.
 *
 * Clients are the confirmed wins listed in `Migather/COMPANY PROFILE.md` §5,
 * traceable to the credential decks in `LIBRARY 2026 Q4/`.
 *
 * Testimonials are quoted verbatim from
 * `LIBRARY 2026 Q4/HK digital marketing campaign/Agency Credential by Migather Limited - Ecom.pptx`
 * (slide 5), with the attribution as printed there.
 *
 * Note: `COMPANY PROFILE.md` §5 still records the second testimonial as
 * "⬜ TODO — attribution not yet extracted". It is resolved here — the deck
 * names all four. The profile should be updated.
 *
 * `local` carries the Chinese name only where a source file gives it. The
 * credential decks print "ICBC (Asia)" and "CTFlife" in English only, so
 * those two rows leave `local` empty rather than carry a Chinese name that
 * no source supports. Empty is the correct treatment: a missing value stays
 * missing.
 */

/**
 * Clients, grouped for display. `group` is presentation only.
 */
export const clients = [
  // Finance & investment
  { name: 'Huatai Finance', slug: 'huatai-finance', local: '華泰證券', group: 'finance' },
  { name: 'Bank of China HK', slug: 'bank-of-china-hk', local: '中銀香港', group: 'finance' },
  { name: 'Hang Seng Bank', slug: 'hang-seng-bank', local: '恒生銀行', group: 'finance' },
  { name: 'Fubon Bank', slug: 'fubon-bank', local: '永明金融', group: 'finance' },
  // On the roster and in the case list, but off the client wall: the
  // agency asked for it to be taken down in November 2026.
  {
    name: 'Wing Fung Financial Group',
    slug: 'wing-fung',
    local: '永豐金融集團',
    group: 'finance',
    wall: false,
  },
  { name: 'ATFX Securities', slug: 'atfx', local: '', group: 'finance' },
  { name: 'ICBC Asia', slug: 'icbc-asia', local: '', group: 'finance' },
  { name: 'CTFlife', slug: 'ctf-life', local: '', group: 'finance' },

  // Property & development
  { name: 'New World Development', slug: 'new-world-development', local: '新世界發展', group: 'property' },
  { name: 'Chinachem Group', slug: 'chinachem', local: '信和集團', group: 'property' },
  { name: 'Lee Gardens', slug: 'lee-gardens', local: '利園', group: 'property' },

  // Retail, travel & lifestyle
  { name: 'K11 Musea', slug: 'k11-musea', local: '', group: 'lifestyle' },
  { name: 'Marks & Spencer', slug: 'marks-spencer', local: '', group: 'lifestyle' },
  { name: '11 SKIES', slug: '11-skies', local: '11 天空之城', group: 'lifestyle' },
  { name: 'V City & V Walk', slug: 'v-city', local: '', group: 'lifestyle' },
  { name: "H Queen's", slug: 'h-queens', local: '', group: 'lifestyle' },
  { name: 'HKTDC', slug: 'hktdc', local: '香港貿發局', group: 'lifestyle' },
  { name: 'Beauty Express', slug: 'beauty-express', local: '', group: 'lifestyle' },
  { name: 'Beauty Avenue', slug: 'beauty-avenue', local: '', group: 'lifestyle' },
  { name: 'Invisalign', slug: 'invisalign', local: '', group: 'lifestyle' },
  { name: '伊比利亚火腿CH', slug: 'iberico', local: '', group: 'lifestyle' },
  { name: 'mando', slug: 'mando', local: '', group: 'lifestyle' },
  { name: 'QPET', slug: 'qpet', local: '', group: 'lifestyle' },
  { name: '中環街市', slug: 'central-market', local: '', group: 'lifestyle' },

  // Luxury & culture
  { name: "Christie's", slug: 'christies', local: '佳士得', group: 'luxury' },

  // Media, events & institutions
  { name: 'MTR', slug: 'mtr', local: '港鐵', group: 'institution' },
  { name: 'HKJC', slug: 'hkjc', local: '香港賽馬會', group: 'institution' },
];

export const clientGroups = {
  finance: { label: { en: 'Finance & investment', 'zh-Hant': '金融及投資', 'zh-Hans': '金融及投资' } },
  property: { label: { en: 'Property', 'zh-Hant': '地產', 'zh-Hans': '地产' } },
  lifestyle: { label: { en: 'Retail, travel & lifestyle', 'zh-Hant': '零售、旅遊及生活品味', 'zh-Hans': '零售、旅游及生活品味' } },
  luxury: { label: { en: 'Luxury & culture', 'zh-Hant': '奢華及文化', 'zh-Hans': '奢华及文化' } },
  institution: { label: { en: 'Media, events & institutions', 'zh-Hant': '媒體、活動及機構', 'zh-Hans': '媒体、活动及机构' } },
};

/**
 * Testimonials — quoted verbatim from the credential deck, slide 5.
 */
export const testimonials = [
  {
    id: 'k11-concepts',
    quote: {
      en: 'From social planning to media strategies, from overseas to Mainland China, Migather knows exactly what we need and provide practical and timely solutions!',
      'zh-Hant': '由社群規劃到媒體策略，由海外到中國內地，Migather 清楚我們的需要，並提供切實而及時的解決方案！',
      'zh-Hans': '由社群规划到媒体策略，由海外到中国内地，Migather 清楚我们的需要，并提供切实而及时的解决方案！',
    },
    author: 'Lily Yu',
    role: { en: 'General Manager, K11 Concepts', 'zh-Hant': '總經理，K11 Concepts', 'zh-Hans': '总经理，K11 Concepts' },
  },
  {
    id: 'invisalign',
    quote: {
      en: 'As a working partner for several years, Migather can always fulfill our KPI and level up the business. There’s no doubt that you can ask for their supports whenever you need them.',
      'zh-Hant': '多年合作夥伴，Migather 總能達成我們的 KPI 並推動業務成長。有需要時向他們提出支援要求，毫無疑問他們會回應。',
      'zh-Hans': '多年合作伙伴，Migather 总能达成我们的 KPI 并推动业务成长。有需要时向他们提出支援要求，毫无疑问他们会回应。',
    },
    author: 'Irene Leung',
    role: { en: 'Marketing Manager, Invisalign Hong Kong', 'zh-Hant': '市場推廣經理，Invisalign 香港', 'zh-Hans': '市场推广经理，Invisalign 香港' },
  },
  {
    id: 'moet-hennessy',
    quote: {
      en: 'The team completed countless missions with flying colours. They are passionate, proactive, love to explore new opportunities and always strive to be better. With Migather, we found the best digital partner in the region.',
      'zh-Hant': '團隊完成無數任務，成績斐然。他們熱忱、主動、熱愛探索新機會，並且不斷追求更好。與 Migather 合作，讓我們找到了區內最好的數位夥伴。',
      'zh-Hans': '团队完成无数任务，成绩斐然。他们热忱、主动、热爱探索新机会，并且不断追求更好。与 Migather 合作，让我们找到了区内最好的数码伙伴。',
    },
    author: 'Crystal Chan',
    role: { en: 'Brand Manager, Moet Hennessy Diageo', 'zh-Hant': '品牌經理，Moet Hennessy Diageo', 'zh-Hans': '品牌经理，Moet Hennessy Diageo' },
  },
  {
    id: 'new-balance',
    quote: {
      en: 'Migather is above and beyond their competitors. They are resourceful, professional, patient and meticulous. They provide wonderful and amazing deliverables. Migather is definitely the right choice.',
      'zh-Hant': 'Migather 超越同儕。他們多才多藝、專業、耐心而細心，交付成果出色。Migather 絕對是正確的選擇。',
      'zh-Hans': 'Migather 超越同业。他们多才多艺、专业、耐心而细心，交付成果出色。Migather 绝对是正确的选择。',
    },
    author: 'Calvin Yip',
    role: { en: 'Regional eCommerce Manager, New Balance', 'zh-Hant': '區域電子商務經理，New Balance', 'zh-Hans': '区域电子商务经理，New Balance' },
  },
];
