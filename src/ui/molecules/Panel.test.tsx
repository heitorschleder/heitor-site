import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('renders its title at level 2 by default', () => {
    render(
      <Panel title="Technologies" icon={Cpu}>
        <p>body</p>
      </Panel>,
    )
    expect(screen.getByRole('heading', { name: 'Technologies', level: 2 })).toBeInTheDocument()
  })

  it('renders its title at level 1 when headingLevel prop is set to 1', () => {
    render(
      <Panel title="Writing" icon={Cpu} headingLevel={1}>
        <p>body</p>
      </Panel>,
    )
    expect(screen.getByRole('heading', { name: 'Writing', level: 1 })).toBeInTheDocument()
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
  const items = [
    { label: 'All', count: 22 },
    { label: 'Vue', count: 10 },
  ]

  it('shows a label and count per item', () => {
    render(<FilterStrip items={items} active="All" onSelect={() => {}} label="Filter by language" />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('22')).toBeInTheDocument()
    expect(screen.getByText('Vue')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('renders each facet as a button, so it can be reached by keyboard', () => {
    render(<FilterStrip items={items} active="All" onSelect={() => {}} label="Filter by language" />)
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('marks only the active facet as pressed', () => {
    render(<FilterStrip items={items} active="Vue" onSelect={() => {}} label="Filter by language" />)
    expect(screen.getByRole('button', { name: /Vue/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /All/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('reports the clicked label', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<FilterStrip items={items} active="All" onSelect={onSelect} label="Filter by language" />)
    await user.click(screen.getByRole('button', { name: /Vue/ }))
    expect(onSelect).toHaveBeenCalledWith('Vue')
  })

  it('names the group for assistive tech', () => {
    render(<FilterStrip items={items} active="All" onSelect={() => {}} label="Filter by language" />)
    expect(screen.getByRole('group', { name: 'Filter by language' })).toBeInTheDocument()
  })
})
