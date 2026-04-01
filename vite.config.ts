import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '.emergentagent.com',
        '.cluster-0.preview.emergentcf.cloud',
        'e6cf0ae8-e58d-4eeb-b095-dc2b1e2c9deb.preview.emergentagent.com',
        'e6cf0ae8-e58d-4eeb-b095-dc2b1e2c9deb.cluster-0.preview.emergentcf.cloud',
        'all'
      ],
    },
  };
});
