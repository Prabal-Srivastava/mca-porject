import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:5000',
      '/history': 'http://localhost:5000',
      '/submit': 'http://localhost:5000',
      '/job': 'http://localhost:5000',
      '/ai': 'http://localhost:5000',
      '/tests': 'http://localhost:5000',
      '/socket.io': {
        target: 'ws://localhost:5000',
        ws: true,
      },
    },
  },
  build: {
    target: 'es2022',
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('monaco-editor')) return 'editor';
            if (id.includes('react')) return 'vendor';
            return 'deps';
          }
        },
      },
    },
    sourcemap: false,
    reportCompressedSize: false,
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: ['@monaco-editor/react', 'socket.io-client', 'lucide-react', 'framer-motion'],
  }
})
