"use client"

import Link from "next/link"
import { ShoppingCart, User, Heart, LayoutDashboard, Package, LogIn, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useUIStore } from "@/store/uiStore"
import { useCartStore } from "@/store/cartStore"
import { useSession } from "next-auth/react"
import { useState, useRef, useEffect } from "react"

import Image from "next/image"

export default function Navbar() {
  const { toggleCart } = useUIStore()
  const items = useCartStore((s) => s.items)
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isAdmin = session?.user?.role === "admin"

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md">
      <div className="container flex h-14 md:h-16 items-center justify-between">
        {/* Mobile menu button */}
        <button className="md:hidden p-2 -ml-2" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" className="flex items-center gap-1.5">
          <Image src="/logo-mark.svg" alt="VCHUKI" width={28} height={28} className="dark:invert" />
          <span className="text-lg md:text-xl font-bold tracking-[0.15em] hidden sm:inline">VCHUKI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/shirts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shop All</Link>
          <Link href="/shirts/formal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Formal</Link>
          <Link href="/shirts/casual" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Casual</Link>
          <Link href="/shirts/linen" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Linen</Link>
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          {session && (
            <Link href="/account/wishlist" className="hidden md:block">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" onClick={toggleCart}>
            <ShoppingCart className="h-5 w-5" />
            {items.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                {items.length}
              </span>
            )}
          </Button>

          {session ? (
            <div className="relative" ref={menuRef}>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setShowUserMenu(!showUserMenu)}>
                <User className="h-5 w-5" />
              </Button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-popover shadow-lg py-1 z-50">
                  <div className="px-4 py-2.5 border-b">
                    <p className="text-sm font-medium truncate">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                    {isAdmin && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded mt-1 inline-block">Admin</span>}
                  </div>
                  {isAdmin && (
                    <div className="py-1 border-b">
                      <Link href="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors">
                        <LayoutDashboard className="h-4 w-4 text-primary" /> Admin Panel
                      </Link>
                    </div>
                  )}
                  <div className="py-1">
                    <Link href="/account" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors">
                      <User className="h-4 w-4" /> My Account
                    </Link>
                    <Link href="/account/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors">
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                  </div>
                  <div className="border-t pt-1">
                    <Link href="/api/auth/signout" className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors">
                      <LogIn className="h-4 w-4" /> Sign Out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" variant="default" className="text-xs h-8 px-3">Sign In</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t bg-background px-4 py-3 space-y-1">
          <Link href="/shirts" onClick={() => setShowMobileMenu(false)} className="block py-2.5 text-sm font-medium">Shop All</Link>
          <Link href="/shirts/formal" onClick={() => setShowMobileMenu(false)} className="block py-2.5 text-sm text-muted-foreground">Formal</Link>
          <Link href="/shirts/casual" onClick={() => setShowMobileMenu(false)} className="block py-2.5 text-sm text-muted-foreground">Casual</Link>
          <Link href="/shirts/linen" onClick={() => setShowMobileMenu(false)} className="block py-2.5 text-sm text-muted-foreground">Linen</Link>
          <Link href="/blog" onClick={() => setShowMobileMenu(false)} className="block py-2.5 text-sm text-muted-foreground">Blog</Link>
          {isAdmin && (
            <Link href="/admin" onClick={() => setShowMobileMenu(false)} className="block py-2.5 text-sm text-primary font-medium">Admin Panel</Link>
          )}
        </div>
      )}
    </nav>
  )
}
