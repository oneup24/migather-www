import { Link, useParams } from 'react-router-dom';
import { cases, getCase, sectors } from '../data/cases';
import { content } from '../data/content';
import { contentV3 } from '../data/content.v3';
import { asset } from '../data/media';
import { useLocale } from '../hooks/useLocale';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import Editorial from '../components/v3/Editorial';
import PageBanner from '../components/v3/PageBanner';

export default function WorkDetailPage() {
  const { slug } = useParams();
  const { locale, path, t } = useLocale();
  const item = getCase(slug);

  useDocumentMeta({
    title: item ? `${item.client} — ${t(sectors[item.sector].label)}` : t(content.notFound.title),
    description: item ? t(item.summary) : undefined,
    path: `/${locale}/work/${slug}`,
  });

  if (!item) {
    return (
      <div className="bg-paper px-6 py-28 text-center">
        <h1 className="font-editorial text-[32px] font-normal text-ink">{t(content.notFound.title)}</h1>
        <Link to={path('/work')} className="link-line mt-8">
          {t(content.common.backToWork)}
        </Link>
      </div>
    );
  }

  const currentIndex = cases.findIndex((c) => c.slug === item.slug);
  const next = cases[(currentIndex + 1) % cases.length];
  const image = item.image ?? null;

  return (
    <>
      <PageBanner
        image={
          image ?? { src: asset('/media/work-hero.jpg'), alt: { en: '', 'zh-Hant': '', 'zh-Hans': '' } }
        }
        mockup={image ? Boolean(image.mockup) : true}
        eyebrow={t(sectors[item.sector].label)}
        title={
          <span className="flex flex-col gap-3">
            <span>{item.client}</span>
            {item.clientLocal && (
              <span className="font-display text-[0.42em] leading-tight text-white/60">
                {t(item.clientLocal)}
              </span>
            )}
          </span>
        }
        lede={t(item.summary)}
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          {item.partnershipSince && (
            <div className="flex items-baseline gap-2">
              <span className="eyebrow text-white/55">{t(content.common.partnerSince)}</span>
              <span className="font-display text-[15px] font-medium text-white">
                {t(item.partnershipSince)}
              </span>
            </div>
          )}

          {image?.mockup && (
            <span className="eyebrow border border-white/30 px-2.5 py-1 text-white/65">
              {t(contentV3.disclosure.bannerNote)}
            </span>
          )}
        </div>
      </PageBanner>

      {/* Results */}
      {item.results.length > 0 && (
        <section className="bg-paper py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="eyebrow text-brandCrimson mb-10">{t(content.common.results)}</div>
            <dl
              className={`grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 ${
                item.results.length >= 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-2'
              }`}
            >
              {item.results.map((r) => (
                <div key={r.label.en} className="border-t border-rule pt-6">
                  <dd className="font-editorial text-[clamp(2.4rem,4vw,3.4rem)] leading-none text-brandBlue">
                    {r.value}
                  </dd>
                  <dt className="eyebrow mt-4 text-ink">{t(r.label)}</dt>
                  {r.note && (
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">{t(r.note)}</p>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* Scope */}
      <section className="bg-surface py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <Editorial
                label={t(content.common.scope)}
                statement={t(sectors[item.sector].label)}
                statementSize="sm"
              />

              <dl className="mt-10 border-t border-rule">
                <div className="border-b border-rule py-4">
                  <dt className="eyebrow text-muted">{t(contentV3.labels.client)}</dt>
                  <dd className="mt-2 font-display text-[17px] font-medium text-ink">
                    {item.client}
                    {item.clientLocal && (
                      <span className="ml-2 text-[14px] font-normal text-muted">
                        {t(item.clientLocal)}
                      </span>
                    )}
                  </dd>
                </div>
                {item.partnershipSince && (
                  <div className="border-b border-rule py-4">
                    <dt className="eyebrow text-muted">{t(content.common.partnerSince)}</dt>
                    <dd className="mt-2 font-display text-[17px] font-medium text-ink">
                      {t(item.partnershipSince)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="lg:col-span-8">
              <ul className="border-t border-rule">
                {item.scope.map((s, i) => (
                  <li key={s.en} className="flex items-start gap-5 border-b border-rule py-5">
                    <span className="mt-1 shrink-0 font-display text-[12px] font-medium tracking-widest text-brandCrimson">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-ink leading-relaxed">{t(s)}</span>
                  </li>
                ))}
              </ul>

              <p className="case-source mt-8 border-l-2 border-brandBlue/30 pl-4 text-[12px] leading-relaxed text-muted">
                {t(content.common.sourceNote)}
                <br />
                <span className="text-muted/80">{item.source}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Next case */}
      <section className="bg-paper py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="border-t border-rule pt-8">
            <div className="eyebrow text-muted">{t(sectors[next.sector].label)}</div>
            <Link
              to={path(`/work/${next.slug}`)}
              className="group mt-4 inline-flex items-baseline gap-4 font-editorial text-[clamp(1.9rem,4vw,3rem)] leading-tight font-normal text-ink transition-colors hover:text-brandBlue"
            >
              {next.client}
              <span className="text-brandCrimson transition-transform group-hover:translate-x-1" aria-hidden="true">
                →
              </span>
            </Link>
            <div className="mt-8">
              <Link to={path('/work')} className="link-line">
                {t(content.common.backToWork)}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
