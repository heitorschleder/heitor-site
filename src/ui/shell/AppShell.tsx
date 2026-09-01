'use client'

import { usePathname } from 'next/navigation'
import { SiteNav } from './SiteNav'
import { SiteFooter } from './SiteFooter'

/**
 * The `@container/shell` here is load-bearing: every component breakpoint in the
 * app resolves against this element's width, not the viewport's. That is what
 * makes a panel behave the same on a phone and in a narrow column.
 *
 * This is the app's only container, and it is named `shell`. Every component
 * breakpoint MUST use the named form — `@min-[Npx]/shell:`, never the bare
 * `@min-[Npx]:` — so that adding a second container anywhere later cannot
 * silently rebind an existing breakpoint to the wrong ancestor. An unnamed
 * variant binds to whatever container happens to be nearest, not to this one.
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
