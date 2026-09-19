/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Golf Practice',
        short_name: 'GolfPractice',
        description: 'Track golf practice shots, putts, and drills',
        theme_color: '#2f8f4e',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^\/api\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5185,
    proxy: {
      '/api': {
        target: 'http://localhost:3057',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5185,
    proxy: {
      '/api': {
        target: 'http://localhost:3057',
        changeOrigin: true,
      },
    },
    allowedHosts: ['.trycloudflare.com'],
  },
  test: {
    environment: 'node',
  },
})
