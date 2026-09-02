import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Shared pattern fragments. ESLint flat config does not merge a rule's options
// across matching config objects — the last matching object for a given rule
// wins outright — so every block below that touches `no-restricted-imports`
// spells out the full set of patterns it needs rather than relying on an
// earlier block's patterns still applying.
const forbidModuleInternals = {
  group: ["@/modules/*/*"],
  message: "Import a module through its index.ts, never from its internals.",
};
const forbidLucideDirect = {
  group: ["lucide-react"],
  message: "Import icons from @/ui/icons so the icon set stays swappable.",
};
const forbidModulesFromUiShared = {
  group: ["@/modules/*"],
  message: "ui/ and shared/ must not import from modules/.",
};
// `no-restricted-imports` patterns are gitignore-style globs, not regex: a
// bare `*` never crosses a `/`, and `**` will not cross into a segment that
// itself starts with `.` (so "../**" alone does not catch "../../foo"). So
// each realistic upward-escape depth is spelled out literally, with `**`
// only covering the non-dotted remainder after it.
const forbidUpwardRelative = {
  group: ["../**", "../../**", "../../../**", "../../../../**"],
  message: "Import across directories through the @/ alias so the module and layer boundary rules can see it.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Base for the entire src/ tree, src/app/** included: module internals,
    // lucide-react and any upward `../` escape are forbidden everywhere, so
    // the layer that legitimately imports from every module — src/app — is
    // covered too, not just modules/, ui/ and shared/ below.
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [forbidModuleInternals, forbidLucideDirect, forbidUpwardRelative],
      }],
    },
  },
  {
    // The UI layer knows nothing about the domain. The arrow only points inward.
    files: ["src/ui/**/*.{ts,tsx}", "src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [forbidModuleInternals, forbidLucideDirect, forbidModulesFromUiShared, forbidUpwardRelative],
      }],
    },
  },
  {
    // The icon barrel is the one place allowed to touch lucide directly.
    files: ["src/ui/icons/index.ts"],
    rules: { "no-restricted-imports": "off" },
  },
]);

export default eslintConfig;
