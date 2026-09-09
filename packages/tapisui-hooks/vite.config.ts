import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      /**
       * Resolve the sibling package from SOURCE, not from its build output.
       *
       * `@tapis/tapisui-api` declares `main: ./dist/index.js` and nothing
       * else, so importing it needs that package compiled first. CI runs
       * `pnpm install` then `pnpm run test` with no build step in between,
       * so `dist/` does not exist there and any hook test that reaches the
       * api package dies at resolution — while passing locally, where a
       * previous build left `dist/` lying around. That is the worst kind of
       * green: it depends on what happens to be on the developer's disk.
       *
       * A unit test of a hook's caching contract should not need the api
       * package built at all, so point at its source and let vite transform
       * it like any other file.
       */
      '@tapis/tapisui-api': path.resolve(__dirname, '../tapisui-api/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
