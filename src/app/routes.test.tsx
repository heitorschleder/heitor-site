import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CareerPanel } from '@/modules/career'
import { TechnologyMatrix, EducationPanel } from '@/modules/profile'
import { Panel } from '@/ui/molecules/Panel'
import { BookOpen } from '@/ui/icons'

describe('about page building blocks', () => {
  it('renders career, technologies and education without accessibility violations', async () => {
    const { container } = render(
      <>
        <CareerPanel />
        <TechnologyMatrix />
        <EducationPanel />
      </>,
    )
    expect(screen.getByRole('heading', { name: 'Career' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Education' })).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders the four career role titles as level-3 headings', () => {
    render(<CareerPanel />)
    const h3Elements = screen.getAllByRole('heading', { level: 3 })
    expect(h3Elements).toHaveLength(4)
    expect(h3Elements.map((el) => el.textContent)).toEqual([
      'Software Developer',
      'Tech Lead',
      'Frontend Developer Jr',
      'Intern',
    ])
  })
})

describe('page heading structure', () => {
  it('work page composes exactly one level-1 heading named "Work"', () => {
    render(
      <>
        <div className="border-b border-[var(--color-rule)] px-[14px] pb-4 pt-5 @min-[560px]/shell:px-4 @min-[560px]/shell:pt-6">
          <h1 className="mb-3 font-display text-[clamp(26px,4.6vw,42px)] font-bold uppercase leading-[0.98] tracking-[0.01em] text-[var(--color-ink)]">
            Work
          </h1>
        </div>
        <CareerPanel />
      </>,
    )
    const h1Elements = screen.getAllByRole('heading', { level: 1 })
    expect(h1Elements).toHaveLength(1)
    expect(h1Elements[0]).toHaveTextContent('Work')
  })

  it('blog page composes exactly one level-1 heading named "Writing"', () => {
    render(
      <Panel title="Writing" icon={BookOpen} headingLevel={1}>
        <p>content</p>
      </Panel>,
    )
    const h1Elements = screen.getAllByRole('heading', { level: 1 })
    expect(h1Elements).toHaveLength(1)
    expect(h1Elements[0]).toHaveTextContent('Writing')
  })
})
