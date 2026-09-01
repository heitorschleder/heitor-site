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
