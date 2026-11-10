/**
 * The sector taxonomy.
 *
 * A case belongs to one sector: finance, properties, travel, luxury,
 * lifestyle. The work page filters on it and the footer links to it.
 *
 * It lives in its own module rather than in `cases.js` because the CMS
 * tooling reads this list from plain Node, and `cases.js` is built by Vite
 * (it loads the compiled case files with `import.meta.glob`), so it cannot
 * be imported outside the bundler.
 *
 * The sector list is not CMS-driven: adding a sector is a change to the
 * site's taxonomy, and the sheet's dropdown is checked against this list.
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
