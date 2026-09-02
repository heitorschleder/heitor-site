import { sortedPosts } from '@/modules/writing'
import { buildRssXml } from './build-rss'

export const dynamic = 'force-static'

export function GET() {
  return new Response(buildRssXml(sortedPosts()), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
