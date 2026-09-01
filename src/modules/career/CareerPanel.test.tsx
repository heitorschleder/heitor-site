import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CareerPanel, withEmphasis } from './CareerPanel'
import { ROLES } from './career.data'

describe('career data', () => {
  it('runs newest first', () => {
    expect(ROLES.map((r) => r.role)).toEqual([
      'Software Developer',
      'Tech Lead',
      'Frontend Developer Jr',
      'Intern',
    ])
  })

  it('gives every role at least one key result', () => {
    for (const role of ROLES) {
      expect(role.results.length, `${role.role} has no key results`).toBeGreaterThan(0)
    }
  })

  it('opens the most recent role at rest so the page shows its best evidence', () => {
    expect(ROLES[0].open).toBe(true)
    expect(ROLES.slice(1).every((r) => !r.open)).toBe(true)
  })
})

describe('CareerPanel', () => {
  it('names the promotion track in the panel meta', () => {
    render(<CareerPanel />)
    expect(screen.getByText(/Intern to Tech Lead in 13 months/i)).toBeInTheDocument()
  })

  it('renders every role as a disclosure', () => {
    render(<CareerPanel />)
    expect(screen.getAllByRole('group')).toHaveLength(ROLES.length)
  })

  it('keeps closed role detail in the document so find-in-page and crawlers reach it', () => {
    render(<CareerPanel />)
    // "Outlook" only appears in the intern body, which starts closed.
    expect(screen.getByText(/Outlook/)).toBeInTheDocument()
  })

  it('lets several roles be open at once', async () => {
    const user = userEvent.setup()
    render(<CareerPanel />)
    const groups = screen.getAllByRole('group') as HTMLDetailsElement[]

    expect(groups[0].open).toBe(true)
    await user.click(screen.getByText('Tech Lead'))

    expect(groups[0].open).toBe(true)
    expect(groups[1].open).toBe(true)
  })
})

describe('withEmphasis', () => {
  it('renders ** markers as <strong>, leaving surrounding text intact', () => {
    const { container } = render(<>{withEmphasis('before **99%** after')}</>)
    expect(container.textContent).toBe('before 99% after')
    const strong = container.querySelector('strong')
    expect(strong).not.toBeNull()
    expect(strong?.textContent).toBe('99%')
  })

  it('renders a string containing markup as literal text, never as injected HTML', () => {
    const { container } = render(<>{withEmphasis('<script>alert(1)</script>')}</>)
    expect(container.querySelector('script')).toBeNull()
    expect(container.textContent).toBe('<script>alert(1)</script>')
  })
})
