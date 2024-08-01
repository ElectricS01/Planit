// Import utilities
import sequelize from "./db"
import { serve } from "bun"
import argon2 from "argon2"
import cryptoRandomString from "crypto-random-string"
import dayjs from "dayjs"

// Import Libraries
import auth from "./lib/auth"
import authSession from "./lib/authSession"
import nodemailerLibrary from "./lib/mailer"

// Import Seqelize-TS models
import Messages from "./models/messages"
import Permissions from "./models/permissions"
import Projects from "./models/projects"
import Users from "./models/users"
import Sessions from "./models/sessions"
import Notifications from "./models/notifications"
import Resources from "./models/resources"
import Tasks from "./models/tasks"

// Define reused variables
sequelize
const emailLibrary = new nodemailerLibrary()

const headers = {
  "Content-Type": "application/json"
}

// Call Bun's serve function with the port of "3100", this port is used to connect to the server
serve({
  port: 3100,
  async fetch(request) {
    // Define the url and body of the request for easy access
    const url = new URL(request.url)
    const text = await request.text()
    const body = text ? JSON.parse(text) : ""

    // The user API returns the user's data after checking it with the auth middleware
    if (url.pathname === "/api/user" && request.method === "GET") {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }
      // Get the all the user's projects with a sequelize findAll request where the user has a "Permissions" permission
      const projects = await Projects.findAll({
        attributes: ["id", "name", "description", "icon", "owner", "latest"],
        include: [
          {
            attributes: ["userId", "type"],
            model: Permissions,
            where: {
              userId: user.id
            },
            include: [
              {
                attributes: ["username", "avatar"],
                model: Users
              }
            ]
          },
          {
            attributes: ["id", "username", "avatar"],
            model: Users
          }
        ]
      })

      // Get all project ids
      const projectIds = projects.map((project) => project.id)

      // Find all permissions
      const allPermissions = await Permissions.findAll({
        attributes: ["userId", "type", "projectId"],
        where: {
          projectId: projectIds
        },
        include: [
          {
            attributes: ["username", "avatar"],
            model: Users
          }
        ]
      })

      // Attach all permissions to their respective projects
      projects.forEach((project) => {
        project.dataValues.permissions = allPermissions.filter(
          (permission) => permission.projectId === project.id
        )
      })

      // Get all notifications
      const notifications = await Notifications.findAll({
        where: {
          userId: user.id
        }
      })

      // Send all this data to the client
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
    }

    // The project API returns a project's data to the user
    else if (
      url.pathname.startsWith("/api/project/") &&
      url.pathname.split("/")[3] &&
      request.method === "GET"
    ) {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }

      // Check if the user has permission to this project
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

      // Find the project and it's permissions, messages, tasks, and owner
      const project = await Projects.findOne({
        attributes: ["id", "name", "description", "icon", "owner", "latest"],
        include: [
          {
            attributes: ["userId", "type"],
            model: Permissions,
            include: [
              {
                attributes: ["username", "avatar"],
                model: Users
              }
            ]
          },
          {
            attributes: ["messageContents"],
            model: Messages
          },
          {
            attributes: ["id", "name", "description", "icon"],
            model: Resources
          },
          {
            attributes: [
              "id",
              "name",
              "description",
              "icon",
              "startAt",
              "dueAt"
            ],
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

      // If the project couldn't be found then return an error message to the client
      if (!project) {
        return new Response("Project does not exist", { status: 400 })
      }

      // Otherwise send the project data to the client
      return new Response(JSON.stringify({ project }), { headers, status: 200 })
    }

    // This API gets a user's data by their id or username
    else if (url.pathname === "/api/get-user" && request.method === "POST") {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }

      // Check if a valid userId or username is provided in the request and return an error code if there isn't
      if (!parseInt(body.userId, 10) && !body.username) {
        return new Response("User requested does not exist", { status: 400 })
      }

      // If a username is provided, return the requested user's id
      if (body.username) {
        // Search for the user in the Users table
        const findUser = await Users.findOne({
          attributes: ["id"],
          where: { username: body.username }
        })

        // If the username couldn't be found then return 400 Bad Request
        if (!findUser) {
          return new Response(
            "User requested does not exist or could not be found",
            { status: 400 }
          )
        }

        // If the username could be find then return the id number to the client
        return new Response(
          JSON.stringify({
            id: findUser.id
          }),
          { headers, status: 200 }
        )
      }

      // If the request instead provides an id number then get the user's details
      const findUser = await Users.findOne({
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

      // If the user couldn't be found the return 400 Bad Request to the client
      if (!findUser) {
        return new Response(
          "User requested does not exist or could not be found",
          { status: 400 }
        )
      }

      // If it was found then return the requested user's details
      return new Response(JSON.stringify({ findUser }), {
        headers,
        status: 200
      })
    }

    // This API allows users to register to Planit
    else if (url.pathname === "/api/register" && request.method === "POST") {
      // Validate that the user provided all the right details
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

      // Validate the user's email against a regex to check if it's in the right format
      if (
        !body.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ) {
        return new Response("Email is invalid", { status: 400 })
      }

      // Check if a user has already taken that username
      if (
        await Users.findOne({
          where: {
            username: body.username
          }
        })
      ) {
        return new Response("Username is taken", { status: 400 })
      }

      // Check if a user has already taken that email address
      if (
        await Users.findOne({
          where: {
            email: body.email
          }
        })
      ) {
        return new Response("Email is taken", { status: 400 })
      }

      // If all the validation checks pass then create the user with the provided email and username,
      // and password hash and salt regenerated from the password provided, and an emailToken which
      // will be sent to the user's email address for verification
      const user = await Users.create({
        email: body.email,
        emailToken: cryptoRandomString({
          length: 128
        }),
        password: await argon2.hash(body.password),
        username: body.username
      })

      // Parse the sender name, email to send the message too, the subject of the email, and the body to the
      // emailLibrary to be sent asynchronously which avoids slowing down the backend while the email is being sent
      emailLibrary
        .sendEmail(
          "support@electrics01.com",
          body.email,
          `Hi ${user.username}, Verify your email address`,
          `Hi ${user.username},\n\nThank You for signing up to Planit\n\nPlease click the link below to verify your email address:\nhttps://planit.electrics01.com/verify?token=${user.emailToken}\n\nIf you did not request this email, please ignore it.\n\nThanks,\n\nElectrics01 Support Team`
        )

        // Log any errors that arise when attempting to send emails
        .catch((e) => {
          console.log("Error occurred while sending email:", e)
        })

      // Create a session for this new user, sessions are used to validate a user's permission to use the account
      // without storing their password anywehere
      const session = await Sessions.create({
        expiredAt: Date.now() + 15552000000,
        token: cryptoRandomString({ length: 128 }),
        userAgent: request.headers.get("User-Agent"),
        userId: user.id
      })

      // Return the new user's details and their token to the client
      return new Response(
        JSON.stringify({
          token: session.token,
          ...user.toJSON(),
          emailToken: undefined,
          password: undefined
        }),
        { headers, status: 200 }
      )
    }

    // This API is for email verification, it takes one property in the JSON body and updates the user's verification status
    else if (url.pathname === "/api/verify" && request.method === "POST") {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }

      // Validate that the user has provided a token and that they aren't already verified
      if (!user.emailToken || user.emailVerified) {
        return new Response("Account is already verified", { status: 400 })
      }

      // Validate the email token provided by the client with the token stored in the database
      if (user.emailToken !== body.token) {
        return new Response("Token invalid", { status: 401 })
      }

      // If the validation passes, update the users emailToken in the database
      await user.update({
        emailToken: false,
        emailVerified: true
      })

      // Return 204 No Content
      return new Response("", { status: 204 })
    }

    // This API is for signing in
    else if (url.pathname === "/api/login" && request.method === "POST") {
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
          token: session.token,
          ...user.toJSON(),
          emailToken: undefined,
          password: undefined,
          projects,
          notifications
        }),
        { headers, status: 200 }
      )
    } else if (
      url.pathname === "/api/create-project" &&
      request.method === "POST"
    ) {
      // Authenticate the user
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
      body.users.map(async (user: Permissions) => {
        const checkUser = await Users.findOne({
          where: {
            id: user.userId
          }
        })
        if (checkUser) {
          await Permissions.create({
            projectId: newProject.id,
            userId: user.userId,
            type: user.type
          })
          await Notifications.create({
            otherId: newProject.id,
            type: 1,
            userId: user.userId
          })
        }
      })
      return new Response(JSON.stringify({ project: newProject }), {
        status: 200
      })
    } else if (
      url.pathname === "/api/create-task" &&
      request.method === "POST"
    ) {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }
      if (!body.id) {
        return new Response("projectId is required", { status: 400 })
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
      if (body.start && dayjs(body.start).isValid()) {
        body.start = dayjs(body.start).toISOString()
      } else {
        body.start = Date.now()
      }
      if (body.end && dayjs(body.end).isValid()) {
        body.end = dayjs(body.end).toISOString()
      } else {
        body.end = null
      }
      if (!body.name) {
        body.name = "New Task"
      }
      if (!body.description) {
        body.description = "A New Planit Task"
      }
      const newTask = await Tasks.create({
        projectId: body.id,
        description: body.description,
        icon: body.icon,
        name: body.name,
        startAt: body.start,
        dueAt: body.end
      })
      return new Response(JSON.stringify({ task: newTask }), {
        status: 200
      })
    } else if (url.pathname === "/api/history" && request.method === "POST") {
      // Authenticate the user
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
      return new Response("", { status: 204 })
    } else if (
      url.pathname === "/api/delete-project" &&
      request.method === "POST"
    ) {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }
      if (!body.id) {
        return new Response("Invalid Project ID", { status: 400 })
      }
      if (
        !body.password ||
        !(await argon2.verify(user.password, body.password))
      ) {
        return new Response("Password is required to confirm deletion", {
          status: 400
        })
      }
      const deleteProject = await Projects.findByPk(body.id, {
        attributes: ["owner"]
      })
      if (!deleteProject || deleteProject.owner !== user.id) {
        return new Response("Invalid Project ID", { status: 400 })
      }
      await Projects.destroy({
        where: { id: body.id }
      })
      await Permissions.destroy({
        where: { projectId: body.id }
      })
      return new Response("", { status: 204 })
    } else if (
      url.pathname === "/api/edit-project" &&
      request.method === "PATCH"
    ) {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }
      if (!body.id) {
        return new Response("Invalid Project ID", { status: 400 })
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
      const permission = await Permissions.findOne({
        where: { userId: user.id, projectId: body.id }
      })
      if (!permission || permission.type !== 0) {
        return new Response("You do not have permission to edit this project", {
          status: 400
        })
      }
      const editedProject = await Projects.findByPk(body.id, {
        attributes: ["id", "name", "description", "icon", "owner", "latest"],
        include: [
          {
            attributes: ["userId", "type"],
            model: Permissions,
            include: [
              {
                attributes: ["username", "avatar"],
                model: Users
              }
            ]
          },
          {
            attributes: ["id", "username", "avatar"],
            model: Users
          }
        ]
      })
      if (!editedProject) {
        return new Response("Invalid Project ID", { status: 400 })
      }
      await editedProject.update(
        {
          description: body.description,
          icon: body.icon,
          latest: Date.now(),
          name: body.name,
          owner: user.id
        },
        {
          where: { id: body.id }
        }
      )

      // Get the current permissions of the project
      const currentPermissions = editedProject.permissions.map((p) => ({
        userId: p.userId,
        type: p.type
      }))

      // Get the list of user IDs from body.users
      const userIds = body.users.map((u: Permissions) => u.userId)

      // Find permissions to delete
      const permissionsToDelete = currentPermissions
        .filter((p) => !userIds.includes(p.userId))
        .map((p) => p.userId)

      // Delete the permissions that are not in body.users
      await Permissions.destroy({
        where: {
          userId: permissionsToDelete,
          projectId: body.id
        }
      })

      // Remove deleted permissions from editedProject
      editedProject.permissions = editedProject.permissions.filter(
        (p: Permissions) => userIds.includes(p.userId)
      )

      // Add, update, or modify permissions
      for (const user of body.users) {
        const existingPermission = await Permissions.findOne({
          where: {
            userId: user.userId,
            projectId: body.id
          }
        })

        if (!existingPermission) {
          const newPermission = await Permissions.create({
            projectId: body.id,
            userId: user.userId,
            type: user.type
          })
          editedProject.permissions.push(newPermission)
          await Notifications.create({
            otherId: body.id,
            type: 1,
            userId: user.userId
          })
        } else if (existingPermission.type !== user.type) {
          await existingPermission.update({ type: user.type })
        }
      }

      const project = await Projects.findByPk(body.id, {
        attributes: ["id", "name", "description", "icon", "owner", "latest"],
        include: [
          {
            attributes: ["userId", "type"],
            model: Permissions,
            include: [
              {
                attributes: ["username", "avatar"],
                model: Users
              }
            ]
          },
          {
            attributes: ["id", "username", "avatar"],
            model: Users
          }
        ]
      })
      return new Response(JSON.stringify({ project: project }), {
        status: 200
      })
    } else {
      return new Response("Not Found", { status: 404 })
    }
  },
  error(error) {
    console.log(`${error}\n${error.stack}`)
    return new Response(error.message, {
      headers: {
        "Content-Type": "text/html"
      },
      status: 400
    })
  }
})

console.log("Server is running on http://localhost:3100")
