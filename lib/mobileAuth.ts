import jwt from "jsonwebtoken"
import { getServerSession } from "next-auth"
import type { NextRequest } from "next/server"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

/**
 * Auth for the VCHUKI mobile app.
 *
 * The website keeps using NextAuth cookies. The app can't hold those reliably, so it gets a
 * signed bearer token instead. `getRequestUser` accepts either, so one API serves both clients:
 * a request with no Authorization header behaves exactly as it did before.
 */

export interface RequestUser {
  id: string
  email: string
  name: string
  role: string
}

const TOKEN_TTL = "60d"

function secret(): string {
  const s = process.env.MOBILE_JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (!s) throw new Error("MOBILE_JWT_SECRET (or NEXTAUTH_SECRET) must be set")
  return s
}

export function signMobileToken(user: { _id: any; email: string }) {
  return jwt.sign({ sub: user._id.toString(), email: user.email, typ: "mobile" }, secret(), { expiresIn: TOKEN_TTL })
}

export async function userFromBearer(req: NextRequest | Request): Promise<RequestUser | null> {
  const header = req.headers.get("authorization") || ""
  if (!header.toLowerCase().startsWith("bearer ")) return null
  try {
    const payload = jwt.verify(header.slice(7).trim(), secret()) as jwt.JwtPayload
    if (payload.typ !== "mobile" || !payload.sub) return null
    await connectDB()
    // Role is read fresh from the DB on every request, same as the NextAuth jwt callback
    const user = (await User.findById(payload.sub).select("email name role").lean()) as any
    if (!user) return null
    return { id: user._id.toString(), email: user.email, name: user.name, role: user.role }
  } catch {
    return null
  }
}

/** The signed-in user from a mobile bearer token or the website session cookie, else null. */
export async function getRequestUser(req: NextRequest | Request): Promise<RequestUser | null> {
  const fromToken = await userFromBearer(req)
  if (fromToken) return fromToken
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return {
    id: (session.user as any).id,
    email: session.user.email || "",
    name: session.user.name || "",
    role: (session.user as any).role || "user",
  }
}

/** Shape of the user object returned to the app. Never includes the password hash. */
export function publicUser(user: any) {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    addresses: user.addresses || [],
    wishlist: (user.wishlist || []).map((w: any) => w.toString()),
  }
}

/**
 * Drop-in replacement for `getServerSession(authOptions)` in customer routes:
 * same `{ user: { id, email, name, role } }` shape, but also honours the app's bearer token.
 */
export async function sessionFor(req: NextRequest | Request): Promise<{ user: RequestUser } | null> {
  const user = await getRequestUser(req)
  return user ? { user } : null
}
