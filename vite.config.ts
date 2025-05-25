import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Block Puzzle Classic',
        short_name: 'BlockPuzzle',
        description: 'Geek-style Tetris puzzle game',
        theme_color: '#00d4ff',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@/game': fileURLToPath(new URL('./src/game', import.meta.url)),
      '@/ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
      '@/data': fileURLToPath(new URL('./src/data', import.meta.url)),
      '@/assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@/types': fileURLToPath(new URL('./src/types', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['pixi.js'],
          ui: ['zustand'],
          audio: ['howler']
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
}) 