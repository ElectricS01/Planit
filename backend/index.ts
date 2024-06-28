import sequelize from "./db"
import { serve } from "bun"
import argon2 from "argon2"
import cryptoRandomString from "crypto-random-string"

import nodemailerLibrary from "./lib/mailer"

import Users from "./models/users"
import Sessions from "./models/sessions"

sequelize

const emailLibrary = new nodemailerLibrary()

serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url)

    if (url.pathname === "/api/register" && request.method === "POST") {
      const text = JSON.parse(await request.text())

      if (
        text.username.length < 1 ||
        text.password.length < 1 ||
        text.email.length < 1
      ) {
        return new Response(JSON.stringify({ message: "Form not complete" }), {
          headers: { "Content-Type": "application/json" },
          status: 400
        })
      }
      if (
        await Users.findOne({
          where: {
            username: text.username
          }
        })
      ) {
        return new Response(JSON.stringify({ message: "Username is taken" }), {
          headers: { "Content-Type": "application/json" },
          status: 400
        })
      }
      if (
        await Users.findOne({
          where: {
            email: text.email
          }
        })
      ) {
        return new Response(JSON.stringify({ message: "Email is taken" }), {
          headers: { "Content-Type": "application/json" },
          status: 400
        })
      }
      const user = await Users.create({
        email: text.email,
        emailToken: cryptoRandomString({
          length: 128
        }),
        password: await argon2.hash(text.password),
        username: text.username
      })
      emailLibrary
        .sendEmail(
          "support@electrics01.com",
          text.email,
          `Hi ${user.username}, Verify your email address`,
          `Hi ${user.username},\n\nThank You for signing up to Planit\n\nPlease click the link below to verify your email address:\nhttps://planit.electrics01.com/verify?token=${user.emailToken}\n\nIf you did not request this email, please ignore it.\n\nThanks,\n\nElectrics01 Support Team`
        )
        .catch((e) => {
          console.log("Error occurred while sending email:", e)
        })
      const session = await Sessions.create({
        token: cryptoRandomString({ length: 128 }),
        userAgent: request.headers.get("User-Agent"),
        userId: user.id
      })
      return new Response(JSON.stringify({ token: session.token }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      })
    } else {
      return new Response("Not Found", { status: 404 })
    }
  }
})

console.log("Server is running on http://localhost:3000")
