import { describe, it, expect } from 'vitest'
import { findPublishedPost } from './index'

const posts = [
  { slug: 'live-post', draft: false, title: 'A live post' },
  { slug: 'secret-draft', draft: true, title: 'An unpublished draft' },
]

describe('findPublishedPost', () => {
  it('finds a published post by slug', () => {
    expect(findPublishedPost(posts, 'live-post')).toEqual(posts[0])
  })

  it('does not return a draft, even when the slug matches', () => {
    expect(findPublishedPost(posts, 'secret-draft')).toBeUndefined()
  })

  it('returns undefined for an unknown slug', () => {
    expect(findPublishedPost(posts, 'no-such-slug')).toBeUndefined()
  })
})
