import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const themeColor = '#111012'

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    VitePWA({
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.svg'],
      injectRegister: 'auto',
      manifest: {
        background_color: themeColor,
        description: 'Log espresso shots and get a suggestion for the next one.',
        display: 'standalone',
        icons: [
          { sizes: '64x64', src: 'pwa-64x64.png', type: 'image/png' },
          { sizes: '192x192', src: 'pwa-192x192.png', type: 'image/png' },
          { sizes: '512x512', src: 'pwa-512x512.png', type: 'image/png' },
          { purpose: 'maskable', sizes: '512x512', src: 'maskable-icon-512x512.png', type: 'image/png' },
        ],
        id: './',
        lang: 'en-GB',
        name: 'Dialled',
        orientation: 'portrait',
        scope: './',
        short_name: 'Dialled',
        start_url: './',
        theme_color: themeColor,
      },
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
