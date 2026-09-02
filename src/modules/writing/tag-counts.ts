import { countBy, type FilterItem } from '@/shared/counts'
import type { PostSummary } from './PostList'

/**
 * Its own file rather than the barrel: `PostBrowser` needs it, and the barrel
 * exports `PostBrowser`, so importing it from there would be a cycle.
 */
export function tagCounts(posts: PostSummary[]): FilterItem[] {
  return countBy(posts, (post) => post.tags)
}
