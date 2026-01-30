import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_TARGET || 'http://10.12.72.9:8080';

  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      visualizer({ 
        open: false, // Don't open automatically in CI/tool env
        gzipSize: true, 
        brotliSize: true,
        filename: 'stats.html' 
      })
    ],
    server: {
      proxy: {
        '/ims/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              proxyReq.setHeader('Origin', apiTarget);
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
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('recharts')) {
                return 'recharts';
              }
              if (id.includes('react-markdown')) {
                return 'markdown';
              }
              if (id.includes('lucide-react')) {
                return 'icons';
              }
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor';
              }
            }
          }
        }
      }
    },
  };
});
