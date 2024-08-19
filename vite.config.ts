import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import envCompatible from 'vite-plugin-env-compatible';
import commonjs from '@rollup/plugin-commonjs';
import viteCommonjs from 'vite-plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { visualizer } from 'rollup-plugin-visualizer';

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
  optimizeDeps: {
    include: [
      '@emotion/styled',
      '@mui/material',
      '@mui/system',
      '@mui/icons-material',
    ],
  },
  plugins: [
    react(),
    commonjs({
      include: /node_modules\/@uiw\/react-codemirror/, // Ensure CommonJS transformation for node_modules
      requireReturnsDefault: 'auto', // Handle default exports correctly
    }),
    // viteCommonjs(),
    viteTsconfigPaths(),
    envCompatible(),
    babel({
      babelHelpers: 'runtime',
      plugins: ['@babel/plugin-transform-runtime'],
      exclude: 'node_modules/**', // Exclude node_modules from being transpiled
    }),
  ],
  build: {
    minify: false,
    sourcemap: false,
    outDir: 'dist',
    manifest: true,
    rollupOptions: {
      external: ['packages'],
      // plugins: [
      //   visualizer({
      //     filename: 'bundle-stats.html',
      //     open: true, // Open the visualizer after build
      //   })
      // ]
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
