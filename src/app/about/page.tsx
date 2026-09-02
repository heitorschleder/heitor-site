import type { Metadata } from 'next'
import { TechnologyMatrix, EducationPanel } from '@/modules/profile'
import { site } from '@/shared/site.config'

export const metadata: Metadata = {
  title: 'About',
  description: 'Intern-turned-tech-lead with a Data Science degree. Full stack developer across React, Flutter, Java, cloud infrastructure, and AI.',
}

export default function AboutPage() {
  return (
    <>
      <div className="border-b border-[var(--color-rule)] px-[14px] pb-4 pt-5 @min-[560px]/shell:px-4 @min-[560px]/shell:pt-6">
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
