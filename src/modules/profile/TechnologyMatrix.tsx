import { Panel } from '@/ui/molecules/Panel'
import { Tk } from '@/ui/atoms/Tk'
import { Cpu } from '@/ui/icons'
import { cn } from '@/shared/cn'
import { TECH_GROUPS } from './profile.data'

export function TechnologyMatrix() {
  return (
    <Panel title="Technologies" icon={Cpu} meta="Outlined = daily driver">
      <dl className="grid grid-cols-1 @min-[560px]/shell:grid-cols-[132px_minmax(0,1fr)]">
        {TECH_GROUPS.map((group, i) => (
          <div key={group.label} className="contents">
            <dt
              className={cn(
                'flex items-center px-3 py-[11px] pb-[2px] font-mono text-[9.5px] uppercase tracking-[0.13em] text-[var(--color-mute)]',
                '@min-[560px]/shell:border-r @min-[560px]/shell:border-[var(--color-rule)] @min-[560px]/shell:pb-[11px]',
                i !== TECH_GROUPS.length - 1 && '@min-[560px]/shell:border-b',
              )}
            >
              {group.label}
            </dt>
            <dd
              className={cn(
                'm-0 flex flex-wrap gap-[5px] px-3 py-[9px]',
                i !== TECH_GROUPS.length - 1 && 'border-b border-[var(--color-rule)]',
              )}
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
