'use client'

import { cn } from '@/shared/cn'
import type { FilterItem } from '@/shared/counts'

/**
 * The facets for a collection. Presentational: it renders buttons and reports
 * clicks, and the caller owns which one is selected.
 *
 * These are `<button>`s rather than the styled `<li>`s this started as. The
 * strip looked like a control and was not one, which is worse than either an
 * honest label or a working filter — a keyboard user could not reach it and a
 * screen reader announced a list where a reader saw tabs.
 */
export function FilterStrip({
  items,
  active,
  onSelect,
  label,
}: {
  items: FilterItem[]
  /** The selected label. `ALL_FILTER` means no facet is applied. */
  active: string
  onSelect: (label: string) => void
  /** Names the group for assistive tech, e.g. "Filter repositories by language". */
  label: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap border-b border-[var(--color-rule)]"
    >
      {items.map((item) => {
        const selected = item.label === active
        return (
          <button
            key={item.label}
            type="button"
            aria-pressed={selected}
            /* Without this the name computes as "All3" — the label and the
               count are adjacent text nodes with only a flex gap between
               them, which spaces them visually and not audibly. */
            aria-label={`${item.label}, ${item.count}`}
            onClick={() => onSelect(item.label)}
            className={cn(
              'flex min-h-11 items-center gap-[7px] border-r border-[var(--color-rule)] px-[11px]',
              'font-mono text-[10px] uppercase tracking-[0.09em] transition-colors',
              '@min-[560px]/shell:min-h-0 @min-[560px]/shell:py-[7px]',
              selected
                ? 'bg-[var(--color-wash)] text-[var(--color-acc)]'
                : 'text-[var(--color-mute)] hover:bg-[var(--color-panel-2)] hover:text-[var(--color-ink)]',
            )}
          >
            <span>{item.label}</span>
            <b className={cn('font-normal', selected ? '' : 'text-[var(--color-ink)]')}>
              {item.count}
            </b>
          </button>
        )
      })}
    </div>
  )
}
