/**
 * Mock-up imagery manifest — v3.0
 *
 * ── Read this before changing anything here ────────────────────────────────
 *
 * Every file in `public/media/` is GENERATED placeholder artwork, not
 * client photography. No screenshot of a real client campaign exists in
 * our records, so none is used here.
 *
 * The images are atmosphere, not evidence. They show a plausible Hong Kong
 * or Asian setting for each sector so the layout can be judged at full
 * size — they do not depict any work Migather has done.
 *
 * Because these sit beside real, sourced client results, every one of them
 * is labelled on screen as a mock-up (see `MockUpTag` in
 * `src/components/v3/`) and the footer carries a standing disclosure.
 *
 * The one exception is `clientLogos` below — the logo wall, which carries
 * the clients' own marks rather than generated artwork.
 *
 * The case images are not here: they moved into the case records when the
 * works page became CMS-driven, because a picture is edited in the same
 * place as the copy it sits beside, and it carries its own mock-up flag.
 * See `src/data/cases.js`.
 *
 * The site is NOT publishable until this artwork is replaced with real
 * client photography or the pages that use it are removed. This is listed
 * as a launch blocker in `docs/LAUNCH_CHECKLIST.md`.
 *
 * Alt text repeats the word "mock-up" for the same reason: a screen-reader
 * user should never be told a photograph of Hong Kong is a photograph of a
 * client campaign.
 * ─────────────────────────────────────────────────────────────────────────
 */

/**
 * Resolve a media path against the deployment base path.
 *
 * The site is published under a sub-path on GitHub Pages (…/migather-www/site),
 * so an absolute "/media/x.jpg" would look for the file at the domain root and
 * 404. Vite bakes the base in at build time; locally it is empty and the
 * paths stay exactly as they were.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const asset = (path) => `${BASE}${path}`;

export const mockUpNotice = {
  en: 'Mock-up imagery — generated placeholder artwork, not client photography.',
  'zh-Hant': '樣機圖片 — 生成的佔位視覺，並非客戶真實攝影作品。',
  'zh-Hans': '样机图片 — 生成的占位视觉，并非客户真实摄影作品。',
};

export const mockUpTag = {
  en: 'Mock-up',
  'zh-Hant': '樣機',
  'zh-Hans': '样机',
};

/**
 * Client marks for the logo wall.
 *
 * These are the one set of images on the site that are NOT generated
 * placeholder artwork: they are the clients' own marks, used to identify
 * the clients they belong to. Each was fetched from the brand's own site,
 * from Wikimedia, or from our own credential deck — never from an
 * aggregator. `tools/media/fetch-client-logos.py` re-fetches them and
 * records where each one came from in `source` below.
 *
 * A client's mark is its property, not ours. The wall carries a standing
 * line saying so (`contentV3.labels.markOwner`), and the alt text is the
 * brand's own name, which does not change with the language.
 */
export const clientLogos = {
  'huatai-finance': {
    src: asset('/media/clients/huatai-finance.png'),
    source: 'agency credential deck',
  },
  'bank-of-china-hk': {
    src: asset('/media/clients/bank-of-china-hk.png'),
    source: 'bochk.com',
  },
  'fubon-bank': {
    src: asset('/media/clients/fubon-bank.png'),
    source: 'fubonbank.com.hk',
  },
  'icbc-asia': {
    src: asset('/media/clients/icbc-asia.png'),
    source: 'icbcasia.com',
  },
  'atfx': {
    src: asset('/media/clients/atfx.svg'),
    source: 'atfx.com',
  },
  'ctf-life': {
    src: asset('/media/clients/ctf-life.svg'),
    source: 'ctflife.com.hk',
  },
  'new-world-development': {
    src: asset('/media/clients/new-world-development.png'),
    source: 'agency credential deck',
  },
  'chinachem': {
    src: asset('/media/clients/chinachem.svg'),
    source: 'Wikimedia — SinoGroup logo',
  },
  'lee-gardens': {
    src: asset('/media/clients/lee-gardens.png'),
    source: 'agency credential deck',
  },
  'k11-musea': {
    src: asset('/media/clients/k11-musea.svg'),
    source: 'k11musea.com',
  },
  '11-skies': {
    // The agency's own instruction, November 2026: the 11 SKIES line of the
    // wall carries the K11 mark.
    src: asset('/media/clients/k11-musea.svg'),
    source: 'the K11 MUSEA mark, at the request of the agency',
  },
  'marks-spencer': {
    src: asset('/media/clients/marks-spencer.png'),
    source: 'agency credential deck',
  },
  'v-city': {
    src: asset('/media/clients/v-city.png'),
    source: 'vcity.com.hk',
  },
  'h-queens': {
    src: asset('/media/clients/h-queens.png'),
    source: 'agency credential deck',
  },
  'hktdc': {
    src: asset('/media/clients/hktdc.svg'),
    source: 'agency credential deck',
  },
  'beauty-express': {
    src: asset('/media/clients/beauty-express.svg'),
    source: 'bexgrp.com',
  },
  'beauty-avenue': {
    src: asset('/media/clients/beauty-avenue.png'),
    source: 'agency credential deck',
  },
  'invisalign': {
    src: asset('/media/clients/invisalign.svg'),
    source: 'Wikimedia',
  },
  iberico: {
    src: asset('/media/clients/iberico.png'),
    source: 'agency credential deck',
  },
  mando: {
    src: asset('/media/clients/mando.png'),
    source: 'agency credential deck',
  },
  christies: {
    src: asset('/media/clients/christies.svg'),
    source: 'Wikimedia',
  },
  mtr: {
    src: asset('/media/clients/mtr.svg'),
    source: 'Wikipedia',
  },
  hkjc: {
    src: asset('/media/clients/hkjc.svg'),
    source: 'Wikipedia',
  },
};

/**
 * Page-level banners.
 *
 * These carry no client attribution at all — they are atmospheric
 * establishing shots for a page. They are still generated artwork, so each
 * one carries the mock-up tag on screen (`MockUpTag placement="banner"`)
 * and repeats "mock-up" in its alt text.
 */
export const banners = {
  home: {
    src: asset('/media/hero-cinema.jpg'),
    alt: {
      en: 'Mock-up: night view across Victoria Harbour in Hong Kong, ferry lights on the water.',
      'zh-Hant': '樣機：香港維多利亞港夜景，渡輪燈光映在海面上。',
      'zh-Hans': '样机：香港维多利亚港夜景，渡轮灯光映在海面上。',
    },
  },
  work: {
    src: asset('/media/work-hero.jpg'),
    alt: {
      en: 'Mock-up: printed campaign layouts and storyboard frames laid out on a studio desk.',
      'zh-Hant': '樣機：工作桌上攤開的印刷稿件與分鏡稿。',
      'zh-Hans': '样机：工作桌上摊开的印刷稿件与分镜稿。',
    },
  },
  about: {
    src: asset('/media/about-hero.jpg'),
    alt: {
      en: 'Mock-up: a quiet creative studio at dusk, paper layouts under a single lamp.',
      'zh-Hant': '樣機：黃昏時分的創意工作室，單盞燈照亮桌上的稿件。',
      'zh-Hans': '样机：黄昏时分的创意工作室，单盏灯照亮桌上的稿件。',
    },
  },
  services: {
    src: asset('/media/services-hero.jpg'),
    alt: {
      en: 'Mock-up: layered translucent colour gels over a backlit lightbox.',
      'zh-Hant': '樣機：背光燈箱上層疊的半透明色片。',
      'zh-Hans': '样机：背光灯箱上层叠的半透明色片。',
    },
  },
  careers: {
    src: asset('/media/careers-hero.jpg'),
    alt: {
      en: 'Mock-up: a small creative team working at a wall of printed layouts.',
      'zh-Hant': '樣機：小型創意團隊在滿牆印刷稿件前工作。',
      'zh-Hans': '样机：小型创意团队在满墙印刷稿件前工作。',
    },
  },
  contact: {
    src: asset('/media/contact-banner.jpg'),
    alt: {
      en: 'Mock-up: daytime view across a Hong Kong harbour frontage, ferry pier and terminal rooflines.',
      'zh-Hant': '樣機：白天的香港海港一帶，渡輪碼頭與碼頭大樓的輪廓。',
      'zh-Hans': '样机：白天的香港海港一带，渡轮码头与码头大楼的轮廓。',
    },
  },
};

/**
 * Editorial images that sit inside page bodies.
 *
 * Only the images a component actually renders are listed here. An entry
 * that nothing renders would ship its file to `dist/` for nothing.
 */
export const features = {
  aboutStudio: {
    src: asset('/media/about-studio.jpg'),
    alt: {
      en: 'Mock-up: a studio shelf with printed boards, colour swatches and a small plant.',
      'zh-Hant': '樣機：工作室層架上的印刷板、色票與小植物。',
      'zh-Hans': '样机：工作室层架上的印刷板、色票与小植物。',
    },
  },
  contactCity: {
    src: asset('/media/contact-city.jpg'),
    alt: {
      en: 'Mock-up: the central Hong Kong business district at golden hour.',
      'zh-Hant': '樣機：黃昏時分的中環商業區。',
      'zh-Hans': '样机：黄昏时分的中环商业区。',
    },
  },
};

/**
 * The case galleries.
 *
 * A gallery is the run of frames that sits under the case information: the
 * campaign as it was seen, rather than the campaign as it was described.
 *
 * ── These are mock-up frames too ─────────────────────────────────────────
 *
 * No campaign photography exists in the records, so the frames are borrowed
 * from the case banners of the finance cases and from the city shot — the
 * closest thing in the repository to what a Hong Kong brokerage campaign
 * looks like: a skyline at night, a camera on set, a phone showing a feed,
 * glass forms, gold, and the harbour from above.
 *
 * Every frame carries the `MOCK-UP` tag and its alt text opens with
 * "mock-up" in all three languages, and the section repeats the disclosure
 * under the grid. Each frame keeps its own `mockup` flag, so a frame can be
 * replaced with the real photograph and drop the tag on its own.
 *
 * The captions name the campaign element the frame stands in for. They are
 * the deliverables from the case's own scope list, written as labels; they
 * do not describe the picture.
 *
 * Keyed by case slug and read by `src/components/v3/V3CaseGallery.jsx`.
 * The Huatai gallery is the first one to be laid out; a case with no entry
 * here simply does not render the section.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const caseGalleries = {
  'huatai-finance-hk': [
    {
      src: asset('/media/cases/hang-seng-bank/case-hangseng.jpg'),
      alt: {
        en: 'Mock-up: a camera on a tripod set up for a studio interview.',
        'zh-Hant': '樣機：為室內訪談架設的攝影機。',
        'zh-Hans': '样机：为室内访谈架设的摄影机。',
      },
      caption: {
        en: 'Branding video — shoot',
        'zh-Hant': '品牌影片——拍攝現場',
        'zh-Hans': '品牌视频——拍摄现场',
      },
      mockup: true,
    },
    {
      src: asset('/media/cases/atfx-securities-hk/case-atfx.jpg'),
      alt: {
        en: "Mock-up: Hong Kong's central business district lit up at night, seen from above.",
        'zh-Hant': '樣機：夜色中的中環商業區，由高處俯視。',
        'zh-Hans': '样机：夜色中的中环商业区，由高处俯视。',
      },
      caption: {
        en: 'OOH — bus and tram',
        'zh-Hant': '戶外廣告——巴士及電車',
        'zh-Hans': '户外广告——巴士及电车',
      },
      mockup: true,
    },
    {
      src: asset('/media/cases/bank-of-china-hk/case-boc.jpg'),
      alt: {
        en: 'Mock-up: a hand holding a phone showing a social feed beside a window.',
        'zh-Hant': '樣機：窗邊有人手持手機，螢幕上是社群貼文。',
        'zh-Hans': '样机：窗边有人手持手机，屏幕上是社群贴文。',
      },
      caption: {
        en: 'Social — feed creative',
        'zh-Hant': '社群——貼文視覺',
        'zh-Hans': '社群——贴文视觉',
      },
      mockup: true,
    },
    {
      src: asset('/media/cases/fubon-bank/case-fubon.jpg'),
      alt: {
        en: 'Mock-up: translucent blue glass blocks and a sphere lit from one side.',
        'zh-Hant': '樣機：單側打光的藍色玻璃方塊與圓體。',
        'zh-Hans': '样机：单侧打光的蓝色玻璃方块与圆体。',
      },
      caption: {
        en: 'Brand system — graphic forms',
        'zh-Hant': '品牌系統——圖形元素',
        'zh-Hans': '品牌系统——图形元素',
      },
      mockup: true,
    },
    {
      src: asset('/media/cases/wing-fung-financial-hk/case-wingfung.jpg'),
      alt: {
        en: 'Mock-up: stacked gold bars and coins under a warm light.',
        'zh-Hant': '樣機：暖光下的金條與金幣堆。',
        'zh-Hans': '样机：暖光下的金条与金币堆。',
      },
      caption: {
        en: 'Investment campaign — product visual',
        'zh-Hant': '投資推廣——產品視覺',
        'zh-Hans': '投资推广——产品视觉',
      },
      mockup: true,
    },
    {
      src: asset('/media/contact-city.jpg'),
      alt: {
        en: 'Mock-up: an aerial view across Victoria Harbour at golden hour.',
        'zh-Hant': '樣機：黃昏時分俯瞰維多利亞港。',
        'zh-Hans': '样机：黄昏时分俯瞰维多利亚港。',
      },
      caption: {
        en: 'Citywide — media placements',
        'zh-Hant': '城市投放——媒體版面',
        'zh-Hans': '城市投放——媒体版面',
      },
      mockup: true,
    },
  ],
};

/**
 * The case images live with the cases.
 *
 * They moved out of this manifest when the works page became CMS-driven: a
 * case's picture is part of the case, it carries its own alt text and its
 * own mock-up flag, and it is edited in the same place as the copy. They
 * are read from the compiled case files — see `src/data/cases.js`.
 */
