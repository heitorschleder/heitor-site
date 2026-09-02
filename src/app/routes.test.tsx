import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CareerPanel } from '@/modules/career'
import { TechnologyMatrix, EducationPanel } from '@/modules/profile'

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
