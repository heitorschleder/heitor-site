import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Hero } from '@/modules/home'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

describe('Hero', () => {
  it('leads with the one-line positioning, as an h1', () => {
    render(<Hero />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(/full stack/i)
  })

  it('surfaces location, degree and repository count without a stat tile in sight', () => {
    render(<Hero />)
    expect(screen.getByText(/Palhoça/)).toBeInTheDocument()
    expect(screen.getByText(/BSc Data Science/i)).toBeInTheDocument()
    expect(screen.getByText(/22 public repositories/i)).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Hero />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
