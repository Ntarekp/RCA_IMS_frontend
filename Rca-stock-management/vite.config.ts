import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    proxy: {
      '/ims/api': {
        target: 'http://10.12.72.9:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('Origin', 'http://10.12.72.9:8080');
          });
        },
      }
    }
  },
  esbuild: {
    // Drop console and debugger in production
    drop: ['console', 'debugger'],
  },
  build: {
    // Ensure source maps don't leak in production
    sourcemap: false,
  },
});
