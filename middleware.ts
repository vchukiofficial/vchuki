import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      if (req.nextUrl.pathname.startsWith("/admin")) {
        return token?.role === "admin"
      }
      if (req.nextUrl.pathname.startsWith("/account")) {
        return !!token
      }
      return true
    },
  },
})

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
}
