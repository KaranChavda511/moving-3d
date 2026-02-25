import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import tailwindCanonical from "eslint-plugin-tailwind-canonical-classes";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["**/*.css"],
    plugins: {
      "tailwind-canonical": tailwindCanonical,
    },
    rules: {
      "tailwind-canonical/tailwind-canonical-classes": [
        "error",
        {
          cssPath: "src/app/globals.css",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "**/*.css",
  ]),
]);

export default eslintConfig;
