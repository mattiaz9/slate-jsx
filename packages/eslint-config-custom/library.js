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
  rules: {
    "import/order": "off",
    "no-unused-vars": "off",
    "import/no-cycle": "off",
    "no-console":
      process.env.NODE_ENV === "production"
        ? ["error", { allow: ["info", "warn", "error", "debug", "table"] }]
        : "off",
    "no-nested-ternary": "off",
    "eslint-comments/require-description": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-redundant-type-constituents": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/naming-convention": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-call": "off",
  },
  ignorePatterns: ["node_modules/", "dist/"],
}
