import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { PostArticle } from './PostArticle'
import { sortedPosts } from './index'

const post = {
  title: 'Envelope<T>: designing for the panel that fails',
  date: '2026-08-24',
  summary: 'Six panels, six upstream services, one rule.',
  tags: ['Architecture', 'TypeScript'],
}

describe('PostArticle', () => {
  it('renders the title as the only h1', () => {
    render(
      <PostArticle post={post}>
        <p>body</p>
      </PostArticle>,
    )
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(post.title)
  })

  it('renders the body inside a bounded reading column', () => {
    const { container } = render(
      <PostArticle post={post}>
        <p>the body text</p>
      </PostArticle>,
    )
    expect(screen.getByText('the body text')).toBeInTheDocument()
    const column = container.querySelector('.prose-console')
    expect(column).not.toBeNull()
    // jsdom cannot compute layout, so this is the pragmatic ceiling: assert the
    // classes that bound and centre the column are actually present, not just
    // that some element carries the marker class.
    expect(column).toHaveClass('max-w-[64ch]', 'mx-auto')
  })

  it('exposes the date as a machine-readable time', () => {
    render(
      <PostArticle post={post}>
        <p>body</p>
      </PostArticle>,
    )
    expect(screen.getByText('24 August 2026')).toHaveAttribute('dateTime', '2026-08-24')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PostArticle post={post}>
        <p>body</p>
      </PostArticle>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('PostArticle with real post data from Velite', () => {
  const realPost = sortedPosts()[0]

  it('formats real Velite post dates correctly (not "Invalid Date")', () => {
    // Real Velite posts have dates as full ISO instants, e.g., "2026-08-24T00:00:00.000Z"
    // This test ensures the component renders the date correctly with real data,
    // not just with fixture dates.
    render(
      <PostArticle post={realPost}>
        <p>body</p>
      </PostArticle>,
    )

    // Find the time element
    const timeElement = screen.getByRole('time')
    const visibleDate = timeElement.textContent

    // Must not be the error string
    expect(visibleDate).not.toBe('Invalid Date')
    // Must match the expected date format: "24 August 2026"
    expect(visibleDate).toMatch(/\d{1,2}\s+\w+\s+\d{4}/)
  })
})
