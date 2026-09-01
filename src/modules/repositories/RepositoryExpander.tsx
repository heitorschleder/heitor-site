'use client'

import { useState } from 'react'
import { ChevronDown } from '@/ui/icons'
import { cn } from '@/shared/cn'

export function RepositoryExpander({
  total,
  initial,
  children,
}: {
  total: number
  initial: number
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/*
        No `display: contents` (or any other author `display` rule) here.
        `hidden` sets `display: none` via the browser's user-agent stylesheet,
        which loses to ANY author-origin display rule regardless of
        specificity once real CSS loads (cascade origin beats specificity).
        An ordinary block wrapper lets `hidden` win outright.
      */}
      <div id="repository-overflow" hidden={!open}>
        {children}
      </div>
      <div className="flex flex-wrap items-stretch justify-between border-t border-[var(--color-rule)]">
        <p className="flex items-center px-3 py-[10px] font-mono text-[10px] uppercase tracking-[0.09em] text-[var(--color-mute)]">
          Showing {open ? total : initial} of {total} · pinned first, then last push
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="repository-overflow"
          className={cn(
            'flex min-h-11 items-center gap-2 border-l border-[var(--color-rule)] px-4',
            'font-display text-[13px] font-semibold uppercase tracking-[0.15em]',
            'text-[var(--color-acc)] transition-colors hover:bg-[var(--color-wash)]',
          )}
        >
          {open ? 'Show fewer' : `Show all ${total}`}
          <ChevronDown
            className={cn('size-[14px] transition-transform', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      </div>
    </>
  )
}
