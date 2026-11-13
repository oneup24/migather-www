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
import { cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ensureTabs,
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
import { asset } from '../data/media';

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

/**
 * The tabs the frames live in — one per language, like every other copy.
 *
 * A frame is a second picture for the case: a file, a mock-up flag, and
 * alt text and a caption in each language.
 */
const GALLERY_TABS = {
  en: 'gallery_EN',
  'zh-Hant': 'gallery_ZH-HANT',
  'zh-Hans': 'gallery_ZH-HANS',
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
const GALLERY_COLUMNS = ['slug', 'order', 'file', 'alt', 'caption', 'mockup'];

/** How many frames a case may carry. The page shows three across. */
const GALLERY_MAX_FRAMES = 12;

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

/** The extension of a file name, lowercased and without the dot. */
function extensionOf(name) {
  const parts = String(name ?? '').split('.');
  if (parts.length < 2) return 'jpg';
  return parts.pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
}

/**
 * The frames of a case, lined up across the three languages.
 *
 * The file and the mock-up flag belong to the picture, so they are the same
 * in every language; the alt text and the caption are copy, and each
 * language carries its own. The frames are lined up by their order, and the
 * copy of every language is kept with its frame — so moving a frame does
 * not leave one language's words on another language's picture.
 */
function readGallery(tabs, slug) {
  const frames = new Map();

  for (const each of LOCALE_CODES) {
    for (const row of rowsAsObjects(tabs[GALLERY_TABS[each]])) {
      if (row.slug !== slug) continue;
      const order = Number(row.order || 0);
      if (!order) continue;

      let frame = frames.get(order);
      if (!frame) {
        frame = {
          order,
          file: '',
          mockup: true,
          alt: { en: '', 'zh-Hant': '', 'zh-Hans': '' },
          caption: { en: '', 'zh-Hant': '', 'zh-Hans': '' },
          newFile: null,
        };
        frames.set(order, frame);
      }

      if (!frame.file && row.file) frame.file = row.file;
      if (row.mockup === 'true' || row.mockup === 'false') frame.mockup = row.mockup === 'true';
      frame.alt[each] = row.alt ?? '';
      frame.caption[each] = row.caption ?? '';
    }
  }

  return [...frames.values()].sort((a, b) => a.order - b.order);
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

  const [tabs, setTabs] = useState(null);
  const [editors, setEditors] = useState([]);
  const [slug, setSlug] = useState(null);
  const [locale, setLocale] = useState('en');
  const [form, setForm] = useState(null);
  const [results, setResults] = useState([]);
  const [scope, setScope] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [removedFrames, setRemovedFrames] = useState([]);
  const [newFile, setNewFile] = useState(null);
  const [newSlug, setNewSlug] = useState('');
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
      /* The gallery tabs may not exist yet — a sheet that has never had a
         frame in it. The Sheets API refuses a read that names a range which
         is not there, so they are made first. */
      await ensureTabs(
        CONFIG.spreadsheetId,
        accessToken,
        LOCALE_CODES.map((l) => ({ title: GALLERY_TABS[l], header: GALLERY_COLUMNS })),
      );

      const names = [
        ...LOCALE_CODES.map((l) => CASE_TABS[l]),
        ...LOCALE_CODES.map((l) => RESULT_TABS[l]),
        ...LOCALE_CODES.map((l) => SCOPE_TABS[l]),
        ...LOCALE_CODES.map((l) => GALLERY_TABS[l]),
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

    /* A case that is not in the sheet yet is one being written for the
       first time. Loading it would wipe what the editor has just typed, so
       the form is left alone until the case is saved and the sheet has it. */
    if (!row) return;

    const values = { ...row };

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

    setGallery(readGallery(tabs, slug));
    setRemovedFrames([]);

    setNewFile(null);
  }, [tabs, slug, locale]);

  const caseList = useMemo(() => {
    if (!tabs) return [];
    const list = rowsAsObjects(tabs[CASE_TABS[locale]]).map((row) => ({
      slug: row.slug,
      client: row.client || row.slug,
      published: row.published === 'true',
    }));

    /* The case being written is not in the sheet yet, so it is put at the
       top of the list — otherwise the picker would show a different case
       from the one on screen. */
    if (newSlug && !list.some((entry) => entry.slug === newSlug)) {
      list.unshift({ slug: newSlug, client: form?.client || newSlug, published: false });
    }
    return list;
  }, [tabs, locale, newSlug, form?.client]);

  const allowed = session ? editors.includes(session.email.toLowerCase()) : false;

  /* ── A new case ─────────────────────────────────────────────────────── */

  /**
   * Start a new case.
   *
   * The case is not in the sheet yet — it appears there when it is saved.
   * The id it asks for becomes the page address, so it has to be the one
   * the URL will use for good: `migather.com/en/work/<id>`.
   */
  function handleNewCase() {
    const asked = window.prompt(
      t({
        en: 'The case id — lowercase letters, digits and single hyphens.\n\nThis becomes the page address: /en/work/<id>\n\nFor example: acme-hk-2026',
        'zh-Hant': '案例代號——小寫字母、數字及連字號。這會成為頁面網址：/zh-Hant/work/<代號>\n\n例如：acme-hk-2026',
        'zh-Hans': '案例代号——小写字母、数字及连字号。这会成为页面网址：/zh-Hans/work/<代号>\n\n例如：acme-hk-2026',
      }),
    );
    if (!asked) return;

    const newSlug = asked.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug)) {
      setError(
        t({
          en: 'That id is not valid — lowercase letters, digits and single hyphens only.',
          'zh-Hant': '該代號無效——只能是小寫字母、數字及單一連字號。',
          'zh-Hans': '该代号无效——只能是小写字母、数字及单一连字号。',
        }),
      );
      return;
    }

    const client = window.prompt(
      t({
        en: 'The client name, for example: Acme HK',
        'zh-Hant': '客戶名稱，例如：Acme HK',
        'zh-Hans': '客户名称，例如：Acme HK',
      }),
    );
    if (client === null) return;

    setError('');
    setNotice('');
    setSlug(newSlug);
    setNewSlug(newSlug);

    setForm({
      slug: newSlug,
      client: (client ?? '').trim(),
      clientLocal: '',
      projectLocal: '',
      sector: 'finance',
      services: '',
      partnershipSince: '',
      summary: '',
      imageAlt: '',
      image: '',
      mockup: true,
      source: '',
      featured: false,
      /* A new case starts as a draft. A case that is on the site has to be
         publishable — a deck and slide to come from, a picture and a
         summary — and a case that has just been named is none of those
         yet. Publishing it straight away would stop the whole build, not
         just this case. */
      published: false,
    });
    setResults([]);
    setScope([]);
    setGallery([]);
    setRemovedFrames([]);
    setNewFile(null);

    setNotice(
      t({
        en: 'A new case, as a draft — it is not on the site until you say so. Fill it in and press Save.',
        'zh-Hant': '新增案例，先以草稿形式——在你確認前不會出現在網站上。填寫後按儲存。',
        'zh-Hans': '新增案例，先以草稿形式——在你确认前不会出现在网站上。填写后按保存。',
      }),
    );
  }

  /* ── The frames ───────────────────────────────────────────────────────── */

  /**
   * Change one frame.
   *
   * The order is the frame's place on the page, and it is renumbered after
   * every change — so the sheet and the page agree on which frame is first.
   */
  function updateFrame(index, patch) {
    setGallery(gallery.map((frame, at) => (at === index ? { ...frame, ...patch } : frame)));
  }

  /** Move a frame earlier or later. */
  function moveFrame(index, delta) {
    const to = index + delta;
    if (to < 0 || to >= gallery.length) return;

    const next = [...gallery];
    const [frame] = next.splice(index, 1);
    next.splice(to, 0, frame);
    setGallery(next.map((entry, at) => ({ ...entry, order: at + 1 })));
  }

  /**
   * Take a frame off the page.
   *
   * The row goes from the sheet when the case is saved, and the file in
   * Drive goes with it. The file name is remembered until then, so the
   * script can throw the file away.
   */
  function removeFrame(index) {
    const frame = gallery[index];
    if (frame?.file) setRemovedFrames([...removedFrames, frame.file]);
    setGallery(
      gallery
        .filter((_, at) => at !== index)
        .map((entry, at) => ({ ...entry, order: at + 1 })),
    );
  }

  /** Add a frame to the end. */
  function addFrame() {
    if (gallery.length >= GALLERY_MAX_FRAMES) return;
    setGallery([
      ...gallery,
      {
        order: gallery.length + 1,
        file: '',
        mockup: true,
        alt: { en: '', 'zh-Hant': '', 'zh-Hans': '' },
        caption: { en: '', 'zh-Hant': '', 'zh-Hans': '' },
        newFile: null,
      },
    ]);
  }

  /* ── Saving ─────────────────────────────────────────────────────────── */

  async function handleSave() {
    if (!session || !form) return;
    /* When the save happened, so the build it set off can be told from an
       earlier one. */
    const savedAt = Date.now();
    setBusy(true);
    setError('');
    setNotice('');

    try {
      const token = session.accessToken;

      /* The picture goes to Drive through the Apps Script, which runs as the
         editor and has storage quota. The script writes the picture's name
         into the sheet once the file is really there, so the sheet can
         never name a picture that was not saved. */
      let uploadedFileName = '';
      let pictureFailed = false;
      if (newFile) {
        const fileName = `${form.slug}${newFile.name.slice(newFile.name.lastIndexOf('.'))}`;
        /* What the stamp says now, so the wait can tell this upload from
           the last one. */
        const before = await readSetting(session.accessToken, 'lastImageSaved');
        const base64 = await readAsBase64(newFile);
        await postToScript(CONFIG.scriptUrl, {
          action: 'image',
          slug: form.slug,
          fileName,
          /* The flag travels with the picture: the script writes both into
             the sheet together, so the two can never disagree. */
          mockup: form.mockup ? 'true' : 'false',
          dataUrl: `data:${newFile.type || 'image/jpeg'};base64,${base64}`,
        });
        const saved = await waitForImage(before);
        if (!saved) {
          /* The picture did not arrive. This is not a reason to lose the
             copy: the case row below is written either way, with the old
             picture, and the editor is told to upload it again. A silent
             failure here would leave the sheet naming a picture that is
             not there, and the site showing the old one with the new
             copy — with nothing said. */
          pictureFailed = true;
        } else {
          uploadedFileName = fileName;
        }
      }

      /* The frames. The same rule: a frame that does not arrive is a note,
         not the end of the save. */
      const failedFrames = await saveGallery(token, form.slug, gallery, removedFrames);

      /* A case that is on the site has to be publishable.
         The sheet refuses a published case with no deck and slide, no
         picture or no summary — and it refuses the whole build, not just
         that case, so one unfinished case stops every case from updating.
         The build's own message lives in the sheet, which an editor is
         not going to read.

         So the case is saved as a draft instead. Refusing the save
         outright would throw away everything the editor has typed, and a
         case being written is a draft — that is what a draft is for. It
         does not go on the site until it can. */
      let published = form.published ? 'true' : 'false';
      let heldBack = '';

      if (published === 'true') {
        const needs = [];
        if (!form.source?.trim()) needs.push('the deck and slide it came from');
        if (!uploadedFileName && !form.image?.trim()) needs.push('a picture');
        if (!form.summary?.trim()) needs.push('a summary');

        if (needs.length) {
          published = 'false';
          const last = needs[needs.length - 1];
          const list =
            needs.length === 1 ? last : `${needs.slice(0, -1).join(', ')} and ${last}`;
          heldBack = list;
        }
      }

      /* The case row, in every language. The copy of this language is
         written here; the shared fields are written everywhere, because the
         sync refuses to compile a case whose tabs disagree. */
      for (const each of LOCALE_CODES) {
        const existing = rowsAsObjects(tabs[CASE_TABS[each]]).find((r) => r.slug === form.slug);
        const row = {
          slug,
          client: form.client,
          /* The local names are copy, not shared fields — but the sheet
             wants them filled in in every language or in none. So a name
             typed in one language goes to the languages that have none,
             and is left alone where a language has its own: an editor
             working in English must not flatten a translation that is
             already there, and must not leave the sheet half filled
             either. */
          clientLocal:
            each === locale ? form.clientLocal : existing?.clientLocal || form.clientLocal,
          projectLocal:
            each === locale ? form.projectLocal : existing?.projectLocal || form.projectLocal,
          sector: form.sector,
          services: form.services,
          partnershipSince: form.partnershipSince,
          summary: each === locale ? form.summary : (existing?.summary ?? ''),
          imageAlt: each === locale ? form.imageAlt : (existing?.imageAlt ?? ''),
          /* The picture's name and its mock-up flag are written by the
             script, once the file is really in Drive. The row takes them
             from the sheet, so it cannot name a picture that is not there
             or label one that is not a mock-up — and when a picture has just
             been uploaded, it takes the name the script has just written
             rather than the one the sheet held when the page was opened. */
          image: uploadedFileName || existing?.image || form.image,
          mockup: uploadedFileName
            ? form.mockup
              ? 'true'
              : 'false'
            : existing?.mockup === 'true'
              ? 'true'
              : 'false',
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

      /* The stamp the poller watches. It is written last, so the poller
         never picks the change up before it is all there. */
      await writeSetting(token, 'contentChanged', new Date().toISOString());

      if (pictureFailed || failedFrames.length) {
        /* The copy is saved either way — the site will pick it up. What did
           not arrive is a picture, and the editor has to put it back in. */
        setError(
          pictureFailed
            ? t({
                en: 'The copy was saved, but the picture did not reach Drive — upload it again. If this is the first time, the helper script may not have been redeployed yet.',
                'zh-Hant': '文字已儲存，但圖片未能上載到 Drive——請重新上載。若是首次使用，輔助程式可能尚未重新部署。',
                'zh-Hans': '文字已保存，但图片未能上传到 Drive——请重新上传。若是首次使用，辅助程序可能尚未重新部署。',
              })
            : t({
                en: `The copy was saved, but ${failedFrames.length} frame(s) did not reach Drive — upload them again. If this is the first time, the helper script may not have been redeployed yet.`,
                'zh-Hant': `文字已儲存，但有 ${failedFrames.length} 幅畫格未能上載到 Drive——請重新上載。若是首次使用，輔助程式可能尚未重新部署。`,
                'zh-Hans': `文字已保存，但有 ${failedFrames.length} 幅画格未能上传到 Drive——请重新上传。若是首次使用，辅助程序可能尚未重新部署。`,
              }),
        );
      } else if (heldBack) {
        /* The case is on the site, and the site cannot take it yet. It is
           saved as a draft — with everything the editor typed — and it will
           go on the site when the editor turns it on and it is ready. */
        setError(
          t({
            en: `Saved as a draft. The case is not on the site yet: it still needs ${heldBack}. Fill that in and turn it on the site again.`,
            'zh-Hant': `已以草稿形式儲存。此案例暫時未出現在網站上：仍需要${heldBack}。請補上後再設定在網站上。`,
            'zh-Hans': `已以草稿形式保存。此案例暂时未出现在网站上：仍需要${heldBack}。请补上后再设定在网站上。`,
          }),
        );
      } else {

        setNotice(
          t({
            en: 'Saved. The site rebuilds by itself within a minute — there is nothing to press.',
            'zh-Hant': '已儲存。網站會在一分鐘內自動更新，沒有其他需要按的按鈕。',
            'zh-Hans': '已保存。网站会在一分钟内自动更新，没有其他需要按的按钮。',
          }),
        );
      }
      setNewSlug('');
      /* The frames are in Drive now, and the files that were taken off the
         page have been thrown away. */
      setGallery(gallery.map((frame) => ({ ...frame, newFile: null })));
      setRemovedFrames([]);
      await loadSheet(token);

      /* And the build this set off. */
      watchPublish(savedAt);
    } catch (failure) {
      setError(failure.message ?? String(failure));
    } finally {
      setBusy(false);
    }
  }

  /**
   * Watch the build that the save set off.
   *
   * The sheet's settings tab carries the outcome: `lastPublishStatus` is
   * `dispatched` while the build runs, and `ok` or `failed` when it ends.
   * The stamp beside it says which publish a status belongs to, so a status
   * left over from an earlier build is not mistaken for this one.
   *
   * Without this the editor would see "saved" and a site that quietly did
   * not change — which is the one thing an editor cannot be left to guess
   * about. The poller runs every minute and the build takes another minute
   * or so, so this waits for up to three minutes and then gives up
   * quietly.
   */
  async function watchPublish(from) {
    for (let i = 0; i < 36; i += 1) {
      await sleep(5000);

      const at = await readSetting(session.accessToken, 'lastPublishStatusAt');
      if (!at || Date.parse(at) < from) continue;

      const status = await readSetting(session.accessToken, 'lastPublishStatus');
      if (status === 'failed') {
        const message = await readSetting(session.accessToken, 'lastPublishMessage');
        setError(
          t({
            en: `The site could not be published — the sheet is not in a state the site can publish. ${message}`,
            'zh-Hant': `網站無法發布——表格的狀態無法發布。${message}`,
            'zh-Hans': `网站无法发布——表格的状态无法发布。${message}`,
          }),
        );
        return;
      }
      if (status === 'ok') {
        setNotice(
          t({
            en: 'Published. The site is up to date.',
            'zh-Hant': '已發布。網站已是最新。',
            'zh-Hans': '已发布。网站已是最新。',
          }),
        );
        return;
      }
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

  /**
   * Save the frames.
   *
   * The pictures go to Drive through the Apps Script, which runs as the
   * editor and has storage quota. The script names each file after the page
   * and the alt text, and writes the name and the mock-up flag into the
   * sheet together — once the file is really there, so the sheet can never
   * name a picture that was not saved.
   *
   * The rows are written after that, with the copy of every language, so
   * the sheet names the pictures that are there and the copy that goes with
   * them.
   *
   * A frame that does not arrive is returned, not thrown: the copy around
   * it still has to be saved, and an editor who loses their typing because
   * one picture did not make it is an editor who stops using the form.
   *
   * Returns the frames that failed, by their place in the order.
   */
  async function saveGallery(token, caseSlug, frames, removed) {
    if (!frames.length && !removed.length) return [];

    const failed = [];

    /* The pictures first: the script has to write the file name into a row
       before the row can name it. */
    for (const frame of frames) {
      if (!frame.newFile) continue;

      /* What the stamp says now, so the wait can tell this upload from
         the last one. */
      const before = await readSetting(session.accessToken, 'lastGalleryImageSaved');
      const base64 = await readAsBase64(frame.newFile);
      await postToScript(CONFIG.scriptUrl, {
        action: 'gallery-image',
        slug: caseSlug,
        order: String(frame.order),
        /* The alt text the editor typed — it is half of the file's name,
           and it is the picture's description. */
        alt: frame.alt[locale] ?? '',
        ext: extensionOf(frame.newFile.name),
        mockup: frame.mockup ? 'true' : 'false',
        dataUrl: `data:${frame.newFile.type || 'image/jpeg'};base64,${base64}`,
      });

      const saved = await waitForGalleryImage(before);
      if (!saved) failed.push(frame.order);
    }

    /* The names the script gave the files. */
    const written = await readGalleryNames(token, caseSlug);
    const named = frames.map((frame) => ({
      ...frame,
      file: written.get(frame.order) || frame.file,
    }));

    await writeGalleryRows(token, caseSlug, named);

    /* And the files of the frames that were taken off the page. */
    for (const file of removed) {
      await postToScript(CONFIG.scriptUrl, {
        action: 'gallery-delete',
        slug: caseSlug,
        fileName: file,
      });
    }

    return failed;
  }

  /**
   * The file names the sheet holds for a case's frames, by order.
   *
   * Read after the upload, because the name of a new file is the script's to
   * give: it is written into the sheet only once the file is really in
   * Drive.
   */
  async function readGalleryNames(token, caseSlug) {
    const names = new Map();
    for (const each of LOCALE_CODES) {
      const tab = GALLERY_TABS[each];
      const values = await readTabs(CONFIG.spreadsheetId, token, [tab]);
      for (const row of rowsAsObjects(values[tab])) {
        if (row.slug !== caseSlug || !row.file) continue;
        const order = Number(row.order || 0);
        if (!order || names.has(order)) continue;
        names.set(order, row.file);
      }
    }
    return names;
  }

  /**
   * The rows of the gallery tabs, for this case, in every language.
   *
   * Each frame's copy is written with it, in every language — so moving a
   * frame does not leave one language's words on another language's
   * picture.
   */
  async function writeGalleryRows(token, caseSlug, frames) {
    for (const each of LOCALE_CODES) {
      const tab = GALLERY_TABS[each];
      const values = await readTabs(CONFIG.spreadsheetId, token, [tab]);
      const header = values[tab]?.[0] ?? GALLERY_COLUMNS;
      const kept = (values[tab] ?? []).filter((row, index) => index === 0 || row[0] !== caseSlug);

      const block = frames.map((frame, index) => [
        caseSlug,
        String(index + 1),
        frame.file,
        frame.alt[each] ?? '',
        frame.caption[each] ?? '',
        frame.mockup ? 'true' : 'false',
      ]);

      await writeTab(CONFIG.spreadsheetId, token, tab, [header, ...block, ...kept.slice(1)]);
    }
  }

  /* ── The settings tab ────────────────────────────────────────────────── */

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

    await writeTab(CONFIG.spreadsheetId, accessToken, `settings!B${existing + 1}`, [
      [String(value)],
    ]);
  }

  /**
   * Wait for the script to confirm the picture.
   *
   * The script writes the picture's name into the sheet once the file is
   * really in Drive, and stamps `lastImageSaved` so this can see it. The
   * browser cannot read the script's reply, so the sheet is how the two
   * sides talk.
   */
  /**
   * Wait for the script to confirm a picture.
   *
   * The script writes the picture's name into the sheet once the file is
   * really in Drive, and stamps `lastImageSaved` so this can see it. The
   * stamp carries the time as well as the name, and the page compares it
   * with the one it read before the upload — the same file name goes up
   * again and again, and a stamp that had not moved would tell the page
   * nothing about this attempt.
   */
  async function waitForImage(before) {
    const deadline = Date.now() + 45000;
    while (Date.now() < deadline) {
      const saved = await readSetting(session.accessToken, 'lastImageSaved');
      if (saved && saved !== before) return true;
      await sleep(1500);
    }
    return false;
  }

  /**
   * Wait for the script to confirm a frame.
   *
   * The same, with the frame's stamp. It carries the time as well as the
   * name, so a frame uploaded twice under the same name is still a new save.
   */
  async function waitForGalleryImage(before) {
    const deadline = Date.now() + 45000;
    while (Date.now() < deadline) {
      const saved = await readSetting(session.accessToken, 'lastGalleryImageSaved');
      if (saved && saved !== before) return true;
      await sleep(1500);
    }
    return false;
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
          <div className="flex items-baseline justify-between gap-3">
            <label className="eyebrow text-muted" htmlFor="case-picker">
              {t({ en: 'Case', 'zh-Hant': '案例', 'zh-Hans': '案例' })}
            </label>
            <button
              type="button"
              id="newCase"
              onClick={handleNewCase}
              className="font-display text-[13px] text-brandBlue underline underline-offset-4"
            >
              {t({ en: '＋ New case', 'zh-Hant': '＋ 新增案例', 'zh-Hans': '＋ 新增案例' })}
            </button>
          </div>
          <select
            id="case-picker"
            value={slug ?? ''}
            onChange={(event) => {
              setSlug(event.target.value);
              setNewSlug('');
            }}
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
            <Field id="client" label={t({ en: 'Client', 'zh-Hant': '客戶', 'zh-Hans': '客户' })}>
              <input
                type="text"
                className={INPUT}
                value={form.client}
                onChange={(event) => setForm({ ...form, client: event.target.value })}
              />
            </Field>

            <Field id="clientLocal" label={t({ en: 'Client, local name', 'zh-Hant': '客戶本地名稱', 'zh-Hans': '客户本地名称' })}
            >
              <input
                type="text"
                className={INPUT}
                value={form.clientLocal}
                onChange={(event) => setForm({ ...form, clientLocal: event.target.value })}
              />
            </Field>

            <Field id="projectLocal" label={t({ en: 'Project, local name', 'zh-Hant': '項目本地名稱', 'zh-Hans': '项目本地名称' })}
            >
              <input
                type="text"
                className={INPUT}
                value={form.projectLocal}
                onChange={(event) => setForm({ ...form, projectLocal: event.target.value })}
              />
            </Field>

            <Field id="sector" label={t({ en: 'Sector', 'zh-Hant': '範疇', 'zh-Hans': '范畴' })}>
              <input
                type="text"
                className={INPUT}
                value={form.sector}
                onChange={(event) => setForm({ ...form, sector: event.target.value })}
              />
            </Field>

            <Field id="services" label={t({ en: 'Categories', 'zh-Hant': '分類', 'zh-Hans': '分类' })}
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

            <Field id="partnershipSince" label={t({ en: 'Partner since', 'zh-Hant': '合作開始', 'zh-Hans': '合作开始' })}
            >
              <input
                type="text"
                className={INPUT}
                value={form.partnershipSince}
                onChange={(event) => setForm({ ...form, partnershipSince: event.target.value })}
              />
            </Field>

            <Field id="summary" label={t({ en: 'Summary', 'zh-Hant': '摘要', 'zh-Hans': '摘要' })}>
              <textarea
                rows={4}
                className={INPUT}
                value={form.summary}
                onChange={(event) => setForm({ ...form, summary: event.target.value })}
              />
            </Field>

            <Field id="source" label={t({ en: 'Source', 'zh-Hant': '來源', 'zh-Hans': '来源' })}
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

            <Field id="imageAlt" label={t({ en: 'Alt text', 'zh-Hant': '替代文字', 'zh-Hans': '替代文字' })}
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

            <Field id="mockup" label={t({ en: 'Is it a mock-up?', 'zh-Hant': '是樣機嗎？', 'zh-Hans': '是样机吗？' })}
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

            <Field id="picture" label={t({ en: 'The picture', 'zh-Hant': '圖片', 'zh-Hans': '图片' })}
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
                {t({ en: 'The frames', 'zh-Hant': '畫格', 'zh-Hans': '画格' })}
              </div>
              <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted">
                {t({
                  en: 'The campaign in squares, under the case information. The alt text describes the picture; the caption names the campaign element it stands for. The file is named after the page and the alt text when it is uploaded.',
                  'zh-Hant': '項目資訊下方的方形畫格。替代文字描述圖片，說明標示其代表的工作項目。檔案上載時會以頁面名稱及替代文字命名。',
                  'zh-Hans': '项目资讯下方的方形画格。替代文字描述图片，说明标示其代表的工作项目。档案上传时会以页面名称及替代文字命名。',
                })}
              </p>

              <div className="mt-4 space-y-4">
                {gallery.map((frame, index) => (
                  <div key={index} className="border border-rule bg-white p-4">
                    <div className="flex flex-wrap items-start gap-4">
                      <span className="mt-1 w-6 shrink-0 font-display text-[11px] font-medium tracking-[0.14em] text-brandCrimson">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="h-24 w-24 shrink-0 overflow-hidden bg-surface">
                        {frame.file && (
                          <img
                            src={asset(`/media/cases/${form.slug}/${frame.file}`)}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.visibility = 'hidden';
                            }}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-3">
                        <label className="block" htmlFor={`frame-alt-${index}`}>
                          <span className="eyebrow text-muted">
                            {t({ en: 'Alt text', 'zh-Hant': '替代文字', 'zh-Hans': '替代文字' })}
                          </span>
                          <input
                            id={`frame-alt-${index}`}
                            type="text"
                            className={`${INPUT} mt-2`}
                            value={frame.alt[locale] ?? ''}
                            onChange={(event) =>
                              updateFrame(index, {
                                alt: { ...frame.alt, [locale]: event.target.value },
                              })
                            }
                          />
                        </label>

                        <label className="block" htmlFor={`frame-caption-${index}`}>
                          <span className="eyebrow text-muted">
                            {t({ en: 'Caption', 'zh-Hant': '說明', 'zh-Hans': '说明' })}
                          </span>
                          <input
                            id={`frame-caption-${index}`}
                            type="text"
                            className={`${INPUT} mt-2`}
                            value={frame.caption[locale] ?? ''}
                            onChange={(event) =>
                              updateFrame(index, {
                                caption: { ...frame.caption, [locale]: event.target.value },
                              })
                            }
                          />
                        </label>

                        <div>
                          <input
                            id={`frame-file-${index}`}
                            type="file"
                            className="block w-full font-display text-[13px] text-ink"
                            accept="image/*"
                            onChange={(event) =>
                              updateFrame(index, { newFile: event.target.files?.[0] ?? null })
                            }
                          />
                          <span className="mt-1 block text-[12.5px] leading-relaxed text-muted">
                            {frame.newFile
                              ? t({
                                  en: `Ready to upload: ${frame.newFile.name}`,
                                  'zh-Hant': `準備上載：${frame.newFile.name}`,
                                  'zh-Hans': `准备上传：${frame.newFile.name}`,
                                })
                              : frame.file
                                ? t({
                                    en: `Current file: ${frame.file}`,
                                    'zh-Hant': `現有檔案：${frame.file}`,
                                    'zh-Hans': `现有文件：${frame.file}`,
                                  })
                                : t({
                                    en: 'No picture yet — choose a file above.',
                                    'zh-Hant': '尚未有圖片——請在 above 選擇檔案。',
                                    'zh-Hans': '尚未有图片——请在 above 选择文件。',
                                  })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <select
                        className="w-auto max-w-full border border-rule bg-white px-3 py-2 font-display text-[13px] text-ink"
                        value={frame.mockup ? 'true' : 'false'}
                        onChange={(event) =>
                          updateFrame(index, { mockup: event.target.value === 'true' })
                        }
                      >
                        <option value="true">
                          {t({
                            en: 'Mock-up — generated artwork',
                            'zh-Hant': '樣機——生成 artwork',
                            'zh-Hans': '样机——生成 artwork',
                          })}
                        </option>
                        <option value="false">
                          {t({
                            en: 'Real photography',
                            'zh-Hant': '實拍',
                            'zh-Hans': '实拍',
                          })}
                        </option>
                      </select>

                      <div className="flex flex-wrap gap-4 text-[13px]">
                        <button
                          type="button"
                          onClick={() => moveFrame(index, -1)}
                          disabled={index === 0}
                          className="font-display text-brandBlue underline underline-offset-4 disabled:text-muted disabled:no-underline"
                        >
                          {t({ en: '↑ Earlier', 'zh-Hant': '↑ 提早', 'zh-Hans': '↑ 提前' })}
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFrame(index, 1)}
                          disabled={index === gallery.length - 1}
                          className="font-display text-brandBlue underline underline-offset-4 disabled:text-muted disabled:no-underline"
                        >
                          {t({ en: '↓ Later', 'zh-Hant': '↓ 遲後', 'zh-Hans': '↓ 推后' })}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFrame(index)}
                          className="font-display text-brandCrimson underline underline-offset-4"
                        >
                          {t({ en: 'Remove', 'zh-Hant': '移除', 'zh-Hans': '移除' })}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                id="addFrame"
                onClick={addFrame}
                disabled={gallery.length >= GALLERY_MAX_FRAMES}
                className="mt-4 font-display text-[13px] text-brandBlue underline underline-offset-4 disabled:text-muted disabled:no-underline"
              >
                {gallery.length >= GALLERY_MAX_FRAMES
                  ? t({
                      en: `The page carries at most ${GALLERY_MAX_FRAMES} frames`,
                      'zh-Hant': `頁面最多載 ${GALLERY_MAX_FRAMES} 幅畫格`,
                      'zh-Hans': `页面最多载 ${GALLERY_MAX_FRAMES} 幅画格`,
                    })
                  : t({ en: '＋ Add a frame', 'zh-Hant': '＋ 新增畫格', 'zh-Hans': '＋ 新增画格' })}
              </button>
            </div>

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

            {/* Published. A draft is saved but does not appear on the site,
                and does not block the ones that do — so a case can be written
                in one language and finished in another without holding
                anything up. */}
            <div className="mt-10 border-t border-rule pt-8">
              <label className="eyebrow text-muted" htmlFor="published">
                {t({ en: 'On the site?', 'zh-Hant': '是否上架？', 'zh-Hans': '是否上架？' })}
              </label>
              <select
                id="published"
                value={form.published ? 'true' : 'false'}
                onChange={(event) => setForm({ ...form, published: event.target.value === 'true' })}
                className="mt-2 w-full border border-rule bg-white px-3 py-2 font-display text-[14px] text-ink"
              >
                <option value="false">
                  {t({
                    en: 'No — keep it as a draft',
                    'zh-Hant': '否——先存為草稿',
                    'zh-Hans': '否——先存为草稿',
                  })}
                </option>
                <option value="true">
                  {t({
                    en: 'Yes — show it on the site',
                    'zh-Hant': '是——在網站上顯示',
                    'zh-Hans': '是——在网站上显示',
                  })}
                </option>
              </select>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                {t({
                  en: 'A draft is saved but does not appear. Publish when the copy is ready — a case that is only half translated can be published, and the missing language falls back to English.',
                  'zh-Hant': '草稿會被儲存，但不會出現在網站上。文字准备好後再上架——只翻譯了一半也可以上架，缺少的語言會以英文顯示。',
                  'zh-Hans': '草稿会被保存，但不会出现在网站上。文字准备好后再上架——只翻译了一半也可以上架，缺少的语言会以英文显示。',
                })}
              </p>
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
              <span className="text-[13px] text-muted">
                {t({
                  en: 'That is all there is to do — the site rebuilds by itself.',
                  'zh-Hant': '只需要這樣——網站會自動更新。',
                  'zh-Hans': '只需要这样——网站会自动更新。',
                })}
              </span>
              {busy && (
                <span className="text-[13px] text-muted">
                  {t({ en: 'Saving…', 'zh-Hant': '儲存中…', 'zh-Hans': '保存中…' })}
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

/**
 * One field.
 *
 * The id goes on the control and the label points at it, so clicking the
 * label focuses the field — and so a test can find it.
 */
function Field({ id, label, hint, children }) {
  return (
    <label className="mt-6 block" htmlFor={id}>
      <span className="eyebrow text-muted">{label}</span>
      <div className="mt-2">{id ? cloneElement(children, { id }) : children}</div>
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
