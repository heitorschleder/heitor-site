import { Panel } from '@/ui/molecules/Panel'
import { FilterStrip } from '@/ui/molecules/FilterStrip'
import { ArrowUpRight, GitBranch } from '@/ui/icons'
import { cn } from '@/shared/cn'
import { languageCounts } from './github'
import type { Repository } from './repos.types'
import { RepositoryExpander } from './RepositoryExpander'

function Card({ repo }: { repo: Repository }) {
  return (
    <a
      href={repo.url}
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

const GRID =
  'grid grid-cols-1 gap-px bg-[var(--color-rule)] @min-[440px]/shell:grid-cols-[repeat(auto-fill,minmax(198px,1fr))]'

export function RepositoryGrid({
  repos,
  initial = 10,
}: {
  repos: Repository[]
  initial?: number
}) {
  const head = repos.slice(0, initial)
  const tail = repos.slice(initial)

  return (
    <Panel
      title="Repositories"
      icon={GitBranch}
      meta={`Synced from GitHub at build · ${repos.length} public`}
    >
      <FilterStrip
        items={[{ label: 'All', count: repos.length, active: true }, ...languageCounts(repos)]}
      />
      <div className={GRID}>
        {head.map((repo) => (
          <Card key={repo.name} repo={repo} />
        ))}
      </div>
      {tail.length > 0 ? (
        <RepositoryExpander total={repos.length} initial={initial}>
          <div className={cn(GRID, 'border-t border-[var(--color-rule)]')}>
            {tail.map((repo) => (
              <Card key={repo.name} repo={repo} />
            ))}
          </div>
        </RepositoryExpander>
      ) : null}
    </Panel>
  )
}
