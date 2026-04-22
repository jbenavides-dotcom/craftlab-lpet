import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Subruta del repo en GitHub Pages: jbenavides-dotcom.github.io/craftlab-lpet/
  base: '/craftlab-lpet/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
      },
      includeAssets: ['icons/icon.svg', 'icons/maskable-icon.svg'],
      manifest: {
        name: 'CraftLab · La Palma & El Tucán',
        short_name: 'CraftLab',
        description: 'Your coffee playground — La Palma & El Tucán',
        theme_color: '#c1004a',
        background_color: '#c1004a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/craftlab-lpet/',
        start_url: '/craftlab-lpet/',
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/maskable-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})
