import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    // Gzip for broad compatibility
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
    // Brotli for modern browsers (smaller than gzip)
    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
  ],
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
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // inline assets < 4KB as base64
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-recharts': ['recharts', 'react-is'],
          'vendor-pdf': ['@react-pdf/renderer'],
          'vendor-mui': ['@mui/material', '@emotion/react', '@emotion/styled'],
        }
      }
    }
  },
  preview: { port: 4173, host: true }
})
