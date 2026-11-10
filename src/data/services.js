/**
 * Services, organised by business goal.
 *
 * The service list is derived from the 23 agreed `SCOPE OF WORK` lines in
 * the CRM (`scope_items`), which are wording already used in signed scopes.
 * Where a line carries a price, the price is deliberately NOT published on
 * the site — indicative pricing stays in the proposal and CRM until it is
 * confirmed. See `docs/LAUNCH_CHECKLIST.md`.
 *
 * Goal-led rather than service-led: Chinese buyers read media propositions
 * by business objective, not by deliverable list. Three goals, because
 * "we do fewer things, properly".
 */

export const goals = [
  {
    key: 'build',
    number: '01',
    name: { en: 'Build the brand', 'zh-Hant': '建立品牌', 'zh-Hans': '建立品牌' },
    statement: {
      en: 'Make the brand worth knowing — strategy, creative and content that give the brand something to say, and the craft to say it well.',
      'zh-Hant': '令品牌值得被認識——策略、創意及內容，為品牌建立清晰訊息，並以紮實執行說好這句話。',
      'zh-Hans': '让品牌值得被认识——策略、创意及内容，为品牌建立清晰信息，并以扎实执行说好这句话。',
    },
    items: [
      {
        key: 'strategic-creative',
        name: { en: 'Strategic & creative development', 'zh-Hant': '策略及創意開發', 'zh-Hans': '策略及创意开发' },
        description: {
          en: 'Competitor and campaign analysis, creative direction, key visuals and storytelling concepts — including mock-ups for social, OOH and offline experiences.',
          'zh-Hant': '競爭對手及市場活動分析、創意方向、主視覺及故事概念，並包含社群、戶外廣告及線下體驗的視覺模擬。',
          'zh-Hans': '竞争对手及市场活动分析、创意方向、主视觉及故事概念，并包含社群、户外广告及线下体验的视觉模拟。',
        },
      },
      {
        key: 'creative-content',
        name: { en: 'Creative & visual content', 'zh-Hant': '創意及視覺內容', 'zh-Hans': '创意及视觉内容' },
        description: {
          en: 'Content planning and production — up to 40 content pieces per quarter, with visual identity and templates refined over time.',
          'zh-Hant': '內容規劃及製作——每季最多 40 件內容，並隨時間持續優化視覺識別及版式。',
          'zh-Hans': '内容规划及制作——每季最多 40 件内容，并随时间持续优化视觉识别及版式。',
        },
      },
      {
        key: 'pr',
        name: { en: 'Public relations & media management', 'zh-Hant': '公關及媒體管理', 'zh-Hans': '公关及媒体管理' },
        description: {
          en: 'Press release writing in Traditional Chinese and English, media pitching, distribution to targeted outlets, journalist follow-up and coverage reporting.',
          'zh-Hant': '中英文新聞稿撰寫、媒體 pitching、定向發佈、記者跟進及報導剪報整理。',
          'zh-Hans': '中英文新闻稿撰写、媒体 pitching、定向发布、记者跟进及报道剪报整理。',
        },
      },
      {
        key: 'media-distribution',
        name: { en: 'Media distribution & monitoring', 'zh-Hant': '媒體派發及監測', 'zh-Hans': '媒体派发及监测' },
        description: {
          en: 'Press materials sent to curated media lists, with coverage monitored, compiled and reported.',
          'zh-Hant': '將新聞素材派發至精選媒體名單，並監測、彙整及報告相關報導。',
          'zh-Hans': '将新闻素材派发至精选媒体名单，并监测、汇总及报告相关报道。',
        },
      },
      {
        key: 'media-day',
        name: { en: 'Media day & event coordination', 'zh-Hant': '媒體日及活動統籌', 'zh-Hans': '媒体日及活动统筹' },
        description: {
          en: 'Concepts and run-downs, media invitations and RSVP, on-site coordination, interviews, photography and event recap.',
          'zh-Hant': '創意概念及流程表、媒體邀請及回覆、現場統籌、採訪、攝影及活動回顧。',
          'zh-Hans': '创意概念及流程表、媒体邀请及回复、现场统筹、采访、摄影及活动回顾。',
        },
      },
      {
        key: 'social-seeding',
        name: { en: 'Social seeding retainer', 'zh-Hant': '社群 Seeding 長期合作', 'zh-Hans': '社群 Seeding 长期合作' },
        description: {
          en: 'Monthly brand-awareness maintenance through public platform seeding, with message write-up, publishing and monitoring.',
          'zh-Hant': '透過公開平台 seeding 每月維持品牌知名度，並包括訊息撰寫、發佈及監測。',
          'zh-Hans': '透过公开平台 seeding 每月维持品牌知名度，并包括信息撰写、发布及监测。',
        },
      },
      {
        key: 'localization',
        name: { en: 'Content & website localization', 'zh-Hant': '內容及網站本地化', 'zh-Hans': '内容及网站本地化' },
        description: {
          en: 'Website translation, new product and landing page creation, banner localisation and chatbot setup.',
          'zh-Hant': '網站翻譯、新產品及推廣頁面製作、橫幅本地化及聊天機器人設定。',
          'zh-Hans': '网站翻译、新产品及推广页面制作、横幅本地化及聊天机器人设置。',
        },
      },
    ],
  },

  {
    key: 'grow',
    number: '02',
    name: { en: 'Grow the audience', 'zh-Hant': '擴展受眾', 'zh-Hans': '扩展受众' },
    statement: {
      en: 'Put the brand in front of the right people — paid, earned and creator media planned as one system, not three line items.',
      'zh-Hant': '讓品牌出現在對的人面前——付費、贏得及創作者媒體以同一系統規劃，而非三項獨立服務。',
      'zh-Hans': '让品牌出现在对的人面前——付费、赢得及创作者媒体以同一系统规划，而非三项独立服务。',
    },
    items: [
      {
        key: 'social-listening',
        name: { en: 'Social listening & insights', 'zh-Hant': '社群監測及洞察', 'zh-Hans': '社群监测及洞察' },
        description: {
          en: 'Competitor and influencer account monitoring, audience behaviour analysis, and tracking of industry updates and whitepapers.',
          'zh-Hant': '監測競爭對手及 KOL 帳戶、分析受眾行為，並追蹤行業動態及研究報告。',
          'zh-Hans': '监测竞争对手及 KOL 账户、分析受众行为，并追踪行业动态及研究报告。',
        },
      },
      {
        key: 'community',
        name: { en: 'Account maintenance & community', 'zh-Hant': '帳戶維護及社群經營', 'zh-Hans': '账户维护及社群经营' },
        description: {
          en: 'Daily comment replies and audience engagement, fact-checking of published content, and handling of direct messages and inquiries.',
          'zh-Hant': '每日回覆留言及受眾互動、已發佈內容的事實查核，以及處理私訊及查詢。',
          'zh-Hans': '每日回复留言及受众互动、已发布内容的事实查核，以及处理私信及查询。',
        },
      },
      {
        key: 'paid-media',
        name: { en: 'Paid media & advertising', 'zh-Hant': '付費媒體及廣告', 'zh-Hans': '付费媒体及广告' },
        description: {
          en: 'Creative and audience optimisation for reach, engagement and conversion; short-term campaign boosts; and media buying plans that control cost per reach.',
          'zh-Hant': '優化創意及受眾設定以提升觸及、互動及轉化；短期推廣加強曝光；以及控制每次觸及成本的媒體投放計劃。',
          'zh-Hans': '优化创意及受众设定以提升触及、互动及转化；短期推广加强曝光；以及控制每次触及成本的媒体投放计划。',
        },
      },
      {
        key: 'kol',
        name: { en: 'KOL & influencer collaboration', 'zh-Hant': 'KOL 及網紅合作', 'zh-Hans': 'KOL 及网红合作' },
        description: {
          en: 'KOL selection and management, co-promotional campaigns, and joint events or co-created content with external experts and creators.',
          'zh-Hant': 'KOL 甄選及管理、聯合推廣項目，以及與外部專家及創作者合辦活動或共同創作內容。',
          'zh-Hans': 'KOL 甄选及管理、联合推广项目，以及与外部专家及创作者合办活动或共同创作内容。',
        },
      },
      {
        key: 'kol-campaign',
        name: { en: 'KOL & digital campaign management', 'zh-Hant': 'KOL 及數位推廣管理', 'zh-Hans': 'KOL 及数字推广管理' },
        description: {
          en: 'KOL selection, content briefing, posting and monitoring, with mock-ups provided for creator posts, publisher layouts and advertorials.',
          'zh-Hant': 'KOL 甄選、內容簡報、發佈及監測，並為創作者貼文、媒體版面及專題文章提供視覺模擬。',
          'zh-Hans': 'KOL 甄选、内容简报、发布及监测，并为创作者帖文、媒体版面及专题文章提供视觉模拟。',
        },
      },
      {
        key: 'offline-activation',
        name: { en: 'Offline event marketing & activation', 'zh-Hant': '線下活動營銷及體驗', 'zh-Hans': '线下活动营销及体验' },
        description: {
          en: 'Event concepts, creative themes and run-downs; booth and zone design; key visuals; and end-to-end logistics from venue to on-site coordination.',
          'zh-Hant': '活動創意、主題及流程表、攤位及場區設計、主視覺，以及由場地搜尋至現場統籌的一站式執行。',
          'zh-Hans': '活动创意、主题及流程表、摊位及场区设计、主视觉，以及由场地搜寻至现场统筹的一站式执行。',
        },
      },
      {
        key: 'hybrid',
        name: { en: 'Hybrid & interactive event solutions', 'zh-Hant': '線上線下互動活動方案', 'zh-Hans': '线上线下互动活动方案' },
        description: {
          en: 'Live streaming, QR-driven engagement and digital lucky draws, event microsites with real-time data, and post-event highlight content.',
          'zh-Hant': '直播、QR 互動及數碼抽獎、附即時數據收集的活動專頁，以及活動後精選內容製作。',
          'zh-Hans': '直播、QR 互动及数码抽奖、附即时数据收集的活动专页，以及活动后精选内容制作。',
        },
      },
    ],
  },

  {
    key: 'convert',
    number: '03',
    name: { en: 'Convert and compound', 'zh-Hant': '轉化並累積', 'zh-Hans': '转化并积累' },
    statement: {
      en: 'Turn attention into measurable action, then keep the learning — performance media, funnel work and reporting that tells you what to do next.',
      'zh-Hant': '將注意力轉化為可衡量的行動，並累積經驗——效能媒體、漏斗優化，以及告訴你下一步該做什麼的報告。',
      'zh-Hans': '将注意力转化为可衡量的行动，并积累经验——效能媒体、漏斗优化，以及告诉你下一步该做什么的报告。',
    },
    items: [
      {
        key: 'performance-media',
        name: { en: 'Performance media & PPC', 'zh-Hant': '效能媒體及 PPC', 'zh-Hans': '效能媒体及 PPC' },
        description: {
          en: 'Search and display campaign setup and management, paid social strategy and optimisation, and conversion tracking with ROI reporting.',
          'zh-Hant': '搜尋及展示廣告的設定與管理、付費社群策略及優化，以及轉化追蹤與 ROI 報告。',
          'zh-Hans': '搜索及展示广告的设置与管理、付费社群策略及优化，以及转化追踪与 ROI 报告。',
        },
      },
      {
        key: 'seo',
        name: { en: 'SEO & content marketing', 'zh-Hant': 'SEO 及內容營銷', 'zh-Hans': 'SEO 及内容营销' },
        description: {
          en: 'SEO audit and on-site optimisation, ongoing SEO content from blog posts to pillar pages, and a content calendar distributed across web, social, email and PR.',
          'zh-Hant': 'SEO 審核及站內優化、由網誌文章至支柱頁的持續 SEO 內容，以及跨網站、社群、電郵及公關的內容編排。',
          'zh-Hans': 'SEO 审核及站内优化、由博客文章至支柱页的持续 SEO 内容，以及跨网站、社群、电邮及公关的内容编排。',
        },
      },
      {
        key: 'funnel',
        name: { en: 'E-commerce & funnel optimisation', 'zh-Hant': '電商及漏斗優化', 'zh-Hans': '电商及漏斗优化' },
        description: {
          en: 'E-commerce UX review, landing page planning and copy direction, and an A/B testing roadmap with funnel analysis and optimisation advice.',
          'zh-Hant': '電商用戶體驗審查、推廣頁面規劃及文案方向，以及 A/B 測試路線圖與漏斗分析及優化建議。',
          'zh-Hans': '电商用户体验审查、推广页面规划及文案方向，以及 A/B 测试路线图与漏斗分析及优化建议。',
        },
      },
      {
        key: 'email-crm',
        name: { en: 'Email & CRM marketing', 'zh-Hant': '電郵及 CRM 營銷', 'zh-Hans': '电邮及 CRM 营销' },
        description: {
          en: 'Email strategy and segmentation, template design and copywriting for newsletters and lifecycle journeys, and CRM integration with basic automation.',
          'zh-Hant': '電郵策略及分眾、名單與生命週期流程的版式設計及文案，以及 CRM 整合與基本自動化設定。',
          'zh-Hans': '电邮策略及分众、名单与生命周期流程的版式设计及文案，以及 CRM 整合与基本自动化设置。',
        },
      },
      {
        key: 'analytics',
        name: { en: 'Data, analytics & dashboarding', 'zh-Hant': '數據分析及儀表板', 'zh-Hans': '数据分析及仪表板' },
        description: {
          en: 'Analytics setup and clean-up, monthly or quarterly executive dashboards by channel and objective, and attribution reviews to guide budget shifts.',
          'zh-Hant': '數據設定及整理、按渠道及目標劃分的每月或每季管理層儀表板，以及以歸因分析引導預算調整。',
          'zh-Hans': '数据设置及整理、按渠道及目标划分的每月或每季管理层仪表板，以及以归因分析引导预算调整。',
        },
      },
      {
        key: 'reporting',
        name: { en: 'Reporting & analytics', 'zh-Hant': '報告及數據分析', 'zh-Hans': '报告及数据分析' },
        description: {
          en: 'Monthly performance reports on metrics, trends, engagement and sentiment; advertising performance with conversion tracking; and an annual strategy review.',
          'zh-Hant': '每月績效報告，涵蓋數據、趨勢、互動及輿情；廣告表現及轉化追蹤；以及年度策略回顧。',
          'zh-Hans': '每月绩效报告，涵盖数据、趋势、互动及舆情；广告表现及转化追踪；以及年度策略回顾。',
        },
      },
      {
        key: 'workflow',
        name: { en: 'Project & workflow management', 'zh-Hant': '項目及流程管理', 'zh-Hans': '项目及流程管理' },
        description: {
          en: 'Briefing, scheduling and communication flow agreed up front; materials pre-screened to minimise rejections; and blacklisted keyword policies maintained to avoid platform violations.',
          'zh-Hant': '事前確認簡報、會議安排及溝通流程；預先審核素材以減少退件；並維持禁用詞政策以避免平台違規。',
          'zh-Hans': '事前确认简报、会议安排及沟通流程；预先审核素材以减少退件；并维持禁用词政策以避免平台违规。',
        },
      },
    ],
  },
];

/**
 * Optional add-ons. Prices exist in the CRM `scope_items` lines but are
 * indicative until confirmed, so they are not published here.
 */
export const addOns = [
  {
    name: { en: 'Shopper marketing & in-store activation', 'zh-Hant': '購物者營銷及店內體驗', 'zh-Hans': '购物者营销及店内体验' },
    description: {
      en: 'POSM ideas, sampling mechanics and simple roadshow concepts; partnership and sponsorship strategy; and post-event lead nurturing.',
      'zh-Hant': '店內陳列概念、試食機制及簡單路演設計；合作與贊助策略；以及活動後的潛客培育計劃。',
      'zh-Hans': '店内陈列概念、试食机制及简单路演设计；合作与赞助策略；以及活动后的潜客培育计划。',
    },
  },
  {
    name: { en: 'Review management', 'zh-Hant': '評價管理', 'zh-Hans': '评价管理' },
    description: {
      en: 'Review management across OpenRice, Google and social platforms.',
      'zh-Hant': 'OpenRice、Google 及社群平台的評價管理。',
      'zh-Hans': 'OpenRice、Google 及社群平台的评价管理。',
    },
  },
  {
    name: { en: 'Short-form video production', 'zh-Hant': '短片製作', 'zh-Hans': '短视频制作' },
    description: {
      en: 'One to three reels produced as an add-on to a campaign.',
      'zh-Hant': '作為推廣項目加購，一至三條短片製作。',
      'zh-Hans': '作为推广项目加购，一至三条短视频制作。',
    },
  },
  {
    name: { en: 'Integrated media plan', 'zh-Hant': '整合媒體計劃', 'zh-Hans': '整合媒体计划' },
    description: {
      en: 'An integrated media plan with channel recommendations, and a post-campaign tracking and analytics report.',
      'zh-Hant': '附渠道建議的整合媒體計劃，並附活動後追蹤及分析報告。',
      'zh-Hans': '附渠道推荐的整合媒体计划，并附活动后追踪及分析报告。',
    },
  },
];
