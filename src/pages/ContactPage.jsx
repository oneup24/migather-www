import ContactForm from '../components/contact/ContactForm';
import { content } from '../data/content';
import { banners, features } from '../data/media';
import { offices } from '../data/site';
import { useLocale } from '../hooks/useLocale';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import Editorial from '../components/v3/Editorial';
import MockUpTag from '../components/v3/MockUpTag';
import PageBanner from '../components/v3/PageBanner';

export default function ContactPage() {
  const { locale, t } = useLocale();
  const c = content.contact;

  useDocumentMeta({
    title: t(c.title),
    description: t(c.lede),
    path: `/${locale}/contact`,
  });

  return (
    <>
      <PageBanner
        image={banners.contact}
        eyebrow={t(c.eyebrow)}
        title={t(c.title)}
        lede={t(c.lede)}
      />

      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              {/* Pre-launch notice — remove once the form endpoint is wired. */}
              <div className="mb-12 border-l-2 border-brandCrimson bg-brandCrimsonPale px-5 py-4">
                <div className="eyebrow mb-2 text-brandCrimson">{t(content.common.preLaunchBadge)}</div>
                <p className="text-[15px] leading-relaxed text-ink">{t(c.preLaunch)}</p>
              </div>

              <ContactForm />
            </div>

            <div className="lg:col-span-5">
              <Editorial
                label={t({ en: 'Offices', 'zh-Hant': '辦事處', 'zh-Hans': '办事处' })}
                statement={t(c.officesTitle)}
                statementSize="sm"
              />

              <ul className="mt-10 border-t border-rule">
                {offices.map((office) => (
                  <li
                    key={office.city.en}
                    className="flex items-baseline justify-between gap-4 border-b border-rule py-4"
                  >
                    <span>
                      <span className="block font-display text-[19px] font-medium text-ink">
                        {t(office.city)}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-charcoal">{t(office.region)}</span>
                    </span>
                    <span className="eyebrow shrink-0 text-muted">{t(office.role)}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-[13.5px] leading-relaxed text-muted">{t(c.officesLede)}</p>

              <figure className="mt-12">
                <div className="frame relative aspect-[4/3]">
                  <img
                    src={features.contactCity.src}
                    alt={t(features.contactCity.alt)}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <MockUpTag />
                </div>
              </figure>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
