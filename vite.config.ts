import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/autoefec': { target: 'http://localhost:4000', changeOrigin: true },
      '/upload': { target: 'http://localhost:4000', changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-recharts': ['recharts', 'react-is'],
          'vendor-pdf': ['@react-pdf/renderer'],
        }
      }
    }
  },
  preview: { port: 4173, host: true }
})
