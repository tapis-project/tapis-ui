import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  // tseslint.configs.stylistic,
  //tseslint.configs.recommendedTypeChecked, ## use these two instead for hard-mode
  //tseslint.configs.stylisticTypeChecked,
  {
    ignores: [
      'node_modules',
      'coverage',
      'build',
      'webpack.*.js',
      '*.test.js',
      'dist',
      'packages/tapisui-common/**/*.js',
      'scripts',
      'src/app/**/*.js',
      'eslint.config.js',
      '**/*.ts',
      '**/*.tsx'
    ],
		// languageOptions: {
		// 	ecmaVersion: 'latest',
		// 	sourceType: 'module',
		// 	// You can add a parser here if needed, e.g. to use @typescript-eslint/parser
		// 	// parser: '@typescript-eslint/parser',
		// 	// parserOptions: { project: './tsconfig.json' }
		// }
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
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
      'no-extra-boolean-cast': 'off'
    }
  }
);
