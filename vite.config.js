import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';



export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'
  const serverUrl = isProduction
    ? 'https://backendchats-production.up.railway.app/'
    : 'http://localhost:4000'

  return {  
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: serverUrl,
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: serverUrl,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
          utils: ['axios', 'socket.io-client', 'date-fns'],
        }
      }
    }
  },
  define: {
    'process.env': process.env,
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    }
  }
}
});