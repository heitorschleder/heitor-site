import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SiteFooter } from './SiteFooter'

describe('SiteFooter', () => {
  it('spells the destination out instead of relying on an icon alone', () => {
    render(<SiteFooter />)
    expect(screen.getByText('github.com/heitorschleder')).toBeInTheDocument()
    expect(screen.getByText('linkedin.com/in/heitor-schleder')).toBeInTheDocument()
  })

  it('names the location', () => {
    render(<SiteFooter />)
    expect(screen.getByText(/Palhoça/)).toBeInTheDocument()
  })
})
