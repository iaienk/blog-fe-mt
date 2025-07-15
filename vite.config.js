import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sass from 'sass'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Per usare API globali come describe, it, expect
    environment: 'jsdom', // Ambiente per i test DOM
    setupFiles: './src/tests/setup.js', // File per setup globale (es. import jest-dom)
  },
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
      },
    },
  },
})