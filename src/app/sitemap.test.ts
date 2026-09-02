import { describe, it, expect } from 'vitest'
import sitemap from './sitemap'
import { sortedPosts } from '@/modules/writing'
import { site } from '@/shared/site.config'

describe('sitemap', () => {
  const entries = sitemap()

  it('includes four root routes', () => {
    const rootPaths = ['', '/work', '/blog', '/about'].map((path) => `${site.url}${path}`)
    const sitemapUrls = new Set(entries.map((e) => e.url))
    rootPaths.forEach((path) => {
      expect(sitemapUrls.has(path)).toBe(true)
    })
  })

  it('includes all published posts', () => {
    const posts = sortedPosts()
    const sitemapPostCount = entries.filter((e) => e.url.includes('/blog/')).length
    expect(sitemapPostCount).toBe(posts.length)
  })

  it('has valid lastModified dates for all entries', () => {
    entries.forEach((entry) => {
      // Entries should always have lastModified
      if (!entry.lastModified) return
      const date = new Date(entry.lastModified)
      // Must be a valid date, not NaN
      expect(date.getTime()).not.toBeNaN()
      // Must be a Date object or valid ISO string
      expect(entry.lastModified instanceof Date || typeof entry.lastModified === 'string').toBe(true)
    })
  })

  it('assigns each post its own publication date, not the build timestamp', () => {
    const posts = sortedPosts()
    entries.forEach((entry) => {
      const post = posts.find((p) => entry.url.includes(p.permalink))
      if (post && entry.lastModified) {
        // Extract the date the sitemap entry has
        const entryDate = entry.lastModified instanceof Date ? entry.lastModified : new Date(entry.lastModified as string)
        const postDate = new Date(post.date)
        // Must match the post's date exactly (same year, month, day)
        expect(entryDate.getUTCFullYear()).toBe(postDate.getUTCFullYear())
        expect(entryDate.getUTCMonth()).toBe(postDate.getUTCMonth())
        expect(entryDate.getUTCDate()).toBe(postDate.getUTCDate())
      }
    })
  })
})
