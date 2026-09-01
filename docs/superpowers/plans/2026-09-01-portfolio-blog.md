# Portfólio + Blog pessoal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Heitor Schleder's canonical personal site — an English portfolio and blog in the Field Console visual direction, mobile first, light and dark.

**Architecture:** Next.js App Router with static output. Domain modules (`src/modules/*`) compose a domain-free UI layer (`src/ui/*`); the dependency arrow only ever points inward. Two content pipelines feed the pages: Velite validates MDX at build time, and a separate build-time loader pulls the 22 public repositories from the GitHub GraphQL API. Nothing fetches at runtime.

**Tech Stack:** Next.js 16.3.4 · React 19 · TypeScript 5 · Tailwind CSS v4.3 · Velite 0.4 · lucide-react 1.39 · Vitest 4 · Testing Library · jest-axe

**Spec:** `docs/superpowers/specs/2026-09-01-portfolio-blog-design.md`

---

## Global Constraints

- **Language:** every user-facing string is English. No i18n, `lang="en"` fixed on `<html>`.
- **Node:** `>=20.9.0` (Next 16 floor). Local toolchain is v20.20.2.
- **Accent:** `#5F9CF7` dark / `#1B4CC9` light. Never one hex for both themes.
- **Typography:** Barlow Condensed (headings), Barlow (body), IBM Plex Mono (readouts, dates, code). Google Fonts via `next/font/google`.
- **Mobile first:** base styles target 390px. Component breakpoints are **container queries** (`@container`), never viewport media queries. Only page-level gutters may use viewport breakpoints.
- **Touch targets:** minimum 44×44px on interactive elements in the narrow layout.
- **Theme:** three states — explicit `data-theme="light"`, explicit `data-theme="dark"`, and unstamped (follows `prefers-color-scheme`). Every token declared in bare `:root` before any override block.
- **Icons:** lucide for interface. GitHub and LinkedIn are **vendored Tabler SVG paths** (MIT) — lucide 1.39 ships no brand marks and simple-icons no longer ships LinkedIn. Both verified against published packages on 2026-09-01.
- **No runtime data fetching.** Any network call happens at build time or not at all.
- **Commits:** conventional prefixes (`feat:`, `test:`, `chore:`, `docs:`), one per task step where the plan says so.

### Deviation from the spec — read before Task 4

The spec locked "Tailwind v4 + shadcn/ui", with shadcn as the source of accessible primitives. Building the component inventory revealed the design contains **no dialog, no dropdown, no tabs, no popover** — the only disclosure is the career accordion, and the only other interactive elements are a theme toggle and a "show all" button.

This plan therefore uses **native `<details>`/`<summary>`** for the career accordion instead of Radix Accordion, and installs no Radix primitives in v1. Reasons, in the order that matters:

1. The spec's own argument for inline-over-modal was indexability and printability. `<details>` works with JavaScript disabled, Chrome's find-in-page opens closed `<details>` to reveal a match, and the career panel stays a **Server Component** with zero hydration cost.
2. Keyboard support, `aria-expanded` semantics and focus order come from the platform, correct by construction, with nothing to maintain.
3. Radix Accordion would force the whole career panel to `"use client"` to deliver behaviour the browser already has.

shadcn's conventions still apply — the `cn` helper and CSS-variable theming — and `components.json` is configured in Task 1, so `npx shadcn@latest add dialog` is one command away the day a real dialog appears. **Do not add primitives speculatively.**

---

## File Structure

```
src/
  app/
    layout.tsx                     root html, fonts, theme script, AppShell
    page.tsx                       Home
    globals.css                    @theme tokens, base layer, prose
    work/page.tsx                  full repository grid
    blog/page.tsx                  writing index
    blog/[slug]/page.tsx           article
    about/page.tsx                 bio, education, contact
    sitemap.ts
    rss.xml/route.ts
  modules/
    career/
      career.data.ts               the four roles, typed
      CareerPanel.tsx              server component, <details> rows
      index.ts
    repositories/
      github.ts                    build-time GraphQL loader
      repos.types.ts               Repository — deliberately no isPrivate
      RepositoryGrid.tsx           server component
      RepositoryExpander.tsx       client, show 10 -> 22
      index.ts
    writing/
      PostList.tsx
      PostArticle.tsx
      index.ts
    profile/
      TechnologyMatrix.tsx
      EducationPanel.tsx
      profile.data.ts
      index.ts
  ui/
    atoms/       Chip.tsx  Tk.tsx  Readout.tsx  Rule.tsx
    molecules/   Panel.tsx  PanelHeader.tsx  FilterStrip.tsx
    shell/       AppShell.tsx  SiteNav.tsx  SiteFooter.tsx  ThemeToggle.tsx
    icons/       index.ts  BrandGithub.tsx  BrandLinkedin.tsx
  shared/
    cn.ts
    site.config.ts
    seo.ts
content/
  posts/*.mdx
  repos.overrides.ts
velite.config.ts
```

---

### Task 1: Scaffold, toolchain, first green test

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.mts`, `vitest.setup.ts`, `components.json`, `src/shared/cn.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Test: `src/shared/cn.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `cn(...inputs: ClassValue[]): string` from `@/shared/cn`. Path alias `@/*` → `./src/*`. Scripts `dev`, `build`, `test`, `lint`.

- [ ] **Step 1: Scaffold the app**

Run from the repo root (the directory already contains `README.md`, `.gitignore` and `docs/`, so scaffold in place):

```bash
npx create-next-app@16.3.4 . \
  --typescript --tailwind --app --src-dir --turbopack \
  --import-alias "@/*" --eslint --no-install --yes
npm install
npm install clsx tailwind-merge
npm install -D vitest@4 @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/dom @testing-library/user-event \
  @testing-library/jest-dom jest-axe @types/jest-axe
```

If the scaffolder refuses because the directory is not empty, pass `--yes` and accept the overwrite prompt for `README.md` only — then restore it with `git checkout README.md`.

- [ ] **Step 2: Configure Vitest**

Create `vitest.config.mts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '#content': resolve(__dirname, './.velite'),
    },
  },
})
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
import { expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Write the failing test**

Create `src/shared/cn.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c')
  })

  it('lets a later tailwind class win over an earlier conflicting one', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
```

- [ ] **Step 4: Run the test and confirm it fails**

Run: `npm test -- src/shared/cn.test.ts`
Expected: FAIL — `Failed to resolve import "./cn"`.

- [ ] **Step 5: Implement `cn`**

Create `src/shared/cn.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Join class names, letting a later Tailwind utility beat an earlier conflicting one. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 6: Run the test and confirm it passes**

Run: `npm test -- src/shared/cn.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 7: Configure shadcn without adding primitives**

Create `components.json` so the CLI is ready later. Do **not** run `npx shadcn add` for anything in v1 — see the deviation note above.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/ui",
    "utils": "@/shared/cn",
    "ui": "@/ui/primitives"
  }
}
```

- [ ] **Step 8: Verify the app builds and boots**

Run: `npm run build`
Expected: build succeeds, no type errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold next 16 + tailwind v4 + vitest harness"
```

---

### Task 2: Design tokens and the three-state theme

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`
- Create: `src/ui/shell/ThemeToggle.tsx`, `src/ui/shell/theme-script.ts`
- Test: `src/ui/shell/ThemeToggle.test.tsx`, `src/app/globals.test.ts`

**Interfaces:**
- Consumes: `cn` from Task 1.
- Produces: CSS custom properties `--color-bg|panel|panel-2|rule|ink|mute|acc|on-acc|wash|glow`; `<ThemeToggle />`; `THEME_SCRIPT` string for inline injection.

- [ ] **Step 1: Write the failing token test**

The point of this test is the classic unreadable-artifact bug: a colour whose only definition lives inside a media query. Create `src/app/globals.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve(__dirname, './globals.css'), 'utf8')

const TOKENS = [
  '--color-bg', '--color-panel', '--color-panel-2', '--color-rule',
  '--color-ink', '--color-mute', '--color-acc', '--color-on-acc',
  '--color-wash', '--color-glow',
]

/** Body of the bare :root block — the baseline every token must appear in. */
function bareRoot(): string {
  const i = css.indexOf(':root {')
  expect(i, 'globals.css must contain a bare `:root {` block').toBeGreaterThan(-1)
  return css.slice(i, css.indexOf('\n}', i))
}

describe('theme tokens', () => {
  it('declares every token in the bare :root block', () => {
    const root = bareRoot()
    for (const token of TOKENS) {
      expect(root, `${token} missing from bare :root`).toContain(token)
    }
  })

  it('redefines tokens for an explicit dark choice', () => {
    expect(css).toContain('[data-theme=\'dark\']')
  })

  it('guards the prefers-color-scheme block so an explicit light choice wins', () => {
    expect(css).toContain('prefers-color-scheme: dark')
    expect(css).toContain(':root:not([data-theme=\'light\'])')
  })

  it('uses two accent values, never one hex for both themes', () => {
    expect(css).toContain('#5F9CF7')
    expect(css).toContain('#1B4CC9')
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- src/app/globals.test.ts`
Expected: FAIL — tokens missing from bare `:root`.

- [ ] **Step 3: Write the token layer**

Replace `src/app/globals.css` entirely:

```css
@import 'tailwindcss';

@theme {
  --font-display: var(--font-barlow-condensed), ui-sans-serif, system-ui, sans-serif;
  --font-sans: var(--font-barlow), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-plex-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
}

/* Light is the baseline. Every token is declared here before any block overrides it;
   the neutral ground is mixed with a few percent of the accent, which is what keeps
   the greys from reading as an unconsidered default. */
:root {
  --color-acc: #1B4CC9;
  --color-on-acc: #FFFFFF;
  --color-bg: color-mix(in oklab, var(--color-acc) 4%, #EFF1F3);
  --color-panel: color-mix(in oklab, var(--color-acc) 2%, #FCFCFD);
  --color-panel-2: color-mix(in oklab, var(--color-acc) 6%, #E5E8EB);
  --color-rule: color-mix(in oklab, var(--color-acc) 15%, #C4CACE);
  --color-ink: #131719;
  --color-mute: #5C6367;
  --color-wash: color-mix(in oklab, var(--color-acc) 9%, transparent);
  --color-glow: color-mix(in oklab, var(--color-acc) 16%, transparent);
  color-scheme: light;
}

/* Unstamped document following a dark OS. Guarded so an explicit light choice still wins. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --color-acc: #5F9CF7;
    --color-on-acc: #080C12;
    --color-bg: color-mix(in oklab, var(--color-acc) 5%, #121415);
    --color-panel: color-mix(in oklab, var(--color-acc) 6%, #1A1D1F);
    --color-panel-2: color-mix(in oklab, var(--color-acc) 9%, #232729);
    --color-rule: color-mix(in oklab, var(--color-acc) 13%, #2B3033);
    --color-ink: #E8EAEC;
    --color-mute: #8C9298;
    --color-wash: color-mix(in oklab, var(--color-acc) 14%, transparent);
    --color-glow: color-mix(in oklab, var(--color-acc) 22%, transparent);
    color-scheme: dark;
  }
}

/* Explicit dark choice, so the toggle wins in the other direction too. */
:root[data-theme='dark'] {
  --color-acc: #5F9CF7;
  --color-on-acc: #080C12;
  --color-bg: color-mix(in oklab, var(--color-acc) 5%, #121415);
  --color-panel: color-mix(in oklab, var(--color-acc) 6%, #1A1D1F);
  --color-panel-2: color-mix(in oklab, var(--color-acc) 9%, #232729);
  --color-rule: color-mix(in oklab, var(--color-acc) 13%, #2B3033);
  --color-ink: #E8EAEC;
  --color-mute: #8C9298;
  --color-wash: color-mix(in oklab, var(--color-acc) 14%, transparent);
  --color-glow: color-mix(in oklab, var(--color-acc) 22%, transparent);
  color-scheme: dark;
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-ink);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
  :where(a, button, summary):focus-visible {
    outline: 2px solid var(--color-acc);
    outline-offset: 2px;
  }
  ::selection {
    background: var(--color-wash);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm test -- src/app/globals.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Write the failing ThemeToggle test**

Create `src/ui/shell/ThemeToggle.test.tsx`:

```tsx
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

  it('survives a storage read that throws', () => {
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = () => {
      throw new Error('blocked')
    }
    expect(() => render(<ThemeToggle />)).not.toThrow()
    Storage.prototype.getItem = original
  })
})
```

- [ ] **Step 6: Run the test and confirm it fails**

Run: `npm test -- src/ui/shell/ThemeToggle.test.tsx`
Expected: FAIL — cannot resolve `./ThemeToggle`.

- [ ] **Step 7: Implement the theme script and toggle**

Create `src/ui/shell/theme-script.ts`:

```ts
/**
 * Runs before first paint, inline in <head>. Without it the page renders in the
 * OS theme for one frame and then snaps to the stored choice.
 * Kept as a string because it must not wait on the React bundle.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`
```

Create `src/ui/shell/ThemeToggle.tsx`:

```tsx
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
```

Note the size pair: 44px in the narrow layout to meet the touch target constraint, 30px once the container is wide enough for a pointer.

- [ ] **Step 8: Run the test and confirm it passes**

Run: `npm test -- src/ui/shell/ThemeToggle.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 9: Wire fonts and the theme script into the layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed, IBM_Plex_Mono } from 'next/font/google'
import { THEME_SCRIPT } from '@/ui/shell/theme-script'
import { site } from '@/shared/site.config'
import './globals.css'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-barlow',
  display: 'swap',
})
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${barlow.variable} ${barlowCondensed.variable} ${plexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

`suppressHydrationWarning` on `<html>` is required: the inline script mutates the element before React hydrates it.

- [ ] **Step 10: Create the site config the layout imports**

Create `src/shared/site.config.ts`:

```ts
export const site = {
  name: 'Heitor Schleder',
  title: 'Heitor Schleder — Full Stack Developer',
  description:
    'Full stack developer building fleet software across three stacks — React on the web, Flutter in the field, Java behind both.',
  url: 'https://heitorschleder.dev',
  location: 'Palhoça, SC — Brazil',
  social: {
    github: { label: 'github.com/heitorschleder', href: 'https://github.com/heitorschleder' },
    linkedin: {
      label: 'linkedin.com/in/heitor-schleder',
      href: 'https://www.linkedin.com/in/heitor-schleder-10345a1ab/',
    },
    email: { label: 'heitorschleder33@gmail.com', href: 'mailto:heitorschleder33@gmail.com' },
    rss: { label: 'rss', href: '/rss.xml' },
  },
} as const

export const GITHUB_LOGIN = 'heitorschleder'
```

`site.url` is a placeholder until the domain is decided — it only affects canonical URLs and OG tags, and changing it is a one-line edit.

- [ ] **Step 11: Verify build and full suite**

Run: `npm run build && npm test`
Expected: build succeeds; all tests pass.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: design tokens and three-state theme with no-flash script"
```

---

### Task 3: Icon layer

**Files:**
- Create: `src/ui/icons/BrandGithub.tsx`, `src/ui/icons/BrandLinkedin.tsx`, `src/ui/icons/index.ts`
- Test: `src/ui/icons/icons.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `BrandGithub`, `BrandLinkedin` — both accept `React.SVGProps<SVGSVGElement>`. `src/ui/icons/index.ts` re-exports every icon the app uses, so no component imports `lucide-react` directly.

- [ ] **Step 1: Write the failing test**

Create `src/ui/icons/icons.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrandGithub, BrandLinkedin } from './index'

describe('vendored brand marks', () => {
  it.each([
    ['github', BrandGithub],
    ['linkedin', BrandLinkedin],
  ])('%s matches the lucide drawing convention', (_name, Icon) => {
    const { container } = render(<Icon />)
    const svg = container.querySelector('svg')!

    // lucide 1.39 ships no brand marks, so these are Tabler paths. They only sit
    // beside lucide icons convincingly if they share its drawing convention.
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).toHaveAttribute('stroke-width', '2')
    expect(svg).toHaveAttribute('stroke-linecap', 'round')
    expect(svg).toHaveAttribute('stroke-linejoin', 'round')
  })

  it('forwards className so callers control size', () => {
    const { container } = render(<BrandGithub className="size-4" />)
    expect(container.querySelector('svg')).toHaveClass('size-4')
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- src/ui/icons/icons.test.tsx`
Expected: FAIL — cannot resolve `./index`.

- [ ] **Step 3: Vendor the two Tabler marks**

Create `src/ui/icons/BrandGithub.tsx`:

```tsx
import type { SVGProps } from 'react'

/**
 * Tabler Icons `brand-github` (MIT). Vendored rather than installed:
 * lucide 1.39 ships no brand marks, and pulling ~5,900 icons for two files is
 * the wrong trade. Tabler's 24x24 grid and 2px round stroke match lucide exactly.
 */
export function BrandGithub(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
    </svg>
  )
}
```

Create `src/ui/icons/BrandLinkedin.tsx`:

```tsx
import type { SVGProps } from 'react'

/** Tabler Icons `brand-linkedin` (MIT). See BrandGithub for why these are vendored. */
export function BrandLinkedin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 11v5" />
      <path d="M8 8v.01" />
      <path d="M12 16v-5" />
      <path d="M16 16v-3a2 2 0 1 0 -4 0" />
      <path d="M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4l0 -10" />
    </svg>
  )
}
```

- [ ] **Step 4: Create the single icon entry point**

Create `src/ui/icons/index.ts`:

```ts
// Every icon the app uses passes through here, so swapping a set later is one file.
export {
  ArrowUpRight,
  Briefcase,
  ChevronDown,
  Cpu,
  GitBranch,
  GraduationCap,
  Mail,
  MapPin,
  Moon,
  Rss,
  ScanLine,
  Sun,
} from 'lucide-react'

export { BrandGithub } from './BrandGithub'
export { BrandLinkedin } from './BrandLinkedin'
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `npm test -- src/ui/icons/icons.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: icon layer with vendored tabler brand marks"
```

---

### Task 4: UI atoms and panel molecules

**Files:**
- Create: `src/ui/atoms/Chip.tsx`, `src/ui/atoms/Tk.tsx`, `src/ui/molecules/Panel.tsx`, `src/ui/molecules/FilterStrip.tsx`
- Test: `src/ui/atoms/atoms.test.tsx`, `src/ui/molecules/Panel.test.tsx`

**Interfaces:**
- Consumes: `cn` (Task 1), icons (Task 3).
- Produces:
  - `Chip({ children, tone?: 'accent' | 'quiet', className? })`
  - `Tk({ children, core?: boolean })` — a technology token
  - `Panel({ title, icon, meta?, children, className? })` and `PanelBody`
  - `FilterStrip({ items: { label: string; count: number; active?: boolean }[] })`

- [ ] **Step 1: Write the failing atoms test**

Create `src/ui/atoms/atoms.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- src/ui/atoms/atoms.test.tsx`
Expected: FAIL — cannot resolve `./Chip`.

- [ ] **Step 3: Implement the atoms**

Create `src/ui/atoms/Chip.tsx`:

```tsx
import { cn } from '@/shared/cn'

export function Chip({
  children,
  tone = 'accent',
  className,
}: {
  children: React.ReactNode
  tone?: 'accent' | 'quiet'
  className?: string
}) {
  return (
    <span
      className={cn(
        'font-mono text-[10px] uppercase tracking-[0.07em] whitespace-nowrap px-[7px] py-[2px] border',
        tone === 'accent'
          ? 'text-[var(--color-acc)] border-[var(--color-acc)] bg-[var(--color-wash)]'
          : 'text-[var(--color-mute)] border-[var(--color-rule)]',
        className,
      )}
    >
      {children}
    </span>
  )
}
```

Create `src/ui/atoms/Tk.tsx`:

```tsx
import { cn } from '@/shared/cn'

/** A technology token. `core` marks a daily driver. */
export function Tk({ children, core = false }: { children: React.ReactNode; core?: boolean }) {
  return (
    <span
      className={cn(
        'text-[11.5px] leading-none px-2 py-[4px] border whitespace-nowrap',
        core
          ? 'text-[var(--color-acc)] border-[var(--color-acc)] bg-[var(--color-wash)]'
          : 'text-[var(--color-ink)] border-[var(--color-rule)]',
      )}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm test -- src/ui/atoms/atoms.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the failing Panel test**

Create `src/ui/molecules/Panel.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Panel } from './Panel'
import { FilterStrip } from './FilterStrip'
import { Cpu } from '@/ui/icons'

describe('Panel', () => {
  it('renders its title as a heading so the page has an outline', () => {
    render(
      <Panel title="Technologies" icon={Cpu}>
        <p>body</p>
      </Panel>,
    )
    expect(screen.getByRole('heading', { name: 'Technologies' })).toBeInTheDocument()
  })

  it('renders optional meta text', () => {
    render(
      <Panel title="Career" icon={Cpu} meta="4 roles">
        <p>body</p>
      </Panel>,
    )
    expect(screen.getByText('4 roles')).toBeInTheDocument()
  })

  it('renders its children', () => {
    render(
      <Panel title="Career" icon={Cpu}>
        <p>the body</p>
      </Panel>,
    )
    expect(screen.getByText('the body')).toBeInTheDocument()
  })
})

describe('FilterStrip', () => {
  it('shows a label and count per item', () => {
    render(
      <FilterStrip
        items={[
          { label: 'All', count: 22, active: true },
          { label: 'Vue', count: 10 },
        ]}
      />,
    )
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('22')).toBeInTheDocument()
    expect(screen.getByText('Vue')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run the test and confirm it fails**

Run: `npm test -- src/ui/molecules/Panel.test.tsx`
Expected: FAIL — cannot resolve `./Panel`.

- [ ] **Step 7: Implement the molecules**

Create `src/ui/molecules/Panel.tsx`:

```tsx
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/cn'

export function Panel({
  title,
  icon: Icon,
  meta,
  children,
  className,
}: {
  title: string
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>
  meta?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'mx-[10px] my-3 border border-[var(--color-rule)] bg-[var(--color-panel)]',
        '@min-[560px]:mx-4 @min-[560px]:my-[14px]',
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-rule)] px-3 py-[7px]">
        <h2 className="flex items-center gap-2 font-display text-[12.5px] font-semibold uppercase tracking-[0.17em] text-[var(--color-ink)]">
          <Icon className="size-[13px] text-[var(--color-acc)]" aria-hidden="true" />
          {title}
        </h2>
        {meta ? (
          <p className="font-mono text-[10px] tracking-[0.08em] text-[var(--color-mute)]">{meta}</p>
        ) : null}
      </header>
      {children}
    </section>
  )
}
```

Create `src/ui/molecules/FilterStrip.tsx`:

```tsx
import { cn } from '@/shared/cn'

export type FilterItem = { label: string; count: number; active?: boolean }

/**
 * Static in v1: it reports the shape of the collection rather than filtering it.
 * Twenty-two repositories do not need client-side faceting to be scannable.
 */
export function FilterStrip({ items }: { items: FilterItem[] }) {
  return (
    <ul className="flex flex-wrap border-b border-[var(--color-rule)]">
      {items.map((item) => (
        <li
          key={item.label}
          className={cn(
            'flex items-center gap-[7px] border-r border-[var(--color-rule)] px-[11px] py-[7px]',
            'font-mono text-[10px] uppercase tracking-[0.09em]',
            item.active
              ? 'bg-[var(--color-wash)] text-[var(--color-acc)]'
              : 'text-[var(--color-mute)]',
          )}
        >
          <span>{item.label}</span>
          <b className={cn('font-normal', item.active ? '' : 'text-[var(--color-ink)]')}>
            {item.count}
          </b>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 8: Run the test and confirm it passes**

Run: `npm test -- src/ui/molecules/Panel.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: panel and chip primitives for the console layer"
```

---

### Task 5: App shell — nav and footer

**Files:**
- Create: `src/ui/shell/SiteNav.tsx`, `src/ui/shell/SiteFooter.tsx`, `src/ui/shell/AppShell.tsx`
- Test: `src/ui/shell/SiteNav.test.tsx`, `src/ui/shell/SiteFooter.test.tsx`

**Interfaces:**
- Consumes: `site` (Task 2), icons (Task 3), `ThemeToggle` (Task 2).
- Produces: `AppShell({ children })` wrapping every route; it is the `@container/shell` element that all component breakpoints resolve against.

- [ ] **Step 1: Write the failing nav test**

Create `src/ui/shell/SiteNav.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SiteNav } from './SiteNav'

describe('SiteNav', () => {
  it('exposes the three routes as links', () => {
    render(<SiteNav pathname="/" />)
    for (const name of ['Work', 'Writing', 'About']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument()
    }
  })

  it('marks the active route for assistive tech', () => {
    render(<SiteNav pathname="/blog" />)
    expect(screen.getByRole('link', { name: 'Writing' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Work' })).not.toHaveAttribute('aria-current')
  })

  it('links out to every social destination with an accessible name', () => {
    render(<SiteNav pathname="/" />)
    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
      'href',
      'https://github.com/heitorschleder',
    )
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /rss/i })).toBeInTheDocument()
  })

  it('does not advertise availability', () => {
    render(<SiteNav pathname="/" />)
    expect(screen.queryByText(/open to work/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- src/ui/shell/SiteNav.test.tsx`
Expected: FAIL — cannot resolve `./SiteNav`.

- [ ] **Step 3: Implement the nav**

Create `src/ui/shell/SiteNav.tsx`:

```tsx
import Link from 'next/link'
import { cn } from '@/shared/cn'
import { site } from '@/shared/site.config'
import { BrandGithub, BrandLinkedin, Mail, Rss } from '@/ui/icons'
import { ThemeToggle } from './ThemeToggle'

const ROUTES = [
  { href: '/work', label: 'Work' },
  { href: '/blog', label: 'Writing' },
  { href: '/about', label: 'About' },
] as const

const SOCIAL = [
  { key: 'GitHub', icon: BrandGithub, ...site.social.github },
  { key: 'LinkedIn', icon: BrandLinkedin, ...site.social.linkedin },
  { key: 'Email', icon: Mail, ...site.social.email },
  { key: 'RSS', icon: Rss, ...site.social.rss },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteNav({ pathname }: { pathname: string }) {
  return (
    <nav
      className={cn(
        'flex flex-wrap items-center justify-between gap-[10px] border-b border-[var(--color-rule)]',
        'bg-[var(--color-panel)] px-3 pt-2 pb-0',
        '@min-[560px]:px-[14px] @min-[560px]:py-2',
      )}
    >
      <Link
        href="/"
        className="order-1 font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)]"
      >
        H. Schleder
      </Link>

      {/* Three links do not earn a hamburger. Below 560px they take a full-bleed
          row of their own, each one a 44px tap target. */}
      <ul
        className={cn(
          'order-3 -mx-3 mt-2 flex w-full border-t border-[var(--color-rule)]',
          '@min-[560px]:order-2 @min-[560px]:m-0 @min-[560px]:w-auto @min-[560px]:gap-[15px] @min-[560px]:border-t-0',
        )}
      >
        {ROUTES.map(({ href, label }) => {
          const active = isActive(pathname, href)
          return (
            <li
              key={href}
              className="flex-1 border-r border-[var(--color-rule)] last:border-r-0 @min-[560px]:flex-none @min-[560px]:border-r-0"
            >
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center justify-center font-display text-[13.5px] font-semibold uppercase tracking-[0.13em]',
                  '@min-[560px]:min-h-0 @min-[560px]:text-[13px]',
                  active ? 'text-[var(--color-acc)]' : 'text-[var(--color-mute)]',
                )}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="order-2 flex items-center gap-px @min-[560px]:order-3">
        {SOCIAL.map(({ key, icon: Icon, href }) => (
          <a
            key={key}
            href={href}
            aria-label={key}
            className="flex size-11 items-center justify-center border border-transparent text-[var(--color-mute)] transition-colors hover:border-[var(--color-rule)] hover:text-[var(--color-acc)] @min-[560px]:size-[30px]"
          >
            <Icon className="size-[15px]" aria-hidden="true" />
          </a>
        ))}
        <span
          aria-hidden="true"
          className="mx-[7px] h-[15px] w-px shrink-0 bg-[var(--color-rule)]"
        />
        <ThemeToggle />
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm test -- src/ui/shell/SiteNav.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Write the failing footer test**

Create `src/ui/shell/SiteFooter.test.tsx`:

```tsx
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
```

- [ ] **Step 6: Run the test and confirm it fails**

Run: `npm test -- src/ui/shell/SiteFooter.test.tsx`
Expected: FAIL — cannot resolve `./SiteFooter`.

- [ ] **Step 7: Implement the footer and shell**

Create `src/ui/shell/SiteFooter.tsx`:

```tsx
import { site } from '@/shared/site.config'
import { BrandGithub, BrandLinkedin, Mail, MapPin } from '@/ui/icons'

const LINKS = [
  { key: 'GitHub', icon: BrandGithub, ...site.social.github },
  { key: 'LinkedIn', icon: BrandLinkedin, ...site.social.linkedin },
  { key: 'Email', icon: Mail, ...site.social.email },
]

/**
 * The nav carries the same links as bare icons, which serves a visitor who
 * already knows what they are looking for. Here the destination is spelled out,
 * which serves the one who arrived from a post.
 */
export function SiteFooter() {
  return (
    <footer className="mt-4 border-t border-[var(--color-rule)] bg-[var(--color-panel)] px-3 py-5 @min-[560px]:px-4">
      <ul className="flex flex-col gap-3 @min-[560px]:flex-row @min-[560px]:flex-wrap @min-[560px]:gap-x-6">
        {LINKS.map(({ key, icon: Icon, href, label }) => (
          <li key={key}>
            <a
              href={href}
              className="flex min-h-11 items-center gap-[10px] text-[14px] text-[var(--color-mute)] transition-colors hover:text-[var(--color-acc)] @min-[560px]:min-h-0"
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-center gap-[6px] font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--color-mute)]">
        <MapPin className="size-3 text-[var(--color-acc)]" aria-hidden="true" />
        {site.location}
      </p>
    </footer>
  )
}
```

Create `src/ui/shell/AppShell.tsx`:

```tsx
'use client'

import { usePathname } from 'next/navigation'
import { SiteNav } from './SiteNav'
import { SiteFooter } from './SiteFooter'

/**
 * The `@container/shell` here is load-bearing: every component breakpoint in the
 * app resolves against this element's width, not the viewport's. That is what
 * makes a panel behave the same on a phone and in a narrow column.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="@container/shell min-h-dvh bg-[var(--color-bg)]">
      <SiteNav pathname={pathname} />
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}
```

- [ ] **Step 8: Mount the shell in the layout**

In `src/app/layout.tsx`, import `AppShell` from `@/ui/shell/AppShell` and change the body to:

```tsx
      <body>
        <AppShell>{children}</AppShell>
      </body>
```

- [ ] **Step 9: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all tests pass; build succeeds.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: app shell with container-query nav and spelled-out footer links"
```

---

### Task 6: Career module

**Files:**
- Create: `src/modules/career/career.data.ts`, `src/modules/career/CareerPanel.tsx`, `src/modules/career/index.ts`
- Test: `src/modules/career/CareerPanel.test.tsx`

**Interfaces:**
- Consumes: `Panel` (Task 4), `Tk` (Task 4), icons (Task 3).
- Produces: `CareerPanel` (server component, no props) and `ROLES: Role[]` where

```ts
type Role = {
  id: string
  role: string
  company: string
  note?: string
  period: string
  duration: string
  stack: { name: string; core?: boolean }[]
  summary: string
  results: string[]   // may contain <b> for figures
  open?: boolean
}
```

- [ ] **Step 1: Write the failing test**

Create `src/modules/career/CareerPanel.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CareerPanel } from './CareerPanel'
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
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- src/modules/career/CareerPanel.test.tsx`
Expected: FAIL — cannot resolve `./CareerPanel`.

- [ ] **Step 3: Write the career data**

Facts come from `heitor-curriculum/src/Blocks.md` and the promotion dates Heitor confirmed on 2026-09-01. **Do not invent or inflate a figure.**

Create `src/modules/career/career.data.ts`:

```ts
export type Role = {
  id: string
  role: string
  company: string
  note?: string
  period: string
  duration: string
  stack: { name: string; core?: boolean }[]
  summary: string
  results: string[]
  open?: boolean
}

export const CAREER_HEADLINE = 'Intern to Tech Lead in 13 months · 4 roles · 2 companies'

export const ROLES: Role[] = [
  {
    id: 'prologapp-dev',
    role: 'Software Developer',
    company: 'PrologApp',
    note: 'Full stack',
    period: 'Jun 2025 —',
    duration: '1 yr 3 mo',
    open: true,
    stack: [
      { name: 'React', core: true },
      { name: 'Flutter', core: true },
      { name: 'Java', core: true },
      { name: 'Python' },
    ],
    summary:
      'Full stack on a fleet management product used by more than 1,000 logistics companies, built across three stacks at once — React on the web, Flutter on mobile, Java on the backend — so the same feature lands consistently on every platform.',
    results: [
      'An image-recognition step in Python that checks whether a reported defect is really in the photo, telling a broken headlight from a flat tire. <b>99% accuracy</b> across <b>30+ defect types</b>, <b>60,000 images a day</b>, for under <b>US$25 a month</b> on a deliberately small model.',
      'Found and closed a Java backend bug in my first week that let users wipe a business-critical table. Replaced hard deletes with a soft-delete flag and put a validation guard in front of destructive actions.',
      'Rebuilt a heavy data table with list virtualization in React, removing the freezes that had made the screen unusable for a large client — and keeping an account that was already heading toward a refund.',
      'Cut a manual validation step from <b>10 minutes to 3</b> and removed transcription errors by reading values such as odometer readings straight from the image.',
      'Shipped real-time licence plate recognition with OCR in the Flutter app, taking manual plate entry out of the daily routine of drivers in the field.',
    ],
  },
  {
    id: 'kebook-lead',
    role: 'Tech Lead',
    company: 'Kebook',
    note: 'Promoted from Frontend Jr',
    period: 'Dec 2023 – Jun 2025',
    duration: '1 yr 7 mo',
    stack: [
      { name: 'Next.js', core: true },
      { name: 'Nuxt', core: true },
      { name: 'NGINX' },
      { name: 'CI/CD' },
    ],
    summary:
      'Led a four-developer team while staying hands-on across the whole cycle — front end, e-commerce integrations, and the hosting infrastructure underneath them.',
    results: [
      'Led a team of <b>4 developers</b>: defined the reference architectures, enforced coding standards through code review, and put CI/CD pipelines in place.',
      "Rebuilt the company's hosting infrastructure, cutting the annual bill from <b>R$45,000 to R$15,000</b> — two thirds off, every year, permanently.",
      'Mentored the team on SOLID and Clean Code, and drove the adoption of Scrum and Kanban.',
    ],
  },
  {
    id: 'kebook-jr',
    role: 'Frontend Developer Jr',
    company: 'Kebook',
    note: 'Promoted from Intern',
    period: 'Dec 2022 – Dec 2023',
    duration: '1 yr',
    stack: [
      { name: 'Vue', core: true },
      { name: 'Nuxt', core: true },
      { name: 'React' },
      { name: 'Node.js' },
    ],
    summary:
      'A year owning front-end delivery — and the internal tooling that changed how fast the whole team could ship.',
    results: [
      'Built, with the team, an internal tool that automated landing page production. A page that took <b>4 to 5 days</b> to assemble by hand started going out in <b>about 3 hours</b> — roughly <b>90% off the build time</b> — by standardising the steps that were being redone from scratch every time.',
      'Built responsive interfaces in React and Vue with SSR (Next.js and Nuxt), reaching <b>under 1s in Lighthouse</b> on two SPAs of more than <b>1,000 pages</b> each.',
      'Implemented webhooks that kept transactions, inventory and sales metrics in sync in real time — <b>3,000 dispatches a day</b> across every state of a sale, load-tested with headroom for <b>10,000</b>.',
      'Integrated REST and GraphQL APIs to make content dynamic, and instrumented tracking with Google Analytics and Meta Pixel.',
      'Promoted to Tech Lead after <b>exactly one year</b> in the role.',
    ],
  },
  {
    id: 'kebook-intern',
    role: 'Intern',
    company: 'Kebook',
    note: 'First role',
    period: 'Nov 2022 – Dec 2022',
    duration: '1 mo',
    stack: [{ name: 'HTML Email' }, { name: 'PHP' }, { name: 'Vue' }, { name: 'Nuxt' }],
    summary:
      'One month, and it covered both ends of the codebase at once: keeping the legacy system running while helping move the company off it.',
    results: [
      'Built and shipped a range of email marketing templates, the kind that have to render the same in every client including Outlook.',
      'Maintained the legacy PHP system while it was still carrying production traffic.',
      "Took part in the migration from PHP to Vue with Nuxt — the rewrite that set the company's front-end stack for the next two years.",
      'Promoted to Frontend Developer Jr after <b>one month</b>.',
    ],
  },
]
```

- [ ] **Step 4: Implement the panel**

Create `src/modules/career/CareerPanel.tsx`:

```tsx
import { Panel } from '@/ui/molecules/Panel'
import { Tk } from '@/ui/atoms/Tk'
import { Briefcase, ChevronDown } from '@/ui/icons'
import { CAREER_HEADLINE, ROLES } from './career.data'

/**
 * Native <details>, not a JS accordion. Résumé content has to be reachable by
 * find-in-page, by a crawler and by Print to PDF; the platform disclosure gives
 * all three plus keyboard support, and keeps this a Server Component.
 */
export function CareerPanel() {
  return (
    <Panel title="Career" icon={Briefcase} meta={CAREER_HEADLINE}>
      <div>
        {ROLES.map((role) => (
          <details
            key={role.id}
            open={role.open}
            className="group border-b border-[var(--color-rule)] last:border-b-0 open:bg-[var(--color-wash)]"
          >
            <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-x-[14px] gap-y-2 p-3 marker:content-none @min-[620px]:grid-cols-[124px_1fr_auto]">
              <span className="col-span-full font-mono text-[10.5px] uppercase leading-[1.6] tracking-[0.02em] text-[var(--color-mute)] tabular-nums group-open:text-[var(--color-acc)] @min-[620px]:col-span-1">
                {role.period}
                <br />
                {role.duration}
              </span>

              <span className="min-w-0">
                <b className="block font-display text-[19px] font-bold uppercase leading-[1.1] tracking-[0.03em] text-[var(--color-ink)]">
                  {role.role}
                </b>
                <span className="mt-[3px] block font-mono text-[10.5px] uppercase tracking-[0.07em] text-[var(--color-mute)]">
                  {role.company}
                  {role.note ? ` · ${role.note}` : ''}
                </span>
              </span>

              <span className="flex items-center gap-[10px] justify-self-end">
                <span className="hidden max-w-[270px] flex-wrap justify-end gap-[5px] @min-[820px]:flex">
                  {role.stack.map((t) => (
                    <Tk key={t.name} core={t.core}>
                      {t.name}
                    </Tk>
                  ))}
                </span>
                <ChevronDown
                  className="size-4 text-[var(--color-mute)] transition-transform group-open:rotate-180 group-open:text-[var(--color-acc)]"
                  aria-hidden="true"
                />
              </span>
            </summary>

            <div className="border-t border-dashed border-[var(--color-rule)] px-3 pb-4 pt-[2px]">
              <div className="mt-3 flex flex-wrap gap-[5px] @min-[820px]:hidden">
                {role.stack.map((t) => (
                  <Tk key={t.name} core={t.core}>
                    {t.name}
                  </Tk>
                ))}
              </div>

              <p className="my-3 max-w-[70ch] text-[14.5px] leading-[1.66] text-[var(--color-ink)]">
                {role.summary}
              </p>

              <p className="mb-2 font-display text-[11.5px] font-semibold uppercase tracking-[0.15em] text-[var(--color-acc)]">
                Key results
              </p>
              <ul className="flex flex-col gap-[7px]">
                {role.results.map((result, i) => (
                  <li key={i} className="grid grid-cols-[auto_1fr] gap-[10px]">
                    <span
                      aria-hidden="true"
                      className="mt-[8px] size-[5px] shrink-0 bg-[var(--color-acc)]"
                    />
                    <span
                      className="text-[14px] leading-[1.55] text-[var(--color-ink)] [&_b]:font-semibold [&_b]:tabular-nums"
                      dangerouslySetInnerHTML={{ __html: result }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </Panel>
  )
}
```

The `dangerouslySetInnerHTML` is safe here and nowhere else: the strings are authored in `career.data.ts`, are never user input, and only carry `<b>`.

- [ ] **Step 5: Run the test and confirm it passes**

Run: `npm test -- src/modules/career/CareerPanel.test.tsx`
Expected: PASS, 7 tests.

- [ ] **Step 6: Add the barrel and a print rule**

Create `src/modules/career/index.ts`:

```ts
export { CareerPanel } from './CareerPanel'
export { ROLES, CAREER_HEADLINE, type Role } from './career.data'
```

Append to `src/app/globals.css` — a recruiter really does print the page, and a closed disclosure prints as a headline with nothing under it:

```css
@media print {
  details > summary ~ * {
    display: revert !important;
  }
  details > summary {
    list-style: none;
  }
}
```

- [ ] **Step 7: Run the full suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: career panel as a native disclosure, printable and crawlable"
```

---

### Task 7: Repository loader

**Files:**
- Create: `src/modules/repositories/repos.types.ts`, `src/modules/repositories/github.ts`, `content/repos.overrides.ts`, `.env.example`
- Test: `src/modules/repositories/github.test.ts`

**Interfaces:**
- Consumes: `GITHUB_LOGIN` (Task 2).
- Produces:

```ts
type Repository = {          // deliberately has no isPrivate field
  name: string
  description: string
  language: string
  year: string
  url: string
  pinned: boolean
}
type LoadResult = { repos: Repository[]; missingOverrides: string[] }
async function loadRepositories(fetchImpl?: typeof fetch): Promise<LoadResult>
const REPO_OVERRIDES: Record<string, string>
```

- [ ] **Step 1: Write the failing test**

Create `src/modules/repositories/github.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { loadRepositories, GITHUB_QUERY } from './github'

function fakeFetch(payload: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 }))
}

const ONE_REPO = {
  data: {
    user: {
      repositories: {
        nodes: [
          {
            name: 'retrosite',
            description: 'Whatever GitHub says',
            url: 'https://github.com/heitorschleder/retrosite',
            pushedAt: '2026-08-12T19:59:18Z',
            primaryLanguage: { name: 'TypeScript' },
          },
        ],
      },
      pinnedItems: { nodes: [{ name: 'retrosite' }] },
    },
  },
}

describe('GITHUB_QUERY', () => {
  it('excludes private repositories in the query itself, not in a local filter', () => {
    // A filter bug could leak a name. There is nothing to leak when the data never arrives.
    expect(GITHUB_QUERY).toContain('privacy: PUBLIC')
  })

  it('never asks for isPrivate, so the field cannot reach the client', () => {
    expect(GITHUB_QUERY).not.toContain('isPrivate')
  })
})

describe('loadRepositories', () => {
  it('prefers the local English override over the GitHub description', async () => {
    const { repos } = await loadRepositories(fakeFetch(ONE_REPO) as unknown as typeof fetch)
    expect(repos[0].description).toContain('Conceptual HUD')
    expect(repos[0].description).not.toBe('Whatever GitHub says')
  })

  it('derives the year from pushedAt and marks pinned repositories', async () => {
    const { repos } = await loadRepositories(fakeFetch(ONE_REPO) as unknown as typeof fetch)
    expect(repos[0].year).toBe('2026')
    expect(repos[0].pinned).toBe(true)
  })

  it('sorts pinned first, then by most recent push', async () => {
    const payload = {
      data: {
        user: {
          repositories: {
            nodes: [
              { name: 'treino', description: null, url: 'u', pushedAt: '2022-09-13T00:00:00Z', primaryLanguage: { name: 'HTML' } },
              { name: 'Pokedex', description: null, url: 'u', pushedAt: '2024-11-18T00:00:00Z', primaryLanguage: { name: 'JavaScript' } },
              { name: 'HeiDev', description: null, url: 'u', pushedAt: '2026-06-28T00:00:00Z', primaryLanguage: { name: 'Dart' } },
            ],
          },
          pinnedItems: { nodes: [{ name: 'HeiDev' }] },
        },
      },
    }
    const { repos } = await loadRepositories(fakeFetch(payload) as unknown as typeof fetch)
    expect(repos.map((r) => r.name)).toEqual(['HeiDev', 'Pokedex', 'treino'])
  })

  it('reports a repository that has no override instead of silently shipping it', async () => {
    const payload = {
      data: {
        user: {
          repositories: {
            nodes: [
              { name: 'brand-new-repo', description: 'repositorio novo', url: 'u', pushedAt: '2026-09-01T00:00:00Z', primaryLanguage: null },
            ],
          },
          pinnedItems: { nodes: [] },
        },
      },
    }
    const { repos, missingOverrides } = await loadRepositories(fakeFetch(payload) as unknown as typeof fetch)
    expect(missingOverrides).toEqual(['brand-new-repo'])
    expect(repos[0].description).toBe('repositorio novo')
    expect(repos[0].language).toBe('Other')
  })

  it('fails the build when GitHub errors — a site with zero repositories is worse than no deploy', async () => {
    const failing = vi.fn(async () => new Response('nope', { status: 503 }))
    await expect(
      loadRepositories(failing as unknown as typeof fetch),
    ).rejects.toThrow(/GitHub/)
  })

  it('fails when GraphQL returns errors in a 200 response', async () => {
    const errored = fakeFetch({ errors: [{ message: 'Bad credentials' }] })
    await expect(
      loadRepositories(errored as unknown as typeof fetch),
    ).rejects.toThrow(/Bad credentials/)
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- src/modules/repositories/github.test.ts`
Expected: FAIL — cannot resolve `./github`.

- [ ] **Step 3: Write the descriptions override file**

All 22 in English. Create `content/repos.overrides.ts`:

```ts
/**
 * English descriptions for every public repository.
 *
 * The site is English and eight repositories are either undescribed or described
 * in Portuguese on GitHub. Keeping the copy here rather than on github.com means
 * it is reviewable in a diff and can say more than a single line.
 */
export const REPO_OVERRIDES: Record<string, string> = {
  retrosite:
    'Conceptual HUD for a fictional AI agent orchestrator, doubling as a reusable design system.',
  HeiDev: 'Flutter mobile app on a Supabase backend, with localisation wired in from the start.',
  'personal-page':
    'Portfolio in Nuxt 3 and shadcn-vue, showing past projects and study certificates.',
  'rick-and-morty-test':
    'Character browser for the Rick and Morty universe. Nuxt 3, GraphQL and Tailwind CSS.',
  'shipping-quote-app':
    'Shipping cost calculator between two Brazilian postcodes, priced from weight, dimensions and value.',
  'ecommerce-cars-test':
    'Car marketplace front end — listing, filtering and vehicle detail pages in TypeScript.',
  'drink-ecom': 'MVP storefront for a drinks e-commerce, built to validate the checkout flow end to end.',
  'to-do-list': 'Small Vue to-do list — practice with reactive state and local persistence.',
  drsolarclean: 'Marketing site for a solar panel cleaning company, built in Vue.',
  'wedding-list': 'Gift list for my own wedding. Half a joke, and fully in production for one weekend.',
  'email-marketing': 'Table-based HTML email template built to survive Outlook rendering.',
  heitorschleder: 'My GitHub profile readme.',
  'base-ecome': 'E-commerce base layout kept as a starting point for study projects.',
  'ipm-test': 'Front-end technical test: a responsive layout built from a design spec in Vue.',
  frontis: 'Front-end training project — layout and DOM work in vanilla JavaScript.',
  Pokedex: 'Pokédex on the PokéAPI, with search, pagination and a detail view.',
  portfolio: 'My first portfolio page, hand-written in HTML and CSS.',
  'ipm-python-test': 'Python technical test with a small HTML front end on top.',
  Conversor: 'Unit and currency converter built in Vue.',
  'crud-teste': 'CRUD in PHP over MySQL — create, read, update and delete on a single table.',
  treino: 'HTML and CSS exercises from an early course. Kept as a marker of where I started.',
  kebook: 'Static CSS layout from my first weeks at Kebook.',
}
```

- [ ] **Step 4: Implement the loader**

Create `src/modules/repositories/repos.types.ts`:

```ts
/**
 * No `isPrivate` field, on purpose. The GraphQL query never asks for private
 * repositories, so a leak is not merely unlikely — it is unrepresentable.
 */
export type Repository = {
  name: string
  description: string
  language: string
  year: string
  url: string
  pinned: boolean
}

export type LoadResult = {
  repos: Repository[]
  missingOverrides: string[]
}
```

Create `src/modules/repositories/github.ts`:

```ts
import { REPO_OVERRIDES } from '../../../content/repos.overrides'
import { GITHUB_LOGIN } from '@/shared/site.config'
import type { LoadResult, Repository } from './repos.types'

export const GITHUB_QUERY = `
  query Repos($login: String!) {
    user(login: $login) {
      repositories(
        first: 100
        privacy: PUBLIC
        ownerAffiliations: OWNER
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes { name description url pushedAt primaryLanguage { name } }
      }
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes { ... on Repository { name } }
      }
    }
  }
`

type Node = {
  name: string
  description: string | null
  url: string
  pushedAt: string
  primaryLanguage: { name: string } | null
}

/** Runs at build time only. Never call this from a client component. */
export async function loadRepositories(fetchImpl: typeof fetch = fetch): Promise<LoadResult> {
  const response = await fetchImpl('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: GITHUB_QUERY, variables: { login: GITHUB_LOGIN } }),
  })

  if (!response.ok) {
    throw new Error(`GitHub responded ${response.status}. Refusing to build a site with no projects.`)
  }

  const payload = (await response.json()) as {
    data?: { user?: { repositories: { nodes: Node[] }; pinnedItems: { nodes: { name: string }[] } } }
    errors?: { message: string }[]
  }

  if (payload.errors?.length) {
    throw new Error(`GitHub GraphQL: ${payload.errors.map((e) => e.message).join('; ')}`)
  }
  const user = payload.data?.user
  if (!user) throw new Error('GitHub returned no user. Check GITHUB_TOKEN and the login.')

  const pinned = new Set(user.pinnedItems.nodes.map((n) => n.name))
  const missingOverrides: string[] = []

  const repos: Repository[] = user.repositories.nodes.map((node) => {
    const override = REPO_OVERRIDES[node.name]
    if (!override) missingOverrides.push(node.name)
    return {
      name: node.name,
      description: override ?? node.description ?? 'No description.',
      language: node.primaryLanguage?.name ?? 'Other',
      year: node.pushedAt.slice(0, 4),
      url: node.url,
      pinned: pinned.has(node.name),
    }
  })

  // Pinned first, then most recently pushed. The GraphQL order already handles the second key.
  repos.sort((a, b) => Number(b.pinned) - Number(a.pinned))

  return { repos, missingOverrides }
}

/** Language name -> count, for the filter strip. */
export function languageCounts(repos: Repository[]): { label: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const repo of repos) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1)
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}
```

Create `.env.example`:

```
# Build-time only. Needs no scopes beyond public_repo read.
GITHUB_TOKEN=
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `npm test -- src/modules/repositories/github.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: build-time github loader with english description overrides"
```

---

### Task 8: Repository grid

**Files:**
- Create: `src/modules/repositories/RepositoryGrid.tsx`, `src/modules/repositories/RepositoryExpander.tsx`, `src/modules/repositories/index.ts`
- Test: `src/modules/repositories/RepositoryGrid.test.tsx`

**Interfaces:**
- Consumes: `Repository`, `languageCounts` (Task 7), `Panel`, `FilterStrip` (Task 4).
- Produces: `RepositoryGrid({ repos, initial = 10 })` — server component that renders `RepositoryExpander` for the overflow.

- [ ] **Step 1: Write the failing test**

Create `src/modules/repositories/RepositoryGrid.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- src/modules/repositories/RepositoryGrid.test.tsx`
Expected: FAIL — cannot resolve `./RepositoryGrid`.

- [ ] **Step 3: Implement the expander**

Create `src/modules/repositories/RepositoryExpander.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { ChevronDown } from '@/ui/icons'
import { cn } from '@/shared/cn'

export function RepositoryExpander({
  total,
  initial,
  children,
}: {
  total: number
  initial: number
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div id="repository-overflow" hidden={!open} className="contents">
        {children}
      </div>
      <div className="flex flex-wrap items-stretch justify-between border-t border-[var(--color-rule)]">
        <p className="flex items-center px-3 py-[10px] font-mono text-[10px] uppercase tracking-[0.09em] text-[var(--color-mute)]">
          Showing {open ? total : initial} of {total} · pinned first, then last push
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="repository-overflow"
          className={cn(
            'flex min-h-11 items-center gap-2 border-l border-[var(--color-rule)] px-4',
            'font-display text-[13px] font-semibold uppercase tracking-[0.15em]',
            'text-[var(--color-acc)] transition-colors hover:bg-[var(--color-wash)]',
          )}
        >
          {open ? 'Show fewer' : `Show all ${total}`}
          <ChevronDown
            className={cn('size-[14px] transition-transform', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      </div>
    </>
  )
}
```

`hidden` on a `display: contents` wrapper still removes the subtree from rendering and from the accessibility tree, which is what the test asserts.

- [ ] **Step 4: Implement the grid**

Create `src/modules/repositories/RepositoryGrid.tsx`:

```tsx
import { Panel } from '@/ui/molecules/Panel'
import { FilterStrip } from '@/ui/molecules/FilterStrip'
import { ArrowUpRight, GitBranch } from '@/ui/icons'
import { cn } from '@/shared/cn'
import { languageCounts } from './github'
import type { Repository } from './repos.types'
import { RepositoryExpander } from './RepositoryExpander'

function Card({ repo }: { repo: Repository }) {
  return (
    <a
      href={repo.url}
      className={cn(
        'flex min-h-[116px] flex-col gap-[6px] border-t-2 bg-[var(--color-panel)] px-3 pb-[9px] pt-[11px]',
        'transition-colors hover:bg-[var(--color-panel-2)]',
        repo.pinned ? 'border-t-[var(--color-acc)]' : 'border-t-transparent',
      )}
    >
      <span className="flex items-baseline justify-between gap-2">
        <b className="font-display text-[15px] font-semibold uppercase leading-[1.1] tracking-[0.05em] break-words text-[var(--color-ink)]">
          {repo.name}
        </b>
        <ArrowUpRight className="size-3 shrink-0 text-[var(--color-mute)]" aria-hidden="true" />
      </span>
      <span className="flex-1 text-[12.5px] leading-[1.45] text-[var(--color-mute)]">
        {repo.description}
      </span>
      <span className="flex items-center justify-between gap-2 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--color-mute)]">
        <span className="text-[var(--color-acc)]">{repo.language}</span>
        <span>{repo.year}</span>
      </span>
    </a>
  )
}

const GRID = 'grid grid-cols-1 gap-px bg-[var(--color-rule)] @min-[440px]:grid-cols-[repeat(auto-fill,minmax(198px,1fr))]'

export function RepositoryGrid({ repos, initial = 10 }: { repos: Repository[]; initial?: number }) {
  const head = repos.slice(0, initial)
  const tail = repos.slice(initial)

  return (
    <Panel title="Repositories" icon={GitBranch} meta={`Synced from GitHub at build · ${repos.length} public`}>
      <FilterStrip
        items={[
          { label: 'All', count: repos.length, active: true },
          ...languageCounts(repos),
        ]}
      />
      <div className={GRID}>
        {head.map((repo) => (
          <Card key={repo.name} repo={repo} />
        ))}
      </div>
      {tail.length > 0 ? (
        <RepositoryExpander total={repos.length} initial={initial}>
          <div className={cn(GRID, 'border-t border-[var(--color-rule)]')}>
            {tail.map((repo) => (
              <Card key={repo.name} repo={repo} />
            ))}
          </div>
        </RepositoryExpander>
      ) : null}
    </Panel>
  )
}
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `npm test -- src/modules/repositories/RepositoryGrid.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 6: Add the barrel**

Create `src/modules/repositories/index.ts`:

```ts
export { RepositoryGrid } from './RepositoryGrid'
export { loadRepositories, languageCounts } from './github'
export type { Repository, LoadResult } from './repos.types'
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: repository grid showing ten with an expander"
```

---

### Task 9: Technologies and education

**Files:**
- Create: `src/modules/profile/profile.data.ts`, `src/modules/profile/TechnologyMatrix.tsx`, `src/modules/profile/EducationPanel.tsx`, `src/modules/profile/index.ts`
- Test: `src/modules/profile/profile.test.tsx`

**Interfaces:**
- Consumes: `Panel`, `Tk`, `Chip` (Task 4), icons (Task 3).
- Produces: `TechnologyMatrix`, `EducationPanel`, `TECH_GROUPS`, `EDUCATION`.

- [ ] **Step 1: Write the failing test**

Create `src/modules/profile/profile.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TechnologyMatrix } from './TechnologyMatrix'
import { EducationPanel } from './EducationPanel'

describe('TechnologyMatrix', () => {
  it('groups technologies under named categories', () => {
    render(<TechnologyMatrix />)
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.getByText('Data & AI')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })
})

describe('EducationPanel', () => {
  it('shows the degree', () => {
    render(<EducationPanel />)
    expect(screen.getByText('Technologist Degree in Data Science')).toBeInTheDocument()
    expect(screen.getByText(/Estácio de Sá/)).toBeInTheDocument()
  })

  it('separates the degree from the certificates', () => {
    render(<EducationPanel />)
    expect(screen.getByText('Degree')).toBeInTheDocument()
    expect(screen.getAllByText('Certificate')).toHaveLength(3)
  })

  it('lists education newest first', () => {
    render(<EducationPanel />)
    const years = screen.getAllByTestId('edu-year').map((n) => n.textContent)
    expect(years).toEqual(['2024', '2024', '2023', '2022'])
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- src/modules/profile/profile.test.tsx`
Expected: FAIL — cannot resolve `./TechnologyMatrix`.

- [ ] **Step 3: Write the data**

Create `src/modules/profile/profile.data.ts`:

```ts
export type TechGroup = { label: string; items: { name: string; core?: boolean }[] }

export const TECH_GROUPS: TechGroup[] = [
  {
    label: 'Languages',
    items: [
      { name: 'TypeScript', core: true },
      { name: 'JavaScript', core: true },
      { name: 'Dart', core: true },
      { name: 'Java', core: true },
      { name: 'Python' },
      { name: 'PHP' },
      { name: 'SQL' },
    ],
  },
  {
    label: 'Frontend',
    items: [
      { name: 'React', core: true },
      { name: 'Next.js', core: true },
      { name: 'Flutter', core: true },
      { name: 'Vue' },
      { name: 'Nuxt 3' },
      { name: 'React Native' },
      { name: 'Tailwind' },
      { name: 'Sass' },
    ],
  },
  {
    label: 'Backend & APIs',
    items: [
      { name: 'Java', core: true },
      { name: 'Node.js', core: true },
      { name: 'Laravel' },
      { name: 'Directus' },
      { name: 'WordPress' },
      { name: 'REST' },
      { name: 'GraphQL' },
    ],
  },
  {
    label: 'Data & AI',
    items: [
      { name: 'Image recognition', core: true },
      { name: 'OCR', core: true },
      { name: 'Python' },
      { name: 'MySQL' },
      { name: 'SQLite' },
    ],
  },
  {
    label: 'Cloud & DevOps',
    items: [
      { name: 'AWS' },
      { name: 'Google Cloud' },
      { name: 'Cloudflare' },
      { name: 'Docker' },
      { name: 'NGINX' },
      { name: 'Linux' },
      { name: 'CI/CD' },
    ],
  },
  {
    label: 'Commerce',
    items: [{ name: 'VTEX' }, { name: 'Shopify' }, { name: 'Hotmart' }, { name: 'Eduzz' }],
  },
  { label: 'Testing', items: [{ name: 'Cypress' }, { name: 'Jest' }, { name: 'n8n' }] },
]

export type Education = { year: string; title: string; issuer: string; degree?: boolean }

export const EDUCATION: Education[] = [
  {
    year: '2024',
    title: 'Technologist Degree in Data Science',
    issuer: 'Universidade Estácio de Sá — Brazil',
    degree: true,
  },
  { year: '2024', title: 'ReactJS and Next.js — Intermediate and Advanced', issuer: 'Udemy' },
  { year: '2023', title: 'Vue: The Complete Guide', issuer: 'Udemy' },
  { year: '2022', title: 'Complete JavaScript, from Beginner to Master', issuer: 'Udemy' },
]
```

- [ ] **Step 4: Implement the two panels**

Create `src/modules/profile/TechnologyMatrix.tsx`:

```tsx
import { Panel } from '@/ui/molecules/Panel'
import { Tk } from '@/ui/atoms/Tk'
import { Cpu } from '@/ui/icons'
import { TECH_GROUPS } from './profile.data'

export function TechnologyMatrix() {
  return (
    <Panel title="Technologies" icon={Cpu} meta="Outlined = daily driver">
      <dl className="grid grid-cols-1 @min-[560px]:grid-cols-[132px_minmax(0,1fr)]">
        {TECH_GROUPS.map((group, i) => (
          <div key={group.label} className="contents">
            <dt
              className={
                'flex items-center px-3 py-[11px] pb-[2px] font-mono text-[9.5px] uppercase tracking-[0.13em] text-[var(--color-mute)] ' +
                '@min-[560px]:border-r @min-[560px]:border-[var(--color-rule)] @min-[560px]:pb-[11px] ' +
                (i === TECH_GROUPS.length - 1 ? '' : '@min-[560px]:border-b')
              }
            >
              {group.label}
            </dt>
            <dd
              className={
                'm-0 flex flex-wrap gap-[5px] px-3 py-[9px] ' +
                (i === TECH_GROUPS.length - 1 ? '' : 'border-b border-[var(--color-rule)]')
              }
            >
              {group.items.map((item) => (
                <Tk key={item.name} core={item.core}>
                  {item.name}
                </Tk>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}
```

Create `src/modules/profile/EducationPanel.tsx`:

```tsx
import { Panel } from '@/ui/molecules/Panel'
import { Chip } from '@/ui/atoms/Chip'
import { GraduationCap } from '@/ui/icons'
import { cn } from '@/shared/cn'
import { EDUCATION } from './profile.data'

export function EducationPanel() {
  return (
    <Panel title="Education" icon={GraduationCap} meta="Degree + certifications">
      <ul>
        {EDUCATION.map((entry) => (
          <li
            key={`${entry.year}-${entry.title}`}
            className={cn(
              'grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--color-rule)] px-3 py-[10px] last:border-b-0',
              entry.degree && 'bg-[var(--color-wash)]',
            )}
          >
            <span
              data-testid="edu-year"
              className="font-mono text-[11px] tabular-nums text-[var(--color-mute)]"
            >
              {entry.year}
            </span>
            <span
              className={cn(
                'text-[14px] font-medium leading-[1.3]',
                entry.degree ? 'text-[var(--color-acc)]' : 'text-[var(--color-ink)]',
              )}
            >
              {entry.title}
              <span className="mt-[2px] block text-[11.5px] font-normal text-[var(--color-mute)]">
                {entry.issuer}
              </span>
            </span>
            <Chip tone={entry.degree ? 'accent' : 'quiet'}>
              {entry.degree ? 'Degree' : 'Certificate'}
            </Chip>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `npm test -- src/modules/profile/profile.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 6: Add the barrel and commit**

Create `src/modules/profile/index.ts`:

```ts
export { TechnologyMatrix } from './TechnologyMatrix'
export { EducationPanel } from './EducationPanel'
export { TECH_GROUPS, EDUCATION } from './profile.data'
```

```bash
git add -A
git commit -m "feat: technology matrix and education panel"
```

---

### Task 10: Home page

**Files:**
- Create: `src/modules/home/Hero.tsx`, `src/modules/home/index.ts`
- Modify: `src/app/page.tsx`
- Test: `src/app/page.test.tsx`

**Interfaces:**
- Consumes: `CareerPanel`, `RepositoryGrid`, `loadRepositories`, `TechnologyMatrix`, `EducationPanel`.
- Produces: the Home route.

- [ ] **Step 1: Write the failing test**

Create `src/app/page.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Hero } from '@/modules/home/Hero'

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
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- src/app/page.test.tsx`
Expected: FAIL — cannot resolve `@/modules/home/Hero`.

- [ ] **Step 3: Implement the hero**

Create `src/modules/home/Hero.tsx`:

```tsx
import { GitBranch, GraduationCap, MapPin } from '@/ui/icons'
import { site } from '@/shared/site.config'

const FACTS = [
  { icon: MapPin, text: site.location },
  { icon: GraduationCap, text: 'BSc Data Science' },
  { icon: GitBranch, text: '22 public repositories' },
]

export function Hero() {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--color-rule)] px-[14px] pb-4 pt-5 @min-[560px]:px-4 @min-[560px]:pb-[18px] @min-[560px]:pt-6">
      <h1 className="font-display text-[clamp(28px,5.2vw,50px)] font-bold uppercase leading-[0.94] tracking-[0.005em] text-[var(--color-ink)]">
        Full stack
        <br />
        <em className="not-italic text-[var(--color-acc)]">across three stacks</em>
      </h1>
      <p className="max-w-[56ch] text-[14px] leading-[1.6] text-[var(--color-mute)]">
        React on the web, Flutter in the field, Java behind both — one fleet management product used
        by more than 1,000 logistics companies.
      </p>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--color-mute)]">
        {FACTS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-[5px]">
            <Icon className="size-3 text-[var(--color-acc)]" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

Create `src/modules/home/index.ts`:

```ts
export { Hero } from './Hero'
```

- [ ] **Step 4: Compose the Home route**

Replace `src/app/page.tsx`:

```tsx
import { Hero } from '@/modules/home'
import { CareerPanel } from '@/modules/career'
import { RepositoryGrid, loadRepositories } from '@/modules/repositories'
import { TechnologyMatrix, EducationPanel } from '@/modules/profile'

export default async function HomePage() {
  const { repos, missingOverrides } = await loadRepositories()

  if (missingOverrides.length > 0) {
    // Loud, but not fatal: a new repository should not break the build, and it
    // should not slip onto an English site with a Portuguese description either.
    console.warn(
      `[repos] No English override for: ${missingOverrides.join(', ')}. ` +
        'Add them to content/repos.overrides.ts.',
    )
  }

  return (
    <>
      <Hero />
      <CareerPanel />
      <RepositoryGrid repos={repos} initial={10} />
      <TechnologyMatrix />
      <EducationPanel />
    </>
  )
}
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `npm test -- src/app/page.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 6: Verify the real build against the real API**

Put a token in `.env.local` (`GITHUB_TOKEN=...`), then run: `npm run build`
Expected: build succeeds and the Home page renders 22 repositories. If the console warns about missing overrides, add them to `content/repos.overrides.ts` before continuing.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: home page composing career, repositories, technologies and education"
```

---

### Task 11: Velite and the writing content model

**Files:**
- Create: `velite.config.ts`, `content/posts/2026-08-24-envelope-t-designing-for-the-panel-that-fails.mdx`, `content/posts/2026-08-19-a-graphql-query-that-cannot-leak-a-private-repo.mdx`, `content/posts/2026-08-02-drawing-the-svg-by-hand.mdx`
- Modify: `package.json`, `tsconfig.json`, `.gitignore`, `next.config.ts`
- Test: `src/modules/writing/content.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `import { posts } from '#content'` where each post is
  `{ title, date, summary, tags, draft, slug, permalink, content, reading: { readingTime, wordCount } }`.

- [ ] **Step 1: Install and configure Velite**

```bash
npm install -D velite@0.4.0 concurrently
npm install rehype-pretty-code shiki remark-gfm
```

Create `velite.config.ts`:

```ts
import { defineConfig, defineCollection, s } from 'velite'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'

const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(110),
      date: s.isodate(),
      summary: s.string().max(260),
      tags: s.array(s.string()).min(1),
      draft: s.boolean().default(false),
      slug: s.path(),
      content: s.mdx(),
      reading: s.metadata(),
    })
    .transform((data) => ({
      ...data,
      // s.path() yields "posts/2026-08-24-title"; the route wants the bare slug
      // with the date prefix stripped.
      slug: data.slug.replace(/^posts\//, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
      permalink: `/blog/${data.slug.replace(/^posts\//, '').replace(/^\d{4}-\d{2}-\d{2}-/, '')}`,
    })),
})

export default defineConfig({
  root: 'content',
  output: { data: '.velite', clean: true },
  collections: { posts },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          // One hue plus the neutral ramp, so highlighting survives the theme switch.
          theme: { dark: 'github-dark-dimmed', light: 'github-light' },
          keepBackground: false,
        },
      ],
    ],
  },
})
```

Add to `tsconfig.json` `compilerOptions.paths`:

```json
"#content": ["./.velite"]
```

Add to `.gitignore`:

```
.velite/
```

Update `package.json` scripts. Next 16 runs Turbopack, so Velite's webpack plugin is not an option — it runs as its own process:

```json
"dev": "concurrently -k -n velite,next \"velite --watch\" \"next dev\"",
"build": "velite && next build",
"prebuild": "",
"test": "velite --silent && vitest run"
```

In `next.config.ts`, keep MDX out of the router:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Nothing under content/ may become a route by accident.
  pageExtensions: ['ts', 'tsx'],
}

export default nextConfig
```

- [ ] **Step 2: Write the three posts**

Create `content/posts/2026-08-24-envelope-t-designing-for-the-panel-that-fails.mdx`:

```mdx
---
title: 'Envelope<T>: designing for the panel that fails'
date: 2026-08-24
summary: Six panels, six upstream services, one rule — a panel whose source is down explains itself and never takes the page with it.
tags:
  - Architecture
  - TypeScript
---

The console pulls from six places — GitHub, Spotify, a weather service, and three of my own
endpoints. On any given morning at least one of them is slow, rate-limited, or returning something I
did not plan for. The first version handled this the way most dashboards do: a `try/catch` per
loader and a shrug.

That shrug is the problem. A caught error with nothing downstream forced to look at it becomes a
blank rectangle, and a blank rectangle looks identical to a panel with no data. The reader cannot
tell whether GitHub is down or whether I simply have not committed anything this week.

## Make the failure part of the type

So the loaders stopped returning `T`. They return an envelope, and the envelope is a discriminated
union:

```ts
export type Envelope<T> =
  | { ok: true; data: T; fetchedAt: string }
  | { ok: false; reason: FailureReason; fetchedAt: string }

export type FailureReason =
  | 'timeout'
  | 'rate-limited'
  | 'unauthorized'
  | 'upstream-error'
  | 'not-configured'
```

Nothing here is clever. What it buys is that the compiler will not let a panel render without
deciding what a failure looks like. You cannot reach `envelope.data` until you have narrowed `ok`,
and the moment you narrow it you are staring at the other branch.

## Five reasons, not one boolean

The temptation is a single `error: string`. I have written that before and it always turns into a
stack trace leaking onto the page. Five named reasons force a decision per case, and each one earns
different copy:

- **rate-limited** — the data was real an hour ago, so show it with an honest timestamp rather than
  an error.
- **not-configured** — this is my fault at deploy time, not an outage. It should look different.
- **unauthorized** — the token expired. This is the one that should page me.

Each panel is an independent async Server Component behind its own `<Suspense>` boundary, so a slow
source delays its own rectangle and nothing else. The page never waits on its worst upstream.

## What it cost

About forty lines of types and one afternoon of rewriting loaders. In exchange, every failure mode
on the page is now enumerable, and I have not shipped a blank panel since.
```

Create `content/posts/2026-08-19-a-graphql-query-that-cannot-leak-a-private-repo.mdx`:

```mdx
---
title: A GraphQL query that cannot leak a private repo
date: 2026-08-19
summary: Filtering private repositories out after the fetch is a bug waiting to happen. Not requesting them is not.
tags:
  - Security
  - GraphQL
---

There are two ways to keep private repository names off a public page. The common one is to fetch
everything and filter:

```ts
const visible = all.filter((repo) => !repo.isPrivate)
```

That works until someone refactors the sort above it, or adds a second render path, or inverts the
predicate during a rename. The names were in the process the whole time; only one line stood between
them and the HTML.

## Ask for less

The other way is to never receive them:

```graphql
repositories(first: 100, privacy: PUBLIC, ownerAffiliations: OWNER) {
  nodes { name description url pushedAt }
}
```

Now there is nothing to filter, because there is nothing there. A refactor cannot reintroduce the
data, and a reviewer does not need to trace where the filter is applied.

## Then delete the field

The second half matters as much. My `Repository` type carries no `isPrivate` at all:

```ts
export type Repository = {
  name: string
  description: string
  language: string
  year: string
  url: string
  pinned: boolean
}
```

You cannot accidentally render a field that does not exist. The leak stops being unlikely and starts
being unrepresentable, which is a much better property to rely on at two in the morning.
```

Create `content/posts/2026-08-02-drawing-the-svg-by-hand.mdx`:

```mdx
---
title: Drawing the SVG by hand instead of shipping a chart library
date: 2026-08-02
summary: A radar chart with six axes and one dataset does not need 90 kB of runtime. It needs a scale function and room in the viewBox.
tags:
  - Frontend
  - SVG
---

I wanted one radar chart, six axes, a single dataset, no interaction. The obvious move is a charting
library. I measured the smallest one that could draw it and stopped: ninety kilobytes of runtime,
plus a wrapper, plus a theme adapter, to draw eleven `<path>` elements that never change after render.

## What the chart actually needs

Two things, it turns out. A scale, which `d3-scale` provides in about two kilobytes:

```ts
import { scaleLinear } from 'd3-scale'

const radius = scaleLinear().domain([0, max]).range([0, 90])
```

And the trigonometry, which is one line per axis:

```ts
const angle = (index / axes.length) * 2 * Math.PI - Math.PI / 2
const point = [cx + radius(value) * Math.cos(angle), cy + radius(value) * Math.sin(angle)]
```

## The part that actually bites

Not the maths — the `viewBox`. An axis label sits outside the plot radius, and the default instinct
is to size the viewBox to the chart. Do that and every label on the left and right edge gets clipped,
usually only at one breakpoint, usually only in one theme.

Leave room for the outermost label, give every drawn shape an explicit `fill`, and take the label
colour from a theme token rather than a literal. Three rules, and the chart works in light and dark
without a second code path.

Total cost: two kilobytes and an afternoon, against ninety kilobytes and a theme adapter I would have
had to maintain anyway.
```

- [ ] **Step 3: Write the failing content test**

Create `src/modules/writing/content.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { posts } from '#content'

describe('post collection', () => {
  it('loads every post', () => {
    expect(posts.length).toBeGreaterThanOrEqual(3)
  })

  it('strips the date prefix from the slug', () => {
    const slugs = posts.map((p) => p.slug)
    expect(slugs).toContain('envelope-t-designing-for-the-panel-that-fails')
    expect(slugs.every((s) => !/^\d{4}-\d{2}-\d{2}-/.test(s))).toBe(true)
  })

  it('builds a permalink under /blog', () => {
    expect(posts.every((p) => p.permalink.startsWith('/blog/'))).toBe(true)
  })

  it('gives every post at least one tag and a summary', () => {
    for (const post of posts) {
      expect(post.tags.length, `${post.slug} has no tags`).toBeGreaterThan(0)
      expect(post.summary.length, `${post.slug} has no summary`).toBeGreaterThan(0)
    }
  })

  it('computes reading time', () => {
    expect(posts[0].reading.readingTime).toBeGreaterThan(0)
  })

  it('keeps every slug unique', () => {
    expect(new Set(posts.map((p) => p.slug)).size).toBe(posts.length)
  })
})
```

- [ ] **Step 4: Run Velite and the test**

Run: `npx velite && npm test -- src/modules/writing/content.test.ts`
Expected: Velite reports 3 posts; PASS, 6 tests.

If Velite reports a schema error, the frontmatter is wrong — that is the feature. Fix the MDX, not the schema.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: velite content pipeline with the first three posts"
```

---

### Task 12: Writing index

**Files:**
- Create: `src/modules/writing/PostList.tsx`, `src/modules/writing/index.ts`, `src/app/blog/page.tsx`
- Test: `src/modules/writing/PostList.test.tsx`

**Interfaces:**
- Consumes: `Panel`, `FilterStrip`, `Chip`.
- Produces: `PostList({ posts })` and `sortedPosts()` returning published posts newest first.

- [ ] **Step 1: Write the failing test**

Create `src/modules/writing/PostList.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostList, type PostSummary } from './PostList'

const posts: PostSummary[] = [
  {
    slug: 'newer',
    permalink: '/blog/newer',
    title: 'The newer one',
    date: '2026-08-24',
    summary: 'Newer summary.',
    tags: ['Architecture'],
    readingTime: 7,
  },
  {
    slug: 'older',
    permalink: '/blog/older',
    title: 'The older one',
    date: '2026-08-02',
    summary: 'Older summary.',
    tags: ['Frontend'],
    readingTime: 6,
  },
]

describe('PostList', () => {
  it('links each entry to its permalink', () => {
    render(<PostList posts={posts} />)
    expect(screen.getByRole('link', { name: /The newer one/ })).toHaveAttribute(
      'href',
      '/blog/newer',
    )
  })

  it('renders the date in a machine-readable time element', () => {
    render(<PostList posts={posts} />)
    const time = screen.getByText('24 Aug 2026')
    expect(time.tagName).toBe('TIME')
    expect(time).toHaveAttribute('dateTime', '2026-08-24')
  })

  it('shows tags and reading time', () => {
    render(<PostList posts={posts} />)
    expect(screen.getByText('Architecture')).toBeInTheDocument()
    expect(screen.getByText('7 min')).toBeInTheDocument()
  })

  it('says so plainly when there is nothing to read', () => {
    render(<PostList posts={[]} />)
    expect(screen.getByText(/No posts yet/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- src/modules/writing/PostList.test.tsx`
Expected: FAIL — cannot resolve `./PostList`.

- [ ] **Step 3: Implement the list**

Create `src/modules/writing/PostList.tsx`:

```tsx
import Link from 'next/link'
import { Chip } from '@/ui/atoms/Chip'

export type PostSummary = {
  slug: string
  permalink: string
  title: string
  date: string
  summary: string
  tags: string[]
  readingTime: number
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function PostList({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) {
    return (
      <p className="px-3 py-6 text-[14px] text-[var(--color-mute)]">
        No posts yet. The first one is being written.
      </p>
    )
  }

  return (
    <ul>
      {posts.map((post) => (
        <li
          key={post.slug}
          className="grid grid-cols-1 gap-[6px] border-b border-[var(--color-rule)] px-3 py-[13px] last:border-b-0 @min-[520px]:grid-cols-[86px_minmax(0,1fr)] @min-[520px]:gap-[14px]"
        >
          <time
            dateTime={post.date}
            className="pt-[3px] font-mono text-[10.5px] uppercase tracking-[0.06em] tabular-nums text-[var(--color-mute)]"
          >
            {formatDate(post.date)}
          </time>
          <div>
            <h2 className="mb-[5px] font-display text-[20px] font-semibold uppercase leading-[1.14] tracking-[0.01em]">
              <Link href={post.permalink} className="text-[var(--color-ink)] hover:text-[var(--color-acc)]">
                {post.title}
              </Link>
            </h2>
            <p className="mb-2 max-w-[64ch] text-[13.5px] leading-[1.55] text-[var(--color-mute)]">
              {post.summary}
            </p>
            <div className="flex flex-wrap items-center gap-[6px]">
              {post.tags.map((tag, i) => (
                <Chip key={tag} tone={i === 0 ? 'accent' : 'quiet'}>
                  {tag}
                </Chip>
              ))}
              <span className="font-mono text-[9.5px] uppercase tracking-[0.09em] text-[var(--color-mute)]">
                {post.readingTime} min
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
```

Create `src/modules/writing/index.ts`:

```ts
import { posts as allPosts } from '#content'
import type { PostSummary } from './PostList'

export { PostList, formatDate, type PostSummary } from './PostList'

/** Published posts, newest first. Drafts never reach a production build. */
export function sortedPosts(): PostSummary[] {
  return allPosts
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((post) => ({
      slug: post.slug,
      permalink: post.permalink,
      title: post.title,
      date: post.date,
      summary: post.summary,
      tags: post.tags,
      readingTime: post.reading.readingTime,
    }))
}

export function tagCounts(posts: PostSummary[]): { label: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}
```

- [ ] **Step 4: Create the route**

Create `src/app/blog/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Panel } from '@/ui/molecules/Panel'
import { FilterStrip } from '@/ui/molecules/FilterStrip'
import { BookOpen } from 'lucide-react'
import { PostList, sortedPosts, tagCounts } from '@/modules/writing'

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Notes on architecture, front-end work and the decisions behind them.',
}

export default function BlogPage() {
  const posts = sortedPosts()
  return (
    <Panel title="Writing" icon={BookOpen} meta={`${posts.length} entries · English`}>
      <FilterStrip items={[{ label: 'All', count: posts.length, active: true }, ...tagCounts(posts)]} />
      <PostList posts={posts} />
    </Panel>
  )
}
```

Add `BookOpen` to the re-export list in `src/ui/icons/index.ts` and import it from `@/ui/icons` instead of `lucide-react`.

- [ ] **Step 5: Run the tests and build**

Run: `npm test && npm run build`
Expected: all pass; `/blog` renders three entries.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: writing index"
```

---

### Task 13: Article page

**Files:**
- Create: `src/modules/writing/PostArticle.tsx`, `src/app/blog/[slug]/page.tsx`
- Modify: `src/app/globals.css` (prose layer)
- Test: `src/modules/writing/PostArticle.test.tsx`

**Interfaces:**
- Consumes: `posts` from `#content`, `Chip`.
- Produces: `PostArticle({ post, children })` where `children` is the compiled MDX body.

- [ ] **Step 1: Write the failing test**

Create `src/modules/writing/PostArticle.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { PostArticle } from './PostArticle'

const post = {
  title: 'Envelope<T>: designing for the panel that fails',
  date: '2026-08-24',
  summary: 'Six panels, six upstream services, one rule.',
  tags: ['Architecture', 'TypeScript'],
  readingTime: 7,
}

describe('PostArticle', () => {
  it('renders the title as the only h1', () => {
    render(
      <PostArticle post={post}>
        <p>body</p>
      </PostArticle>,
    )
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(post.title)
  })

  it('renders the body inside a bounded reading column', () => {
    const { container } = render(
      <PostArticle post={post}>
        <p>the body text</p>
      </PostArticle>,
    )
    expect(screen.getByText('the body text')).toBeInTheDocument()
    expect(container.querySelector('.prose-console')).not.toBeNull()
  })

  it('exposes the date as a machine-readable time', () => {
    render(
      <PostArticle post={post}>
        <p>body</p>
      </PostArticle>,
    )
    expect(screen.getByText('24 August 2026')).toHaveAttribute('dateTime', '2026-08-24')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PostArticle post={post}>
        <p>body</p>
      </PostArticle>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- src/modules/writing/PostArticle.test.tsx`
Expected: FAIL — cannot resolve `./PostArticle`.

- [ ] **Step 3: Implement the article shell**

Create `src/modules/writing/PostArticle.tsx`:

```tsx
export type ArticleHead = {
  title: string
  date: string
  summary: string
  tags: string[]
  readingTime: number
}

export function PostArticle({
  post,
  children,
}: {
  post: ArticleHead
  children: React.ReactNode
}) {
  const printed = new Date(`${post.date}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-panel)] px-[14px] pb-4 pt-5 @min-[520px]:px-4 @min-[520px]:pb-[18px] @min-[520px]:pt-[26px]">
        <p className="mb-3 flex flex-wrap items-center gap-x-[14px] gap-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-mute)]">
          <span className="text-[var(--color-acc)]">{post.tags[0]}</span>
          <time dateTime={post.date}>{printed}</time>
          <span>{post.readingTime} min read</span>
          <span>EN</span>
        </p>
        <h1 className="mb-3 max-w-[20ch] text-balance font-display text-[clamp(26px,4.6vw,42px)] font-bold uppercase leading-[0.98] tracking-[0.01em] text-[var(--color-ink)]">
          {post.title}
        </h1>
        <p className="max-w-[62ch] text-[15.5px] leading-[1.6] text-[var(--color-mute)]">
          {post.summary}
        </p>
      </header>

      {/* The console steps back here. Body text sits on the page ground in a
          64-character column, not inside a panel. */}
      <div className="prose-console mx-auto max-w-[64ch] px-[14px] pb-2 pt-5 @min-[520px]:px-4 @min-[520px]:pt-6">
        {children}
      </div>
    </article>
  )
}
```

- [ ] **Step 4: Add the prose layer**

Append to `src/app/globals.css`:

```css
@layer components {
  .prose-console p {
    margin: 0 0 17px;
    font-size: 15.5px;
    line-height: 1.74;
    color: var(--color-ink);
  }
  .prose-console h2 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 30px 0 12px;
    font-family: var(--font-display);
    font-size: 19px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-ink);
  }
  .prose-console h2::before {
    content: '';
    flex: none;
    width: 16px;
    height: 2px;
    background: var(--color-acc);
  }
  .prose-console ul {
    margin: 0 0 17px;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .prose-console li {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    font-size: 15px;
    line-height: 1.62;
    color: var(--color-ink);
  }
  .prose-console li::before {
    content: '';
    width: 5px;
    height: 5px;
    margin-top: 9px;
    background: var(--color-acc);
  }
  .prose-console strong {
    font-weight: 600;
  }
  .prose-console :not(pre) > code {
    font-family: var(--font-mono);
    font-size: 0.88em;
    padding: 1px 5px;
    background: var(--color-panel-2);
  }
  .prose-console pre {
    margin: 0 0 17px;
    padding: 13px 15px;
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 12.5px;
    line-height: 1.72;
    background: var(--color-panel);
    border: 1px solid var(--color-rule);
  }
}
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `npm test -- src/modules/writing/PostArticle.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 6: Create the dynamic route**

Create `src/app/blog/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { posts } from '#content'
import { PostArticle } from '@/modules/writing/PostArticle'
import { MDXContent } from '@/modules/writing/MDXContent'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return posts.filter((p) => !p.draft).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.summary,
    openGraph: { title: post.title, description: post.summary, type: 'article' },
  }
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug && !p.draft)
  if (!post) notFound()

  return (
    <PostArticle
      post={{
        title: post.title,
        date: post.date,
        summary: post.summary,
        tags: post.tags,
        readingTime: post.reading.readingTime,
      }}
    >
      <MDXContent code={post.content} />
    </PostArticle>
  )
}
```

Create `src/modules/writing/MDXContent.tsx` — Velite compiles MDX to a function body string that has to be evaluated:

```tsx
import * as runtime from 'react/jsx-runtime'

function useMDXComponent(code: string) {
  const fn = new Function(code)
  return fn({ ...runtime }).default as React.ComponentType<Record<string, unknown>>
}

export function MDXContent({ code }: { code: string }) {
  const Component = useMDXComponent(code)
  return <Component />
}
```

- [ ] **Step 7: Verify the route renders**

Run: `npm run build`
Expected: build succeeds and prints three `/blog/[slug]` static routes.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: article page with a 64-character reading column"
```

---

### Task 14: Work and About routes

**Files:**
- Create: `src/app/work/page.tsx`, `src/app/about/page.tsx`
- Test: `src/app/routes.test.tsx`

**Interfaces:**
- Consumes: everything built so far.
- Produces: the last two routes.

- [ ] **Step 1: Write the failing test**

Create `src/app/routes.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CareerPanel } from '@/modules/career'
import { TechnologyMatrix, EducationPanel } from '@/modules/profile'

vi.mock('next/navigation', () => ({ usePathname: () => '/about' }))

describe('about page building blocks', () => {
  it('renders career, technologies and education without accessibility violations', async () => {
    const { container } = render(
      <>
        <CareerPanel />
        <TechnologyMatrix />
        <EducationPanel />
      </>,
    )
    expect(screen.getByRole('heading', { name: 'Career' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Education' })).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails or passes**

Run: `npm test -- src/app/routes.test.tsx`
Expected: PASS if the modules are correct — this test guards composition, so a green first run is fine here. If axe reports violations, fix them before continuing.

- [ ] **Step 3: Create the Work route**

Create `src/app/work/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { RepositoryGrid, loadRepositories } from '@/modules/repositories'
import { CareerPanel } from '@/modules/career'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Roles, results and every public repository.',
}

export default async function WorkPage() {
  const { repos } = await loadRepositories()
  return (
    <>
      <CareerPanel />
      {/* Everything, no expander: this is the page you come to for the full list. */}
      <RepositoryGrid repos={repos} initial={repos.length} />
    </>
  )
}
```

- [ ] **Step 4: Create the About route**

Create `src/app/about/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { TechnologyMatrix, EducationPanel } from '@/modules/profile'
import { site } from '@/shared/site.config'

export const metadata: Metadata = {
  title: 'About',
  description: site.description,
}

export default function AboutPage() {
  return (
    <>
      <div className="border-b border-[var(--color-rule)] px-[14px] pb-4 pt-5 @min-[560px]:px-4 @min-[560px]:pt-6">
        <h1 className="mb-3 font-display text-[clamp(26px,4.6vw,42px)] font-bold uppercase leading-[0.98] tracking-[0.01em] text-[var(--color-ink)]">
          About
        </h1>
        <div className="flex max-w-[62ch] flex-col gap-4 text-[15.5px] leading-[1.7] text-[var(--color-mute)]">
          <p>
            I am a full stack developer in {site.location}. For the last year I have been building a
            fleet management product used by more than 1,000 logistics companies, across three stacks
            at once — React on the web, Flutter on mobile, Java on the backend.
          </p>
          <p>
            Before that I spent two and a half years at Kebook, where I arrived as an intern and left
            as the tech lead of a four-developer team. The work that taught me most was the least
            glamorous: rebuilding hosting infrastructure, standardising a landing page process that
            took five days and making it take three hours, and finding the delete statement nobody had
            guarded.
          </p>
          <p>
            I studied Data Science, which is why the AI work at PrologApp landed on my desk and why I
            am comfortable arguing about a model that costs twenty-five dollars a month rather than
            one that impresses in a demo.
          </p>
        </div>
      </div>
      <TechnologyMatrix />
      <EducationPanel />
    </>
  )
}
```

- [ ] **Step 5: Build and verify**

Run: `npm run build && npm test`
Expected: build emits `/`, `/work`, `/blog`, `/blog/[slug]` ×3, `/about`; all tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: work and about routes"
```

---

### Task 15: SEO, sitemap and RSS

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/rss.xml/route.ts`, `src/app/robots.ts`
- Test: `src/app/feeds.test.ts`

**Interfaces:**
- Consumes: `sortedPosts()`, `site`.
- Produces: `/sitemap.xml`, `/rss.xml`, `/robots.txt`.

- [ ] **Step 1: Write the failing test**

Create `src/app/feeds.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildRssXml } from './rss.xml/build-rss'
import { sortedPosts } from '@/modules/writing'

describe('buildRssXml', () => {
  const xml = buildRssXml(sortedPosts())

  it('declares itself as RSS 2.0', () => {
    expect(xml).toContain('<rss version="2.0"')
  })

  it('emits one item per published post', () => {
    expect(xml.match(/<item>/g) ?? []).toHaveLength(sortedPosts().length)
  })

  it('uses absolute links', () => {
    expect(xml).toContain('<link>https://')
    expect(xml).not.toContain('<link>/blog/')
  })

  it('escapes characters that would break the document', () => {
    // "Envelope<T>" would otherwise open a phantom tag.
    expect(xml).not.toMatch(/<title>[^<]*Envelope<T>/)
    expect(xml).toContain('Envelope&lt;T&gt;')
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- src/app/feeds.test.ts`
Expected: FAIL — cannot resolve `./rss.xml/build-rss`.

- [ ] **Step 3: Implement the feed builder**

Create `src/app/rss.xml/build-rss.ts`:

```ts
import { site } from '@/shared/site.config'
import type { PostSummary } from '@/modules/writing'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildRssXml(posts: PostSummary[]): string {
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${site.url}${post.permalink}</link>
      <guid isPermaLink="true">${site.url}${post.permalink}</guid>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(post.summary)}</description>
    </item>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${site.url}</link>
    <description>${escapeXml(site.description)}</description>
    <language>en</language>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`
}
```

Create `src/app/rss.xml/route.ts`:

```ts
import { sortedPosts } from '@/modules/writing'
import { buildRssXml } from './build-rss'

export const dynamic = 'force-static'

export function GET() {
  return new Response(buildRssXml(sortedPosts()), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm test -- src/app/feeds.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Add sitemap and robots**

Create `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'
import { site } from '@/shared/site.config'
import { sortedPosts } from '@/modules/writing'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/work', '/blog', '/about'].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
  }))
  const posts = sortedPosts().map((post) => ({
    url: `${site.url}${post.permalink}`,
    lastModified: new Date(`${post.date}T00:00:00Z`),
  }))
  return [...routes, ...posts]
}
```

Create `src/app/robots.ts`:

```ts
import type { MetadataRoute } from 'next'
import { site } from '@/shared/site.config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${site.url}/sitemap.xml`,
  }
}
```

- [ ] **Step 6: Build and commit**

Run: `npm run build`
Expected: `/sitemap.xml`, `/rss.xml` and `/robots.txt` all appear in the route list.

```bash
git add -A
git commit -m "feat: rss, sitemap and robots"
```

---

### Task 16: Enforce the boundaries, then verify everything

**Files:**
- Modify: `eslint.config.mjs`, `README.md`
- Create: `src/modules/README.md`

**Interfaces:**
- Consumes: the whole tree.
- Produces: a lint rule that fails the build when a module reaches into another module's internals.

- [ ] **Step 1: Add the boundary rule**

The spec says a dependency rule without automated enforcement rots in two weeks. Add to `eslint.config.mjs`:

```js
{
  files: ['src/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['@/modules/*/*'],
          message: 'Import a module through its index.ts, never from its internals.',
        },
        {
          group: ['lucide-react'],
          message: 'Import icons from @/ui/icons so the icon set stays swappable.',
        },
      ],
    }],
  },
},
{
  // The UI layer knows nothing about the domain. The arrow only points inward.
  files: ['src/ui/**/*.{ts,tsx}', 'src/shared/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{ group: ['@/modules/*'], message: 'ui/ and shared/ must not import from modules/.' }],
    }],
  },
},
{
  // The icon barrel is the one place allowed to touch lucide directly.
  files: ['src/ui/icons/index.ts'],
  rules: { 'no-restricted-imports': 'off' },
},
```

- [ ] **Step 2: Run lint and fix every violation**

Run: `npm run lint`
Expected: initially some failures — most likely a component importing `lucide-react` directly, or a route importing `@/modules/career/CareerPanel` instead of `@/modules/career`. Fix each by importing through the barrel. Do not silence the rule.

- [ ] **Step 3: Document the boundaries**

Create `src/modules/README.md`:

```markdown
# Modules

One directory per domain. Each answers three questions:

| Module | What it does | Depends on |
|---|---|---|
| `career` | The four roles and the disclosure panel that renders them | `ui/molecules`, `ui/atoms` |
| `repositories` | Build-time GitHub loader and the repository grid | `ui/molecules`, `content/repos.overrides` |
| `writing` | Post list, article shell, MDX runtime | `#content`, `ui/atoms` |
| `profile` | Technology matrix and education | `ui/molecules`, `ui/atoms` |
| `home` | The hero | `ui/icons`, `shared/site.config` |

**Rules, enforced by `no-restricted-imports` in `eslint.config.mjs`:**

1. Import a module through its `index.ts`. Never reach into its internals.
2. `ui/` and `shared/` never import from `modules/`. The arrow points inward.
3. Icons come from `@/ui/icons`, never from `lucide-react` directly.
```

- [ ] **Step 4: Full verification sweep**

Run each and confirm the stated result before claiming the work is done:

```bash
npm run lint          # no errors
npx tsc --noEmit      # no type errors
npm test              # every suite green
npm run build         # succeeds; route list includes /, /work, /blog, /blog/[slug], /about, /sitemap.xml, /rss.xml
```

Then run `npm run dev` and check by hand, because these are the things no test above covers:

- [ ] Narrow the window to 390px: the nav links drop to their own full-bleed row, repository cards go single column.
- [ ] Toggle the theme: no flash on reload, and the choice survives it.
- [ ] Set the OS to dark with no explicit choice stored: the site follows it.
- [ ] Print preview on `/`: every career role prints expanded.
- [ ] Tab through the Home page: focus is visible on every stop and the order is sane.

- [ ] **Step 5: Update the README**

Replace the "Nothing is implemented yet" paragraph in `README.md` with real instructions:

```markdown
## Running it

```bash
cp .env.example .env.local   # add a GITHUB_TOKEN with public repo read
npm install
npm run dev                  # velite --watch and next dev, together
```

`npm run build` fails if the GitHub API is unreachable. That is deliberate: a published
site with zero projects is worse than a deploy that did not happen.

## Layout

- `src/modules/*` — one directory per domain, each entered through its `index.ts`
- `src/ui/*` — design system, knows nothing about the domain
- `content/posts/*.mdx` — validated at build time by Velite against a zod schema
- `content/repos.overrides.ts` — English descriptions for every public repository
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: enforce module boundaries and document the layout"
```

---

## Self-Review

**Spec coverage.** Walked every section of the design doc against the tasks: objective and non-goals (no CMS, no i18n, no runtime fetch — held throughout), the eleven locked decisions (Tasks 2, 3, 5, 6, 7, 11), architecture and the dependency rule (Task 16 enforces it), theme layer with three states and the no-flash script (Task 2), mobile first via container queries (Tasks 2, 4, 5, 8, 12), Velite schemas (Task 11), the GitHub loader with query-level privacy exclusion and build-failure-on-error (Task 7), all six routes (Tasks 10, 12, 13, 14), the career table with confirmed dates (Task 6), the footer with spelled-out links (Task 5), accessibility (Tasks 5, 10, 13, 14, 16), and the five test categories the spec names (schema, loader, accordion, theme, axe — Tasks 2, 6, 7, 11, 14).

One spec item is deliberately not implemented: **shadcn primitives**. The reasoning is in the deviation note at the top rather than buried, because it reverses a decision the spec locked.

Two spec items are correctly absent because the spec lists them as non-blocking pendings: **case studies** (`content/work/*.mdx` — the user confirmed these come later, so `/work` ships with the repository grid) and **the domain** (`site.url` is a placeholder).

**Placeholder scan.** No "TBD", no "add error handling", no "similar to Task N". Every code step carries the actual code. The one instruction that describes rather than shows is Task 16 Step 2, "fix each violation by importing through the barrel" — that is correct, because the violations depend on what the earlier tasks actually wrote.

**Type consistency.** Checked the names that cross task boundaries: `Repository` and `LoadResult` (Task 7 → 8, 10, 14), `loadRepositories` and `languageCounts` (7 → 8, 10, 14), `Role` and `ROLES` and `CAREER_HEADLINE` (6 → 6), `PostSummary` and `sortedPosts` and `tagCounts` (12 → 12, 15), `ArticleHead` (13 → 13), `FilterItem` (4 → 8, 12), `site` and `GITHUB_LOGIN` (2 → 5, 7, 14, 15), `THEME_SCRIPT` (2 → 2). `Panel` takes `{ title, icon, meta?, children, className? }` everywhere it is used. `Chip` takes `tone` — never `variant` — in Tasks 4, 9 and 12 alike.

One fix applied during review: Task 12 originally imported `BookOpen` from `lucide-react`, which Task 16's lint rule forbids. Step 4 now says to add it to the icon barrel and import from `@/ui/icons`.
