import { defineConfig, defineCollection, s } from 'velite'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'

const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(110),
      date: s.isodate(),
      summary: s.string().max(260),
      tags: s.array(s.string()).min(1),
      draft: s.boolean().default(false),
      slug: s.path(),
      content: s.mdx(),
      reading: s.metadata(),
    })
    .transform((data) => {
      // s.path() yields "posts/2026-08-24-title"; the route wants the bare slug
      // with the date prefix stripped.
      const slug = data.slug.replace(/^posts\//, '').replace(/^\d{4}-\d{2}-\d{2}-/, '')
      return {
        ...data,
        slug,
        permalink: `/blog/${slug}`,
      }
    }),
})

export default defineConfig({
  root: 'content',
  output: { data: '.velite', clean: true },
  collections: { posts },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          // One hue plus the neutral ramp, so highlighting survives the theme switch.
          theme: { dark: 'github-dark-dimmed', light: 'github-light' },
          keepBackground: false,
        },
      ],
    ],
  },
})
