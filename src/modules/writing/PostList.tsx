import Link from 'next/link'
import { Chip } from '@/ui/atoms/Chip'

export type PostSummary = {
  slug: string
  permalink: string
  title: string
  /** Full ISO 8601 instant from Velite (e.g., '2026-08-24T00:00:00.000Z'), not a bare date */
  date: string
  summary: string
  tags: string[]
  readingTime: number
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function PostList({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) {
    return (
      <p className="px-3 py-6 text-[14px] text-[var(--color-mute)]">
        No posts yet. The first one is being written.
      </p>
    )
  }

  return (
    <ul>
      {posts.map((post) => (
        <li
          key={post.slug}
          className="grid grid-cols-1 gap-[6px] border-b border-[var(--color-rule)] px-3 py-[13px] last:border-b-0 @min-[520px]/shell:grid-cols-[86px_minmax(0,1fr)] @min-[520px]/shell:gap-[14px]"
        >
          <time
            dateTime={post.date}
            className="pt-[3px] font-mono text-[10.5px] uppercase tracking-[0.06em] tabular-nums text-[var(--color-mute)]"
          >
            {formatDate(post.date)}
          </time>
          <div>
            <h3 className="mb-[5px] font-display text-[20px] font-semibold uppercase leading-[1.14] tracking-[0.01em]">
              <Link href={post.permalink} className="text-[var(--color-ink)] hover:text-[var(--color-acc)]">
                {post.title}
              </Link>
            </h3>
            <p className="mb-2 max-w-[64ch] text-[13.5px] leading-[1.55] text-[var(--color-mute)]">
              {post.summary}
            </p>
            <div className="flex flex-wrap items-center gap-[6px]">
              {post.tags.map((tag, i) => (
                <Chip key={tag} tone={i === 0 ? 'accent' : 'quiet'}>
                  {tag}
                </Chip>
              ))}
              <span className="font-mono text-[9.5px] uppercase tracking-[0.09em] text-[var(--color-mute)]">
                {post.readingTime} min
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
