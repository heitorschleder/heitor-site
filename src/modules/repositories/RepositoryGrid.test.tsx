import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RepositoryGrid } from './RepositoryGrid'
import type { Repository } from './repos.types'

const repos: Repository[] = Array.from({ length: 22 }, (_, i) => ({
  name: `repo-${i}`,
  description: `Description ${i}.`,
  language: i % 2 === 0 ? 'Vue' : 'TypeScript',
  year: '2025',
  url: `https://github.com/heitorschleder/repo-${i}`,
  pinned: i < 4,
}))

describe('RepositoryGrid', () => {
  it('shows ten repositories before expanding', () => {
    render(<RepositoryGrid repos={repos} />)
    expect(screen.getByRole('link', { name: /repo-9/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /repo-10/ })).not.toBeInTheDocument()
  })

  it('reveals the rest on click and reports the new count', async () => {
    const user = userEvent.setup()
    render(<RepositoryGrid repos={repos} />)
    await user.click(screen.getByRole('button', { name: /show all 22/i }))

    expect(screen.getByRole('link', { name: /repo-21/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show fewer/i })).toBeInTheDocument()
  })

  it('tracks expansion state for assistive tech', async () => {
    const user = userEvent.setup()
    render(<RepositoryGrid repos={repos} />)
    const button = screen.getByRole('button', { name: /show all 22/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await user.click(button)
    expect(screen.getByRole('button', { name: /show fewer/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('hides the button entirely when everything already fits', () => {
    render(<RepositoryGrid repos={repos.slice(0, 6)} />)
    expect(screen.queryByRole('button', { name: /show all/i })).not.toBeInTheDocument()
  })

  it('counts every language in the filter strip', () => {
    render(<RepositoryGrid repos={repos} />)
    expect(screen.getByText('22')).toBeInTheDocument()
    expect(screen.getAllByText('11')).toHaveLength(2)
  })
})
