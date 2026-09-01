import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrandGithub, BrandLinkedin } from './index'

describe('vendored brand marks', () => {
  it.each([
    ['github', BrandGithub],
    ['linkedin', BrandLinkedin],
  ])('%s matches the lucide drawing convention', (_name, Icon) => {
    const { container } = render(<Icon />)
    const svg = container.querySelector('svg')!

    // lucide 1.39 ships no brand marks, so these are Tabler paths. They only sit
    // beside lucide icons convincingly if they share its drawing convention.
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).toHaveAttribute('stroke-width', '2')
    expect(svg).toHaveAttribute('stroke-linecap', 'round')
    expect(svg).toHaveAttribute('stroke-linejoin', 'round')
  })

  it('forwards className so callers control size', () => {
    const { container } = render(<BrandGithub className="size-4" />)
    expect(container.querySelector('svg')).toHaveClass('size-4')
  })
})
