import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    // Tu configuración de proxy existente
    proxy: {
      '/autoefec': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      },
      '/upload': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  // Configuración para rutas en preview/producción
  preview: {
    port: 4173,
    host: true,
  }
})