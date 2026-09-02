'use client'

import { useState } from 'react'
import { FilterStrip } from '@/ui/molecules/FilterStrip'
import { ChevronDown } from '@/ui/icons'
import { cn } from '@/shared/cn'
import { ALL_FILTER, withAllFacet } from '@/shared/counts'
import { languageCounts } from './github'
import type { Repository } from './repos.types'
import { RepositoryCard, REPOSITORY_GRID } from './RepositoryCard'

/**
 * Owns which language is selected and how many cards are revealed.
 *
 * Every repository renders, always. Non-matching and overflow cards carry
 * `hidden` rather than being left out of the tree, for the reason the expander
 * has always used it: the prerendered HTML is the "All" state, so a crawler
 * sees all 22 repositories even though a visitor may be looking at 10 Vue ones.
 * Unmounting them would trade that away for nothing.
 *
 * `hidden` also removes a card from find-in-page, which is right here — with a
 * language filter applied, Cmd+F should not match a repository you filtered out.
 */
export function RepositoryBrowser({
  repos,
  initial,
}: {
  repos: Repository[]
  initial: number
}) {
  const [language, setLanguage] = useState(ALL_FILTER)
  const [expanded, setExpanded] = useState(false)

  const matches = (repo: Repository) => language === ALL_FILTER || repo.language === language
  const matched = repos.filter(matches)

  // The reveal limit applies to what the filter left, so picking a language
  // with fewer repositories than the limit simply shows all of them.
  const capped = !expanded && matched.length > initial
  const shown = capped ? matched.slice(0, initial) : matched
  const visible = new Set(shown.map((repo) => repo.name))

  return (
    <>
      <FilterStrip
        items={withAllFacet(repos.length, languageCounts(repos))}
        active={language}
        onSelect={(next) => {
          setLanguage(next)
          setExpanded(false)
        }}
        label="Filter repositories by language"
      />

      <div className={REPOSITORY_GRID}>
        {repos.map((repo) => (
          <RepositoryCard key={repo.name} repo={repo} hidden={!visible.has(repo.name)} />
        ))}
      </div>

      <div className="flex flex-wrap items-stretch justify-between border-t border-[var(--color-rule)]">
        <p className="flex items-center px-3 py-[10px] font-mono text-[10px] uppercase tracking-[0.09em] text-[var(--color-mute)]">
          Showing {shown.length} of {matched.length}
          {language === ALL_FILTER ? ' · pinned first, then last push' : ` in ${language}`}
        </p>
        {matched.length > initial ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className={cn(
              'flex min-h-11 items-center gap-2 border-l border-[var(--color-rule)] px-4',
              'font-display text-[13px] font-semibold uppercase tracking-[0.15em]',
              'text-[var(--color-acc)] transition-colors hover:bg-[var(--color-wash)]',
            )}
          >
            {expanded ? 'Show fewer' : `Show all ${matched.length}`}
            <ChevronDown
              className={cn('size-[14px] transition-transform', expanded && 'rotate-180')}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>
    </>
  )
}
