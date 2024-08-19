import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import envCompatible from 'vite-plugin-env-compatible';
import commonjs from '@rollup/plugin-commonjs';
import viteCommonjs from 'vite-plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { visualizer } from 'rollup-plugin-visualizer';


// https://vitejs.dev/config/
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
  },  plugins: [
    react(),
    commonjs({
      include: /node_modules\/@uiw\/react-codemirror/, // Ensure CommonJS transformation for node_modules
      // requireReturnsDefault: 'auto', // Handle default exports correctly
    }),
  ],
})
