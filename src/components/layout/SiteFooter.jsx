import { Link } from 'react-router-dom';
import { hasMockUpCases } from '../../data/cases';
import { content } from '../../data/content';
import { footerNav, legalNav, offices, site } from '../../data/site';
import { mockUpNotice } from '../../data/media';
import { useLocale } from '../../hooks/useLocale';
import Logo from '../ui/Logo';

export default function SiteFooter() {
  const { path, t } = useLocale();

  // The standing disclosure stays only while at least one published case
  // still carries generated artwork. When the last mock-up is replaced with
  // real client photography, the disclosure retires by itself.
  const showMockUpNotice = hasMockUpCases();

  return (
    <footer className="bg-night px-6 pt-20 pb-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link to={path('/')} className="inline-block">
              <Logo className="text-white" />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              {t(content.common.footerTagline)}
            </p>
          </div>

          {Object.entries(footerNav).map(([group, items]) => (
            <nav key={group} className="md:col-span-2">
              <h4 className="eyebrow mb-5 text-white/40">{group}</h4>
              <ul className="space-y-3 text-sm">
                {items.map((item) => (
                  <li key={item.to + item.label.en}>
                    <Link to={path(item.to)} className="text-white/70 transition-colors hover:text-white">
                      {t(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="md:col-span-4">
            <h4 className="eyebrow mb-5 text-white/40">{t(content.contact.officesTitle)}</h4>
            <ul className="space-y-3 text-sm text-white/70">
              {offices.map((office) => (
                <li key={office.city.en} className="flex items-baseline justify-between gap-4">
                  <span className="text-white/90">{t(office.city)}</span>
                  <span className="text-xs text-white/45">{t(office.role)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-white/45">{t(content.about.officesLede)}</p>
          </div>
        </div>

        {/* The mock-up disclosure. Every photograph in this build is generated
            placeholder artwork, and the site must not be published without
            saying so — for as long as that is true of the work pages. */}
        {showMockUpNotice && (
          <p className="mt-16 border-t border-white/10 pt-7 text-[12px] leading-relaxed text-white/45">
            {t(mockUpNotice)}
          </p>
        )}

        <div className="mt-6 flex flex-col items-start justify-between gap-4 text-xs text-white/45 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} {site.legalName}. {site.legalName} is a Hong Kong company.
          </p>
          <div className="flex flex-wrap gap-6">
            {legalNav.map((item) => (
              <Link key={item.to} to={path(item.to)} className="transition-colors hover:text-white">
                {t(item.label)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
