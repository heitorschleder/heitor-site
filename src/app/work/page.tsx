import type { Metadata } from 'next'
import { RepositoryGrid, loadRepositories } from '@/modules/repositories'
import { CareerPanel } from '@/modules/career'
import { PageHeader } from '@/ui/molecules/PageHeader'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Roles, results and every public repository.',
}

export default async function WorkPage() {
  const { repos } = await loadRepositories()
  return (
    <>
      <PageHeader title="Work" />
      <CareerPanel />
      {/* Everything, no expander: this is the page you come to for the full list. */}
      <RepositoryGrid repos={repos} initial={repos.length} />
    </>
  )
}
