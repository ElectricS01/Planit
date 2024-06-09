import sequelize from "./db"
import { serve } from "bun"

sequelize

serve({
  port: 3000,
  fetch(request) {
    const url = new URL(request.url)
    if (url.pathname === "/") {
      return new Response("Hello, world!", { status: 200 })
    } else if (url.pathname === "/api") {
      const data = { message: "Welcome to the Bun API" }
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
        status: 200
      })
    } else {
      return new Response("Not Found", { status: 404 })
    }
  }
})

console.log("Server is running on http://localhost:3000")
