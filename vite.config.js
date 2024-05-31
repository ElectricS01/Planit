import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      manifest: {
        name: "Planit",
        short_name: "Planit",
        description:
          "Planit is a modern and advanced project management software solution",
        theme_color: "#282a2b",
        background_color: "#181a1b",
        display: "fullscreen",
        categories: ["productivity", "events", "lifestyle", "utilities"],
        start_url: "/"
      }
    })
  ],
  server: {
    port: 8080
  }
})
