import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Hedef15 Pro - Akıllı Spor Toto',
        short_name: 'Hedef15',
        description: 'Yapay zeka destekli Spor Toto formül, analiz ve canlı ikramiye platformu',
        theme_color: '#0B0F19',
        background_color: '#0B0F19',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /\/bulletin\/current\.json/,
            handler: 'NetworkFirst',
            options: { cacheName: 'bulletin-cache', expiration: { maxEntries: 1, maxAgeSeconds: 900 } }
          },
          {
            urlPattern: /\/live\/scores\.json/,
            handler: 'NetworkFirst',
            options: { cacheName: 'live-scores-cache', expiration: { maxEntries: 1, maxAgeSeconds: 60 } }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    open: false
  },
  test: {
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**']
  }
});
