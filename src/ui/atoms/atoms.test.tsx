import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Chip } from './Chip'
import { Tk } from './Tk'

describe('Chip', () => {
  it('renders its children', () => {
    render(<Chip>30+ defect types</Chip>)
    expect(screen.getByText('30+ defect types')).toBeInTheDocument()
  })

  it('reads the accent tone by default and drops it when quiet', () => {
    const { rerender } = render(<Chip>Shipped</Chip>)
    expect(screen.getByText('Shipped').className).toContain('--color-acc')

    rerender(<Chip tone="quiet">Certificate</Chip>)
    expect(screen.getByText('Certificate').className).not.toContain('--color-acc')
  })
})

describe('Tk', () => {
  it('marks a daily driver differently from the rest', () => {
    const { rerender } = render(<Tk>Python</Tk>)
    const plain = screen.getByText('Python').className

    rerender(<Tk core>React</Tk>)
    expect(screen.getByText('React').className).not.toBe(plain)
  })
})
