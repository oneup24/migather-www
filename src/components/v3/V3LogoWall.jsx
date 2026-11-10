import { Fragment } from 'react';
import { clients } from '../../data/clients';
import { content } from '../../data/content';
import { contentV3 } from '../../data/content.v3';
import { clientLogos } from '../../data/media';
import { useLocale } from '../../hooks/useLocale';

/**
 * The client wall — the second section of the homepage.
 *
 * The client names used to scroll past on a single line. The section is now
 * built the way the reference site the client pointed at does it: a small
 * caps label, the client claim set large, and the marks below.
 *
 * The marks sit in two rows that travel right to left, continuously, so the
 * section keeps moving without the reader having to scroll it. Each row is
 * drawn twice — the second copy is the one that carries the loop, and it is
 * hidden from assistive technology, so the wall is read once.
 *
 * Every mark is the client's own — fetched from the brand, from Wikimedia or
 * from our credential deck (see `tools/media/fetch-client-logos.py`). Four
 * clients publish no mark we could fetch honestly, so their cell carries
 * the name in the house display face instead of an image; the grid is set
 * so a wordmark and a mark sit at the same weight.
 *
 * The alt text is the brand's own name, which does not change with the
 * language.
 */
export default function V3LogoWall() {
  const { t } = useLocale();
  const proof = content.home.proof;

  // The two rows are interleaved, so a sector never lines up with itself.
  // A client marked `wall: false` is on the roster and in the case list,
  // but is not shown here.
  const wall = clients.filter((client) => client.wall !== false);
  const rows = [
    wall.filter((_, index) => index % 2 === 0),
    wall.filter((_, index) => index % 2 === 1),
  ];

  const cell = (client, hidden) => {
    const logo = clientLogos[client.slug];
    return (
      <li
        key={client.slug}
        className="flex h-11 shrink-0 items-center justify-center px-7 sm:px-9"
        aria-hidden={hidden ? 'true' : undefined}
      >
        {logo ? (
          <img
            src={logo.src}
            alt={hidden ? undefined : client.name}
            loading="lazy"
            decoding="async"
            className="max-h-8 max-w-[9.5rem] object-contain"
          />
        ) : (
          <span className="font-display text-[13px] font-medium tracking-[0.08em] text-charcoal uppercase">
            {client.name}
          </span>
        )}
      </li>
    );
  };

  return (
    <section
      id="clients"
      aria-label={t(contentV3.labels.clients)}
      className="scroll-mt-24 border-y border-rule bg-paper py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="h-px w-10 bg-brandCrimson/60" />
          <span className="font-display text-[clamp(1.05rem,1.7vw,1.45rem)] font-medium uppercase tracking-[0.16em] text-ink">
            {t(contentV3.labels.clients)}
          </span>
        </div>

        <p className="mt-6 max-w-3xl text-[16px] leading-relaxed text-charcoal md:text-[17px]">
          {proof.figures.map((figure, index) => (
            <Fragment key={figure.value}>
              {index > 0 && (
                <span aria-hidden="true" className="px-2 text-rule">
                  ·
                </span>
              )}
              <span className="font-display text-brandBlue">{figure.value}</span>{' '}
              {t(figure.label)}
            </Fragment>
          ))}
        </p>
      </div>

      <div className="logo-wall mt-12">
        {rows.map((row) => (
          <div key={row[0].slug} className="logo-wall__row">
            <ul className="logo-wall__track">
              {row.map((client) => cell(client, false))}
            </ul>
            <ul className="logo-wall__track" aria-hidden="true">
              {row.map((client) => cell(client, true))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <p className="mt-12 border-t border-rule pt-5 text-[12.5px] leading-relaxed text-muted">
          {t(contentV3.labels.markOwner)}
        </p>
      </div>
    </section>
  );
}
