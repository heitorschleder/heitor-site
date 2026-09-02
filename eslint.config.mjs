import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: ["@/modules/*/*"],
            message: "Import a module through its index.ts, never from its internals.",
          },
          {
            group: ["lucide-react"],
            message: "Import icons from @/ui/icons so the icon set stays swappable.",
          },
        ],
      }],
    },
  },
  {
    // The UI layer knows nothing about the domain. The arrow only points inward.
    files: ["src/ui/**/*.{ts,tsx}", "src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{ group: ["@/modules/*"], message: "ui/ and shared/ must not import from modules/." }],
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
