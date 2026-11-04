import { content } from '../data/content';
import { banners } from '../data/media';
import { useLocale } from '../hooks/useLocale';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import Editorial from '../components/v3/Editorial';
import PageBanner from '../components/v3/PageBanner';

export default function CareersPage() {
  const { locale, path, t } = useLocale();
  const c = content.careers;

  useDocumentMeta({
    title: t(c.title),
    description: t(c.lede),
    path: `/${locale}/careers`,
  });

  return (
    <>
      <PageBanner
        image={banners.careers}
        eyebrow={t(c.eyebrow)}
        title={t(c.title)}
        lede={t(c.lede)}
      />

      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Editorial
                label={t(c.whatTitle)}
                statement={t({ en: 'What we look for', 'zh-Hant': '我們看重甚麼', 'zh-Hans': '我们看重什么' })}
                statementSize="sm"
              />

              <ul className="mt-12 border-t border-rule">
                {c.whatItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-5 border-b border-rule py-5">
                    <span className="mt-1 shrink-0 font-display text-[12px] font-medium tracking-widest text-brandCrimson">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-charcoal leading-relaxed">{t(item)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5">
              <div className="border-t border-rule pt-7">
                <div className="eyebrow text-brandCrimson">{t(c.vacTitle)}</div>
                <h2 className="font-editorial mt-5 text-[clamp(1.7rem,2.8vw,2.5rem)] leading-[1.14] font-normal text-ink">
                  {t({ en: 'No fixed vacancy right now.', 'zh-Hant': '目前沒有固定職位空缺。', 'zh-Hans': '目前没有固定职位空缺。' })}
                </h2>
                <p className="mt-6 max-w-md text-[16px] leading-relaxed text-charcoal">{t(c.vacLede)}</p>

                <a href={path('/contact')} className="link-line mt-9">
                  {t(c.cta)}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
