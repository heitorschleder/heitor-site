'use client'

import { Moon, Sun } from 'lucide-react'

type Theme = 'light' | 'dark'

function currentTheme(): Theme {
  const stamped = document.documentElement.getAttribute('data-theme')
  if (stamped === 'light' || stamped === 'dark') return stamped
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Both icons render; CSS shows one. A state-driven version renders the wrong
 * icon until hydration, which would contradict the no-flash theme script.
 */
export function ThemeToggle() {
  function toggle() {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Private mode or blocked site data. The choice still applies for this page.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch theme"
      className="flex size-11 items-center justify-center border border-[var(--color-rule)] text-[var(--color-mute)] transition-colors hover:border-[var(--color-acc)] hover:text-[var(--color-acc)] @min-[560px]:size-[30px]"
    >
      <Sun className="theme-to-light size-[15px]" aria-hidden="true" />
      <Moon className="theme-to-dark size-[15px]" aria-hidden="true" />
    </button>
  )
}
