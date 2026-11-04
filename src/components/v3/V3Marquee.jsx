import { Link } from 'react-router-dom';
import { clients } from '../../data/clients';
import { contentV3 } from '../../data/content.v3';
import { useLocale } from '../../hooks/useLocale';

/**
 * The client strip.
 *
 * The client wall is the one place where repetition earns its keep: 27
 * confirmed names scrolling past on their own line says "we work with
 * these" faster than any list.
 *
 * The list is rendered twice so the loop has no seam, and the duplicate is
 * hidden from assistive technology — the strip is read once.
 */
export default function V3Marquee() {
  const { t, path } = useLocale();

  const track = (hidden) => (
    <div className="marquee-track" aria-hidden={hidden ? 'true' : undefined}>
      {clients.map((client) => (
        <span key={client.name} className="marquee-item">
          <Link to={path('/work')} className="hover:text-brandBlue">
            {client.name}
          </Link>
          {client.local && <span className="marquee-item__local">{client.local}</span>}
        </span>
      ))}
    </div>
  );

  return (
    <section
      aria-label={t(contentV3.labels.clients)}
      className="border-y border-rule bg-paper py-9"
    >
      <div className="mx-auto mb-7 max-w-7xl px-6">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-brandCrimson/60" />
          <span className="eyebrow text-ink">{t(contentV3.labels.clients)}</span>
        </div>
      </div>

      <div className="marquee-mask overflow-hidden">
        <div className="marquee">
          {track(false)}
          {track(true)}
        </div>
      </div>
    </section>
  );
}
