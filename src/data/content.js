/**
 * Page copy, in three languages.
 *
 * Every factual claim in this file traces to `Migather/COMPANY PROFILE.md`,
 * `Migather/LIBRARY 2026 Q4/`, or the CRM `scope_items` table.
 *
 * Chinese copy is authored separately for Hong Kong (zh-Hant) and Mainland
 * (zh-Hans) — not machine-converted. Both must be screened against the
 * 中国广告法 banned-word list before launch:
 *   国家级 · 世界级 · 最高级 · 顶级 · 第一 · 唯一 · 一流 · 首选 (→ 优选) ·
 *   首家 · 首要 · 高级
 * Migather's own additional bans: leading · global agency · award-winning ·
 * top · No.1 · full-service · end-to-end solutions · industry leader.
 */

export const content = {
  /* ───────────────────────────────────────────────────────────────────────
     Shared chrome
     ─────────────────────────────────────────────────────────────────────── */
  common: {
    skipToContent: {
      en: 'Skip to content',
      'zh-Hant': '跳至主要內容',
      'zh-Hans': '跳至主要内容',
    },
    menu: { en: 'Menu', 'zh-Hant': '選單', 'zh-Hans': '菜单' },
    home: { en: 'Home', 'zh-Hant': '首頁', 'zh-Hans': '首页' },
    close: { en: 'Close', 'zh-Hant': '關閉', 'zh-Hans': '关闭' },
    language: { en: 'Language', 'zh-Hant': '語言', 'zh-Hans': '语言' },
    languageLabel: {
      en: 'Choose your language',
      'zh-Hant': '選擇語言',
      'zh-Hans': '选择语言',
    },
    footerTagline: {
      en: 'Performance digital creative and media agency. Hong Kong · Mainland China · Southeast Asia.',
      'zh-Hant': '效能型數位創意及媒體代理公司。香港 · 中國內地 · 東南亞。',
      'zh-Hans': '效能型数字创意及媒体代理机构。香港 · 中国内地 · 东南亚。',
    },
    readMore: { en: 'Read more', 'zh-Hant': '了解更多', 'zh-Hans': '了解更多' },
    viewAll: { en: 'View all work', 'zh-Hant': '查看全部案例', 'zh-Hans': '查看全部案例' },
    backToWork: { en: 'Back to all work', 'zh-Hant': '返回案例列表', 'zh-Hans': '返回案例列表' },
    partnerSince: { en: 'Client since', 'zh-Hant': '合作自', 'zh-Hans': '合作自' },
    scope: { en: 'Scope of work', 'zh-Hant': '工作範疇', 'zh-Hans': '工作范围' },
    results: { en: 'Results', 'zh-Hant': '成果', 'zh-Hans': '成果' },
    sourceNote: {
      en: 'Figures and wording are taken from the client credential deck cited on each case.',
      'zh-Hant': '所有數字及表述均取自各案例所引用的客戶簡報。',
      'zh-Hans': '所有数字及表述均取自各案例所引用的客户简报。',
    },
    preLaunchBadge: { en: 'Pre-launch build', 'zh-Hant': '上線前版本', 'zh-Hans': '上线前版本' },
  },

  /* ───────────────────────────────────────────────────────────────────────
     Home
     ─────────────────────────────────────────────────────────────────────── */
  home: {
    hero: {
      /**
       * The eyebrow names what the agency is; the three markets moved into
       * the lede, which now leads with the offer rather than the boilerplate.
       */
      eyebrow: {
        en: 'Performance digital creative & media agency',
        'zh-Hant': '效能型數位創意及媒體代理公司',
        'zh-Hans': '效能型数字创意及媒体代理机构',
      },
      title: {
        en: 'Big-agency standards, from people who answer the phone.',
        'zh-Hant': '大機構的標準，由會接電話的人交付。',
        'zh-Hans': '大机构的标准，由会接电话的人交付。',
      },
      lede: {
        en: 'We build the brand, grow the audience and convert the demand — across Hong Kong, Mainland China and Southeast Asia. Every account is run by the senior people doing the work, from day one.',
        'zh-Hant': '我們建立品牌、擴展受眾、轉化需求——於香港、中國內地及東南亞。每個項目都由親自落手操作的資深團隊，自第一天起即在你的項目上。',
        'zh-Hans': '我们建立品牌、扩展受众、转化需求——于香港、中国内地及东南亚。每个项目都由亲自落手操作的资深团队，自第一天起就在你的项目上。',
      },
      primaryCta: { en: 'See the work', 'zh-Hant': '查看案例', 'zh-Hans': '查看案例' },
      secondaryCta: { en: 'Start a conversation', 'zh-Hant': '開始對話', 'zh-Hans': '开始对话' },
      scrollHint: { en: 'Scroll', 'zh-Hant': '向下捲動', 'zh-Hans': '向下滚动' },
    },

    proof: {
      eyebrow: { en: 'Who we work with', 'zh-Hant': '合作客戶', 'zh-Hans': '合作客户' },
      title: {
        en: 'Banks, brokers, developers, auction houses, malls and retailers.',
        'zh-Hant': '銀行、券商、發展商、拍賣行、購物城及零售商。',
        'zh-Hans': '银行、券商、开发商、拍卖行、购物城及零售商。',
      },
      lede: {
        en: 'Mostly Hong Kong and Mainland China, with regional campaigns across Southeast Asia. The longest-running partnership on file dates from 2016.',
        'zh-Hant': '主要為香港及中國內地項目，並於東南亞執行區域性推廣。檔案中最長的合作關係始於 2016 年。',
        'zh-Hans': '主要为香港及中国内地项目，并于东南亚执行区域性推广。档案中最长的合作关系始于 2016 年。',
      },
      statClients: { en: 'named clients', 'zh-Hant': '個已確認客戶', 'zh-Hans': '个已确认客户' },
      statMarkets: { en: 'markets covered', 'zh-Hant': '個覆蓋市場', 'zh-Hans': '个覆盖市场' },
      statOffices: { en: 'delivery offices', 'zh-Hant': '個執行辦事處', 'zh-Hans': '个执行办事处' },
      statTestimonials: { en: 'attributed testimonials', 'zh-Hant': '段具名客戶評語', 'zh-Hans': '段具名客户评语' },
    },

    principles: {
      eyebrow: { en: 'How we work', 'zh-Hant': '工作方式', 'zh-Hans': '工作方式' },
      title: {
        en: 'Four things we do not compromise on.',
        'zh-Hant': '四件我們不會妥協的事。',
        'zh-Hans': '四件我们不会妥协的事。',
      },
      /**
       * The homepage carries the first three principles only, so its
       * statement counts three, not four. The About page shows the full
       * set and keeps `title` above.
       */
      homeTitle: {
        en: 'Three things we do not compromise on.',
        'zh-Hant': '三件我們不會妥協的事。',
        'zh-Hans': '三件我们不会妥协的事。',
      },
      lede: {
        en: 'A boutique only works if the way it works is visible. These are ours.',
        'zh-Hant': '精品代理要有存在價值，工作方式必須清晰可見。以下是我們的原則。',
        'zh-Hans': '精品代理要有存在价值，工作方式必须清晰可见。以下是我们的原则。',
      },
      items: [
        {
          number: '01',
          title: { en: 'Senior hands on the work', 'zh-Hant': '資深親手落手', 'zh-Hans': '资深亲手落手' },
          body: {
            en: 'The people you meet are the people who do it. No hand-off, no layers, no relaying through an account manager who was not in the room.',
            'zh-Hant': '與你見面的人，就是動手做的人。沒有交接、沒有層級，也不會經過一位不在會議上的客戶主任轉述。',
            'zh-Hans': '与你见面的人，就是动手做的人。没有交接、没有层级，也不会经过一位不在会议上的客户主任转述。',
          },
        },
        {
          number: '02',
          title: { en: 'Evidence before opinion', 'zh-Hant': '以證據先於意見', 'zh-Hans': '以证据先于意见' },
          body: {
            en: 'Every figure we publish carries its date and the record count behind it. When we do not know, we say so instead of estimating.',
            'zh-Hant': '我們發布的每個數字，都附有日期及其背後的紀錄數量。當我們不知道，我們會說不知道，而不是估算。',
            'zh-Hans': '我们发布的每个数字，都附有日期及其背后的记录数量。当我们不知道，我们会说不知道，而不是估算。',
          },
        },
        {
          number: '03',
          title: { en: 'Two markets, two voices', 'zh-Hant': '兩個市場，兩種語氣', 'zh-Hans': '两个市场，两种语气' },
          body: {
            en: 'Hong Kong and Mainland China are not one audience. We work in both, in the language and the idiom of each — not one campaign translated twice.',
            'zh-Hant': '香港與中國內地並非同一個受眾。我們在兩地都做，用各自的語言與習慣——而不是同一個項目翻譯兩次。',
            'zh-Hans': '香港与中国内地并非同一个受众。我们在两地都做，用各自的语言与习惯——而不是同一个项目翻译两次。',
          },
        },
        {
          number: '04',
          title: { en: 'Plain terms, agreed up front', 'zh-Hant': '條款清楚，事前議定', 'zh-Hans': '条款清楚，事前议定' },
          body: {
            en: 'Scope, fee and the measure of success are settled before we start, not negotiated afterwards. If we cannot deliver against them, we would rather say so now.',
            'zh-Hant': '工作範疇、費用及成效標準在開始前議定，而不是事後商議。若無法達成，我們寧願現在就說。',
            'zh-Hans': '工作范围、费用及成效标准在开始前议定，而不是事后商议。若无法达成，我们宁愿现在就说。',
          },
        },
      ],
    },

    capabilities: {
      eyebrow: { en: 'What we do', 'zh-Hant': '我們做什麼', 'zh-Hans': '我们做什么' },
      title: {
        en: 'Three goals, and only three.',
        'zh-Hant': '三個目標，只有三個。',
        'zh-Hans': '三个目标，只有三个。',
      },
      lede: {
        en: 'We do not publish a long menu of deliverables. Everything below serves one of three business outcomes — and we can tell you which.',
        'zh-Hant': '我們不公布一份長長的服務清單。以下每一項，都服務於三個業務目標之一——我們也可以告訴你屬於哪一個。',
        'zh-Hans': '我们不公布一份长长的服务清单。以下每一项，都服务于三个业务目标之一——我们也可以告诉你属于哪一个。',
      },
      cta: { en: 'All capabilities', 'zh-Hant': '查看完整服務範疇', 'zh-Hans': '查看完整服务范围' },
    },

    work: {
      eyebrow: { en: 'Selected work', 'zh-Hant': '精選案例', 'zh-Hans': '精选案例' },
      title: {
        en: 'Results we can put a number on.',
        'zh-Hant': '有數字可指的成果。',
        'zh-Hans': '有数字可指的成果。',
      },
      lede: {
        en: 'Every figure below is taken from the client credential deck it came from — not from a case study written afterwards.',
        'zh-Hant': '以下每個數字，都取自其來源的客戶簡報——而非事後撰寫的案例故事。',
        'zh-Hans': '以下每个数字，都取自其来源的客户简报——而非事后撰写的案例故事。',
      },
    },

    markets: {
      eyebrow: { en: 'Where we work', 'zh-Hant': '工作範圍', 'zh-Hans': '工作范围' },
      title: {
        en: 'Three markets, run as one team.',
        'zh-Hant': '三個市場，一個團隊。',
        'zh-Hans': '三个市场，一个团队。',
      },
      lede: {
        en: 'Hong Kong is home. Mainland China is our own team on the ground. Southeast Asia is where we run regional campaigns — not a partner network we pass work to.',
        'zh-Hant': '香港是我們的家。中國內地有我們自己的團隊在當地。東南亞則是我們執行區域項目的地方——不是轉手的外判網絡。',
        'zh-Hans': '香港是我们的家。中国内地有我们自己的团队在当地。东南亚则是我们执行区域项目的地方——不是转手的外包网络。',
      },
    },

    cta: {
      eyebrow: { en: 'Next step', 'zh-Hant': '下一步', 'zh-Hans': '下一步' },
      title: {
        en: 'Tell us what needs to move.',
        'zh-Hant': '告訴我們，需要推動的是什麼。',
        'zh-Hans': '告诉我们，需要推动的是什么。',
      },
      lede: {
        en: 'A launch, a plateau, a market you have not entered yet. Bring us the objective and we will tell you honestly whether we are the right people for it — including when we are not.',
        'zh-Hant': '一場發佈、一個停滯期、一個你還未進入的市場。帶著目標來找我們，我們會坦白告訴你我們是否合適——包括不合適的時候。',
        'zh-Hans': '一场发布、一个停滞期、一个你还未进入的市场。带着目标来找我们，我们会坦白告诉你我们是否合适——包括不合适的时候。',
      },
      button: { en: 'Start a conversation', 'zh-Hant': '開始對話', 'zh-Hans': '开始对话' },
    },
  },

  /* ───────────────────────────────────────────────────────────────────────
     About
     ─────────────────────────────────────────────────────────────────────── */
  about: {
    eyebrow: { en: 'About Migather', 'zh-Hant': '關於 Migather', 'zh-Hans': '关于 Migather' },
    title: {
      en: 'A boutique, on purpose.',
      'zh-Hant': '精品，是刻意的選擇。',
      'zh-Hans': '精品，是刻意的选择。',
    },
    lede: {
      en: 'Migather Limited is a performance digital creative and media agency in Hong Kong, with delivery teams in Shanghai and Shenzhen and project work across Southeast Asia.',
      'zh-Hant': 'Migather Limited 是一間設於香港的效能型數位創意及媒體代理公司，在上海及深圳設有執行團隊，並於東南亞承接項目。',
      'zh-Hans': 'Migather Limited 是一家设于香港的效能型数字创意及媒体代理机构，在上海及深圳设有执行团队，并于东南亚承接项目。',
    },
    story: [
      {
        en: 'We are deliberately small. Not a network, not a shop that has to pass work upward — a boutique team where the people in the pitch are the people on the account.',
        'zh-Hant': '我們刻意保持精細。不是網絡，也不是需要向上層轉交工作的公司——而是一間精品團隊，與你提案的人，就是在你項目上做事的人。',
        'zh-Hans': '我们刻意保持精简。不是网络，也不是需要向上层转交工作的公司——而是一家精品团队，与你提案的人，就是在你项目上做事的人。',
      },
      {
        en: 'That structure is the business model, not a compromise. It buys senior attention, speed and no hand-off. It also means we only take on work we can do properly — which is why our capability list is organised around three business goals instead of a long menu of deliverables.',
        'zh-Hant': '這個結構是商業模式，而不是妥協。它換來的是資深關注、速度，以及沒有交接。同時亦代表我們只承接做得好的工作——這正是我們的服務清單圍繞三個業務目標組織，而不是一份長長的交付項目表的原因。',
        'zh-Hans': '这个结构是商业模式，而不是妥协。它换来的是资深关注、速度，以及没有交接。同时也代表我们只接能做好的工作——这正是我们的服务清单围绕三个业务目标组织，而不是一份长长的交付项目表的原因。',
      },
      {
        en: 'We work for banks, brokers, developers, auction houses, malls, museums and retailers — mostly in Hong Kong and Mainland China, with regional campaigns across Southeast Asia. Several of these partnerships have run for years.',
        'zh-Hant': '我們服務銀行、券商、發展商、拍賣行、購物城、博物館及零售商——主要在香港及中國內地，並於東南亞執行區域項目。其中數個合作關係已維持多年。',
        'zh-Hans': '我们服务银行、券商、开发商、拍卖行、购物城、博物馆及零售商——主要在香港及中国内地，并于东南亚执行区域项目。其中数个合作关系已维持多年。',
      },
      {
        en: 'We are also particular about the other side of the deal. We would rather decline a brief than run it badly — and we will tell you which one we think it is, before you have to ask.',
        'zh-Hant': '我們對合作另一方同樣有要求。與其勉強承接一個做不到好的項目，我們寧願拒絕——而且會在你需要開口之前，先告訴你我們的判斷。',
        'zh-Hans': '我们对合作另一方同样有要求。与其勉强承接一个做不好的项目，我们宁愿拒绝——而且会在你需要开口之前，先告诉你我们的判断。',
      },
    ],
    principlesTitle: {
      en: 'How we work',
      'zh-Hant': '工作方式',
      'zh-Hans': '工作方式',
    },
    officesTitle: {
      en: 'Where we are',
      'zh-Hant': '我們在哪裡',
      'zh-Hans': '我们在哪里',
    },
    officesLede: {
      en: 'Street addresses are shared on request rather than published. If you need a specific office, ask and we will arrange it.',
      'zh-Hant': '我們按需要提供辦事處地址，而非公開刊登。如需特定辦事處，請提出，我們會安排。',
      'zh-Hans': '我们按需要提供办事处地址，而非公开刊登。如需特定办事处，请提出，我们会安排。',
    },
    clientsTitle: {
      en: 'Clients',
      'zh-Hant': '客戶',
      'zh-Hans': '客户',
    },
    clientsLede: {
      en: 'Confirmed client wins, traceable to our credential decks.',
      'zh-Hant': '已確認的客戶合作項目，均可追溯至我們的客戶簡報。',
      'zh-Hans': '已确认的客户合作项目，均可追溯至我们的客户简报。',
    },
    platformsTitle: {
      en: 'Platforms & certifications',
      'zh-Hant': '平台及認證',
      'zh-Hans': '平台及认证',
    },
    platformsLede: {
      en: 'The media platforms we plan and buy on, and the certifications held by the team.',
      'zh-Hant': '我們規劃及投放的媒體平台，以及團隊持有的認證。',
      'zh-Hans': '我们规划及投放的媒体平台，以及团队持有的认证。',
    },
    testimonialsTitle: {
      en: 'What they say about the work.',
      'zh-Hant': '他們如何談這份工作。',
      'zh-Hans': '他们如何谈这份工作。',
    },
  },

  /* ───────────────────────────────────────────────────────────────────────
     Capabilities
     ─────────────────────────────────────────────────────────────────────── */
  capabilities: {
    eyebrow: { en: 'Capabilities', 'zh-Hant': '服務範疇', 'zh-Hans': '服务范围' },
    title: {
      en: 'Three goals. Everything we do serves one of them.',
      'zh-Hant': '三個目標。我們做的每一件事，都服務於其中之一。',
      'zh-Hans': '三个目标。我们做的每一件事，都服务于其中之一。',
    },
    lede: {
      en: 'We do not publish a long menu of deliverables. Here is what we do, organised by the business outcome it is meant to produce — and what each capability actually involves when we deliver it.',
      'zh-Hant': '我們不公布一份長長的交付項目表。以下是我們的服務，按其擬達成的業務成果組織——並說明每一項在實際交付時具體包含甚麼。',
      'zh-Hans': '我们不公布一份长长的交付项目表。以下是我们的服务，按其拟达成的业务成果组织——并说明每一项在实际交付时具体包含什么。',
    },
    addOnsTitle: {
      en: 'Add-ons',
      'zh-Hant': '加購項目',
      'zh-Hans': '加购项目',
    },
    addOnsLede: {
      en: 'Optional extras, quoted per brief. Pricing is agreed in the proposal rather than published.',
      'zh-Hant': '可選的額外項目，按需求報價。價格於提案中議定，不在網站公布。',
      'zh-Hans': '可选的额外项目，按需求报价。价格于提案中议定，不在网站公布。',
    },
    ctaTitle: {
      en: 'Not sure which applies?',
      'zh-Hant': '不確定哪一項適用？',
      'zh-Hans': '不确定哪一项适用？',
    },
    ctaBody: {
      en: 'Describe the objective rather than the deliverable, and we will tell you what it needs.',
      'zh-Hant': '請描述目標而非交付項目，我們會告訴你需要甚麼。',
      'zh-Hans': '请描述目标而非交付项目，我们会告诉你需要什么。',
    },
    ctaButton: { en: 'Start a conversation', 'zh-Hant': '開始對話', 'zh-Hans': '开始对话' },
  },

  /* ───────────────────────────────────────────────────────────────────────
     Work
     ─────────────────────────────────────────────────────────────────────── */
  work: {
    eyebrow: { en: 'Client work', 'zh-Hant': '客戶案例', 'zh-Hans': '客户案例' },
    title: {
      en: 'The work, and what it produced.',
      'zh-Hant': '做過甚麼，以及產生了甚麼。',
      'zh-Hans': '做过什么，以及产生了什么。',
    },
    lede: {
      en: 'Every case below is drawn from our client credential decks. Where a metric is not on file it is shown as unknown rather than estimated.',
      'zh-Hant': '以下每個案例均取自我們的客戶簡報。若某項數據沒有紀錄，我們會標示為未知，而不是估算。',
      'zh-Hans': '以下每个案例均取自我们的客户简报。若某项数据没有记录，我们会标示为未知，而不是估算。',
    },
    allSectors: { en: 'All sectors', 'zh-Hant': '所有範疇', 'zh-Hans': '所有范围' },
    empty: {
      en: 'No cases in this sector yet.',
      'zh-Hant': '此範疇暫時沒有案例。',
      'zh-Hans': '此范围暂时没有案例。',
    },
    countLabel: { en: 'cases', 'zh-Hant': '個案例', 'zh-Hans': '个案例' },
  },

  /* ───────────────────────────────────────────────────────────────────────
     Contact
     ─────────────────────────────────────────────────────────────────────── */
  contact: {
    eyebrow: { en: 'Contact', 'zh-Hant': '聯絡我們', 'zh-Hans': '联系我们' },
    title: {
      en: 'Start a conversation.',
      'zh-Hant': '開始對話。',
      'zh-Hans': '开始对话。',
    },
    lede: {
      en: 'Tell us the objective, the market and the deadline. We reply with a straight answer on whether we are the right people for it — including when we are not.',
      'zh-Hant': '告訴我們目標、市場及期限。我們會直接回覆我們是否合適——包括不合適的時候。',
      'zh-Hans': '告诉我们目标、市场及期限。我们会直接回复我们是否合适——包括不合适的时候。',
    },
    preLaunch: {
      en: 'This site is a pre-launch build. Form delivery and office contact details are still being configured, so the form below is not yet live.',
      'zh-Hant': '本網站仍屬上線前版本。表單傳送及辦事處聯絡資料仍在設定中，因此下方表格尚未啟用。',
      'zh-Hans': '本网站仍属上线前版本。表单传送及办事处联络资料仍在设置中，因此下方表格尚未启用。',
    },
    form: {
      name: { en: 'Your name', 'zh-Hant': '姓名', 'zh-Hans': '姓名' },
      company: { en: 'Company', 'zh-Hant': '公司', 'zh-Hans': '公司' },
      email: { en: 'Email', 'zh-Hant': '電郵', 'zh-Hans': '电邮' },
      phone: { en: 'Phone (optional)', 'zh-Hant': '電話（選填）', 'zh-Hans': '电话（选填）' },
      market: { en: 'Market', 'zh-Hant': '市場', 'zh-Hans': '市场' },
      message: { en: 'What are you trying to move?', 'zh-Hant': '你想推動甚麼？', 'zh-Hans': '你想推动什么？' },
      submit: { en: 'Send enquiry', 'zh-Hant': '送出查詢', 'zh-Hans': '送出查询' },
      required: { en: 'required', 'zh-Hant': '必填', 'zh-Hans': '必填' },
      notConfigured: {
        en: 'Form delivery is not connected yet. Please check back shortly.',
        'zh-Hant': '表單傳送尚未接通，請稍後再試。',
        'zh-Hans': '表单传送尚未接通，请稍后再试。',
      },
      privacyNote: {
        en: 'We use what you send us to reply to you, and nothing else. See our privacy policy.',
        'zh-Hant': '我們只會使用你提供的資料作回覆用途，不作其他用途。詳見私隱政策。',
        'zh-Hans': '我们只会使用你提供的资料作回复用途，不作其他用途。详见隐私政策。',
      },
    },
    officesTitle: {
      en: 'Where we are',
      'zh-Hant': '我們在哪裡',
      'zh-Hans': '我们在哪里',
    },
    officesLede: {
      en: 'Hong Kong is our headquarters. Shanghai and Shenzhen carry Mainland delivery. Street addresses are shared on request.',
      'zh-Hant': '香港是我們的總部。上海及深圳負責內地執行。辦事處地址按需要提供。',
      'zh-Hans': '香港是我们的总部。上海及深圳负责内地执行。办事处地址按需要提供。',
    },
  },

  /* ───────────────────────────────────────────────────────────────────────
     Careers
     ─────────────────────────────────────────────────────────────────────── */
  careers: {
    eyebrow: { en: 'Careers', 'zh-Hant': '加入我們', 'zh-Hans': '加入我们' },
    title: {
      en: 'Senior people, small team, room to do good work.',
      'zh-Hant': '資深的人，小的團隊，有空間做好工作。',
      'zh-Hans': '资深的人，小的团队，有空间做好工作。',
    },
    lede: {
      en: 'We hire for judgement and craft rather than for the length of a CV. If you have run Hong Kong or Mainland China accounts and care about the detail, we would like to hear from you.',
      'zh-Hant': '我們看重判斷力與工藝，而非履歷的長度。若你曾主導香港或中國內地項目，並在意細節，我們希望聽到你的故事。',
      'zh-Hans': '我们看重判断力与工艺，而非履历的长度。若你曾主导香港或中国内地项目，并在意细节，我们希望听到你的故事。',
    },
    vacTitle: {
      en: 'Open roles',
      'zh-Hant': '現有職位',
      'zh-Hans': '现有职位',
    },
    vacLede: {
      en: 'We do not keep a standing list of vacancies — we hire when the right person appears, and we would rather wait than fill a seat badly. Send us your work and the kind of account you want to run.',
      'zh-Hant': '我們不設常設職位空缺——遇到合適的人便會聘用，寧可等待，也不會勉強填補一個位置。請把你的作品，以及你想主導的項目類型寄給我們。',
      'zh-Hans': '我们不设常设职位空缺——遇到合适的人便会聘用，宁可等待，也不会勉强填补一个位置。请把你的作品，以及你想主导的项目类型寄给我们。',
    },
    vacEmpty: {
      en: 'No fixed vacancy right now. Send us your work and we will keep it on file.',
      'zh-Hant': '目前沒有固定職位空缺。請把你的作品寄給我們，我們會存檔。',
      'zh-Hans': '目前没有固定职位空缺。请把你的作品寄给我们，我们会存档。',
    },
    cta: { en: 'Send us your work', 'zh-Hant': '把你的作品寄給我們', 'zh-Hans': '把你的作品寄给我们' },
    whatTitle: {
      en: 'What we look for',
      'zh-Hant': '我們看重甚麼',
      'zh-Hans': '我们看重什么',
    },
    whatItems: [
      {
        en: 'You have run accounts, not just campaigns — and you can say what the business result was.',
        'zh-Hant': '你主導過客戶項目，而不只是單次活動——並且說得出業務成果。',
        'zh-Hans': '你主导过客户项目，而不只是单次活动——并且说得出业务成果。',
      },
      {
        en: 'You work in Hong Kong and Mainland China, in both languages, and you know they are not the same audience.',
        'zh-Hant': '你能以中英兩種語言在香港及中國內地工作，並且明白兩地不是同一個受眾。',
        'zh-Hans': '你能以中英两种语言在香港及中国内地工作，并且明白两地不是同一个受众。',
      },
      {
        en: 'You would rather say “that will not work” than ship it.',
        'zh-Hant': '你寧願說「這樣不行」，也不會照樣交差。',
        'zh-Hans': '你宁愿说「这样不行」，也不会照样交差。',
      },
      {
        en: 'You are comfortable being the most senior person in the room, and the person who actually does the work.',
        'zh-Hant': '你既能自在地做會議中最資深的人，也能做真正動手的那個人。',
        'zh-Hans': '你既能自在地做会议中最资深的人，也能做真正动手的那个人。',
      },
    ],
  },

  /* ───────────────────────────────────────────────────────────────────────
     Legal
     ─────────────────────────────────────────────────────────────────────── */
  legal: {
    draftBanner: {
      en: 'Draft for review — these pages must be checked by someone qualified before the site goes live.',
      'zh-Hant': '草擬待審——上線前須由具資格人士覆核。',
      'zh-Hans': '草拟待审——上线前须由具资格人士覆核。',
    },
    privacy: {
      title: { en: 'Privacy Policy', 'zh-Hant': '私隱政策', 'zh-Hans': '隐私政策' },
      updated: { en: 'Last updated', 'zh-Hant': '最後更新', 'zh-Hans': '最后更新' },
      sections: [
        {
          heading: { en: 'What we collect', 'zh-Hant': '我們收集甚麼', 'zh-Hans': '我们收集什么' },
          body: {
            en: 'When you send us an enquiry through the form on this site, we receive the name, company, email address, any phone number you choose to give us, the market you select and the message you write. If you browse the site, our hosting provider may record standard technical logs such as IP address and browser type, for the purpose of keeping the site running and secure.',
            'zh-Hant': '當你透過本網站的表格提交查詢時，我們會收到姓名、公司、電郵地址、你選擇提供的電話號碼、所選市場及你所寫的訊息。若你瀏覽網站，託管服務商可能會記錄標準技術日誌，例如 IP 位址及瀏覽器類型，用以維持網站運作及安全。',
            'zh-Hans': '当你通过本网站的表格提交查询时，我们会收到姓名、公司、电邮地址、你选择提供的电话号码、所选市场及你所写的信息。若你浏览网站，托管服务商可能会记录标准技术日志，例如 IP 地址及浏览器类型，用以维持网站运作及安全。',
          },
        },
        {
          heading: { en: 'Why we collect it', 'zh-Hant': '收集目的', 'zh-Hans': '收集目的' },
          body: {
            en: 'To reply to your enquiry and to discuss a possible engagement. We do not sell your details, and we do not pass them to third parties for marketing.',
            'zh-Hant': '用以回覆你的查詢，並商討可能的合作。我們不出售你的資料，亦不會將其交予第三方作市場推廣。',
            'zh-Hans': '用以回复你的查询，并商讨可能的合作。我们不出售你的资料，亦不会将其交予第三方作市场推广。',
          },
        },
        {
          heading: { en: 'How long we keep it', 'zh-Hant': '保留期限', 'zh-Hans': '保留期限' },
          body: {
            en: 'Enquiry records are kept for as long as needed to respond and to maintain a record of our business correspondence, then removed. Records arising from a client engagement are retained for the period required by our professional and legal obligations.',
            'zh-Hant': '查詢記錄會保留至回覆所需時間及維持業務往來記錄所需為止，其後刪除。由客戶合作產生的記錄，則按專業及法律責任所需的期間保存。',
            'zh-Hans': '查询记录会保留至回复所需时间及维持业务往来记录所需为止，其后删除。由客户合作产生的记录，则按专业及法律责任所需的期间保存。',
          },
        },
        {
          heading: { en: 'Your rights', 'zh-Hant': '你的權利', 'zh-Hans': '你的权利' },
          body: {
            en: 'Under the Personal Data (Privacy) Ordinance (Cap. 486) of Hong Kong, you may ask us what personal data we hold about you, request a copy, ask us to correct it, and object to our use of it. Contact us through the details published on the Contact page and we will respond within the period the Ordinance requires.',
            'zh-Hant': '根據香港《個人資料（私隱）條例》（第 486 章），你可要求我們查閱所持有的你的個人資料、索取副本、要求更正，並反對我們的使用。請透過聯絡我們頁面所載的資料與我們聯絡，我們會於條例規定的期限內回覆。',
            'zh-Hans': '根据香港《个人资料（隐私）条例》（第 486 章），你可要求我们查阅所持有的你的个人资料、索取副本、要求更正，并反对我们的使用。请透过联络我们页面所载的资料与我们联络，我们会在条例规定的期限内回复。',
          },
        },
      ],
    },
    terms: {
      title: { en: 'Terms of Use', 'zh-Hant': '使用條款', 'zh-Hans': '使用条款' },
      updated: { en: 'Last updated', 'zh-Hant': '最後更新', 'zh-Hans': '最后更新' },
      sections: [
        {
          heading: { en: 'About this site', 'zh-Hant': '關於本網站', 'zh-Hans': '关于本网站' },
          body: {
            en: 'This site presents information about Migather Limited and selected client work. It is provided for information only.',
            'zh-Hant': '本網站提供 Migather Limited 的簡介及精選客戶案例資料，僅供參考。',
            'zh-Hans': '本网站提供 Migather Limited 的简介及精选客户案例资料，仅供参考。',
          },
        },
        {
          heading: { en: 'Client work and figures', 'zh-Hant': '客戶案例及數字', 'zh-Hans': '客户案例及数字' },
          body: {
            en: 'Case studies and results shown here are drawn from our client credential decks and reflect the campaigns as recorded at the time. They describe particular engagements rather than a typical outcome, and they should not be read as a guaranteed result.',
            'zh-Hant': '本頁所列案例及成果取自我們的客戶簡報，反映當時記錄的項目情況，描述的是特定合作而非一般預期成效，不應視為保證結果。',
            'zh-Hans': '本页所列案例及成果取自我的客户简报，反映当时记录的项目情况，描述的是特定合作而非一般预期成效，不应视为保证结果。',
          },
        },
        {
          heading: { en: 'Intellectual property', 'zh-Hant': '知識產權', 'zh-Hans': '知识产权' },
          body: {
            en: 'The content, design and client names on this site belong to Migather Limited or to the respective owners. Nothing on this site grants a licence to reproduce them.',
            'zh-Hant': '本網站的內容、設計及客戶名稱，版權屬 Migather Limited 或各有關擁有者所有。本網站內容並不授予任何複製授權。',
            'zh-Hans': '本网站的内容、设计及客户名称，版权属 Migather Limited 或各有关拥有者所有。本网站内容并不授予任何复制授权。',
          },
        },
        {
          heading: { en: 'Governing law', 'zh-Hant': '適用法律', 'zh-Hans': '适用法律' },
          body: {
            en: 'These terms are governed by the laws of the Hong Kong Special Administrative Region.',
            'zh-Hant': '本條款受香港特別行政區法律管轄。',
            'zh-Hans': '本条款受香港特别行政区法律管辖。',
          },
        },
      ],
    },
    disclosure: {
      title: { en: 'KOL & Creator Disclosure', 'zh-Hant': 'KOL 及創作者合作披露', 'zh-Hans': 'KOL 及创作者合作披露' },
      updated: { en: 'Last updated', 'zh-Hant': '最後更新', 'zh-Hans': '最后更新' },
      intro: {
        en: 'On Mainland China platforms, a creator collaboration is either declared to the platform or it is not. The distinction is not a marketing preference — it changes the legal and platform risk of the post. We state which one applies, in writing, on every campaign.',
        'zh-Hant': '在中國內地平台，創作者合作必須向平台報備，或不作報備。這個區別並非宣傳偏好——它直接改變該貼文的法律及平台風險。我們在每個項目上都以書面說明適用的是哪一種。',
        'zh-Hans': '在中国内地平台，创作者合作必须向平台报备，或不作报备。这个区别并非宣传偏好——它直接改变该帖文的法律及平台风险。我们在每个项目上都以书面说明适用的是哪一种。',
      },
      sections: [
        {
          heading: { en: 'Declared (报备)', 'zh-Hant': '報備合作', 'zh-Hans': '报备合作' },
          body: {
            en: 'The official route for a brand collaboration. It requires brand qualification documents and carries a platform fee of 10% of the creator’s quoted fee. In exchange, the collaboration complies with advertising law and the platform’s own rules, so there is no risk of the post being throttled or removed.',
            'zh-Hant': '品牌合作的主要方式。需提供品牌資質文件，並繳付平台手續費——為達人報價的 10%。作為交換，該合作符合廣告法及平台規則，因此不會有被平台限流或刪稿的風險。',
            'zh-Hans': '品牌合作的主要方式。需提供品牌资质文件，并缴付平台手续费——为达人报价的 10%。作为交换，该合作符合广告法及平台规则，因此不会有被平台限流或删稿的风险。',
          },
        },
        {
          heading: { en: 'Undeclared (非报备)', 'zh-Hant': '非報備合作', 'zh-Hans': '非报备合作' },
          body: {
            en: 'A collaboration placed without being declared to the platform. It carries a risk of the post being throttled by the platform, and a risk of sanction against the client’s own account. Where a brief requires it, we disclose the arrangement in the campaign report rather than leaving it implicit.',
            'zh-Hant': '未向平台報備的置入合作。該做法存在被平台限流的風險，亦有令客戶帳戶受處分的風險。如項目要求採用此方式，我們會於項目報告中明確披露，而非含糊帶過。',
            'zh-Hans': '未向平台报备的植入合作。该做法存在被平台限流的风险，亦有令客户账户受处分的风险。如项目要求采用此方式，我们会在项目报告中明确披露，而非含糊带过。',
          },
        },
        {
          heading: { en: 'Advertising law', 'zh-Hant': '廣告法', 'zh-Hans': '广告法' },
          body: {
            en: 'Copy for Mainland China audiences is screened against the 中国广告法 restricted terms — 国家级、世界级、最高级、顶级、第一、唯一、一流、首选、首家、首要、高級 — before it is published or placed. Where a term has no accurate alternative, the claim is removed rather than softened.',
            'zh-Hant': '面向中國內地受眾的文案，在發佈或投放前，會先對照《中華人民共和國廣告法》的禁用詞——國家級、世界級、最高級、頂級、第一、唯一、一流、首選、首家、首要、高級——進行審查。當某個詞沒有準確的替代說法時，我們會刪去該聲稱，而不是含糊化處理。',
            'zh-Hans': '面向中国内地受众的文案，在发布或投放前，会先对照《中华人民共和国广告法》的禁用词——国家级、世界级、最高级、顶级、第一、唯一、一流、首选、首家、首要、高级——进行审查。当某个词没有准确的替代说法时，我们会删去该声称，而不是含糊化处理。',
          },
        },
      ],
    },
  },

  /* ───────────────────────────────────────────────────────────────────────
     404
     ─────────────────────────────────────────────────────────────────────── */
  notFound: {
    eyebrow: { en: 'Error 404', 'zh-Hant': '錯誤 404', 'zh-Hans': '错误 404' },
    title: {
      en: 'This page is not here.',
      'zh-Hant': '這一頁不存在。',
      'zh-Hans': '这一页不存在。',
    },
    lede: {
      en: 'The address may have changed, or the page may never have existed. The work is still where it should be.',
      'zh-Hant': '網址可能已變更，或這一頁從未存在。案例仍在原處。',
      'zh-Hans': '网址可能已变更，或这一页从未存在。案例仍在原处。',
    },
    cta: { en: 'Go to the homepage', 'zh-Hant': '返回首頁', 'zh-Hans': '返回首页' },
    secondary: { en: 'See the work', 'zh-Hant': '查看案例', 'zh-Hans': '查看案例' },
  },
};
