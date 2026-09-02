import type { Metadata } from 'next'
import { Panel } from '@/ui/molecules/Panel'
import { BookOpen } from '@/ui/icons'
import { PostBrowser, sortedPosts } from '@/modules/writing'

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Notes on architecture, front-end work and the decisions behind them.',
}

export default function BlogPage() {
  const posts = sortedPosts()
  return (
    <Panel
      title="Writing"
      icon={BookOpen}
      meta={`${posts.length} entries · English`}
      headingLevel={1}
    >
      <PostBrowser posts={posts} />
    </Panel>
  )
}
