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
 * One image per case.
 *
 * The subject is chosen to match what the case on file actually was — a
 * forum for the GBA case, a trading floor for the brokerage case, a mall
 * atrium for the shopping-centre cases — so the mock-up reads as the right
 * kind of work. It is still atmosphere, and it is still labelled as such.
 */
export const caseImages = {
  'huatai-finance-hk': {
    src: asset('/media/case-huatai.jpg'),
    alt: {
      en: 'Mock-up: dawn over a Hong Kong financial district, glass towers catching the light.',
      'zh-Hant': '樣機：香港金融區破曉，玻璃幕牆映着晨光。',
      'zh-Hans': '样机：香港金融区破晓，玻璃幕墙映着晨光。',
    },
  },
  '11-skies-gba-forum': {
    src: asset('/media/case-forum.jpg'),
    alt: {
      en: 'Mock-up: a large business forum auditorium, stage lit, audience in silhouette.',
      'zh-Hant': '樣機：大型商業論壇會場，台上燈光明亮，觀眾成剪影。',
      'zh-Hans': '样机：大型商业论坛会场，台上灯光明亮，观众成剪影。',
    },
  },
  'bank-of-china-hk': {
    src: asset('/media/case-boc.jpg'),
    alt: {
      en: 'Mock-up: hands holding a phone with an abstract banking interface.',
      'zh-Hant': '樣機：雙手拿着顯示抽象銀行介面的手機。',
      'zh-Hans': '样机：双手拿着显示抽象银行界面的手机。',
    },
  },
  'atfx-securities-hk': {
    src: asset('/media/case-atfx.jpg'),
    alt: {
      en: 'Mock-up: a Hong Kong commercial district at night, traffic light trails.',
      'zh-Hant': '樣機：香港商業區夜色，車流光軌。',
      'zh-Hans': '样机：香港商业区夜色，车流光轨。',
    },
  },
  'wing-fung-financial-hk': {
    src: asset('/media/case-wingfung.jpg'),
    alt: {
      en: 'Mock-up: gold bullion and coins under a single light.',
      'zh-Hant': '樣機：單一燈光下的金條與金幣。',
      'zh-Hans': '样机：单一灯光下的金条与金币。',
    },
  },
  'new-world-development': {
    src: asset('/media/case-newworld.jpg'),
    alt: {
      en: 'Mock-up: an Asian megacity skyline at dusk.',
      'zh-Hant': '樣機：黃昏時分的亞洲城市天際線。',
      'zh-Hans': '样机：黄昏时分的亚洲城市天际线。',
    },
  },
  'christies-auction': {
    src: asset('/media/case-christies.jpg'),
    alt: {
      en: 'Mock-up: an auction viewing room, one sculpture lit on a pedestal.',
      'zh-Hant': '樣機：拍賣預展廳，基座上的雕塑被聚光照亮。',
      'zh-Hans': '样机：拍卖预展厅，基座上的雕塑被聚光照亮。',
    },
  },
  'hang-seng-bank': {
    src: asset('/media/case-hangseng.jpg'),
    alt: {
      en: 'Mock-up: a presenter at a desk in a modern broadcast set.',
      'zh-Hant': '樣機：現代錄影場景中坐在枱前的講者。',
      'zh-Hans': '样机：现代录影场景中坐在桌前的讲者。',
    },
  },
  'fubon-bank': {
    src: asset('/media/case-fubon.jpg'),
    alt: {
      en: 'Mock-up: abstract animated geometric forms on a deep blue field.',
      'zh-Hant': '樣機：深藍底上的抽象動態幾何圖形。',
      'zh-Hans': '样机：深蓝底上的抽象动态几何图形。',
    },
  },
  '11-skies-social-management': {
    src: asset('/media/case-social.jpg'),
    alt: {
      en: 'Mock-up: a social content shoot in progress on a Hong Kong street.',
      'zh-Hant': '樣機：香港街頭進行中的社群內容拍攝。',
      'zh-Hans': '样机：香港街头进行中的社交内容拍摄。',
    },
  },
  'marks-and-spencer': {
    src: asset('/media/case-mands.jpg'),
    alt: {
      en: 'Mock-up: a retail window display of folded garments in warm light.',
      'zh-Hant': '樣機：暖光下的零售櫥窗服裝陳列。',
      'zh-Hans': '样机：暖光下的零售橱窗服装陈列。',
    },
  },
  'h-queens': {
    src: asset('/media/case-hqueens.jpg'),
    alt: {
      en: 'Mock-up: an art gallery opening in a Central heritage space.',
      'zh-Hant': '樣機：中環歷史建築內的藝術展覽開幕。',
      'zh-Hans': '样机：中环历史建筑内的艺术展览开幕。',
    },
  },
  'v-city-v-walk': {
    src: asset('/media/case-vcity.jpg'),
    alt: {
      en: 'Mock-up: a shopping mall interior under a glass roof.',
      'zh-Hant': '樣機：玻璃天幕下的購物城內景。',
      'zh-Hans': '样机：玻璃天幕下的购物城景。',
    },
  },
  'k11-musea': {
    src: asset('/media/case-k11.jpg'),
    alt: {
      en: 'Mock-up: a retail atrium with a large artwork hanging above.',
      'zh-Hant': '樣機：懸掛大型藝術裝置的零售中庭。',
      'zh-Hans': '样机：悬挂大型艺术装置的零售中庭。',
    },
  },
  'lee-gardens': {
    src: asset('/media/case-leegardens.jpg'),
    alt: {
      en: 'Mock-up: a tree-lined shopping street in a Chinese city in autumn.',
      'zh-Hant': '樣機：中國城市秋日的林蔭購物街。',
      'zh-Hans': '样机：中国城市秋日的林荫购物街。',
    },
  },
  chinachem: {
    src: asset('/media/case-chinachem.jpg'),
    alt: {
      en: 'Mock-up: residential tower facades at dusk, seen from below.',
      'zh-Hant': '樣機：黃昏時分仰拍的住宅樓立面。',
      'zh-Hans': '样机：黄昏时分仰拍的住宅楼立面。',
    },
  },
};

/** Case images are optional — a case without one falls back to a flat panel. */
export function caseImage(slug) {
  return caseImages[slug] ?? null;
}
