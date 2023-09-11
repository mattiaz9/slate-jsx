const { resolve } = require("node:path")

const project = resolve(process.cwd(), "tsconfig.json")

/*
 * This is a custom ESLint configuration for use with
 * typescript packages.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

module.exports = {
  extends: [
    "@vercel/style-guide/eslint/node",
    "@vercel/style-guide/eslint/typescript",
    "@vercel/style-guide/eslint/browser",
  ].map(require.resolve),
  parserOptions: {
    project,
  },
  globals: {
    JSX: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  overrides: [
    {
      files: ["*.vue"],
      parser: "vue-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
      plugins: ["@typescript-eslint", "prettier"],
      extends: ["plugin:vue/vue3-recommended", "custom"],
      rules: {
        // Require empty line between certain statements
        "padding-line-between-statements": [
          "warn",
          {
            blankLine: "always",
            prev: [
              "block",
              "block-like",
              "cjs-export",
              "class",
              "export",
              "import",
              "multiline-block-like",
              "multiline-const",
              "multiline-expression",
              "multiline-let",
              "multiline-var",
            ],
            next: "*",
          },
          {
            blankLine: "always",
            prev: ["const", "let"],
            next: ["block", "block-like", "cjs-export", "class", "export", "import"],
          },
          {
            blankLine: "always",
            prev: "*",
            next: [
              "multiline-block-like",
              "multiline-const",
              "multiline-expression",
              "multiline-let",
              "multiline-var",
            ],
          },
          { blankLine: "any", prev: ["export", "import"], next: ["export", "import"] },
        ],
        // Same ordering of component tags everywhere
        "vue/component-tags-order": [
          "error",
          {
            order: ["template", "script", "style"],
          },
        ],
        // Require empty line between component tags
        "vue/padding-line-between-blocks": "error",
        // Allow single word component names ("Example" instead of "MyExample")
        "vue/multi-word-component-names": "off",
        // Don't require default value for props that are not marked as required
        "vue/require-default-prop": "off",
      },
    },
  ],
  ignorePatterns: ["node_modules/", "dist/"],
}
