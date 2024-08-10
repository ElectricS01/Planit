// Imports

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { VitePWA } from "vite-plugin-pwa"

// Create the Vite configuration, Vite is the tool that compiles and runs the Vue project
export default defineConfig({
  // Plugins define what Vite will compile, Planit uses Vue for the frontend and VitePWA
  // to make the Web Application work offline, PWA is a standard for creating Web Apps
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

  // This code proxys */api links from the Axios library to the backenn, this means that
  // when you try to access https://planit.electrics01.com/api/login, your request is
  // proxied to http://localhost:3100/api/login in the backend server
  server: {
    port: 8080,
    proxy: {
      "/api": "http://localhost:3100"
    }
  }
})
