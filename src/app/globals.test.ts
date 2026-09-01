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

/**
 * Body of a CSS rule, found by its exact selector-plus-brace marker (e.g.
 * `:root[data-theme='dark'] {`). Assumes no nested braces inside the rule.
 */
function blockBody(marker: string): string {
  const i = css.indexOf(marker)
  expect(i, `globals.css must contain \`${marker}\``).toBeGreaterThan(-1)
  const open = i + marker.length
  const close = css.indexOf('}', open)
  return css.slice(open, close)
}

/** Normalise a declaration block to its properties, ignoring whitespace and `color-scheme`. */
function declarations(body: string): string[] {
  return body
    .split(';')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('color-scheme'))
    .sort()
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

  it('keeps the OS-preference dark block and the explicit dark block identical', () => {
    // Both guard blocks must resolve the same set of tokens to the same values.
    // If they ever diverge, OS-preference-dark silently disagrees with an
    // explicit dark choice — nothing else in this suite would catch that.
    const osPreference = declarations(blockBody(':root:not([data-theme=\'light\']) {'))
    const explicit = declarations(blockBody(':root[data-theme=\'dark\'] {'))
    expect(osPreference).toEqual(explicit)
  })
})
