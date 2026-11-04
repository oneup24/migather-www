import { Link } from 'react-router-dom';
import { content } from '../data/content';
import { useLocale } from '../hooks/useLocale';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function NotFoundPage() {
  const { locale, path, t } = useLocale();
  const c = content.notFound;

  useDocumentMeta({
    title: t(c.title),
    path: `/${locale}`,
  });

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="editorial">
          <div className="editorial-label">{t(c.eyebrow)}</div>
          <div>
            <h1 className="editorial-statement editorial-statement--lg">{t(c.title)}</h1>
            <p className="editorial-lede mt-8">{t(c.lede)}</p>
            <div className="mt-10 flex flex-wrap gap-6">
              <Link to={path('/')} className="link-line">
                {t(c.cta)}
              </Link>
              <Link to={path('/work')} className="link-line">
                {t(c.secondary)}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
