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
    readingTime: 7,
  },
  {
    slug: 'older',
    permalink: '/blog/older',
    title: 'The older one',
    date: '2026-08-02',
    summary: 'Older summary.',
    tags: ['Frontend'],
    readingTime: 6,
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

  it('shows tags and reading time', () => {
    render(<PostList posts={posts} />)
    expect(screen.getByText('Architecture')).toBeInTheDocument()
    expect(screen.getByText('7 min')).toBeInTheDocument()
  })

  it('says so plainly when there is nothing to read', () => {
    render(<PostList posts={[]} />)
    expect(screen.getByText(/No posts yet/i)).toBeInTheDocument()
  })
})
