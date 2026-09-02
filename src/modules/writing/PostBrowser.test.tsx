import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PostBrowser } from './PostBrowser'
import type { PostSummary } from './PostList'

const posts: PostSummary[] = [
  {
    slug: 'envelope',
    permalink: '/blog/envelope',
    title: 'Envelope of failure',
    date: '2026-08-24T00:00:00.000Z',
    summary: 'A panel that fails explains itself.',
    tags: ['Architecture', 'TypeScript'],
  },
  {
    slug: 'graphql',
    permalink: '/blog/graphql',
    title: 'A query that cannot leak',
    date: '2026-08-19T00:00:00.000Z',
    summary: 'Not requesting private repositories is not a filter.',
    tags: ['Security', 'GraphQL'],
  },
  {
    slug: 'svg',
    permalink: '/blog/svg',
    title: 'Drawing the SVG by hand',
    date: '2026-08-02T00:00:00.000Z',
    summary: 'Six axes do not need ninety kilobytes.',
    tags: ['Frontend', 'TypeScript'],
  },
]

/** byRole skips hidden subtrees, which is exactly what the filter applies. */
const visibleTitles = () => screen.getAllByRole('link').map((a) => a.textContent)

describe('PostBrowser', () => {
  it('starts on All, showing every post', () => {
    render(<PostBrowser posts={posts} />)
    expect(visibleTitles()).toHaveLength(3)
    expect(screen.getByRole('button', { name: /All/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps every post in the DOM when filtered, for crawlers', async () => {
    const user = userEvent.setup()
    const { container } = render(<PostBrowser posts={posts} />)
    await user.click(screen.getByRole('button', { name: /Security/ }))
    expect(container.querySelectorAll('li')).toHaveLength(3)
  })

  it('filters to the clicked tag', async () => {
    const user = userEvent.setup()
    render(<PostBrowser posts={posts} />)
    await user.click(screen.getByRole('button', { name: /Security/ }))
    expect(visibleTitles()).toEqual(['A query that cannot leak'])
  })

  it('matches a post carrying the tag among several', async () => {
    const user = userEvent.setup()
    render(<PostBrowser posts={posts} />)
    // TypeScript is the second tag on two different posts.
    await user.click(screen.getByRole('button', { name: /TypeScript/ }))
    expect(visibleTitles()).toEqual(['Envelope of failure', 'Drawing the SVG by hand'])
  })

  it('returns to every post on All', async () => {
    const user = userEvent.setup()
    render(<PostBrowser posts={posts} />)
    await user.click(screen.getByRole('button', { name: /Security/ }))
    await user.click(screen.getByRole('button', { name: /All/ }))
    expect(visibleTitles()).toHaveLength(3)
  })

  it('announces each facet with its count, not as one run-together string', () => {
    render(<PostBrowser posts={posts} />)
    expect(screen.getByRole('button', { name: 'All, 3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'TypeScript, 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Security, 1' })).toBeInTheDocument()
  })
})
