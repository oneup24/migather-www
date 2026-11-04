import { useState } from 'react';
import { CONTACT } from '../../data/site';
import { content } from '../../data/content';
import { useLocale } from '../../hooks/useLocale';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

/**
 * Enquiry form.
 *
 * ⚠ The delivery endpoint is not configured yet — `CONTACT.formEndpoint` in
 * `src/data/site.js` still holds a placeholder. Until it is wired to a real
 * handler (or a form service), submitting shows a notice rather than
 * silently discarding the enquiry. See `docs/LAUNCH_CHECKLIST.md`.
 */

const FIELDS = [
  { name: 'name', type: 'text', required: true },
  { name: 'company', type: 'text', required: false },
  { name: 'email', type: 'email', required: true },
  { name: 'phone', type: 'tel', required: false },
];

export default function ContactForm() {
  const { t } = useLocale();
  const c = content.contact.form;
  const [status, setStatus] = useState('idle');

  const configured =
    CONTACT.formEndpoint && !CONTACT.formEndpoint.startsWith('[placeholder');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!configured) {
      setStatus('not-configured');
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch(CONTACT.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
      });
      setStatus(response.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const label = (key) => t(c[key]);
  const required = t(c.required);

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label
              htmlFor={`contact-${field.name}`}
              className="block eyebrow text-muted mb-2"
            >
              {label(field.name)}
              {field.required && <span className="text-brandCrimson ml-1">*</span>}
            </label>
            <input
              id={`contact-${field.name}`}
              name={field.name}
              type={field.type}
              required={field.required}
              aria-required={field.required}
              className="w-full border border-rule bg-white px-4 py-3 text-ink text-[15px] font-body rounded-sm focus:border-brandBlue focus:outline-none transition-colors placeholder:text-muted/60"
            />
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="contact-market" className="block eyebrow text-muted mb-2">
          {label('market')}
        </label>
        <select
          id="contact-market"
          name="market"
          defaultValue=""
          className="w-full border border-rule bg-white px-4 py-3 text-ink text-[15px] font-body rounded-sm focus:border-brandBlue focus:outline-none transition-colors"
        >
          <option value="" disabled>
            —
          </option>
          <option value="Hong Kong">Hong Kong</option>
          <option value="Mainland China">Mainland China</option>
          <option value="Southeast Asia">Southeast Asia</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="block eyebrow text-muted mb-2">
          {label('message')}
          <span className="text-brandCrimson ml-1">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          aria-required="true"
          className="w-full border border-rule bg-white px-4 py-3 text-ink text-[15px] font-body rounded-sm focus:border-brandBlue focus:outline-none transition-colors resize-y"
        />
      </div>

      <div className="flex flex-wrap items-center gap-5 pt-1">
        <Button type="submit" variant="primary" size="lg" disabled={status === 'sending'}>
          {label('submit')}
        </Button>
        <p className="text-[12px] text-muted max-w-xs leading-relaxed">{label('privacyNote')}</p>
      </div>

      {status === 'not-configured' && (
        <p
          role="status"
          className="border-l-2 border-brandCrimson bg-brandCrimsonPale px-4 py-3 text-[14px] text-ink"
        >
          {label('notConfigured')}
        </p>
      )}

      {status === 'sent' && (
        <p
          role="status"
          className="border-l-2 border-brandBlue bg-brandBluePale px-4 py-3 text-[14px] text-ink"
        >
          {t({
            en: 'Thank you — your enquiry has been sent.',
            'zh-Hant': '多謝——你的查詢已送出。',
            'zh-Hans': '多谢——你的查询已送出。',
          })}
        </p>
      )}

      {status === 'error' && (
        <p
          role="status"
          className={cn(
            'border-l-2 border-brandCrimson bg-brandCrimsonPale px-4 py-3 text-[14px] text-ink',
          )}
        >
          {t({
            en: 'Something went wrong sending that. Please try again.',
            'zh-Hant': '傳送時出現問題，請再試一次。',
            'zh-Hans': '传送时出现问题，请再试一次。',
          })}
        </p>
      )}
    </form>
  );
}
