import { posts as allPosts } from '#content'
import type { PostSummary } from './PostList'

export { PostList, formatDate, type PostSummary } from './PostList'

/** Published posts, newest first. Drafts never reach a production build. */
export function sortedPosts(): PostSummary[] {
  return allPosts
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((post) => ({
      slug: post.slug,
      permalink: post.permalink,
      title: post.title,
      date: post.date,
      summary: post.summary,
      tags: post.tags,
      readingTime: post.reading.readingTime,
    }))
}

export function tagCounts(posts: PostSummary[]): { label: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}
