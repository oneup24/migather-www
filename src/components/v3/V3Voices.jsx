import { testimonials } from '../../data/clients';
import { content } from '../../data/content';
import { contentV3 } from '../../data/content.v3';
import { useLocale } from '../../hooks/useLocale';
import Editorial from './Editorial';

/**
 * Client voices.
 *
 * Four quotes, set in the editorial serif with hairline rules between
 * them. The attribution is printed exactly as the credential deck prints
 * it — name, job title, company — because a quote without its source is
 * an anonymous quote.
 *
 * This section sat on the homepage until November 2026; it now closes the
 * About page, where the rest of the client material lives.
 */
export default function V3Voices() {
  const { t } = useLocale();

  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Editorial label={t(contentV3.labels.voices)} statement={t(content.about.testimonialsTitle)} />

        <div className="mt-16 grid gap-x-12 gap-y-14 sm:grid-cols-2">
          {testimonials.map((item) => (
            <figure key={item.id} className="border-t border-rule pt-7">
              <blockquote className="font-editorial text-[19px] leading-[1.5] font-normal text-ink md:text-[21px]">
                “{t(item.quote)}”
              </blockquote>
              <figcaption className="mt-6">
                <div className="font-display text-[15px] font-medium text-ink">{item.author}</div>
                <div className="mt-1 text-[13.5px] text-charcoal">{t(item.role)}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
