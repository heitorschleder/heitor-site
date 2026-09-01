import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Panel } from './Panel'
import { FilterStrip } from './FilterStrip'
import { Cpu } from '@/ui/icons'

describe('Panel', () => {
  it('renders its title as a heading so the page has an outline', () => {
    render(
      <Panel title="Technologies" icon={Cpu}>
        <p>body</p>
      </Panel>,
    )
    expect(screen.getByRole('heading', { name: 'Technologies' })).toBeInTheDocument()
  })

  it('renders optional meta text', () => {
    render(
      <Panel title="Career" icon={Cpu} meta="4 roles">
        <p>body</p>
      </Panel>,
    )
    expect(screen.getByText('4 roles')).toBeInTheDocument()
  })

  it('renders its children', () => {
    render(
      <Panel title="Career" icon={Cpu}>
        <p>the body</p>
      </Panel>,
    )
    expect(screen.getByText('the body')).toBeInTheDocument()
  })
})

describe('FilterStrip', () => {
  it('shows a label and count per item', () => {
    render(
      <FilterStrip
        items={[
          { label: 'All', count: 22, active: true },
          { label: 'Vue', count: 10 },
        ]}
      />,
    )
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('22')).toBeInTheDocument()
    expect(screen.getByText('Vue')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})
