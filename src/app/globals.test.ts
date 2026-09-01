import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve(__dirname, './globals.css'), 'utf8')

const TOKENS = [
  '--color-bg', '--color-panel', '--color-panel-2', '--color-rule',
  '--color-ink', '--color-mute', '--color-acc', '--color-on-acc',
  '--color-wash', '--color-glow',
]

/** Body of the bare :root block — the baseline every token must appear in. */
function bareRoot(): string {
  const i = css.indexOf(':root {')
  expect(i, 'globals.css must contain a bare `:root {` block').toBeGreaterThan(-1)
  return css.slice(i, css.indexOf('\n}', i))
}

describe('theme tokens', () => {
  it('declares every token in the bare :root block', () => {
    const root = bareRoot()
    for (const token of TOKENS) {
      expect(root, `${token} missing from bare :root`).toContain(token)
    }
  })

  it('redefines tokens for an explicit dark choice', () => {
    expect(css).toContain('[data-theme=\'dark\']')
  })

  it('guards the prefers-color-scheme block so an explicit light choice wins', () => {
    expect(css).toContain('prefers-color-scheme: dark')
    expect(css).toContain(':root:not([data-theme=\'light\'])')
  })

  it('uses two accent values, never one hex for both themes', () => {
    expect(css).toContain('#5F9CF7')
    expect(css).toContain('#1B4CC9')
  })
})
