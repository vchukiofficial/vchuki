"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

function getSessionId() {
  if (typeof window === "undefined") return ""
  let sid = sessionStorage.getItem("vchuki_sid")
  if (!sid) {
    sid = Math.random().toString(36).substring(2) + Date.now().toString(36)
    sessionStorage.setItem("vchuki_sid", sid)
  }
  return sid
}

export function PageTracker() {
  const pathname = usePathname()
  const startTime = useRef(Date.now())
  const lastPath = useRef("")

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return

    // Send duration for previous page
    if (lastPath.current && lastPath.current !== pathname) {
      const duration = Math.round((Date.now() - startTime.current) / 1000)
      if (duration > 0 && duration < 1800) {
        navigator.sendBeacon("/api/analytics", JSON.stringify({
          path: lastPath.current,
          referrer: "",
          sessionId: getSessionId(),
          duration,
        }))
      }
    }

    // Record new page view
    startTime.current = Date.now()
    lastPath.current = pathname

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || "",
        sessionId: getSessionId(),
        duration: 0,
      }),
    }).catch(() => {}) // Silent fail

    // Track duration on page unload
    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000)
      if (duration > 0 && duration < 1800) {
        navigator.sendBeacon("/api/analytics", JSON.stringify({
          path: pathname,
          referrer: "",
          sessionId: getSessionId(),
          duration,
        }))
      }
    }

    window.addEventListener("beforeunload", handleUnload)
    return () => window.removeEventListener("beforeunload", handleUnload)
  }, [pathname])

  return null
}
