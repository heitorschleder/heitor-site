import { posts as allPosts } from '#content'
import { countBy, type FilterItem } from '@/shared/counts'
import type { PostSummary } from './PostList'

export { PostList, formatDate, type PostSummary } from './PostList'
export { PostArticle, type ArticleHead } from './PostArticle'
export { MDXContent } from './MDXContent'

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

/**
 * The single "this slug, and not a draft" lookup. `generateMetadata` and the
 * page body in `src/app/blog/[slug]/page.tsx` both need exactly this check —
 * sharing one function is what keeps them from drifting apart: a bare
 * `.find` without the draft guard once let a draft's title leak into
 * `<head>` metadata before the page body's `notFound()` ever ran.
 *
 * Takes the collection as a parameter (rather than reading `#content`
 * itself) so it stays a plain, testable function with no module to mock.
 */
export function findPublishedPost<T extends { slug: string; draft: boolean }>(
  posts: T[],
  slug: string,
): T | undefined {
  return posts.find((post) => post.slug === slug && !post.draft)
}

export function tagCounts(posts: PostSummary[]): FilterItem[] {
  return countBy(posts, (post) => post.tags)
}
