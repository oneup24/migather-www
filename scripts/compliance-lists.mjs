/**
 * Compliance word lists — shared by two screens.
 *
 * `check-copy.mjs` scans the data modules, which is where the translatable
 * copy lives. `ssr-check.jsx` scans the *rendered* text of every route, which
 * catches the case the data scan structurally cannot: a banned term written
 * directly into a component instead of a data module.
 *
 * Both screens use the same lists, so they cannot drift apart.
 */

/**
 * 中国广告法 restricted terms.
 *
 * Both scripts are listed: the site ships in Traditional and Simplified
 * Chinese, and a term that is restricted in one is restricted in the other.
 */
export const CN_BANNED = [
  '国家级',
  '世界级',
  '最高级',
  '顶级',
  '第一',
  '唯一',
  '一流',
  '首选',
  '首家',
  '首要',
  '高级',
  // Traditional forms.
  '國家級',
  '世界級',
  '最高級',
  '頂級',
  '首選',
  '高級',
];

/** Migather's own banned-claim words. */
export const EN_BANNED = [
  'leading',
  'global agency',
  'award-winning',
  'top',
  'no.1',
  'full-service',
  'end-to-end solutions',
  'industry leader',
];

/**
 * Segments that are allowed to contain a banned term, with the reason.
 * A segment is skipped if it contains any of these markers.
 */
export const ALLOW = [
  { match: '广告法', reason: 'the KOL disclosure page names the restricted terms by design' },
  { match: '廣告法', reason: 'the KOL disclosure page names the restricted terms by design' },
  { match: '第一天', reason: 'idiomatic "from day one" — not a superiority claim' },
  { match: '第一天', reason: 'idiomatic "from day one" — not a superiority claim' },
  { match: 'first tier', reason: 'product tiering, not a superlative claim' },
  { match: 'top tier', reason: 'KOL tiering term, not a claim about ourselves' },
];

const EN_PATTERN = new RegExp(
  `(^|[^a-z0-9])(${EN_BANNED.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join(
    '|',
  )})([^a-z0-9]|$)`,
  'i',
);

/**
 * Split text into sentence-sized segments.
 *
 * The allow-list is matched per segment rather than per page: the KOL
 * disclosure page names the restricted terms on purpose, but that must not
 * excuse a banned term anywhere else on the same page.
 *
 * The split is at *sentence* boundaries only. Splitting on the ideographic
 * comma as well would tear the disclosure page's list of restricted terms
 * away from the sentence that names the law — and the allow-list marker
 * would stop reaching them.
 */
function segments(text) {
  return String(text)
    .split(/(?<=[。．！!？?；;])|(?<=\.)(?=\s)|[\n\r]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Scan a block of text for banned terms.
 *
 * Returns a list of `{ term, kind, segment }`. An empty list means clean.
 */
export function scanText(text) {
  const hits = [];
  for (const segment of segments(text)) {
    if (ALLOW.some((a) => segment.includes(a.match))) continue;

    for (const term of CN_BANNED) {
      if (segment.includes(term)) hits.push({ term, kind: 'CN', segment });
    }

    const match = segment.match(EN_PATTERN);
    if (match) hits.push({ term: match[2], kind: 'EN', segment });
  }
  return hits;
}
