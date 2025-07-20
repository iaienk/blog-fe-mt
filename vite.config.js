import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sass from 'sass'
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    viteStaticCopy({
      targets: [
        { src: 'src/assets/*', dest: 'assets' }
      ]
    })
  ],
  build: {
    // forza tutti gli asset a essere emessi come file
    assetsInlineLimit: 0,
    // (opzionale) pandas i nomi
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  },
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

server: {
    proxy: {
      '/socket.io': {
        target: 'https://todo-pp.longwavestudio.dev',
        ws: true,
        changeOrigin: true,
        secure: false
      },
      '/user': {
        target: 'https://todo-pp.longwavestudio.dev',
        changeOrigin: true,
        secure: false
      }
    }
  }
})