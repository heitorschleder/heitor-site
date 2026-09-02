import type { Metadata } from 'next'
import { Panel } from '@/ui/molecules/Panel'
import { FilterStrip } from '@/ui/molecules/FilterStrip'
import { BookOpen } from '@/ui/icons'
import { PostList, sortedPosts, tagCounts } from '@/modules/writing'

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Notes on architecture, front-end work and the decisions behind them.',
}

export default function BlogPage() {
  const posts = sortedPosts()
  return (
    <Panel title="Writing" icon={BookOpen} meta={`${posts.length} entries · English`} headingLevel={1}>
      <FilterStrip items={[{ label: 'All', count: posts.length, active: true }, ...tagCounts(posts)]} />
      <PostList posts={posts} />
    </Panel>
  )
}
