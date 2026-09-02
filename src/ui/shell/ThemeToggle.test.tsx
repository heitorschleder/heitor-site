import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'
import { THEME_STORAGE_KEY } from './theme-script'

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('exposes an accessible name', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument()
  })

  it('stamps an explicit theme on the first click', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(screen.getByRole('button', { name: /theme/i }))
    expect(document.documentElement.dataset.theme).toMatch(/^(light|dark)$/)
  })

  it('flips between the two explicit states and persists the choice', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /theme/i })

    await user.click(button)
    const first = document.documentElement.dataset.theme
    await user.click(button)
    const second = document.documentElement.dataset.theme

    expect(second).not.toBe(first)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(second)
  })

  it('survives a storage write that throws', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /theme/i })

    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      throw new Error('blocked')
    }
    try {
      // setAttribute runs before the throwing setItem, so this assertion would
      // hold even without the try/catch in toggle() — the real regression
      // guard here is that userEvent.click above doesn't throw at all. An
      // uncaught error inside the click handler fails this test as an
      // unhandled error, which is what a missing try/catch would produce.
      await user.click(button)
      expect(document.documentElement.dataset.theme).toMatch(/^(light|dark)$/)
    } finally {
      Storage.prototype.setItem = original
    }
  })

  it('renders both icons on first paint, hidden from the accessibility tree', () => {
    // CSS, not React state, decides which icon shows — otherwise the toggle
    // would render the wrong icon until hydration completes.
    const { container } = render(<ThemeToggle />)
    const icons = container.querySelectorAll('svg')
    expect(icons).toHaveLength(2)
    for (const icon of icons) {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    }
  })
})
