import Sessions from "../models/sessions"
import Users from "../models/users"

export default async function auth(req: Request) {
  const token = req.headers.get("Authorization")
  if (!token)
    return new Response(
      JSON.stringify({ message: "Access denied. No token provided." }),
      {
        headers: { "Content-Type": "application/json" },
        status: 401
      }
    )
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
  return session.user
}
