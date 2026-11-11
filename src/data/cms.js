/**
 * The works editor's configuration.
 *
 * These are pointers, not credentials.
 *
 *   · The client id is public by definition — it appears in every page that
 *     signs a user in, and Google treats it as such.
 *   · The sheet id is a pointer, not a permission. The sheet's own sharing
 *     is what protects the content: only the agency account and the service
 *     account can open it, and "anyone with the link" is off.
 *   · The script address is a web app's address, like any other.
 *
 * They are here rather than in the build environment so that the published
 * build works without anybody having to configure anything first, and so
 * that changing the sheet is a commit like every other change. The
 * environment variables override them for anyone who would rather keep them
 * out of the repository — see `.env.example`.
 */
export const cms = {
  /** The OAuth client id — see docs/CMS.md §3.4. */
  clientId:
    import.meta.env.VITE_CMS_CLIENT_ID ||
    '32982756273-m8ibok5uupec4gcnied0u6oso7rh5ndp.apps.googleusercontent.com',

  /** The sheet that holds the case content. */
  spreadsheetId:
    import.meta.env.VITE_CMS_SHEET_ID || '141I1EcV1sG3bCemBNcA_7nJlcQXwLPrvP_SzHMvomgg',

  /** The Apps Script that saves the pictures and asks GitHub to rebuild. */
  scriptUrl:
    import.meta.env.VITE_CMS_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbw1dz1vYNJwDNCghtovaEPMOxmQ7pCd3iTgkls3B_yXfPc-2rYuXmxffG4bw-wNtj7h/exec',
};
