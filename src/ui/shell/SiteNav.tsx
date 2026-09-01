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
