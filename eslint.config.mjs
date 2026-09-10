import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import emDashBaseline from './eslint.emdash-baseline.mjs';

/**
 * The em-dash gate.
 *
 * An em-dash reads as an aside, and a UI string is too small a space to
 * hold one: a period, a comma or a pair of parentheses says the same thing
 * without the pause. This catches them where a person actually reads them,
 * in string literals, template chunks and JSX text. Comments and JSDoc are
 * deliberately NOT covered; they are prose for developers, and ESLint's
 * selectors cannot see them anyway.
 *
 * Two escape hatches, because the repo starts with ~1550 of these:
 *
 *   1. eslint.emdash-baseline.mjs, the files not yet cleaned. The rule is
 *      off for those. That list is meant to SHRINK: deleting an entry
 *      (having fixed the file) is the whole workflow, and nothing adds to
 *      it silently.
 *   2. `// eslint-disable-next-line no-restricted-syntax` on the line, for
 *      the rare string where an em-dash is genuinely the right character.
 *
 * NOTE on scope: TypeScript was in the global `ignores` until now, so this
 * repo linted no .ts/.tsx at all. Turning the recommended sets on for it
 * would be a several-thousand-error change dressed up as a copy fix, so
 * TypeScript is parsed for exactly one rule and nothing else. The js/jsx
 * side keeps precisely the coverage it had.
 */
const EM_DASH = '—';
const COMPLAINT =
  'No em-dash in user-facing text. Use a period, a comma, or parentheses. ' +
  '(If this string is never rendered, disable the rule on the line.)';
const noEmDash = [
  'error',
  { selector: `Literal[value=/${EM_DASH}/]`, message: COMPLAINT },
  { selector: `TemplateElement[value.raw=/${EM_DASH}/]`, message: COMPLAINT },
  { selector: `JSXText[value=/${EM_DASH}/]`, message: COMPLAINT },
];

/**
 * Rules named by `eslint-disable` comments in .tsx files for plugins this
 * repo does not install. They were invisible while TypeScript was ignored
 * wholesale; now that it is parsed, an unknown rule name in a directive is
 * itself an error. These stubs let the directives resolve to a no-op
 * rather than turning 75 old comments into new failures. Installing the
 * real plugins is the fix, and its own decision.
 */
const noop = { create: () => ({}) };
const absentPlugins = {
  'react-hooks': { rules: { 'exhaustive-deps': noop } },
  react: { rules: { 'no-array-index-key': noop } },
};

export default defineConfig(
  {
    ignores: [
      'node_modules',
      'coverage',
      'build',
      'webpack.*.js',
      '*.test.js',
      'dist',
      '**/dist/**',
      // gitignored local artifact written by scripts/dev-pods.sh
      '.pnpmfile.cjs',
      'packages/tapisui-common/**/*.js',
      'scripts',
      'src/app/**/*.js',
      'eslint.config.js',
    ],
  },
  // Unchanged coverage for the files that already had it. The tseslint
  // set is what supplies a JSX-capable parser here, so .jsx keeps parsing.
  {
    files: ['**/*.js', '**/*.jsx'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
    rules: {
      // Turn off rules. We need to undo this when ready!
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      'prefer-const': 'off',
      'no-var': 'off',
      'no-useless-escape': 'off',
      'no-extra-boolean-cast': 'off',
    },
  },
  // TypeScript is parsed for exactly one reason: the copy gate.
  {
    files: ['**/*.ts', '**/*.tsx'],
    // test names and fixtures are not user-facing text
    ignores: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { '@typescript-eslint': tseslint.plugin, ...absentPlugins },
    // the old directives are all "unused" now that their rules are stubs;
    // that is expected, not a finding
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    rules: { 'no-restricted-syntax': noEmDash },
  },
  // …except in the files not yet cleaned. Spread, because an empty `files`
  // array is a config error, and an empty baseline is the goal.
  ...(emDashBaseline.length
    ? [{ files: emDashBaseline, rules: { 'no-restricted-syntax': 'off' } }]
    : [])
);
