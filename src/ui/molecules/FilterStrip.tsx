import { cn } from '@/shared/cn'
import type { FilterItem } from '@/shared/counts'

/**
 * Static in v1: it reports the shape of the collection rather than filtering it.
 * Twenty-two repositories do not need client-side faceting to be scannable.
 */
export function FilterStrip({ items }: { items: FilterItem[] }) {
  return (
    <ul className="flex flex-wrap border-b border-[var(--color-rule)]">
      {items.map((item) => (
        <li
          key={item.label}
          className={cn(
            'flex items-center gap-[7px] border-r border-[var(--color-rule)] px-[11px] py-[7px]',
            'font-mono text-[10px] uppercase tracking-[0.09em]',
            item.active
              ? 'bg-[var(--color-wash)] text-[var(--color-acc)]'
              : 'text-[var(--color-mute)]',
          )}
        >
          <span>{item.label}</span>
          <b className={cn('font-normal', item.active ? '' : 'text-[var(--color-ink)]')}>
            {item.count}
          </b>
        </li>
      ))}
    </ul>
  )
}
