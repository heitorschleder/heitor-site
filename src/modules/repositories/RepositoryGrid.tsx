import { Panel } from '@/ui/molecules/Panel'
import { GitBranch } from '@/ui/icons'
import type { Repository } from './repos.types'
import { RepositoryBrowser } from './RepositoryBrowser'

/**
 * Server shell around the browsing state. The panel chrome and its heading stay
 * server-rendered; only the facets and the reveal limit need a client boundary.
 */
export function RepositoryGrid({
  repos,
  initial = 10,
}: {
  repos: Repository[]
  initial?: number
}) {
  return (
    <Panel
      title="Repositories"
      icon={GitBranch}
      meta={`Synced from GitHub at build · ${repos.length} public`}
    >
      <RepositoryBrowser repos={repos} initial={initial} />
    </Panel>
  )
}
