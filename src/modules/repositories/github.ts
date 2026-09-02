import { REPO_OVERRIDES } from '@content/repos.overrides'
import { GITHUB_LOGIN } from '@/shared/site.config'
import type { LoadResult, Repository } from './repos.types'

export const GITHUB_QUERY = `
  query Repos($login: String!) {
    user(login: $login) {
      repositories(
        first: 100
        privacy: PUBLIC
        ownerAffiliations: OWNER
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes { name description url pushedAt primaryLanguage { name } }
      }
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes { ... on Repository { name } }
      }
    }
  }
`

type Node = {
  name: string
  description: string | null
  url: string
  pushedAt: string
  primaryLanguage: { name: string } | null
}

/** Runs at build time only. Never call this from a client component. */
export async function loadRepositories(fetchImpl: typeof fetch = fetch): Promise<LoadResult> {
  const response = await fetchImpl('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: GITHUB_QUERY, variables: { login: GITHUB_LOGIN } }),
  })

  if (!response.ok) {
    throw new Error(`GitHub responded ${response.status}. Refusing to build a site with no projects.`)
  }

  const payload = (await response.json()) as {
    data?: { user?: { repositories: { nodes: Node[] }; pinnedItems: { nodes: { name: string }[] } } }
    errors?: { message: string }[]
  }

  if (payload.errors?.length) {
    throw new Error(`GitHub GraphQL: ${payload.errors.map((e) => e.message).join('; ')}`)
  }
  const user = payload.data?.user
  if (!user) throw new Error('GitHub returned no user. Check GITHUB_TOKEN and the login.')

  const pinned = new Set(user.pinnedItems.nodes.map((n) => n.name))
  const missingOverrides: string[] = []

  // Pinned first, then most recently pushed. Sorted on the raw nodes (by pinned,
  // then by pushedAt) rather than trusted from GraphQL response order or a
  // pinned-only comparator, which would silently depend on input already being
  // in recency order and scramble the second key otherwise.
  const sortedNodes = [...user.repositories.nodes].sort((a, b) => {
    const aPinned = pinned.has(a.name)
    const bPinned = pinned.has(b.name)
    if (aPinned !== bPinned) return aPinned ? -1 : 1
    return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
  })

  const repos: Repository[] = sortedNodes.map((node) => {
    const override = REPO_OVERRIDES[node.name]
    if (!override) missingOverrides.push(node.name)
    return {
      name: node.name,
      description: override ?? node.description ?? 'No description.',
      language: node.primaryLanguage?.name ?? 'Other',
      year: node.pushedAt.slice(0, 4),
      url: node.url,
      pinned: pinned.has(node.name),
    }
  })

  return { repos, missingOverrides }
}

/** Language name -> count, for the filter strip. */
export function languageCounts(repos: Repository[]): { label: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const repo of repos) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1)
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}
