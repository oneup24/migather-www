import { content } from '../../data/content';
import { contentV3 } from '../../data/content.v3';
import { features } from '../../data/media';
import { markets } from '../../data/site';
import { useLocale } from '../../hooks/useLocale';
import Editorial from './Editorial';
import MockUpTag from './MockUpTag';

/**
 * Who we work with, and where.
 *
 * The statement carries the claim; the vertical image beside it is
 * generated placeholder artwork and says so. The market list below uses
 * Capsule48's small-caps two-column grammar rather than cards.
 */
export default function V3Clients() {
  const { t } = useLocale();
  const proof = content.home.proof;
  const image = features.manifesto;

  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Editorial
              label={t(contentV3.labels.clients)}
              statement={t(proof.title)}
              lede={t(proof.lede)}
            />
          </div>

          <figure className="lg:col-span-5">
            <div className="frame relative aspect-[3/4]">
              <img
                src={image.src}
                alt={t(image.alt)}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <MockUpTag />
            </div>
          </figure>
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="editorial-label">{t(contentV3.labels.markets)}</div>
          </div>
          <div className="lg:col-span-9">
            <ul className="service-list">
              {markets.map((market) => (
                <li key={market.name.en}>
                  <div className="service-list__item">{t(market.name)}</div>
                  <p className="mt-2 max-w-md text-[14px] leading-relaxed text-charcoal">
                    {t(market.note)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
