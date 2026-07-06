"use client"

import { usePathname } from "next/navigation"
import { WelcomePopup } from "@/components/marketing/WelcomePopup"

interface Props {
  navbar: React.ReactNode
  footer: React.ReactNode
  cartDrawer: React.ReactNode
  mobileNav: React.ReactNode
  children: React.ReactNode
}

export function ShopLayoutWrapper({ navbar, footer, cartDrawer, mobileNav, children }: Props) {
  const pathname = usePathname()

  // /vip is a standalone landing page without the usual site chrome
  const showChrome = pathname !== "/vip"

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
      <WelcomePopup />
    </>
  )
}
