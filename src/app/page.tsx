import { Hero } from '@/modules/home'
import { CareerPanel } from '@/modules/career'
import { RepositoryGrid, loadRepositories } from '@/modules/repositories'
import { TechnologyMatrix, EducationPanel } from '@/modules/profile'

export default async function HomePage() {
  const { repos, missingOverrides } = await loadRepositories()

  if (missingOverrides.length > 0) {
    // Loud, but not fatal: a new repository should not break the build, and it
    // should not slip onto an English site with a Portuguese description either.
    console.warn(
      `[repos] No English override for: ${missingOverrides.join(', ')}. ` +
        'Add them to content/repos.overrides.ts.',
    )
  }

  return (
    <>
      <Hero repoCount={repos.length} />
      <CareerPanel />
      <RepositoryGrid repos={repos} initial={10} />
      <TechnologyMatrix />
      <EducationPanel />
    </>
  )
}
