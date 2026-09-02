'use client'

import { useState } from 'react'
import { FilterStrip } from '@/ui/molecules/FilterStrip'
import { ALL_FILTER, withAllFacet } from '@/shared/counts'
import { PostList, type PostSummary } from './PostList'
import { tagCounts } from './tag-counts'

/**
 * Owns which tag is selected. Every post renders; non-matching ones carry
 * `hidden`, so the prerendered HTML is the unfiltered list and a crawler sees
 * all of it regardless of what a visitor filtered to.
 *
 * A post carries several tags, so "matching" means the selected tag is among
 * them — unlike a repository, which has exactly one language.
 */
export function PostBrowser({ posts }: { posts: PostSummary[] }) {
  const [tag, setTag] = useState(ALL_FILTER)

  const matches = (post: PostSummary) => tag === ALL_FILTER || post.tags.includes(tag)
  const matchedCount = posts.filter(matches).length

  return (
    <>
      <FilterStrip
        items={withAllFacet(posts.length, tagCounts(posts))}
        active={tag}
        onSelect={setTag}
        label="Filter writing by tag"
      />
      <PostList posts={posts} isHidden={(post) => !matches(post)} />
      {matchedCount === 0 ? (
        <p className="px-3 py-6 text-[14px] text-[var(--color-mute)]">
          Nothing tagged {tag} yet.
        </p>
      ) : null}
    </>
  )
}
