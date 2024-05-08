// vite.config.js
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // server: process.env.NODE_ENV === 'production' ? undefined : {
  //   https: {
  //     key: './key.pem',
  //     cert: './cert.pem',
  //   }
  // },
  plugins: [
    VitePWA({
      injectRegister: 'auto',
      manifest: {
        name: 'Velvet Voice Resonance Analyzer',
        short_name: 'Velvet',
        start_url: '/index.html',
        orientation: 'any',
        theme_color: '#6b003b',
        scope: '/',
        display: 'standalone',
        icons: [
          {
            src: './public/assets/velvet512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: './public/assets/velvet1024.png',
            sizes: '1024x1024',
            type: 'image/png',
          },
          {
            src: './public/assets/velvet512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: './public/assets/iOS/1024.png',
            sizes: '1024x1024',
            type: 'image/png',
          },
          {
            src: './public/assets/iOS/512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: './public/assets/iOS/180.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: './public/assets/iOS/152.png',
            sizes: '152x152',
            type: 'image/png',
          },
          {
            src: './public/assets/iOS/120.png',
            sizes: '120x120',
            type: 'image/png',
          },
          {
            src: './public/assets/iOS/87.png',
            sizes: '87x87',
            type: 'image/png',
          },
          {
            src: './public/assets/iOS/80.png',
            sizes: '80x80',
            type: 'image/png',
          },
          {
            src: './public/assets/iOS/76.png',
            sizes: '76x76',
            type: 'image/png',
          },
          {
            src: './public/assets/iOS/72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: './public/assets/android/mipmap-xxxhdpi/ic_launcher.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: './public/assets/android/mipmap-xxhdpi/ic_launcher.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: './public/assets/android/mipmap-xhdpi/ic_launcher.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: './public/assets/android/mipmap-hdpi/ic_launcher.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: './public/assets/android/mipmap-mdpi/ic_launcher.png',
            sizes: '48x48',
            type: 'image/png',
          },
        ],
        description: 'A voice resonance analyzer',
        screenshots: [
          {
            src: './public/assets/screenshot01.png',
            sizes: '733x1574',
            type: 'image/png',
          },
          {
            src: './public/assets/screenshot02.png',
            sizes: '760x1579',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
