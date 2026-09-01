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
