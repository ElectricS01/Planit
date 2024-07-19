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
import Notifications from "./models/notifications"

sequelize

const emailLibrary = new nodemailerLibrary()

const headers = {
  "Content-Type": "application/json"
}

serve({
  port: 3100,
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
      const notifications = await Notifications.findAll({
        where: {
          userId: user.id
        }
      })
      return new Response(
        JSON.stringify({
          ...user.toJSON(),
          emailToken: undefined,
          password: undefined,
          projects,
          notifications
        }),
        {
          headers,
          status: 200
        }
      )
    } else if (url.pathname === "/api/get-user" && request.method === "POST") {
      if (!parseInt(body.userId, 10) && !body.username) {
        return new Response("User requested does not exist", {
          headers,
          status: 400
        })
      }
      if (body.username) {
        const user = await Users.findOne({
          attributes: ["id"],
          where: { username: body.username }
        })
        if (!user) {
          return new Response("User requested does not exist or could not be found", {
            headers,
            status: 400
          })
        }
        return new Response(
          JSON.stringify({
            id: user.id
          }),
          {
            headers,
            status: 200
          }
        )
      }
      return new Response("User requested does not exist or could not be found", {
        headers,
        status: 400
      })
    } else if (
      url.pathname === "/api/register" &&
      request.method === "POST"
    ) {
      if (
        !body.username ||
        body.username.length < 1 ||
        !body.password ||
        body.password.length < 1 ||
        !body.email ||
        body.email.length < 1
      ) {
        return new Response("Form not complete", {
          headers,
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
        return new Response("Username is taken", {
          headers,
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
        return new Response("Email is taken", {
          headers,
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
      return new Response(
        JSON.stringify({
          token: session.token,
          ...user.toJSON(),
          emailToken: undefined,
          password: undefined
        }),
        {
          headers,
          status: 200
        }
      )
    } else if (
      url.pathname === "/api/login" &&
      request.method === "POST"
    ) {
      if (
        !body.username ||
        !body.password ||
        body.username.length < 1 ||
        body.password.length < 1
      ) {
        return new Response("Form not complete", {
          headers,
          status: 400
        })
      }
      const user = await Users.findOne({
        where: {
          username: body.username
        }
      })
      if (!user) {
        return new Response("User not found", {
          headers,
          status: 400
        })
      }
      if (!(await argon2.verify(user.password, body.password))) {
        return new Response("Incorrect password", {
          headers,
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
          headers,
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
        return new Response("Project name not specified", {
          headers,
          status: 400
        })
      }
      if (body.icon && !body.icon.match(/(https?:\/\/\S+)/g)) {
        return new Response("Icon is not a valid URL", {
          headers,
          status: 400
        })
      }
      if (body.name.length > 30) {
        return new Response("Project name too long", {
          headers,
          status: 400
        })
      }
      if (body.description.length > 500) {
        return new Response("Project description too long", {
          headers,
          status: 400
        })
      }
      const newProject = await Projects.create({
        description: body.description,
        icon: body.icon,
        latest: Date.now(),
        name: body.name,
        owner: user.id
      })
      await Permissions.create({
        projectId: newProject.id,
        type: 0,
        userId: newProject.owner
      })
      return new Response(JSON.stringify({ project: newProject }), {
        headers,
        status: 400
      })
    } else if (
      url.pathname === "/api/history" &&
      request.method === "POST"
    ) {
      const user = await auth(request)
        if (body.history.length < 1) {
          return new Response("History has no content", {
            headers,
            status: 400
          })
        }
        if (body.history.length > 50) {
          return new Response("History too long", {
            headers,
            status: 400
          })
        }
        await user.update({
          switcherHistory: body.history
        })
        return new Response( "",{
          headers,
          status: 204
        })
    } else {
      return new Response("Not Found", { status: 404 })
    }
  }
})

console.log("Server is running on http://localhost:3100")
