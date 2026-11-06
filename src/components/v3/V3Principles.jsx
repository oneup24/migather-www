import { content } from '../../data/content';
import { contentV3 } from '../../data/content.v3';
import { useLocale } from '../../hooks/useLocale';
import Editorial from './Editorial';

/**
 * The numbered principles — GAIA's section numbering applied to the
 * things Migather does not compromise on.
 *
 * The homepage carries the first three, so the statement counts three
 * (`content.home.principles.homeTitle`); the About page carries all four
 * and keeps the four-count statement. The numeral is set light and large
 * in the brand crimson, the title in the editorial serif and the body in
 * the running sans. Nothing is boxed.
 */
export default function V3Principles() {
  const { t } = useLocale();
  const principles = content.home.principles;
  const items = principles.items.slice(0, 3);

  return (
    <section id="approach" className="scroll-mt-24 bg-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Editorial
          label={t(contentV3.labels.approach)}
          statement={t(principles.homeTitle)}
          lede={t(principles.lede)}
        />

        <ul className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
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
  );
}
