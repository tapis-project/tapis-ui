import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import envCompatible from 'vite-plugin-env-compatible';
import commonjs from '@rollup/plugin-commonjs';
import viteCommonjs from 'vite-plugin-commonjs';
// import { visualizer } from 'rollup-plugin-visualizer';
// import vitePluginRequire from "vite-plugin-require";

export default defineConfig({
  // depending on your application, base can also be "/"
  base: '',
  define: {
    global: 'window',
    define: {
      'process.platform': null,
      'process.version': null,
      // 'process.env.NODE_ENV': 'production',
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
      include: [
        /node_modules\/@uiw\/react-codemirror/, // Ensure CommonJS transformation for node_modules
        /node_modules\/react-table/, // Include react-table for CommonJS transformation
        /node_modules\/react/,
        /node_modules\/react-dom/,
        /node_modules\/react-router/,
        /node_modules\/scheduler/,
        /node_modules\/react-is/,
        /node_modules\/hoist-non-react-statics/,
        /node_modules\/tiny-invariant/,
        /packages\/tapisui-common\/node_modules\/react-table/,
        /packages\/tapisui-common\/node_modules\/hoist-non-react-statics/,
        /packages\/tapisui-common\/node_modules\/react-router/,
        /packages\/tapisui-common\/node_modules\/react-is/,
        /packages\/icicle-tapisui-extension\/node_modules\/react-is/,
      ],
      requireReturnsDefault: false, // "preferred" | "auto" | true | false
      strictRequires: 'debug',
      //esmExternals: ["react-table"], // Convert CommonJS modules to ESModule
    }),
    // viteCommonjs(),
    viteTsconfigPaths(),
    envCompatible(),
  ],
  build: {
    minify: true,
    sourcemap: true,
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
