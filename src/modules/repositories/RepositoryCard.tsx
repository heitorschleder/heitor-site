import { ArrowUpRight } from '@/ui/icons'
import { cn } from '@/shared/cn'
import type { Repository } from './repos.types'

/** Shared by the grid so the card's markup exists in exactly one place. */
export const REPOSITORY_GRID =
  'grid grid-cols-1 gap-px bg-[var(--color-rule)] @min-[440px]/shell:grid-cols-[repeat(auto-fill,minmax(198px,1fr))]'

export function RepositoryCard({ repo, hidden }: { repo: Repository; hidden?: boolean }) {
  return (
    <a
      href={repo.url}
      hidden={hidden}
      className={cn(
        'flex min-h-[116px] flex-col gap-[6px] border-t-2 bg-[var(--color-panel)] px-3 pb-[9px] pt-[11px]',
        'transition-colors hover:bg-[var(--color-panel-2)]',
        repo.pinned ? 'border-t-[var(--color-acc)]' : 'border-t-transparent',
      )}
    >
      <span className="flex items-baseline justify-between gap-2">
        <b className="font-display text-[15px] font-semibold uppercase leading-[1.1] tracking-[0.05em] break-words text-[var(--color-ink)]">
          {repo.name}
        </b>
        <ArrowUpRight className="size-3 shrink-0 text-[var(--color-mute)]" aria-hidden="true" />
      </span>
      <span className="flex-1 text-[12.5px] leading-[1.45] text-[var(--color-mute)]">
        {repo.description}
      </span>
      <span className="flex items-center justify-between gap-2 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--color-mute)]">
        <span className="text-[var(--color-acc)]">{repo.language}</span>
        <span>{repo.year}</span>
      </span>
    </a>
  )
}
