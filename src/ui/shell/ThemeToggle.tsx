'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'light' | 'dark'

function currentTheme(): Theme {
  const stamped = document.documentElement.getAttribute('data-theme')
  if (stamped === 'light' || stamped === 'dark') return stamped
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)

  // Read after mount: the server has no way to know the visitor's choice, and
  // guessing here would produce a hydration mismatch.
  useEffect(() => {
    try {
      setTheme(currentTheme())
    } catch {
      setTheme('light')
    }
  }, [])

  function toggle() {
    const next: Theme = (theme ?? currentTheme()) === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Private mode or blocked site data. The choice still applies for this page.
    }
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch theme"
      className="flex size-11 items-center justify-center border border-[var(--color-rule)] text-[var(--color-mute)] transition-colors hover:border-[var(--color-acc)] hover:text-[var(--color-acc)] @min-[560px]:size-[30px]"
    >
      {theme === 'dark' ? <Sun className="size-[15px]" /> : <Moon className="size-[15px]" />}
    </button>
  )
}
