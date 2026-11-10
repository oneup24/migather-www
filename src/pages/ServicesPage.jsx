import { Link } from 'react-router-dom';
import { addOns, goals } from '../data/services';
import { content } from '../data/content';
import { banners } from '../data/media';
import { useLocale } from '../hooks/useLocale';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import Editorial from '../components/v3/Editorial';
import PageBanner from '../components/v3/PageBanner';

/**
 * Services.
 *
 * The three goals are set in the editorial grammar — a large numeral in the
 * left gutter, the goal name and statement beside it — and the individual
 * services inside each goal follow Capsule48's small caps service list
 * rather than a row of cards.
 */
export default function ServicesPage() {
  const { locale, path, t } = useLocale();
  const c = content.services;

  useDocumentMeta({
    title: t(c.title),
    description: t(c.lede),
    path: `/${locale}/services`,
  });

  return (
    <>
      <PageBanner
        image={banners.services}
        eyebrow={t(c.eyebrow)}
        title={t(c.title)}
        lede={t(c.lede)}
      />

      {goals.map((goal, gi) => (
        <section
          key={goal.key}
          className={`py-20 md:py-28 ${gi % 2 === 0 ? 'bg-paper' : 'bg-surface'}`}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <div className="section-number">{goal.number}</div>
                <h2 className="font-editorial mt-6 text-[clamp(1.9rem,3vw,2.8rem)] leading-[1.1] font-normal text-ink">
                  {t(goal.name)}
                </h2>
                <p className="mt-6 max-w-md text-[16px] leading-relaxed text-charcoal">
                  {t(goal.statement)}
                </p>
              </div>

              <div className="lg:col-span-8">
                <ul className="border-t border-rule">
                  {goal.items.map((item) => (
                    <li key={item.key} className="border-b border-rule py-7">
                      <Link
                        to={path(`/services/${item.key}`)}
                        className="service-list__item transition-colors hover:text-brandBlue"
                      >
                        {t(item.name)}
                      </Link>
                      <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-charcoal">
                        {t(item.description)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Add-ons */}
      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <Editorial
            label={t({ en: 'Optional', 'zh-Hant': '可選項目', 'zh-Hans': '可选项目' })}
            statement={t(c.addOnsTitle)}
            lede={t(c.addOnsLede)}
          />

          <ul className="service-list mt-14">
            {addOns.map((addon) => (
              <li key={addon.key}>
                <Link
                  to={path(`/services/${addon.key}`)}
                  className="service-list__item transition-colors hover:text-brandBlue"
                >
                  {t(addon.name)}
                </Link>
                <p className="mt-2.5 max-w-md text-[14.5px] leading-relaxed text-charcoal">
                  {t(addon.description)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="editorial">
            <div className="editorial-label">
              {t({ en: 'Next step', 'zh-Hant': '下一步', 'zh-Hans': '下一步' })}
            </div>
            <div>
              <h2 className="editorial-statement">{t(c.ctaTitle)}</h2>
              <div aria-hidden="true" className="mt-9 h-[3px] w-16 bg-brandCrimson" />
              <p className="editorial-lede mt-8">{t(c.ctaBody)}</p>
              <a
                href={path('/contact')}
                className="link-line mt-9"
              >
                {t(c.ctaButton)}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
