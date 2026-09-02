import * as runtime from 'react/jsx-runtime'

function useMDXComponent(code: string) {
  const fn = new Function(code)
  return fn({ ...runtime }).default as React.ComponentType<Record<string, unknown>>
}

export function MDXContent({ code }: { code: string }) {
  // react-hooks/static-components assumes a component built during render loses
  // state on every re-render, which is the right worry for a client tree. This
  // is a Server Component: it renders once per request, holds no hooks or state,
  // and evaluating Velite's compiled MDX per-request is the documented pattern
  // for consuming `s.mdx()` output (mirrored by contentlayer and next-mdx-remote).
  const Component = useMDXComponent(code)
  // eslint-disable-next-line react-hooks/static-components
  return <Component />
}
