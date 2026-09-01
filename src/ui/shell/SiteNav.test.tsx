import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SiteNav } from './SiteNav'

describe('SiteNav', () => {
  it('exposes the three routes as links', () => {
    render(<SiteNav pathname="/" />)
    for (const name of ['Work', 'Writing', 'About']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument()
    }
  })

  it('marks the active route for assistive tech', () => {
    render(<SiteNav pathname="/blog" />)
    expect(screen.getByRole('link', { name: 'Writing' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Work' })).not.toHaveAttribute('aria-current')
  })

  it('marks the active route for a nested path under it', () => {
    render(<SiteNav pathname="/blog/some-post" />)
    expect(screen.getByRole('link', { name: 'Writing' })).toHaveAttribute('aria-current', 'page')
  })

  it('links out to every social destination with an accessible name', () => {
    render(<SiteNav pathname="/" />)
    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
      'href',
      'https://github.com/heitorschleder',
    )
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /rss/i })).toBeInTheDocument()
  })

  // Nothing renders this text today, so this guard cannot fail from a
  // regression yet — it exists because the site owner explicitly asked for
  // "Open to Work" to be removed from the nav, and this pins that decision
  // against it quietly coming back.
  it('does not advertise availability', () => {
    render(<SiteNav pathname="/" />)
    expect(screen.queryByText(/open to work/i)).not.toBeInTheDocument()
  })
})
