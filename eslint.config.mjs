import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import tailwindCanonical from "eslint-plugin-tailwind-canonical-classes";
import reactCompiler from "eslint-plugin-react-compiler";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["**/*.css"],
    plugins: {
      "tailwind-canonical": tailwindCanonical,
      "react-compiler": reactCompiler,
    },
    rules: {
      "tailwind-canonical/tailwind-canonical-classes": [
        "error",
        {
          cssPath: "src/app/globals.css",
        },
      ],
      "react-compiler/react-compiler": "error",
    },
  },
  prettierConfig,
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
