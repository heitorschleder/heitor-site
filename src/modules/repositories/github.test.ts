import { describe, it, expect, vi } from 'vitest'
import { loadRepositories, languageCounts, GITHUB_QUERY } from './github'
import type { Repository } from './repos.types'

function fakeFetch(payload: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 }))
}

const ONE_REPO = {
  data: {
    user: {
      repositories: {
        nodes: [
          {
            name: 'retrosite',
            description: 'Whatever GitHub says',
            url: 'https://github.com/heitorschleder/retrosite',
            pushedAt: '2026-08-12T19:59:18Z',
            primaryLanguage: { name: 'TypeScript' },
          },
        ],
      },
      pinnedItems: { nodes: [{ name: 'retrosite' }] },
    },
  },
}

describe('GITHUB_QUERY', () => {
  it('excludes private repositories in the query itself, not in a local filter', () => {
    // A filter bug could leak a name. There is nothing to leak when the data never arrives.
    expect(GITHUB_QUERY).toContain('privacy: PUBLIC')
  })

  it('never asks for isPrivate, so the field cannot reach the client', () => {
    expect(GITHUB_QUERY).not.toContain('isPrivate')
  })
})

describe('loadRepositories', () => {
  it('prefers the local English override over the GitHub description', async () => {
    const { repos } = await loadRepositories(fakeFetch(ONE_REPO) as unknown as typeof fetch)
    expect(repos[0].description).toContain('Conceptual HUD')
    expect(repos[0].description).not.toBe('Whatever GitHub says')
  })

  it('derives the year from pushedAt and marks pinned repositories', async () => {
    const { repos } = await loadRepositories(fakeFetch(ONE_REPO) as unknown as typeof fetch)
    expect(repos[0].year).toBe('2026')
    expect(repos[0].pinned).toBe(true)
  })

  it('sorts pinned first, then by most recent push', async () => {
    const payload = {
      data: {
        user: {
          repositories: {
            nodes: [
              { name: 'treino', description: null, url: 'u', pushedAt: '2022-09-13T00:00:00Z', primaryLanguage: { name: 'HTML' } },
              { name: 'Pokedex', description: null, url: 'u', pushedAt: '2024-11-18T00:00:00Z', primaryLanguage: { name: 'JavaScript' } },
              { name: 'HeiDev', description: null, url: 'u', pushedAt: '2026-06-28T00:00:00Z', primaryLanguage: { name: 'Dart' } },
            ],
          },
          pinnedItems: { nodes: [{ name: 'HeiDev' }] },
        },
      },
    }
    const { repos } = await loadRepositories(fakeFetch(payload) as unknown as typeof fetch)
    expect(repos.map((r) => r.name)).toEqual(['HeiDev', 'Pokedex', 'treino'])
  })

  it('reports a repository that has no override instead of silently shipping it', async () => {
    const payload = {
      data: {
        user: {
          repositories: {
            nodes: [
              { name: 'brand-new-repo', description: 'repositorio novo', url: 'u', pushedAt: '2026-09-01T00:00:00Z', primaryLanguage: null },
            ],
          },
          pinnedItems: { nodes: [] },
        },
      },
    }
    const { repos, missingOverrides } = await loadRepositories(fakeFetch(payload) as unknown as typeof fetch)
    expect(missingOverrides).toEqual(['brand-new-repo'])
    expect(repos[0].description).toBe('repositorio novo')
    expect(repos[0].language).toBe('Other')
  })

  it('fails the build when GitHub errors — a site with zero repositories is worse than no deploy', async () => {
    const failing = vi.fn(async () => new Response('nope', { status: 503 }))
    await expect(
      loadRepositories(failing as unknown as typeof fetch),
    ).rejects.toThrow(/GitHub/)
  })

  it('fails when GraphQL returns errors in a 200 response', async () => {
    const errored = fakeFetch({ errors: [{ message: 'Bad credentials' }] })
    await expect(
      loadRepositories(errored as unknown as typeof fetch),
    ).rejects.toThrow(/Bad credentials/)
  })
})

function repo(language: string, name = language): Repository {
  return {
    name,
    description: 'Description.',
    language,
    year: '2025',
    url: `https://github.com/heitorschleder/${name}`,
    pinned: false,
  }
}

describe('languageCounts', () => {
  it('buckets counts correctly across several repositories', () => {
    const repos = [
      repo('TypeScript', 'ts-1'),
      repo('TypeScript', 'ts-2'),
      repo('TypeScript', 'ts-3'),
      repo('Vue', 'vue-1'),
      repo('Vue', 'vue-2'),
      repo('Other', 'other-1'),
    ]
    expect(languageCounts(repos)).toEqual([
      { label: 'TypeScript', count: 3 },
      { label: 'Vue', count: 2 },
      { label: 'Other', count: 1 },
    ])
  })

  it('counts a repository whose language is "Other" like any other language', () => {
    const repos = [repo('Other', 'a'), repo('Other', 'b'), repo('Rust', 'c')]
    expect(languageCounts(repos)).toContainEqual({ label: 'Other', count: 2 })
  })

  it('breaks a tie in count alphabetically by label, regardless of input order', () => {
    const repos = [
      repo('Zebra', 'z-1'),
      repo('Zebra', 'z-2'),
      repo('Apple', 'a-1'),
      repo('Apple', 'a-2'),
    ]
    expect(languageCounts(repos)).toEqual([
      { label: 'Apple', count: 2 },
      { label: 'Zebra', count: 2 },
    ])
  })
})
