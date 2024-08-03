// Import models for use with sequelize
import Sessions from "../models/sessions"
import Users from "../models/users"

/*
 * This library authenticates HTTP requests sent from the client using a HTTP header called "Authorization"
 * which stores a session token. Session tokens allow the server to authenticate users without storing
 * their passwords anywhere
 */

// Export the function for use in the index.ts
export default async function auth(req: Request) {
  // Check if there was a token sent in the http request
  const token = req.headers.get("Authorization")
  if (!token)
    return new Response(
      JSON.stringify({ message: "Access denied. No token provided." }),
      {
        headers: { "Content-Type": "application/json" },
        status: 401
      }
    )
  // Use the sent token to see if it matches an existing session
  const session = await Sessions.findOne({
    include: [
      {
        as: "user",
        model: Users
      }
    ],
    where: { token }
  })
  if (!session || !session.user) {
    return new Response(
      JSON.stringify({ message: "Access denied. No token provided." }),
      {
        headers: { "Content-Type": "application/json" },
        status: 401
      }
    )
  }
  // Return the session for use in the index.ts
  return session.user
}
