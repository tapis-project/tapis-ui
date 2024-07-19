import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import envCompatible from 'vite-plugin-env-compatible';
import commonjs from '@rollup/plugin-commonjs';
import viteCommonjs from 'vite-plugin-commonjs';

export default defineConfig({
  // depending on your application, base can also be "/"
  base: '',
  define: {
    global: 'window',
    define: {
      'process.platform': null,
      'process.version': null,
    },
  },
  css: { preprocessorOptions: { scss: { charset: false } } },
  plugins: [
    react(),
    commonjs({
      include: /node_modules/, // Ensure CommonJS transformation for node_modules
      requireReturnsDefault: 'auto', // Handle default exports correctly
    }),
    viteCommonjs(),
    viteTsconfigPaths(),
    envCompatible(),
  ],
  build: {
    sourcemap: true,
    outDir: 'dist',
    manifest: true,
    rollupOptions: {
      external: ['packages'],
    },
  },
  logLevel: 'info',
  server: {
    open: true, // Opens browser
    port: 3000,
  },
  preview: {
    port: 8113,
    open: true,
  },
});
