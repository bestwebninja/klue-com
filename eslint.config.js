export default [
  {
    ignores: ["dist", "node_modules"],
  },
  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    },
  },
];
