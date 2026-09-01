import { Panel } from '@/ui/molecules/Panel'
import { Tk } from '@/ui/atoms/Tk'
import { Briefcase, ChevronDown } from '@/ui/icons'
import { CAREER_HEADLINE, ROLES } from './career.data'

/**
 * Splits `a **b** c` into React nodes, rendering `**…**` as `<strong>`. Emphasis
 * is markup built by React, not raw HTML handed to the DOM, so a key-result
 * string cannot smuggle anything beyond bold text — the injection path is
 * unrepresentable, not merely unused.
 */
export function withEmphasis(text: string) {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))
}

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
            <summary className="grid min-h-11 cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-x-[14px] gap-y-2 p-3 marker:content-none @min-[620px]/shell:grid-cols-[124px_1fr_auto]">
              <span className="col-span-full font-mono text-[10.5px] uppercase leading-[1.6] tracking-[0.02em] text-[var(--color-mute)] tabular-nums group-open:text-[var(--color-acc)] @min-[620px]/shell:col-span-1">
                {role.period}
                <br />
                {role.duration}
              </span>

              <span className="min-w-0">
                {/*
                  h3, not a styled <b>: Panel already gives the section one <h2>,
                  so this is the only way a screen-reader user can jump role to
                  role by heading instead of falling back to tab order.
                */}
                <h3 className="m-0 block font-display text-[19px] font-bold uppercase leading-[1.1] tracking-[0.03em] text-[var(--color-ink)]">
                  {role.role}
                </h3>
                <span className="mt-[3px] block font-mono text-[10.5px] uppercase tracking-[0.07em] text-[var(--color-mute)]">
                  {role.company}
                  {role.note ? ` · ${role.note}` : ''}
                </span>
              </span>

              <span className="flex items-center gap-[10px] justify-self-end">
                <span className="hidden max-w-[270px] flex-wrap justify-end gap-[5px] @min-[820px]/shell:flex">
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
              <div className="mt-3 flex flex-wrap gap-[5px] @min-[820px]/shell:hidden">
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
                    <span className="text-[14px] leading-[1.55] text-[var(--color-ink)] [&_strong]:font-semibold [&_strong]:tabular-nums">
                      {withEmphasis(result)}
                    </span>
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
