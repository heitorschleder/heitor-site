import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostList, type PostSummary } from './PostList'

const posts: PostSummary[] = [
  {
    slug: 'newer',
    permalink: '/blog/newer',
    title: 'The newer one',
    date: '2026-08-24',
    summary: 'Newer summary.',
    tags: ['Architecture'],
  },
  {
    slug: 'older',
    permalink: '/blog/older',
    title: 'The older one',
    date: '2026-08-02',
    summary: 'Older summary.',
    tags: ['Frontend'],
  },
]

describe('PostList', () => {
  it('links each entry to its permalink', () => {
    render(<PostList posts={posts} />)
    expect(screen.getByRole('link', { name: /The newer one/ })).toHaveAttribute(
      'href',
      '/blog/newer',
    )
  })

  it('renders the date in a machine-readable time element', () => {
    render(<PostList posts={posts} />)
    const time = screen.getByText('24 Aug 2026')
    expect(time.tagName).toBe('TIME')
    expect(time).toHaveAttribute('dateTime', '2026-08-24')
  })

  it('shows tags', () => {
    render(<PostList posts={posts} />)
    expect(screen.getByText('Architecture')).toBeInTheDocument()
  })

  it('names the link by the title alone, not by the whole block', () => {
    render(<PostList posts={posts} />)
    // The point of the overlay pattern: the row is clickable, but the link's
    // accessible name stays the title. Wrapping the row in the link would make
    // this name the date, summary and every tag concatenated.
    const link = screen.getByRole('link', { name: 'The newer one' })
    expect(link).toHaveAccessibleName('The newer one')
  })

  it('covers the row with the link, rather than nesting the row inside it', () => {
    const { container } = render(<PostList posts={posts} />)
    const row = container.querySelector('li')!
    const link = row.querySelector('a')!

    // jsdom computes no layout, so the click area itself is not testable here.
    // What is testable is the mechanism: a positioned row, an overlay on the
    // link, and the row's content NOT inside the anchor.
    expect(row.className).toContain('relative')
    expect(link.className).toContain("after:inset-0")
    expect(link.querySelector('time')).toBeNull()
    expect(link.textContent).toBe('The newer one')
  })

  it('says so plainly when there is nothing to read', () => {
    render(<PostList posts={[]} />)
    expect(screen.getByText(/No posts yet/i)).toBeInTheDocument()
  })
})
