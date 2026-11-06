/**
 * Brand constants, navigation and site chrome.
 *
 * Anything that is a *fact about Migather* rather than a piece of copy lives
 * here or in the sibling data modules. Copy that changes per language is
 * stored as `{ en, 'zh-Hant', 'zh-Hans' }`.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  ⚠  PRE-LAUNCH BLOCKERS — deliberately left blank rather than invented
 *
 *  · CONTACT.formEndpoint  — the contact form has no delivery endpoint yet.
 *    Wire it before launch, otherwise enquiries are discarded silently.
 *  · CONTACT.email         — no verified mailbox on file. The MX record for
 *    migather.com is a null MX, so inbound mail to the domain is rejected
 *    until DNS is fixed. Do not publish an address that drops enquiries.
 *  · CONTACT.phone         — no number on file.
 *  · Offices have no street addresses on file.
 *  · Social profile URLs are not on file, so no social links are rendered.
 *
 *  See `docs/LAUNCH_CHECKLIST.md`.
 *  ─────────────────────────────────────────────────────────────────────────
 */

export const site = {
  name: 'Migather',
  legalName: 'Migather Limited',
  descriptor: {
    en: 'Performance Digital Creative & Media Agency',
    'zh-Hant': '效能型數位創意及媒體代理公司',
    'zh-Hans': '效能型数字创意及媒体代理机构',
  },
  descriptorShort: {
    en: 'Media Solutions Expert',
    'zh-Hant': '媒體方案專家',
    'zh-Hans': '媒体方案专家',
  },
  url: 'https://migather.com',
  foundedYear: null, // not on file — the domain was registered in 2016, but that is not a founding date
};

/** Pre-launch placeholders. See the note above. */
export const CONTACT = {
  formEndpoint: '[placeholder — needs figure]',
  email: '[placeholder — needs figure]',
  phone: '[placeholder — needs figure]',
  linkedin: null,
};

/**
 * Primary navigation.
 *
 * Order: About us · Services · Works · Contact — set by management in
 * November 2026. The order is the one thing here that is a design decision
 * rather than a fact about the agency, so it lives in one place.
 */
export const primaryNav = [
  {
    key: 'about',
    to: '/about',
    label: { en: 'About us', 'zh-Hant': '關於我們', 'zh-Hans': '关于我们' },
  },
  {
    key: 'capabilities',
    to: '/capabilities',
    label: { en: 'Services', 'zh-Hant': '服務範疇', 'zh-Hans': '服务范围' },
  },
  { key: 'work', to: '/work', label: { en: 'Works', 'zh-Hant': '案例', 'zh-Hans': '案例' } },
  {
    key: 'contact',
    to: '/contact',
    label: { en: 'Contact', 'zh-Hant': '聯絡我們', 'zh-Hans': '联系我们' },
  },
];

export const footerNav = {
  Work: [
    { to: '/work', label: { en: 'Selected work', 'zh-Hant': '精選案例', 'zh-Hans': '精选案例' } },
    { to: '/work?filter=finance', label: { en: 'Finance & investment', 'zh-Hant': '金融及投資', 'zh-Hans': '金融及投资' } },
    { to: '/work?filter=properties', label: { en: 'Property & travel', 'zh-Hant': '地產及旅遊', 'zh-Hans': '地产及旅游' } },
    { to: '/work?filter=lifestyle', label: { en: 'Lifestyle & retail', 'zh-Hant': '生活品味及零售', 'zh-Hans': '生活品味及零售' } },
  ],
  Agency: [
    { to: '/capabilities', label: { en: 'Capabilities', 'zh-Hant': '服務範疇', 'zh-Hans': '服务范围' } },
    { to: '/about', label: { en: 'About us', 'zh-Hant': '關於我們', 'zh-Hans': '关于我们' } },
    { to: '/careers', label: { en: 'Careers', 'zh-Hant': '加入我們', 'zh-Hans': '加入我们' } },
    { to: '/contact', label: { en: 'Contact', 'zh-Hant': '聯絡我們', 'zh-Hans': '联系我们' } },
  ],
};

export const legalNav = [
  { to: '/legal/privacy', label: { en: 'Privacy Policy', 'zh-Hant': '私隱政策', 'zh-Hans': '隐私政策' } },
  { to: '/legal/terms', label: { en: 'Terms of Use', 'zh-Hant': '使用條款', 'zh-Hans': '使用条款' } },
  { to: '/legal/disclosure', label: { en: 'KOL Disclosure', 'zh-Hant': 'KOL 合作披露', 'zh-Hans': 'KOL 合作披露' } },
];

/**
 * Offices. Street addresses are not on file — the city and country are.
 * Sources: `LIBRARY 2026 Q4` working slides ("SEA, HK & Mainland China
 * coverage") and the 11 SKIES social management deck (office headcount).
 */
export const offices = [
  {
    city: { en: 'Hong Kong', 'zh-Hant': '香港', 'zh-Hans': '香港' },
    region: { en: 'Hong Kong SAR', 'zh-Hant': '香港特別行政區', 'zh-Hans': '香港特别行政区' },
    address: null,
    role: { en: 'Headquarters', 'zh-Hant': '總部', 'zh-Hans': '总部' },
  },
  {
    city: { en: 'Shanghai', 'zh-Hant': '上海', 'zh-Hans': '上海' },
    region: { en: "Mainland China", 'zh-Hant': '中國內地', 'zh-Hans': '中国内地' },
    address: null,
    role: { en: 'Mainland team', 'zh-Hant': '內地團隊', 'zh-Hans': '内地团队' },
  },
  {
    city: { en: 'Shenzhen', 'zh-Hant': '深圳', 'zh-Hans': '深圳' },
    region: { en: "Mainland China", 'zh-Hant': '中國內地', 'zh-Hans': '中国内地' },
    address: null,
    role: { en: 'Mainland team', 'zh-Hant': '內地團隊', 'zh-Hans': '内地团队' },
  },
];

/**
 * Markets we work in. Source: `LIBRARY 2026 Q4` working slides — "SEA, HK &
 * Mainland China coverage", and the New World Development case (China,
 * Singapore, Australia, Thailand, Malaysia, Indonesia).
 */
export const markets = [
  {
    name: { en: 'Hong Kong', 'zh-Hant': '香港', 'zh-Hans': '香港' },
    note: {
      en: 'Local-language strategy, social management and media buying for HK brands and HK-market teams.',
      'zh-Hant': '為香港品牌及針對香港市場的團隊提供本地化策略、社群管理及媒體投放。',
      'zh-Hans': '为香港品牌及针对香港市场的团队提供本地化策略、社群管理及媒体投放。',
    },
  },
  {
    name: { en: 'Mainland China', 'zh-Hant': '中國內地', 'zh-Hans': '中国内地' },
    note: {
      en: 'WeChat, 小红书 and Weibo content, China SEM and programmatic, plus cross-border campaigns run from our own Shanghai and Shenzhen teams.',
      'zh-Hant': '微信、小紅書及微博內容，中國內地搜尋及程序化投放，並由上海及深圳團隊直接執行跨境項目。',
      'zh-Hans': '微信、小红书及微博内容，中国内地搜索及程序化投放，并由上海及深圳团队直接执行跨境项目。',
    },
  },
  {
    name: { en: 'Southeast Asia', 'zh-Hant': '東南亞', 'zh-Hans': '东南亚' },
    note: {
      en: 'Regional campaigns spanning Singapore, Malaysia, Thailand, Indonesia, the Philippines and Australia.',
      'zh-Hant': '涵蓋新加坡、馬來西亞、泰國、印尼、菲律賓及澳洲的區域性項目。',
      'zh-Hans': '涵盖新加坡、马来西亚、泰国、印尼、菲律宾及澳洲的区域性项目。',
    },
  },
];

/**
 * Platform & certification list.
 *
 * Sources: `LIBRARY 2026 Q4` working slides — "Line Up: Google / Baidu / 360",
 * the 11 SKIES deck (Baidu & Google SEM, LinkedIn, Maimai display, China DSP
 * programmatic), the China decks (WeChat, 小红书, Weibo), and the certification
 * page (Google AdWords, Baidu, Facebook Blueprint).
 */
export const platforms = [
  { name: 'Google Ads', group: { en: 'Search & display', 'zh-Hant': '搜尋及展示', 'zh-Hans': '搜索及展示' } },
  { name: 'Baidu', group: { en: 'Search & display', 'zh-Hant': '搜尋及展示', 'zh-Hans': '搜索及展示' } },
  { name: '360', group: { en: 'Search & display', 'zh-Hant': '搜尋及展示', 'zh-Hans': '搜索及展示' } },
  { name: 'Facebook / Instagram', group: { en: 'Paid & organic social', 'zh-Hant': '付費及自然社群', 'zh-Hans': '付费及自然社群' } },
  { name: 'LinkedIn', group: { en: 'Paid & organic social', 'zh-Hant': '付費及自然社群', 'zh-Hans': '付费及自然社群' } },
  { name: 'YouTube', group: { en: 'Paid & organic social', 'zh-Hant': '付費及自然社群', 'zh-Hans': '付费及自然社群' } },
  { name: 'WeChat 微信', group: { en: 'China platforms', 'zh-Hant': '中國平台', 'zh-Hans': '中国平台' } },
  { name: '小红书', group: { en: 'China platforms', 'zh-Hant': '中國平台', 'zh-Hans': '中国平台' } },
  { name: 'Weibo 微博', group: { en: 'China platforms', 'zh-Hant': '中國平台', 'zh-Hans': '中国平台' } },
  { name: 'Douyin 抖音', group: { en: 'China platforms', 'zh-Hant': '中國平台', 'zh-Hans': '中国平台' } },
  { name: 'Kuaishou 快手', group: { en: 'China platforms', 'zh-Hant': '中國平台', 'zh-Hans': '中国平台' } },
  { name: 'Toutiao 頭條', group: { en: 'China platforms', 'zh-Hant': '中國平台', 'zh-Hans': '中国平台' } },
  { name: 'Programmatic DSP', group: { en: 'Programmatic', 'zh-Hant': '程序化投放', 'zh-Hans': '程序化投放' } },
  { name: 'Maimai 脈脈', group: { en: 'Programmatic', 'zh-Hant': '程序化投放', 'zh-Hans': '程序化投放' } },
];

export const certifications = [
  { name: 'Google AdWords', note: { en: 'Certified', 'zh-Hant': '認證', 'zh-Hans': '认证' } },
  { name: 'Baidu', note: { en: 'Certified', 'zh-Hant': '認證', 'zh-Hans': '认证' } },
  { name: 'Facebook Blueprint', note: { en: 'Certified', 'zh-Hant': '認證', 'zh-Hans': '认证' } },
];
