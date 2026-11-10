import { contentV3 } from '../../data/content.v3';
import { useLocale } from '../../hooks/useLocale';
import Editorial from './Editorial';

/**
 * The delivery spine — three outcomes in one numbered row, between the
 * client wall and the work grid.
 *
 * Shape taken from the reference about page ("Our Delivery — Inspiration.
 * Conversion. Retention."), re-authored for Migather: same three-outcome
 * rhythm, boutique voice, no scale claim. The third outcome is "Compound"
 * rather than "Retention" because compounding the learning is what a small
 * senior team actually does — a retention promise would be a number we do
 * not have.
 *
 * Rendered in the same editorial grammar as V3Principles: numeral in brand
 * crimson, title in the editorial serif, body in the running sans.
 */
export default function V3Delivery() {
  const { t } = useLocale();
  const delivery = contentV3.delivery;

  return (
    <section id="delivery" className="scroll-mt-24 bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Editorial label={t(delivery.label)} statement={t(delivery.title)} />

        <ul className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-3">
          {delivery.items.map((item) => (
            <li key={item.number} className="border-t border-rule pt-7">
              <div className="section-number">{item.number}</div>
              <h3 className="font-editorial mt-5 text-[22px] leading-snug font-normal text-ink">
                {t(item.name)}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-charcoal">{t(item.body)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
