import sequelize from "./db"
import { serve } from "bun"
import argon2 from "argon2"
import cryptoRandomString from "crypto-random-string"

import auth from "./lib/auth"
import nodemailerLibrary from "./lib/mailer"

import Messages from "./models/messages"
import Permissions from "./models/permissions"
import Projects from "./models/projects"
import Users from "./models/users"
import Sessions from "./models/sessions"
import Notifications from "./models/notifications"
import Resources from "./models/resources"
import Tasks from "./models/tasks"

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
        attributes: ["id", "name", "description", "icon", "owner", "latest"],
        include: [
          {
            attributes: ["userId", "type"],
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
        { headers, status: 200 }
      )
    } else if (
      url.pathname.startsWith("/api/project/") &&
      url.pathname.split("/")[3] &&
      request.method === "GET"
    ) {
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }
      const association = await Permissions.findOne({
        where: {
          projectId: url.pathname.split("/")[3],
          userId: user.id
        }
      })
      if (!association) {
        return new Response("You do not have access to this project", {
          status: 400
        })
      }
      const project = await Projects.findOne({
        attributes: ["id", "name", "description", "icon", "owner", "latest"],
        include: [
          {
            attributes: ["type"],
            model: Permissions,
            where: { userId: user.id }
          },
          {
            attributes: ["messageContents"],
            model: Messages
          },
          {
            attributes: ["name", "description", "icon"],
            model: Resources
          },
          {
            attributes: ["name", "description", "icon"],
            model: Tasks
          },
          {
            attributes: ["id", "username", "avatar"],
            model: Users
          }
        ],
        where: {
          id: url.pathname.split("/")[3]
        }
      })
      if (!project) {
        return new Response("Project does not exist", { status: 400 })
      }
      return new Response(
        JSON.stringify({
          ...project?.toJSON()
        }),
        { headers, status: 200 }
      )
    } else if (url.pathname === "/api/get-user" && request.method === "POST") {
      if (!parseInt(body.userId, 10) && !body.username) {
        return new Response("User requested does not exist", { status: 400 })
      }
      if (body.username) {
        const user = await Users.findOne({
          attributes: ["id"],
          where: { username: body.username }
        })
        if (!user) {
          return new Response(
            "User requested does not exist or could not be found",
            { status: 400 }
          )
        }
        return new Response(
          JSON.stringify({
            id: user.id
          }),
          { headers, status: 200 }
        )
      }
      const user = await Users.findOne({
        attributes: {
          exclude: [
            "email",
            "password",
            "emailVerified",
            "emailToken",
            "admin",
            "saveSwitcher",
            "switcherHistory",
            "updatedAt"
          ]
        },
        where: { id: body.userId }
      })
      if (!user) {
        return new Response(
          "User requested does not exist or could not be found",
          { status: 400 }
        )
      }
      return new Response(JSON.stringify({ user }), { headers, status: 200 })
    } else if (url.pathname === "/api/register" && request.method === "POST") {
      if (
        !body.username ||
        body.username.length < 1 ||
        !body.password ||
        body.password.length < 1 ||
        !body.email ||
        body.email.length < 1
      ) {
        return new Response("Form not complete", { status: 400 })
      }
      if (
        !body.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ) {
        return new Response("Email is invalid", { status: 400 })
      }
      if (
        await Users.findOne({
          where: {
            username: body.username
          }
        })
      ) {
        return new Response("Username is taken", { status: 400 })
      }
      if (
        await Users.findOne({
          where: {
            email: body.email
          }
        })
      ) {
        return new Response("Email is taken", { status: 400 })
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
        { headers, status: 200 }
      )
    } else if (url.pathname === "/api/login" && request.method === "POST") {
      if (
        !body.username ||
        !body.password ||
        body.username.length < 1 ||
        body.password.length < 1
      ) {
        return new Response("Form not complete", { status: 400 })
      }
      const user = await Users.findOne({
        where: {
          username: body.username
        }
      })
      if (!user) {
        return new Response("User not found", { status: 400 })
      }
      if (!(await argon2.verify(user.password, body.password))) {
        return new Response("Incorrect password", { status: 401 })
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
        { headers, status: 200 }
      )
    } else if (
      url.pathname === "/api/create-project" &&
      request.method === "POST"
    ) {
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }
      if (body.icon && !body.icon.match(/(https?:\/\/\S+)/g)) {
        return new Response("Icon is not a valid URL", { status: 400 })
      }
      if (body.name?.length > 30) {
        return new Response("Project name too long", { status: 400 })
      }
      if (body.description?.length > 500) {
        return new Response("Project description too long", { status: 400 })
      }
      if (!body.name) {
        body.name = "New Project"
      }
      if (!body.description) {
        body.description = "A New Planit Project"
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
        status: 200
      })
    } else if (
      url.pathname === "/api/create-task" &&
      request.method === "POST"
    ) {
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }
      if (body.icon && !body.icon.match(/(https?:\/\/\S+)/g)) {
        return new Response("Icon is not a valid URL", { status: 400 })
      }
      if (body.name?.length > 30) {
        return new Response("Task name too long", { status: 400 })
      }
      if (body.description?.length > 500) {
        return new Response("Task description too long", { status: 400 })
      }
      if (!body.name) {
        body.name = "New Task"
      }
      if (!body.description) {
        body.description = "A New Planit Task"
      }
      const newTask = await Tasks.create({
        description: body.description,
        icon: body.icon,
        name: body.name
      })
      return new Response(JSON.stringify({ project: newTask }), {
        status: 200
      })
    } else if (url.pathname === "/api/history" && request.method === "POST") {
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }
      if (body.history.length < 1) {
        return new Response("History has no content", { status: 400 })
      }
      if (body.history.length > 50) {
        return new Response("History too long", { status: 400 })
      }
      await user.update({ switcherHistory: body.history })
      return new Response("", { status: 200 })
    } else if (
      url.pathname === "/api/edit-project" &&
      request.method === "PATCH"
    ) {
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }
      if (body.icon && !body.icon.match(/(https?:\/\/\S+)/g)) {
        return new Response("Icon is not a valid URL", { status: 400 })
      }
        return new Response("Project name too long", { status: 400 })
    } else {
      return new Response("Not Found", { status: 404 })
    }
  },
  error(error) {
    console.log(`${error}\n${error.stack}`)
    return new Response(`${error}\n${error.stack}`, {
      headers: {
        "Content-Type": "text/html"
      },
      status: 400
    })
  }
})

console.log("Server is running on http://localhost:3100")
