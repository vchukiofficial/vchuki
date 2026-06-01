"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

const LAUNCH_DATE = new Date("2025-07-07T09:00:00+05:30")

interface Props {
  navbar: React.ReactNode
  footer: React.ReactNode
  cartDrawer: React.ReactNode
  mobileNav: React.ReactNode
  children: React.ReactNode
}

export function ShopLayoutWrapper({ navbar, footer, cartDrawer, mobileNav, children }: Props) {
  const [isLaunched, setIsLaunched] = useState(true) // default true to avoid flash
  const pathname = usePathname()

  useEffect(() => {
    setIsLaunched(new Date() >= LAUNCH_DATE)
  }, [])

  // Only hide chrome on the homepage pre-launch
  const isHomepage = pathname === "/"
  const showChrome = isLaunched || !isHomepage

  if (!showChrome) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <>
      {navbar}
      <main className="min-h-screen">{children}</main>
      {footer}
      {cartDrawer}
      {mobileNav}
    </>
  )
}
