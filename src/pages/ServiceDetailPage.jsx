import { Link, useParams } from 'react-router-dom';
import { cases } from '../data/cases';
import { content } from '../data/content';
import { banners } from '../data/media';
import { allServices, getService, serviceGroups } from '../data/services';
import { useLocale } from '../hooks/useLocale';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import Editorial from '../components/v3/Editorial';
import PageBanner from '../components/v3/PageBanner';
import V3WorkGrid from '../components/v3/V3WorkGrid';

/**
 * A service page.
 *
 * The same shape as a case study: a banner with the category above the
 * title, the work underneath, the detail beside it, and the next one at
 * the foot. What differs is what the detail holds — a case is a piece of
 * work for one client, a service is a line of work across the roster.
 *
 * The link between them is the `services` field on each case: pick a
 * service and the work tagged with it appears here. That is the field the
 * CMS will expose as "category", so this page works the same whether the
 * roster is edited by hand or through a CMS.
 */
export default function ServiceDetailPage() {
  const { key } = useParams();
  const { locale, path, t } = useLocale();
  const service = getService(key);
  const c = content.services.page;

  useDocumentMeta({
    title: service ? t(service.name) : t(content.notFound.title),
    description: service ? t(service.description) : undefined,
    path: `/${locale}/services/${key}`,
  });

  if (!service) {
    return (
      <div className="bg-paper px-6 py-28 text-center">
        <h1 className="font-editorial text-[32px] font-normal text-ink">{t(content.notFound.title)}</h1>
        <Link to={path('/services')} className="link-line mt-8">
          {t(content.common.backToServices)}
        </Link>
      </div>
    );
  }

  const group = serviceGroups.find((g) => g.key === service.group);
  const related = cases.filter((item) => (item.services ?? []).includes(service.key));

  const index = allServices.findIndex((s) => s.key === service.key);
  const next = allServices[(index + 1) % allServices.length];

  return (
    <>
      <PageBanner
        image={banners.services}
        eyebrow={t(group.label)}
        title={t(service.name)}
        lede={t(service.description)}
      />

      {/* The work, filtered by category */}
      <section className="bg-paper py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <div className="eyebrow text-brandCrimson">{t(c.workTitle)}</div>
            <p className="text-[12.5px] text-muted">{t(c.workLede)}</p>
          </div>

          {related.length === 0 ? (
            <p className="py-16 text-charcoal">{t(c.empty)}</p>
          ) : (
            <V3WorkGrid entries={related} columns={3} />
          )}
        </div>
      </section>

      {/* Where this sits */}
      <section className="bg-surface py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <Editorial
                label={t(c.coversTitle)}
                statement={t(group.label)}
                statementSize="sm"
              />
              <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-charcoal">
                {t(group.statement)}
              </p>
            </div>

            <div className="lg:col-span-8">
              <p className="font-editorial max-w-[46ch] text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.3] text-ink">
                {t(service.description)}
              </p>

              <p className="mt-10 border-l-2 border-brandBlue/30 pl-4 text-[12px] leading-relaxed text-muted">
                {t(content.common.sourceNote)}
                <br />
                <span className="text-muted/80">{t(content.services.page.ctaScopeNote)}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The next service */}
      <section className="bg-paper py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="border-t border-rule pt-8">
            <div className="eyebrow text-muted">{t(c.nextTitle)}</div>
            <Link
              to={path(`/services/${next.key}`)}
              className="group mt-4 inline-flex items-baseline gap-4 font-editorial text-[clamp(1.9rem,4vw,3rem)] leading-tight font-normal text-ink transition-colors hover:text-brandBlue"
            >
              {t(next.name)}
              <span className="text-brandCrimson transition-transform group-hover:translate-x-1" aria-hidden="true">
                →
              </span>
            </Link>
            <div className="mt-8">
              <Link to={path('/services')} className="link-line">
                {t(content.common.backToServices)}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
