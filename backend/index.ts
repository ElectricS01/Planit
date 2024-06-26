import sequelize from "./db"
import { serve } from "bun"
import argon2 from "argon2"
import cryptoRandomString from "crypto-random-string"

import Users from "./models/users"
import Sessions from "./models/sessions"

sequelize

serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url)
    if (url.pathname === "/api/register" && request.method === "POST") {
      const text = JSON.parse(await request.text())
      const data = { message: "Welcome to the Bun API" }

      const user = await Users.create({
        email: text.email,
        emailToken: cryptoRandomString({
          length: 128
        }),
        password: await argon2.hash(text.password),
        username: text.username
      })

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
