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
import ResourceAssociations from "./models/resourceAssociations"

// Define reused variables
sequelize
const emailLibrary = new nodemailerLibrary()

const headers = {
  "Content-Type": "application/json"
}

/*
 * index.ts is the core file of Planit's backend, all libraries from other files are imported here and called,
 * all of Planit's APIs are also located here using Bun's serve function
 */

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
      const project = await Projects.findByPk(url.pathname.split("/")[3], {
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
              "type",
              "startAt",
              "dueAt"
            ],
            model: Tasks,
            include: [
              {
                attributes: ["id", "resourceId"],
                model: ResourceAssociations
              }
            ]
          },
          {
            attributes: ["id", "username", "avatar"],
            model: Users
          }
        ]
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

      // If all the validation checks pass then create the user with the provided email, username,
      // and password hash and salt regenerated from the password provided using Argon2's industry
      // trusted hashing and salting algorithms, and also an emailToken which will be sent to the user's
      // email address for verification
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

    // This API is for signing in, it uses the user's username and password to valid the user and create a session token to be
    // stored in their browser
    else if (url.pathname === "/api/login" && request.method === "POST") {
      // Check that the user provided both a username and password
      if (
        !body.username ||
        !body.password ||
        body.username.length < 1 ||
        body.password.length < 1
      ) {
        return new Response("Form not complete", { status: 400 })
      }

      // Check that the username exists
      const user = await Users.findOne({
        where: {
          username: body.username
        }
      })
      if (!user) {
        return new Response("User not found", { status: 400 })
      }

      // Verify the user's password using Argon2 which is an industry trusted password hashing and salting library
      if (!(await argon2.verify(user.password, body.password))) {
        return new Response("Incorrect password", { status: 401 })
      }

      // If the user's username and password are correct then generate a session token for them to securely save in
      // their browser, session tokens allow the user to stay authenticated so they do not need to login again whenever
      // they try to access Planit
      const session = await Sessions.create({
        expiredAt: Date.now() + 15552000000,
        token: cryptoRandomString({ length: 128 }),
        userAgent: request.headers.get("User-Agent"),
        userId: user.id
      })

      // Get the user's details for them, these are the same details that a user would get in the UserData API
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

      // Return the user's session token and UserData to the client
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
    }

    // This API is for creating projects, it takes a name, description, icon URL, and list of
    // user permissions, non of these properties are required for the project to be created
    else if (
      url.pathname === "/api/create-project" &&
      request.method === "POST"
    ) {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }

      // Validate that the icon is a valid URL
      if (body.icon && !body.icon.match(/(https?:\/\/\S+)/g)) {
        return new Response("Icon is not a valid URL", { status: 400 })
      }

      // Validate the length of the project's name
      if (body.name?.length > 30) {
        return new Response("Project name too long", { status: 400 })
      }

      // Validate the length of the project's description
      if (body.description?.length > 500) {
        return new Response("Project description too long", { status: 400 })
      }

      // If the project doesn't have a provided name then set it to "New Project"
      if (!body.name) {
        body.name = "New Project"
      }

      // If the project doesn't have a provided description then set it to "A New Planit Project"
      if (!body.description) {
        body.description = "A New Planit Project"
      }

      // Create the project using Sequelize
      const newProject = await Projects.create({
        description: body.description,
        icon: body.icon,
        latest: Date.now(),
        name: body.name,
        owner: user.id
      })

      // Create a Permission for the owner of the project, type 0 means they are an owner
      await Permissions.create({
        projectId: newProject.id,
        type: 0,
        userId: newProject.owner
      })

      // "map" is a form of for loop in JavaScript that allows you to easily iterate over an array,
      // this use of map iterates over the array of permissions sent from the client

      body.users.map(async (user: Permissions) => {
        // Check that the user exists
        const checkUser = await Users.findOne({
          where: {
            id: user.userId
          }
        })

        // If the user exists then create a permission in the Database for them and send them a notification
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
      // Return the new project to the client
      return new Response(JSON.stringify({ project: newProject }), {
        status: 200
      })
    }

    // This API is very similar in layout to the other create APIs, it validates the task's details and then creates it
    else if (url.pathname === "/api/create-task" && request.method === "POST") {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }

      // Existance testing on the projectId of the new task
      if (!body.id) {
        return new Response("projectId is required", { status: 400 })
      }

      // Validate that the icon is a valid URL
      if (body.icon && !body.icon.match(/(https?:\/\/\S+)/g)) {
        return new Response("Icon is not a valid URL", { status: 400 })
      }

      // Validate that the name is not too long
      if (body.name?.length > 30) {
        return new Response("Task name too long", { status: 400 })
      }

      // Validate that the description is not too long
      if (body.description?.length > 500) {
        return new Response("Task description too long", { status: 400 })
      }

      // Check that the date provided is valid using the dayjs "isValid" function, if there is
      // no date or if it is not valid then set the start date of the class to right now
      if (body.start && dayjs(body.start).isValid()) {
        body.start = dayjs(body.start).toISOString()
      } else {
        body.start = Date.now()
      }

      // Check that the date provided is valid using the dayjs "isValid" function,
      // if it is not then discard it
      if (body.end && dayjs(body.end).isValid()) {
        body.end = dayjs(body.end).toISOString()
      } else {
        body.end = null
      }

      // If the task doesn't have a provided name then set it to "New Task"
      if (!body.name) {
        body.name = "New Task"
      }

      // If the task doesn't have a provided description then set it to "A New Planit Task"
      if (!body.description) {
        body.description = "A New Planit Task"
      }

      // Create the new task with the provided details
      const newTask = await Tasks.create({
        projectId: body.id,
        description: body.description,
        icon: body.icon,
        name: body.name,
        startAt: body.start,
        dueAt: body.end
      })

      // Send the new task back to the client
      return new Response(JSON.stringify({ task: newTask }), {
        status: 200
      })
    }

    // Add items to the user's QuickSwitcher
    else if (url.pathname === "/api/history" && request.method === "POST") {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }

      // Validate that there are history items
      if (body.history.length < 1) {
        return new Response("History has no content", { status: 400 })
      }

      //Validate that there arn't too many history items
      if (body.history.length > 50) {
        return new Response("History too long", { status: 400 })
      }

      // Update the user's history
      await user.update({ switcherHistory: body.history })

      // Return 204 No Content to say that nothing should be sent back
      return new Response("", { status: 204 })
    }

    // This API is very similar in layout to the other create APIs, it validates the resource's details and then creates it
    else if (
      url.pathname === "/api/create-resource" &&
      request.method === "POST"
    ) {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }

      // Existance testing on the projectId of the new resource
      if (!body.id) {
        return new Response("projectId is required", { status: 400 })
      }

      // Validate that the icon is a valid URL
      if (body.icon && !body.icon.match(/(https?:\/\/\S+)/g)) {
        return new Response("Icon is not a valid URL", { status: 400 })
      }

      // Validate that the name is not too long
      if (body.name?.length > 30) {
        return new Response("Resource name too long", { status: 400 })
      }

      // Validate that the description is not too long
      if (body.description?.length > 500) {
        return new Response("Resource description too long", { status: 400 })
      }

      // If the resource doesn't have a provided name then set it to "New Resource"
      if (!body.name) {
        body.name = "New Resource"
      }

      // If the resource doesn't have a provided description then set it to "A New Planit Resource"
      if (!body.description) {
        body.description = "A New Planit Resource"
      }

      // Create the new resource with the provided details
      const newResource = await Resources.create({
        projectId: body.id,
        description: body.description,
        icon: body.icon,
        name: body.name
      })

      // Send the new resource back to the client
      return new Response(JSON.stringify({ resource: newResource }), {
        status: 200
      })
    }

    // This API is very similar in layout to the create APIs but instead it validates
    // the projectId, taskId, and resourceId creates a ResourceAssociation
    else if (
      url.pathname === "/api/add-resource" &&
      request.method === "POST"
    ) {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }

      // Existance testing on the projectId of the new resource
      if (!body.id) {
        return new Response("projectId is required", { status: 400 })
      }

      // Existance testing on the resourceId of the new resource
      if (!body.resourceId) {
        return new Response("resourceId is required", { status: 400 })
      }

      // Existance testing on the taskId of the new resource
      if (!body.taskId) {
        return new Response("taskId is required", { status: 400 })
      }

      // Check the user's permission to add the task, only project owners and editors can add them
      const permission = await Permissions.findOne({
        where: { userId: user.id, projectId: body.id }
      })
      if (!permission || permission.type === 2) {
        return new Response("You do not have permission to add this resource", {
          status: 400
        })
      }

      // If the resource isn't part of that project or doesn't exist then return 400 Bad Request
      const resource = await Resources.findByPk(body.resourceId)

      if (!resource || resource.projectId !== body.id) {
        return new Response("Resource not found", { status: 400 })
      }

      // If the resource is already assiciated to the task then return 400 Bad Request to the client
      const existing = await ResourceAssociations.findOne({
        where: { taskId: body.taskId, resourceId: body.resourceId }
      })

      if (existing) {
        return new Response("Resource already assigned", { status: 400 })
      }

      // Create the new resource with the provided details
      const association = await ResourceAssociations.create({
        taskId: body.taskId,
        resourceId: body.resourceId
      })

      // Send the new resource back to the client
      return new Response(
        JSON.stringify({
          association: {
            id: association.id,
            resourceId: association.resourceId
          }
        }),
        {
          status: 200
        }
      )
    }

    // This API is very similar in layout to the create APIs and the add resource API but instead
    // it validates the projectId and associationId then deletes a ResourceAssociation
    else if (
      url.pathname === "/api/remove-resource" &&
      request.method === "POST"
    ) {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }

      // Existance testing on the projectId of the new resource
      if (!body.id) {
        return new Response("associationId is required", { status: 400 })
      }

      // Existance testing on the resourceId of the new resource
      if (!body.resourceId) {
        return new Response("resourceId is required", { status: 400 })
      }

      // Existance testing on the associationId of the new resource
      if (!body.associationId) {
        return new Response("associationId is required", { status: 400 })
      }

      // Check the user's permission to remove the task, only project owners and editors can remove them
      const permission = await Permissions.findOne({
        where: { userId: user.id, projectId: body.id }
      })
      if (!permission || permission.type === 2) {
        return new Response(
          "You do not have permission to remove this resource",
          {
            status: 400
          }
        )
      }

      // If the resource isn't part of that project or doesn't exist then return 400 Bad Request
      const resource = await Resources.findByPk(body.resourceId)

      if (!resource || resource.projectId !== body.id) {
        return new Response("Resource not found", { status: 400 })
      }

      console.log(body.associationId)
      console.log(body.resourceId)

      // If the resource isn't assiciated to the resource then return 400 Bad Request to the client
      const association = await ResourceAssociations.findOne({
        where: { id: body.associationId, resourceId: body.resourceId }
      })

      if (!association) {
        return new Response("Resource is not assigned", { status: 400 })
      }

      // Delete the ResourceAssociation
      association.destroy()

      // Send the 204 No Content to confirm that the ResourceAssociation was deleted
      return new Response("", { status: 204 })
    }

    // Add items to the user's QuickSwitcher
    else if (url.pathname === "/api/history" && request.method === "POST") {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }

      // Validate that there are history items
      if (body.history.length < 1) {
        return new Response("History has no content", { status: 400 })
      }

      //Validate that there arn't too many history items
      if (body.history.length > 50) {
        return new Response("History too long", { status: 400 })
      }

      // Update the user's history
      await user.update({ switcherHistory: body.history })

      // Return 204 No Content to say that nothing should be sent back
      return new Response("", { status: 204 })
    }

    // Delete a project if the user provides password permission, this can only be done by project owners
    else if (
      url.pathname === "/api/delete-project" &&
      request.method === "POST"
    ) {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }

      // Check if a ProjectID is provided
      if (!body.id) {
        return new Response("Invalid Project ID", { status: 400 })
      }

      // Check if the user has provided a valid password
      if (
        !body.password ||
        !(await argon2.verify(user.password, body.password))
      ) {
        return new Response("Password is required to confirm deletion", {
          status: 400
        })
      }

      // Check if the project exists and that the user owns it
      const deleteProject = await Projects.findByPk(body.id, {
        attributes: ["owner"]
      })
      if (!deleteProject || deleteProject.owner !== user.id) {
        return new Response("Invalid Project ID", { status: 400 })
      }

      // Delete the project and all permissions to that project
      await Projects.destroy({
        where: { id: body.id }
      })
      await Permissions.destroy({
        where: { projectId: body.id }
      })

      // Return 204 No Content
      return new Response("", { status: 204 })
    }

    // This API is for editing projects
    else if (
      url.pathname === "/api/edit-project" &&
      request.method === "PATCH"
    ) {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }

      // Check if a ProjectID is provided
      if (!body.id) {
        return new Response("Invalid Project ID", { status: 400 })
      }

      // Validate that the icon is a valid URL
      if (body.icon && !body.icon.match(/(https?:\/\/\S+)/g)) {
        return new Response("Icon is not a valid URL", { status: 400 })
      }

      // Validate that the name is not too long
      if (body.name?.length > 30) {
        return new Response("Project name too long", { status: 400 })
      }

      // Validate that the description is not too long
      if (body.description?.length > 500) {
        return new Response("Project description too long", { status: 400 })
      }

      // If the project doesn't have a provided name then set it to "New Project"
      if (!body.name) {
        body.name = "New Project"
      }

      // If the project doesn't have a provided description then set it to "A New Planit Project"
      if (!body.description) {
        body.description = "A New Planit Project"
      }

      // Check the user's permission to edit this project, only project owners can edit the details of a project
      const permission = await Permissions.findOne({
        where: { userId: user.id, projectId: body.id }
      })
      if (!permission || permission.type !== 0) {
        return new Response("You do not have permission to edit this project", {
          status: 400
        })
      }

      // Get the project's current details to find which permissions need to be modified and validate that the project exists
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
          }
        ]
      })
      if (!editedProject) {
        return new Response("Invalid Project ID", { status: 400 })
      }

      // Update the project's details with the newly provided ones
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

      // Get the project's details again to send it back to the client
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
              "type",
              "startAt",
              "dueAt"
            ],
            model: Tasks
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
    }

    // This API is for editing tasks
    else if (url.pathname === "/api/edit-task" && request.method === "PATCH") {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }

      // Existance testing on the projectId of the task
      if (!body.id || !body.projectId) {
        return new Response("The ProjectID and TaskID is required", {
          status: 400
        })
      }

      // Validate that the icon is a valid URL
      if (body.icon && !body.icon.match(/(https?:\/\/\S+)/g)) {
        return new Response("Icon is not a valid URL", { status: 400 })
      }

      // Validate that the name is not too long
      if (body.name?.length > 30) {
        return new Response("Task name too long", { status: 400 })
      }

      // Validate that the description is not too long
      if (body.description?.length > 500) {
        return new Response("Task description too long", { status: 400 })
      }

      // Check that the date provided is valid using the dayjs "isValid" function, if there is
      // no date or if it is not valid then set the start date of the class to right now
      if (body.start && dayjs(body.start).isValid()) {
        body.start = dayjs(body.start).toISOString()
      } else {
        body.start = Date.now()
      }

      // Check that the date provided is valid using the dayjs "isValid" function,
      // if it is not then discard it
      if (body.end && dayjs(body.end).isValid()) {
        body.end = dayjs(body.end).toISOString()
      } else {
        body.end = null
      }

      // If the task doesn't have a provided name then set it to "New Task"
      if (!body.name) {
        body.name = "New Task"
      }

      // If the task doesn't have a provided description then set it to "A New Planit Task"
      if (!body.description) {
        body.description = "A New Planit Task"
      }

      // Check the user's permission to edit this task, project owners and editors can edit the details of tasks
      const permission = await Permissions.findOne({
        where: { userId: user.id, projectId: body.projectId }
      })
      if (!permission || permission.type === 2) {
        return new Response("You do not have permission to edit this task", {
          status: 400
        })
      }

      // Get the tasks's current details to find which permissions need to be modified and validate that the task exists
      const editedTask = await Tasks.findByPk(body.id, {
        attributes: [
          "id",
          "name",
          "description",
          "icon",
          "type",
          "startAt",
          "dueAt"
        ]
      })
      if (!editedTask) {
        return new Response("Invalid TaskID", { status: 400 })
      }

      // Update the task's details with the newly provided ones
      await editedTask.update(
        {
          description: body.description,
          icon: body.icon,
          name: body.name,
          type: body.type,
          startAt: body.start,
          dueAt: body.end
        },
        {
          where: { id: body.id }
        }
      )

      // Send the new details back to the client for confirmation
      return new Response(JSON.stringify({ task: editedTask }), {
        status: 200
      })
    }

    // This API is for editing resources
    else if (
      url.pathname === "/api/edit-resource" &&
      request.method === "PATCH"
    ) {
      // Authenticate the user
      const user = await auth(request)
      if (user instanceof Response) {
        return user
      }

      // Existance testing on the projectId of the resource
      if (!body.id || !body.projectId) {
        return new Response("The ProjectID and ResourceID is required", {
          status: 400
        })
      }

      // Validate that the icon is a valid URL
      if (body.icon && !body.icon.match(/(https?:\/\/\S+)/g)) {
        return new Response("Icon is not a valid URL", { status: 400 })
      }

      // Validate that the name is not too long
      if (body.name?.length > 30) {
        return new Response("Resource name too long", { status: 400 })
      }

      // Validate that the description is not too long
      if (body.description?.length > 500) {
        return new Response("Resource description too long", { status: 400 })
      }

      // If the resource doesn't have a provided name then set it to "New Resource"
      if (!body.name) {
        body.name = "New Resource"
      }

      // If the resource doesn't have a provided description then set it to "A New Planit Resource"
      if (!body.description) {
        body.description = "A New Planit Resource"
      }

      // Check the user's permission to edit this resource, project owners and editors can edit the details of resources
      const permission = await Permissions.findOne({
        where: { userId: user.id, projectId: body.projectId }
      })
      if (!permission || permission.type === 2) {
        return new Response(
          "You do not have permission to edit this resource",
          {
            status: 400
          }
        )
      }

      // Get the resource's current details to find which permissions need to be modified and validate that the resource exists
      const editedResource = await Resources.findByPk(body.id, {
        attributes: ["id", "name", "description", "icon"]
      })
      if (!editedResource) {
        return new Response("Invalid ResourceID", { status: 400 })
      }

      // Update the resources's details with the newly provided ones
      await editedResource.update(
        {
          description: body.description,
          icon: body.icon,
          name: body.name
        },
        {
          where: { id: body.id }
        }
      )

      // Send the new details back to the client for confirmation
      return new Response(JSON.stringify({ resource: editedResource }), {
        status: 200
      })
    }

    // If the route/API could not be found then send 404 Not Found to the
    // client, this will be displayed as an error banner in the client
    else {
      return new Response("Not Found", { status: 404 })
    }
  },

  // If the server encountered an error like a database issue or logic error,
  // then send back a short message to the client explaining what went wrong
  // and then log the full error to the console for debugging
  error(error) {
    console.log(`${error}\n${error.stack}`)
    return new Response(error.message, {
      headers,
      status: 500
    })
  }
})

// This logs when the server starts so you know it started successfully
console.log("Server is running on http://localhost:3100")
