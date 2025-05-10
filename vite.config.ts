import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: { target: "esnext" },
    exclude: ['@noir-lang/noirc_abi', '@noir-lang/acvm_js']
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies into separate chunks
          vendor: ['react', 'react-dom', 'react-router-dom'],
          noir: ['@noir-lang/noir_js'],
          aztec: ['@aztec/bb.js'],
          leaflet: ['leaflet', 'react-leaflet']
        }
      }
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      workbox: {
        // Increase the maximum file size limit for precaching
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        // Alternatively, you can exclude large files from precaching
        // and they will be cached at runtime instead
        runtimeCaching: [
          {
            urlPattern: /\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'js-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      manifest: {
        name: 'NoLoc GPS App',
        short_name: 'NoLoc GPS',
        description: 'A Progressive Web App for accessing GPS data',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: true // Makes our app accessible from your local network
  }
})
