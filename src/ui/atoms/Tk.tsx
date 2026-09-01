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
