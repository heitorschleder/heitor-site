import { GitBranch, GraduationCap, MapPin } from '@/ui/icons'
import { site } from '@/shared/site.config'

const FACTS = [
  { icon: MapPin, text: site.location },
  { icon: GraduationCap, text: 'BSc Data Science' },
  { icon: GitBranch, text: '22 public repositories' },
]

export function Hero() {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--color-rule)] px-[14px] pb-4 pt-5 @min-[560px]/shell:px-4 @min-[560px]/shell:pb-[18px] @min-[560px]/shell:pt-6">
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
