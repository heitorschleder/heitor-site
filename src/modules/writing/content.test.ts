import { describe, it, expect } from 'vitest'
import { posts } from '#content'

describe('post collection', () => {
  // Not a count of the current posts, which changes whenever one is written or
  // pulled. `velite --strict` throws on a schema error but exits 0 when the glob
  // matches *nothing*, so this is the one failure schema validation cannot see.
  it('matched at least one file', () => {
    expect(posts.length).toBeGreaterThan(0)
  })

  it('strips the date prefix from every slug', () => {
    // Asserted over the whole collection rather than one named slug, so the
    // test does not pin itself to a post that may be rewritten or removed.
    const slugs = posts.map((p) => p.slug)
    expect(slugs.every((s) => !/^\d{4}-\d{2}-\d{2}-/.test(s))).toBe(true)
    expect(slugs.every((s) => s === s.toLowerCase())).toBe(true)
  })

  it('builds a permalink under /blog', () => {
    expect(posts.every((p) => p.permalink.startsWith('/blog/'))).toBe(true)
  })

  it('gives every post at least one tag and a summary', () => {
    for (const post of posts) {
      expect(post.tags.length, `${post.slug} has no tags`).toBeGreaterThan(0)
      expect(post.summary.length, `${post.slug} has no summary`).toBeGreaterThan(0)
    }
  })

  it('keeps every slug unique', () => {
    expect(new Set(posts.map((p) => p.slug)).size).toBe(posts.length)
  })
})
