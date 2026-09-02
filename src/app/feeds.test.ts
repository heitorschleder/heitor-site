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


  it('emits valid RFC 822 pubDate for each post, not "Invalid Date"', () => {
    // Extract all pubDate values from the XML
    const pubDateMatches = xml.match(/<pubDate>([^<]+)<\/pubDate>/g) ?? []
    expect(pubDateMatches.length).toBe(sortedPosts().length)

    // Verify each pubDate is not the error string and parses as valid RFC 822
    pubDateMatches.forEach((match) => {
      const pubDate = match.replace(/<\/?pubDate>/g, '')
      // Must not be the error string
      expect(pubDate).not.toBe('Invalid Date')
      // Must parse to a valid date (not NaN)
      const parsed = new Date(pubDate)
      expect(parsed.getTime()).not.toBeNaN()
      // RFC 822 should contain day of week, abbreviated month, and year
      expect(pubDate).toMatch(/^\w{3},\s+\d{1,2}\s+\w{3}\s+\d{4}/)
    })
  })
})

describe('buildRssXml escaping', () => {
  // Escaping is a property of the builder, not of whatever titles happen to
  // exist. This used to assert against a real post called "Envelope<T>"; when
  // that post was removed the test went green while proving nothing. A hostile
  // fixture cannot rot that way.
  const hostile = [
    {
      slug: 'hostile',
      permalink: '/blog/hostile',
      title: 'Envelope<T> & "friends" > everything',
      date: '2026-08-24T00:00:00.000Z',
      summary: 'A summary with <script>alert(1)</script> & an ampersand.',
      tags: ['Security'],
    },
  ]

  const xml = buildRssXml(hostile)

  it('escapes angle brackets so a title cannot open a tag', () => {
    expect(xml).toContain('Envelope&lt;T&gt;')
    expect(xml).not.toContain('Envelope<T>')
  })

  it('escapes an ampersand once, not twice', () => {
    expect(xml).toMatch(/&amp;\s+&quot;friends&quot;/)
    expect(xml).not.toContain('&amp;amp;')
  })

  it('escapes a script tag in the summary into inert text', () => {
    expect(xml).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(xml).not.toContain('<script>')
  })

  it('leaves the document parseable — no stray < outside a real tag', () => {
    const withoutTags = xml.replace(/<[^>]*>/g, '')
    expect(withoutTags).not.toContain('<')
  })
})

describe('formatDate with real post data', () => {
  const posts = sortedPosts()

  it('formats real Velite post dates correctly (not "Invalid Date")', () => {
    // Velite emits full ISO instants like "2026-08-24T00:00:00.000Z", not bare dates.
    // This test ensures date formatting works with real data, not just fixtures.
    const formatted = formatDate(posts[0].date)
    // Must not produce the error string from malformed date parsing
    expect(formatted).not.toBe('Invalid Date')
    // Must produce a date-like pattern: e.g., "24 Aug 2026"
    expect(formatted).toMatch(/\d{1,2}\s+\w+\s+\d{4}/)
  })
})
