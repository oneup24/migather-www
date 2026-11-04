/**
 * Renders a string with one phrase picked out in a different colour.
 *
 * The copy keeps a single source of truth — the phrase is matched inside
 * the string rather than being split into fragments in the data module. If
 * the phrase is not found (a translation drifts, say) the text simply
 * renders unmarked; nothing breaks and nothing is lost.
 */
export default function Highlight({ text, phrase, markClassName = '' }) {
  if (!text || !phrase) return <>{text}</>;

  const parts = text.split(phrase);
  if (parts.length < 2) return <>{text}</>;

  return (
    <>
      {parts[0]}
      {/* The picked-out phrase never breaks across a line — a claim split
          mid-phrase reads as two claims. */}
      <span className={`whitespace-nowrap ${markClassName}`}>{phrase}</span>
      {parts.slice(1).join(phrase)}
    </>
  );
}
