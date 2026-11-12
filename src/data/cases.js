/**
 * Client work — the loader over the compiled case files.
 *
 * The cases live in `content/cases/*.json`, one file per case, all three
 * locales merged. They are written by the CMS sync (`tools/cms/sync-cases.mjs`)
 * and committed, so every published change is a reviewable, revertible diff
 * and the site never depends on Google being up.
 *
 * ── Read this before changing anything here ────────────────────────────────
 *
 * The `services` field on each case is its category: the keys of the service
 * menu (`src/data/services.js`), taken from that case's own scope lines —
 * a case that delivered WeChat content and paid social is tagged with those
 * two services, and nothing else. It is the field the CMS exposes as
 * "category": pick a service and the case appears on that service's page.
 *
 * The `source` field on each case names the deck and slide the entry came
 * from. Nothing here is written from memory, and no figure appears that is
 * not printed in the cited deck. The CMS refuses to publish a case without
 * one.
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
import { asset } from './media';
import { sectors } from './sectors';

/**
 * The compiled case files.
 *
 * `import.meta.glob` is a Vite feature, so the cases are bundled with the
 * app rather than fetched at runtime — the published site stays a static
 * build. The pattern reaches outside `src/` because the content lives at the
 * repository root, in `content/cases/`.
 */
const modules = import.meta.glob('../../content/cases/*.json', { eager: true });

/**
 * Resolve an image path against the deployment base path.
 *
 * The site is published under a sub-path on GitHub Pages, so an absolute
 * "/media/x.jpg" would look for the file at the domain root and 404. The
 * path in the compiled file is the site's own path; the base is added here,
 * once, at load time.
 *
 * The frames carry their own paths, so they are resolved too — a frame that
 * was left alone would be a broken image on a live page.
 */
function withBasePath(record) {
  if (!record) return record;

  const gallery = (record.gallery ?? []).map((frame) =>
    frame?.src ? { ...frame, src: asset(frame.src) } : frame,
  );

  if (!record.image?.src && gallery.length === 0) return record;

  return {
    ...record,
    image: record.image?.src ? { ...record.image, src: asset(record.image.src) } : record.image,
    gallery,
  };
}

/** The cases, in the order the sheet lists them. */
export const cases = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => a.order - b.order)
  .map(withBasePath);

export { sectors };

export function getCase(slug) {
  return cases.find((c) => c.slug === slug);
}

export function featuredCases() {
  return cases.filter((c) => c.featured);
}

/**
 * Whether any published case still carries generated artwork.
 *
 * The footer's standing disclosure and the work-grid note render only while
 * this is true: when the last mock-up is replaced with real client
 * photography, the disclosure retires by itself. That is the exit from the
 * mock-up blocker in `docs/LAUNCH_CHECKLIST.md`.
 */
export function hasMockUpCases() {
  return cases.some((c) => c.image?.mockup);
}
