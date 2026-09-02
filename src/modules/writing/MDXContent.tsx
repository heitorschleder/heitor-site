import * as runtime from 'react/jsx-runtime'

function useMDXComponent(code: string) {
  const fn = new Function(code)
  return fn({ ...runtime }).default as React.ComponentType<Record<string, unknown>>
}

export function MDXContent({ code }: { code: string }) {
  // react-hooks/static-components assumes a component built during render loses
  // state on every re-render, which is the right worry for a client tree. This
  // is a Server Component, and these routes are static (generateStaticParams):
  // it evaluates once per build, not once per request — requests are served
  // the cached HTML. It holds no hooks or state, and evaluating Velite's
  // compiled MDX at render time is the documented pattern for consuming
  // `s.mdx()` output (mirrored by contentlayer and next-mdx-remote).
  //
  // This safety argument depends entirely on the component staying server-only.
  // If this file ever needs "use client" — e.g. to mount a copy button inside
  // compiled MDX — the same code would run on every client re-render, and this
  // disable must be re-justified (or removed) at that point, not left standing.
  const Component = useMDXComponent(code)
  // eslint-disable-next-line react-hooks/static-components
  return <Component />
}
