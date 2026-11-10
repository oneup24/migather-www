import { Link } from 'react-router-dom';
import { content } from '../../data/content';
import { allServices, serviceGroups } from '../../data/services';
import { useLocale } from '../../hooks/useLocale';

/**
 * The Services mega menu.
 *
 * One column per goal, with the add-ons as a fourth, and every service in
 * the menu a link to that service's own page — the same shape as a case
 * study, so a service can carry its own work and its own address.
 *
 * The panel is opened by the header, which owns the hover and focus
 * behaviour; this component only draws it.
 */
export default function ServicesMegaMenu({ onNavigate }) {
  const { t, path } = useLocale();
  const c = content.services;

  return (
    <div className="border-t border-rule bg-paper shadow-[0_28px_56px_-36px_rgba(0,0,0,0.5)]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {serviceGroups.map((group) => (
            <div key={group.key}>
              <div className="eyebrow text-brandCrimson">{t(group.label)}</div>
              <ul className="mt-4 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.key}>
                    <Link
                      to={path(`/services/${item.key}`)}
                      onClick={onNavigate}
                      className="text-[15px] leading-snug text-charcoal transition-colors hover:text-brandBlue"
                    >
                      {t(item.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
          <span className="text-[12.5px] text-muted">
            {allServices.length} {t(c.menu.serviceCount)} · 3 {t(c.menu.groupCount)}
          </span>
          <Link to={path('/services')} onClick={onNavigate} className="link-line">
            {t(c.menu.allServices)}
          </Link>
        </div>
      </div>
    </div>
  );
}
