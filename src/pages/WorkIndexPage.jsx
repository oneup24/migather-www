import { Link, useSearchParams } from 'react-router-dom';
import { cases, sectors } from '../data/cases';
import { content } from '../data/content';
import { contentV3 } from '../data/content.v3';
import { banners } from '../data/media';
import { useLocale } from '../hooks/useLocale';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import FilterRow from '../components/v3/FilterRow';
import PageBanner from '../components/v3/PageBanner';
import V3WorkGrid from '../components/v3/V3WorkGrid';

/**
 * The work index.
 *
 * Capsule48's structure exactly: a category filter row set above the grid,
 * with the active category marked by a rule on the baseline. The filter is
 * held in the URL so a filtered view can be linked and bookmarked.
 */
export default function WorkIndexPage() {
  const { locale, path, t } = useLocale();
  const [params, setParams] = useSearchParams();
  const c = content.work;

  const active = params.get('filter');
  const visible = active ? cases.filter((item) => item.sector === active) : cases;

  useDocumentMeta({
    title: t(c.title),
    description: t(c.lede),
    path: `/${locale}/work`,
  });

  const setFilter = (key) => {
    if (key) {
      setParams({ filter: key });
    } else {
      setParams({});
    }
  };

  const filters = [
    { key: null, label: t(c.allSectors) },
    ...Object.entries(sectors).map(([key, value]) => ({ key, label: t(value.label) })),
  ];

  return (
    <>
      <PageBanner
        image={banners.work}
        eyebrow={t(c.eyebrow)}
        title={t(c.title)}
        lede={t(c.lede)}
      />

      <section className="bg-paper pb-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pt-10">
            <FilterRow items={filters} value={active ?? null} onChange={setFilter} />
            <span className="shrink-0 text-[12px] text-muted">
              {visible.length} {t(c.countLabel)}
            </span>
          </div>

          {visible.length === 0 ? (
            <p className="py-24 text-center text-charcoal">{t(c.empty)}</p>
          ) : (
            <div className="mt-14">
              <V3WorkGrid entries={visible} columns={3} />
            </div>
          )}

          <div className="mt-16 border-t border-rule pt-8">
            <p className="max-w-2xl text-[13.5px] leading-relaxed text-muted">
              {t(contentV3.disclosure.workNote)}
            </p>
            <div className="mt-6">
              <Link to={path('/contact')} className="link-line">
                {t(content.home.cta.button)}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
