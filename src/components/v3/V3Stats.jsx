import { clients, testimonials } from '../../data/clients';
import { content } from '../../data/content';
import { contentV3 } from '../../data/content.v3';
import { markets, offices } from '../../data/site';
import { useLocale } from '../../hooks/useLocale';
import Editorial from './Editorial';

/**
 * The proof band.
 *
 * The four countable facts behind the work: how many clients are named, how
 * many markets are covered, how many delivery offices are on file, and how
 * many testimonials are attributed.
 *
 * Every number is computed from the data modules — none of them is typed in —
 * so the band cannot drift away from the roster it describes.
 */
export default function V3Stats() {
  const { t } = useLocale();
  const proof = content.home.proof;

  const stats = [
    { value: clients.length, label: t(proof.statClients) },
    { value: markets.length, label: t(proof.statMarkets) },
    { value: offices.length, label: t(proof.statOffices) },
    { value: testimonials.length, label: t(proof.statTestimonials) },
  ];

  return (
    <section className="bg-paper py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Editorial
          label={t(contentV3.labels.clients)}
          statement={t(proof.title)}
          lede={t(proof.lede)}
        />

        <dl className="mt-14 grid grid-cols-2 gap-y-10 border-t border-rule pt-10 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="md:border-l md:border-rule md:pl-8 md:first:border-l-0 md:first:pl-0">
              <dt className="eyebrow order-2 mt-3 text-muted">{stat.label}</dt>
              <dd className="font-editorial text-[clamp(2.75rem,5vw,4rem)] leading-none text-brandBlue">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
