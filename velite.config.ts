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
  // A dropped post failing silently is worse than a failed build: strict makes the
  // schema a gate, not a filter — bad frontmatter must stop `velite && next build` cold.
  // NOTE: velite@0.4.0's CLI (cli.js) always passes an explicit `strict: false` default
  // from parseArgs, and resolveConfig does `options.strict ?? loadedConfig.strict ?? false`
  // — since `false` is not nullish, that CLI default silently wins over this value. This
  // config flag alone does not gate the build; the CLI also needs `--strict` on its command
  // line. `npm run velite` (package.json) is the single canonical invocation that carries
  // that flag — `dev`, `build` and `test` all call through it rather than invoking the
  // `velite` CLI directly, so this gotcha only has to be handled in one place.
  strict: true,
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
