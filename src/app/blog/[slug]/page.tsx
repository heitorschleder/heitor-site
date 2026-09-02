import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { posts } from '#content'
import { PostArticle, MDXContent, findPublishedPost } from '@/modules/writing'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return posts.filter((p) => !p.draft).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = findPublishedPost(posts, slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.summary,
    openGraph: { title: post.title, description: post.summary, type: 'article' },
  }
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params
  const post = findPublishedPost(posts, slug)
  if (!post) notFound()

  return (
    <PostArticle
      post={{
        title: post.title,
        date: post.date,
        summary: post.summary,
        tags: post.tags,
      }}
    >
      <MDXContent code={post.content} />
    </PostArticle>
  )
}
