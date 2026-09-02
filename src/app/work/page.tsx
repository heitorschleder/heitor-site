import type { Metadata } from 'next'
import { RepositoryGrid, loadRepositories } from '@/modules/repositories'
import { CareerPanel } from '@/modules/career'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Roles, results and every public repository.',
}

export default async function WorkPage() {
  const { repos } = await loadRepositories()
  return (
    <>
      <div className="border-b border-[var(--color-rule)] px-[14px] pb-4 pt-5 @min-[560px]/shell:px-4 @min-[560px]/shell:pt-6">
        <h1 className="mb-3 font-display text-[clamp(26px,4.6vw,42px)] font-bold uppercase leading-[0.98] tracking-[0.01em] text-[var(--color-ink)]">
          Work
        </h1>
      </div>
      <CareerPanel />
      {/* Everything, no expander: this is the page you come to for the full list. */}
      <RepositoryGrid repos={repos} initial={repos.length} />
    </>
  )
}
