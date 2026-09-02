import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CareerPanel } from '@/modules/career'
import { TechnologyMatrix, EducationPanel } from '@/modules/profile'
import { Panel } from '@/ui/molecules/Panel'
import { PageHeader } from '@/ui/molecules/PageHeader'
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
  it('PageHeader (used by /work and /about) composes exactly one level-1 heading and renders children beneath it', () => {
    render(
      <>
        <PageHeader title="Work">
          <p>prose column</p>
        </PageHeader>
        <CareerPanel />
      </>,
    )
    const h1Elements = screen.getAllByRole('heading', { level: 1 })
    expect(h1Elements).toHaveLength(1)
    expect(h1Elements[0]).toHaveTextContent('Work')
    const children = screen.getByText('prose column')
    expect(children).toBeInTheDocument()
    expect(h1Elements[0].compareDocumentPosition(children) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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
