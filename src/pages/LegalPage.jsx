import { useParams } from 'react-router-dom';
import { content } from '../data/content';
import { useLocale } from '../hooks/useLocale';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Link } from 'react-router-dom';
import PageBanner from '../components/v3/PageBanner';
import { banners } from '../data/media';

const DOCS = {
  privacy: content.legal.privacy,
  terms: content.legal.terms,
  disclosure: content.legal.disclosure,
};

export default function LegalPage() {
  const { doc } = useParams();
  const { locale, path, t } = useLocale();
  const entry = DOCS[doc];

  useDocumentMeta({
    title: entry ? t(entry.title) : t(content.notFound.title),
    path: `/${locale}/legal/${doc}`,
  });

  if (!entry) {
    return (
      <div className="bg-paper px-6 py-28 text-center">
        <h1 className="font-editorial text-[32px] font-normal text-ink">{t(content.notFound.title)}</h1>
        <Link to={path('/')} className="link-line mt-8">
          {t(content.notFound.cta)}
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageBanner
        image={banners.work}
        eyebrow={t({ en: 'Legal', 'zh-Hant': '法律條款', 'zh-Hans': '法律条款' })}
        title={t(entry.title)}
      />

      <section className="bg-paper py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-12 border-l-2 border-brandCrimson bg-brandCrimsonPale px-5 py-4">
            <p className="text-[15px] leading-relaxed text-ink">{t(content.legal.draftBanner)}</p>
          </div>

          {entry.intro && (
            <p className="font-editorial mb-12 text-[21px] leading-relaxed font-normal text-ink">
              {t(entry.intro)}
            </p>
          )}

          <div className="space-y-12">
            {entry.sections.map((section) => (
              <div key={section.heading.en}>
                <h2 className="font-editorial mb-4 border-b border-rule pb-3 text-[22px] font-normal text-ink">
                  {t(section.heading)}
                </h2>
                <p className="text-[16.5px] leading-relaxed text-charcoal">{t(section.body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
