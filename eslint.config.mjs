import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.husky/**",
      "eslint.config.mjs",
      "test-setup.js",
      "prettier.config.js",
      "*.config.js",
      "*.config.mjs",
    ],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-console": "off",
      "consistent-return": "off",
      "no-param-reassign": ["error", { props: false }],
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": ["error", { allow: ["req", "res", "next", "err"] }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "prefer-const": "error",
      "prettier/prettier": [
        "error",
        {
          singleQuote: false,
        },
      ],
    },
  },
);
