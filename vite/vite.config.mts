import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

import viteTsconfigPaths from 'vite-tsconfig-paths';
import envCompatible from 'vite-plugin-env-compatible';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
// import { visualizer } from 'rollup-plugin-visualizer';
// import vitePluginRequire from "vite-plugin-require";

export default defineConfig(({ mode }) => {
  // Dev-only: proxy same-origin Pods-service calls to a local pods_service (VITE_PODS_BASE_URL).
  // The Host stays "localhost", so the Pods service resolves the tenant from your token
  // (tapisservice's built-in local-dev path) rather than from the URL — no tenant rewrite needed —
  // and same-origin means there is no CORS.
  const env = loadEnv(mode, process.cwd(), '');
  const podsTarget = (env.VITE_PODS_BASE_URL || '')
    .replace(/\/+$/, '')
    .replace(/\/v3$/, '');
  // A local Pods service only accepts tokens from the site it is configured
  // for, so a non-develop login fails every Pods call: warn at startup.
  if (
    podsTarget &&
    env.VITE_TAPIS_BASE_URL &&
    !/\.develop\.tapis\.io/.test(env.VITE_TAPIS_BASE_URL)
  ) {
    console.warn(
      `\n[pods proxy] VITE_PODS_BASE_URL (${podsTarget}) is on while VITE_TAPIS_BASE_URL is ` +
        `${env.VITE_TAPIS_BASE_URL}. A local pods_service only accepts tokens from the site it ` +
        `is configured for (usually develop), so Pods calls will fail with ` +
        `'Invalid Tapis token'. Comment out VITE_PODS_BASE_URL to use that tenant's own Pods.\n`
    );
  }
  return {
    // depending on your application, base can also be "/"
    base: '',
    // Flat, not nested. These were once inside a second `define: {}`, which
    // defined an identifier literally named `define` and left process.platform
    // and process.version untouched, so any dependency that read either at load
    // threw "process is not defined" in the browser.
    define: {
      global: 'window',
      'process.platform': null,
      'process.version': null,
      // 'process.env.NODE_ENV': 'production',
    },
    css: {
      preprocessorOptions: { scss: { api: 'modern-compiler', charset: false } },
    },
    resolve: {
      alias: {
        events: 'events',
      },
      dedupe: [
        'react',
        'react-dom',
        '@codemirror/state',
        '@codemirror/view',
        '@codemirror/language',
        '@codemirror/lint',
        '@codemirror/autocomplete',
        '@codemirror/commands',
        '@codemirror/search',
        '@codemirror/lang-json',
        '@codemirror/lang-python',
        'codemirror',
        '@uiw/react-codemirror',
      ],
    },
    optimizeDeps: {
      include: [
        '@emotion/styled',
        '@mui/material',
        '@mui/system',
        '@mui/icons-material',
        '@mui/lab',
        '@codemirror/state',
        '@codemirror/view',
        '@codemirror/language',
        '@codemirror/lint',
        '@codemirror/autocomplete',
        '@codemirror/commands',
        '@codemirror/search',
        '@codemirror/lang-json',
        '@codemirror/lang-python',
        'codemirror',
        '@uiw/react-codemirror',
        '@kitware/vtk.js',
      ],
    },
    plugins: [
      react(),
      commonjs({
        include: [
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
          /node_modules\/globalthis/,
          /node_modules\/xmlbuilder2/,
          /node_modules\/@oozcitak/,
        ],
        requireReturnsDefault: false, // "preferred" | "auto" | true | false
        strictRequires: 'debug',
        //esmExtevisualizerrnals: ["react-table"], // Convert CommonJS modules to ESModule
      }),
      viteTsconfigPaths(),
      envCompatible(),
      babel({
        babelHelpers: 'runtime',
        plugins: ['@babel/plugin-transform-runtime'],
        exclude: 'node_modules/**', // Exclude node_modules from being transpiled
      }),
    ],
    build: {
      minify: true,
      sourcemap: false,
      outDir: 'dist',
      manifest: true,
      target: 'esnext',
      cssCodeSplit: true,
      rollupOptions: {
        external: ['packages'],
        output: {
          // Split ONLY libraries that are already needed for the first
          // paint. Naming a lazy-only library here (leaflet, vtk.js,
          // codemirror, reactflow all used to be) forces its chunk into the
          // entry's static imports, which defeats the React.lazy boundary
          // that was keeping it out — that is how @kitware/vtk.js came to
          // load on every page for a Files modal nobody had opened.
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'mui-vendor': ['@mui/material', '@mui/icons-material', '@mui/lab'],
          },
          // Optimize chunk file naming
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId
                  .split('/')
                  .pop()
                  ?.replace('.tsx', '')
                  .replace('.ts', '')
              : 'chunk';
            return `assets/${facadeModuleId}-[hash].js`;
          },
        },
        // plugins: [
        //   visualizer({
        //     template: "treemap", // sunburst, treemap(default), network, raw-data, list
        //     filename: 'bundle-stats.html',
        //     open: true, // Open the visualizer after build
        //   }),
        // ],
      },
    },
    logLevel: 'info',
    // resolve: {
    //   alias: {
    //     '@tapis/tapisui-common': path.resolve(__dirname, './packages/tapisui-common/src'),
    //   }
    // },
    server: {
      open: true, // Opens browser
      // Overridable for containerized dev (e.g. VITE_DEV_HOST=0.0.0.0 so a
      // docker port publish can reach the server); default stays localhost.
      host: process.env.VITE_DEV_HOST || undefined,
      // Overridable so parallel dev servers can each use their own port; the
      // compound `pnpm dev` script cannot forward --port.
      port: Number(process.env.VITE_DEV_PORT) || 3000,
      proxy: {
        ...(podsTarget
          ? {
              // Forward Pods-service calls to the local pods_service. Keep changeOrigin:false so the
              // Host stays "localhost" — that triggers tapisservice's local-dev tenant resolution
              // (tenant taken from your token), so no Host/tenant rewrite is needed.
              '/v3/pods': {
                target: podsTarget,
                changeOrigin: false,
                secure: false,
              },
            }
          : {}),
        '/api/rag': {
          target: 'https://tapisagent.pods.tacc.tapis.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/rag/, ''),
          secure: true,
        },
        '/api/litellm': {
          target: 'https://litellm.pods.tacc.tapis.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/litellm/, ''),
          secure: true,
        },
      },
      // Dev only, and unrelated to the bundling above: `vite dev` serves
      // modules unbundled and transforms them on first request, so the first
      // visit to a page pays for ~60 files one at a time — which is the
      // route spinner you actually see while developing, not the chunk
      // sizes. Transforming the four service entries at startup moves that
      // cost off the first click. Costs nothing in a production build.
      warmup: {
        clientFiles: [
          './src/app/Systems/index.ts',
          './src/app/Files/index.ts',
          './src/app/Apps/index.ts',
          './src/app/Jobs/index.ts',
        ],
      },
      // watch: {
      //   usePolling: true,
      //   interval: 1,
      //   followSymlinks: true,
      //   ignored: [
      //     '!**/packages/**',
      //   ]

      //   // Only watch dist folders for subpackages
      //   // paths: [ ... ] // Removed because 'paths' is not a valid WatchOptions property
      // },
      // fs: {
      //   // allow: [
      //   //   '../packages/tapisui-common/dist',
      //   //   '**packages**',
      //   // ],
      // },
    },
    preview: {
      open: true,
      port: 3000,
    },
  };
});
