import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Hospital Suite",
        short_name: "Hospital",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0b5cff",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-512x512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // 👇 give the web app access to shared permission constants
      "#permissions": path.resolve(__dirname, "../packages/permissions.js"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    proxy: {
      // forward /api → http://localhost:8080/api
      "/api": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
  build: { target: "es2018", sourcemap: false, chunkSizeWarningLimit: 1000 },
});
