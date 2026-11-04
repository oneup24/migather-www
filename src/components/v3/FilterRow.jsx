import { cn } from '../../lib/utils';

/**
 * The category filter row — Capsule48's ALL / Art + Music / … row.
 *
 * The active entry is marked with `aria-pressed`, which is what drives the
 * crimson rule on the container's own baseline, so the state is carried by
 * the DOM rather than by a class the stylesheet has to guess about.
 */
export default function FilterRow({ items = [], value, onChange, className }) {
  return (
    <div className={cn('filter-row', className)} role="group">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className="filter-row__item"
          aria-pressed={value === item.key}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
