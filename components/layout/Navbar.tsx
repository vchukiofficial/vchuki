"use client"

import Link from "next/link"
import { Search, ShoppingCart, User, Heart, LayoutDashboard, Package, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/store/uiStore"
import { useCartStore } from "@/store/cartStore"
import { useSession } from "next-auth/react"
import { useState, useRef, useEffect } from "react"

export default function Navbar() {
  const { toggleCart } = useUIStore()
  const items = useCartStore((s) => s.items)
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isAdmin = session?.user?.role === "admin"

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gradient tracking-wider">
          VCHUKI
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Shop
          </Link>
          <Link href="/products?category=formal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Formal
          </Link>
          <Link href="/products?category=casual" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Casual
          </Link>
          <Link href="/products?category=ethnic" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Ethnic
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Search className="h-5 w-5" />
          </Button>

          {session && (
            <Link href="/account/wishlist">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" onClick={toggleCart}>
            <ShoppingCart className="h-5 w-5" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                {items.length}
              </span>
            )}
          </Button>

          {session ? (
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <User className="h-5 w-5" />
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border/50 bg-card shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-border/50">
                    <p className="text-sm font-medium truncate">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                    {isAdmin && (
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded mt-1 inline-block">Admin</span>
                    )}
                  </div>

                  {/* Admin Menu */}
                  {isAdmin && (
                    <div className="py-1 border-b border-border/50">
                      <p className="px-4 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">Admin Panel</p>
                      <Link href="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                        <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard
                      </Link>
                      <Link href="/admin/products" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                        <Package className="h-4 w-4 text-primary" /> Manage Products
                      </Link>
                      <Link href="/admin/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                        <ShoppingCart className="h-4 w-4 text-primary" /> Manage Orders
                      </Link>
                      <Link href="/admin/users" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                        <User className="h-4 w-4 text-primary" /> Manage Users
                      </Link>
                    </div>
                  )}

                  {/* User Menu */}
                  <div className="py-1">
                    <p className="px-4 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">My Account</p>
                    <Link href="/account" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link href="/account/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                    <Link href="/account/wishlist" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                      <Heart className="h-4 w-4" /> Wishlist
                    </Link>
                    <Link href="/account/addresses" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                      <Package className="h-4 w-4" /> Addresses
                    </Link>
                  </div>

                  <div className="border-t border-border/50 pt-1">
                    <Link href="/api/auth/signout" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-secondary transition-colors">
                      <LogIn className="h-4 w-4" /> Sign Out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1">
                <LogIn className="h-4 w-4" /> Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
