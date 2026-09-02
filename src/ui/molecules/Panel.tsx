import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/cn'

export function Panel({
  title,
  icon: Icon,
  meta,
  children,
  className,
  headingLevel = 2,
}: {
  title: string
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>
  meta?: string
  children: React.ReactNode
  className?: string
  headingLevel?: 1 | 2
}) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  const headingClassName = "flex items-center gap-2 font-display text-[12.5px] font-semibold uppercase tracking-[0.17em] text-[var(--color-ink)]"

  return (
    <section
      className={cn(
        'mx-[10px] my-3 border border-[var(--color-rule)] bg-[var(--color-panel)]',
        '@min-[560px]/shell:mx-4 @min-[560px]/shell:my-[14px]',
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-rule)] px-3 py-[7px]">
        <Heading className={headingClassName}>
          <Icon className="size-[13px] text-[var(--color-acc)]" aria-hidden="true" />
          {title}
        </Heading>
        {meta ? (
          <p className="font-mono text-[10px] tracking-[0.08em] text-[var(--color-mute)]">{meta}</p>
        ) : null}
      </header>
      {children}
    </section>
  )
}
