import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Hero } from '@/modules/home'

describe('Hero', () => {
  it('leads with the one-line positioning, as an h1', () => {
    render(<Hero repoCount={17} />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(/full stack/i)
  })

  it('surfaces location, degree and repository count without a stat tile in sight', () => {
    render(<Hero repoCount={17} />)
    expect(screen.getByText(/Palhoça/)).toBeInTheDocument()
    expect(screen.getByText(/BSc Data Science/i)).toBeInTheDocument()
    expect(screen.getByText(/17 public repositories/i)).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Hero repoCount={17} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
