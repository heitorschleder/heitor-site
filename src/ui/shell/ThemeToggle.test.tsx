import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

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
    expect(localStorage.getItem('theme')).toBe(second)
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
      await user.click(button)
      expect(document.documentElement.dataset.theme).toMatch(/^(light|dark)$/)
    } finally {
      Storage.prototype.setItem = original
    }
  })
})
