# Modules

One directory per domain. Each answers three questions:

| Module | What it does | Depends on |
|---|---|---|
| `career` | The four roles and the disclosure panel that renders them | `ui/molecules`, `ui/atoms`, `ui/icons` |
| `repositories` | Build-time GitHub loader and the repository grid | `ui/molecules`, `ui/icons`, `shared/cn`, `shared/site.config`, `content/repos.overrides` |
| `writing` | Post list, article shell, MDX runtime | `#content`, `ui/atoms` |
| `profile` | Technology matrix and education | `ui/molecules`, `ui/atoms`, `ui/icons`, `shared/cn` |
| `home` | The hero | `ui/icons`, `shared/site.config` |

**Rules, enforced by `no-restricted-imports` in `eslint.config.mjs`:**

1. Import a module through its `index.ts`. Never reach into its internals.
2. `ui/` and `shared/` never import from `modules/`. The arrow points inward.
3. Icons come from `@/ui/icons`, never from `lucide-react` directly.
