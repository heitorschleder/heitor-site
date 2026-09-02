import { describe, it, expect } from 'vitest'
import { posts } from '#content'

describe('post collection', () => {
  it('loads every post', () => {
    expect(posts.length).toBeGreaterThanOrEqual(3)
  })

  it('strips the date prefix from the slug', () => {
    const slugs = posts.map((p) => p.slug)
    expect(slugs).toContain('envelope-t-designing-for-the-panel-that-fails')
    expect(slugs.every((s) => !/^\d{4}-\d{2}-\d{2}-/.test(s))).toBe(true)
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
