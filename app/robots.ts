import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/auth/", "/account/", "/checkout/", "/cart/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/auth/", "/account/", "/checkout/", "/cart/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/auth/", "/account/", "/checkout/", "/cart/"],
      },
    ],
    sitemap: "https://vchuki.com/sitemap.xml",
    host: "https://vchuki.com",
  }
}
