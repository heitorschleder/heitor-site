import { describe, it, expect } from 'vitest'
import { buildRssXml } from './rss.xml/build-rss'
import { sortedPosts } from '@/modules/writing'

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
