import sequelize from "./db"
import { serve } from "bun"
import argon2 from "argon2"
import cryptoRandomString from "crypto-random-string"

import auth from "./lib/auth"
import nodemailerLibrary from "./lib/mailer"

import Permissions from "./models/permissions"
import Projects from "./models/projects"
import Users from "./models/users"
import Sessions from "./models/sessions"

sequelize

const emailLibrary = new nodemailerLibrary()

serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url)
    const text = await request.text()
    const body = text ? JSON.parse(text) : ""

    if (url.pathname === "/api/user" && request.method === "GET") {
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }
      const projects = await Projects.findAll({
        attributes: ["id", "name", "description", "icon", "owner"],
        include: [
          {
            attributes: ["type"],
            model: Permissions,
            where: { userId: user.id }
          },
          {
            attributes: ["id", "username", "avatar"],
            model: Users
          }
        ]
      })
      return new Response(
        JSON.stringify({
          ...user.toJSON(),
          emailToken: undefined,
          password: undefined,
          projects
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200
        }
      )
    } else if (url.pathname === "/api/register" && request.method === "POST") {
      if (
        body.username.length < 1 ||
        body.password.length < 1 ||
        body.email.length < 1
      ) {
        return new Response(JSON.stringify({ message: "Form not complete" }), {
          headers: { "Content-Type": "application/json" },
          status: 400
        })
      }
      if (
        await Users.findOne({
          where: {
            username: body.username
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
            email: body.email
          }
        })
      ) {
        return new Response(JSON.stringify({ message: "Email is taken" }), {
          headers: { "Content-Type": "application/json" },
          status: 400
        })
      }
      const user = await Users.create({
        email: body.email,
        emailToken: cryptoRandomString({
          length: 128
        }),
        password: await argon2.hash(body.password),
        username: body.username
      })
      emailLibrary
        .sendEmail(
          "support@electrics01.com",
          body.email,
          `Hi ${user.username}, Verify your email address`,
          `Hi ${user.username},\n\nThank You for signing up to Planit\n\nPlease click the link below to verify your email address:\nhttps://planit.electrics01.com/verify?token=${user.emailToken}\n\nIf you did not request this email, please ignore it.\n\nThanks,\n\nElectrics01 Support Team`
        )
        .catch((e) => {
          console.log("Error occurred while sending email:", e)
        })
      const session = await Sessions.create({
        expiredAt: Date.now() + 15552000000,
        token: cryptoRandomString({ length: 128 }),
        userAgent: request.headers.get("User-Agent"),
        userId: user.id
      })
      return new Response(JSON.stringify({ token: session.token }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      })
    } else if (url.pathname === "/api/login" && request.method === "POST") {
      if (body.username.length < 1 || body.password.length < 1) {
        return new Response(JSON.stringify({ message: "Form not complete" }), {
          headers: { "Content-Type": "application/json" },
          status: 400
        })
      }
      const user = await Users.findOne({
        where: {
          username: body.username
        }
      })
      if (!user) {
        return new Response(JSON.stringify({ message: "User not found" }), {
          headers: { "Content-Type": "application/json" },
          status: 400
        })
      }
      if (!(await argon2.verify(user.password, body.password))) {
        return new Response(JSON.stringify({ message: "Incorrect password" }), {
          headers: { "Content-Type": "application/json" },
          status: 401
        })
      }
      const session = await Sessions.create({
        expiredAt: Date.now() + 15552000000,
        token: cryptoRandomString({ length: 128 }),
        userAgent: request.headers.get("User-Agent"),
        userId: user.id
      })
      const projects = await Projects.findAll({
        attributes: ["id", "name", "description", "icon", "owner"],
        include: [
          {
            attributes: ["type"],
            model: Permissions,
            where: { userId: user.id }
          },
          {
            attributes: ["id", "username", "avatar"],
            model: Users
          }
        ]
      })
      return new Response(
        JSON.stringify({
          token: session.token,
          ...user.toJSON(),
          emailToken: undefined,
          password: undefined,
          projects
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200
        }
      )
    } else if (
      url.pathname === "/api/create-project" &&
      request.method === "POST"
    ) {
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }
      if (!body.name) {
        return new Response(
          JSON.stringify({ message: "Project name not specified" }),
          {
            headers: { "Content-Type": "application/json" },
            status: 400
          }
        )
      }
      if (body.icon && !body.icon.match(/(https?:\/\/\S+)/g)) {
        return new Response(
          JSON.stringify({ message: "Icon is not a valid URL" }),
          {
            headers: { "Content-Type": "application/json" },
            status: 400
          }
        )
      }
      if (body.name.length > 30) {
        return new Response(
          JSON.stringify({ message: "Project name too long" }),
          {
            headers: { "Content-Type": "application/json" },
            status: 400
          }
        )
      }
      if (body.description.length > 500) {
        return new Response(
          JSON.stringify({ message: "Project description too long" }),
          {
            headers: { "Content-Type": "application/json" },
            status: 400
          }
        )
      }
      const newProject = await Projects.create({
        description: body.description,
        icon: body.icon,
        name: body.name,
        owner: user.id
      })
      await Permissions.create({
        projectId: newProject.id,
        type: 0,
        userId: newProject.owner
      })
      return new Response(JSON.stringify({ project: newProject }), {
        headers: { "Content-Type": "application/json" },
        status: 400
      })
    } else {
      return new Response("Not Found", { status: 404 })
    }
  }
})

console.log("Server is running on http://localhost:3000")
