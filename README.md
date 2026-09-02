# heitor-site

Canonical personal site of Heitor Schleder — portfolio and blog, in English.

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Velite. The shadcn CLI is
configured (`components.json`) but no primitives are generated or in use yet.

The design is written down in
[`docs/superpowers/specs/2026-09-01-portfolio-blog-design.md`](docs/superpowers/specs/2026-09-01-portfolio-blog-design.md).

## Running it

```bash
cp .env.example .env.local   # add a GITHUB_TOKEN with public repo read
npm install
npm run dev                  # velite --watch and next dev, together
```

`npm run build` fails if the GitHub API is unreachable. That is deliberate: a published
site with zero projects is worse than a deploy that did not happen.

## Layout

- `src/modules/*` — one directory per domain, each entered through its `index.ts`
- `src/ui/*` — design system, knows nothing about the domain
- `content/posts/*.mdx` — validated at build time by Velite against a zod schema
- `content/repos.overrides.ts` — English descriptions for every public repository

## Pre-deploy checklist

The automated suite (`npm run lint`, `npx tsc --noEmit`, `npm test`) does not cover
these — check them by hand with `npm run dev` before every deploy:

- [ ] Narrow the browser window to 390px: the nav links drop to their own full-bleed
      row, and repository cards go single column.
- [ ] Toggle the theme switch: the page never flashes the other theme on reload, and
      the choice survives it.
- [ ] With the OS set to dark and no theme choice stored yet, confirm the site follows
      the OS setting.
- [ ] Open print preview on `/`: every career role prints expanded, not collapsed.
- [ ] Tab through the Home page: a visible focus ring appears on every stop, in a
      sane order.
