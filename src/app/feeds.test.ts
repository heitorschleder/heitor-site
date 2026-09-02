import { describe, it, expect } from 'vitest'
import { buildRssXml } from './rss.xml/build-rss'
import { sortedPosts, formatDate } from '@/modules/writing'

describe('buildRssXml', () => {
  const xml = buildRssXml(sortedPosts())

  it('declares itself as RSS 2.0', () => {
    expect(xml).toContain('<rss version="2.0"')
  })

  it('emits one item per published post', () => {
    expect(xml.match(/<item>/g) ?? []).toHaveLength(sortedPosts().length)
  })

  it('uses absolute links', () => {
    expect(xml).toContain('<link>https://')
    expect(xml).not.toContain('<link>/blog/')
  })

  it('escapes characters that would break the document', () => {
    // "Envelope<T>" would otherwise open a phantom tag.
    expect(xml).not.toMatch(/<title>[^<]*Envelope<T>/)
    expect(xml).toContain('Envelope&lt;T&gt;')
  })
})

describe('formatDate with real post data', () => {
  const posts = sortedPosts()

  it('formats real Velite post dates correctly (not "Invalid Date")', () => {
    // Velite emits full ISO instants like "2026-08-24T00:00:00.000Z", not bare dates.
    // This test ensures date formatting works with real data, not just fixtures.
    if (posts.length > 0) {
      const formatted = formatDate(posts[0].date)
      // Must not produce the error string from malformed date parsing
      expect(formatted).not.toBe('Invalid Date')
      // Must produce a date-like pattern: e.g., "24 Aug 2026"
      expect(formatted).toMatch(/\d{1,2}\s+\w+\s+\d{4}/)
    }
  })
})
