import { cn } from '../../lib/utils';

/**
 * The editorial row — Capsule48's body grammar.
 *
 * A small caps label sits in the left gutter; the statement fills the
 * right three-quarters of the measure. Nothing is centred and nothing is
 * boxed, which is what makes the page read as a document rather than a
 * set of sections.
 */
export default function Editorial({
  label,
  labelMuted = false,
  statement,
  statementSize = 'md',
  lede,
  className,
  children,
}) {
  return (
    <div className={cn('editorial', className)}>
      {label && (
        <div className={cn('editorial-label', labelMuted && 'editorial-label--muted')}>
          {label}
        </div>
      )}

      <div>
        {statement && (
          <div
            className={cn(
              'editorial-statement',
              statementSize === 'lg' && 'editorial-statement--lg',
              statementSize === 'sm' && 'editorial-statement--sm',
            )}
          >
            {statement}
          </div>
        )}

        {lede && <p className="editorial-lede mt-7">{lede}</p>}

        {children}
      </div>
    </div>
  );
}
