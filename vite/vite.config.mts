import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import envCompatible from 'vite-plugin-env-compatible';
import commonjs from '@rollup/plugin-commonjs';
import viteCommonjs from 'vite-plugin-commonjs';

export default defineConfig({
  // depending on your application, base can also be "/"
  base: '/tapis-ui/#/',
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
    outDir: 'build',
    manifest: true,
    rollupOptions: {
      external: ['lib'],
    },
  },
  logLevel: 'info',
  server: {
    open: false, // Open browser
    host: '0.0.0.0',
    port: 3000,
  },
});
