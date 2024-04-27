import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
  VitePWA({
    manifest: {
      name: "Velvet is a voice resonance analyzer for speech therapy purposes",
      short_name: "Velvet",
      start_url: "./",
      orientation: "any",
      theme_color: "#6b003b",
      scope: "./",
      display: "standalone",
      icons: [
        {
          src: "./src/assets/velvet512.png",
          sizes: "512x512",
          type: "image/png"
        },
        {
          src: "./src/assets/velvet1024.png",
          sizes: "1024x1024",
          type: "image/png"
        },
        {
          src: "./src/assets/velvet512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable"
        }
      ],
      description: "A voice resoance analyzer",
      screenshots: [
        {
          src: "./src/assets/screenshot01.png",
          sizes: "322x692",
          type: "image/png"
        },
        {
          src: "./src/assets/screenshot02.png",
          sizes: "318x696",
          type: "image/png"
        },
        {
          src: "./src/assets/screenshot03.png",
          sizes: "320x698",
          type: "image/png"
        }
      ]
    }
  })
  ],
})
