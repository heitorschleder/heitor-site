import type { MetadataRoute } from 'next'
import { site } from '@/shared/site.config'
import { sortedPosts } from '@/modules/writing'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/work', '/blog', '/about'].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
  }))
  const posts = sortedPosts().map((post) => ({
    url: `${site.url}${post.permalink}`,
    lastModified: new Date(`${post.date}T00:00:00Z`),
  }))
  return [...routes, ...posts]
}
