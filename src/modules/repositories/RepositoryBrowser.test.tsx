import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RepositoryBrowser } from './RepositoryBrowser'
import type { Repository } from './repos.types'

const repos: Repository[] = [
  ...Array.from({ length: 12 }, (_, i) => ({
    name: `vue-${i}`,
    description: `A Vue project ${i}.`,
    language: 'Vue',
    year: '2025',
    url: `https://github.com/heitorschleder/vue-${i}`,
    pinned: i < 2,
  })),
  {
    name: 'only-dart',
    description: 'A Flutter app.',
    language: 'Dart',
    year: '2026',
    url: 'https://github.com/heitorschleder/only-dart',
    pinned: false,
  },
]

/** `hidden` is what the filter uses, and byRole queries skip hidden subtrees. */
const visibleNames = () =>
  screen.getAllByRole('link').map((a) => a.querySelector('b')?.textContent)

describe('RepositoryBrowser', () => {
  it('starts unfiltered, capped at the reveal limit', () => {
    render(<RepositoryBrowser repos={repos} initial={10} />)
    expect(visibleNames()).toHaveLength(10)
    expect(screen.getByText(/Showing 10 of 13/)).toBeInTheDocument()
  })

  it('renders every repository into the DOM even when capped, for crawlers', () => {
    const { container } = render(<RepositoryBrowser repos={repos} initial={10} />)
    expect(container.querySelectorAll('a[href^="https://github.com"]')).toHaveLength(13)
  })

  it('filters to the clicked language and drops the rest', async () => {
    const user = userEvent.setup()
    render(<RepositoryBrowser repos={repos} initial={10} />)

    await user.click(screen.getByRole('button', { name: /Dart/ }))

    expect(visibleNames()).toEqual(['only-dart'])
    expect(screen.getByText(/Showing 1 of 1 in Dart/)).toBeInTheDocument()
  })

  it('hides the expander when the filtered set fits the limit', async () => {
    const user = userEvent.setup()
    render(<RepositoryBrowser repos={repos} initial={10} />)

    expect(screen.getByRole('button', { name: /Show all 13/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Dart/ }))
    expect(screen.queryByRole('button', { name: /Show all/ })).not.toBeInTheDocument()
  })

  it('returns to the full list on All', async () => {
    const user = userEvent.setup()
    render(<RepositoryBrowser repos={repos} initial={10} />)

    await user.click(screen.getByRole('button', { name: /Dart/ }))
    await user.click(screen.getByRole('button', { name: /All/ }))

    expect(visibleNames()).toHaveLength(10)
    expect(screen.getByText(/Showing 10 of 13/)).toBeInTheDocument()
  })

  it('reveals the rest of a filtered set, counted against that set', async () => {
    const user = userEvent.setup()
    render(<RepositoryBrowser repos={repos} initial={10} />)

    await user.click(screen.getByRole('button', { name: /Vue/ }))
    expect(visibleNames()).toHaveLength(10)

    await user.click(screen.getByRole('button', { name: /Show all 12/ }))
    expect(visibleNames()).toHaveLength(12)
    expect(screen.getByText(/Showing 12 of 12 in Vue/)).toBeInTheDocument()
  })

  it('collapses an expanded list when the filter changes', async () => {
    const user = userEvent.setup()
    render(<RepositoryBrowser repos={repos} initial={10} />)

    await user.click(screen.getByRole('button', { name: /Show all 13/ }))
    expect(visibleNames()).toHaveLength(13)

    await user.click(screen.getByRole('button', { name: /Vue/ }))
    expect(visibleNames()).toHaveLength(10)
  })
})
