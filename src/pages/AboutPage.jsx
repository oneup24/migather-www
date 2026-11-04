import { clientGroups, clients } from '../data/clients';
import { content } from '../data/content';
import { contentV3 } from '../data/content.v3';
import { banners, features } from '../data/media';
import { certifications, offices, platforms } from '../data/site';
import { useLocale } from '../hooks/useLocale';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import Editorial from '../components/v3/Editorial';
import MockUpTag from '../components/v3/MockUpTag';
import PageBanner from '../components/v3/PageBanner';

export default function AboutPage() {
  const { locale, t } = useLocale();
  const c = content.about;

  useDocumentMeta({
    title: t(c.title),
    description: t(c.lede),
    path: `/${locale}/about`,
  });

  const groupOrder = ['finance', 'property', 'lifestyle', 'luxury', 'institution'];

  return (
    <>
      <PageBanner
        image={banners.about}
        eyebrow={t(c.eyebrow)}
        title={t(c.title)}
        lede={t(c.lede)}
      />

      {/* The story */}
      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Editorial
                label={t({ en: 'The short version', 'zh-Hant': '簡單說', 'zh-Hans': '简单说' })}
                statement={t(c.story[0])}
                statementSize="sm"
              />

              <div className="mt-10 space-y-6">
                {c.story.slice(1).map((para, i) => (
                  <p key={i} className="text-[17px] leading-relaxed text-charcoal">
                    {t(para)}
                  </p>
                ))}
              </div>
            </div>

            <figure className="lg:col-span-5">
              <div className="frame relative aspect-[3/4]">
                <img
                  src={features.aboutStudio.src}
                  alt={t(features.aboutStudio.alt)}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <MockUpTag />
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="bg-surface py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <Editorial label={t(c.principlesTitle)} statement={t(content.home.principles.title)} />

          <ul className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {content.home.principles.items.map((item) => (
              <li key={item.number} className="border-t border-rule pt-7">
                <div className="section-number">{item.number}</div>
                <h3 className="font-editorial mt-5 text-[22px] leading-snug font-normal text-ink">
                  {t(item.title)}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-charcoal">{t(item.body)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Offices */}
      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <Editorial
            label={t({ en: 'Offices', 'zh-Hant': '辦事處', 'zh-Hans': '办事处' })}
            statement={t(c.officesTitle)}
            lede={t(c.officesLede)}
          />

          <ul className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-3">
            {offices.map((office) => (
              <li key={office.city.en} className="border-t border-rule pt-7">
                <div className="eyebrow text-brandCrimson">{t(office.role)}</div>
                <h3 className="font-editorial mt-4 text-[28px] leading-tight font-normal text-ink">
                  {t(office.city)}
                </h3>
                <div className="mt-1.5 text-[15px] text-charcoal">{t(office.region)}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Clients */}
      <section className="bg-surface py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <Editorial label={t(contentV3.labels.clients)} statement={t(c.clientsTitle)} lede={t(c.clientsLede)} />

          <div className="mt-14 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {groupOrder.map((group) => {
              const items = clients.filter((client) => client.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group} className="border-t border-rule pt-6">
                  <div className="eyebrow text-brandCrimson">{t(clientGroups[group].label)}</div>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    {items.map((client) => (
                      <span key={client.name} className="font-display text-[18px] font-medium text-ink/85">
                        {client.name}
                        {client.local && (
                          <span className="ml-2 text-[14px] font-normal text-muted">{client.local}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platforms & certifications */}
      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <Editorial
            label={t({ en: 'Infrastructure', 'zh-Hant': '基礎', 'zh-Hans': '基础' })}
            statement={t(c.platformsTitle)}
            lede={t(c.platformsLede)}
          />

          <div className="mt-14 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="grid gap-x-10 sm:grid-cols-2">
                {[...new Set(platforms.map((p) => t(p.group)))].map((group) => (
                  <div key={group} className="border-t border-rule pt-6">
                    <div className="eyebrow text-muted">{group}</div>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                      {platforms
                        .filter((p) => t(p.group) === group)
                        .map((p) => (
                          <span key={p.name} className="font-display text-[17px] text-ink/85">
                            {p.name}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="eyebrow text-brandCrimson mb-4">
                {t({ en: 'Certifications', 'zh-Hant': '認證', 'zh-Hans': '认证' })}
              </div>
              <ul className="border-t border-rule">
                {certifications.map((cert) => (
                  <li
                    key={cert.name}
                    className="flex items-center justify-between gap-4 border-b border-rule py-4"
                  >
                    <span className="font-display text-[17px] font-medium text-ink">{cert.name}</span>
                    <span className="eyebrow text-muted">{t(cert.note)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
