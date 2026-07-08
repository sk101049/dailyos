import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "exports/**",
      "vendor/**",
      "src/**",
      "scripts/**",
      "types/**",
      "next-env.d.ts"
    ]
  },
  {
    plugins: {
      "@next/next": nextPlugin
    }
  },
  ...compat.extends("next/core-web-vitals")
];

export default eslintConfig;
