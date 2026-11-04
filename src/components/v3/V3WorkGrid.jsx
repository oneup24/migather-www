import { Link } from 'react-router-dom';
import { sectors } from '../../data/cases';
import { caseImage } from '../../data/media';
import { useLocale } from '../../hooks/useLocale';
import { cn } from '../../lib/utils';
import MockUpTag from './MockUpTag';

/**
 * One case in the grid.
 *
 * The image is the interface — Capsule48's position, and the reason the
 * work page leads with pictures rather than cards. The caption carries the
 * client, the sector and the first sourced figure, because a grid of
 * photographs with no substance would be wallpaper.
 *
 * The image is generated placeholder artwork and carries a `MockUpTag`.
 */
export function CaseCard({ entry, className }) {
  const { t, path } = useLocale();
  const image = caseImage(entry.slug);
  const headline = entry.results?.[0];

  return (
    <article className={cn('group', className)}>
      <Link to={path(`/work/${entry.slug}`)} className="block">
        <div className="frame relative aspect-[4/3]">
          {image ? (
            <>
              <img
                src={image.src}
                alt={t(image.alt)}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <MockUpTag />
            </>
          ) : (
            <div className="absolute inset-0 bg-surface" aria-hidden="true" />
          )}
        </div>

        <div className="mt-5 flex items-start justify-between gap-5">
          <div className="min-w-0">
            <h3 className="font-display text-[17px] font-medium text-ink transition-colors group-hover:text-brandBlue">
              {entry.client}
            </h3>
            <p className="eyebrow mt-2 text-muted">{t(sectors[entry.sector].label)}</p>
          </div>

          {headline && (
            <div className="shrink-0 text-right">
              <div className="font-editorial text-[28px] leading-none text-brandBlue">
                {headline.value}
              </div>
              <div className="eyebrow mt-2 text-muted">{t(headline.label)}</div>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}

/**
 * The grid itself. `columns` is the desktop column count.
 */
export default function V3WorkGrid({ entries = [], columns = 3, className }) {
  const gridClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={cn('grid gap-x-8 gap-y-14', gridClass, className)}>
      {entries.map((entry) => (
        <CaseCard key={entry.slug} entry={entry} />
      ))}
    </div>
  );
}
