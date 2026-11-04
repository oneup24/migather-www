/**
 * Client work — every entry traces to a file in `Migather/LIBRARY 2026 Q4/`.
 *
 * The `source` field on each case names the deck and slide the entry came
 * from. Nothing here is written from memory, and no figure appears that is
 * not printed in the cited deck.
 *
 * ── Known deck ambiguities, flagged rather than smoothed over ─────────────
 *  · `huatai-finance-hk` — the deck prints the measurement window as
 *    "From 1-8-2021 Till 1-1-2021", which is internally inconsistent. The
 *    result figures are shown; the window is not stated on the site.
 *  · `atfx-securities-hk` — the deck prints "58% Click Through Rate" and
 *    "43% Cost per Click" without stating the direction of change, and its
 *    third metric ("Cost per Conversion") has no legible figure. The two
 *    legible metrics are shown; the third is shown as unknown.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const sectors = {
  finance: {
    label: { en: 'Finance & investment', 'zh-Hant': '金融及投資', 'zh-Hans': '金融及投资' },
  },
  properties: {
    label: { en: 'Property & shopping', 'zh-Hant': '地產及購物', 'zh-Hans': '地产及购物' },
  },
  travel: {
    label: { en: 'Travel & tourism', 'zh-Hant': '旅遊及酒店', 'zh-Hans': '旅游及酒店' },
  },
  luxury: {
    label: { en: 'Luxury & auction', 'zh-Hant': '奢華及拍賣', 'zh-Hans': '奢华及拍卖' },
  },
  lifestyle: {
    label: { en: 'Lifestyle & retail', 'zh-Hant': '生活品味及零售', 'zh-Hans': '生活品味及零售' },
  },
};

export const cases = [
  {
    slug: 'huatai-finance-hk',
    client: 'Huatai Finance HK',
    clientLocal: '華泰證券',
    projectLocal: '漲樂全球通',
    sector: 'finance',
    partnershipSince: { en: 'July 2021', 'zh-Hant': '2021年7月', 'zh-Hans': '2021年7月' },
    featured: true,
    summary: {
      en: 'A one-stop Hong Kong branding and social programme for a China-headquartered broker’s retail investment brand — branding video, localised social strategy, and online campaigns tied to offline OOH events.',
      'zh-Hant': '為一家中國總部券商的零售投資品牌，於香港執行一站式品牌及社群項目——品牌影片、本地化社群策略，並結合線下戶外廣告的線上推廣。',
      'zh-Hans': '为一家中国总部券商的零售投资品牌，在香港执行一站式品牌及社群项目——品牌视频、本地化社群策略，并结合线下户外广告的线上推广。',
    },
    results: [
      {
        value: '+38%',
        label: { en: 'Facebook fans base', 'zh-Hant': 'Facebook 粉絲數', 'zh-Hans': 'Facebook 粉丝数' },
        note: {
          en: 'Organic, without paid social budget',
          'zh-Hant': '自然增長，未動用付費社群預算',
          'zh-Hans': '自然增长，未动用付费社群预算',
        },
      },
      {
        value: '+48%',
        label: { en: 'Social engagement', 'zh-Hant': '社群互動率', 'zh-Hans': '社群互动率' },
        note: {
          en: 'Organic, without paid social budget',
          'zh-Hant': '自然增長，未動用付費社群預算',
          'zh-Hans': '自然增长，未动用付费社群预算',
        },
      },
    ],
    scope: [
      { en: 'Branding video — full length, 15s and 30s cuts', 'zh-Hant': '品牌影片——完整版、15秒及30秒版本', 'zh-Hans': '品牌视频——完整版、15秒及30秒版本' },
      { en: 'Localised Hong Kong branding strategy', 'zh-Hant': '香港本地化品牌策略', 'zh-Hans': '香港本地化品牌策略' },
      { en: 'Creative and social strategy for Facebook and Instagram pages', 'zh-Hant': 'Facebook 及 Instagram 專頁的創意及社群策略', 'zh-Hans': 'Facebook 及 Instagram 专页的创意及社群策略' },
      { en: 'O2O campaigns linked to OOH bus and tram advertising, promotional car and roadshow', 'zh-Hant': '結合巴士及電車戶外廣告、宣傳車及路演的線上線下整合推廣', 'zh-Hans': '结合巴士及电车户外广告、宣传车及路演的线上线下整合推广' },
      { en: 'KOL and third-party Facebook page collaborations', 'zh-Hant': 'KOL 及第三方 Facebook 專頁合作', 'zh-Hans': 'KOL 及第三方 Facebook 专页合作' },
    ],
    source: 'LIBRARY 2026 Q4/Agency Credential Deck Showcases/Performance First Group branding project 2025Q1.pptx — slide 7',
  },

  {
    slug: '11-skies-gba-forum',
    client: '11 SKIES',
    clientLocal: '11 天空之城',
    sector: 'properties',
    partnershipSince: { en: '2021', 'zh-Hant': '2021年', 'zh-Hans': '2021年' },
    featured: true,
    summary: {
      en: 'A Greater Bay Area business forum campaign built to drive reach, site traffic and live-stream registrations for a cross-border shopping complex.',
      'zh-Hant': '大灣區商務論壇項目，為跨境購物城帶來曝光、網站流量及直播報名人數。',
      'zh-Hans': '大湾区商务论坛项目，为跨境购物城带来曝光、网站流量及直播报名人数。',
    },
    results: [
      {
        value: '+79%',
        label: { en: 'Impressions vs plan', 'zh-Hant': '曝光量對比計劃', 'zh-Hans': '曝光量对比计划' },
      },
      {
        value: '+45%',
        label: { en: 'Clicks vs plan', 'zh-Hant': '點擊量對比計劃', 'zh-Hans': '点击量对比计划' },
      },
      {
        value: '+55%',
        label: { en: 'Average page views', 'zh-Hant': '平均頁面瀏覽量', 'zh-Hans': '平均页面浏览量' },
      },
      {
        value: '3,000+',
        label: { en: 'Live-stream registrations', 'zh-Hant': '直播活動報名人數', 'zh-Hans': '直播活动报名人数' },
      },
    ],
    scope: [
      { en: 'Maimai display advertising with anti-fraud traffic filtering', 'zh-Hant': '脈脈展示廣告，結合反欺詐流量過濾', 'zh-Hans': '脉脉展示广告，结合反欺诈流量过滤' },
      { en: 'China DSP programmatic display for repeat quality traffic', 'zh-Hant': '中國 DSP 程序化展示，累積優質流量', 'zh-Hans': '中国 DSP 程序化展示，累积优质流量' },
      { en: 'Baidu and Google SEM, plus LinkedIn advertising', 'zh-Hant': '百度及 Google 搜尋廣告，以及 LinkedIn 廣告', 'zh-Hans': '百度及 Google 搜索广告，以及 LinkedIn 广告' },
      { en: 'Campaign site production and tracking', 'zh-Hant': '推廣網站製作及追蹤設定', 'zh-Hans': '推广网站制作及追踪设置' },
    ],
    source: 'LIBRARY 2026 Q4/Agency Credential Deck Showcases/Performance First Group branding project 2025Q1.pptx — slide 16',
  },

  {
    slug: 'bank-of-china-hk',
    client: 'Bank of China HK',
    clientLocal: '中銀香港',
    sector: 'finance',
    partnershipSince: null,
    featured: true,
    summary: {
      en: 'Creative and UI/UX adaptation of brand video and banner assets for a Hong Kong banking app campaign site, built to be search-friendly and consistent with brand guidelines.',
      'zh-Hant': '為香港銀行手機應用推廣網站，進行品牌影片及橫幅素材的創意與 UI/UX 適配，兼顧搜尋友好及品牌規範一致性。',
      'zh-Hans': '为香港银行手机应用推广网站，进行品牌视频及横幅素材的创意与 UI/UX 适配，兼顾搜索友好及品牌规范一致性。',
    },
    results: [
      {
        value: '+18%',
        label: { en: 'Website traffic, organically', 'zh-Hant': '自然搜尋網站流量', 'zh-Hans': '自然搜索网站流量' },
      },
      {
        value: '+38%',
        label: { en: 'Stay time of unique visitor', 'zh-Hant': '獨立訪客停留時間', 'zh-Hans': '独立访客停留时间' },
      },
    ],
    scope: [
      { en: 'Branding video and banner adaptation for web', 'zh-Hant': '品牌影片及網頁橫幅適配', 'zh-Hans': '品牌视频及网页横幅适配' },
      { en: 'Custom UI/UX approach for the campaign page', 'zh-Hant': '推廣頁面的客製化 UI/UX 設計', 'zh-Hans': '推广页面的定制化 UI/UX 设计' },
      { en: 'Branding elements adapted to the campaign web page', 'zh-Hant': '品牌元素於推廣網頁上的適配', 'zh-Hans': '品牌元素在推广网页上的适配' },
      { en: 'SEO-friendly build', 'zh-Hant': '搜尋引擎友好的網頁建置', 'zh-Hans': '搜索引擎友好的网页建置' },
    ],
    source: 'LIBRARY 2026 Q4/Agency Credential Deck Showcases/Performance First Group branding project 2025Q1.pptx — slide 11',
  },

  {
    slug: 'atfx-securities-hk',
    client: 'ATFX Securities HK',
    sector: 'finance',
    partnershipSince: null,
    featured: true,
    summary: {
      en: 'A Hong Kong and Southeast Asia acquisition programme for an online trading platform — SEM and display, A/B testing, remarketing, whitelisting and weekly optimisation against conversion cost.',
      'zh-Hant': '為線上交易平台於香港及東南亞市場执行的獲客項目——搜尋及展示廣告、A/B 測試、再營銷、白名單投放，並按週針對轉化成本優化。',
      'zh-Hans': '为线上交易平台在香港及东南亚市场执行的获客项目——搜索及展示广告、A/B 测试、再营销、白名单投放，并按周针对转化成本优化。',
    },
    results: [
      {
        value: '58%',
        label: { en: 'Click-through rate', 'zh-Hant': '點擊率', 'zh-Hans': '点击率' },
      },
      {
        value: '43%',
        label: { en: 'Cost per click', 'zh-Hant': '每次點擊成本', 'zh-Hans': '每次点击成本' },
      },
      {
        value: '—',
        label: { en: 'Cost per conversion', 'zh-Hant': '每次轉化成本', 'zh-Hans': '每次转化成本' },
        note: {
          en: 'Metric tracked in the deck; the figure is not legible in the source file',
          'zh-Hant': '此指標於簡報中有記錄，但原始檔案中的數值無法辨識',
          'zh-Hans': '此指标于简报中有记录，但原始文件中的数值无法辨识',
        },
      },
    ],
    scope: [
      { en: 'One-stop online acquisition strategy', 'zh-Hant': '一站式線上獲客策略', 'zh-Hans': '一站式线上获客策略' },
      { en: 'Campaign development, A/B testing and result monitoring', 'zh-Hant': '推廣開發、A/B 測試及成效監控', 'zh-Hans': '推广开发、A/B 测试及成效监控' },
      { en: 'Google Ad products — ad extension and best practice for HK and SEA', 'zh-Hant': 'Google Ads 產品——廣告延伸功能，結合香港及東南亞最佳做法', 'zh-Hans': 'Google Ads 产品——广告延伸功能，结合香港及东南亚最佳做法' },
      { en: 'Remarketing and whitelisting of sensitive cryptocurrency portals', 'zh-Hant': '再營銷及加密貨幣相關敏感門戶的白名單投放', 'zh-Hans': '再营销及加密货币相关敏感门户的白名单投放' },
      { en: 'Weekly and monthly reporting against conversion cost', 'zh-Hant': '按週及按月提交轉化成本報告', 'zh-Hans': '按周及按月提交转化成本报告' },
    ],
    source: 'LIBRARY 2026 Q4/Agency Credential Deck Showcases/Performance First Group branding project 2025Q1.pptx — slide 9',
  },

  {
    slug: 'wing-fung-financial-hk',
    client: 'Wing Fung Financial Group HK',
    sector: 'finance',
    partnershipSince: null,
    featured: false,
    summary: {
      en: 'Hong Kong branding and social marketing for a financial group promoting HK stock, commodities, bullion gold and FX trading — with animated GIF and carousel formats built for social.',
      'zh-Hant': '為永豐金融集團執行的香港品牌及社群營銷，涵蓋港股、商品、黃金及外匯交易推廣，並製作適合社群的動態 GIF 及輪播格式。',
      'zh-Hans': '为永丰金融集团执行的香港品牌及社群营销，涵盖港股、商品、黄金及外汇交易推广，并制作适合社群的动态 GIF 及轮播格式。',
    },
    results: [
      {
        value: '+25%',
        label: { en: 'Facebook fans base', 'zh-Hant': 'Facebook 粉絲數', 'zh-Hans': 'Facebook 粉丝数' },
        note: {
          en: 'Organic, without paid social budget',
          'zh-Hant': '自然增長，未動用付費社群預算',
          'zh-Hans': '自然增长，未动用付费社群预算',
        },
      },
      {
        value: '+30%',
        label: { en: 'Social engagement', 'zh-Hant': '社群互動率', 'zh-Hans': '社群互动率' },
        note: {
          en: 'Organic, without paid social budget',
          'zh-Hant': '自然增長，未動用付費社群預算',
          'zh-Hans': '自然增长，未动用付费社群预算',
        },
      },
    ],
    scope: [
      { en: 'Localised Hong Kong branding strategy', 'zh-Hant': '香港本地化品牌策略', 'zh-Hans': '香港本地化品牌策略' },
      { en: 'Creative and social strategy for Facebook and Instagram pages', 'zh-Hant': 'Facebook 及 Instagram 專頁的創意及社群策略', 'zh-Hans': 'Facebook 及 Instagram 专页的创意及社群策略' },
      { en: 'Animation in GIF and carousel formats', 'zh-Hant': 'GIF 及輪播格式動畫', 'zh-Hans': 'GIF 及轮播格式动画' },
    ],
    source: 'LIBRARY 2026 Q4/Agency Credential Deck Showcases/Performance First Group branding project 2025Q1.pptx — slide 10',
  },

  {
    slug: 'new-world-development',
    client: 'New World Development',
    sector: 'properties',
    partnershipSince: { en: '2016', 'zh-Hant': '2016年', 'zh-Hans': '2016年' },
    featured: true,
    summary: {
      en: 'A long-running multi-market awareness programme across China, Singapore, Australia, Thailand, Malaysia and Indonesia — press, KOL, online publishers, social content management, paid social and programmatic.',
      'zh-Hant': '橫跨中國、新加坡、澳洲、泰國、馬來西亞及印尼的長期品牌知名度項目——新聞稿、KOL、線上媒體、社群內容管理、付費社群及程序化投放。',
      'zh-Hans': '横跨中国、新加坡、澳洲、泰国、马来西亚及印尼的长期品牌认知项目——新闻稿、KOL、线上媒体、社群内容管理、付费社群及程序化投放。',
    },
    results: [],
    scope: [
      { en: 'Online press releases', 'zh-Hant': '線上新聞稿', 'zh-Hans': '线上新闻稿' },
      { en: 'KOL and online publisher partnerships', 'zh-Hant': 'KOL 及線上媒體合作', 'zh-Hans': 'KOL 及线上媒体合作' },
      { en: 'Social content management', 'zh-Hant': '社群內容管理', 'zh-Hans': '社群内容管理' },
      { en: 'Paid social advertising', 'zh-Hant': '付費社群廣告', 'zh-Hans': '付费社群广告' },
      { en: 'Programmatic advertising', 'zh-Hant': '程序化廣告投放', 'zh-Hans': '程序化广告投放' },
    ],
    source: 'LIBRARY 2026 Q4/Agency Credential Deck Showcases/Performance First Group branding project 2025Q1.pptx — slide 15',
  },

  {
    slug: 'christies-auction',
    client: "Christie's Auction",
    clientLocal: '佳士得',
    sector: 'luxury',
    partnershipSince: { en: '2021', 'zh-Hant': '2021年', 'zh-Hans': '2021年' },
    featured: true,
    summary: {
      en: 'China social creative produced end to end for an international auction house — creative planning, strategy and production, WeChat Red Packet covers, animation, articles and sticker production from sketch.',
      'zh-Hant': '為國際拍賣行統籌的中國社群創意項目——由創意規劃、策略至製作，涵蓋微信紅包封面、動畫、文章，以及由草圖起稿的貼圖製作。',
      'zh-Hans': '为国际拍卖行统筹的中国社群创意项目——由创意规划、策略至制作，涵盖微信红包封面、动画、文章，以及由草图起稿的贴图制作。',
    },
    results: [],
    scope: [
      { en: 'Creative planning, strategy and production', 'zh-Hant': '創意規劃、策略及製作', 'zh-Hans': '创意规划、策略及制作' },
      { en: 'WeChat Red Packet cover design — 2022 CNY theme', 'zh-Hant': '微信紅包封面設計——2022 年新春主題', 'zh-Hans': '微信红包封面设计——2022 年新春主题' },
      { en: 'Animation production', 'zh-Hant': '動畫製作', 'zh-Hans': '动画制作' },
      { en: 'WeChat campaign article', 'zh-Hant': '微信推廣文章', 'zh-Hans': '微信推广文章' },
      { en: 'WeChat sticker production, from sketch', 'zh-Hant': '微信貼圖製作，由草圖起稿', 'zh-Hans': '微信贴图制作，由草图起稿' },
    ],
    source: 'LIBRARY 2026 Q4/Agency Credential Deck Showcases/Performance First Group branding project 2025Q1.pptx — slide 14',
  },

  {
    slug: 'hang-seng-bank',
    client: 'Hang Seng Bank',
    clientLocal: '恒生銀行',
    sector: 'finance',
    partnershipSince: null,
    featured: false,
    summary: {
      en: 'A YouTube short-video content series for a Hong Kong bank — market commentary, ESG explainers and cross-border wealth-connectivity updates.',
      'zh-Hant': '為香港銀行製作的 YouTube 短片系列——市場前瞻、ESG 解讀及跨境理財通資訊。',
      'zh-Hans': '为香港银行制作的 YouTube 短视频系列——市场前瞻、ESG 解读及跨境理财通资讯。',
    },
    results: [],
    scope: [
      { en: '債匯前瞻 — market commentary series', 'zh-Hant': '債匯前瞻——市場評論系列', 'zh-Hans': '债汇前瞻——市场评论系列' },
      { en: 'ESG 趨勢知多啲 — ESG explainer series', 'zh-Hant': 'ESG 趨勢知多啲——ESG 解讀系列', 'zh-Hans': 'ESG 趋势知多啲——ESG 解读系列' },
      { en: '跨境理財通市場快訊 — market updates', 'zh-Hant': '跨境理財通市場快訊——市場資訊', 'zh-Hans': '跨境理财通市场快讯——市场资讯' },
    ],
    source: 'LIBRARY 2026 Q4/Agency Credential Deck Showcases/Performance First Group branding project 2025Q1.pptx — slide 13',
  },

  {
    slug: 'fubon-bank',
    client: 'Fubon Bank',
    clientLocal: '永明金融',
    sector: 'finance',
    partnershipSince: null,
    featured: false,
    summary: {
      en: 'Online video production for a Hong Kong bank’s digital product — an info-graphic explainer and animation for its Fubon Go starter kit.',
      'zh-Hant': '為香港銀行電子產品製作的線上影片——Fubon Go 新手入門包的資訊圖表解說及動畫。',
      'zh-Hans': '为香港银行电子产品制作的线上视频——Fubon Go 新手入门包的资讯图表解说及动画。',
    },
    results: [],
    scope: [
      { en: 'Info-graphic explainer video', 'zh-Hant': '資訊圖表解說影片', 'zh-Hans': '资讯图表解说视频' },
      { en: 'Animation', 'zh-Hant': '動畫', 'zh-Hans': '动画' },
    ],
    source: 'LIBRARY 2026 Q4/Agency Credential Deck Showcases/Performance First Group branding project 2025Q1.pptx — slide 12',
  },

  {
    slug: '11-skies-social-management',
    client: '11 SKIES',
    clientLocal: '11 天空之城',
    sector: 'properties',
    partnershipSince: { en: '2021', 'zh-Hant': '2021年', 'zh-Hans': '2021年' },
    featured: false,
    summary: {
      en: 'Retained Hong Kong social media management for a cross-border shopping complex — account management, content, analytics and strategy across Facebook and Instagram, with paid social support.',
      'zh-Hant': '為跨境購物城提供的香港社群媒體管理長期合作——帳戶管理、內容、數據分析及策略，覆蓋 Facebook 及 Instagram，並配合付費社群廣告。',
      'zh-Hans': '为跨境购物城提供的香港社群媒体管理长期合作——账户管理、内容、数据分析及策略，覆盖 Facebook 及 Instagram，并配合付费社群广告。',
    },
    results: [
      {
        value: 'HK$1.31M',
        label: { en: 'Annual media budget', 'zh-Hant': '年度媒體預算', 'zh-Hans': '年度媒体预算' },
        note: {
          en: 'Facebook HK$441,000 · Instagram HK$331,800 · LinkedIn HK$537,500',
          'zh-Hant': 'Facebook HK$441,000 · Instagram HK$331,800 · LinkedIn HK$537,500',
          'zh-Hans': 'Facebook HK$441,000 · Instagram HK$331,800 · LinkedIn HK$537,500',
        },
      },
      {
        value: '17 months',
        label: { en: 'Strategy term', 'zh-Hant': '策略年期', 'zh-Hans': '策略年期' },
      },
    ],
    scope: [
      { en: 'Facebook and Instagram content and account management', 'zh-Hant': 'Facebook 及 Instagram 內容及帳戶管理', 'zh-Hans': 'Facebook 及 Instagram 内容及账户管理' },
      { en: 'Paid social advertising', 'zh-Hant': '付費社群廣告', 'zh-Hans': '付费社群广告' },
      { en: 'Analytics and strategy planning', 'zh-Hant': '數據分析及策略規劃', 'zh-Hans': '数据分析及策略规划' },
    ],
    source: 'LIBRARY 2026 Q4/HK digital marketing campaign/11 SKIES_HK Social Management Presentation_Migather Limited.pptx — slides 124–128',
  },

  {
    slug: 'marks-and-spencer',
    client: 'Marks & Spencer',
    sector: 'lifestyle',
    partnershipSince: { en: '2019', 'zh-Hant': '2019年', 'zh-Hans': '2019年' },
    featured: false,
    summary: {
      en: 'Hong Kong social media maintenance for an international retailer — account management, content, analytics, strategy planning, plus WhatsApp stickers and viral formats.',
      'zh-Hant': '為國際零售商提供的香港社群媒體維護——帳戶管理、內容、數據分析、策略規劃，以及 WhatsApp 貼圖及爆款格式。',
      'zh-Hans': '为国际零售商提供的香港社群媒体维护——账户管理、内容、数据分析、策略规划，以及 WhatsApp 贴图及爆款格式。',
    },
    results: [],
    scope: [
      { en: 'Facebook and Instagram account management and content', 'zh-Hant': 'Facebook 及 Instagram 帳戶管理及內容', 'zh-Hans': 'Facebook 及 Instagram 账户管理及内容' },
      { en: 'Analytics and strategy planning', 'zh-Hant': '數據分析及策略規劃', 'zh-Hans': '数据分析及策略规划' },
      { en: 'WhatsApp stickers and viral content formats', 'zh-Hant': 'WhatsApp 貼圖及爆款內容格式', 'zh-Hans': 'WhatsApp 贴图及爆款内容格式' },
    ],
    source: 'LIBRARY 2026 Q4/HK digital marketing campaign/Agency Credential by Migather Limited - Ecom.pptx',
  },

  {
    slug: 'h-queens',
    client: "H Queen's",
    sector: 'lifestyle',
    partnershipSince: { en: '2021', 'zh-Hant': '2021年', 'zh-Hans': '2021年' },
    featured: false,
    summary: {
      en: 'Integrated Hong Kong social for a Central art and culture venue — content development, live streaming, closed-group seeding, KOL campaigns, video shooting, artist interviews and an Instagram filter.',
      'zh-Hant': '為中環藝術文化場地提供的整合香港社群項目——內容開發、直播、專屬群組 seeding、KOL 項目、影片拍攝、藝術家專訪及 Instagram 濾鏡。',
      'zh-Hans': '为中环艺术文化场地提供的整合香港社群项目——内容开发、直播、专属群组 seeding、KOL 项目、视频拍摄、艺术家专访及 Instagram 滤镜。',
    },
    results: [],
    scope: [
      { en: 'Facebook and Instagram content and management', 'zh-Hant': 'Facebook 及 Instagram 內容及管理', 'zh-Hans': 'Facebook 及 Instagram 内容及管理' },
      { en: 'Live streaming and closed-group seeding', 'zh-Hant': '直播及專屬群組 seeding', 'zh-Hans': '直播及专属群组 seeding' },
      { en: 'KOL campaign and restaurant review seeding', 'zh-Hant': 'KOL 項目及餐廳評價 seeding', 'zh-Hans': 'KOL 项目及餐厅评价 seeding' },
      { en: 'Video shooting, artist interviews and Instagram filter', 'zh-Hant': '影片拍攝、藝術家專訪及 Instagram 濾鏡', 'zh-Hans': '视频拍摄、艺术家专访及 Instagram 滤镜' },
    ],
    source: 'LIBRARY 2026 Q4/HK digital marketing campaign/Agency Credential by Migather Limited - Ecom.pptx',
  },

  {
    slug: 'v-city-v-walk',
    client: 'V City & V Walk',
    sector: 'travel',
    partnershipSince: { en: '2021', 'zh-Hant': '2021年', 'zh-Hans': '2021年' },
    featured: false,
    summary: {
      en: 'Hong Kong social management for a New Territories shopping and lifestyle destination — content, live streaming, KOL campaigns and video production.',
      'zh-Hant': '為新界購物及生活目的地提供的香港社群管理——內容、直播、KOL 項目及影片製作。',
      'zh-Hans': '为新界购物及生活目的地提供的香港社群管理——内容、直播、KOL 项目及视频制作。',
    },
    results: [],
    scope: [
      { en: 'Facebook and Instagram content and management', 'zh-Hant': 'Facebook 及 Instagram 內容及管理', 'zh-Hans': 'Facebook 及 Instagram 内容及管理' },
      { en: 'Live streaming and closed-group seeding', 'zh-Hant': '直播及專屬群組 seeding', 'zh-Hans': '直播及专属群组 seeding' },
      { en: 'KOL campaign and video shooting', 'zh-Hant': 'KOL 項目及影片拍攝', 'zh-Hans': 'KOL 项目及视频拍摄' },
    ],
    source: 'LIBRARY 2026 Q4/HK digital marketing campaign/Agency Credential by Migather Limited - Ecom.pptx',
  },

  {
    slug: 'k11-musea',
    client: 'K11 Musea',
    sector: 'travel',
    partnershipSince: { en: '2021', 'zh-Hant': '2021年', 'zh-Hans': '2021年' },
    featured: false,
    summary: {
      en: 'Campaign-based Hong Kong content and media support for a flagship retail and art destination — media strategy, buying and execution, plus KOL and micro-influencer seeding with on-site tagging.',
      'zh-Hant': '為旗艦零售及藝術地標提供的香港活動內容及媒體支援——媒體策略、投放及執行，並結合 KOL 及微型 KOL 的現場打卡 seeding。',
      'zh-Hans': '为旗舰零售及艺术地标提供的香港活动内容及媒体支持——媒体策略、投放及执行，并结合 KOL 及微型 KOL 的现场打卡 seeding。',
    },
    results: [],
    scope: [
      { en: 'Media strategy planning, buying and execution', 'zh-Hant': '媒體策略規劃、投放及執行', 'zh-Hans': '媒体策略规划、投放及执行' },
      { en: 'KOL and micro-influencer seeding with on-site tagging', 'zh-Hant': 'KOL 及微型 KOL 現場打卡 seeding', 'zh-Hans': 'KOL 及微型 KOL 现场打卡 seeding' },
      { en: 'Facebook and Instagram content', 'zh-Hant': 'Facebook 及 Instagram 內容', 'zh-Hans': 'Facebook 及 Instagram 内容' },
    ],
    source: 'LIBRARY 2026 Q4/HK digital marketing campaign/Agency Credential by Migather Limited - Ecom.pptx',
  },

  {
    slug: 'lee-gardens',
    client: 'Lee Gardens',
    clientLocal: '利園',
    sector: 'travel',
    partnershipSince: { en: '2021', 'zh-Hant': '2021年', 'zh-Hans': '2021年' },
    featured: false,
    summary: {
      en: 'Mainland China social media maintenance — WeChat, 小红书 and Weibo account management, content, analytics, strategy planning and KOL collaboration.',
      'zh-Hant': '中國內地社群媒體維護——微信、小紅書及微博的帳戶管理、內容、數據分析、策略規劃及 KOL 合作。',
      'zh-Hans': '中国内地社群媒体维护——微信、小红书及微博的账户管理、内容、数据分析、策略规划及 KOL 合作。',
    },
    results: [],
    scope: [
      { en: 'WeChat content and management', 'zh-Hant': '微信內容及管理', 'zh-Hans': '微信内容及管理' },
      { en: '小红书 content and management, plus 小红书 KOL', 'zh-Hant': '小紅書內容及管理，以及小紅書 KOL', 'zh-Hans': '小红书内容及管理，以及小红书 KOL' },
      { en: 'Weibo content and management', 'zh-Hant': '微博內容及管理', 'zh-Hans': '微博内容及管理' },
      { en: 'Paid social advertising', 'zh-Hant': '付費社群廣告', 'zh-Hans': '付费社群广告' },
    ],
    source: 'LIBRARY 2026 Q4/HK digital marketing campaign/Social Retainer Showcase.pptx — slide 3',
  },

  {
    slug: 'chinachem',
    client: 'Chinachem',
    clientLocal: '信和集團',
    sector: 'properties',
    partnershipSince: { en: '2023', 'zh-Hant': '2023年', 'zh-Hans': '2023年' },
    featured: false,
    summary: {
      en: 'Mainland China social media maintenance for a Hong Kong property group — WeChat account management, content, analytics and strategy planning.',
      'zh-Hant': '為香港地產集團提供的中國內地社群媒體維護——微信帳戶管理、內容、數據分析及策略規劃。',
      'zh-Hans': '为香港地产集团提供的中国内地社群媒体维护——微信账户管理、内容、数据分析及策略规划。',
    },
    results: [],
    scope: [
      { en: 'WeChat content and management', 'zh-Hant': '微信內容及管理', 'zh-Hans': '微信内容及管理' },
      { en: 'Analytics and strategy planning', 'zh-Hant': '數據分析及策略規劃', 'zh-Hans': '数据分析及策略规划' },
      { en: 'Paid social advertising', 'zh-Hant': '付費社群廣告', 'zh-Hans': '付费社群广告' },
    ],
    source: 'LIBRARY 2026 Q4/HK digital marketing campaign/Social Retainer Showcase.pptx — slide 4',
  },
];

export function getCase(slug) {
  return cases.find((c) => c.slug === slug);
}

export function featuredCases() {
  return cases.filter((c) => c.featured);
}
