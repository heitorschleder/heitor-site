import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TechnologyMatrix } from './TechnologyMatrix'
import { EducationPanel } from './EducationPanel'

describe('TechnologyMatrix', () => {
  it('groups technologies under named categories', () => {
    render(<TechnologyMatrix />)
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.getByText('Data & AI')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })
})

describe('EducationPanel', () => {
  it('shows the degree', () => {
    render(<EducationPanel />)
    expect(screen.getByText('Technologist Degree in Data Science')).toBeInTheDocument()
    expect(screen.getByText(/Estácio de Sá/)).toBeInTheDocument()
  })

  it('separates the degree from the certificates', () => {
    render(<EducationPanel />)
    expect(screen.getByText('Degree')).toBeInTheDocument()
    expect(screen.getAllByText('Certificate')).toHaveLength(3)
  })

  it('lists education newest first', () => {
    render(<EducationPanel />)
    const years = screen.getAllByTestId('edu-year').map((n) => n.textContent)
    expect(years).toEqual(['2024', '2024', '2023', '2022'])
  })
})
