import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';

const env = loadEnv('', process.cwd());
export default defineConfig({
  // depending on your application, base can also be "/"
  base: '',
  css: { preprocessorOptions: { scss: { charset: false } } },
  define: {
    'process.env': env,
  },
  plugins: [react(), viteTsconfigPaths(), viteTsconfigPaths()],
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3000
    port: 3000,
  },
});
