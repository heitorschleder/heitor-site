import type { PostSummary } from './PostList'

export type ArticleHead = Pick<PostSummary, 'title' | 'date' | 'summary' | 'tags'>

export function PostArticle({
  post,
  children,
}: {
  post: ArticleHead
  children: React.ReactNode
}) {
  const printed = new Date(post.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-panel)] px-[14px] pb-4 pt-5 @min-[520px]/shell:px-4 @min-[520px]/shell:pb-[18px] @min-[520px]/shell:pt-[26px]">
        <p className="mb-3 flex flex-wrap items-center gap-x-[14px] gap-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-mute)]">
          <span className="text-[var(--color-acc)]">{post.tags[0]}</span>
          <time dateTime={post.date}>{printed}</time>
          <span>EN</span>
        </p>
        <h1 className="mb-3 max-w-[20ch] text-balance font-display text-[clamp(26px,4.6vw,42px)] font-bold uppercase leading-[0.98] tracking-[0.01em] text-[var(--color-ink)]">
          {post.title}
        </h1>
        <p className="max-w-[62ch] text-[15.5px] leading-[1.6] text-[var(--color-mute)]">
          {post.summary}
        </p>
      </header>

      {/* The console steps back here. Body text sits on the page ground in a
          64-character column, not inside a panel. */}
      <div className="prose-console mx-auto max-w-[64ch] px-[14px] pb-2 pt-5 @min-[520px]/shell:px-4 @min-[520px]/shell:pt-6">
        {children}
      </div>
    </article>
  )
}
