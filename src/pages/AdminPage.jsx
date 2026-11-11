/**
 * The works editor.
 *
 * A page of the site, not a page of Google's. The editor signs in with
 * their own Google account, fills in the form, and presses Save. The sheet
 * is written as them, and the picture goes to the Drive folder through the
 * Apps Script, which runs as them and has storage quota.
 *
 * There is one button and one thing to wait for. Nothing here mentions
 * git, commits, workflows or the Actions tab — an editor has no reason to
 * know any of that exists.
 *
 * The page is not linked from the navigation and is marked noindex. It is
 * also useless to a stranger: the sheet itself only opens for the agency
 * account and the service account, and the allow-list in the sheet's
 * `settings` tab is checked on top of that.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  postToScript,
  readTabs,
  signIn,
  writeRowBySlug,
  writeTab,
} from '../lib/google-api';
import { useLocale } from '../hooks/useLocale';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { LOCALE_CODES } from '../data/i18n';
import { cms } from '../data/cms';

/* ── The configuration ────────────────────────────────────────────────── */


const CONFIG = cms;

const CASE_TABS = {
  en: 'cases_EN',
  'zh-Hant': 'cases_ZH-HANT',
  'zh-Hans': 'cases_ZH-HANS',
};

const RESULT_TABS = {
  en: 'results_EN',
  'zh-Hant': 'results_ZH-HANT',
  'zh-Hans': 'results_ZH-HANS',
};

const SCOPE_TABS = {
  en: 'scope_EN',
  'zh-Hant': 'scope_ZH-HANT',
  'zh-Hans': 'scope_ZH-HANS',
};

const CASE_COLUMNS = [
  'slug',
  'client',
  'clientLocal',
  'projectLocal',
  'sector',
  'services',
  'partnershipSince',
  'summary',
  'imageAlt',
  'image',
  'mockup',
  'source',
  'featured',
  'published',
];

const RESULT_COLUMNS = ['slug', 'order', 'value', 'label', 'note'];
const SCOPE_COLUMNS = ['slug', 'order', 'text'];

/** Every field is the same: a rule, a white ground, the display face. */
const INPUT =
  'block w-full border border-rule bg-white px-3 py-2 font-display text-[14px] text-ink';

/** The fields that are the same in every language. */
const SHARED = ['client', 'sector', 'services', 'source', 'image', 'mockup', 'featured', 'published'];

/* ── Small helpers ────────────────────────────────────────────────────── */

const isConfigured = Boolean(CONFIG.clientId && CONFIG.spreadsheetId && CONFIG.scriptUrl);

/** A row of a tab as an object. */
function rowsAsObjects(values) {
  const header = values?.[0] ?? [];
  return (values?.slice(1) ?? []).map((row) => {
    const object = {};
    header.forEach((column, index) => {
      object[column] = row[index] ?? '';
    });
    return object;
  });
}

/**
 * A value that may be a localised object or a plain string.
 *
 * The sheet holds plain strings — one language per tab — but the compiled
 * records hold `{ en, 'zh-Hant', 'zh-Hans' }`. The page reads the sheet, so
 * it should get a string; this makes it safe either way.
 */
function localisedValue(value, locale) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);
  return value[locale] ?? value.en ?? '';
}

/** A pause. */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** A file as base64, without the data-url prefix. */
function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const comma = result.indexOf(',');
      resolve(comma === -1 ? result : result.slice(comma + 1));
    };
    reader.onerror = () => reject(new Error('the file could not be read'));
    reader.readAsDataURL(file);
  });
}

/* ── The page ─────────────────────────────────────────────────────────── */

export default function AdminPage() {
  const { t, path } = useLocale();

  useDocumentMeta({
    title: t({
      en: 'Works editor',
      'zh-Hant': '案例編輯',
      'zh-Hans': '案例编辑',
    }),
    description: t({
      en: 'The Migather works editor.',
      'zh-Hant': 'Migather 案例編輯工具。',
      'zh-Hans': 'Migather 案例编辑工具。',
    }),
    noindex: true,
  });

  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  const [tabs, setTabs] = useState(null);
  const [editors, setEditors] = useState([]);
  const [slug, setSlug] = useState(null);
  const [locale, setLocale] = useState('en');
  const [form, setForm] = useState(null);
  const [results, setResults] = useState([]);
  const [scope, setScope] = useState([]);
  const [newFile, setNewFile] = useState(null);
  const fileInput = useRef(null);

  /* Sign in. */
  async function handleSignIn() {
    setError('');
    try {
      const signed = await signIn(CONFIG.clientId);
      setSession(signed);
      await loadSheet(signed.accessToken);
    } catch (failure) {
      setError(failure.message ?? String(failure));
    }
  }

  /* Read the whole sheet. */
  async function loadSheet(accessToken) {
    setBusy(true);
    try {
      const names = [
        ...LOCALE_CODES.map((l) => CASE_TABS[l]),
        ...LOCALE_CODES.map((l) => RESULT_TABS[l]),
        ...LOCALE_CODES.map((l) => SCOPE_TABS[l]),
        'settings',
      ];
      const values = await readTabs(CONFIG.spreadsheetId, accessToken, names);
      setTabs(values);

      const settings = rowsAsObjects(values.settings);
      const list = (settings.find((row) => row.key === 'editors')?.value ?? '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
      setEditors(list);

      const cases = rowsAsObjects(values[CASE_TABS[locale]]);
      if (cases.length && !slug) setSlug(cases[0].slug);
    } catch (failure) {
      setError(failure.message ?? String(failure));
    } finally {
      setBusy(false);
    }
  }

  /* Load one case into the form. */
  useEffect(() => {
    if (!tabs || !slug) return;
    const cases = rowsAsObjects(tabs[CASE_TABS[locale]]);
    const row = cases.find((entry) => entry.slug === slug);

    const values = row
      ? { ...row }
      : Object.fromEntries(CASE_COLUMNS.map((column) => [column, '']));

    setForm({
      slug,
      client: localisedValue(values.client, locale),
      clientLocal: localisedValue(values.clientLocal, locale),
      projectLocal: localisedValue(values.projectLocal, locale),
      sector: localisedValue(values.sector, locale) || 'finance',
      services: localisedValue(values.services, locale),
      partnershipSince: localisedValue(values.partnershipSince, locale),
      summary: localisedValue(values.summary, locale),
      imageAlt: localisedValue(values.imageAlt, locale),
      image: values.image ?? '',
      mockup: values.mockup !== 'false',
      source: localisedValue(values.source, locale),
      featured: values.featured === 'true',
      published: values.published === 'true',
    });

    setResults(
      rowsAsObjects(tabs[RESULT_TABS[locale]])
        .filter((entry) => entry.slug === slug)
        .sort((a, b) => Number(a.order) - Number(b.order))
        .map((entry) => ({ value: entry.value ?? '', label: entry.label ?? '', note: entry.note ?? '' })),
    );

    setScope(
      rowsAsObjects(tabs[SCOPE_TABS[locale]])
        .filter((entry) => entry.slug === slug)
        .sort((a, b) => Number(a.order) - Number(b.order))
        .map((entry) => entry.text ?? ''),
    );

    setNewFile(null);
  }, [tabs, slug, locale]);

  const caseList = useMemo(() => {
    if (!tabs) return [];
    return rowsAsObjects(tabs[CASE_TABS[locale]]).map((row) => ({
      slug: row.slug,
      client: row.client || row.slug,
      published: row.published === 'true',
    }));
  }, [tabs, locale]);

  const allowed = session ? editors.includes(session.email.toLowerCase()) : false;

  /* ── Saving ─────────────────────────────────────────────────────────── */

  async function handleSave() {
    if (!session || !form) return;
    setBusy(true);
    setError('');
    setNotice('');

    try {
      const token = session.accessToken;

      /* The picture goes to Drive through the Apps Script, which runs as the
         editor and has storage quota. The browser names the file. */
      let imageName = form.image;
      if (newFile) {
        imageName = `${form.slug}${newFile.name.slice(newFile.name.lastIndexOf('.'))}`;
        const base64 = await readAsBase64(newFile);
        await postToScript(CONFIG.scriptUrl, {
          action: 'image',
          slug: form.slug,
          fileName: imageName,
          dataUrl: `data:${newFile.type || 'image/jpeg'};base64,${base64}`,
        });
      }

      const published = form.published ? 'true' : 'false';

      /* The case row, in every language. The copy of this language is
         written here; the shared fields are written everywhere, because the
         sync refuses to compile a case whose tabs disagree. */
      for (const each of LOCALE_CODES) {
        const existing = rowsAsObjects(tabs[CASE_TABS[each]]).find((r) => r.slug === form.slug);
        const row = {
          slug: form.slug,
          client: form.client,
          clientLocal: form.clientLocal,
          projectLocal: form.projectLocal,
          sector: form.sector,
          services: form.services,
          partnershipSince: form.partnershipSince,
          summary: each === locale ? form.summary : (existing?.summary ?? ''),
          imageAlt: each === locale ? form.imageAlt : (existing?.imageAlt ?? ''),
          image: imageName,
          mockup: form.mockup ? 'true' : 'false',
          source: form.source,
          featured: form.featured ? 'true' : 'false',
          published,
        };
        await writeRowBySlug(CONFIG.spreadsheetId, token, CASE_TABS[each], CASE_COLUMNS, row);
      }

      /* The results. */
      await writeResults(token, form.slug, locale, results);
      /* The scope lines. */
      await writeScope(token, form.slug, locale, scope);

      setNotice(
        t({
          en: 'Saved. The sheet is up to date.',
          'zh-Hant': '已儲存。表格已更新。',
          'zh-Hans': '已保存。表格已更新。',
        }),
      );
      await loadSheet(token);
    } catch (failure) {
      setError(failure.message ?? String(failure));
    } finally {
      setBusy(false);
    }
  }

  async function writeResults(token, caseSlug, eachLocale, list) {
    const tab = RESULT_TABS[eachLocale];
    const values = await readTabs(CONFIG.spreadsheetId, token, [tab]);
    const header = values[tab]?.[0] ?? RESULT_COLUMNS;
    const kept = (values[tab] ?? []).filter((row, index) => index === 0 || row[0] !== caseSlug);
    const block = list
      .filter((entry) => entry.value || entry.label)
      .map((entry, index) => [
        caseSlug,
        String(index + 1),
        entry.value,
        entry.label,
        entry.note,
      ]);
    await writeTab(CONFIG.spreadsheetId, token, tab, [header, ...block, ...kept.slice(1)]);
  }

  async function writeScope(token, caseSlug, eachLocale, lines) {
    const tab = SCOPE_TABS[eachLocale];
    const values = await readTabs(CONFIG.spreadsheetId, token, [tab]);
    const header = values[tab]?.[0] ?? SCOPE_COLUMNS;
    const kept = (values[tab] ?? []).filter((row, index) => index === 0 || row[0] !== caseSlug);
    const block = lines
      .filter((text) => text.trim())
      .map((text, index) => [caseSlug, String(index + 1), text]);
    await writeTab(CONFIG.spreadsheetId, token, tab, [header, ...block, ...kept.slice(1)]);
  }

  /* ── Publishing ─────────────────────────────────────────────────────── */

  /**
   * Ask for a rebuild, and find out whether it worked.
   *
   * The Apps Script cannot be read from the browser, so it reports back by
   * writing into the sheet's `settings` tab: `lastPublish` is stamped when
   * the request goes out, and `lastPublishStatus` when the build has
   * finished. The page watches that, so "Published" means published — not
   * "hopefully".
   */
  async function handlePublish() {
    setBusy(true);
    setError('');
    setNotice('');
    setProgress(
      t({ en: 'Asking the site to rebuild…', 'zh-Hant': '正在要求網站重新建置…', 'zh-Hans': '正在要求网站重新构建…' }),
    );

    try {
      const before = await readSetting(session.accessToken, 'lastPublish');

      /* The sheet records that a publish was asked for. It is what lets the
         script tell a real request from a stranger who found its address:
         only somebody who can write to the sheet can set it. */
      await writeSetting(session.accessToken, 'publishRequested', new Date().toISOString());

      await postToScript(CONFIG.scriptUrl, { action: 'publish' });

      /* The script stamps `lastPublish` the moment it dispatches, and
         `lastPublishStatus` when the build has finished. Watch both, and
         say what is actually happening — a blank wait that ends in a
         cheerful message is worse than an honest one. */
      const deadline = Date.now() + 240000;
      let stamp = '';

      while (Date.now() < deadline) {
        await sleep(2000);
        stamp = await readSetting(session.accessToken, 'lastPublish');
        if (stamp && stamp !== before) break;
        setProgress(
          t({
            en: 'Waiting for the build to start…',
            'zh-Hant': '等待建置開始…',
            'zh-Hans': '等待构建开始…',
          }),
        );
      }

      if (!stamp || stamp === before) {
        setProgress('');
        setError(
          t({
            en: 'The publish did not report back. The Apps Script that is live does not know how to publish — it has to be redeployed.',
            'zh-Hant': '發佈沒有回報。現行的 Apps Script 不懂得發佈，需要重新部署。',
            'zh-Hans': '发布没有回报。现行的 Apps Script 不懂得发布，需要重新部署。',
          }),
        );
        return;
      }

      setProgress(
        t({ en: 'The build is running…', 'zh-Hant': '建置進行中…', 'zh-Hans': '构建进行中…' }),
      );

      while (Date.now() < deadline) {
        await sleep(2000);
        const status = await readSetting(session.accessToken, 'lastPublishStatus');
        if (status === 'ok') {
          setProgress('');
          setNotice(
            t({
              en: 'Published. The site is rebuilding now — it will be live in a minute or two.',
              'zh-Hant': '已發佈。網站正在重新建置，約一兩分鐘後上線。',
              'zh-Hans': '已发布。网站正在重新构建，约一两分钟后上线。',
            }),
          );
          return;
        }
        if (status === 'failed') {
          setProgress('');
          setError(
            t({
              en: 'The build failed. Open the Actions tab on GitHub to see why.',
              'zh-Hant': '建置失敗。請到 GitHub 的 Actions 分頁查看原因。',
              'zh-Hans': '构建失败。请到 GitHub 的 Actions 标签页查看原因。',
            }),
          );
          return;
        }
        if (status === 'unknown') {
          setProgress('');
          setError(
            t({
              en: 'The build did not start — the GitHub token in the Apps Script may have expired.',
              'zh-Hant': '建置沒有開始——Apps Script 內的 GitHub token 可能已過期。',
              'zh-Hans': '构建没有开始——Apps Script 里的 GitHub token 可能已过期。',
            }),
          );
          return;
        }
      }

      setProgress('');
      setNotice(
        t({
          en: 'The build is running. The site will be live in a minute or two.',
          'zh-Hant': '建置進行中，網站約一兩分鐘後上線。',
          'zh-Hans': '构建进行中，网站约一两分钟后上线。',
        }),
      );
    } catch (failure) {
      setProgress('');
      setError(failure.message ?? String(failure));
    } finally {
      setBusy(false);
    }
  }

  /** Read one row of the settings tab. */
  async function readSetting(accessToken, key) {
    const values = await readTabs(CONFIG.spreadsheetId, accessToken, ['settings']);
    const row = rowsAsObjects(values.settings).find((entry) => entry.key === key);
    return row?.value ?? '';
  }

  /** Write one row of the settings tab. */
  async function writeSetting(accessToken, key, value) {
    const values = await readTabs(CONFIG.spreadsheetId, accessToken, ['settings']);
    const rows = values.settings ?? [];
    const header = rows[0] ?? ['key', 'value'];

    const existing = rows.findIndex((row, index) => index > 0 && row[0] === key);
    if (existing === -1) {
      await writeTab(CONFIG.spreadsheetId, accessToken, 'settings', [
        header,
        ...rows.slice(1),
        [key, String(value)],
      ]);
      return;
    }

    const range = `settings!B${existing + 1}`;
    await writeTab(CONFIG.spreadsheetId, accessToken, range, [[String(value)]]);
  }

  /* ── The page ───────────────────────────────────────────────────────── */

  if (!isConfigured) {
    return (
      <Shell>
        <h1 className="font-editorial text-[clamp(2rem,4vw,3rem)] leading-tight font-normal text-ink">
          Works editor
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-charcoal">
          This build has no editor configured. The sheet id, the OAuth client id and the
          Apps Script address are read from the build environment — see{' '}
          <code className="text-[13px]">docs/CMS.md</code>.
        </p>
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <h1 className="font-editorial text-[clamp(2rem,4vw,3rem)] leading-tight font-normal text-ink">
          Works editor
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-charcoal">
          Sign in with your Migather account to edit the works pages. Nothing is shared with
          anyone else, and the sign-in is not stored — closing the tab forgets it.
        </p>
        <div className="mt-8 flex flex-col items-start gap-4">
          <div id="google-signin" />
          <button
            type="button"
            onClick={handleSignIn}
            className="font-display text-[14px] font-medium text-brandBlue underline underline-offset-4"
          >
            Sign in
          </button>
        </div>
        {error && <Message kind="bad">{error}</Message>}
      </Shell>
    );
  }

  if (!allowed) {
    return (
      <Shell>
        <h1 className="font-editorial text-[clamp(2rem,4vw,3rem)] leading-tight font-normal text-ink">
          Works editor
        </h1>
        <Message kind="bad">
          You are signed in as {session.email}. That account is not on the editor list, so
          nothing here can be changed.
        </Message>
        <p className="mt-4 text-[13px] text-muted">
          The list is on the <code>settings</code> tab of the sheet. Ask whoever looks after
          the site to add this address.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="eyebrow text-muted">
            {t({ en: 'The works', 'zh-Hant': '案例', 'zh-Hans': '案例' })}
          </div>
          <h1 className="font-editorial mt-3 text-[clamp(2rem,4vw,3rem)] leading-tight font-normal text-ink">
            {t({ en: 'Editor', 'zh-Hant': '編輯', 'zh-Hans': '编辑' })}
          </h1>
        </div>
        <div className="text-[13px] text-muted">
          {t({ en: 'Signed in as', 'zh-Hant': '登入為', 'zh-Hans': '登录为' })}{' '}
          <span className="text-ink">{session.email}</span>
        </div>
      </div>

      {error && <Message kind="bad">{error}</Message>}
      {notice && <Message kind="ok">{notice}</Message>}

      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        {/* The case list. */}
        <div>
          <label className="eyebrow text-muted" htmlFor="case-picker">
            {t({ en: 'Case', 'zh-Hant': '案例', 'zh-Hans': '案例' })}
          </label>
          <select
            id="case-picker"
            value={slug ?? ''}
            onChange={(event) => setSlug(event.target.value)}
            className={`mt-3 ${INPUT}`}
          >
            {caseList.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.client}
              </option>
            ))}
          </select>

          <label className="eyebrow mt-8 block text-muted" htmlFor="locale-picker">
            {t({ en: 'Language', 'zh-Hant': '語言', 'zh-Hans': '语言' })}
          </label>
          <select
            id="locale-picker"
            value={locale}
            onChange={(event) => setLocale(event.target.value)}
            className={`mt-3 ${INPUT}`}
          >
            <option value="en">English</option>
            <option value="zh-Hant">繁體中文</option>
            <option value="zh-Hans">简体中文</option>
          </select>

          <p className="mt-8 text-[13px] leading-relaxed text-muted">
            {t({
              en: 'One language at a time. The shared fields — client, sector, categories, source, image — are written to all three.',
              'zh-Hant': '每次編輯一種語言。共用欄位（客戶、範疇、分類、來源、圖片）會同時寫入三種語言。',
              'zh-Hans': '每次编辑一种语言。共用字段（客户、范畴、分类、来源、图片）会同时写入三种语言。',
            })}
          </p>
        </div>

        {/* The form. */}
        {form && (
          <div>
            <Field label={t({ en: 'Client', 'zh-Hant': '客戶', 'zh-Hans': '客户' })}>
              <input
                type="text"
                className={INPUT}
                value={form.client}
                onChange={(event) => setForm({ ...form, client: event.target.value })}
              />
            </Field>

            <Field
              label={t({ en: 'Client, local name', 'zh-Hant': '客戶本地名稱', 'zh-Hans': '客户本地名称' })}
            >
              <input
                type="text"
                className={INPUT}
                value={form.clientLocal}
                onChange={(event) => setForm({ ...form, clientLocal: event.target.value })}
              />
            </Field>

            <Field label={t({ en: 'Sector', 'zh-Hant': '範疇', 'zh-Hans': '范畴' })}>
              <input
                type="text"
                className={INPUT}
                value={form.sector}
                onChange={(event) => setForm({ ...form, sector: event.target.value })}
              />
            </Field>

            <Field
              label={t({ en: 'Categories', 'zh-Hant': '分類', 'zh-Hans': '分类' })}
              hint={t({
                en: 'The service keys, separated by commas.',
                'zh-Hant': '服務項目代碼，用逗號分隔。',
                'zh-Hans': '服务项目代码，用逗号分隔。',
              })}
            >
              <input
                type="text"
                className={INPUT}
                value={form.services}
                onChange={(event) => setForm({ ...form, services: event.target.value })}
              />
            </Field>

            <Field
              label={t({ en: 'Partner since', 'zh-Hant': '合作開始', 'zh-Hans': '合作开始' })}
            >
              <input
                type="text"
                className={INPUT}
                value={form.partnershipSince}
                onChange={(event) => setForm({ ...form, partnershipSince: event.target.value })}
              />
            </Field>

            <Field label={t({ en: 'Summary', 'zh-Hant': '摘要', 'zh-Hans': '摘要' })}>
              <textarea
                rows={4}
                className={INPUT}
                value={form.summary}
                onChange={(event) => setForm({ ...form, summary: event.target.value })}
              />
            </Field>

            <Field
              label={t({ en: 'Source', 'zh-Hant': '來源', 'zh-Hans': '来源' })}
              hint={t({
                en: 'The deck and slide this came from. Required — a case with no source will not publish.',
                'zh-Hant': '簡報及頁碼。必須填寫——沒有來源的案例無法發佈。',
                'zh-Hans': '简报及页码。必须填写——没有来源的案例无法发布。',
              })}
            >
              <input
                type="text"
                className={INPUT}
                value={form.source}
                onChange={(event) => setForm({ ...form, source: event.target.value })}
              />
            </Field>

            <Field
              label={t({ en: 'Alt text', 'zh-Hant': '替代文字', 'zh-Hans': '替代文字' })}
              hint={t({
                en: 'Describe the picture. Do not type “mock-up” — the site adds that word itself.',
                'zh-Hant': '描述圖片。不用輸入「樣機」——網站會自行加上。',
                'zh-Hans': '描述图片。不用输入「样机」——网站会自行加上。',
              })}
            >
              <input
                type="text"
                className={INPUT}
                value={form.imageAlt}
                onChange={(event) => setForm({ ...form, imageAlt: event.target.value })}
              />
            </Field>

            <Field
              label={t({ en: 'Is it a mock-up?', 'zh-Hant': '是樣機嗎？', 'zh-Hans': '是样机吗？' })}
              hint={t({
                en: 'A mock-up is labelled on screen and in the alt text. Real photography is not.',
                'zh-Hant': '樣機會在畫面上和替代文字中標示。實拍則不會。',
                'zh-Hans': '样机会在画面上和替代文字中标示。实拍则不会。',
              })}
            >
              <select
                className={INPUT}
                value={form.mockup ? 'true' : 'false'}
                onChange={(event) => setForm({ ...form, mockup: event.target.value === 'true' })}
              >
                <option value="true">
                  {t({ en: 'Yes — generated artwork', 'zh-Hant': '是——生成 artwork', 'zh-Hans': '是——生成 artwork' })}
                </option>
                <option value="false">
                  {t({ en: 'No — real photography', 'zh-Hant': '否——實拍', 'zh-Hans': '否——实拍' })}
                </option>
              </select>
            </Field>

            <Field
              label={t({ en: 'The picture', 'zh-Hant': '圖片', 'zh-Hans': '图片' })}
              hint={
                newFile
                  ? t({
                      en: `Ready to upload: ${newFile.name}`,
                      'zh-Hant': `準備上載：${newFile.name}`,
                      'zh-Hans': `准备上传：${newFile.name}`,
                    })
                  : t({
                      en: form.image
                        ? `Current file: ${form.image}`
                        : 'No picture yet.',
                      'zh-Hant': form.image ? `現有檔案：${form.image}` : '尚未有圖片。',
                      'zh-Hans': form.image ? `现有文件：${form.image}` : '尚未有图片。',
                    })
              }
            >
              <input
                ref={fileInput}
                type="file"
                className="block w-full font-display text-[13px] text-ink"
                accept="image/*"
                onChange={(event) => setNewFile(event.target.files?.[0] ?? null)}
              />
            </Field>

            <div className="mt-8">
              <div className="eyebrow text-muted">
                {t({ en: 'The results', 'zh-Hant': '成效', 'zh-Hans': '成效' })}
              </div>
              <div className="mt-4 space-y-3">
                {results.map((entry, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[120px_1fr_1fr]">
                    <input
                      type="text"
                      className={INPUT}
                      placeholder="+38%"
                      value={entry.value}
                      onChange={(event) => {
                        const next = [...results];
                        next[index] = { ...entry, value: event.target.value };
                        setResults(next);
                      }}
                    />
                    <input
                      type="text"
                      className={INPUT}
                      placeholder={t({ en: 'The label', 'zh-Hant': '說明', 'zh-Hans': '说明' })}
                      value={entry.label}
                      onChange={(event) => {
                        const next = [...results];
                        next[index] = { ...entry, label: event.target.value };
                        setResults(next);
                      }}
                    />
                    <input
                      type="text"
                      className={INPUT}
                      placeholder={t({ en: 'A note', 'zh-Hant': '附註', 'zh-Hans': '附注' })}
                      value={entry.note}
                      onChange={(event) => {
                        const next = [...results];
                        next[index] = { ...entry, note: event.target.value };
                        setResults(next);
                      }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setResults([...results, { value: '', label: '', note: '' }])}
                  className="font-display text-[13px] text-brandBlue underline underline-offset-4"
                >
                  {t({ en: 'Add a result', 'zh-Hant': '新增成效', 'zh-Hans': '新增成效' })}
                </button>
              </div>
            </div>

            <div className="mt-8">
              <div className="eyebrow text-muted">
                {t({ en: 'The scope', 'zh-Hant': '工作範圍', 'zh-Hans': '工作范围' })}
              </div>
              <div className="mt-4 space-y-3">
                {scope.map((line, index) => (
                  <input
                    key={index}
                    type="text"
                    className={INPUT}
                    value={line}
                    onChange={(event) => {
                      const next = [...scope];
                      next[index] = event.target.value;
                      setScope(next);
                    }}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setScope([...scope, ''])}
                  className="font-display text-[13px] text-brandBlue underline underline-offset-4"
                >
                  {t({ en: 'Add a line', 'zh-Hant': '新增一行', 'zh-Hans': '新增一行' })}
                </button>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-rule pt-8">
              <button
                type="button"
                onClick={handleSave}
                disabled={busy}
                className="bg-brandBlue px-6 py-3 font-display text-[14px] font-medium text-white disabled:opacity-50"
              >
                {t({ en: 'Save', 'zh-Hant': '儲存', 'zh-Hans': '保存' })}
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={busy}
                className="border border-ink bg-white px-6 py-3 font-display text-[14px] font-medium text-ink disabled:opacity-50"
              >
                {t({ en: 'Publish to the site', 'zh-Hant': '發佈到網站', 'zh-Hans': '发布到网站' })}
              </button>
              {(progress || busy) && (
                <span className="text-[13px] text-muted">
                  {progress ||
                    t({ en: 'Working…', 'zh-Hant': '處理中…', 'zh-Hans': '处理中…' })}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ── The pieces ───────────────────────────────────────────────────────── */

function Shell({ children }) {
  return (
    <div className="min-h-[70vh] bg-paper px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="mt-6 block">
      <span className="eyebrow text-muted">{label}</span>
      <div className="mt-2">{children}</div>
      {hint && <span className="mt-2 block text-[12.5px] leading-relaxed text-muted">{hint}</span>}
    </label>
  );
}

function Message({ kind, children }) {
  return (
    <p
      className={`mt-6 border-l-2 px-4 py-3 text-[14px] leading-relaxed ${
        kind === 'bad'
          ? 'border-brandCrimson bg-brandCrimson/5 text-ink'
          : 'border-brandBlue bg-brandBlue/5 text-ink'
      }`}
    >
      {children}
    </p>
  );
}
